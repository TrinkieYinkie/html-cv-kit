"""Sequential, bounded owner for local checks. Python stdlib only.

Windows children start suspended, join a kill-on-close Job Object, then resume.
The Job Object also owns browser descendants, even if a stage parent exits first.
On POSIX, each stage owns a separate process group. Never match executable names.
Usage: python tools/lifecycle.py path/to/stages.json
"""
import ctypes
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import uuid

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / '.validation.lock'
active = None
job = None


def process_birth(pid):
    if os.name != 'nt':
        return None
    from ctypes import wintypes as w
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.OpenProcess.argtypes = [w.DWORD, w.BOOL, w.DWORD]
    kernel.OpenProcess.restype = w.HANDLE
    kernel.GetProcessTimes.argtypes = [w.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p]
    kernel.CloseHandle.argtypes = [w.HANDLE]
    handle = kernel.OpenProcess(0x1000, False, pid)
    if not handle:
        if ctypes.get_last_error() == 87: return None  # no such process
        raise ctypes.WinError(ctypes.get_last_error())
    values = [ctypes.c_uint64() for _ in range(4)]
    try:
        if not kernel.GetProcessTimes(handle, *(ctypes.byref(v) for v in values)):
            raise ctypes.WinError(ctypes.get_last_error())
        return values[0].value
    finally:
        kernel.CloseHandle(handle)


def windows_job():
    from ctypes import wintypes as w
    class BASIC(ctypes.Structure):
        _fields_ = [('ProcessTime', ctypes.c_int64), ('JobTime', ctypes.c_int64),
                    ('LimitFlags', w.DWORD), ('MinWorkingSet', ctypes.c_size_t),
                    ('MaxWorkingSet', ctypes.c_size_t), ('ActiveProcessLimit', w.DWORD),
                    ('Affinity', ctypes.c_size_t), ('PriorityClass', w.DWORD), ('SchedulingClass', w.DWORD)]
    class IO(ctypes.Structure):
        _fields_ = [(name, ctypes.c_uint64) for name in
                    ['ReadOps', 'WriteOps', 'OtherOps', 'ReadBytes', 'WriteBytes', 'OtherBytes']]
    class EXTENDED(ctypes.Structure):
        _fields_ = [('Basic', BASIC), ('IO', IO), ('ProcessMemory', ctypes.c_size_t),
                    ('JobMemory', ctypes.c_size_t), ('PeakProcessMemory', ctypes.c_size_t),
                    ('PeakJobMemory', ctypes.c_size_t)]
    k = ctypes.WinDLL('kernel32', use_last_error=True)
    k.CreateJobObjectW.argtypes = [ctypes.c_void_p, w.LPCWSTR]
    k.CreateJobObjectW.restype = w.HANDLE
    k.SetInformationJobObject.argtypes = [w.HANDLE, ctypes.c_int, ctypes.c_void_p, w.DWORD]
    k.AssignProcessToJobObject.argtypes = [w.HANDLE, w.HANDLE]
    k.TerminateJobObject.argtypes = [w.HANDLE, w.UINT]
    k.CloseHandle.argtypes = [w.HANDLE]
    handle = k.CreateJobObjectW(None, None)
    if not handle:
        raise ctypes.WinError(ctypes.get_last_error())
    limits = EXTENDED()
    limits.Basic.LimitFlags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    if not k.SetInformationJobObject(handle, 9, ctypes.byref(limits), ctypes.sizeof(limits)):
        k.CloseHandle(handle)
        raise ctypes.WinError(ctypes.get_last_error())
    return k, handle


def cleanup():
    global active, job
    if job:
        kernel, handle = job
        kernel.TerminateJobObject(handle, 1)
        kernel.CloseHandle(handle)
        job = None
    elif active and os.name != 'nt':
        try:
            os.killpg(active.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    if active:
        try:
            active.wait(timeout=10)
        except subprocess.TimeoutExpired:
            raise RuntimeError('Owned child did not exit after tree termination')
        active = None


def interrupted(signum, frame):
    raise KeyboardInterrupt(f'signal {signum}')


def main():
    global active, job
    token = uuid.uuid4().hex
    stages = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    lock_fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    owner = {'pid': os.getpid(), 'started': time.time(), 'birth': process_birth(os.getpid()), 'token': token}
    with os.fdopen(lock_fd, 'w') as lock:
        json.dump(owner, lock)
    report = {'owner': owner, 'stages': [], 'cleaned': False}
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, interrupted)
    if hasattr(signal, 'SIGBREAK'):
        signal.signal(signal.SIGBREAK, interrupted)
    try:
        for stage in stages:
            timeout = float(stage['timeout'])
            if not 0 < timeout <= 600:
                raise ValueError('Stage timeout must be between 0 and 600 seconds')
            command = stage['command']
            if not isinstance(command, list) or not command:
                raise ValueError('Each command must be an argv list, never a shell string')
            print(f"START {stage['name']} (limit {timeout:g}s)", flush=True)
            started = time.monotonic()
            environment = dict(os.environ, CV_TASK_TOKEN=token)
            log_dir = ROOT / '.qa'
            log_dir.mkdir(exist_ok=True)
            log_path = log_dir / f'stage-{token}.log'
            log_file = log_path.open('wb')
            output_position = 0
            def output():
                nonlocal output_position
                with log_path.open('rb') as stream:
                    stream.seek(output_position)
                    chunk = stream.read(2 * 1024 * 1024 + 1)
                    output_position += len(chunk)
                if output_position > 2 * 1024 * 1024:
                    raise RuntimeError('Stage output exceeded 2 MiB')
                if chunk:
                    print(chunk.decode('utf-8', errors='replace'), end='', flush=True)
            if os.name == 'nt':
                job = windows_job()
                active = subprocess.Popen(command, cwd=ROOT, env=environment,
                                          shell=False, creationflags=0x4 | 0x08000000,
                                          stdin=subprocess.DEVNULL, stdout=log_file, stderr=subprocess.STDOUT)
                kernel, handle = job
                if not kernel.AssignProcessToJobObject(handle, int(active._handle)):
                    active.kill()
                    raise ctypes.WinError(ctypes.get_last_error())
                nt = ctypes.WinDLL('ntdll')
                nt.NtResumeProcess.argtypes = [ctypes.c_void_p]
                if nt.NtResumeProcess(int(active._handle)) != 0:
                    raise RuntimeError('Could not resume owned stage')
            else:
                active = subprocess.Popen(command, cwd=ROOT, env=environment,
                                          shell=False, start_new_session=True,
                                          stdin=subprocess.DEVNULL, stdout=log_file, stderr=subprocess.STDOUT)
            entry = {'name': stage['name'], 'pid': active.pid, 'birth': process_birth(active.pid), 'command': command, 'started': time.time()}
            report['stages'].append(entry)
            heartbeat = started + 10
            try:
                while active.poll() is None:
                    output()
                    now = time.monotonic()
                    if now - started >= timeout:
                        raise TimeoutError(f"{stage['name']} exceeded {timeout:g}s")
                    if now >= heartbeat:
                        print(f"RUNNING {stage['name']} ({now-started:.0f}s)", flush=True)
                        heartbeat = now + 10
                    time.sleep(0.1)
                output()
                entry['exitCode'] = active.returncode
                if active.returncode:
                    raise RuntimeError(f"{stage['name']} exited {active.returncode}")
                print(f"PASS {stage['name']} ({time.monotonic()-started:.1f}s)", flush=True)
            finally:
                cleanup()
                log_file.close()
        report['passed'] = True
    finally:
        cleanup()
        build_lock = ROOT / '.cv-build.lock'
        if build_lock.exists():
            build_owner = json.loads(build_lock.read_text())
            if build_owner.get('taskToken') == token:
                for temporary in ROOT.rglob(f'*.cv-{build_owner["token"]}.tmp'):
                    temporary.unlink()
                build_lock.unlink()
        report['cleaned'] = True
        (ROOT / '.validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        if json.loads(LOCK.read_text())['token'] == token:
            LOCK.unlink()
        print('CLEAN: owned process trees terminated; validation lock removed', flush=True)


if __name__ == '__main__':
    try:
        main()
    except (Exception, KeyboardInterrupt) as error:
        print(f'FAILED: {error}', file=sys.stderr)
        sys.exit(1)

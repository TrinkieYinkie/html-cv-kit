"""Real process-tree failure tests; run only through tools/lifecycle.py."""
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from lifecycle import process_birth

if not os.environ.get('CV_TASK_TOKEN'):
    raise RuntimeError('Run process-tree tests under tools/lifecycle.py')
if os.name != 'nt':
    print('SKIP: exact Windows Job Object acceptance requires Windows')
    sys.exit(0)
qa = (ROOT / '.qa').resolve()
qa.mkdir(exist_ok=True)
fixture = Path(tempfile.mkdtemp(prefix='lifecycle-case-', dir=qa))
try:
    (fixture / 'tools').mkdir()
    shutil.copy2(ROOT / 'tools/lifecycle.py', fixture / 'tools/lifecycle.py')
    child = fixture / 'child.py'
    child.write_text('''import subprocess, sys, time, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'tools'))
from lifecycle import process_birth
p = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(60)'], shell=False,
                     stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
Path('descendant.json').write_text(json.dumps({'pid':p.pid,'birth':process_birth(p.pid)}))
if sys.argv[1] == 'timeout': time.sleep(60)
sys.exit(7 if sys.argv[1] == 'failure' else 0)
''', encoding='utf-8')
    owner = [sys.executable, str(fixture / 'tools/lifecycle.py'), str(fixture / 'stages.json')]
    for mode in ['success','failure','timeout']:
        config = [{'name':mode,'timeout':0.8 if mode=='timeout' else 10,'command':[sys.executable,str(child),mode]}]
        (fixture / 'stages.json').write_text(json.dumps(config),encoding='utf-8')
        result = subprocess.run(owner, cwd=fixture, shell=False, capture_output=True, text=True, timeout=20)
        assert result.returncode == (0 if mode=='success' else 1), result.stdout + result.stderr
        assert not (fixture / '.validation.lock').exists(), f'{mode}: lock leaked'
        identity = json.loads((fixture / 'descendant.json').read_text())
        deadline = time.monotonic()+3
        while process_birth(identity['pid']) == identity['birth'] and time.monotonic()<deadline:
            time.sleep(.05)
        assert process_birth(identity['pid']) != identity['birth'], f'{mode}: descendant survived'
        print(f'PASS {mode}: exact descendant stopped; lock removed')
    lock = fixture / '.validation.lock'
    lock.write_text('existing-owner', encoding='utf-8')
    result = subprocess.run(owner,cwd=fixture,shell=False,capture_output=True,text=True,timeout=5)
    assert result.returncode==1 and lock.read_text()=='existing-owner'
    print('PASS duplicate run: existing lock retained; no second workflow started')
finally:
    assert fixture.resolve().parent == qa and fixture.name.startswith('lifecycle-case-')
    shutil.rmtree(fixture)

"""Read-only audit of the most recent lifecycle run and its exact process IDs."""
from lifecycle import ROOT, process_birth
import json
import os

for name in ['.validation.lock', '.cv-build.lock']:
    if (ROOT / name).exists(): raise RuntimeError(f'Unresolved owned lock: {name}')
report = json.loads((ROOT / '.validation.json').read_text())
assert report['cleaned'], 'Last owner did not record cleanup'
if os.name == 'nt':
    for process in [report['owner'], *report['stages']]:
        birth = process_birth(process['pid'])
        if birth is not None and birth == process.get('birth'):
            raise RuntimeError(f'Task-owned process is still alive: {process["pid"]}')
print('CLEAN: no build/validation locks; recorded owner and stage process identities have exited')

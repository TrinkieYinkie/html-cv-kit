# Keeping the toolkit useful

## A small Git workflow

If you downloaded a ZIP, put its contents in a new folder outside an existing
repository, then run `git init` there. A cloned repository already has Git set up.
Edit your sources and review the diff before saving a version:

```sh
git diff
git add "Structured CV template/content" "Structured CV template/cv.html"
git commit -m "Add recent project experience"
git log --oneline
```

Commit themes and exports too when you intentionally change them. Keep separate
application HTML entry files in the same structured folder for different
headlines. Git stores commits; make a separate backup or use a remote repository
if you want protection against losing the laptop. Decide which personal details
you actually want in a public repository before publishing it.

## Local checks

The HTML builder needs Node.js 22+ and no npm dependencies. The optional content
checks and lifecycle owner need Python 3.10+; they use only its standard library.

From the root, run checks **sequentially**:

```sh
python tools/lifecycle.py checks.json
python tools/audit.py
```

If your Python command is `python3`, update the Python entry in `checks.json`
and use that executable to launch the owner. Explicit executable paths work too.

The owner uses a single-run lock, direct argv launches (`shell=False`), stage
deadlines, output limits, ten-second heartbeats, and signal cleanup. Windows
children are created suspended, assigned to a kill-on-close Job Object, then
resumed. Descendants such as a test browser belong to the same job. POSIX stages
use separate process groups. It never kills by executable name.

After a run, `.validation.json` records process identities and cleanup, and
`tools/audit.py` checks locks and, on Windows, PID plus process creation time.
These runtime files and `.qa/` are ignored by Git. If a lock survives an external
force-kill or power loss, inspect its ownership before removing it; don't run a
second validation blindly. Ordinary validation failure cleans up automatically.

The content check compares the original single-file example with the structured
MBA, checks supplied paragraph selections, and searches templates for personal
example data. The builder tests cover escaping, path boundaries, rejected links,
font embedding, deterministic output, and accidental source overwrite. These
checks are for the supplied fixtures; update their expectations when you
intentionally change the example or create alternative paragraphs.

On Windows, a separate process test verifies success, failure, and timeout:
each case starts a descendant process and checks that the exact process identity
has exited and its lock is gone. It also checks duplicate-run rejection. On other
platforms this Windows-specific acceptance test is skipped.

## Optional browser and PDF acceptance

Use an existing Playwright installation and Chromium-based browser. Add one
stage to a local copy of `checks.json`, with a timeout such as 180 seconds:

```json
{
  "name": "Offline browser and print review",
  "timeout": 180,
  "command": ["node", "tests/browser.mjs", "/absolute/path/to/playwright", "/absolute/path/to/browser"]
}
```

Run that configuration through `tools/lifecycle.py`. The browser check processes
files one at a time, writes temporary PDFs and a geometry report to `.qa/rendered`,
and closes the browser. It checks all eight profile/theme exports plus the two
single-file CVs, without network access. The single-file example retains its
original desktop layout; it is excluded from new mobile rules.

Inspect actual PDF pages as images, not just extracted text or DOM geometry.
Confirm two A4 pages, no clipped text, clear footers, readable type, working links,
and consistent styles. Automated geometry cannot judge all typographic issues.

No dependency installation or hosted automation is part of the check command.

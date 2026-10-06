# CV toolkit implementation plan

## Expected result

A portable repository with four entry folders: Alisa's unchanged 3 October 2026
single-file CV, a neutral single-file template, a structured example, and a
structured template. The structured versions share one rendering contract:
editable headline in the main HTML, factual content in JSON, two presentation
profiles, two themes, local fonts, and a dependency-free Node.js HTML exporter.

## Stages

1. **Foundation and content** — establish process ownership before validation;
   preserve the original HTML byte-for-byte; extract exact text into structured
   facts; create neutral placeholders and the builder.
2. **Presentation and guidance** — reproduce the original classic layout; add
   a visibly different editorial theme with licensed local font; produce ready
   exports; write the README, PDF instructions, and actionable AI prompts.
3. **Acceptance** — test isolation, escaping, offline exports, and failure paths;
   check all profile/theme combinations sequentially in a browser and in PDF;
   inspect page images; update documentation with actual evidence.

Each stage has its own branch, merged into the existing task integration branch.
Only the primary working directory is used. No push, PR, hosted automation, or
publication is part of this work.

## Boundaries and edge cases

- The original CV is unchanged. MBA uses its exact text; Team Lead reorders
  existing paragraphs and changes the target headline, without inventing titles,
  metrics, direct reports, degrees, releases, or dates.
- Keep concurrent employment visible. Personal examples must never leak into
  neutral templates. Placeholders must be visibly placeholders, not invented CVs.
- Escape JSON text and validate links. Reject missing/unknown profile selections,
  broken references, remote assets, file escapes, and accidental source overwrite.
- Export one HTML with inline CSS and used font data. Opening an export must need
  no server, JavaScript, package manager, or network.
- Check two A4 pages, long names/headlines, light/dark browser settings, narrow
  screens, print breaks, links, and template completeness. More content can require
  rebalancing pages; no silent clipping or shrinking to illegible text.
- Validation is sequential under a single-run lock, with per-stage deadlines,
  heartbeats, signal handling, and exact process-tree cleanup. On Windows use a
  kill-on-close Job Object and assign suspended children before they can spawn.
- Existing changes elsewhere in the parent repository stay outside task commits.

## Definition of done

- All four folders, two themes, two profiles, fonts, exports, builder, README,
  prompts, and print instructions exist and agree with one another.
- The unchanged example matches its source hash; structured MBA matches its text.
- Template outputs contain no Alisa identity, contact details, employers, or metrics.
- Checks fail fast; locks and owned child processes are gone after each run.
- Browser/PDF checks and visual review pass, and task work is committed on the
  integration branch with unrelated user changes preserved.

## Progress

- [x] Foundation and content — exact MBA text/order and paragraph coverage checked;
  initial classic example and neutral template exports built successfully.
- [x] Presentation and guidance — two themes, local licensed font, friendly English
  quick start, AI prompts, eight HTML exports, and five example PDFs prepared.
  Browser and PDF checks confirm two A4 pages. The unchanged source prints at 99%;
  structured exports print at 100%. Classic uses a 6px smaller description gap.
- [x] Acceptance — builder contracts and content checks pass; real process-tree
  tests cover success/failure/timeout and duplicate locks. Ten offline browser
  previews and PDF exports have two A4 pages. All five included example PDFs were
  visually reviewed; final renders retain the reviewed layout. See ACCEPTANCE.md.

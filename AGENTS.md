# Working on this CV toolkit

Read README.md first. The friendly single-file path is the default for a new user.
All repository instructions, UI hints, templates, and prompts are in English.

- Treat the completed example as a layout reference, never a source of another
  person's achievements. Do not invent dates, titles, metrics, degrees, or contacts.
- Keep the original single-file example unchanged unless its owner asks for edits.
- In structured projects, edit facts in content/, the application headline in the
  selected HTML, page composition in layout/, and appearance in styles/.
- Profile headlines are positioning, not replacements for historical job titles.
- Generated exports must be rebuilt; the independent single-file template is
  edited directly and does not automatically sync with structured content.
- A new theme must work with the same content. Use local licensed fonts, preserve
  readable print typography, and never hide overflowing experience.
- Keep all assets needed for viewing inside the exported HTML. Contact links
  remain normal links. Do not add tracking, remote fonts, or required scripts.
- Run local checks sequentially under tools/lifecycle.py as documented in
  docs/MAINTAINING.md. Warn before resource-intensive browser checks. Do not create
  hosted CI workflows or install dependencies without an explicit need.
- Inspect actual PDF pages after changing layout, fonts, content length, or print
  styles. Regenerate included example PDFs when their HTML changes. The original
  example uses 99% print scale; other supplied files use 100%.

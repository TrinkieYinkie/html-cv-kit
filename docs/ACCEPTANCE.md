# Acceptance record

Verified locally on 6 October 2026, Windows, Node.js 24.20.0, Chrome 154.0.8037.93.
This records the supplied files, not a guarantee for arbitrary future content.

| Check | Result |
| --- | --- |
| Original single-file HTML | SHA-256 matches the 3 October source byte-for-byte. |
| Structured MBA | All original visible text remains in the same reading order. |
| Team Lead | Existing paragraphs are reordered; every experience paragraph appears once; historical titles/dates are unchanged. |
| Neutral templates | No example identity, contact, employer, or example scale metrics in template content. |
| HTML gallery | Eight profile/theme combinations build; repeated identical inputs produce identical bytes. |
| Offline viewing | Ten files open with networking disabled; no HTTP requests. |
| Print | All ten files produce two A4 pages; page numbers and text are present, without replacement glyphs. |
| Original print exception | Original source uses 99% scale; all new files use 100%. |
| Page layout | No detected horizontal overflow or footer overlap. Classic description gap is reduced by 6px from the historical source. |
| Narrow/dark reading | New exports and the single-file template fit a 390px viewport with a 500px height; paper remains light. |
| Longer heading | A longer name and engineering headline wrap inside the paper. |
| Visual review | All pages of the five included example PDFs reviewed after rasterising with Poppler. Template pages also reviewed. Final page renders match the preceding reviewed layout. |
| Font | Lora is local, OFL-licensed, and embedded with its notice when referenced by the theme. |
| Builder failure paths | Missing profiles, invalid selections, unsafe links, external font imports, path escapes, and source overwrites are rejected. |
| Process ownership | Windows Job Object tests stop descendants after success, failure, and timeout; duplicate runs are rejected. |
| Cleanup | Lifecycle audit confirms no build/validation locks and no surviving recorded process identities. |

The original single-file SHA-256 is
`ba20f611599fccaaed4aaa6b4ddceba8e3df9a7d40c19b80f6f0cded21e5d7de`.

The unchanged Lora font SHA-256 is
`822a6621ccbe8d97d20ac88c1c41f5615c9c2c202eaa75f272cd452aac6475a7`.

The completed PDFs are snapshots kept with the examples. Reprint them after
changing their HTML. Runtime logs, temporary page images, and local executable
paths are excluded from version control.

Cross-platform command design is portable, but this acceptance run was on
Windows/Chrome. Review browser print preview on another platform before sending
its output. More content can require page rebalancing; the builder does not
silently clip or automatically shrink a CV.

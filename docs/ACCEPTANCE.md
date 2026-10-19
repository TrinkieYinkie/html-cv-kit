# Acceptance record

Initial verification: 6 October 2026, Windows, Node.js 24.20.0, Chrome
154.0.8037.93. The headline refresh described below was subsequently checked on
the same date. This records the supplied files, not a guarantee for arbitrary
future content.

| Check | Result |
| --- | --- |
| Single-file HTML | The 3 October source with only its document title and visible target headline updated to Technical Product Owner at the author's request. |
| Structured MBA | All current single-file example text remains in the same reading order. |
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

The historical 3 October single-file SHA-256 was
`ba20f611599fccaaed4aaa6b4ddceba8e3df9a7d40c19b80f6f0cded21e5d7de`.

The current single-file SHA-256, after the headline refresh, is
`b31562d7f99b3f2ebd9c6b820fd115022f0644d735e5952cdb528bc85e723079`.

The unchanged Lora font SHA-256 is
`822a6621ccbe8d97d20ac88c1c41f5615c9c2c202eaa75f272cd452aac6475a7`.

The completed PDFs are snapshots kept with the examples. Reprint them after
changing their HTML. Runtime logs, temporary page images, and local executable
paths are excluded from version control.

## Headline refresh, 6 October 2026

The single-file example, structured source, and MBA profile's suggested headline
now use **Technical Product Owner**. The example's Classic and Editorial HTML
exports were rebuilt. Historical employment titles and the separate Team Lead
profile were not changed.

The three corresponding PDFs were regenerated with Chrome 154.0.8037.98 and
Node.js 24.19.0 on Windows, with networking disabled. Source-fidelity checks pass;
all three PDFs contain the updated headline and two A4 pages. Print geometry,
footer clearance, and narrow dark-screen layout for the structured exports pass.
All six PDF pages were rendered with Poppler and visually reviewed. The README's
Classic and Editorial preview images are the refreshed PDF first pages at 120 dpi.
The original single-file layout still uses 99% print scale; structured exports
use 100%. The lifecycle audit confirms cleanup after the refresh.

Cross-platform command design is portable, but this acceptance run was on
Windows/Chrome. Review browser print preview on another platform before sending
its output. More content can require page rebalancing; the builder does not
silently clip or automatically shrink a CV.

## Commercial profiles, 19 October 2026

Added `partnerships` and `b2b-sales` to the personal example in Classic and
Editorial. Existing single-file content, legacy profile selections, neutral
templates, theme CSS and historical PDFs are unchanged from the preceding
contact update. Target headlines do not replace historical employment titles.

Sequential validation ran on Windows with Node.js 24.20.0 and installed Chrome,
owned by `tools/lifecycle.py`. No dependencies were installed. The checks passed:

- All twelve gallery exports build; builder contracts, exact MBA source fidelity,
  unique valid selections, matching legacy facts and neutral templates pass.
- Fourteen HTML files load offline without HTTP requests. Print geometry,
  footer clearance and longer-header wrapping pass. Responsive files fit
  390 × 500 viewports in both light and dark modes.
- Each new PDF has exactly two A4 pages at 100% scale. Every selected experience
  paragraph is present on its intended page. Footers read 1 / 2 and 2 / 2.
- WhatsApp, email, Telegram, LinkedIn and GitHub URI annotations are present in
  every new PDF; none use local file URLs. No replacement glyphs were found.
- Poppler rendered all eight new pages at 125 dpi. Visual review found readable
  text, intact contact links, consistent columns, clear role boundaries and no
  clipped text or footer collisions in either theme.

The initial Classic page-two overflow was resolved by omitting the detailed
API-authentication paragraph from the commercial profiles. Engineering ownership,
service scale, reliability work, Redis stabilisation and the CRS performance
result remain. No type was reduced and no content was hidden with CSS.

Minimum measured footer clearance across the two pages, in CSS pixels:

| Profile | Classic | Editorial |
| --- | ---: | ---: |
| Partnerships | 43.16 | 46.25 |
| B2B Sales | 25.61 | 34.05 |

Final PDF SHA-256 hashes (under the personal example's `exports/`):

| PDF | SHA-256 |
| --- | --- |
| partnerships-classic.pdf | `50cda0eeb1b014759e446ba58f0538f80b97dd31a767c82fd27a1b0d0f50491e` |
| partnerships-editorial.pdf | `d3a6d2b7e2af2d8230edcba199f8ca5123b2bba8a964a6bc645f148453f9e943` |
| b2b-sales-classic.pdf | `689b5b0818f070db18663b51274b27c5be7fb021d55e6c66839a368d23d993a1` |
| b2b-sales-editorial.pdf | `7f9c962df0faa9e3c0607b56caecc887c6176553074ad22a6fb16f7c132679f4` |

Runtime reports and page images remain in ignored `.qa/`. The lifecycle audit
confirms no remaining build/validation locks or recorded task process identities.
Private career-source updates and LinkedIn copy are kept outside this public
toolkit. Publication and LinkedIn edits were not performed.

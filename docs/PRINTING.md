# From HTML to a PDF you can send

1. Open the single-file CV or a built file from `exports/` in Chrome or Edge.
2. Wait for the page to finish drawing, including the name font.
3. Open Print with Ctrl+P / Cmd+P and choose **Save as PDF**.
4. Select **A4**, **portrait**, **100% scale**, and **None** for browser margins.
5. Turn browser **Headers and footers off**: the CV has its own page numbers.
6. Enable **Background graphics** to preserve theme colours and skill badges.
7. Inspect **every page**. Check the bottom of each column, split roles, contact
   links, the name/headline, and accidental blank pages.
8. Save with an informative filename, such as `Your_Name_Company_Role.pdf`.

The exact labels vary by browser/OS. CSS supplies the A4 page size and internal
margins. Prefer a desktop browser for the final export; mobile screen layout is
for reading, not an accurate A4 preview.

**Original example only:** use **99% scale** for
`Single file example - Alisa Petrova CV/cv.html`. This preserves the original
file byte-for-byte while avoiding an extra page caused by a small overflow at
100% in the tested Chrome version. The structured Classic theme adjusts a gap
slightly and fits at **100%**, without changing the CV text.

## When the preview has three pages instead of two

More text, different fonts, or a longer headline can push content onto another
page. First check A4, margins, scale, and browser headers. Then move a role or
some paragraphs to the other page in the selected profile. Keep a continued role
label when splitting it. If you need another page, extend `layout/two-pages.html`
and the renderer together, and update footer numbering. The supplied renderer
is deliberately a two-page starter, not an automatic pagination engine.

Do not apply `overflow: hidden` or a fixed clipping height. That can hide genuine
experience while making the page look correct. Prefer editing and rebalancing
over shrinking the whole CV.

## Colours or fonts look different

Enable Background graphics. Editorial embeds its Lora font in the exported HTML;
Classic uses system Arial/Helvetica, so small platform differences are possible.
Preview in the same browser used to create the PDF. A custom font changes line
lengths, so repeat the page check after switching it.

## Which HTML should I print?

- `Single file .../cv.html`: ready to print.
- `Structured .../exports/*.html`: ready to print after rebuilding.
- `Structured .../cv.html`: editable source shell; build it first.

Reference: [MDN: Printing CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing).

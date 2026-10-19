# Editorial HTML review — 19 October 2026

The author requested a more modern Editorial design without the blue/teal
palette, while preserving Classic. PDF generation is explicitly deferred until
the author approves the HTML. This is a review draft, not final PDF acceptance.

## Review files

- [Partnerships](../Structured%20CV%20example%20-%20Alisa%20Petrova/exports/partnerships-editorial-preview.html)
- [B2B Sales](../Structured%20CV%20example%20-%20Alisa%20Petrova/exports/b2b-sales-editorial-preview.html)

Following the author's feedback, the draft keeps the original Editorial column
widths, spacing, Lora name and thin sidebar divider. Changes are limited to a
graphite palette, neutral note and skill backgrounds, a lighter top rule and
softly outlined badges. The right column has no panel background. The draft lives
in the personal example's
`styles/editorial-preview.css`; the approved Editorial theme is not yet replaced.
The source facts, role chronology and page count remain the same.

Both commercial profiles now place Engineering practice below their client skills
on page one. The Telegram label and link have changed to `t.me/TrinkieYinkie`.
The other local CV HTML copies also received that contact-only change.

## Verification

- Builder contracts and content-fidelity checks pass.
- The previous round checked fourteen structured HTML exports offline in Chrome.
  The two revised drafts passed another check without producing PDFs.
- Both revised drafts fit two A4-sized sheets. Minimum footer clearance is 48.25
  CSS pixels for Partnerships and 36.05 for B2B Sales, with no horizontal overflow.
- Engineering practice is present only on page one of the commercial profiles.
- The new Telegram link is present, and the layouts fit 390 × 500 viewports in
  light and dark modes. Scrollbars use the existing shared semantic tokens.
- Both pages of both HTML drafts were captured and visually reviewed.
- Validation used the existing sequential lifecycle owner with stage timeouts
  and cleanup. Existing PDFs are untouched pending approval.

To rebuild a review draft:

```sh
node build.mjs "Structured CV example - Alisa Petrova/partnerships.html" --profile partnerships --theme editorial-preview
node build.mjs "Structured CV example - Alisa Petrova/b2b-sales.html" --profile b2b-sales --theme editorial-preview
```

After approval, apply the chosen theme to the maintained personal and neutral
projects, refresh affected PDF snapshots and preview images, and record final
PDF pagination, links and visual acceptance. Seventeen local CV PDFs still need
the new Telegram link; preserve their other historical content when refreshing.

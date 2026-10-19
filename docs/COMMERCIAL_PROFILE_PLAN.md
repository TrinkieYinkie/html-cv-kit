# Commercial CV profiles

Date: 19 October 2026.

Prepare Partnerships and B2B Sales profiles from Alisa's verified engineering,
analysis, presales, integration and client-support experience. Keep both supplied
visual themes and exactly two readable A4 pages. Preserve existing historical
examples. The existing feature/update-resume-contacts branch is the integration
branch; all stages use this primary checkout.

## Scope and factual boundaries

- Alfa-Bank: business requirements, solution decisions, coordination of seven
  contributors and production delivery. No external sales claim or direct reports.
- CRS: US stakeholder collaboration, engineering and analysis, architecture and
  the approximately 20-to-5-second policy-loading result. No invented promotion dates.
- Revvy: customer discovery and presentations before purchase, scope/timeline/POC
  discussions, integration ownership, external-platform collaboration and later
  paid features. PM sourced contacts, scheduled calls and approved budgets.
- Do not claim sole deal closure, quota, revenue, conversion improvement, signed
  alliances, a network-wide medical rollout, or an unverified customer count.
- WritersStudio: public Windows beta confirmed on 19 October; no user/revenue
  metrics. Keep independent products secondary to employment experience.
- Keep implementation code and factual content in their existing layers.

## Stages

1. feature/commercial-cv-content: add profile-specific experience and two profiles;
   preserve technical substance and legacy selections; include new presets in
   gallery builds; add the author block, usage documentation and LinkedIn copy.
   Check build contracts, content selection and legacy fidelity before merging.
2. feature/commercial-cv-pdf: generate four PDFs, inspect page geometry and links,
   render every page with Poppler and review images; rebalance content if needed.
   Record acceptance, merge and audit the combined result.

Update the private career master profile separately in its containing repository,
without staging unrelated pre-existing changes or private notes in this public kit.

## Risks and verification

- Alternative paragraphs invalidate the old requirement that every profile select
  every paragraph. Validate each selected index and uniqueness, preserve exact MBA
  text/order, and verify Team Lead still selects the same legacy facts as MBA.
- Do not accidentally regenerate old PDFs from new content or overwrite the
  independent single-file example. New profiles share content but select their own
  wording; existing title/date history remains unchanged.
- Check both themes for two-page pagination, footer clearance, long titles and
  working contact links; check narrow light/dark reading without clipping.
- Use tools/lifecycle.py for sequential build/validation/render stages, with
  explicit timeouts, a single-run lock, heartbeats and task-owned process cleanup.
  Warn before browser work. Audit immediately after each commit and before more work.
- Do not publish, push, create a PR, edit LinkedIn, or change hosted automation.

## Definition of done

- Two distinct commercial profiles with credible Alfa-Bank, CRS and Revvy content.
- Four portable HTML exports and four visually checked two-page PDFs.
- Compact README author block with direct CV links and accurate profile guidance.
- Copy-ready LinkedIn recommendations covering headline, About, Experience,
  skills and Featured, with unresolved historical-title details identified.
- Relevant checks pass; task-owned processes and locks are gone; integration
  branch is clean. Historical examples and neutral templates remain intact.

## Progress

- Planning and read-only inspection complete.
- Content stage complete: two commercial profiles, alternative role descriptions,
  source entry files, four HTML exports, profile discovery and author documentation.
  Build contracts, content selections and exact legacy text fidelity passed.
- Private career facts and copy-ready LinkedIn recommendations are maintained in
  the containing career repository, outside this public toolkit.
- PDF stage complete: four PDFs contain exactly two A4 pages each; every selected
  experience paragraph appears on its intended page and all contact links work.
  All eight pages were rendered with Poppler and visually reviewed.
- Classic initially exceeded page two by 14.45 CSS pixels. Omitting one
  low-level authentication paragraph from the new commercial selections resolved
  this; font sizes, theme CSS and all historical selections remain unchanged.
- All fourteen HTML files pass offline browser geometry checks; the responsive
  files fit narrow light and dark screens. No task-owned processes or locks remain.

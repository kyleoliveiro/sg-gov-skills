---
name: dss-accessibility
description: >-
  Build and review frontend code that satisfies the 53 accessibility controls
  of the Singapore Digital Service Standards (WCAG 2.2 A/AA recast as DSS
  WP/WO/WU/WR controls, with SG-specific levels). Use whenever writing or
  reviewing UI for a Singapore government digital service — components, pages,
  forms, modals, navigation — or when the user says "accessibility", "a11y",
  "WCAG", "DSS compliance", "accessibility audit", "screen reader", "contrast",
  or "keyboard navigation" in an SG government context. Apply DURING
  implementation, not as a post-hoc audit: retrofitting focus order, semantic
  structure, and reflow is far more expensive than building them in.
---

# DSS Accessibility (WP / WO / WU / WR)

Make frontend work for Singapore government services conform to the 53
WCAG-derived controls of the Digital Service Standards (DSS) under the ICT&SS
Policy Reform (IM8's successor): WP Perceivable (19), WO Operable (18), WU
Understandable (14), WR Robust (2). These are effectively WCAG 2.2 Level A/AA
requirements republished as government controls — but compliance is assessed
against **DSS control IDs**, not SC numbers, so tag findings and commits with
IDs like WP-13 or WO-18.

Full control text (statements, recommendations, rationale, levels, and the
inferred WCAG 2.2 mapping) is in
[references/wcag-controls.md](references/wcag-controls.md). Read it when you
need exact wording for a compliance artefact or a disputed review comment.

## Source and currency

Embedded from **info.standards.tech.gov.sg** as of **2026-07-16** (catalog
pages last updated 5 March 2026). The standards iterate actively — verify
against the live pages for compliance-critical decisions:

- https://info.standards.tech.gov.sg/control-catalog/dss/wp/
- https://info.standards.tech.gov.sg/control-catalog/dss/wo/
- https://info.standards.tech.gov.sg/control-catalog/dss/wu/
- https://info.standards.tech.gov.sg/control-catalog/dss/wr/
- https://info.standards.tech.gov.sg/ssp/dss-others/ (levels, <1M visits/yr)
- https://info.standards.tech.gov.sg/ssp/dss-high/ (levels, ≥1M visits/yr)

## Step 0 — Determine the profile

Two DSS profiles exist; the split is annual traffic **measured by WOGAA**
(the mandatory whole-of-government analytics — see the sg-service-shell
skill for WOGAA itself, and ssp-navigator for full SSP selection):

| Profile | Qualifier | Effect on the 53 controls |
|---|---|---|
| **DSS (Others)** | < 1M visits/year per WOGAA | 44 controls at Level 1, 9 at Level 2 |
| **DSS (High Impact)** | ≥ 1M visits/year per WOGAA | **All 53 at Level 1** |

The 9 controls that are Level 2 in Others and promoted to Level 1 in High
Impact: **WP-4, WP-5, WP-9, WP-15, WO-3, WO-11, WO-14, WO-15, WU-3**.

Level semantics: **Level 1** is default hygiene — skipping it requires agency
IDSC/CIO/CISO-approved deviation documented in a custom SSP, so treat Level 1
as required. **Level 2** is best practice — implement unless there's a reason
not to; the cost is usually low if considered up front. No WCAG-derived
control is Level 0. For a new service with no WOGAA history, ask the agency
for the expected traffic tier; when in doubt, build to High Impact — it only
adds the 9 promotions and they're all cheap except live captions (WP-4) and
audio description (WP-5).

## Building: page structure and navigation

- **Semantic HTML first** (WP-6): headings in order (`h1`→`h2`→`h3`, no
  skips), real `<ul>/<ol>`, `<table>` with `<th scope>`, `<button>` not
  clickable `<div>`. Add ARIA only where semantics fall short — the control
  text explicitly warns against ARIA overuse.
- **DOM order = reading order** (WP-7, WO-9): screen readers and Tab follow
  the DOM. Never use CSS `order`/absolute positioning to visually reorder
  content whose sequence carries meaning. Avoid `tabindex` > 0.
- **Unique, descriptive `<title>` per page — and per SPA view** (WO-8): DSS
  explicitly extends this to "distinct Single-Page Application view served
  from the same URI". Update `document.title` on route change.
- **Skip link** (WO-7): first focusable element, may be visually hidden until
  focused, plus landmark regions (`<main>`, `<nav>`, `<header>`):

  ```html
  <a class="skip-link" href="#main">Skip to main content</a>
  ...
  <main id="main">
  ```

- **Language** (WU-1, WU-2): `<html lang="en">`; wrap other-language content
  — common on multilingual SG sites — in `lang` spans:
  `<span lang="ms">Majulah Singapura</span>`. PDFs need `/Lang`; iOS apps use
  `accessibilityLanguage`.
- **Main navigation** (WU-7 — stricter than WCAG): place it at or near the
  top; on desktop it must **not** be hidden behind a hamburger icon; keep
  link order identical across pages. Hamburger on mobile is fine.
- **Link text stands alone** (WO-10): "Download the 2026 fee schedule (PDF)",
  never "click here"/"read more". Screen reader users navigate link lists out
  of context.
- **Descriptive headings and labels** (WO-12) and **consistent naming of
  repeated components** (WU-8): the same function gets the same label
  everywhere ("Submit" is not sometimes "Send").
- **Two ways to reach content** (WO-11, L2 in Others): navigation + search
  (SearchSG — see BD-2 in sg-service-shell) or a sitemap.
- **Help in the same place on every page** (WU-9): the official government
  footer (TL-4, sg-service-shell) satisfies this for Contact Us/FAQ; keep
  chat widgets in a fixed position too.

## Building: forms and validation

- **Every input has a programmatic label** (WP-10, WR-1): `<label for>` or
  `aria-labelledby` — placeholder text is not a label. State the expected
  format where ambiguous: `Date of birth (DD/MM/YYYY)`. Add `autocomplete`
  tokens (`name`, `postal-code`, `tel`) so browsers and assistive tech can
  identify purpose and pre-fill.
- **Visible label ⊆ accessible name** (WO-16): if the button shows "Search",
  its `aria-label` must contain "Search" ("Search citizen records" is fine,
  "Find" breaks voice-control users who say "click Search").
- **Errors: identify, describe, associate** (WU-10, WU-11): mark the failing
  field visually *and* programmatically; never rely on a red border alone
  (WP-11 — colour cannot be the only signal; pair with icon + text):

  ```html
  <label for="nric">NRIC/FIN</label>
  <input id="nric" aria-invalid="true" aria-describedby="nric-err">
  <p id="nric-err" class="error">
    <svg aria-hidden="true">…</svg>
    Enter your NRIC or FIN, e.g. S1234567D.
  </p>
  ```

  Write messages in plain, non-technical language and say how to fix the
  problem — including 404/500 pages (WU-11).
- **Validate early, not only on submit** (WU-10, WU-11): run field
  validation on blur, and once a field has an error re-validate on change so
  the message clears the moment it's fixed. Keep the full check on submit
  with a focused error summary — but don't make users fill the whole form
  before hearing about a mistake they made in the first field.
- **Announce dynamic errors and status** (WR-2): render inline errors and
  "Saving… / Saved" indicators into an `aria-live="polite"` region (or
  `role="alert"` for blocking errors) so screen readers hear what sighted
  users see. For an error summary on submit, move focus to it.
- **Review before submit, allow reversal** (WU-12): multi-page forms and
  payment/legal transactions need a summary step with edit links; make
  submissions reversible where feasible.
- **Never ask twice** (WU-13): within one flow, auto-populate or offer to
  reuse anything already entered (mailing address = residential address
  checkbox). Exceptions: security re-entry (confirm password) and expired
  data. MyInfo pre-fill (TX-6) is the idiomatic SG way to avoid asking at
  all.
- **No surprise context changes** (WU-5, WU-6): focusing a field must change
  nothing; selecting a radio/checkbox/dropdown must not auto-submit or
  navigate — use an explicit button, or warn in advance.
- **Time limits adjustable** (WO-4): session-timeout warnings must let users
  extend. Exempt only legal deadlines, real-time events, and limits > 20 h.

## Building: interactive components, modals, custom widgets

Prefer native elements and established accessible component libraries — the
SGDS (Singapore Government Design System) components are built against these
requirements. For anything custom:

- **Full keyboard operation** (WO-1): everything a mouse can do, a keyboard
  can do — Enter/Space activate, arrows move within composite widgets. No
  timing-dependent keystrokes.
- **No keyboard traps** (WO-2): Tab and Shift+Tab must always escape. Modals
  are the sanctioned exception — trap focus *inside* while open, close on
  Esc, and on close return focus to the trigger element (WO-9). Prefer
  `<dialog>` with `showModal()`, which handles most of this natively.
- **Name, role, value for custom controls** (WR-1): a custom toggle needs
  `role="switch"`, `aria-checked`, and an accessible name — and the state
  must update in the DOM, not just visually.
- **Focus visible and not obscured** (WO-13): never `outline: none` without a
  replacement meeting 3:1 contrast (WP-17). Check sticky headers/footers and
  floating widgets don't cover the focused element — scroll-margin helps:

  ```css
  :focus-visible { outline: 3px solid #0F69FF; outline-offset: 2px; }
  :target, :focus { scroll-margin-top: 5rem; } /* clear the sticky header */
  ```

- **Content on hover/focus** (WP-19): tooltips and hover menus must stay
  visible while the pointer moves onto them, be dismissible with Esc, and
  not vanish on their own.
- **Single-character shortcuts** (WO-3, L2 in Others): if you add keys like
  `?` or `j/k`, provide a way to disable or remap them — dictation software
  fires them accidentally.
- **Moving/auto-updating content** (WO-5): anything that moves, blinks,
  scrolls, or auto-refreshes for more than 5 seconds alongside other content
  needs pause/stop/hide. Honour `prefers-reduced-motion`.
- **Status messages** (WR-2): async results ("3 results found", toast
  notifications) go in live regions; use `role="status"` for polite,
  `role="alert"` for assertive.

## Building: media and images

- **Alt text on essential images** (WP-1): accurate and concise; charts need
  a text equivalent of the data. Decorative images: `alt=""` (or
  `aria-hidden="true"` for inline SVG) so screen readers skip them.
- **Prerecorded video/audio** (WP-2, WP-3): captions synced to the audio;
  transcripts for audio-only; text alternative or audio description for
  video. Exempt only when the media is itself a labelled alternative for
  text.
- **Live streams** (WP-4, L2 in Others): live captions for webinars and
  livestreams — the promoted controls' biggest cost, so flag it early for
  High Impact services.
- **Audio description** (WP-5, L2 in Others): user-selectable described audio
  track covering critical visual information.
- **No autoplaying audio > 3 s** (WP-12) without pause/stop/volume controls
  placed near the start of the page — it talks over screen readers.
- **No content flashing > 3×/second** (WO-6), or show a seizure warning with
  the option to skip.
- **Real text, not images of text** (WP-15, L2 in Others): logos are the
  exception; if unavoidable, the alt text must carry the same information.

## Building: colour, contrast, typography, layout

- **Text contrast ≥ 4.5:1** against background; **≥ 3:1** for large text
  (≥ 18 pt, or 14 pt bold) (WP-13). Exempt: decorative text and disabled
  components.
- **UI component and meaningful-graphic contrast ≥ 3:1** (WP-17): button
  borders, form-field outlines, focus indicators, chart lines, icons.
- **Colour never the sole signal** (WP-11): pair with icons, text, or
  patterns — error states, chart series, required-field markers.
- **200% text scaling without loss** (WP-14): size in `rem`, never disable
  zoom (`user-scalable=no` is a violation in effect), test at 200% browser
  zoom for clipped or overlapping content.
- **Reflow** (WP-16): content reflows to a single column at narrow widths
  (test at 320 px / 400% zoom) with no horizontal scrolling; true 2-D content
  (maps, complex tables, data viz) is exempt. Flexbox/Grid + relative units.
- **Text-spacing override survives** (WP-18): the page must not break when
  users force line-height 1.5×, paragraph spacing 2×, letter spacing 0.12×,
  word spacing 0.16× font size. Practical rule: avoid fixed heights and
  `overflow: hidden` on text containers; let boxes grow. You do *not* need
  these as defaults or in-page spacing controls.
- **Both orientations** (WP-9, L2 in Others): don't lock portrait/landscape
  unless the function demands it — wheelchair-mounted devices are often
  fixed in one orientation.

## Building: gestures and pointer input

- **Pointer targets ≥ 24×24 CSS px** (WO-18): `min-width`/`min-height` on
  interactive elements. Smaller targets are allowed only if a 24 px circle
  centred on each doesn't overlap its neighbours'; inline text links are
  exempt. Go larger (44 px) on touch-first screens:

  ```css
  button, .icon-btn { min-width: 24px; min-height: 24px; }
  ```

- **Single-point alternatives** (WO-14, L2 in Others): drag-and-drop,
  sliders, pinch, multi-finger gestures all need a plain-click/keyboard
  equivalent (e.g. "Move up/down" buttons beside a sortable list).
- **Pointer cancellation** (WO-15, L2 in Others): fire actions on the
  up-event (`click`, not `mousedown`/`touchstart`) so users can slide off to
  abort; provide undo or confirmation for critical actions.
- **Motion actuation** (WO-17): shake-to-undo etc. must be disableable and
  have a UI equivalent.

## Building: authentication flows

- **A non-cognitive login option** (WU-14): at least one authentication
  method that requires no recalling, solving, or transcribing. **Singpass QR
  login** (scan-and-approve) satisfies this and is the idiomatic choice for
  citizen-facing services (see AC-7/TX-1 context in ssp-navigator);
  text/email one-time codes also qualify. A CAPTCHA or memorised password as
  the *only* path fails. Never block paste on password or OTP fields —
  paste/password-manager support is the standard technique.
- **Don't re-ask during the flow** (WU-13): data known from login or earlier
  steps (Singpass/MyInfo profile) is pre-filled, not re-typed.
- **Session timeouts** (WO-4): warn before expiry and allow extension —
  balance against the security team's AS-11 session-timeout parameter rather
  than silently logging users out mid-form.

## Testing and review

Run all three passes; automated tools catch roughly a third of these
controls at best.

**1. Keyboard walkthrough (WO-1/2/7/9/13, WP-19).** Unplug the mouse. Tab
through every page: Can you reach everything interactive? Is the focus ring
always visible and never hidden under sticky UI? Does Tab order match visual
order? Can you escape every widget and dismiss every popup with Esc? Does
focus return to the trigger after a modal closes?

**2. Screen reader pass (WP-1/6/7, WU-1, WO-8/10/12/16, WR-1/2).** VoiceOver
(macOS/iOS), NVDA (Windows), or TalkBack (Android). Navigate by headings and
landmarks; listen to forms (label, format hints, errors announced?); trigger
async actions and confirm live regions announce them.

**3. Automated + visual checks.**

- **Oobee** (GovTech's open-source scanner, formerly Purple A11y —
  https://github.com/GovTechSG/oobee): the scanner SG agencies expect;
  crawls whole sites, CLI fits CI.
- **axe** (axe-core / browser DevTools extension): per-page engine checks.
- **WebAIM Contrast Checker** — the tool the WP-13/WP-17 control text itself
  names — for token-level ratios; axe catches rendered violations.
- Browser zoom to **200%** (WP-14) and viewport at **320 px** (WP-16).
- A text-spacing bookmarklet applying the WP-18 values; confirm nothing
  clips.
- `prefers-reduced-motion` emulation for WO-5 animations.

**Review heuristics for diffs:** flag `outline: none` (WO-13), `<div
onClick>` (WO-1/WR-1), placeholder-as-label (WP-10), `alt` missing or
auto-generated (WP-1), colour-only state (WP-11), `px` font sizes and fixed
heights on text (WP-14/18), `mousedown` handlers (WO-15), icon buttons under
24 px (WO-18), missing `aria-live` on async status (WR-2), `user-scalable=no`
(WP-14), raw hex pairs below ratio (WP-13/17).

## Full control checklist

Levels: O = DSS (Others, <1M visits/yr), H = DSS (High Impact, ≥1M). WCAG SC
is an **inferred** mapping (the site prints no SC numbers) — details and full
text in [references/wcag-controls.md](references/wcag-controls.md).

| ID | Control | O | H | WCAG SC (inferred) |
|---|---|---|---|---|
| WP-1 | Text Alternatives for Non-Text content | 1 | 1 | 1.1.1 |
| WP-2 | Captions for Prerecorded Media | 1 | 1 | 1.2.2 |
| WP-3 | Text or Audio Alternatives for Prerecorded Media | 1 | 1 | 1.2.1 + 1.2.3 |
| WP-4 | Live Captions | 2 | 1 | 1.2.4 |
| WP-5 | Audio Description for Prerecorded Video Content | 2 | 1 | 1.2.5 |
| WP-6 | Presentation of Info and Relationships | 1 | 1 | 1.3.1 |
| WP-7 | Meaningful Content Order | 1 | 1 | 1.3.2 |
| WP-8 | Describing Displayed Controls | 1 | 1 | 1.3.3 |
| WP-9 | Display Orientation | 2 | 1 | 1.3.4 |
| WP-10 | Identify Input Purpose | 1 | 1 | 1.3.5 |
| WP-11 | Use of Color | 1 | 1 | 1.4.1 |
| WP-12 | Audio Control | 1 | 1 | 1.4.2 |
| WP-13 | Minimum Contrast | 1 | 1 | 1.4.3 |
| WP-14 | Text Scaling | 1 | 1 | 1.4.4 |
| WP-15 | Images of Text | 2 | 1 | 1.4.5 |
| WP-16 | Content Reflow | 1 | 1 | 1.4.10 |
| WP-17 | Non-text Contrast | 1 | 1 | 1.4.11 |
| WP-18 | Text Spacing | 1 | 1 | 1.4.12 |
| WP-19 | Content on Hover or Focus | 1 | 1 | 1.4.13 |
| WO-1 | Keyboard equivalent | 1 | 1 | 2.1.1 |
| WO-2 | No Keyboard Trap | 1 | 1 | 2.1.2 |
| WO-3 | Character Key Shortcuts | 2 | 1 | 2.1.4 |
| WO-4 | Adjustable Timings | 1 | 1 | 2.2.1 |
| WO-5 | Pause, Stop, Hide | 1 | 1 | 2.2.2 |
| WO-6 | Reduce Flash Triggers | 1 | 1 | 2.3.1 |
| WO-7 | Bypass Repeating Content | 1 | 1 | 2.4.1 |
| WO-8 | Page Title And Purpose | 1 | 1 | 2.4.2 |
| WO-9 | Sequential Focus Order | 1 | 1 | 2.4.3 |
| WO-10 | Link Text And Purpose | 1 | 1 | 2.4.4 |
| WO-11 | Multiple Ways | 2 | 1 | 2.4.5 |
| WO-12 | Headings and Labels | 1 | 1 | 2.4.6 |
| WO-13 | Focus Visible and Not Obscured | 1 | 1 | 2.4.7 + 2.4.11 |
| WO-14 | Simple Pointer Alternatives | 2 | 1 | 2.5.1 |
| WO-15 | Pointer Cancellation | 2 | 1 | 2.5.2 |
| WO-16 | Label In Name | 1 | 1 | 2.5.3 |
| WO-17 | Motion Actuation | 1 | 1 | 2.5.4 |
| WO-18 | Minimum Pointer Target Size | 1 | 1 | 2.5.8 |
| WU-1 | Language of Page | 1 | 1 | 3.1.1 |
| WU-2 | Language of Parts | 1 | 1 | 3.1.2 |
| WU-3 | Unusual Words | 2 | 1 | 3.1.3 (AAA) |
| WU-4 | Abbreviations | 1 | 1 | 3.1.4 (AAA) |
| WU-5 | Changes On Focus | 1 | 1 | 3.2.1 |
| WU-6 | Changes On Input | 1 | 1 | 3.2.2 |
| WU-7 | Consistent Navigation | 1 | 1 | 3.2.3 |
| WU-8 | Consistent Identification | 1 | 1 | 3.2.4 |
| WU-9 | Consistent Help | 1 | 1 | 3.2.6 |
| WU-10 | Error Identification | 1 | 1 | 3.3.1 |
| WU-11 | Error Suggestion | 1 | 1 | 3.3.3 |
| WU-12 | Error Prevention | 1 | 1 | 3.3.4 |
| WU-13 | Redundant Entry | 1 | 1 | 3.3.7 |
| WU-14 | Accessible Authentication (Minimum) | 1 | 1 | 3.3.8 |
| WR-1 | Name, Role, Value | 1 | 1 | 4.1.2 |
| WR-2 | Status Messages | 1 | 1 | 4.1.3 |

Content notes (see the reference file for details): WU-3/WU-4 correspond to
WCAG **AAA** criteria yet appear in DSS; WO-12's published recommendations
currently duplicate WO-13's focus text (site publishing error — implement to
the statement); WU-7 adds SG-specific nav-placement requirements beyond WCAG.

## Related skills

- **ssp-navigator** — which SSPs apply to the system, DSS profile
  qualification, level semantics, deviation process.
- **sg-service-shell** — the non-WCAG DSS controls: official government
  banner (TL-3), footer (TL-4), WOGAA (PR-2/LM-18), SGDS usage (BD-6),
  responsive design (BD-1), search (BD-2).
- **secure-coding-as** — AS-family application-security controls that
  interact with UI work (session timeout AS-11, error-message content AS-13).

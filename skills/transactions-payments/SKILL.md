---
name: transactions-payments
description: >-
  Build or audit the transaction and payment flows of a Singapore government digital
  service against the DSS Transactions & Payments controls (TX-1..TX-15): fully
  digital end-to-end transactions, upfront prerequisites and fees, multi-step forms
  with progress indicators, save-draft and resume, pre-fill with Myinfo/EDH via
  Singpass/Corppass, payment and refund information, managing stored payment
  details, success/failure messages, failure reasons and appeal channels,
  receipts, and status notifications and tracking. Use when building a government
  e-service form or wizard that ends in a submission or payment; integrating a
  payment gateway (PayNow, cards, PaySG); designing receipts, acknowledgement
  emails, or status pages; or reviewing a transactional service for DSS
  compliance. Triggers: multi-step form or wizard for an agency service, "save
  draft", progress indicator, payment or refund flow, stored card management,
  transaction receipt or acknowledgement, application status tracking, TX
  controls, DSS transactions.
---

# transactions-payments: DSS TX controls for SG government services

You are building or auditing **a transaction** — an exchange of information, goods,
services, or money, or a change to Government Data — in a Singapore government digital
service, against the **Transactions & Payments family (TX-1..TX-15)** of the Digital
Service Standards (DSS) under the ICT&SS Policy Reform. The family is the user journey
itself: what users know before they start, how the form feels while they're in it, how
payment behaves, and what happens after they submit.

The organising principle: **a government transaction is a promise with three phases** —
before (can I do this, what will it cost, what do I need), during (don't lose my work,
don't make me retype what the government knows), after (prove it happened, tell me
what's next, let me check without calling). Most failures audits find are not broken
code but missing phases.

## Source and currency

Control text in this skill and `references/tx-controls.md` is embedded from
**info.standards.tech.gov.sg as of 2026-07-23** (TX family page last updated 5 March
2026). The standards iterate actively. For any compliance-critical decision, verify
against the live page:

- TX: https://info.standards.tech.gov.sg/control-catalog/dss/tx/

Read `references/tx-controls.md` for full control statements, recommendations, and
rationales when you need exact wording.

## Implementable vs policy-owned

Every TX control has a developer-buildable surface, but five also have an agency policy
angle. Build the implementable part; **flag the policy part as an agency decision, don't
invent it**:

| Control | You build | The agency decides |
|---|---|---|
| TX-1 digital-first | The fully digital flow (Singpass signing, digital payment) | Whether a legal regulation genuinely requires a physical step |
| TX-2 prerequisites | The pre-transaction info page | Eligibility criteria, fees, processing times |
| TX-7 payment/refund | Where fee + refund info is displayed | The refund policy itself |
| TX-10 failure details | The failure UI with reason/alternatives/appeal channel | Which rejection reasons policy allows disclosing |
| TX-12 outcome timeframe | Where the estimate is displayed | The actual processing SLA |

## Procedure

Work the transaction journey in order — **before → during → payment → outcome →
after**. For **setup**, build each piece. For **audit**, walk the journey as a user and
record pass / fail / not-applicable with evidence (the screen, the email, the missing
step).

### Stage 1 — Before the user starts (TX-1, TX-2, TX-7)

**1a. Fully digital, end to end (TX-1).** No printing, wet signatures, mailing, or
counter visits anywhere in the flow unless a legal regulation mandates it (get that
regulation named, in writing). Digital signature via **Sign with Singpass** where
signing is needed; digital payment (cards, PayNow) where money moves. One physical step
poisons the whole journey.

**1b. Publish the prerequisites (TX-2).** A start page before the first field:
eligibility criteria, required documents **with accepted formats and size limits**,
estimated completion time, payment modes, and all fees. A user should be able to decide
"not today" before typing anything.

**1c. Fees and refund policy up front (TX-7).** Payment amounts and the refund policy
appear on the start page *and* again on the payment page — before the user pays, never
after.

### Stage 2 — During the form (TX-3, TX-4, TX-5, TX-6)

**2a. Logical steps (TX-3).** Break long transactions into steps/sections of related
fields (SGDS Stepper pairs well). One 40-field page is a finding; so is a step whose
fields have nothing to do with each other.

**2b. Progress indicator (TX-4).** Multi-step flows show where the user is and how much
remains — named steps, current position, completed states.

**2c. Save draft (TX-5).** Long transactions get a visible save-draft affordance,
explicit "draft saved" feedback (an accessible status message), and an obvious resume
path on return. Autosave is a good supplement but the control asks for a *function the
user can see and trust*. A session timeout that destroys 30 minutes of typing is the
exact failure this control exists to prevent — pair the timeout warning with draft
preservation.

**2d. Pre-fill what the government knows (TX-6).** Behind Singpass, offer Myinfo
pre-fill; behind Corppass, Myinfo Business/EDH. Pre-filled fields stay reviewable and
(where the source permits) editable; assess accuracy/relevance per field rather than
dumping every scope you can get. The **singpass**/**corppass** skills own the actual
integration (scopes, consent, FAPI 2.0 wire protocol) — this control owns the decision
to pre-fill and the form UX around it. Don't re-ask for what you pre-filled.

### Stage 3 — Payment (TX-8, TX-11)

**3a. Never hold raw card data; let users manage what is stored (TX-8).** Store payment
methods only as **gateway tokens** (keeping you in the lightest PCI DSS scope), and give
users an obvious way to **update and remove** stored payment details, with confirmation
prompts. A saved card with no delete button is a finding. For the gateway itself,
consider the whole-of-government payment service (PaySG — pay.gov.sg) or the agency's
approved provider; confirm current onboarding at
https://www.developer.tech.gov.sg/products/.

**3b. Show the payment record (TX-11).** After payment: receipt/acknowledgement number,
date and time, what was paid for, payment method, and amount — on the success screen,
downloadable/printable, and in the acknowledgement channel.

### Stage 4 — The outcome moment (TX-9, TX-10, TX-12)

**4a. Unambiguous success or failure (TX-9).** Every transaction ends on an explicit
outcome screen — clear copy, iconography, colour (green success / red failure), never a
silent redirect. (Make it accessible: icon + text, not colour alone — dss-accessibility.)

**4b. Failures are actionable (TX-10).** Failed or rejected transactions state the
reason (within policy limits), the alternative actions, and the appeal/enquiry channel.
"An error occurred" with a dead end fails all three clauses.

**4c. Set the clock (TX-12).** If the outcome isn't immediate, show the estimated
timeframe before they start, on the success screen, and in the acknowledgement.

### Stage 5 — After submission (TX-13, TX-14, TX-15)

**5a. Acknowledgement they can keep (TX-13).** Send (email/SMS/push/in-app) and/or
allow download of an acknowledgement containing the key submission details and
reference number.

**5b. Push status updates (TX-14).** Notify on every status change — received,
processing, approved/rejected — via the user's channel.

**5c. Self-service tracking (TX-15).** An online status page keyed by reference number
(or the logged-in account): clear status labels with descriptions, estimated
completion, and any actions required of the user. The goal is that nobody has to call
the hotline to ask "where is my application".

## Audit checklist

Walk the journey; record evidence per row.

| ID | Check |
|---|---|
| TX-1 | No physical step (print/sign/mail/visit) unless a named legal regulation requires it; digital signing and payment offered |
| TX-2 | Start page lists eligibility, documents + formats, time estimate, payment modes, fees |
| TX-3 | Long transaction split into logical steps of related fields |
| TX-4 | Progress indicator shows position and remaining steps |
| TX-5 | Visible save-draft + saved feedback + easy resume; timeout doesn't destroy work |
| TX-6 | Myinfo/EDH pre-fill offered behind Singpass/Corppass; pre-filled data reviewable; nothing re-asked |
| TX-7 | Fees and refund policy visible before start and on the payment page |
| TX-8 | Stored payment details tokenised; user can update and remove them with confirmation |
| TX-9 | Explicit success/failure screen with clear cues (not colour alone) |
| TX-10 | Failure shows reason, alternatives, and appeal/enquiry channel |
| TX-11 | Post-payment: receipt number, date, items, method, amount; downloadable |
| TX-12 | Estimated outcome timeframe shown pre-start, on success, in acknowledgement |
| TX-13 | Acknowledgement sent and/or downloadable with key details |
| TX-14 | Notifications on status changes |
| TX-15 | Online status tracking with labels, timelines, required actions |

Report per control ID with pass / fail / not-applicable, the evidence, and the fix.
Where a pass depends on agency policy (refund policy, disclosure limits, SLAs), ask for
the policy value rather than inventing it.

## Related skills in this repo

- **singpass** / **corppass** — the TX-6 pre-fill integration itself: Myinfo (persons)
  and Myinfo Business/EDH (entities), consent, scopes, and the FAPI 2.0 flow. This
  skill decides *to* pre-fill and shapes the form; those skills own the wire. Use
  **singpass-legacy**/**corppass-legacy** for pre-FAPI integrations.
- **dss-accessibility** — the WCAG-derived DSS controls the same forms must meet:
  labels, error identification, focus, status messages (a "draft saved" toast is a WR
  status message), timeout handling. Load both when building any TX flow.
- **sg-service-shell** — the TL/BD/PR shell around the transaction: banner, footer,
  WOGAA, mandatory/optional field indication (BD-7), logged-in identity (BD-8), contact
  channels (BD-9), availability. TX assumes that shell exists.
- **ssp-navigator** — whether a DSS profile applies at all and at which level each TX
  control sits for this service.
- **data-protection** / **secure-coding-as** — where payment records live (residency,
  encryption, retention) and the CSRF/session/validation hardening of the form
  handlers. A payments flow needs both; neither is TX scope.

# Transactions and Payments (TX) — full control text

Embedded from **https://info.standards.tech.gov.sg/control-catalog/dss/tx/ as of
2026-07-23** (page last updated 5 March 2026). The standards iterate actively; verify
against the live page for any compliance-critical decision. Each control publishes a
Control Statement, Recommendations, and a Rationale.

**Family scope:** *Controls to enhance and simplify the payments and transactions
experience.*

The family has **15 controls (TX-1..TX-15)**, part of the Digital Service Standards
(DSS) catalog. None carry agency-defined parameters. None sit in the DSS Level 0 set
(that is TL-3, TL-5, PR-2) — check the selected DSS profile for each control's level.

---

## TX-1 — Digital-First Approach

- **Control Statement:** Design digital transactions to be fully digital from start to
  finish, unless otherwise stated in legal regulations.
- **Recommendations:** Avoid requiring physical signatures, paper approvals, or
  in-person submissions. Implement digital signature solutions like Singpass and enable
  common payment methods including credit cards and PayNow.
- **Rationale:** A transaction that is not fully digital diminishes the convenience of
  being able to transact anywhere and anytime.

## TX-2 — Transaction Prerequisites

- **Control Statement:** Provide all information required to complete the transaction
  before the start of the transaction.
- **Recommendations:** Include prerequisites/eligibility criteria, estimated completion
  timeframes, required documents with accepted formats, and available payment modes and
  costs.
- **Rationale:** Knowing the information and documents required allows end users to
  assess their readiness and ability to complete the transaction before committing to
  it.

## TX-3 — Break Down Long Transactions

- **Control Statement:** Break long transactions down into logical steps or sections.
- **Recommendations:** Group related input fields together to reduce cognitive load and
  streamline data entry.
- **Rationale:** Logical structuring makes multistep tasks feel more manageable.

## TX-4 — Progress Indicators

- **Control Statement:** Provide progress indicators for multi-step transactions.
- **Recommendations:** Use a clear and intuitive design to visually convey the process
  and progress.
- **Rationale:** Progress indicators help users estimate task duration and track their
  position within transaction flows.

## TX-5 — Save Draft Function

- **Control Statement:** Provide a save draft function for long transactions.
- **Recommendations:** Ensure the option to save drafts is clearly visible and
  accessible. Provide clear feedback when a draft has been saved and provide easy
  access to retrieve and resume the draft.
- **Rationale:** Draft functionality provides flexibility for completing transactions
  incrementally and protects against data loss.

## TX-6 — Pre-fill Data

- **Control Statement:** Pre-fill forms with known data where applicable; where
  Singpass/Corppass is used, provide the option to pre-fill personal or business data
  with Myinfo and Enterprise Data Hub (EDH).
- **Recommendations:** Properly assess accuracy and relevance of any pre-filled data
  before implementation.
- **Rationale:** Pre-filled data saves end users time and minimises the risk of errors
  from manual input.

## TX-7 — Payment and Refund

- **Control Statement:** Provide payment and refund information before payment is made.
- **Recommendations:** Ensure this information is easily accessible on the payment page
  and before the start of the transaction.
- **Rationale:** Transparency regarding payment details provides reassurance and
  prevents rectification difficulties.

## TX-8 — Managing Stored Payment Details

- **Control Statement:** Allow updating and removal of stored payment details in all
  digital services involving payments.
- **Recommendations:** Provide clear instructions and confirmation prompts to guide end
  users through the process to minimise errors.
- **Rationale:** Users gain control over sensitive payment information through
  management capabilities.

## TX-9 — Success or Failure Message

- **Control Statement:** Display a success or failure message at the end of the
  transaction.
- **Recommendations:** Use familiar and unambiguous visual cues, such as clear copy,
  iconography, and colour (e.g. green for success, red for failure) to enhance
  immediate recognition.
- **Rationale:** Clear feedback on the outcome of the transaction reassures end users.

## TX-10 — Failed Transaction Details

- **Control Statement:** Provide the following details for failed transactions:
  a) clear reasons for failure or rejection (unless limited by policy considerations);
  b) alternative actions; c) channels for appeals or further enquiries.
- **Recommendations:** Explanations should be clear and detailed within policy
  constraints.
- **Rationale:** Specific, actionable information enables users to understand failure
  causes and resolve issues quickly.

## TX-11 — Payment Details

- **Control Statement:** Display payment details once payment has been completed.
- **Recommendations:** Important details include acknowledgement codes/receipt numbers,
  transaction dates, product/service listings, chosen payment mechanisms, and amounts
  paid. Show them on success screens or via acknowledgement channels, with
  download/print options available.
- **Rationale:** Post-transaction acknowledgement serves as a secondary check and can
  potentially reduce the consequences of errors.

## TX-12 — Transaction Outcome

- **Control Statement:** Provide an estimated timeframe for the transaction outcome
  when it is not immediately available.
- **Recommendations:** Timeline information appears before transaction initiation, on
  success screens, and/or in acknowledgements or receipts.
- **Rationale:** Timeline information reduces uncertainty and manages expectations
  regarding decision timing.

## TX-13 — Post-transaction Acknowledgement

- **Control Statement:** Send and/or allow download of an acknowledgement after a
  successful transaction.
- **Recommendations:** Send the acknowledgement via channels like SMS, email, push
  notification, or in-app notifications. Ensure it includes key details about the
  submission.
- **Rationale:** Retained receipts provide reassurance that submissions were received
  successfully.

## TX-14 — Transaction Status Updates

- **Control Statement:** Provide notifications when there are updates to transaction
  status.
- **Recommendations:** Use SMS, email, push notifications, or in-app messaging.
- **Rationale:** Proactive notifications reduce manual status checking and enable
  timely follow-ups.

## TX-15 — Tracking Transaction Status

- **Control Statement:** Enable online tracking of transaction status.
- **Recommendations:** Provide clear status labels and descriptions, estimated
  completion timelines, and any required end-user actions.
- **Rationale:** Online tracking increases transparency and builds trust while reducing
  customer support burden through self-service.

---

## Cross-family notes

- **TX-6 pre-fill data** comes from Myinfo (Singpass, individuals) or Myinfo
  Business/EDH (Corppass, entities) — the **singpass**/**corppass** skills own those
  integrations end to end; this family owns the decision to pre-fill and the form UX
  around it.
- **The forms and flows themselves** must meet the WCAG-derived DSS accessibility
  controls (WP/WO/WU/WR — **dss-accessibility**): labels, error identification, focus
  order, status messages, no cognitive-only challenges.
- **The page shell** the transaction lives in (banner, footer, WOGAA, field
  indication BD-7, logged-in identity BD-8, contact channels BD-9) is
  **sg-service-shell**.
- **Payment-record storage** (residency, encryption, retention) is the DP family
  (**data-protection**); CSRF/session/input-validation hardening of the form handlers
  is AS (**secure-coding-as**).

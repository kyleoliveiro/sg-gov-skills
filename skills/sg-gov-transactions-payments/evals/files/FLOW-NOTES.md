# Grant application flow — product team notes for the DSS review

How the flow behaves today, end to end.

## Entry and form

- The homepage "Apply now" button links straight to `/apply` (the form in
  `apply.html`). There is no page listing eligibility criteria, required documents,
  processing time, or fees before the form. The S$20 administrative fee is only
  revealed on the payment step, after the form has been filled and submitted.
- Applicants sign in with **Singpass** before reaching the form, but every field —
  name, NRIC, date of birth, address, mobile, email — must be typed manually. We never
  hooked up Myinfo.
- The whole application is one page: 20+ fields across personal, stall, financial,
  utilisation, declaration, and payment sections. No steps, no progress indicator.
- Sessions expire 15 minutes after login and the server keeps no form state. There is
  no save-draft. Several applicants have reported losing everything at the
  file-upload stage and starting over.

## Payment

- Card is the only payment method (no PayNow). Card number, expiry, and CVC are
  collected on the same page and stored raw in our `saved_cards` table when "save this
  card" is ticked (it is ticked by default). There is no screen to view, update, or
  remove a saved card.
- The refund policy: the fee is non-refundable *except* when the application is
  rejected on eligibility grounds, in which case finance refunds it manually. This is
  written nowhere on the site.

## After submission

- On success the server 302-redirects to the agency homepage. No success screen, no
  receipt number, no display of what was paid. Nothing is emailed — no
  acknowledgement, no reference number, no download.
- On payment failure users get a static "Error 500 — transaction failed" page with no
  reason, no retry path, and no contact or appeal channel.
- Processing takes 4–6 weeks internally, but no timeframe is communicated anywhere —
  not before applying, not after.
- There are no status notifications and no online status page. Applicants who want an
  update call the hotline; it is our top call driver. The final decision letter also
  requires the applicant to **print, sign, and mail back** an acceptance form before
  funds are disbursed.

## Ask

Review this flow against the DSS Transactions & Payments requirements. Tell us
pass/fail per requirement, what to build to fix each failure, and which fixes need an
agency policy decision rather than engineering.

# Public service operations posture

The Licensing Services portal is already registered in WOGAA. The tracking code
is present on every page and Sentiments is enabled.

The service team has documented the following operating practices:

- There is no recurring review of whether the service remains relevant or is
  being used. Several old campaign microsites remain online because nobody owns
  a retirement decision.
- The portal is deliberately available only from 8:00 am to 6:00 pm on
  weekdays, matching the contact-centre hours. The service itself has no
  dependency that prevents it from operating outside those hours. Its homepage
  does not state the operating hours.
- Planned maintenance is announced on the morning it begins with the message
  "Maintenance later today". The notice does not state the start time, expected
  duration, reason, or affected features.
- Broken links are fixed after users report them to the contact centre. There is
  no automated scan, owner, remediation target, or record of when links were
  detected and closed.
- Developers manually check the latest Chrome on their laptops before a release.
  Browser usage statistics are not reviewed, and Safari, Edge, Firefox, mobile
  browsers, and prior major versions are not part of testing.
- The team considers a page fast when it "feels responsive". It has no approved
  load-time target, synthetic or real-user measurement, alert, or CI performance
  budget.

The agency's tailored System Security Plan currently leaves the following
parameters unset: service-review cadence, scheduled-downtime notice period,
broken-link remediation period, number of supported browsers, and maximum page
load time.

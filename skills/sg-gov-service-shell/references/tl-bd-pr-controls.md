# DSS control text: Trust & Legitimacy (TL), Baseline Design Practices (BD), Performance & Reliability (PR)

Embedded from the Digital Service Standards (DSS) control catalog at
info.standards.tech.gov.sg as of **2026-07-16**. The site is authoritative and actively
iterating — verify against the live pages before making compliance-critical decisions:

- TL: https://info.standards.tech.gov.sg/control-catalog/dss/tl/
- BD: https://info.standards.tech.gov.sg/control-catalog/dss/bd/
- PR: https://info.standards.tech.gov.sg/control-catalog/dss/pr/

**Levels** shown are profile membership in the two DSS SSP profiles — **DSS (Others)**
(<1M visits/year per WOGAA) and **DSS (High Impact)** (≥1M visits/year). Level 0 =
mandatory, no deviation. Level 1 = default; deviations need agency IDSC/CIO/CISO approval
documented in a custom SSP. Level 2 = best practice, adopt risk-based. No TL/BD/PR control
changes level between the two profiles (the High Impact promotions are all WCAG controls).

---

## TL — Trust and Legitimacy (6 controls)

### TL-1: Official Government Domain — Level 1 (Others) / Level 1 (High Impact)

**Control Statement:** Use .gov.sg domain for web-based digital services. Education
Institutions may use .edu.sg domain.

**Control Recommendations:**
- Register .gov.sg and .edu.sg domain names on the Whole of Government Domain Name Server
  (DNS) portal on the IT Service Management (ITSM) portal.

**Risk Statement:** Enables citizens to recognise authentic government sources, reducing
fraud and phishing risks.

Related cyber control: IS-11 mandates GovTech as the sole registrar for .gov.sg/.edu.sg
domains (Level 0 in every cyber SSP).

### TL-2: Agency or Initiative Logo — Level 1 / Level 1

**Control Statement:** Display the agency/initiative logo on the top left of every page of
web-based digital services; Hyperlink the logo to the homepage.

**Control Recommendations:**
- The logo should render clearly without distortion or pixellation to maintain trust and
  reinforce brand reputation.

**Risk Statement:** Offers assurance regarding service legitimacy.

### TL-3: Official Government Banner — **Level 0 / Level 0 (MANDATORY)**

**Control Statement:** Display the Official Government Banner on every page of web-based
.gov.sg digital services.

**Control Recommendations:**
- The Official Government banner must be the topmost component of the web service.
- Use the Singapore Government Design System (SGDS) "Official Government Banner"
  component. (In SGDS the component is named **Masthead** — `<sgds-masthead>`.)
- Not required for SaaS and COTS products that do not allow customisation.

**Risk Statement:** Enables end-user recognition of authentic government services,
reducing fraud risks.

### TL-4: Official Government Footer — Level 1 / Level 1

**Control Statement:** Adopt the Official Global Footer on every page of .gov.sg
web-based services.

**Control Recommendations:**
- Use the basic footer provided by SGDS containing, in order: Contact/Contact Us,
  Feedback, FAQ, Sitemap, Report Vulnerability, Privacy Statement, Terms of Use.
- Copyright notice: "© [current year in YYYY], Government of Singapore".
- Statutory boards may substitute the agency name in the copyright notice.
- Not required for transactional service pages.

**Risk Statement:** Ensures consistency across government services with consistently
placed utility links.

### TL-5: Mobile App Ownership and Distribution — **Level 0 / Level 0 (MANDATORY)**

**Control Statement:** Distribute government mobile applications through official app
stores and retain IP rights.

**Control Recommendations:**
- Retain full intellectual property ownership of the mobile application.
- Distribute only via the Apple App Store, Google Play Store, or Huawei AppGallery.

**Risk Statement:** Prevents unauthorised app versions and provides a legal basis for
removal requests.

### TL-6: Application Store Listings — Level 1 / Level 1

**Control Statement:** Ensure that the agency name is used as the application store
developer account name when publishing mobile applications.

**Control Recommendations:**
- Use the full agency name.

**Risk Statement:** Clear developer naming reassures users regarding app legitimacy.

---

## BD — Baseline Design Practices (9 controls)

### BD-1: Responsive Web Design — Level 1 / Level 1

**Control Statement:** Adopt Responsive Web Design for web-based digital services. If
specific content is deemed unsuitable for mobile devices, disable mobile device access,
and clearly explain why the content or service is disabled and how it can be accessed.

**Control Recommendations:**
- Implement techniques to optimise services across various devices and screen sizes.
- Test and resolve layout or functionality issues.

**Risk Statement:** Mobile devices generate significant web traffic, and responsive
design provides optimised experiences across different screen sizes.

### BD-2: Site Search — Level 1 / Level 1

**Control Statement:** Provide a site search function for multi-page websites.

**Control Recommendations:**
- Implement a search function like SearchSG.
- Ensure the search is easily accessible and discoverable.
- Review search analytics regularly to optimise based on user behaviour.

**Not required for:**
- Mobile applications
- Transactional services
- Websites where search is the primary service (e.g. CDCGoWhere)

**Risk Statement:** Search offers an effective alternative for users who know what they
seek.

### BD-3: Support Multiple Languages — Level 2 / Level 2

**Control Statement:** Provide content in multiple languages to accommodate language
preferences.

**Control Recommendations:**
- Implement language selection at key entry points like login or homepage, or select
  based on device settings.
- Enable easy switching between languages at any time.

**Risk Statement:** Language selection improves usability and inclusivity for broader
access and understanding.

### BD-4: Clear and Concise Content — Level 2 / Level 2

**Control Statement:** Write in a clear and concise manner that is easy to read and
understand; Choose simple words that most people can understand.

**Control Recommendations:**
- Conduct user testing to validate content clarity for target audiences.
- Use readability formulas like Flesch Reading Ease or Flesch-Kincaid grade level to
  identify simplification areas.

**Risk Statement:** Simple writing enables understanding across diverse backgrounds and
language proficiencies.

### BD-5: Search Engine Optimisation — Level 2 / Level 2

**Control Statement:** Implement Search Engine Optimisation (SEO) best practices to
improve website search engine rankings and results.

**Control Recommendations:**
- Complete all metadata fields and optimise meta tags.
- Verify that search engine results pages display informative, relevant titles and
  abstracts.

**Not required for:**
- Services restricted to specific audiences accessed directly
- Experimental or beta services

**Risk Statement:** SEO enhances content findability and reach by improving crawlability
and search listing optimisation.

### BD-6: Consistent UI Design — Level 1 / Level 1

**Control Statement:** Use a design system or style guide to maintain a consistent user
interface design throughout the entire service.

**Control Recommendations:**
- Adopt a design system such as the Singapore Government Design System (SGDS).

**Risk Statement:** Consistency improves usability by helping users learn interface
patterns. Design systems promote consistency and scalability through reusable components.

### BD-7: Mandatory and Optional Fields — Level 1 / Level 1

**Control Statement:** Indicate if input fields are mandatory or optional.

**Control Recommendations:**
- Use consistent visual indicators like asterisks (*) for mandatory fields.
- Label optional fields when most fields are mandatory.
- Ensure indicators are screen reader accessible.

**Not required for:** Login pages requesting a unique identifier and password.

**Risk Statement:** Clear indicators reduce completion time and increase submission rates
by clarifying required effort.

### BD-8: Log-in Indication — Level 1 / Level 1

**Control Statement:** Prominently display the name or identifier of the individual
associated with the account after login.

**Control Recommendations:**
- Display the user name or identifier clearly in accessible locations like headers or
  top-page sections.

**Risk Statement:** Confirms users are logged into the correct account, particularly
important for shared devices.

### BD-9: Contact Channels — Level 1 / Level 1

**Control Statement:** Provide at least one contact channel for help or assistance.

**Control Recommendations:**
- Implement contact channels such as phone numbers, email, contact forms, or live chat.

**Risk Statement:** Enables users to request help or resolve issues, reinforcing
confidence through accessible support methods.

---

## PR — Performance and Reliability (7 controls)

### PR-1: Digital Service Review — Level 1 / Level 1

**Control Statement:** Review digital services every [insert: param, pr-1_prm_1] day(s).
Shut down services that are no longer needed or fail to meet their intended objectives.

**Control Recommendations:**
- Review factors such as relevance, importance and usage rates of the service.
- Ensure that there is a process to review each digital service such as websites and
  mobile apps periodically.

**Risk Statement:** Services that are not effective incur unnecessary costs for the
organisation.

**Parameters:** `pr-1_prm_1` (time period in days) — the time period in days within which
a digital service review must be conducted. Agency-defined in the SSP.

### PR-2: Digital Service Registration — **Level 0 / Level 0 (MANDATORY)**

**Control Statement:** Register and implement WOGAA on all public facing digital services.

**Control Recommendations:**
- Registration of all public facing digital services.
- Implementation of the WOGAA tracking code.
- Enabling Sentiments.
- Only registration is required for SaaS and COTS products that do not allow
  customisation and the implementation of the tracking code and sentiments.

**Risk Statement:** A centralised registry and tracking of digital services across
Whole-of-Government facilitates central oversight and benchmarking. WOGAA implementation
enables analytics data and feedback collection essential to identifying issues and
continuous improvement opportunities.

Related cyber control: LM-18 also requires WOGAA in public digital services.

### PR-3: Digital Service Availability — Level 1 / Level 1

**Control Statement:** Make digital services available to users 24/7. Clearly communicate
the operational hours if a service cannot be available 24/7.

**Control Recommendations:**
- Do not limit the availability of services to specific hours unless justified by
  operational or business requirements.

**Risk Statement:** End users expect access to digital channels anytime excluding planned
and unplanned downtime.

### PR-4: Notify of Scheduled Downtime — Level 1 / Level 1

**Control Statement:** Provide notice of scheduled downtime at least
[insert: param, pr-4_prm_1] day(s) in advance.

**Control Recommendations:**
- Clearly communicate scheduled downtime using methods like maintenance banners and
  in-app notifications.
- Include date, time, duration, and reason for downtime (if applicable), and the
  feature(s) or section(s) that will be unavailable (if applicable).
- Balance between providing adequate lead time and ensuring users can remember the
  maintenance.

**Risk Statement:** Awareness of scheduled downtime minimises disruption by allowing
users to plan accordingly.

**Parameters:** `pr-4_prm_1` (time period in days) — the time period in days to provide
notice of scheduled downtime. Agency-defined in the SSP.

### PR-5: Manage Broken Links — Level 1 / Level 1

**Control Statement:** Establish processes to detect broken links, and address them
within [insert: param, pr-5_prm_1] day(s) from detection.

**Control Recommendations:**
- Use automated tools like WOGAA's broken link scanner to regularly scan for broken
  links. This applies to both internal and external links.

**Risk Statement:** Broken links affect content delivery and prevent users from
completing tasks. Services with many broken links are perceived as untrustworthy and
unreliable.

**Parameters:** `pr-5_prm_1` (time period in days) — the time period in days to address
broken links. Agency-defined in the SSP.

### PR-6: Browser Compatibility — Level 1 / Level 1

**Control Statement:** Ensure web-based services are compatible with the latest major
versions of at least [insert: param, pr-6_prm_1] widely used web browsers, based on usage
statistics.

**Control Recommendations:**
- Regularly test your service on the latest two major versions of popular browsers such
  as Chrome, Firefox, Safari, and Edge.
- Get browser usage data from analytics tools.
- Consider using browser compatibility tools like BrowserStack or LambdaTest to automate
  testing across multiple environments.

**Risk Statement:** Browser incompatibility can cause layout bugs and other functional
issues.

**Parameters:** `pr-6_prm_1` (number of browsers) — the number of web browsers.
Agency-defined in the SSP.

### PR-7: Optimise Load Times — Level 1 / Level 1

**Control Statement:** Ensure that page load time of web-based services is
[insert: param, pr-7_prm_1] second(s) or less.

**Control Recommendations:**
- Track or regularly test and optimise performance using tools like WOGAA and Google
  PageSpeed Insights.

**Risk Statement:** Long page load times frustrate users and lead to longer transaction
times and increased abandonment rates.

**Parameters:** `pr-7_prm_1` (time period in seconds) — the time period in seconds for
page load times. Agency-defined in the SSP.

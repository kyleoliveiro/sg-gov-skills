# Gen-AI (GA) controls + DP-8 — verbatim reference

Embedded from **info.standards.tech.gov.sg as of 2026-07-22**; the catalog/SSP pages
themselves were **last updated 24 March 2026**. The family scope is *securing the use of
Generative AI models and applications* — where the model runs, what data may reach it, the
provenance of self-hosted weights, input safeguards, output evaluation, and user awareness.
The standards iterate; verify anything compliance-critical against the live pages:

- GA control catalog: https://info.standards.tech.gov.sg/control-catalog/cybersecurity/ga/
- Gen-AI SSP overlay: https://info.standards.tech.gov.sg/ssp/gen-ai/

The Gen-AI SSP overlay is **9 controls**: GA-1 through GA-8, plus **DP-8** (a Data
Protection control that ships with the overlay). Level assignments below are from the
Gen-AI SSP; the project's own SSP is authoritative for which level applies.

---

## Data classification background (why GA-1/GA-2/GA-4 exist)

The Singapore Government classifies data as OFFICIAL (OPEN / CLOSED) and by sensitivity
RESTRICTED, CONFIDENTIAL, SECRET, plus the SENSITIVITY tiers NORMAL / SENSITIVE NORMAL /
SENSITIVE HIGH. GA-1/GA-2 cap the classification of data you may send to a GenAI API by
where the serving model is hosted. GA-4 caps what a self-hosted model's environment may
hold. Treat these as hard routing constraints, not guidance.

---

## GA-1: Overseas-hosted GenAI API services

**Level:** 0

**Statement:** "Use only up to RESTRICTED and SENSITIVE NORMAL data with GenAI API
services served by models hosted overseas."

**Recommendations:** Verify data classification with the data owner before use. Ensure API
access occurs only through environments authorized for up to RESTRICTED and SENSITIVE
NORMAL data.

**Risk addressed:** Primary data faces heightened legal, privacy, and exfiltration risks
during transit and processing by overseas-hosted GenAI services.

**Parameters:** None.

---

## GA-2: Singapore-hosted GenAI API services

**Level:** 0

**Statement:** "Use only up to CONFIDENTIAL and SENSITIVE HIGH data with GenAI API
services served by models hosted in Singapore."

**Recommendations:** Verify data classification with the data owner. Ensure API access
occurs only through environments authorized for up to CONFIDENTIAL and SENSITIVE HIGH data.
Check for cross-region inferencing or overseas-processing conditions in the provider's
documentation.

**Risk addressed:** Primary data carries legal, privacy, and exfiltration risks during
transit and processing by Singapore-hosted services.

**Parameters:** None.

---

## GA-3: Non-logging and non-training agreement

**Level:** 0

**Statement:** "Obtain a legally-binding commitment from the GenAI API service provider
that states that they do not log, store, nor retain input and output data, and that no
input and output data are used for training GenAI models. Prompt caching (temporarily
storing responses to frequently used prompts) is exempt provided cache TTL ≤ 24 hours."

**Recommendations:** Ensure the agreement covers all endpoints, parameters, outputs, and
models. **GCC 2.0 GenAI API services satisfy this control** — using them removes the need
to negotiate a bespoke provider agreement.

**Risk addressed:** Without binding agreements, providers may access classified data
through automated or manual checks, or use the data to train GenAI models.

**Parameters:** None.

---

## GA-4: Data classification for self-hosted GenAI models

**Level:** 0

**Statement:** "Ensure that GenAI models are hosted in an environment that can host the
highest data classification of government data contained in the system that the model is
deployed in."

**Recommendations:** Refer to the relevant IM8 SSPs for the controls required before
hosting government data of a given classification.

**Risk addressed:** Hosting models with data more classified than the environment permits
may create cybersecurity vulnerabilities enabling classified-data exfiltration.

**Parameters:** None.

---

## GA-5: GenAI model formats and loaders

**Level:** 1

**Statement:** "Use approved formats (such as [parameter: ga-5_prm_1]) when using any
open-weights GenAI models. Use approved loaders (such as [parameter: ga-5_prm_2]) to load
open-weights GenAI models."

**Recommendations:** Update GenAI model loaders frequently to hinder attacks.

**Risk addressed:** Insecure formats and loaders enable arbitrary code execution,
potentially allowing unauthorized system access.

**Parameters:**
- **ga-5_prm_1** (list of model formats) — the approved model formats (agency-defined).
- **ga-5_prm_2** (list of loaders) — the approved model loaders (agency-defined).

---

## GA-6: File upload safeguards

**Level:** 1

**Statement:** "Implement file upload safeguards if file uploads are enabled in the
system."

**Recommendations:** Examples include deploying Data Loss Protection (DLP) tools,
disabling bulk uploads, or requiring users to confirm the data classification before
uploading large files.

**Risk addressed:** File uploads create risks of sensitive-data leaks through model prompts
and of exceeding the permitted data classification level (via bulk or misclassified
uploads).

**Parameters:** None.

---

## GA-7: Evaluation of GenAI accuracy, safety, and output quality

**Level:** 1

**Statement:** "Test the accuracy, safety, and quality of the GenAI application's outputs,
with clearly defined metrics, test scenarios, and criteria."

**Recommendations:** Determine adequate accuracy/safety/quality levels for the use case.
Develop tailored tests matching the application's risk profile. Document the approach and
monitor results after model updates or configuration changes.

**Risk addressed:** Failure to evaluate models, prompts, and dependencies results in
low-quality or unsafe outputs, especially after updates.

**Parameters:** None.

---

## GA-8: Inform users about GenAI risks and limitations

**Level:** 1

**Statement:** "Require users to explicitly acknowledge the risk of inaccurate or
fabricated outputs (hallucinations), such as selecting a checkbox or clicking on an 'I
Agree' button, before the application can be accessed."

**Recommendations:** Include risk clauses in the Terms of Use. Indicate hallucination risks
prominently in the interface. Provide educational materials emphasizing responsible use and
best practices.

**Risk addressed:** Uninformed users may over-trust inaccurate model-generated outputs.

**Parameters:** None.

---

## DP-8: Data classification disclosure (ships with the Gen-AI overlay)

**Level:** 1

**Statement:** Agencies must specify the maximum permitted data classification for inputs,
in the user interface and in guides, for internal applications.

**Recommendations:** Display clear messaging at or near input fields indicating the data
classifications allowed.

**Risk addressed:** Users unaware of classification limits may submit sensitive data the
system is not authorized to process, causing breaches and legal violations.

**Parameters:** None.

---

## Cross-family notes (what is NOT a GA control)

- **Prompt injection / jailbreak defense** is *not* a separately named GA control. Its
  home in the catalog is **GA-7 (safety testing)** plus general **Application Security
  (AS)** — input handling, output encoding, and least-privilege tool/agent design. Do not
  cite a non-existent "GA prompt-injection control"; test for it under GA-7 and fix it as
  app security (secure-coding-as).
- **The API key / provider credential** is an application secret — **AS-8 secrets
  management (secure-coding-as)**, not a GA control. GA-3 governs the provider's *contract*,
  not how you store the key.
- **Which SSP applies and whether the Gen-AI overlay is in scope** is selection-time work
  owned by **ssp-navigator**. This family is implementation-time: given the overlay
  applies, build and audit the GenAI feature against these 9 controls.
- **Self-hosting the model in a container** brings the **Container Security (CS)** family
  into play for the serving image and cluster; GA-4 is about the environment's data
  classification authorization, CS is about hardening the container itself.

# DR plan, BCP, and exercise templates (BR-4, BR-5, BR-6)

Skeletons for the planning-and-exercise controls. Fill them with the agency's real
values — RTO/RPO, owners, and cadences are business decisions recorded in the SSP and
risk assessment, not defaults to invent. CSA's Cybersecurity Toolkit for IT Teams
(https://www.csa.gov.sg/resources/business/cybersecurity-toolkits) is the
control-recommended template source for the BCP.

## Disaster Recovery Plan skeleton (BR-4)

```markdown
# Disaster Recovery Plan — <system name>
Version / owner / approved by / last exercised: <...>

## 1. Objectives
- RTO: <hours — from business requirements & risk assessment>
- RPO: <minutes/hours — ties directly to br-1_prm_1 backup frequency>
- Critical functions in scope, in priority order: <...>

## 2. Roles
| Role | Primary | Deputy | Contact |
|---|---|---|---|
| Incident commander | | | |
| Technical recovery lead | | | |
| Comms lead (users/mgmt/GovTech-agency stakeholders) | | | |
| Data owner (restore authorisation) | | | |

## 3. Scenarios covered
AZ failure · region-level CSP disruption · data corruption/ransomware ·
accidental deletion · critical dependency outage (auth provider, payment gateway)

## 4. Recovery procedures (per scenario)
Step-by-step, executable by someone who didn't write them:
detection & declaration criteria → failover/restore steps (commands, consoles,
runbook links) → data restore from which backup tier → validation checks →
fallback/rollback → return-to-normal.

## 5. Communications
Internal escalation chain; user-facing notice path (maintenance banner per DSS
PR-4); reporting obligations (agency ISO/CISO, GCSOC where security-caused).

## 6. Test log
| Date | Scenario | RTO met? | RPO met? | Gaps → actions |
```

## Business Continuity Plan skeleton (BR-5)

The BCP is broader than DR: it keeps the *business function* running while IT
recovers.

```markdown
# Business Continuity Plan — <service/function>
1. Business impact analysis: functions, tolerable outage per function, dependencies
   (systems, vendors, people).
2. Continuity strategies per function: manual/degraded-mode workarounds (e.g.
   counter service, hotline scripts, deferred processing), minimum staffing.
3. Activation: who declares, thresholds, communication tree.
4. Recovery coordination: link to the DR plan for the systems layer.
5. Stand-down and post-incident review.
```

## Exercise formats and cadence (BR-2, BR-6)

| Format | Verifies | Effort |
|---|---|---|
| Backup restore drill (BR-2) | A real restore of data **and services** completes, and RTO/RPO are met — not just that snapshots exist | Low–medium |
| Checklist walkthrough (BR-6) | Plan currency: contacts, runbook links, access still valid | Low |
| Tabletop exercise (BR-6) | Roles and decisions under a narrated scenario | Medium |
| Simulation / game-day (BR-6, strongest) | Actual failover in a non-prod or DR environment; surprises surface here | High |

Run recovery testing every `br-2_prm_1` days and a BC exercise every `br-6_prm_1`
days (SSP values). Every exercise produces: date, participants, scenario, whether
RTO/RPO were met, gaps found, and remediation actions with owners — that record *is*
the audit evidence.

## Load-test harness notes (RS-3)

- Test a **replica of production** (same instance sizes, same autoscaling policies,
  production-like data volumes), never production itself without explicit approval.
- Model **real traffic**: replay sanitised access-log distributions or script the top
  user journeys (k6, Locust, Gatling, Artillery); include the spike shape you actually
  fear (campaign launch, results day, month-end).
- Pass criteria tie to the SLOs: p95/p99 latency, error rate, and autoscaling
  behaviour (did scale-out happen before saturation? did scale-in flap?).
- Record results against `rs-3_prm_1` cadence; regressions feed capacity planning and
  RS-2 policy tuning.

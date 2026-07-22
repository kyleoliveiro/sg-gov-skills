# sg-gov-skills

Agent skills for developers building tech projects for **Singapore government agencies**.

Delivering software inside government is its own discipline. The ICT&SS Policy Reform (IM8's successor) and its System Security Plans, Singpass and MyInfo integrations, FormSG pipelines, the Singapore Government Design System (SGDS), WCAG 2.2 accessibility under the Digital Service Standards, PDPA obligations, VAPT, and GeBIZ procurement all shape how you build.

These skills are small, composable, and adaptable so delivery teams can plug them into their agent and get moving. They work with any model. Fork them, adapt them, make them your own.

**Six skills, each with its own eval suite:** figure out which System Security Plan applies, write and audit code against the security controls, harden your CI/CD pipeline, lock down your containers, meet the WCAG 2.2 accessibility bar, and stand up the mandatory service shell. Loading the relevant skill lifts assertion pass rates from as low as 22% to 100% on the benchmark tasks below.

## Installation

Install with the [`skills` CLI](https://github.com/vercel-labs/skills):

```sh
# Install all skills in this repo
npx skills add kyleoliveiro/sg-gov-skills

# Or pick specific skills
npx skills add kyleoliveiro/sg-gov-skills -s <skill-name>
```

The CLI installs into `.agents/skills/` and symlinks them into the agent directories you choose (Claude Code, Cursor, Codex, and others).

## Skills

| Skill | Description |
| ----- | ----------- |
| [ssp-navigator](skills/ssp-navigator/) | Determine which System Security Plan(s) apply under the ICT&SS Policy Reform (IM8's successor), including the Gen-AI overlay and DSS profiles, and emit the Level 0/1/2 control baseline and lifecycle steps. |
| [secure-coding-as](skills/secure-coding-as/) | Write and review application code against the Application Security (AS-1..15) and Cryptography/Key Management (CK-1..4) controls: input validation, parameterised queries, password hashing, secrets, CSP/HSTS, uploads, error hygiene. |
| [secure-pipeline](skills/secure-pipeline/) | Set up or audit repos and CI/CD against the Secure Development (SD-1..10) and Software Supply Chain (SC-1..9) controls, with GitHub/GitLab recipes and open-source fallbacks. |
| [container-security](skills/container-security/) | Build, scan, and run containers against the Container Security (CS-1..11) controls: digest-pinned minimal base images, non-root users, runtime secrets, read-only root filesystems, image scanning, private registries, and Kubernetes runtime hardening. |
| [dss-accessibility](skills/dss-accessibility/) | Build and review frontend code against the 53 WCAG-2.2-derived DSS accessibility controls (WP/WO/WU/WR), with SG-specific Others vs High-Impact leveling and testing workflow. |
| [sg-service-shell](skills/sg-service-shell/) | The mandatory "shell" every SG government public digital service needs before feature work: Official Government Banner (SGDS Masthead), WOGAA, official footer, .gov.sg domain, and the rest of the DSS TL/BD/PR controls. |

Each skill lives in [`skills/`](skills/) as a folder with a `SKILL.md` entry point.

## Benchmarks

Every skill ships with an eval suite under `skills/<skill>/evals/`. Each eval is a realistic delivery task: scaffold a portal shell, audit a seeded service, build authenticated endpoints. Each is graded against objective assertions ("every input has a programmatic label", "secrets are read from the environment, never hardcoded", "the Gen-AI overlay controls are emitted"). We run every task twice on the same model, once with the skill and once without, then score the fraction of assertions met.

| Skill | Scenarios | Assertions | With skill | Without skill | Lift |
| ----- | :-------: | :--------: | :--------: | :-----------: | :--: |
| [ssp-navigator](skills/ssp-navigator/) | 2 | 18 | **100%** | 22% | +78 pts |
| [secure-coding-as](skills/secure-coding-as/) | 2 | 19 | **100%** | 70% | +30 pts |
| [secure-pipeline](skills/secure-pipeline/) | 2 | 21 | **100%** | 68% | +32 pts |
| [container-security](skills/container-security/) | 2 | 21 | **100%** | 73% | +27 pts |
| [dss-accessibility](skills/dss-accessibility/) | 3 | 27 | **100%** | 83% | +17 pts |
| [sg-service-shell](skills/sg-service-shell/) | 2 | 19 | **100%** | 36% | +64 pts |

The lift is largest where the requirement is hard to guess without knowing the policy: which System Security Plan applies, or that a public service needs the Official Government Banner and WOGAA before feature work. Accessibility shows the smallest gap because a capable model already reaches for common WCAG patterns unprompted; the skill's job there is closing the last mile (control IDs, live-region etiquette, a humane session-expiry state).

<details>
<summary>Per-scenario breakdown</summary>

| Skill | Scenario | Assertions | With skill | Without skill |
| ----- | -------- | :--------: | :--------: | :-----------: |
| ssp-navigator | stacked-genai-service | 10 | 100% | 20% |
| ssp-navigator | cii-migration-gaps | 8 | 100% | 25% |
| secure-coding-as | audit-seeded-service | 8 | 100% | 75% |
| secure-coding-as | build-auth-endpoints | 11 | 100% | 64% |
| secure-pipeline | audit-seeded-pipeline | 9 | 100% | 78% |
| secure-pipeline | setup-github-repo | 12 | 100% | 58% |
| container-security | audit-seeded-containers | 10 | 100% | 77% |
| container-security | harden-container-build | 11 | 100% | 70% |
| dss-accessibility | feedback-form-build | 10 | 100% | 90% |
| dss-accessibility | audit-seeded-page | 8 | 100% | 75% |
| dss-accessibility | timeout-modal | 9 | 100% | 85% |
| sg-service-shell | scaffold-portal-shell | 10 | 100% | 40% |
| sg-service-shell | review-agency-homepage | 9 | 100% | 33% |

</details>

*Methodology: scores are the mean pass rate over 3 runs per configuration. Each scenario reflects its most recent benchmark. Three skills had a follow-up iteration that re-ran a single eval after a fix, and those latest results are the ones shown. "Without skill" is the same model on the same prompt with no skill loaded. Numbers will vary by model; treat them as directional, not a leaderboard.*

## Repository layout

```
skills/           Published skills — one folder per skill, each with a SKILL.md
skills-lock.json  Lockfile for skills installed locally for authoring (skill-creator, humanizer)
.agents/skills/   Locally installed authoring skills (gitignored; restore with `npx skills experimental_install`)
```

## Contributing

See [`skills/README.md`](skills/README.md) for authoring conventions. In short: one folder per skill, kebab-case name, a `SKILL.md` with `name` and `description` frontmatter, and supporting files (`references/`, `scripts/`, `assets/`) only when they earn their place.

## Sources

The control text embedded in these skills is transcribed from the public ICT&SS control catalog and related standards published at [info.standards.tech.gov.sg](https://info.standards.tech.gov.sg/), as of the dates noted in each skill's `SKILL.md`. That site is authoritative and the standards iterate, so verify against the live pages for anything compliance-critical. Each skill links the specific catalog pages it draws from.

## Disclaimer

These skills are provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.

This is an unofficial, community-maintained resource. It is not affiliated with, endorsed by, or published by GovTech, the Singapore Government, or any of its agencies. Nothing here is legal, security, or compliance advice, and installing a skill does not by itself make a system compliant with the ICT&SS Policy Reform, the Digital Service Standards, PDPA, or any other requirement. You are responsible for verifying every control against the authoritative source and your project's System Security Plan.

To the maximum extent permitted by law, the authors and contributors accept no liability for any claim, damages, or other loss arising from the use of this repository. See [LICENSE](LICENSE) for the full terms.

## License

[MIT](LICENSE)

# sg-gov-skills

Agent skills for developers building tech projects for **Singapore government agencies**.

Delivering software inside government is its own discipline — the ICT&SS Policy Reform (IM8's successor) and its System Security Plans, Singpass and MyInfo integrations, FormSG pipelines, the Singapore Government Design System (SGDS), WCAG 2.2 accessibility under the Digital Service Standards, PDPA obligations, VAPT, and GeBIZ procurement all shape how you build.

These skills are small, composable, and adaptable so delivery teams can plug them into their agent and get moving. They work with any model. Fork them, adapt them, make them your own.

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
| [ssp-navigator](skills/ssp-navigator/) | Determine which System Security Plan(s) apply under the ICT&SS Policy Reform (IM8's successor) — including the Gen-AI overlay and DSS profiles — and emit the Level 0/1/2 control baseline and lifecycle steps. |
| [secure-coding-as](skills/secure-coding-as/) | Write and review application code against the Application Security (AS-1..15) and Cryptography/Key Management (CK-1..4) controls: input validation, parameterised queries, password hashing, secrets, CSP/HSTS, uploads, error hygiene. |
| [secure-pipeline](skills/secure-pipeline/) | Set up or audit repos and CI/CD against the Secure Development (SD-1..10) and Software Supply Chain (SC-1..9) controls, with GitHub/GitLab recipes and open-source fallbacks. |
| [dss-accessibility](skills/dss-accessibility/) | Build and review frontend code against the 53 WCAG-2.2-derived DSS accessibility controls (WP/WO/WU/WR), with SG-specific Others vs High-Impact leveling and testing workflow. |
| [sg-service-shell](skills/sg-service-shell/) | The mandatory "shell" every SG government public digital service needs before feature work — Official Government Banner (SGDS Masthead), WOGAA, official footer, .gov.sg domain, and the rest of the DSS TL/BD/PR controls. |

Each skill lives in [`skills/`](skills/) as a folder with a `SKILL.md` entry point.

## Repository layout

```
skills/           Published skills — one folder per skill, each with a SKILL.md
skills-lock.json  Lockfile for skills installed locally for authoring (skill-creator, humanizer)
.agents/skills/   Locally installed authoring skills (gitignored; restore with `npx skills experimental_install`)
```

## Contributing

See [`skills/README.md`](skills/README.md) for authoring conventions. In short: one folder per skill, kebab-case name, a `SKILL.md` with `name` and `description` frontmatter, and supporting files (`references/`, `scripts/`, `assets/`) only when they earn their place.

## License

[MIT](LICENSE)

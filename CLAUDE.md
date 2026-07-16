Agent skills for developers building tech projects for **Singapore government agencies**.

Delivering software inside government is its own discipline — the ICT&SS Policy Reform (IM8's successor) and its System Security Plans, Singpass and MyInfo integrations, FormSG pipelines, the Singapore Government Design System (SGDS), WCAG 2.2 accessibility under the Digital Service Standards, PDPA obligations, VAPT, and GeBIZ procurement all shape how you build. These skills are small, composable, and adaptable so delivery teams can plug them into their agent and get moving. They work with any model. Fork them, adapt them, make them your own.

## Repository layout

- `skills/<skill-name>/SKILL.md` — the published skills. This is the layout the `skills` CLI discovers, so consumers install with `npx skills add kyleoliveiro/sg-gov-skills`. Authoring conventions live in `skills/README.md`.
- `.agents/skills/` and `.claude/skills/` — third-party skills installed locally for authoring (skill-creator, humanizer). Gitignored; tracked in `skills-lock.json` and restored with `npx skills experimental_install` (or `npm run skills:restore`).

## Working on skills

- One skill per delivery concern; kebab-case folder names.
- Use the skill-creator skill to scaffold and iterate; validate with `python .agents/skills/skill-creator/scripts/quick_validate.py skills/<skill-name>`.
- When adding a skill, also add it to the table in `README.md`.
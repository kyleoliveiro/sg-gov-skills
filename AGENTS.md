Agent skills for developers building tech projects for **Singapore government agencies**.

Delivering software inside government is its own discipline — the ICT&SS Policy Reform (IM8's successor) and its System Security Plans, Singpass and MyInfo integrations, FormSG pipelines, the Singapore Government Design System (SGDS), WCAG 2.2 accessibility under the Digital Service Standards, PDPA obligations, VAPT, and GeBIZ procurement all shape how you build. These skills are small, composable, and adaptable so delivery teams can plug them into their agent and get moving. They work with any model. Fork them, adapt them, make them your own.

## Repository layout

- `skills/<skill-name>/SKILL.md` — the published skills. This is the layout the `skills` CLI discovers, so consumers install with `npx skills add kyleoliveiro/sg-gov-skills`. Authoring conventions live in `skills/README.md`.
- `.claude-plugin/marketplace.json` — groups published skills in the interactive `skills` CLI installer. Every skill must appear in exactly one group.
- `.agents/skills/` and `.claude/skills/` — third-party skills installed locally for authoring (skill-creator, humanizer). Gitignored; tracked in `skills-lock.json` and restored with `npx skills experimental_install` (or `npm run skills:restore`).

## Working on skills

- One skill per delivery concern; kebab-case folder names.
- Use the skill-creator skill to scaffold and iterate; validate with `npm run skills:validate -- skills/<skill-name>`.
- Task-performance scenarios live in `skills/<skill-name>/evals/evals.json`; description-trigger queries live separately in `skills/<skill-name>/evals/trigger-evals.json`.
- Validate every skill's task and trigger datasets locally with `npm run skills:evals:validate` (each skill needs both files: at least two task scenarios, and 20 trigger queries split 10 positive / 10 negative).
- Run description-trigger evals with `npm run skills:eval -- <skill-name>` (extra `run_eval` flags pass through, e.g. `--runs-per-query 3`); run with no args to list skills that have trigger sets. Trigger evals shell out to `claude -p`, so they consume real usage.
- When adding a skill, also add it to the appropriate catalog table in `README.md` and installer group in `.claude-plugin/marketplace.json`.

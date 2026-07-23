# Authoring skills

One folder per skill. The folder name is the skill name: kebab-case, short, specific (`singpass-integration`, not `sg-auth-stuff`). The `skills` CLI discovers anything matching `skills/<name>/SKILL.md`, so a skill is published simply by existing here.

## Anatomy

```
skills/
  <skill-name>/
    SKILL.md          Required. Entry point with YAML frontmatter.
    references/       Optional. Deeper material the agent loads on demand.
    scripts/          Optional. Executable helpers the skill instructs the agent to run.
    assets/           Optional. Templates, boilerplate, static files.
```

## SKILL.md template

```markdown
---
name: <skill-name>
description: <What it does and when to use it. Written for the agent deciding whether to load this skill — include trigger phrases and concrete situations, not marketing copy.>
---

# <Skill title>

<Instructions for the agent. Assume the reader is a capable engineer who knows
nothing about the Singapore government context — spell out the acronyms once,
link to authoritative sources, and be prescriptive about what to do.>
```

## Conventions

- **Small and composable.** A skill should cover one delivery concern (e.g. Singpass integration, SGDS compliance, PDPA data handling) — not "building for SG government" in general. Compose rather than merge.
- **Description is the trigger.** Agents decide to load a skill from its `description` alone. State what it does, when to use it, and the phrases that should trigger it.
- **Keep eval types separate.** Task-performance scenarios belong in `evals/evals.json`; description-trigger queries belong in `evals/trigger-evals.json`. The files use different schemas and must not be interchanged.
- **Keep SKILL.md lean.** Put the always-needed instructions in SKILL.md; push long reference material into `references/` and tell the agent when to read each file.
- **Cite authoritative sources.** Government requirements change — link to the canonical source (e.g. developer.gov.sg, designsystem.tech.gov.sg, PDPC guidelines) so users can verify currency.
- **Model-agnostic.** No agent-specific or model-specific assumptions; these skills should work anywhere the `skills` CLI can install them.

## Workflow

Use the locally installed **skill-creator** skill to scaffold, evaluate, and iterate on skills (restore it with `npx skills experimental_install` if `.agents/skills/` is empty). Validate before committing:

```sh
uv run --with pyyaml python .agents/skills/skill-creator/scripts/quick_validate.py skills/<skill-name>
```

After adding a skill:

1. List it in the appropriate catalog table in the root [README](../README.md).
2. Add its directory to exactly one installer group in [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json).
3. Run `npx skills add . --list` from the repository root and confirm that it appears under the intended group.

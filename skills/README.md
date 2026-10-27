# Authoring skills

One folder per skill. The folder name is the skill name: kebab-case, short, specific (`singpass-integration`, not `sg-auth-stuff`). The `skills` CLI discovers anything matching `skills/<name>/SKILL.md`, so any folder added here is published.

## Anatomy

```
skills/
  <skill-name>/
    SKILL.md          Required. Entry point with YAML frontmatter.
    references/       Optional. Deeper material the agent loads on demand.
    scripts/          Optional. Executable helpers the skill instructs the agent to run.
    assets/           Optional. Templates, boilerplate, static files.
    evals/            Required. evals.json (task scenarios) and trigger-evals.json (trigger queries).
```

## SKILL.md template

```markdown
---
name: <skill-name>
description: <What it does and when to use it. Written for the agent deciding whether to load this skill — include trigger phrases and concrete situations.>
---

# <Skill title>

<Instructions for the agent. Assume the reader is a capable engineer who knows
nothing about the Singapore government context — spell out the acronyms once,
link to authoritative sources, and be prescriptive about what to do.>
```

## Conventions

- **One concern per skill.** Cover a single delivery concern (e.g. Singpass integration, SGDS compliance, PDPA data handling), not "building for SG government" in general. If two concerns overlap, keep two skills that reference each other.
- **Write the description for triggering.** Agents decide whether to load a skill from its `description` alone. State what it does, when to use it, and the phrases that should trigger it.
- **Keep eval types separate.** Task-performance scenarios belong in `evals/evals.json`; description-trigger queries belong in `evals/trigger-evals.json`. The files use different schemas and must not be interchanged.
- **When in doubt, label a trigger query positive.** Use `should_trigger: false` only when the query is out of scope or belongs solely to a sibling skill whose description clearly excludes it. If two skills' descriptions both cover a query, label it `true` in both datasets. Over-triggering costs little, because each skill points to its siblings and the agent can move on.
- **Reference related skills.** Every SKILL.md lists the skills it overlaps with (in a "Related skills" or "What this skill does not cover" section), says where the boundary is, and names which skill to use instead.
- **Keep SKILL.md lean.** Put the always-needed instructions in SKILL.md; push long reference material into `references/` and tell the agent when to read each file.
- **Cite authoritative sources.** Government requirements change, so link to the canonical source (e.g. developer.gov.sg, designsystem.tech.gov.sg, PDPC guidelines) so users can verify currency.
- **Model-agnostic.** Make no agent- or model-specific assumptions. A skill should work anywhere the `skills` CLI can install it.

## Workflow

Use the locally installed **skill-creator** skill to scaffold, evaluate, and iterate on skills (run `npm run skills:restore` if `.agents/skills/` is empty). Validate before committing:

```sh
npm run skills:validate -- skills/<skill-name>
npm run skills:evals:validate
```

After adding a skill:

1. List it in the appropriate catalog table in the root [README](../README.md).
2. Add its directory to exactly one installer group in [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json).
3. Run `npx skills add . --list` from the repository root and confirm that it appears under the intended group.

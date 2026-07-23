import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// Validates every published skill's eval datasets:
//  - evals.json         — task-performance scenarios (graded against assertions)
//  - trigger-evals.json — description-trigger queries the run_eval harness consumes
// Skills are discovered from every plugin group in the marketplace manifest, so
// this stays in sync with what actually ships rather than a hard-coded list.

const MIN_TASK_EVALS = 2;
const TRIGGER_COUNT = 20;
const TRIGGER_POSITIVES = 10;

const root = process.cwd();
const manifestPath = path.join(root, ".claude-plugin", "marketplace.json");
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${path.relative(root, file)}: invalid JSON (${error.message})`);
    return null;
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label}: expected a non-empty string`);
  }
}

const manifest = readJson(manifestPath);
const plugins = manifest?.plugins ?? [];
if (plugins.length === 0) {
  fail(".claude-plugin/marketplace.json: no plugins found");
}

// Collect every skill path across all plugin groups, deduped and stably ordered.
const skillPaths = [];
const seen = new Set();
for (const plugin of plugins) {
  for (const relativeSkillPath of plugin.skills ?? []) {
    if (!seen.has(relativeSkillPath)) {
      seen.add(relativeSkillPath);
      skillPaths.push(relativeSkillPath);
    }
  }
}

let taskScenarioCount = 0;
let taskAssertionCount = 0;
let triggerQueryCount = 0;

for (const relativeSkillPath of skillPaths) {
  const skillDir = path.resolve(root, relativeSkillPath);
  const skillName = path.basename(skillDir);
  const taskFile = path.join(skillDir, "evals", "evals.json");
  const triggerFile = path.join(skillDir, "evals", "trigger-evals.json");

  if (!fs.existsSync(taskFile)) {
    fail(`${path.relative(root, taskFile)}: missing task eval set`);
  }
  const taskSet = fs.existsSync(taskFile) ? readJson(taskFile) : null;
  if (taskSet) {
    if (taskSet.skill_name !== skillName) {
      fail(
        `${path.relative(root, taskFile)}: skill_name must be "${skillName}"`,
      );
    }
    if (!Array.isArray(taskSet.evals) || taskSet.evals.length < MIN_TASK_EVALS) {
      fail(
        `${path.relative(root, taskFile)}: expected at least ${MIN_TASK_EVALS} task evals`,
      );
    } else {
      const ids = new Set();
      const names = new Set();
      for (const evaluation of taskSet.evals) {
        const label = `${path.relative(root, taskFile)} eval ${evaluation.id}`;
        if (!Number.isInteger(evaluation.id) || ids.has(evaluation.id)) {
          fail(`${label}: id must be a unique integer`);
        }
        ids.add(evaluation.id);
        assertNonEmptyString(evaluation.name, `${label} name`);
        if (names.has(evaluation.name)) {
          fail(`${label}: duplicate name "${evaluation.name}"`);
        }
        names.add(evaluation.name);
        assertNonEmptyString(evaluation.prompt, `${label} prompt`);
        assertNonEmptyString(
          evaluation.expected_output,
          `${label} expected_output`,
        );
        if (!Array.isArray(evaluation.files)) {
          fail(`${label}: files must be an array`);
        } else {
          for (const relativeInputPath of evaluation.files) {
            const inputPath = path.join(skillDir, "evals", relativeInputPath);
            if (!fs.existsSync(inputPath)) {
              fail(`${label}: input file does not exist: ${relativeInputPath}`);
            }
          }
        }
        if (
          !Array.isArray(evaluation.assertions) ||
          evaluation.assertions.length === 0
        ) {
          fail(`${label}: assertions must be a non-empty array`);
        } else {
          taskAssertionCount += evaluation.assertions.length;
          for (const [index, assertion] of evaluation.assertions.entries()) {
            assertNonEmptyString(assertion, `${label} assertion ${index}`);
          }
        }
        taskScenarioCount += 1;
      }
    }
  }

  if (!fs.existsSync(triggerFile)) {
    fail(`${path.relative(root, triggerFile)}: missing trigger eval set`);
  }
  const triggerSet = fs.existsSync(triggerFile) ? readJson(triggerFile) : null;
  if (triggerSet) {
    if (!Array.isArray(triggerSet)) {
      fail(`${path.relative(root, triggerFile)}: expected a top-level array`);
    } else {
      if (triggerSet.length !== TRIGGER_COUNT) {
        fail(
          `${path.relative(root, triggerFile)}: expected ${TRIGGER_COUNT} trigger queries, found ${triggerSet.length}`,
        );
      }
      const queryKeys = new Set();
      let positives = 0;
      let negatives = 0;
      for (const [index, item] of triggerSet.entries()) {
        const label = `${path.relative(root, triggerFile)} query ${index}`;
        assertNonEmptyString(item?.query, `${label} query`);
        if (typeof item?.should_trigger !== "boolean") {
          fail(`${label}: should_trigger must be boolean`);
        } else if (item.should_trigger) {
          positives += 1;
        } else {
          negatives += 1;
        }
        const queryKey = item?.query?.trim().toLowerCase();
        if (queryKey && queryKeys.has(queryKey)) {
          fail(`${label}: duplicate query`);
        }
        queryKeys.add(queryKey);
      }
      if (positives !== TRIGGER_POSITIVES || negatives !== TRIGGER_COUNT - TRIGGER_POSITIVES) {
        fail(
          `${path.relative(root, triggerFile)}: expected ${TRIGGER_POSITIVES} positive and ${TRIGGER_COUNT - TRIGGER_POSITIVES} negative queries, found ${positives}/${negatives}`,
        );
      }
      triggerQueryCount += triggerSet.length;
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`ERROR ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${skillPaths.length} skills: ${taskScenarioCount} task scenarios, ${taskAssertionCount} assertions, ${triggerQueryCount} trigger queries.`,
);

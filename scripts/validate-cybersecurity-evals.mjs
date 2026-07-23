import fs from "node:fs";
import path from "node:path";
import process from "node:process";

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
const cybersecurity = manifest?.plugins?.find(
  (plugin) => plugin.name === "cybersecurity",
);

if (!cybersecurity) {
  fail(".claude-plugin/marketplace.json: missing cybersecurity plugin");
}

const skillPaths = cybersecurity?.skills ?? [];
let taskScenarioCount = 0;
let taskAssertionCount = 0;
let triggerQueryCount = 0;

for (const relativeSkillPath of skillPaths) {
  const skillDir = path.resolve(root, relativeSkillPath);
  const skillName = path.basename(skillDir);
  const taskFile = path.join(skillDir, "evals", "evals.json");
  const triggerFile = path.join(skillDir, "evals", "trigger-evals.json");

  const taskSet = readJson(taskFile);
  if (taskSet) {
    if (taskSet.skill_name !== skillName) {
      fail(
        `${path.relative(root, taskFile)}: skill_name must be "${skillName}"`,
      );
    }
    if (!Array.isArray(taskSet.evals) || taskSet.evals.length < 3) {
      fail(`${path.relative(root, taskFile)}: expected at least 3 task evals`);
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
              fail(
                `${label}: input file does not exist: ${relativeInputPath}`,
              );
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

  const triggerSet = readJson(triggerFile);
  if (triggerSet) {
    if (!Array.isArray(triggerSet)) {
      fail(`${path.relative(root, triggerFile)}: expected a top-level array`);
    } else {
      if (triggerSet.length !== 20) {
        fail(
          `${path.relative(root, triggerFile)}: expected 20 trigger queries, found ${triggerSet.length}`,
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
      if (positives !== 10 || negatives !== 10) {
        fail(
          `${path.relative(root, triggerFile)}: expected 10 positive and 10 negative queries, found ${positives}/${negatives}`,
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
  `Validated ${skillPaths.length} Cybersecurity skills: ${taskScenarioCount} task scenarios, ${taskAssertionCount} assertions, ${triggerQueryCount} trigger queries.`,
);

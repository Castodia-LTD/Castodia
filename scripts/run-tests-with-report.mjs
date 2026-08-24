import {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const resultsDir = path.resolve(
  "test-results",
);

const historyDir = path.join(
  resultsDir,
  "history",
);

await mkdir(historyDir, {
  recursive: true,
});

/*
 * Run Vitest directly through Node rather than
 * npx + shell:true.
 */
const vitestEntry = path.resolve(
  "node_modules",
  "vitest",
  "vitest.mjs",
);

if (!existsSync(vitestEntry)) {
  console.error(
    "Vitest could not be found. Run: npm install --save-dev vitest",
  );

  process.exit(1);
}

const child = spawn(
  process.execPath,
  [
    vitestEntry,
    "run",
  ],
  {
    stdio: "inherit",
    shell: false,
  },
);

const exitCode = await new Promise(
  (resolve) => {
    child.on(
      "close",
      (code) =>
        resolve(code ?? 1),
    );

    child.on(
      "error",
      (error) => {
        console.error(
          "Unable to start Vitest:",
          error,
        );

        resolve(1);
      },
    );
  },
);

const jsonPath = path.join(
  resultsDir,
  "latest.json",
);

if (!existsSync(jsonPath)) {
  console.error("");
  console.error(
    "Castodia test reporting failed: Vitest did not produce test-results/latest.json.",
  );

  process.exit(exitCode || 1);
}

const report = JSON.parse(
  await readFile(
    jsonPath,
    "utf8",
  ),
);

const timestamp =
  new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

const tests =
  (report.testResults ?? [])
    .flatMap((suite) =>
      (suite.assertionResults ?? [])
        .map((item) => ({
          suite:
            item.ancestorTitles
              ?.filter(Boolean)
              .join(" > ") ||
            suite.name ||
            "Test suite",

          name:
            item.title ||
            item.fullName ||
            "Test",

          status:
            item.status ??
            "unknown",

          duration:
            item.duration ?? 0,

          failures:
            item.failureMessages ??
            [],
        })),
    );

const passed =
  report.numPassedTests ?? 0;

const failed =
  report.numFailedTests ?? 0;

const pending =
  report.numPendingTests ?? 0;

const total =
  report.numTotalTests ??
  tests.length;

const suites =
  report.numTotalTestSuites ??
  report.testResults?.length ??
  0;

const passedSuites =
  report.numPassedTestSuites ??
  report.testResults?.filter(
    (suite) =>
      suite.status === "passed" ||
      !suite.assertionResults?.some(
        (item) =>
          item.status === "failed",
      ),
  ).length ??
  0;

const failedSuites =
  report.numFailedTestSuites ??
  Math.max(
    suites - passedSuites,
    0,
  );

const status =
  failed === 0 &&
  failedSuites === 0
    ? "PASS"
    : "FAIL";

const successRate =
  total > 0
    ? (
        (passed / total) *
        100
      ).toFixed(1)
    : "0.0";

const runDate =
  new Date().toLocaleString(
    "en-GB",
    {
      dateStyle: "full",
      timeStyle: "medium",
    },
  );

const markdownLines = [
  "# Castodia Automated Test Report",
  "",
  `**Overall result:** ${status}`,
  `**Run:** ${runDate}`,
  "",
  "## Summary",
  "",
  `- Automated tests passed: **${passed} / ${total}**`,
  `- Automated tests failed: **${failed}**`,
  `- Automated tests skipped/pending: **${pending}**`,
  `- Success rate: **${successRate}%**`,
  `- Test suites completed: **${suites}**`,
  "",
  "## Individual Test Results",
  "",
  "| Status | Test | Duration |",
  "|---|---|---:|",

  ...tests.map((item) => {
    const icon =
      item.status === "passed"
        ? "PASS"
        : item.status === "failed"
          ? "FAIL"
          : item.status.toUpperCase();

    const testName =
      `${item.suite} > ${item.name}`
        .replaceAll("|", "\\|");

    return `| ${icon} | ${testName} | ${item.duration} ms |`;
  }),
];

const failures =
  tests.filter(
    (item) =>
      item.status === "failed",
  );

if (failures.length) {
  markdownLines.push(
    "",
    "## Failures",
    "",
  );

  failures.forEach(
    (item, index) => {
      markdownLines.push(
        `### ${index + 1}. ${item.name}`,
        "",
        "```text",
        ...(item.failures.length
          ? item.failures
          : [
              "No failure message supplied.",
            ]),
        "```",
        "",
      );
    },
  );
}

const markdown =
  markdownLines.join("\n");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const rows = tests
  .map((item) => {
    const resultClass =
      item.status === "passed"
        ? "pass"
        : item.status === "failed"
          ? "fail"
          : "pending";

    return `
      <tr>
        <td class="${resultClass}">
          ${escapeHtml(
            item.status.toUpperCase(),
          )}
        </td>

        <td>
          ${escapeHtml(
            `${item.suite} > ${item.name}`,
          )}
        </td>

        <td>
          ${escapeHtml(
            `${item.duration} ms`,
          )}
        </td>
      </tr>
    `;
  })
  .join("");

const failureHtml =
  failures.length === 0
    ? ""
    : `
      <section>
        <h2>Failures</h2>

        ${failures
          .map(
            (item) => `
              <article class="failure">
                <h3>
                  ${escapeHtml(
                    item.name,
                  )}
                </h3>

                <pre>${escapeHtml(
                  item.failures.join(
                    "\n\n",
                  ),
                )}</pre>
              </article>
            `,
          )
          .join("")}
      </section>
    `;

const resultMessage =
  status === "PASS"
    ? "ALL AUTOMATED TESTS PASSED"
    : "ONE OR MORE AUTOMATED TESTS FAILED";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />

  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  />

  <title>Castodia Test Report</title>

  <style>
    body {
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 24px;
      line-height: 1.5;
      color: #172033;
      background: #f8fafc;
    }

    header,
    section {
      background: white;
      border: 1px solid #dbe4ea;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    h1,
    h2,
    h3 {
      margin-top: 0;
    }

    .headline {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .result {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 8px 0 18px;
    }

    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .summary span {
      border: 1px solid #dbe4ea;
      border-radius: 999px;
      padding: 7px 12px;
      background: #f8fafc;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .pass {
      color: #166534;
      font-weight: 700;
    }

    .fail {
      color: #b91c1c;
      font-weight: 700;
    }

    .pending {
      color: #854d0e;
      font-weight: 700;
    }

    pre {
      white-space: pre-wrap;
      word-break: break-word;
      background: #0f172a;
      color: #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      overflow: auto;
    }
  </style>
</head>

<body>
  <header>
    <h1>
      Castodia Automated Test Report
    </h1>

    <div class="headline">
      ${passed} / ${total}
      automated tests passed
    </div>

    <div
      class="result ${
        status === "PASS"
          ? "pass"
          : "fail"
      }"
    >
      ${escapeHtml(
        resultMessage,
      )}
    </div>

    <div class="summary">
      <span>
        ${escapeHtml(
          runDate,
        )}
      </span>

      <span>
        <strong>
          ${successRate}% success
        </strong>
      </span>

      <span>
        ${failed} failed
      </span>

      <span>
        ${pending} skipped/pending
      </span>

      <span>
        ${suites} test suites
      </span>
    </div>
  </header>

  <section>
    <h2>
      Individual Test Results
    </h2>

    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Test</th>
          <th>Duration</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>
    </table>
  </section>

  ${failureHtml}
</body>
</html>`;

const latestMd = path.join(
  resultsDir,
  "latest-report.md",
);

const latestHtml = path.join(
  resultsDir,
  "latest-report.html",
);

await writeFile(
  latestMd,
  markdown,
  "utf8",
);

await writeFile(
  latestHtml,
  html,
  "utf8",
);

await copyFile(
  latestMd,
  path.join(
    historyDir,
    `${timestamp}.md`,
  ),
);

await copyFile(
  latestHtml,
  path.join(
    historyDir,
    `${timestamp}.html`,
  ),
);

const line =
  "══════════════════════════════════════════════════";

console.log("");
console.log(line);

console.log(
  "              CASTODIA TEST RESULTS",
);

console.log(line);
console.log("");

console.log(
  `  Automated tests:   ${passed} / ${total} passed`,
);

console.log(
  `  Failed tests:      ${failed}`,
);

console.log(
  `  Skipped/pending:   ${pending}`,
);

console.log(
  `  Success rate:      ${successRate}%`,
);

console.log(
  `  Test suites:       ${suites}`,
);

console.log("");

console.log(
  status === "PASS"
    ? "  RESULT: ALL AUTOMATED TESTS PASSED"
    : "  RESULT: TEST FAILURES DETECTED",
);

console.log("");
console.log(line);

console.log(
  `Report: ${latestHtml}`,
);

console.log(
  `History: ${historyDir}`,
);

console.log(line);
console.log("");

process.exit(exitCode);
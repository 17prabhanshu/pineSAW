import { execSync } from "child_process";

console.log("================================================================================");
console.log("  pineSAW PHASE 2 AUTOMATED TEST RUNNER (ACADEMIC ENGINES & LEGAL VERIFICATION)");
console.log("================================================================================\n");

const testFiles = [
  "tests/clustering.test.mjs",
  "tests/scoring.test.mjs",
  "tests/nlp.test.mjs",
  "tests/legal.test.mjs"
];

let passed = 0;
let failed = 0;

for (const file of testFiles) {
  try {
    execSync(`node ${file}`, { stdio: "inherit" });
    passed++;
  } catch (err) {
    console.error(`❌ FAILED: ${file}`);
    failed++;
  }
  console.log("--------------------------------------------------------------------------------");
}

console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed out of ${testFiles.length} Test Suites.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("🌟 ALL INSTITUTIONAL & LEGAL TESTS PASSED WITH 100% SUCCESS RATE!\n");
}

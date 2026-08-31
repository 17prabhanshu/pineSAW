import assert from "node:assert";
import { DeterministicRiskScorer } from "../src/lib/analytics/scoring.ts";

console.log("▶ RUNNING TEST: Deterministic Risk Scoring Formula & Boundedness");

// Test Case 1: Extreme high-risk kingpin
const kingpinAssessment = DeterministicRiskScorer.calculate({
  degreeCentrality: 15,
  betweennessScore: 0.95,
  activitySpikeFactor: 4.2,
  crossPlatformMatches: 3,
  hasMixerExposure: true,
  hasOffshoreBanking: true,
  hasNarcoticsListingPattern: true
});

assert(kingpinAssessment.score <= 100, "Score must not exceed upper bound of 100");
assert(kingpinAssessment.score >= 80, "Kingpin score must be >= 80 (CRITICAL)");
assert.strictEqual(kingpinAssessment.severity, "CRITICAL");
assert(kingpinAssessment.breakdown.length >= 4, "Must contain all 4 risk factor categories");

// Test Case 2: Clean baseline node
const cleanAssessment = DeterministicRiskScorer.calculate({
  degreeCentrality: 0,
  betweennessScore: 0,
  activitySpikeFactor: 1.0,
  crossPlatformMatches: 0,
  hasMixerExposure: false,
  hasOffshoreBanking: false,
  hasNarcoticsListingPattern: false
});

assert.strictEqual(cleanAssessment.score, 0, "Clean node must receive a score of 0");
assert.strictEqual(cleanAssessment.severity, "LOW");
assert.strictEqual(cleanAssessment.breakdown.length, 0, "Clean node must have 0 risk breakdowns");

// Test Case 3: Mathematical reproducibility
const testRun1 = DeterministicRiskScorer.calculate({
  degreeCentrality: 5,
  betweennessScore: 0.4,
  activitySpikeFactor: 2.5,
  crossPlatformMatches: 1,
  hasMixerExposure: true,
  hasOffshoreBanking: false,
  hasNarcoticsListingPattern: true
});

const testRun2 = DeterministicRiskScorer.calculate({
  degreeCentrality: 5,
  betweennessScore: 0.4,
  activitySpikeFactor: 2.5,
  crossPlatformMatches: 1,
  hasMixerExposure: true,
  hasOffshoreBanking: false,
  hasNarcoticsListingPattern: true
});

assert.strictEqual(testRun1.score, testRun2.score, "Scores must be 100% deterministic and reproducible across runs");

console.log(`✔ PASSED: Deterministic Risk Scoring Formula mathematically validated (Kingpin Score: ${kingpinAssessment.score}/100, Clean: ${cleanAssessment.score}/100).`);

import assert from "node:assert";
import { StanfordAddressClusterer } from "../src/lib/analytics/clustering.ts";

console.log("▶ RUNNING TEST: Stanford SNAP Co-Spend Address Clustering");

const clusterer = new StanfordAddressClusterer();

const sampleTransactions = [
  {
    txHash: "0x1111",
    timestamp: new Date().toISOString(),
    inputs: [{ address: "addr_A", amount: 2.5 }, { address: "addr_B", amount: 1.5 }],
    outputs: [{ address: "addr_X", amount: 3.8 }, { address: "addr_change_1", amount: 0.2 }]
  },
  {
    txHash: "0x2222",
    timestamp: new Date().toISOString(),
    inputs: [{ address: "addr_B", amount: 1.0 }, { address: "addr_C", amount: 4.0 }],
    outputs: [{ address: "addr_Y", amount: 4.9 }]
  },
  {
    txHash: "0x3333",
    timestamp: new Date().toISOString(),
    inputs: [{ address: "addr_D", amount: 10.0 }],
    outputs: [{ address: "addr_Z", amount: 9.9 }]
  }
];

const clusters = clusterer.processTransactions(sampleTransactions);

// Assertions
// 1. addr_A, addr_B, addr_C must be in the same cluster because of co-spend links A-B and B-C
const multiCluster = clusters.find(c => c.addresses.includes("addr_A"));
assert(multiCluster, "Cluster containing addr_A must exist");
assert.strictEqual(multiCluster.addresses.length, 3, "Cluster must contain exactly 3 addresses (A, B, C)");
assert(multiCluster.addresses.includes("addr_B"), "Cluster must contain addr_B");
assert(multiCluster.addresses.includes("addr_C"), "Cluster must contain addr_C");
assert(multiCluster.confidenceScore >= 0.9, "Multi-address cluster must have confidence >= 0.90");

// 2. addr_D should be in an isolated cluster
const isolatedCluster = clusters.find(c => c.addresses.includes("addr_D"));
assert(isolatedCluster, "Cluster containing addr_D must exist");
assert.strictEqual(isolatedCluster.addresses.length, 1, "addr_D cluster must have length 1");

console.log("✔ PASSED: Stanford SNAP Address Clustering heuristic successfully verified (Transitive Closure: A=B=C).");

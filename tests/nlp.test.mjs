import assert from "node:assert";
import { DarknetNLPExtractor } from "../src/lib/nlp/slangExtractor.ts";

console.log("▶ RUNNING TEST: Cambridge iCrime NLP & Cryptographic Identifier Extractor");

const sampleDarknetPost = `
NEW BATCH ALERT: Pure pharma grade 500 pills of dirty 30s (m30 fent) and 100g of high purity ice shards available now.
Dead drops active in Sector 17, Chandigarh and NCR region.
Payment strictly via Bitcoin: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq or Ethereum: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Message vendor on Telegram @shadow_broker_t or protonmail shadow99@proton.me
`;

const result = DarknetNLPExtractor.parse(sampleDarknetPost);

// Assertions
assert.strictEqual(result.isIllicitListing, true, "Must flag post as illicit drug listing");
assert.strictEqual(result.threatLevel, "CRITICAL", "Synthetic opioid listing must receive CRITICAL severity");

// Narcotics checks
const narcoticsFound = result.narcotics.map(n => n.detectedSlang);
assert(narcoticsFound.includes("m30") || narcoticsFound.includes("dirty 30s"), "Must extract M30 / Dirty 30s slang");
assert(narcoticsFound.includes("ice") || narcoticsFound.includes("shards"), "Must extract Meth / Ice slang");

// Crypto checks
const btc = result.identifiers.cryptoAddresses.find(c => c.network === "BITCOIN");
const eth = result.identifiers.cryptoAddresses.find(c => c.network === "ETHEREUM");
assert(btc, "Must extract Bitcoin Bech32 address");
assert.strictEqual(btc.address, "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq");
assert(eth, "Must extract Ethereum Hex address");
assert.strictEqual(eth.address, "0x742d35Cc6634C0532925a3b844Bc454e4438f44e");

// Handle checks
const tg = result.identifiers.communicationHandles.find(h => h.platform === "TELEGRAM");
const proton = result.identifiers.communicationHandles.find(h => h.platform === "PROTONMAIL");
assert(tg, "Must extract Telegram handle");
assert.strictEqual(tg.handle, "shadow_broker_t");
assert(proton, "Must extract ProtonMail address");
assert.strictEqual(proton.handle, "shadow99@proton.me");

console.log(`✔ PASSED: Cambridge NLP Extractor extracted ${result.narcotics.length} narcotics entities and ${result.identifiers.cryptoAddresses.length + result.identifiers.communicationHandles.length} cryptographic/communication vectors.`);

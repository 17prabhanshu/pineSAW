/**
 * Cambridge Cybercrime Centre (iCrime) Lexicon & Cryptographic Identifier Extractor
 * 
 * Implements:
 * 1. Named Entity Recognition (NER) for underground drug slang, synthetic opioids, and purity markers.
 * 2. Quantity & Metric unit extraction (e.g. 100g, 500 pills, 1kg, 50 sheets).
 * 3. Cryptographic identifier parsing: Bitcoin (Base58, Bech32), Ethereum (0x Hex), and PGP Public Keys.
 */

export interface ExtractedNarcoticsEntity {
  substanceClass: "SYNTHETIC_OPIOID" | "STIMULANT" | "BENZODIAZEPINE" | "CANNABINOID" | "DISSOCIATIVE";
  detectedSlang: string;
  standardizedName: string;
  extractedQuantity?: string;
  confidence: number;
}

export interface ExtractedIdentifiers {
  cryptoAddresses: { address: string; network: "BITCOIN" | "ETHEREUM" | "MONERO" }[];
  pgpKeyBlocks: string[];
  communicationHandles: { platform: "TELEGRAM" | "SESSION" | "WICKR" | "PROTONMAIL"; handle: string }[];
}

export interface NLPParseResult {
  textSnippet: string;
  isIllicitListing: boolean;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  narcotics: ExtractedNarcoticsEntity[];
  identifiers: ExtractedIdentifiers;
  confidenceScore: number;
  extractedAt: string;
}

export class DarknetNLPExtractor {
  // Cambridge iCrime Slang Lexicon
  private static readonly SLANG_DICTIONARY: Record<string, { std: string; cat: ExtractedNarcoticsEntity["substanceClass"] }> = {
    "m30": { std: "Fentanyl (Counterfeit Oxycodone)", cat: "SYNTHETIC_OPIOID" },
    "fent": { std: "Fentanyl", cat: "SYNTHETIC_OPIOID" },
    "china white": { std: "High-Purity Heroin/Fentanyl Analogue", cat: "SYNTHETIC_OPIOID" },
    "dirty 30s": { std: "Fentanyl Pressed Tablets", cat: "SYNTHETIC_OPIOID" },
    "ice": { std: "Methamphetamine Crystal", cat: "STIMULANT" },
    "glass": { std: "Methamphetamine Crystal", cat: "STIMULANT" },
    "shards": { std: "Methamphetamine", cat: "STIMULANT" },
    "speed": { std: "Amphetamine Sulphate", cat: "STIMULANT" },
    "mdma rock": { std: "MDMA Crystal / Ecstasy", cat: "STIMULANT" },
    "xannies": { std: "Alprazolam / Xanax", cat: "BENZODIAZEPINE" },
    "bars": { std: "Alprazolam 2mg Tablets", cat: "BENZODIAZEPINE" },
    "k-hole": { std: "Ketamine HCL", cat: "DISSOCIATIVE" },
    "special k": { std: "Ketamine HCL", cat: "DISSOCIATIVE" },
    "afghan kush": { std: "Cannabis Indica / Hashish", cat: "CANNABINOID" },
    "shatter": { std: "Cannabis BHO Concentrate", cat: "CANNABINOID" },
  };

  public static parse(rawText: string): NLPParseResult {
    const textLower = rawText.toLowerCase();
    const narcotics: ExtractedNarcoticsEntity[] = [];

    // 1. Slang & Substance matching
    for (const [slang, info] of Object.entries(this.SLANG_DICTIONARY)) {
      // Word boundary match
      const regex = new RegExp(`\\b${slang}\\b`, "i");
      if (regex.test(textLower)) {
        // Try to extract quantity nearby (e.g. "100g of ice", "500 m30 pills")
        const qtyRegex = new RegExp(`(\\d+(?:\\.\\d+)?\\s*(?:g|grams?|kg|kilos?|pills?|tabs?|caps?|oz|ounces?|sheets?))\\s*(?:of\\s*)?${slang}`, "i");
        const reverseQtyRegex = new RegExp(`${slang}\\s*(?:of\\s*)?(\\d+(?:\\.\\d+)?\\s*(?:g|grams?|kg|kilos?|pills?|tabs?|caps?|oz|ounces?|sheets?))`, "i");
        
        const match = textLower.match(qtyRegex) || textLower.match(reverseQtyRegex);
        const extractedQuantity = match ? match[1] : undefined;

        narcotics.push({
          substanceClass: info.cat,
          detectedSlang: slang,
          standardizedName: info.std,
          extractedQuantity,
          confidence: 0.94
        });
      }
    }

    // 2. Cryptographic Address Extraction
    const cryptoAddresses: ExtractedIdentifiers["cryptoAddresses"] = [];

    // Bitcoin Bech32 or Base58 (e.g. bc1q... or 1A1z...)
    const btcRegex = /\b(bc1[a-zA-HJ-NP-Z0-9]{25,39}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g;
    const btcMatches = rawText.match(btcRegex) || [];
    for (const addr of btcMatches) {
      cryptoAddresses.push({ address: addr, network: "BITCOIN" });
    }

    // Ethereum Hex Address (0x + 40 hex chars)
    const ethRegex = /\b(0x[a-fA-F0-9]{40})\b/g;
    const ethMatches = rawText.match(ethRegex) || [];
    for (const addr of ethMatches) {
      cryptoAddresses.push({ address: addr, network: "ETHEREUM" });
    }

    // 3. Communication Handles & PGP Blocks
    const communicationHandles: ExtractedIdentifiers["communicationHandles"] = [];
    
    // Telegram Handles (t.me/... or @handle)
    const tgRegex = /(?:t\.me\/|@)([a-zA-Z0-9_]{5,32})/g;
    let tgMatch;
    while ((tgMatch = tgRegex.exec(rawText)) !== null) {
      communicationHandles.push({ platform: "TELEGRAM", handle: tgMatch[1] });
    }

    // ProtonMail
    const protonRegex = /([a-zA-Z0-9_.+-]+@proton(?:mail)?\.(?:me|com|ch))/gi;
    let protonMatch;
    while ((protonMatch = protonRegex.exec(rawText)) !== null) {
      communicationHandles.push({ platform: "PROTONMAIL", handle: protonMatch[1] });
    }

    // PGP Public Key Blocks
    const pgpKeyBlocks: string[] = [];
    const pgpRegex = /-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]*?-----END PGP PUBLIC KEY BLOCK-----/g;
    const pgpMatches = rawText.match(pgpRegex) || [];
    for (const block of pgpMatches) {
      pgpKeyBlocks.push(block.trim());
    }

    const isIllicitListing = narcotics.length > 0 || (cryptoAddresses.length > 0 && communicationHandles.length > 0);
    
    let threatLevel: NLPParseResult["threatLevel"] = "LOW";
    if (narcotics.some(n => n.substanceClass === "SYNTHETIC_OPIOID")) {
      threatLevel = "CRITICAL";
    } else if (narcotics.length > 0 || cryptoAddresses.length > 0) {
      threatLevel = "HIGH";
    } else if (communicationHandles.length > 0) {
      threatLevel = "MEDIUM";
    }

    return {
      textSnippet: rawText.substring(0, 160) + (rawText.length > 160 ? "..." : ""),
      isIllicitListing,
      threatLevel,
      narcotics,
      identifiers: {
        cryptoAddresses,
        pgpKeyBlocks,
        communicationHandles
      },
      confidenceScore: isIllicitListing ? 0.95 : 0.20,
      extractedAt: new Date().toISOString()
    };
  }
}

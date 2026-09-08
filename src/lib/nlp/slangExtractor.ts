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
  communicationHandles: { platform: "TELEGRAM" | "SESSION" | "WICKR" | "PROTONMAIL" | "WHATSAPP"; handle: string }[];
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
    "fentanyl": { std: "Fentanyl", cat: "SYNTHETIC_OPIOID" },
    "china white": { std: "High-Purity Heroin/Fentanyl Analogue", cat: "SYNTHETIC_OPIOID" },
    "dirty 30s": { std: "Fentanyl Pressed Tablets", cat: "SYNTHETIC_OPIOID" },
    "ice": { std: "Methamphetamine Crystal", cat: "STIMULANT" },
    "meth": { std: "Methamphetamine", cat: "STIMULANT" },
    "methamphetamine": { std: "Methamphetamine", cat: "STIMULANT" },
    "crystal meth": { std: "Crystal Methamphetamine", cat: "STIMULANT" },
    "cocaine": { std: "Cocaine Hydrochloride", cat: "STIMULANT" },
    "coke": { std: "Cocaine Hydrochloride", cat: "STIMULANT" },
    "glass": { std: "Methamphetamine Crystal", cat: "STIMULANT" },
    "shards": { std: "Methamphetamine", cat: "STIMULANT" },
    "speed": { std: "Amphetamine Sulphate", cat: "STIMULANT" },
    "heroin": { std: "Diacetylmorphine / Heroin", cat: "SYNTHETIC_OPIOID" },
    "smack": { std: "Heroin (Brown Sugar)", cat: "SYNTHETIC_OPIOID" },
    "chitta": { std: "Adulterated Heroin / Synthetic Opioid (Tri-city vernacular)", cat: "SYNTHETIC_OPIOID" },
    "mdma": { std: "MDMA / Ecstasy", cat: "STIMULANT" },
    "molly": { std: "MDMA / Ecstasy", cat: "STIMULANT" },
    "mdma rock": { std: "MDMA Crystal / Ecstasy", cat: "STIMULANT" },
    "xannies": { std: "Alprazolam / Xanax", cat: "BENZODIAZEPINE" },
    "xanax": { std: "Alprazolam / Xanax", cat: "BENZODIAZEPINE" },
    "alprazolam": { std: "Alprazolam", cat: "BENZODIAZEPINE" },
    "bars": { std: "Alprazolam 2mg Tablets", cat: "BENZODIAZEPINE" },
    "ketamine": { std: "Ketamine HCL", cat: "DISSOCIATIVE" },
    "k-hole": { std: "Ketamine HCL", cat: "DISSOCIATIVE" },
    "special k": { std: "Ketamine HCL", cat: "DISSOCIATIVE" },
    "tramadol": { std: "Tramadol Hydrochloride", cat: "SYNTHETIC_OPIOID" },
    "oxy": { std: "Oxycodone", cat: "SYNTHETIC_OPIOID" },
    "oxycontin": { std: "OxyContin", cat: "SYNTHETIC_OPIOID" },
    "afghan kush": { std: "Cannabis Indica / Hashish", cat: "CANNABINOID" },
    "shatter": { std: "Cannabis BHO Concentrate", cat: "CANNABINOID" },
    "charas": { std: "Cannabis Resin / Hashish", cat: "CANNABINOID" },
    "ganja": { std: "Cannabis / Marijuana", cat: "CANNABINOID" },
    "weed": { std: "Cannabis Flower", cat: "CANNABINOID" },
    "snow": { std: "Cocaine Hydrochloride", cat: "STIMULANT" },
    "blow": { std: "Cocaine Hydrochloride", cat: "STIMULANT" },
    "yayo": { std: "Cocaine Hydrochloride", cat: "STIMULANT" },
    "crack": { std: "Crack Cocaine (Freebase)", cat: "STIMULANT" },
    "rock": { std: "Crack Cocaine (Freebase)", cat: "STIMULANT" },
    "flakka": { std: "Alpha-PVP / Flakka", cat: "STIMULANT" },
    "bath salts": { std: "Synthetic Cathinones", cat: "STIMULANT" },
    "mephedrone": { std: "Mephedrone (4-MMC)", cat: "STIMULANT" },
    "lean": { std: "Codeine/Promethazine Syrup", cat: "SYNTHETIC_OPIOID" },
    "purple drank": { std: "Codeine/Promethazine Syrup", cat: "SYNTHETIC_OPIOID" },
    "sizzurp": { std: "Codeine/Promethazine Syrup", cat: "SYNTHETIC_OPIOID" },
    "percocet": { std: "Oxycodone/Acetaminophen", cat: "SYNTHETIC_OPIOID" },
    "perc": { std: "Oxycodone/Acetaminophen", cat: "SYNTHETIC_OPIOID" },
    "norco": { std: "Hydrocodone/Acetaminophen", cat: "SYNTHETIC_OPIOID" },
    "vicodin": { std: "Hydrocodone/Acetaminophen", cat: "SYNTHETIC_OPIOID" },
    "suboxone": { std: "Buprenorphine/Naloxone", cat: "SYNTHETIC_OPIOID" },
    "carfentanil": { std: "Carfentanil (Elephant Tranquilizer)", cat: "SYNTHETIC_OPIOID" },
    "brown sugar": { std: "Impure Heroin (South Asian)", cat: "SYNTHETIC_OPIOID" },
    "sulpha": { std: "Low-grade Heroin / Opium derivative", cat: "SYNTHETIC_OPIOID" },
    "pudiya": { std: "Single-dose Heroin Sachet", cat: "SYNTHETIC_OPIOID" },
    "maal": { std: "Generic Drug Slang (Hindi)", cat: "STIMULANT" },
    "nasha": { std: "Intoxicant / Drug (Hindi)", cat: "STIMULANT" },
    "dmt": { std: "N,N-Dimethyltryptamine", cat: "DISSOCIATIVE" },
    "ayahuasca": { std: "DMT / Ayahuasca Brew", cat: "DISSOCIATIVE" },
    "psilocybin": { std: "Psilocybin Mushrooms", cat: "DISSOCIATIVE" },
    "magic mushrooms": { std: "Psilocybin Mushrooms", cat: "DISSOCIATIVE" },
    "2cb": { std: "2C-B (Phenethylamine)", cat: "DISSOCIATIVE" },
    "nbome": { std: "NBOMe (Synthetic Psychedelic)", cat: "DISSOCIATIVE" },
    "ghb": { std: "Gamma-Hydroxybutyrate", cat: "DISSOCIATIVE" },
    "rohypnol": { std: "Flunitrazepam / Rohypnol", cat: "BENZODIAZEPINE" },
    "roofies": { std: "Flunitrazepam / Rohypnol", cat: "BENZODIAZEPINE" },
    "valium": { std: "Diazepam / Valium", cat: "BENZODIAZEPINE" },
    "diazepam": { std: "Diazepam", cat: "BENZODIAZEPINE" },
    "clonazepam": { std: "Clonazepam / Klonopin", cat: "BENZODIAZEPINE" },
    "klonopin": { std: "Clonazepam / Klonopin", cat: "BENZODIAZEPINE" },
    "acid": { std: "LSD / Lysergic Acid Diethylamide", cat: "DISSOCIATIVE" },
    "lsd": { std: "LSD / Lysergic Acid Diethylamide", cat: "DISSOCIATIVE" },
    "tabs": { std: "LSD Blotter Tabs", cat: "DISSOCIATIVE" },
    "spice": { std: "Synthetic Cannabinoid", cat: "CANNABINOID" },
    "k2": { std: "Synthetic Cannabinoid", cat: "CANNABINOID" },
    "dabs": { std: "Cannabis Concentrate / Dabs", cat: "CANNABINOID" },
    "edibles": { std: "Cannabis Edibles", cat: "CANNABINOID" },
    "hash": { std: "Hashish / Cannabis Resin", cat: "CANNABINOID" },
    "hashish": { std: "Hashish / Cannabis Resin", cat: "CANNABINOID" },
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

    // Monero XMR Address
    const xmrRegex = /\b(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93})\b/g;
    const xmrMatches = rawText.match(xmrRegex) || [];
    for (const addr of xmrMatches) {
      cryptoAddresses.push({ address: addr, network: "MONERO" });
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

    // Wickr handles
    const wickrRegex = /wickr(?:\s+me)?(?:\s*[:@]\s*)([a-zA-Z0-9_]{3,20})/gi;
    let wickrMatch;
    while ((wickrMatch = wickrRegex.exec(rawText)) !== null) {
      communicationHandles.push({ platform: "WICKR" as any, handle: wickrMatch[1] });
    }

    // Session IDs
    const sessionRegex = /\b(05[0-9a-f]{64})\b/g;
    let sessionMatch;
    while ((sessionMatch = sessionRegex.exec(rawText)) !== null) {
      communicationHandles.push({ platform: "SESSION" as any, handle: sessionMatch[1] });
    }

    // WhatsApp Invites & Phone Numbers
    const waInviteRegex = /(?:chat\.whatsapp\.com\/)([a-zA-Z0-9_-]{20,26})/gi;
    let waMatch;
    while ((waMatch = waInviteRegex.exec(rawText)) !== null) {
      communicationHandles.push({ platform: "WHATSAPP", handle: `chat.whatsapp.com/${waMatch[1]}` });
    }

    const phoneRegex = /\+?91[\s-]?[6-9]\d{4}[\s-]?\d{5}\b/g;
    const phoneMatches = rawText.match(phoneRegex) || [];
    for (const ph of phoneMatches) {
      communicationHandles.push({ platform: "WHATSAPP", handle: ph.trim() });
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

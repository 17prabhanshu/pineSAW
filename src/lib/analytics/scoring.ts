/**
 * Deterministic Risk Scoring Engine (DARKINT Phase 2)
 * 
 * Replaces opaque black-box AI with an unalterable, explainable mathematical formulation
 * suitable for Indian court scrutiny under Section 65B of the Indian Evidence Act.
 * 
 * Mathematical Formulation:
 * S_total = min(100, round(w1 * C_network + w2 * V_velocity + w3 * E_overlap + w4 * J_jurisdiction))
 * 
 * Where:
 * - C_network: Normalized Degree & Betweenness Centrality (0 to 100)
 * - V_velocity: Activity / Transaction spike above 14-day baseline (0 to 100)
 * - E_overlap: Multi-platform persona linking overlap score (0 to 100)
 * - J_jurisdiction: Exposure to mixers, high-risk bridges, or offshore secrecy banks (0 to 100)
 */

export interface RiskInputParameters {
  degreeCentrality: number;       // Number of active links/hops (0 - 50+)
  betweennessScore: number;       // Bridging role in network (0 - 1.0)
  activitySpikeFactor: number;    // Multiplier over 14-day baseline (e.g. 1.0 = normal, 3.4 = 3.4x spike)
  crossPlatformMatches: number;   // Number of shared PGP/handles/emails (e.g. 2 matches)
  hasMixerExposure: boolean;      // Touches CoinJoin, Tornado, Blender
  hasOffshoreBanking: boolean;    // Links to Swiss/Panama/offshore secrecy wire
  hasNarcoticsListingPattern: boolean; // NLP flagged high-purity drug listing
}

export interface RiskFactorBreakdown {
  factor: string;
  points: number;
  weight: number;
  rationale: string;
  category: "NETWORK" | "VELOCITY" | "IDENTITY" | "JURISDICTION";
}

export interface DeterministicRiskAssessment {
  score: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  breakdown: RiskFactorBreakdown[];
  formula: string;
  calculatedAt: string;
}

export class DeterministicRiskScorer {
  // Configured Institutional Weights (Sum = 1.0)
  private static readonly W_NETWORK = 0.30;
  private static readonly W_VELOCITY = 0.25;
  private static readonly W_IDENTITY = 0.25;
  private static readonly W_JURISDICTION = 0.20;

  public static calculate(params: RiskInputParameters): DeterministicRiskAssessment {
    const breakdown: RiskFactorBreakdown[] = [];

    // 1. Network Centrality (0 - 100)
    let cScore = Math.min(100, params.degreeCentrality * 8 + params.betweennessScore * 50);
    const networkPoints = Math.round(cScore * this.W_NETWORK);
    if (networkPoints > 0) {
      breakdown.push({
        factor: "High Network Centrality",
        points: networkPoints,
        weight: this.W_NETWORK,
        rationale: `Target operates as a central routing hub with ${params.degreeCentrality} direct high-risk connections.`,
        category: "NETWORK"
      });
    }

    // 2. Activity Velocity Anomaly (0 - 100)
    let vScore = 0;
    if (params.activitySpikeFactor > 1.2) {
      vScore = Math.min(100, (params.activitySpikeFactor - 1.0) * 40);
    }
    const velocityPoints = Math.round(vScore * this.W_VELOCITY);
    if (velocityPoints > 0) {
      breakdown.push({
        factor: "Anomalous Activity Velocity Burst",
        points: velocityPoints,
        weight: this.W_VELOCITY,
        rationale: `Transaction frequency is ${params.activitySpikeFactor.toFixed(1)}x above the 14-day established baseline.`,
        category: "VELOCITY"
      });
    }

    // 3. Cross-Platform Identity Overlap (0 - 100)
    let eScore = 0;
    if (params.crossPlatformMatches > 0) {
      eScore = Math.min(100, params.crossPlatformMatches * 45);
    }
    const identityPoints = Math.round(eScore * this.W_IDENTITY);
    if (identityPoints > 0) {
      breakdown.push({
        factor: "Cross-Platform Persona Overlap",
        points: identityPoints,
        weight: this.W_IDENTITY,
        rationale: `Matched identical PGP fingerprint / contact vector across ${params.crossPlatformMatches + 1} independent platforms (MIT Lincoln Lab Heuristic).`,
        category: "IDENTITY"
      });
    }

    // 4. Jurisdiction & Obfuscation Exposure (0 - 100)
    let jScore = 0;
    if (params.hasMixerExposure) jScore += 50;
    if (params.hasOffshoreBanking) jScore += 50;
    if (params.hasNarcoticsListingPattern) jScore += 20;
    jScore = Math.min(100, jScore);

    const jurisdictionPoints = Math.round(jScore * this.W_JURISDICTION);
    if (jurisdictionPoints > 0) {
      const reasons = [];
      if (params.hasMixerExposure) reasons.push("cryptocurrency mixer interaction");
      if (params.hasOffshoreBanking) reasons.push("offshore secrecy jurisdiction wire");
      if (params.hasNarcoticsListingPattern) reasons.push("bulk narcotics listing patterns");

      breakdown.push({
        factor: "Obfuscation & Illicit Jurisdiction Exposure",
        points: jurisdictionPoints,
        weight: this.W_JURISDICTION,
        rationale: `Direct exposure to ${reasons.join(" and ")}.`,
        category: "JURISDICTION"
      });
    }

    // Total Score calculation (bounded 0 - 100)
    const rawTotal = networkPoints + velocityPoints + identityPoints + jurisdictionPoints;
    const finalScore = Math.min(100, Math.max(0, rawTotal));

    let severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (finalScore >= 80) severity = "CRITICAL";
    else if (finalScore >= 60) severity = "HIGH";
    else if (finalScore >= 40) severity = "MEDIUM";

    return {
      score: finalScore,
      severity,
      breakdown,
      formula: "Score = min(100, 0.30*C_net + 0.25*V_vel + 0.25*E_ident + 0.20*J_juris)",
      calculatedAt: new Date().toISOString()
    };
  }
}

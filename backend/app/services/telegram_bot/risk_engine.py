"""
Explainable Risk Scoring Engine for Telegram OSINT
Provides transparent, deterministic 0-100 risk scoring with line-item factor breakdown.
Strictly labels all outputs as investigative leads requiring human review.
"""

from typing import List, Dict, Any, Optional
from .models import NormalizedTelegramMessage, ExtractedIOC, ExplainableRiskScore, RiskFactorLineItem, STANDARD_DISCLAIMER


class TelegramRiskEngine:
    """
    Computes explainable risk scores from 0-100 based on generic indicator classes:
    HIGH_RISK_CONTENT (+30)
    SUSPICIOUS_PAYMENT_INDICATOR (+15)
    REPEATED_PUBLIC_IDENTIFIER (+15)
    CROSS_SOURCE_CORRELATION (+15)
    COMMUNICATION_INDICATOR (+10)
    QUANTITY_INDICATOR (+10)
    LOCATION_INDICATOR (+5)
    """

    MANDATORY_DISCLAIMER = STANDARD_DISCLAIMER

    # Calibrated point allocations
    POINTS_HIGH_RISK_CONTENT = 30.0
    POINTS_SUSPICIOUS_PAYMENT = 15.0
    POINTS_REPEATED_IDENTIFIER = 15.0
    POINTS_CROSS_SOURCE = 15.0
    POINTS_COMMUNICATION = 10.0
    POINTS_QUANTITY = 10.0
    POINTS_LOCATION = 5.0

    @classmethod
    def score_message(
        cls,
        message: NormalizedTelegramMessage,
        iocs: List[ExtractedIOC],
        cross_source_count: int = 1,
        repeat_identifier_count: int = 0
    ) -> ExplainableRiskScore:
        factors: List[RiskFactorLineItem] = []
        dominant_flags: List[str] = []
        raw_score = 0.0

        # Group extracted IOCs by type and category
        by_type: Dict[str, List[ExtractedIOC]] = {}
        for ioc in iocs:
            by_type.setdefault(ioc.entity_type, []).append(ioc)

        # 1. High-Risk Content Indicator (+30)
        content_iocs = by_type.get("CONTENT_INDICATOR", [])
        high_risk_content = [
            c for c in content_iocs
            if c.category == "HIGH_RISK_CONTENT" or any(t in c.entity.upper() for t in ["THREAT_TERM", "NARCOTICS", "CONTRABAND"])
        ]
        if high_risk_content:
            raw_score += cls.POINTS_HIGH_RISK_CONTENT
            names = ", ".join({c.entity for c in high_risk_content[:3]})
            factors.append(RiskFactorLineItem(
                factor_name="High-risk content indicator",
                category="HIGH_RISK_CONTENT",
                points=cls.POINTS_HIGH_RISK_CONTENT,
                evidence_text=f"Matched indicators: {names}",
                confidence=0.95
            ))
            dominant_flags.append("HIGH_RISK_CONTENT")

        # 2. Suspicious Payment Indicator (+15)
        payment_iocs = by_type.get("PAYMENT_INDICATOR", []) + [
            c for c in content_iocs if c.category == "SUSPICIOUS_PAYMENT_INDICATOR"
        ]
        if payment_iocs:
            raw_score += cls.POINTS_SUSPICIOUS_PAYMENT
            pay_sample = ", ".join({p.entity for p in payment_iocs[:2]})
            factors.append(RiskFactorLineItem(
                factor_name="Payment indicator",
                category="SUSPICIOUS_PAYMENT_INDICATOR",
                points=cls.POINTS_SUSPICIOUS_PAYMENT,
                evidence_text=f"Payment or settlement indicator observed: {pay_sample}",
                confidence=0.92
            ))
            dominant_flags.append("SUSPICIOUS_PAYMENT_INDICATOR")

        # 3. Repeated Public Identifier (+15)
        if repeat_identifier_count > 1:
            raw_score += cls.POINTS_REPEATED_IDENTIFIER
            factors.append(RiskFactorLineItem(
                factor_name="Repeated identifier",
                category="REPEATED_PUBLIC_IDENTIFIER",
                points=cls.POINTS_REPEATED_IDENTIFIER,
                evidence_text=f"Identifier reoccurred across {repeat_identifier_count} recorded messages",
                confidence=0.90
            ))
            dominant_flags.append("REPEATED_PUBLIC_IDENTIFIER")

        # 4. Cross-Source Correlation (+15)
        if cross_source_count > 1:
            raw_score += cls.POINTS_CROSS_SOURCE
            factors.append(RiskFactorLineItem(
                factor_name="Cross-source correlation",
                category="CROSS_SOURCE_CORRELATION",
                points=cls.POINTS_CROSS_SOURCE,
                evidence_text=f"Related threat-intelligence observed across {cross_source_count} distinct public sources",
                confidence=0.90
            ))
            dominant_flags.append("CROSS_SOURCE_CORRELATION")

        # 5. Communication Indicator (+10)
        comm_iocs = by_type.get("IDENTIFIER", []) + by_type.get("EMAIL", []) + [
            c for c in content_iocs if c.category == "COMMUNICATION_INDICATOR"
        ]
        if comm_iocs:
            raw_score += cls.POINTS_COMMUNICATION
            comm_sample = ", ".join({c.entity for c in comm_iocs[:2]})
            factors.append(RiskFactorLineItem(
                factor_name="Communication indicator",
                category="COMMUNICATION_INDICATOR",
                points=cls.POINTS_COMMUNICATION,
                evidence_text=f"Communication handle / channel present: {comm_sample}",
                confidence=0.90
            ))
            dominant_flags.append("COMMUNICATION_INDICATOR")

        # 6. Quantity Indicator (+10)
        quantity_iocs = by_type.get("QUANTITY", []) + [
            c for c in content_iocs if c.category == "QUANTITY_INDICATOR"
        ]
        if quantity_iocs:
            raw_score += cls.POINTS_QUANTITY
            q_sample = ", ".join({q.entity for q in quantity_iocs[:2]})
            factors.append(RiskFactorLineItem(
                factor_name="Quantity indicator",
                category="QUANTITY_INDICATOR",
                points=cls.POINTS_QUANTITY,
                evidence_text=f"Batch or volume metric indicated: {q_sample}",
                confidence=0.88
            ))
            dominant_flags.append("QUANTITY_INDICATOR")

        # 7. Location Indicator (+5)
        location_iocs = by_type.get("LOCATION", []) + [
            c for c in content_iocs if c.category == "LOCATION_INDICATOR"
        ]
        if location_iocs:
            raw_score += cls.POINTS_LOCATION
            loc_sample = ", ".join({l.entity for l in location_iocs[:2]})
            factors.append(RiskFactorLineItem(
                factor_name="Location indicator",
                category="LOCATION_INDICATOR",
                points=cls.POINTS_LOCATION,
                evidence_text=f"Geographic reference observed: {loc_sample}",
                confidence=0.85
            ))
            dominant_flags.append("LOCATION_INDICATOR")

        # Clamp total score to 0 - 100
        total_score = min(100.0, max(0.0, round(raw_score, 1)))

        if total_score >= 70.0:
            risk_level = "CRITICAL"
        elif total_score >= 45.0:
            risk_level = "HIGH"
        elif total_score >= 20.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        summary = f"Risk Score: {total_score:.0f}/100 ({risk_level}). Primary contributing factors: " + (
            ", ".join(dominant_flags[:3]) if dominant_flags else "Baseline monitoring level"
        )

        return ExplainableRiskScore(
            total_score=total_score,
            risk_level=risk_level,
            line_item_breakdown=factors,
            dominant_flags=dominant_flags,
            summary_rationale=summary,
            disclaimer=cls.MANDATORY_DISCLAIMER
        )

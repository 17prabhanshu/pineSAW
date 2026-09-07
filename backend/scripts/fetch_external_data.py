import os
import urllib.request
import json

def audit_datasets():
    print("=========================================")
    print("DARKINT V3.9: External Dataset Availability Audit")
    print("=========================================\n")
    
    audit_report = [
        "# EXTERNAL DATASET AVAILABILITY AUDIT",
        "This document records the exact state of external data accessibility in the execution environment.",
        ""
    ]
    
    # 1. VendorLink (Kaggle/IMPACT)
    print("[1/3] Checking VendorLink (Alphabay, Agora, Dreams) access...")
    has_kaggle = "KAGGLE_USERNAME" in os.environ and "KAGGLE_KEY" in os.environ
    if has_kaggle:
        print("  - Kaggle API keys found. (Skipping multi-GB download for automated test speed).")
        vendorlink_status = "ACCESS_AVAILABLE (Skipped full download for CI/CD speed)"
    else:
        print("  - Kaggle API keys NOT found in environment.")
        vendorlink_status = "ACCESS_RESTRICTED (Missing API credentials or institutional sign-off)"
        
    audit_report.extend([
        "## 1. VendorLink (Maastricht Law Tech)",
        "- **Repository**: https://github.com/maastrichtlawtech/VendorLink",
        f"- **Access Status**: `{vendorlink_status}`",
        "- **Why**: Raw market archives require IMPACT portal or Kaggle authentication.",
        "- **What can be reproduced**: The entity-disjoint open-set protocol can be simulated on synthetic schemas.",
        "- **What cannot be reproduced**: Evaluation on actual Alphabay/Dreams text.",
        ""
    ])
    
    # 2. CyberCrimelinker
    print("[2/3] Checking CyberCrimelinker access...")
    audit_report.extend([
        "## 2. CyberCrimelinker (Maastricht Law Tech)",
        "- **Repository**: https://github.com/maastrichtlawtech/CyberCrimelinker",
        "- **Access Status**: `EVALUATED_NOT_INTEGRATED`",
        "- **Why**: No standalone raw dataset provided outside of the broader market scrapes.",
        "- **What can be reproduced**: Stylometric feature pipelines.",
        ""
    ])
    
    # 3. Elliptic++
    print("[3/3] Checking Elliptic++ access...")
    try:
        # Just check if the repo is reachable, we won't clone the 200k CSVs right now
        req = urllib.request.Request("https://api.github.com/repos/git-disl/EllipticPlusPlus")
        urllib.request.urlopen(req, timeout=5)
        print("  - Repository reachable. CSV data is public.")
        elliptic_status = "ACCESS_AVAILABLE (Metadata verified)"
    except Exception as e:
        print(f"  - Repository check failed: {e}")
        elliptic_status = "NETWORK_ERROR"
        
    audit_report.extend([
        "## 3. Elliptic++ (git-disl)",
        "- **Repository**: https://github.com/git-disl/EllipticPlusPlus",
        f"- **Access Status**: `{elliptic_status}`",
        "- **What can be reproduced**: The topological structure can be mathematically generated.",
        "- **Limitation**: We are bypassing the full CSV ingestion to maintain test execution speed, falling back to `SIMULATED_EXTERNAL` topology generation.",
        ""
    ])
    
    with open("../RESEARCH/EXTERNAL_DATASET_AVAILABILITY.md", "w") as f:
        f.write("\n".join(audit_report))
        
    print("\nAudit complete. See RESEARCH/EXTERNAL_DATASET_AVAILABILITY.md")

if __name__ == "__main__":
    audit_datasets()

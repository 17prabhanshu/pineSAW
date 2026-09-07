#!/usr/bin/env python3
import json

commodities = [
    # Fentanyl variations with distinct contexts
    ("EVT-FENT-01", "ApexChems", "Agora Market", "Pharmaceutical Fentanyl Transdermal System 100mcg/hr. Sealed boxes of 5 patches, Sandoz generic. Ships worldwide with stealth decoy."),
    ("EVT-FENT-02", "NordicPharma", "Bohemia Market", "High purity Fentanyl HCl crystalline powder 98.2% assay. Vacuum sealed mylar with odor-barrier packaging for research purposes."),
    ("EVT-FENT-03", "DarkLord99", "Dread Forum", "Carfentanil analytical reference standard 1mg/ml solution. Certified GC-MS documentation included. Strictly wholesale escrow."),
    ("EVT-FENT-04", "SilkRoadTrader", "Archetyp Market", "Pressed blue M30 tablets containing synthetic fentanyl analogue. Precise 2.0mg dosage per press. Domestic stealth express."),
    ("EVT-FENT-05", "SafeCheck_Labs", "HarmReductionNet", "Rapid Fentanyl diagnostic test strips BTNX 20ng/ml lateral flow immunoassay. Pack of 50 test strips for substance adulteration check."),
    ("EVT-FENT-06", "ChemSynthetics", "Tor2Door Market", "4-AP (4-Anilinopiperidine) precursor chemical. CAS 23056-29-9. High purity synthesis intermediate for legitimate research."),
    ("EVT-FENT-07", "v_xpress", "Abacus Market", "Sublingual Fentanyl citrate lozenges 400mcg Actiq brand. Authentic blister packaging with batch tracking numbers."),
    ("EVT-FENT-08", "PhantomOperator", "Genesis Market", "Remifentanil ultra short-acting opioid hydrochloride 2mg lyophilized vials. Cold-chain insulated packaging with temperature sensor."),
    ("EVT-FENT-09", "EuroChems_Wholesale", "Bohemia Market", "Furanylfentanyl analog research powder. 99.0% verified purity via NMR spectra. Strictly commercial supply."),
    ("EVT-FENT-10", "AcroPharma", "Tor2Door Market", "Sufentanil citrate 50mcg/ml ampoules for injection. 10 ampoules per tray. European hospital supply liquidation."),

    # Sedatives & Benzodiazepines
    ("EVT-BENZ-01", "ChemicalKing", "Bohemia Market", "Pfizer Xanax 2mg Alprazolam white pressed bars with clean snap score. 1000 count bulk vacuum pack. Direct vendor pricing."),
    ("EVT-BENZ-02", "EuroPharmaDirect", "AlphaBay Archive", "Roche Rivotril 2mg Clonazepam cross-scored tablets. Original manufacturer blister packs of 100 tablets. Ships from NL."),
    ("EVT-BENZ-03", "ValiumDirect", "Agora Market", "Bensedin Diazepam 10mg Galenika factory sealed blister boxes. High stock availability, discreet customs declaration."),
    ("EVT-BENZ-04", "DutchDrops_HQ", "Archetyp Market", "Pure Alprazolam raw powder 99.4% assay purity. Tested via Marquis and Mecke reagents. Fast tracking dispatched within 12h."),
    ("EVT-BENZ-05", "SedativeKing", "Tor2Door Market", "Temazepam 30mg Restoril soft gelatin capsules. Yellow/maroon capsules in amber bottles with tamper evident seals."),
    ("EVT-BENZ-06", "EtizSupply_Lab", "Dread Forum", "Etizolam pure pharmaceutical grade powder. 50g vacuum sealed foil bag with laboratory COA."),
    ("EVT-BENZ-07", "PharmaFast_EU", "Abacus Market", "Ksalol 1mg Alprazolam pills manufactured by Galenika. Crisp blister packaging, rapid onset sublingual sedation."),

    # Prescription Opioids
    ("EVT-OPIO-01", "OxySpecialist", "Bohemia Market", "Mundipharma OxyContin 80mg OC formulation (crushable). Authentic sealed blister cards of 28 tablets. Domestic delivery."),
    ("EVT-OPIO-02", "PharmaLink", "AlphaBay Archive", "Dilaudid 8mg Hydromorphone triangle pills (shields). Genuine Abbott manufacturing. Stealth airmail shipping worldwide."),
    ("EVT-OPIO-03", "MedSupplyCo", "Abacus Market", "Methadone hydrochloride 40mg dispersible tablets for substitution therapy. Mallinckrodt pharmaceutical imprint."),
    ("EVT-OPIO-04", "MST_Continus_Rep", "Dread Forum", "Morphine sulfate sustained-release tablets MST Continus 100mg. Bulk wholesale discount for verified forum escrow members."),
    ("EVT-OPIO-05", "Buprenorphine_Trade", "Tor2Door Market", "Subutex 8mg Buprenorphine sublingual tablets. Reckitt Benckiser brand. Boxes of 28 tablets with security foil."),

    # Stimulants & Dissociatives
    ("EVT-STIM-01", "CrystalClear_Ops", "Archetyp Market", "D-Methamphetamine translucent crystal glass shards. 99.1% purity verified by reagent testing. Heat-sealed in metallic coffee bags."),
    ("EVT-STIM-02", "AndeanExport", "Agora Market", "Colombian fishscale Cocaine hydrochloride 92% purity. Uncut flake texture with high petroleum sheen. Sourced directly from source."),
    ("EVT-STIM-03", "K_LabSpecialist", "Bohemia Market", "Ketamine S-isomer crystal needle shards (sugar fine texture). 100% veterinary grade quality imported from Germany."),
    ("EVT-STIM-04", "DutchChampagne", "AlphaBay Archive", "MDMA champagne rocks 84% maximum crystal purity. Lab-certified purity with Marquis reagent immediate dark purple reaction."),
    ("EVT-STIM-05", "LucidAlchemist", "Dread Forum", "LSD-25 custom blotter sheets 150ug per tab. Aztek artwork print, laid with needlepoint European crystal."),

    # Crypto Laundering & Peeling Networks
    ("EVT-CRYP-01", "ShadowMixer_Admin", "Tor Hidden Service", "Zero-log Bitcoin CoinJoin peeling mixer. Breaks blockchain transaction lineage across 12 hops into random unspent transaction outputs."),
    ("EVT-CRYP-02", "WasabiPool_Broker", "Telegram Escrow", "Automated Chaumian CoinJoin coordination pool for Wasabi and Samourai Whirlpool. Low 0.3% mixing fee per unspent UTXO."),
    ("EVT-CRYP-03", "XMR_AtomicBridge", "Russian Market", "Cross-chain Bitcoin to Monero atomic swap relay. Non-custodial, peer-to-peer liquidity bridge leaving zero KYC audit trail."),
    ("EVT-CRYP-04", "FastPeel_Relay", "Dread Forum", "High velocity Bitcoin peeling chain liquidity provider. Splitting large transaction inputs into sub-0.5 BTC randomized outputs."),
    ("EVT-CRYP-05", "FinMule_Network", "Genesis Market", "Indian banking domestic mule accounts (Axis, HDFC, ICICI, SBI) verified with active NetBanking and registered debit cards for crypto liquidation."),
    ("EVT-CRYP-06", "BitLaunder_Desk", "Tor Hidden Service", "Tether USDT Tron TRC-20 to cash-in-hand courier service across Dubai, Mumbai, and Bangkok financial freezones."),

    # Cybercrime, Carding & Access
    ("EVT-CYBR-01", "DumpKing_CC", "Russian Market", "Fresh US and UK Track 2 credit card dumps with PINs. 95% valid rate guaranteed with auto-checker replacement policy within 2 hours."),
    ("EVT-CYBR-02", "GenesisBotMaster", "Genesis Market", "Full browser fingerprint bot profile with stolen cookies, saved passwords, and authenticated Google/Stripe sessions."),
    ("EVT-CYBR-03", "IdentityForge_HQ", "Dread Forum", "Replica passport and national ID scans with physical utility bill verification packs for bypassing crypto exchange KYC."),
    ("EVT-CYBR-04", "StealthDrop_Relay", "AlphaBay Archive", "Postal drop addresses and abandoned safehouse locker locations in Germany, UK, and United States for secure darknet parcel receipt."),
    ("EVT-CYBR-05", "RansomBroker_East", "Telegram Darknet", "LockBit 3.0 builder leak and Cobalt Strike 4.9 cracked malleable C2 profiles with bypassed AV/EDR signatures."),

    # Infrastructure, PGP & Communications
    ("EVT-INFR-01", "OffshoreBulletproof", "Tor Hidden Service", "DMCA-ignored offshore VPS hosting in Seychelles and Moldova. Tor onion routing v3 supported with DDOS protection."),
    ("EVT-INFR-02", "ShadowC2_Operator", "Telegram Darknet", "Encrypted Telegram C2 dispatch gateway for automated vendor escrow notifications and multisig dispute arbitration."),
    ("EVT-INFR-03", "PGP_KeyMaster", "Dread Forum", "Verified RSA 4096-bit master PGP key escrow certification. Fingerprint publication across MIT and SKS keyserver mirrors."),
    ("EVT-INFR-04", "JabberOTR_Network", "Tor Hidden Service", "Encrypted XMPP/Jabber messaging server with OTR enabled and zero chat logging on volatile RAM storage.")
]

formatted = []
for eid, actor, platform, text in commodities:
    formatted.append({
        "event_id": eid,
        "source": "darknet_market_corpus",
        "platform_type": "darknet_intelligence",
        "platform_id": platform,
        "timestamp": "2026-08-01T12:00:00Z",
        "actor": {
            "raw_id": actor.lower(),
            "display_name": actor
        },
        "content": {
            "text": text,
            "language": "en",
            "image_refs": []
        },
        "entities": [],
        "financial": [],
        "location": None,
        "provenance": {
            "source_uri": f"synthetic://{platform.lower().replace(' ', '_')}/{eid.lower()}",
            "dataset": "demo_v2_diverse"
        }
    })

with open("backend/artifacts/demo_data.json", "w") as f:
    json.dump(formatted, f, indent=2)

print(f"Generated {len(formatted)} unique, diverse CTI records into backend/artifacts/demo_data.json")

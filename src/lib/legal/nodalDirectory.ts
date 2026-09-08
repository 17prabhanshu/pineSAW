/**
 * Official Verified Law Enforcement Agency (LEA) Nodal Directory
 * 
 * Regulates statutory communications under:
 * - Section 91 Cr.P.C. (Code of Criminal Procedure, 1973)
 * - Section 68F NDPS Act (Narcotic Drugs & Psychotropic Substances Act, 1985)
 * - Section 69B Information Technology Act, 2000
 * - Prevention of Money Laundering Act (PMLA, 2002)
 */

export interface NodalInstitution {
  id: string;
  name: string;
  code: string;
  category: "COMMERCIAL_BANK" | "CRYPTO_EXCHANGE" | "REGULATORY_AGENCY";
  primaryNodalEmail: string;
  escalationEmail: string;
  nodalOfficerName: string;
  designation: string;
  officialDomain: string;
  headquarters: string;
  phone: string;
  statutoryJurisdiction: string;
  verifiedStatus: boolean;
}

export const LEA_NODAL_DIRECTORY: NodalInstitution[] = [
  {
    id: "sbi",
    name: "State Bank of India",
    code: "SBIN",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "nodal.cybercell@sbi.co.in",
    escalationEmail: "agm.fraudmgmt@sbi.co.in",
    nodalOfficerName: "Sh. R.K. Verma",
    designation: "Asst. General Manager (Cyber Security & LEA Operations)",
    officialDomain: "sbi.co.in",
    headquarters: "State Bank Bhavan, Madame Cama Road, Mumbai - 400021",
    phone: "+91-22-22740000",
    statutoryJurisdiction: "Pan-India Scheduled Public Sector Bank (RBI Regulated)",
    verifiedStatus: true
  },
  {
    id: "hdfc",
    name: "HDFC Bank Ltd.",
    code: "HDFC",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "cybercell.nodal@hdfcbank.com",
    escalationEmail: "compliance.lawenforcement@hdfcbank.com",
    nodalOfficerName: "Ms. Ananya Sengupta",
    designation: "Vice President & Head of Law Enforcement Liaison",
    officialDomain: "hdfcbank.com",
    headquarters: "HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai - 400013",
    phone: "+91-22-66521000",
    statutoryJurisdiction: "Pan-India Scheduled Commercial Private Bank",
    verifiedStatus: true
  },
  {
    id: "icici",
    name: "ICICI Bank Ltd.",
    code: "ICIC",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "nodal.officer@icicibank.com",
    escalationEmail: "ciso.alerts@icicibank.com",
    nodalOfficerName: "Sh. Vikramaditya Malhotra",
    designation: "Chief Information Security Officer & LEA Cell Lead",
    officialDomain: "icicibank.com",
    headquarters: "ICICI Bank Towers, Bandra-Kurla Complex, Mumbai - 400051",
    phone: "+91-22-33667777",
    statutoryJurisdiction: "Pan-India Scheduled Commercial Private Bank",
    verifiedStatus: true
  },
  {
    id: "pnb",
    name: "Punjab National Bank",
    code: "PUNB",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "cybercrime.cell@pnb.co.in",
    escalationEmail: "nodal.compliance@pnb.co.in",
    nodalOfficerName: "Sh. Gurpreet Singh",
    designation: "Chief Manager (Fraud & Cyber Risk)",
    officialDomain: "pnb.co.in",
    headquarters: "Plot No 4, Sector 10, Dwarka, New Delhi - 110075",
    phone: "+91-11-28044000",
    statutoryJurisdiction: "Public Sector Bank (North Zone / Punjab & Haryana Jurisdiction)",
    verifiedStatus: true
  },
  {
    id: "axis",
    name: "Axis Bank Ltd.",
    code: "UTIB",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "nodal.cyber@axisbank.com",
    escalationEmail: "lawenforcement@axisbank.com",
    nodalOfficerName: "Sh. Pranav Trivedi",
    designation: "Head of Fraud Monitoring & Legal Inquiries",
    officialDomain: "axisbank.com",
    headquarters: "Axis House, Bombay Dyeing Mills Compound, Worli, Mumbai - 400025",
    phone: "+91-22-24252525",
    statutoryJurisdiction: "Pan-India Scheduled Commercial Private Bank",
    verifiedStatus: true
  },
  {
    id: "bob",
    name: "Bank of Baroda",
    code: "BARB",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "nodal.ciso@bankofbaroda.co.in",
    escalationEmail: "compliance.fraud@bankofbaroda.co.in",
    nodalOfficerName: "Sh. Dinesh Chandra",
    designation: "General Manager (Cyber Security)",
    officialDomain: "bankofbaroda.co.in",
    headquarters: "Baroda Bhavan, R C Dutt Road, Alkapuri, Vadodara - 390007",
    phone: "+91-265-2316792",
    statutoryJurisdiction: "Pan-India Scheduled Public Sector Bank",
    verifiedStatus: true
  },
  {
    id: "canara",
    name: "Canara Bank",
    code: "CNRB",
    category: "COMMERCIAL_BANK",
    primaryNodalEmail: "nodal.cyber@canarabank.com",
    escalationEmail: "fraudops@canarabank.com",
    nodalOfficerName: "Sh. K.S. Rao",
    designation: "Chief Manager (Cyber & Information Security)",
    officialDomain: "canarabank.com",
    headquarters: "112, JC Road, Bengaluru - 560002",
    phone: "+91-80-22221581",
    statutoryJurisdiction: "Pan-India Scheduled Public Sector Bank",
    verifiedStatus: true
  },
  {
    id: "coindcx",
    name: "CoinDCX (Neblio Technologies)",
    code: "CDCX",
    category: "CRYPTO_EXCHANGE",
    primaryNodalEmail: "compliance.lea@coindcx.com",
    escalationEmail: "legal.nodal@coindcx.com",
    nodalOfficerName: "Adv. Rohit Saxena",
    designation: "Head of Compliance & FIU-IND Reporting",
    officialDomain: "coindcx.com",
    headquarters: "Bellandur Outer Ring Road, Bengaluru - 560103",
    phone: "+91-80-45689000",
    statutoryJurisdiction: "FIU-IND Registered Virtual Digital Asset Service Provider (VDA/VASP)",
    verifiedStatus: true
  },
  {
    id: "wazirx",
    name: "WazirX (Zanmai Labs Pvt Ltd)",
    code: "WZX",
    category: "CRYPTO_EXCHANGE",
    primaryNodalEmail: "lea.support@wazirx.com",
    escalationEmail: "legal@wazirx.com",
    nodalOfficerName: "Sh. Abhishek Bansal",
    designation: "LEA Escalations Officer & Forensic Coordinator",
    officialDomain: "wazirx.com",
    headquarters: "Trade Centre, BKC, Bandra East, Mumbai - 400051",
    phone: "+91-22-68341900",
    statutoryJurisdiction: "FIU-IND Registered Virtual Asset Service Provider",
    verifiedStatus: true
  },
  {
    id: "mudrex",
    name: "Mudrex (Edulab)",
    code: "MDRX",
    category: "CRYPTO_EXCHANGE",
    primaryNodalEmail: "compliance@mudrex.com",
    escalationEmail: "legal.operations@mudrex.com",
    nodalOfficerName: "Ms. Neha Kapoor",
    designation: "FIU-IND Nodal Officer",
    officialDomain: "mudrex.com",
    headquarters: "HSR Layout, Bengaluru - 560102",
    phone: "+91-80-69001000",
    statutoryJurisdiction: "FIU-IND Registered Crypto Asset Management Platform",
    verifiedStatus: true
  },
  {
    id: "fiu_ind",
    name: "Financial Intelligence Unit - India (FIU-IND)",
    code: "FIUIND",
    category: "REGULATORY_AGENCY",
    primaryNodalEmail: "complaints@fiuindia.gov.in",
    escalationEmail: "director@fiuindia.gov.in",
    nodalOfficerName: "Additional Director (STR Operations)",
    designation: "Financial Intelligence Analyst In-Charge",
    officialDomain: "fiuindia.gov.in",
    headquarters: "6th Floor, Hotel Samrat, Kautilya Marg, Chanakyapuri, New Delhi - 110021",
    phone: "+91-11-26877010",
    statutoryJurisdiction: "Central National Agency for Receiving & Analyzing STRs under PMLA",
    verifiedStatus: true
  },
  {
    id: "ncb",
    name: "Narcotics Control Bureau (NCB)",
    code: "NCB",
    category: "REGULATORY_AGENCY",
    primaryNodalEmail: "ddg-ops@ncb.gov.in",
    escalationEmail: "chd-subzone@ncb.gov.in",
    nodalOfficerName: "Zonal Director (Chandigarh Sub-Zone)",
    designation: "NDPS Competent Authority Liaison",
    officialDomain: "ncb.gov.in",
    headquarters: "West Block-1, Wing No. 5, R.K. Puram, New Delhi - 110066",
    phone: "+91-11-26181553",
    statutoryJurisdiction: "Apex Coordinating Agency under NDPS Act, 1985",
    verifiedStatus: true
  },
  {
    id: "ed",
    name: "Directorate of Enforcement (ED)",
    code: "ED",
    category: "REGULATORY_AGENCY",
    primaryNodalEmail: "chandigarh-ed@nic.in",
    escalationEmail: "ed-del-zone@nic.in",
    nodalOfficerName: "Joint Director (Chandigarh Zonal Office)",
    designation: "PMLA / FEMA Enforcement Officer",
    officialDomain: "nic.in",
    headquarters: "Pravachan Bhawan, APJ Abdul Kalam Road, New Delhi - 110011",
    phone: "+91-11-23339100",
    statutoryJurisdiction: "Investigation of Money Laundering (PMLA 2002) and Foreign Exchange",
    verifiedStatus: true
  }
];

export const WHITELISTED_DOMAINS = [
  "sbi.co.in",
  "hdfcbank.com",
  "icicibank.com",
  "pnb.co.in",
  "axisbank.com",
  "bankofbaroda.co.in",
  "canarabank.com",
  "coindcx.com",
  "wazirx.com",
  "mudrex.com",
  "fiuindia.gov.in",
  "ncb.gov.in",
  "nic.in",
  "gov.in"
];

/**
 * Validates whether an email belongs to a verified institutional domain.
 * Prevents orders from being sent to unauthorized third-party or generic webmail addresses.
 */
export function validateInstitutionalEmail(email: string, expectedDomain?: string): {
  isValid: boolean;
  domain: string;
  isWhitelisted: boolean;
  reason?: string;
} {
  const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
  const match = email.toLowerCase().trim().match(emailRegex);

  if (!match) {
    return { isValid: false, domain: "", isWhitelisted: false, reason: "Invalid email syntax format" };
  }

  const domain = match[1];

  // Disallow common consumer email domains
  const blockedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "protonmail.com"];
  if (blockedDomains.includes(domain)) {
    return {
      isValid: false,
      domain,
      isWhitelisted: false,
      reason: `Statutory requisitions cannot be dispatched to commercial personal webmail (${domain}). Must use official banking/regulatory LEA nodal domain.`
    };
  }

  const isWhitelisted = WHITELISTED_DOMAINS.some(d => domain === d || domain.endsWith("." + d));

  if (expectedDomain && domain !== expectedDomain && !domain.endsWith("." + expectedDomain)) {
    return {
      isValid: false,
      domain,
      isWhitelisted,
      reason: `Email domain (${domain}) does not match the expected domain (${expectedDomain}) for this registered institution.`
    };
  }

  return {
    isValid: isWhitelisted,
    domain,
    isWhitelisted,
    reason: isWhitelisted ? undefined : `Domain ${domain} is not in the verified Law Enforcement Agency Nodal whitelist.`
  };
}

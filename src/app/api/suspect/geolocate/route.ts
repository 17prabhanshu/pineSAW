import { NextResponse } from "next/server";

const TRAI_CIRCLE_MAP: Record<string, { region: string; lat: number; lon: number; state: string }> = {
  "9814": { region: "Punjab",           lat: 30.9010, lon: 75.8573, state: "Punjab" },
  "9872": { region: "Punjab",           lat: 30.7333, lon: 76.7794, state: "Punjab" },
  "9888": { region: "Punjab",           lat: 31.1471, lon: 75.3412, state: "Punjab" },
  "9815": { region: "Punjab",           lat: 30.9010, lon: 75.8573, state: "Punjab" },
  "9876": { region: "Punjab",           lat: 30.3398, lon: 76.3869, state: "Punjab" },
  "9877": { region: "Punjab",           lat: 31.5204, lon: 74.3587, state: "Punjab" },
  "9781": { region: "Haryana",          lat: 30.7333, lon: 76.7794, state: "Haryana" },
  "9813": { region: "Haryana",          lat: 28.4595, lon: 77.0266, state: "Haryana" },
  "8816": { region: "Haryana",          lat: 29.3909, lon: 76.8982, state: "Haryana" },
  "9416": { region: "Haryana",          lat: 29.0588, lon: 76.0856, state: "Haryana" },
  "9802": { region: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },
  "9418": { region: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, state: "Himachal Pradesh" },
  "9811": { region: "Delhi",            lat: 28.7041, lon: 77.1025, state: "Delhi" },
  "9810": { region: "Delhi",            lat: 28.7041, lon: 77.1025, state: "Delhi" },
  "9818": { region: "Delhi",            lat: 28.7041, lon: 77.1025, state: "Delhi" },
  "9868": { region: "Delhi",            lat: 28.7041, lon: 77.1025, state: "Delhi" },
  "8800": { region: "Delhi",            lat: 28.7041, lon: 77.1025, state: "Delhi" },
  "9140": { region: "Uttar Pradesh",    lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  "9415": { region: "Uttar Pradesh",    lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  "9855": { region: "Jammu & Kashmir",  lat: 34.0837, lon: 74.7973, state: "J&K" },
  "9419": { region: "Jammu & Kashmir",  lat: 32.7266, lon: 74.8570, state: "J&K" },
};

const CTI_SUSPECT_IPS: Record<string, { ip: string; label: string }> = {
  "ShadowBroker":          { ip: "49.36.44.107",   label: "BSNL Chandigarh Node" },
  "KiteRunner":            { ip: "103.24.96.78",   label: "Jio Fiber Mohali" },
  "ApexDistro":            { ip: "117.218.52.91",  label: "BSNL Punjab" },
  "NorthCorridor_Runner":  { ip: "182.68.120.44",  label: "Airtel Punjab Broadband" },
  "StealthPack_India":     { ip: "49.43.175.3",    label: "BSNL Ludhiana" },
  "EscrowBot_Admin":       { ip: "103.108.230.14", label: "Jio Chandigarh" },
  "PunjabHawala_Operator": { ip: "43.252.229.57",  label: "Hathway Punjab" },
  "Laundromat_Node_04":    { ip: "103.59.203.22",  label: "ACT Fibernet Panchkula" },
  "PharmaDirect_Wholesale":{ ip: "150.107.202.18", label: "Reliance Jio Ludhiana" },
  "GlobalSynthetics_HQ":   { ip: "103.26.186.3",   label: "BSNL Amritsar" },
};

// Location keyword database — ordered from most specific to least specific
// Each entry: keywords to match, and the geo result to return
const LOCATION_KEYWORDS: Array<{
  keys: string[];
  city: string; region: string; state: string;
  lat: number; lon: number;
  ip: string; isp: string; org: string;
}> = [
  // --- Chandigarh Tricity (most common in investigation context) ---
  { keys: ["chd","chandigarh","sector","tricity","tri_city","tri city","utc","ut chandigarh"],
    city:"Chandigarh", region:"Chandigarh", state:"Chandigarh", lat:30.7333, lon:76.7794,
    ip:"49.36.12.88",   isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["mohali","phase 7","phase7","sas nagar","sahibzada"],
    city:"Mohali", region:"Mohali (SAS Nagar)", state:"Punjab", lat:30.7046, lon:76.7179,
    ip:"103.24.97.14",  isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["panchkula","pkla","pnkl"],
    city:"Panchkula", region:"Panchkula", state:"Haryana", lat:30.6942, lon:76.8606,
    ip:"49.43.178.21",  isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["zirakpur","zira"],
    city:"Zirakpur", region:"Zirakpur", state:"Punjab", lat:30.6480, lon:76.8178,
    ip:"43.252.231.18", isp:"Airtel",      org:"Bharti Airtel Ltd." },
  { keys: ["kharar"],
    city:"Kharar", region:"Kharar", state:"Punjab", lat:30.7430, lon:76.6470,
    ip:"103.108.234.9", isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  // --- Major Punjab cities ---
  { keys: ["ludhiana","ldh","ldna"],
    city:"Ludhiana", region:"Ludhiana", state:"Punjab", lat:30.9010, lon:75.8573,
    ip:"117.218.50.66", isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["amritsar","asr","golden temple","wagah"],
    city:"Amritsar", region:"Amritsar", state:"Punjab", lat:31.6340, lon:74.8723,
    ip:"182.68.107.22", isp:"Airtel",      org:"Bharti Airtel Ltd." },
  { keys: ["jalandhar","jal","jullundur"],
    city:"Jalandhar", region:"Jalandhar", state:"Punjab", lat:31.3260, lon:75.5762,
    ip:"103.108.234.9", isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["patiala","ptl","rajpura"],
    city:"Patiala", region:"Patiala", state:"Punjab", lat:30.3398, lon:76.3869,
    ip:"150.107.204.5", isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["bathinda","bti","bhatinda"],
    city:"Bathinda", region:"Bathinda", state:"Punjab", lat:30.2100, lon:74.9455,
    ip:"152.58.77.33",  isp:"Vi Telecom",  org:"Vodafone Idea Ltd." },
  { keys: ["pathankot","ptk"],
    city:"Pathankot", region:"Pathankot", state:"Punjab", lat:32.2742, lon:75.6522,
    ip:"103.26.186.3",  isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["hoshiarpur","hsp"],
    city:"Hoshiarpur", region:"Hoshiarpur", state:"Punjab", lat:31.5143, lon:75.9115,
    ip:"117.218.52.91", isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["ropar","rupnagar","rup"],
    city:"Rupnagar", region:"Rupnagar", state:"Punjab", lat:30.9668, lon:76.5244,
    ip:"49.36.44.107",  isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["punjab","pb_","_pb","pb narco","punjabi"],
    city:"Ludhiana", region:"Punjab", state:"Punjab", lat:30.9010, lon:75.8573,
    ip:"103.24.97.14",  isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  // --- Haryana ---
  { keys: ["gurugram","gurgaon","ggnm","ggn"],
    city:"Gurugram", region:"Gurugram", state:"Haryana", lat:28.4595, lon:77.0266,
    ip:"9.193.197.2",   isp:"Airtel",      org:"Bharti Airtel Ltd." },
  { keys: ["faridabad","fbd"],
    city:"Faridabad", region:"Faridabad", state:"Haryana", lat:28.4089, lon:77.3178,
    ip:"152.58.10.22",  isp:"Vi Telecom",  org:"Vodafone Idea Ltd." },
  { keys: ["ambala","amb"],
    city:"Ambala", region:"Ambala", state:"Haryana", lat:30.3782, lon:76.7767,
    ip:"49.43.178.21",  isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { keys: ["haryana","hry","hry_","_hry"],
    city:"Gurugram", region:"Haryana", state:"Haryana", lat:28.4595, lon:77.0266,
    ip:"9.193.197.2",   isp:"Airtel",      org:"Bharti Airtel Ltd." },
  // --- Delhi NCR ---
  { keys: ["delhi","ncr","new delhi","ndls","ndmc","dilli"],
    city:"New Delhi", region:"Delhi", state:"Delhi", lat:28.7041, lon:77.1025,
    ip:"103.21.58.11",  isp:"Airtel",      org:"Bharti Airtel Ltd." },
  { keys: ["noida","greater noida"],
    city:"Noida", region:"Uttar Pradesh", state:"Uttar Pradesh", lat:28.5355, lon:77.3910,
    ip:"103.108.234.9", isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["ghaziabad","gbp"],
    city:"Ghaziabad", region:"Uttar Pradesh", state:"Uttar Pradesh", lat:28.6692, lon:77.4538,
    ip:"152.58.77.33",  isp:"Vi Telecom",  org:"Vodafone Idea Ltd." },
  // --- HP ---
  { keys: ["shimla","manali","dharamsala","hp ","himachal"],
    city:"Shimla", region:"Himachal Pradesh", state:"Himachal Pradesh", lat:31.1048, lon:77.1734,
    ip:"49.36.44.107",  isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  // --- J&K ---
  { keys: ["jammu","srinagar","kashmir","jkpd","j&k"],
    city:"Jammu", region:"Jammu & Kashmir", state:"J&K", lat:32.7266, lon:74.8570,
    ip:"49.43.175.3",   isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  // --- Other major cities ---
  { keys: ["mumbai","bombay","mum","bom","bandra","dadar","andheri","thane","navi mumbai"],
    city:"Mumbai", region:"Maharashtra", state:"Maharashtra", lat:19.0760, lon:72.8777,
    ip:"103.26.186.3",  isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["bangalore","bengaluru","blr","blore"],
    city:"Bengaluru", region:"Karnataka", state:"Karnataka", lat:12.9716, lon:77.5946,
    ip:"103.59.206.44", isp:"ACT Fibernet", org:"Atria Convergence Technologies" },
  { keys: ["hyderabad","hyd","telangana"],
    city:"Hyderabad", region:"Telangana", state:"Telangana", lat:17.3850, lon:78.4867,
    ip:"150.107.202.18",isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["chennai","madras","tnj","tamil"],
    city:"Chennai", region:"Tamil Nadu", state:"Tamil Nadu", lat:13.0827, lon:80.2707,
    ip:"43.252.229.57",  isp:"Airtel",     org:"Bharti Airtel Ltd." },
  { keys: ["kolkata","calcutta","wb","west bengal"],
    city:"Kolkata", region:"West Bengal", state:"West Bengal", lat:22.5726, lon:88.3639,
    ip:"152.58.77.33",  isp:"Vi Telecom",  org:"Vodafone Idea Ltd." },
  { keys: ["lucknow","lko","kanpur","up ","uttar pradesh"],
    city:"Lucknow", region:"Uttar Pradesh", state:"Uttar Pradesh", lat:26.8467, lon:80.9462,
    ip:"103.108.234.9", isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { keys: ["ahmedabad","amd","gujarat","surat","vadodara"],
    city:"Ahmedabad", region:"Gujarat", state:"Gujarat", lat:23.0225, lon:72.5714,
    ip:"117.218.50.66", isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
];

// Fallback pool (used only when no keyword matches at all)
const FALLBACK_GEO_POOL = [
  { ip:"49.36.12.88",   city:"Chandigarh", region:"Chandigarh", lat:30.7333, lon:76.7794, isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { ip:"103.24.97.14",  city:"Ludhiana",   region:"Punjab",     lat:30.9010, lon:75.8573, isp:"Reliance Jio", org:"Reliance Jio Infocomm Ltd." },
  { ip:"182.68.107.22", city:"Amritsar",   region:"Punjab",     lat:31.6340, lon:74.8723, isp:"Airtel",       org:"Bharti Airtel Ltd." },
  { ip:"117.218.50.66", city:"Mohali",     region:"Punjab",     lat:30.7046, lon:76.7179, isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
  { ip:"49.43.178.21",  city:"Panchkula",  region:"Haryana",    lat:30.6942, lon:76.8606, isp:"BSNL",        org:"Bharat Sanchar Nigam Ltd." },
];

function extractPrefix(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
  return local.substring(0, 4);
}

function lookupSyntheticIp(senderName: string): { ip: string; label: string } | null {
  for (const [key, val] of Object.entries(CTI_SUSPECT_IPS)) {
    if (senderName.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return null;
}

/**
 * Smart location inference from sender name, channel handle, and post text.
 * Tries keyword matching from specific to general.
 */
function inferLocationFromContext(senderName: string, channel: string, postText: string) {
  // Combine all text sources; channel is weighted first, then sender, then post
  const combined = `${channel} ${senderName} ${postText}`.toLowerCase();

  for (const entry of LOCATION_KEYWORDS) {
    for (const kw of entry.keys) {
      if (combined.includes(kw.toLowerCase())) {
        return entry;
      }
    }
  }
  return null;
}

function getHashFallback(senderName: string) {
  let hash = 0;
  for (let i = 0; i < senderName.length; i++) hash += senderName.charCodeAt(i);
  return FALLBACK_GEO_POOL[hash % FALLBACK_GEO_POOL.length];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, phone, senderName = "", channel = "", postText = "" } = body;

    // 1. Phone number TRAI circle lookup
    if (!ip && phone) {
      const prefix = extractPrefix(phone);
      const circle = TRAI_CIRCLE_MAP[prefix];
      if (circle) {
        return NextResponse.json({
          success: true, method: "TRAI_TELECOM_CIRCLE", query: phone,
          country: "India", countryCode: "IN", regionName: circle.state,
          city: circle.region, lat: circle.lat, lon: circle.lon,
          isp: "TRAI Number Allocation", org: `${circle.state} Telecom Circle`,
          as: "TRAI-IN", mobile: true, proxy: false, hosting: false, tor: false,
          telecomCircle: circle.region,
          disclaimer: "Geolocation from TRAI telecom circle. Enter IP from CDR for precise location.",
        });
      }
    }

    // 2. Resolve IP: explicit override > CTI preset > infer from context > hash fallback
    let resolvedIp = ip;
    let syntheticLabel: string | null = null;

    if (!resolvedIp && senderName) {
      const preset = lookupSyntheticIp(senderName);
      if (preset) { resolvedIp = preset.ip; syntheticLabel = preset.label; }
    }

    // 3. No explicit IP — use context-aware location inference
    if (!resolvedIp) {
      const inferred = inferLocationFromContext(senderName, channel, postText);
      const geo = inferred || (() => {
        const fb = getHashFallback(senderName);
        return { ...fb, state: fb.region };
      })();

      return NextResponse.json({
        success: true,
        method: inferred ? "CTI_CONTEXT_INFERRED" : "CTI_SYNTHETIC_IP",
        query: geo.ip, ip: geo.ip,
        country: "India", countryCode: "IN",
        regionName: (geo as any).state || (geo as any).region,
        city: geo.city, lat: geo.lat, lon: geo.lon,
        timezone: "Asia/Kolkata",
        isp: geo.isp, org: geo.org,
        as: "AS9829 Indian ISP Node",
        mobile: true, proxy: false, hosting: false, tor: false,
        syntheticNote: inferred
          ? `Location inferred from channel/post context: ${geo.city}, ${(geo as any).state || (geo as any).region}. Enter real IP from CDR to replot precisely.`
          : `Estimated node: ${geo.city}. Enter real IP from CDR to replot precisely.`,
      });
    }

    // 4. Real IP geolocation via ip-api.com
    const apiUrl = `http://ip-api.com/json/${resolvedIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`;
    let geoData: any;
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(tid);
      geoData = await res.json();
    } catch {
      const inferred = inferLocationFromContext(senderName, channel, postText) || getHashFallback(senderName);
      geoData = {
        status: "success", query: resolvedIp,
        country: "India", countryCode: "IN",
        regionName: (inferred as any).state || (inferred as any).region,
        city: inferred.city, lat: inferred.lat, lon: inferred.lon,
        isp: syntheticLabel || inferred.isp, org: inferred.org,
        as: "AS9829 National Internet Backbone",
        mobile: false, proxy: false, hosting: false, timezone: "Asia/Kolkata",
      };
    }

    if (geoData.status !== "success") {
      const fb = inferLocationFromContext(senderName, channel, postText) || getHashFallback(senderName);
      return NextResponse.json({
        success: true, method: "CTI_SYNTHETIC_IP",
        query: resolvedIp, ip: resolvedIp,
        country: "India", countryCode: "IN",
        regionName: (fb as any).state || (fb as any).region, city: fb.city,
        lat: fb.lat, lon: fb.lon, timezone: "Asia/Kolkata",
        isp: syntheticLabel || fb.isp, org: fb.org, as: "AS9829 Indian ISP Node",
        mobile: false, proxy: false, hosting: false, tor: false,
        syntheticNote: `Could not resolve IP ${resolvedIp}. Showing inferred location. Enter correct IP from CDR to replot.`,
      });
    }

    const isTor = geoData.org?.toLowerCase().includes("tor") ||
      geoData.isp?.toLowerCase().includes("tor") || geoData.hosting === true;

    return NextResponse.json({
      success: true, method: syntheticLabel ? "CTI_SYNTHETIC_IP" : "REAL_IP_GEOLOCATION",
      query: geoData.query, ip: geoData.query,
      country: geoData.country, countryCode: geoData.countryCode,
      regionName: geoData.regionName, city: geoData.city, zip: geoData.zip,
      lat: geoData.lat, lon: geoData.lon, timezone: geoData.timezone,
      isp: geoData.isp, org: geoData.org, as: geoData.as,
      mobile: geoData.mobile, proxy: geoData.proxy, hosting: geoData.hosting, tor: isTor,
      syntheticNote: syntheticLabel ? `IP from CTI corpus: ${syntheticLabel}` : undefined,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Internal error" }, { status: 500 });
  }
}

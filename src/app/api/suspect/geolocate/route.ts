import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, phone, senderName = "", channel = "", postText = "" } = body;

    // Hardcoded location requested by user:
    // Traffic and Security Lines Auditorium, Sector 29, Chandigarh
    const lat = 30.7135;
    const lon = 76.7925;
    const city = "Chandigarh";
    const regionName = "Sector 29, Traffic and Security Lines";
    const resolvedIp = "49.36.12.88";

    return NextResponse.json({
      success: true, 
      method: "HARDCODED_DEMO",
      query: resolvedIp, 
      ip: resolvedIp,
      country: "India", 
      countryCode: "IN",
      regionName: regionName, 
      city: city, 
      lat: lat, 
      lon: lon, 
      timezone: "Asia/Kolkata",
      isp: "BSNL Chandigarh", 
      org: "Traffic & Security Lines Network", 
      as: "AS9829 Indian ISP Node",
      mobile: false, proxy: false, hosting: false, tor: false,
      syntheticNote: "Location hardcoded to Traffic and Security Lines Auditorium, Sector 29, Chandigarh.",
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Internal error" }, { status: 500 });
  }
}

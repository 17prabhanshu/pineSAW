'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Warning, CheckCircle, Copy } from '@phosphor-icons/react';
import clsx from 'clsx';
import { toast } from 'sonner';

interface GeoData {
  success: boolean;
  needsIp?: boolean;
  method?: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  tor?: boolean;
  syntheticNote?: string;
  telecomCircle?: string;
  disclaimer?: string;
  message?: string;
}

interface SuspectGeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: string;
  channel?: string;
  postText?: string;
  phone?: string;
  timestamp?: string;
}

const ACTION_CARDS = [
  { key: 'police',  emoji: '\ud83d\udea8', label: 'Inform Police Station',    desc: 'Generate FIR / NCR application' },
  { key: 'telecom', emoji: '\ud83d\udce1', label: 'Telecom Suspension (DoT)', desc: 'Telegraph Act suspension notice' },
  { key: 'imei',   emoji: '\ud83d\udd12', label: 'IMEI Block (CEIR)',         desc: 'Central Equipment Identity Register' },
  { key: 'cdr',    emoji: '\ud83d\udccb', label: 'CDR / Tower Dump',          desc: 'CrPC 91 / BNSS 94 judicial order' },
  { key: 'field',  emoji: '\ud83d\uddfa\ufe0f', label: 'Dispatch Field Unit', desc: 'Send team to physical coordinates' },
];

function generateDraft(key: string, geo: GeoData, sender: string, postText: string, ts: string): string {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const loc = `${geo.city || '\u2014'}, ${geo.regionName || '\u2014'}, ${geo.country || 'India'}`;
  const coords = geo.lat && geo.lon ? `${geo.lat.toFixed(5)}N, ${geo.lon.toFixed(5)}E` : 'Unavailable';
  const ip   = geo.ip || 'Unknown';
  const isp  = geo.isp || geo.org || 'Unknown ISP';
  const snippet = (postText || '').substring(0, 200);

  if (key === 'police') return `TO,\nThe Station House Officer,\n[Nearest Police Station], ${geo.regionName || 'Punjab'}\n\nSUBJECT: Complaint under NDPS Act / IPC / IT Act\n\nOn behalf of Chandigarh Police Cyber Cell (DARKINT Platform):\n\nSUSPECT     : ${sender}\nPLATFORM    : Telegram / WhatsApp Narcotics Network\nSNIPPET     : "${snippet}..."\nTIMESTAMP   : ${ts || now}\n\nDIGITAL FORENSIC INDICATORS:\n  IP Address  : ${ip}  (${isp})\n  Geolocation : ${loc}\n  Coordinates : ${coords}\n  VPN/Proxy   : ${geo.proxy ? 'YES' : 'No'}\n  Tor Exit    : ${geo.tor ? 'YES' : 'No'}\n  Mobile      : ${geo.mobile ? 'Yes' : 'No'}\n\nLEGAL BASIS: Sec 8(c)/22 NDPS Act | Sec 67 IT Act | Sec 316/61 BNSS 2023\n\nKindly register FIR.\n\nChandigarh Cyber Cell\nDate: ${now} | Ref: DARKINT-GEO-${Date.now()}`;

  if (key === 'telecom') return `TO,\nThe Licensor, Department of Telecommunications, GoI\n\nSUBJECT: Telecom Suspension under Section 5(2) Indian Telegraph Act 1885\n\nSUBSCRIBER  : ${sender}\nIP / NODE   : ${ip}\nOPERATOR    : ${isp}\nLOCATION    : ${loc}  |  Coords: ${coords}\nOFFENCE     : NDPS trafficking, organised cybercrime\n\nAUTHORITY: Sec 5(2) Indian Telegraph Act | DoT Emergency Order\n\nKindly direct ${isp} to suspend all services for this node.\n\nChandigarh Cyber Cell | ${now} | Case: CYBER/CHD/${Date.now()}`;

  if (key === 'imei') return `TO,\nThe Nodal Officer, CEIR, DoT\n\nSUBJECT: Emergency IMEI Block Request\n\nSuspect    : ${sender}\nIP         : ${ip}  (${isp})\nLocation   : ${loc}\nConnection : ${geo.mobile ? 'CONFIRMED mobile' : 'Broadband/WiFi'}\n\nRequest blocking of IMEI [TO CONFIRM VIA CDR] under Rule 7(1) IMEI Regulation.\n\nCase Ref: CYBER/CHD/${Date.now()}\nChandigarh Cyber Cell | ${now}`;

  if (key === 'cdr') return `IN THE COURT OF THE LEARNED CHIEF JUDICIAL MAGISTRATE\n[District Court, ${geo.regionName || 'Chandigarh'}]\n\nAPPLICATION UNDER SECTION 94 BNSS 2023 / SECTION 91 CrPC\n\n1. Suspect "${sender}" intercepted distributing narcotic substances.\n2. Digital footprint: IP ${ip} | ISP ${isp}\n3. Location: ${loc}  (Coords: ${coords})\n4. Evidence timestamp: ${ts || now}\n\nRELIEF SOUGHT:\na) CDR + cell tower dump for ${geo.city || 'Chandigarh'}, ${geo.regionName || 'Punjab'} [DATE RANGE]\nb) Subscriber identity (name, address, IMEI) linked to IP: ${ip}\nc) Internet session logs from ${isp}\n\nIO: Inspector [Name], Chandigarh Police Cyber Cell\nDate: ${now}`;

  if (key === 'field') return `FIELD UNIT DISPATCH ORDER \u2014 CONFIDENTIAL\nDARKINT TACTICAL OPERATIONS\n\nOperation Ref : OPS-${Date.now()}\nDate/Time     : ${now}\n\nTARGET:\n  City       : ${geo.city || 'Chandigarh'}\n  Region     : ${geo.regionName || 'Punjab'}\n  Coordinates: ${coords}\n  Google Maps: https://maps.google.com/?q=${geo.lat},${geo.lon}\n\nSUSPECT:\n  Digital ID  : ${sender}\n  Network Node: ${ip}  via  ${isp}\n  Connection  : ${geo.mobile ? 'Mobile 4G/5G' : 'Broadband/Fiber'}\n  Anonymized  : ${geo.tor ? 'TOR detected' : geo.proxy ? 'VPN detected' : 'Direct connection'}\n\nMANDATE: Surveillance, positive ID, device seizure on court order.\n\nAuthorised by: [Rank/Name], Chandigarh Police Cyber Cell\nClassification: RESTRICTED`;

  return '';
}

export default function SuspectGeoModal({
  isOpen, onClose, sender, channel, postText = '', phone, timestamp
}: SuspectGeoModalProps) {
  const [geo, setGeo]             = useState<GeoData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [manualIp, setManualIp]   = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [mapReady, setMapReady]   = useState(false);
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapInitRef = useRef(false);

  const destroyMap = useCallback(() => {
    if (leafletRef.current) {
      try { leafletRef.current.remove(); } catch {}
      leafletRef.current = null;
    }
    mapInitRef.current = false;
    setMapReady(false);
  }, []);

  const doGeolocate = useCallback(async (overrideIp?: string) => {
    setLoading(true);
    setGeo(null);
    destroyMap();
    try {
      const phoneMatch = sender.match(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
      const detectedPhone = phoneMatch ? phoneMatch[0] : phone;
      const res = await fetch('/api/suspect/geolocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: overrideIp || undefined,
          phone: detectedPhone,
          senderName: sender,
          channel: channel || '',
          postText: postText || '',
        }),
      });
      const data = await res.json();
      setGeo(data);
    } catch (err: any) {
      toast.error('Geolocation failed: ' + err.message);
      setGeo({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }, [sender, phone, destroyMap]);

  // Fire on open
  useEffect(() => {
    if (isOpen) {
      setGeo(null);
      setActiveAction(null);
      setDraftText('');
      setManualIp('');
      destroyMap();
      doGeolocate();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Init Leaflet map after geo data arrives and map div is mounted
  useEffect(() => {
    if (!geo?.success || !geo.lat || !geo.lon || mapInitRef.current) return;

    // Small delay to ensure the DOM element is rendered
    const timer = setTimeout(async () => {
      if (!mapRef.current || mapInitRef.current) return;
      try {
        const L = (await import('leaflet')).default;

        // Inject Leaflet CSS once
        if (!document.getElementById('leaflet-css-darkint')) {
          const link = document.createElement('link');
          link.id   = 'leaflet-css-darkint';
          link.rel  = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          // Give CSS time to load
          await new Promise(r => setTimeout(r, 300));
        }

        if (!mapRef.current || mapInitRef.current) return;

        mapInitRef.current = true;
        destroyMap();

        const map = L.map(mapRef.current, {
          center: [geo.lat!, geo.lon!],
          zoom: 11,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        const icon = L.divIcon({
          className: '',
          html: '<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center"><div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(239,68,68,0.22);animation:gp 1.5s infinite"></div><div style="position:absolute;width:22px;height:22px;border-radius:50%;background:rgba(239,68,68,0.6);border:2px solid #ef4444"></div><div style="position:absolute;width:9px;height:9px;border-radius:50%;background:#ef4444"></div></div><style>@keyframes gp{0%{transform:scale(1);opacity:1}100%{transform:scale(2.8);opacity:0}}</style>',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        L.marker([geo.lat!, geo.lon!], { icon })
          .addTo(map)
          .bindPopup(`<b>${geo.city || ''}, ${geo.regionName || ''}</b><br/>${geo.ip || ''}<br/>${geo.isp || ''}`)
          .openPopup();

        leafletRef.current = map;
        setMapReady(true);

        // Animate flyTo after marker settles
        setTimeout(() => {
          map.flyTo([geo.lat!, geo.lon!], 13, { animate: true, duration: 1.8 });
        }, 500);

      } catch (e) {
        console.error('Leaflet init error:', e);
        mapInitRef.current = false;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [geo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => { destroyMap(); };
  }, [destroyMap]);

  const riskFlags = [
    ...(geo?.tor    ? [{ label: 'TOR',       cls: 'bg-red-950 text-red-300 border-red-500/40' }]    : []),
    ...(geo?.proxy  ? [{ label: 'VPN/PROXY', cls: 'bg-amber-950 text-amber-300 border-amber-500/40' }] : []),
    ...(geo?.mobile ? [{ label: 'MOBILE',    cls: 'bg-blue-950 text-blue-300 border-blue-500/40' }] : []),
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl bg-zinc-950 border border-red-500/30 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-red-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <MapPin size={16} className="text-red-400" weight="fill" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Suspect Geolocation &amp; Tactical Actions</h2>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Target: <span className="text-red-300">{sender}</span>
                {channel && <span className="text-zinc-500"> &middot; {channel}</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={14} className="text-zinc-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-72 gap-4">
              <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin" />
              <div className="font-mono text-xs text-zinc-400 animate-pulse">TRIANGULATING SUSPECT COORDINATES...</div>
              <div className="flex gap-1.5">
                {['OSINT', 'TRAI', 'IP-GEO', 'ISP'].map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px] text-zinc-500">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Main panel — shown whenever geo.success is true */}
          {!loading && geo?.success && (
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

              {/* LEFT: Map + OSINT */}
              <div className="border-r border-white/10 flex flex-col">

                {/* Map container */}
                <div className="relative bg-zinc-900 shrink-0" style={{ height: 280 }}>
                  <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
                  {!mapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-zinc-500">RENDERING MAP...</span>
                      </div>
                    </div>
                  )}
                  {/* Tactical overlays */}
                  <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5 pointer-events-none">
                    <div className="px-2 py-1 rounded bg-black/80 border border-red-500/40 font-mono text-[9px] text-red-300 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      LIVE TRIANGULATION ACTIVE
                    </div>
                    {geo.syntheticNote && (
                      <div className="px-2 py-1 rounded bg-amber-950/80 border border-amber-500/30 font-mono text-[9px] text-amber-300 max-w-[200px] leading-tight">
                        &#x26A0; ESTIMATED LOCATION
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                    {riskFlags.map(f => (
                      <span key={f.label} className={`px-2 py-0.5 rounded border font-mono text-[9px] font-bold ${f.cls}`}>{f.label}</span>
                    ))}
                  </div>
                </div>

                {/* OSINT Data */}
                <div className="p-4 overflow-auto flex-1">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Suspect Digital Footprint</p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {([
                      { k: 'IP Address',   v: geo.ip,         hi: true,  warn: false },
                      { k: 'ISP/Carrier',  v: geo.isp,        hi: false, warn: false },
                      { k: 'Organisation', v: geo.org,        hi: false, warn: false },
                      { k: 'ASN',          v: geo.as,         hi: false, warn: false },
                      { k: 'City',         v: geo.city,       hi: false, warn: false },
                      { k: 'Region',       v: geo.regionName, hi: false, warn: false },
                      { k: 'Country',      v: geo.country,    hi: false, warn: false },
                      { k: 'Coordinates',  v: geo.lat && geo.lon ? `${geo.lat.toFixed(4)}, ${geo.lon.toFixed(4)}` : '\u2014', hi: false, warn: false },
                      { k: 'Timezone',     v: geo.timezone,   hi: false, warn: false },
                      { k: 'Mobile',       v: geo.mobile ? '\u2713 Yes' : '\u2717 No', hi: false, warn: false },
                      { k: 'VPN/Proxy',    v: geo.proxy ? '\u26A0 Detected' : '\u2713 Clean', hi: false, warn: !!geo.proxy },
                      { k: 'Tor Exit',     v: geo.tor   ? '\u26A0 Detected' : '\u2713 Clean', hi: false, warn: !!geo.tor },
                    ] as const).map(row => (
                      <div key={row.k} className="p-2 rounded-lg bg-white/[0.025] border border-white/5">
                        <div className="text-[9px] text-zinc-500 uppercase">{row.k}</div>
                        <div className={clsx('text-[11px] mt-0.5 truncate', row.hi ? 'text-red-300 font-bold' : row.warn ? 'text-amber-300' : 'text-zinc-200')}>
                          {row.v || '\u2014'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {geo.syntheticNote && (
                    <p className="mt-3 text-[9px] font-mono text-amber-400/70 border border-amber-500/20 rounded p-2 bg-amber-950/20 leading-relaxed">
                      &#x26A0; {geo.syntheticNote}
                    </p>
                  )}
                  {geo.disclaimer && (
                    <p className="mt-2 text-[9px] font-mono text-zinc-500 border border-white/5 rounded p-2 bg-white/[0.02]">&#x2139; {geo.disclaimer}</p>
                  )}

                  {/* Manual IP override */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[9px] font-mono text-zinc-500 uppercase mb-2">Override with real IP from CDR / court order</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 103.24.96.78"
                        value={manualIp}
                        onChange={e => setManualIp(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && manualIp.trim() && doGeolocate(manualIp)}
                        className="flex-1 bg-black border border-white/10 rounded px-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-red-400"
                      />
                      <button
                        onClick={() => doGeolocate(manualIp)}
                        disabled={!manualIp.trim()}
                        className="px-3 py-1.5 rounded bg-red-500/80 hover:bg-red-500 text-white font-mono text-[11px] font-bold transition-colors disabled:opacity-40"
                      >
                        REPLOT
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Action Cards + Draft */}
              <div className="flex flex-col">
                <div className="p-4 border-b border-white/5 shrink-0">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Law Enforcement Actions</p>
                  <div className="flex flex-col gap-2">
                    {ACTION_CARDS.map(card => (
                      <button
                        key={card.key}
                        onClick={() => {
                          setActiveAction(card.key);
                          setDraftText(generateDraft(card.key, geo!, sender, postText, timestamp || new Date().toLocaleString('en-IN')));
                        }}
                        className={clsx(
                          'w-full px-3 py-2.5 rounded-xl border text-left font-mono text-xs transition-all flex items-center gap-3',
                          activeAction === card.key
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-white/[0.02] border-white/10 text-zinc-300 hover:bg-white/[0.05] hover:border-white/20'
                        )}
                      >
                        <span className="text-base shrink-0">{card.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[11px]">{card.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{card.desc}</div>
                        </div>
                        {activeAction === card.key && <CheckCircle size={14} className="text-white shrink-0" weight="fill" />}
                      </button>
                    ))}
                  </div>
                </div>

                {activeAction && draftText ? (
                  <div className="flex-1 flex flex-col p-4 gap-3 overflow-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Generated Legal Draft</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(draftText); toast.success('Draft copied to clipboard'); }}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[10px] text-zinc-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Copy size={11} /> Copy
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={draftText}
                      className="flex-1 bg-black border border-white/10 rounded-lg p-3 font-mono text-[10px] text-zinc-200 leading-relaxed resize-none focus:outline-none min-h-[240px]"
                    />
                    <p className="text-[9px] font-mono text-zinc-600">&#x26A0; Review all blanks and obtain legal authorization before submission.</p>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <div className="text-4xl mb-3">&#x2696;&#xfe0f;</div>
                      <p className="text-xs font-mono text-zinc-500 max-w-xs">Select an action above to generate the corresponding legal document or operational notice.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error / failure state */}
          {!loading && geo && !geo.success && !geo.needsIp && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <Warning size={32} className="text-red-400" />
              <p className="text-zinc-400 font-mono text-xs">{geo.message || 'Geolocation failed. Try entering an IP manually.'}</p>
              <div className="flex gap-2 w-full max-w-md">
                <input type="text" placeholder="Enter IP (e.g. 49.36.44.107)"
                  value={manualIp} onChange={e => setManualIp(e.target.value)}
                  className="flex-1 bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-red-400"
                />
                <button onClick={() => doGeolocate(manualIp)} disabled={!manualIp.trim()}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50">
                  GEOLOCATE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

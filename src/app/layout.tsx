import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "pineSAW | Investigative Intelligence System",
  description: "Government intelligence terminal and police investigation workstation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plexMono.variable} antialiased bg-zinc-100 text-foreground h-screen flex flex-col overflow-hidden`}>
        {/* Institutional Header */}
        <header className="h-12 bg-[#002244] border-b border-zinc-300 shrink-0 flex items-center justify-between px-4 z-50 rounded-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-[#002244] flex items-center justify-center font-serif font-bold italic border border-zinc-300 rounded-none">
                CP
              </div>
              <div className="leading-tight">
                <div className="text-[10px] text-zinc-300 font-mono uppercase tracking-widest">Chandigarh Police</div>
                <div className="text-sm font-semibold text-white tracking-wide">CYBER CRIME & INTELLIGENCE UNIT</div>
              </div>
            </div>
            <div className="w-px h-6 bg-zinc-600 hidden md:block"></div>
            <div className="hidden md:flex flex-col justify-center">
              <div className="text-xs font-semibold text-zinc-100 tracking-wider">pineSAW</div>
              <div className="text-[9px] font-mono text-zinc-300 uppercase">Investigative Intelligence System</div>
            </div>
            <div className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-mono uppercase ml-4 font-bold rounded-none">
              Synthetic Data / Demo Environment
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-mono text-zinc-300 uppercase">System Status</div>
              <div className="text-xs text-green-400 font-bold flex items-center justify-end gap-1">
                SECURE & ACTIVE
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-300 uppercase">Investigator ID</div>
              <div className="text-xs font-mono text-white font-bold">OP-7492</div>
            </div>
          </div>
        </header>

        {/* Main Application Area */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden bg-zinc-100 relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

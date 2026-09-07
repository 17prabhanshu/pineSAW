import type { Metadata } from "next";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ClientLenis } from "@/components/ClientLenis";
import { CommandPalette } from "@/components/CommandPalette";
import { SpotlightTour } from "@/components/SpotlightTour";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DARKINT | Investigative Intelligence System",
  description: "Advanced intelligence terminal.",
};

import { ReactLenis } from "@studio-freight/react-lenis";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${space.variable} antialiased bg-black text-foreground min-h-screen flex flex-col selection:bg-white/20`}>
        
          {/* Aesthetic Liquid Glass Header */}
          <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl h-16 liquid-glass  rounded-full flex items-center justify-between px-6 z-50 transition-all">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group cursor-pointer">
                <img src="/cp-logo.png" alt="Chandigarh Police Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]" />
                <div className="leading-tight">
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Chandigarh Police</div>
                  <div className="text-sm font-display font-semibold text-zinc-100 tracking-wide group-hover:text-white transition-colors">CYBER INTELLIGENCE</div>
                </div>
              </div>
              <div className="w-px h-6 bg-white/10 hidden md:block"></div>
              <div className="hidden md:flex flex-col justify-center">
                <div className="text-xs font-semibold text-zinc-100 tracking-wider">DARKINT</div>
                <div className="text-[9px] font-mono text-zinc-400 uppercase">Nexus Network</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono uppercase font-bold tracking-widest hidden sm:block shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">
                Secure Terminal
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Investigator</div>
                <div className="text-sm font-mono text-white font-bold">OP-7492</div>
              </div>
            </div>
          </header>

          
          {/* Faded Watermark Background */}
          <div className="fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center opacity-[0.03]">
            <img src="/cp-logo.png" alt="Watermark" className="w-[800px] h-[800px] object-contain grayscale" />
          </div>

          {/* Main Application Area */}

          <div className="flex flex-1 w-full max-w-[1600px] mx-auto relative pt-28">
            <Sidebar />
            <main className="flex-1 min-w-0 pl-0 md:pl-72 pb-6 px-4 md:px-8 relative">
              {children}
            </main>
          </div>
          <div className="static-glow "></div>
        
        <CommandPalette />
        <SpotlightTour />
      </body>
    </html>
  );
}

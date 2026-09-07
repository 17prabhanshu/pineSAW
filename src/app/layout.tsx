import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { SpotlightTour } from "@/components/SpotlightTour";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DARKINT | Investigative Intelligence System",
  description: "Advanced intelligence terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${space.variable} antialiased bg-black text-foreground min-h-screen flex flex-col selection:bg-white/20`}>
        
        {/* Docked Executive Status Bar / Header */}
        <header className="sticky top-0 z-50 w-full h-14 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/cp-logo-transparent.png" 
                alt="Chandigarh Police Logo" 
                className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
              />
              <div className="leading-none">
                <div className="text-xs font-semibold text-white tracking-wide">
                  DARKINT
                </div>
                <div className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest mt-0.5">
                  Chandigarh Police // Cyber Cell
                </div>
              </div>
            </div>

            <div className="w-px h-4 bg-white/10 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>TERMINAL SECURE</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300">OP-7492</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">
              <span className="text-zinc-500">HOTKEY:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/10 text-white font-semibold">⌘K</kbd>
              <span>SEARCH</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white text-[10px] font-mono uppercase font-bold tracking-wider">
                ACTIVE DUTY
              </span>
            </div>
          </div>
        </header>

        {/* Docked 2-Column Application Frame */}
        <div className="flex flex-1 w-full relative">
          <Sidebar />
          <main className="flex-1 min-w-0 p-6 md:p-8 relative">
            {children}
          </main>
        </div>
        
        <CommandPalette />
        <SpotlightTour />
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          toastOptions={{ 
            style: { 
              background: "#09090b", 
              border: "1px solid rgba(255,255,255,0.15)", 
              color: "#ffffff", 
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              borderRadius: "8px"
            } 
          }} 
        />
      </body>
    </html>
  );
}

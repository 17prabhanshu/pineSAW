import Link from "next/link";
import { Warning } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <Warning size={64} className="text-nexus-amber mb-6 opacity-80" />
      <h1 className="font-display text-4xl font-bold mb-4">404 - Route Not Found</h1>
      <p className="text-zinc-300 font-mono text-sm max-w-md mb-8">
        The requested intelligence resource could not be located in the pineSAW system. It may have been redacted, moved, or never existed.
      </p>
      <Link href="/" className="bg-zinc-800/30 border border-white/10 hover:border-nexus-cyan/50 text-white px-6 py-2.5 rounded-2xl font-medium transition-colors">
        Return to Command Center
      </Link>
    </div>
  );
}

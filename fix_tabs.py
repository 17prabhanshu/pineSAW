import re

with open('src/app/investigations/[id]/page.tsx', 'r') as f:
    content = f.read()

# Fix the container
content = content.replace(
    '<div className="flex items-center bg-zinc-900/50 p-1 border border-white/10">',
    '<div className="flex items-center bg-zinc-900/60 p-1 border border-white/5 rounded-full">'
)

# Fix the buttons
content = re.sub(
    r'className=\{clsx\("px-3 py-1\.5 text-xs font-semibold transition-none", activePane === "([^"]+)" \? "bg-gov-blue text-white" : "text-zinc-300 hover:text-white"\)\}',
    r'className={clsx("px-4 py-1.5 text-xs font-medium rounded-full transition-all", activePane === "\1" ? "bg-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50")}',
    content
)

with open('src/app/investigations/[id]/page.tsx', 'w') as f:
    f.write(content)

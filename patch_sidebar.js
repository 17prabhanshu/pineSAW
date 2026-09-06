const fs = require('fs');
const path = './src/components/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import { usePathname, useRouter } from "next/navigation";\nimport {',
  'import { usePathname, useRouter } from "next/navigation";\nimport { motion } from "motion/react";\nimport {'
);

const oldItem = `                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center justify-between px-4 py-2.5 text-sm transition-all rounded-xl",
                        isActive
                          ? "bg-gemini-purple/20 text-white font-medium shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_0_10px_rgba(139,92,246,0.3)] border border-gemini-purple/30"
                          : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          weight={isActive ? "fill" : "regular"}
                          className={clsx("text-lg", isActive ? "text-gemini-purple" : "text-zinc-500")}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={clsx("text-[10px] font-mono px-2 py-0.5 rounded-full font-bold", item.badgeColor || "bg-black/50 text-zinc-300 border border-white/10")}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="text-[10px] font-mono bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-lg text-zinc-500 shadow-inner">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Link>
                  </li>`;

const newItem = `                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "relative flex items-center justify-between px-4 py-2.5 text-sm transition-all rounded-xl",
                        isActive
                          ? "text-white font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gemini-purple/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_0_10px_rgba(139,92,246,0.3)] border border-gemini-purple/30 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3">
                        <item.icon
                          weight={isActive ? "fill" : "regular"}
                          className={clsx("text-lg", isActive ? "text-gemini-purple" : "text-zinc-500")}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={clsx("relative z-10 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold", item.badgeColor || "bg-black/50 text-zinc-300 border border-white/10")}>
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <kbd className="relative z-10 text-[10px] font-mono bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-lg text-zinc-500 shadow-inner">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Link>
                  </li>`;

content = content.replace(oldItem, newItem);
fs.writeFileSync(path, content, 'utf8');
console.log('Sidebar.tsx updated');

import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace(
    'import { motion, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence } from "motion/react";',
    'import { motion, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence, useSpring } from "motion/react";\nimport { CyberText } from "@/components/CyberText";'
)

# Update AnimatedKPI
kpi_replacement = """function AnimatedKPI({ label, value, color }: { label: string, value: string | number, color: string }) {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : (typeof value === 'number' ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(numericValue);
    } else {
      const controls = animate(count, numericValue, { duration: 1.5, ...motionTokens.springSmooth });
      return () => controls.stop();
    }
  }, [numericValue, shouldReduceMotion, count]);

  const displayValue = useTransform(rounded, (latest) => latest.toString().padStart(2, '0'));

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, motionTokens.awwwardsSpring);
  const mouseYSpring = useSpring(y, motionTokens.awwwardsSpring);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      className="flex-1 p-4 hover:glass/5 transition-colors cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-zinc-300">{label}</div>
      <motion.div 
        className={clsx("text-2xl font-display font-semibold", color)}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.span>{shouldReduceMotion ? (numericValue).toString().padStart(2, '0') : displayValue}</motion.span>
      </motion.div>
    </motion.div>
  );
}"""

# Using regex to replace the function block
content = re.sub(
    r'function AnimatedKPI.*?return \(\n.*?</div>\n    </div>\n  \);\n\}',
    kpi_replacement,
    content,
    flags=re.DOTALL
)

# Apply CyberText to H1
content = content.replace(
    '<h1 className="font-display text-2xl font-semibold text-white tracking-tight">Command Center</h1>',
    '<h1 className="font-display text-2xl font-semibold text-white tracking-tight"><CyberText text="Command Center" /></h1>'
)

# Apply CyberText to H2s
content = content.replace(
    '<WarningOctagon className="text-nexus-red" size={16} /> Priority Incidents',
    '<WarningOctagon className="text-nexus-red" size={16} /> <CyberText text="Priority Incidents" />'
)

content = content.replace(
    '<Lightning className="text-nexus-amber" size={16} /> Live Alert Feed',
    '<Lightning className="text-nexus-amber" size={16} /> <CyberText text="Live Alert Feed" />'
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

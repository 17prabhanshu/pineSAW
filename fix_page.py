import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

topo_grid = """
function TopoGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 flex items-center justify-center overflow-hidden mix-blend-screen">
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M0 200 Q 250 100, 500 250 T 1000 200 M0 300 Q 250 200, 500 350 T 1000 300 M0 400 Q 250 300, 500 450 T 1000 400 M0 500 Q 250 400, 500 550 T 1000 500 M0 600 Q 250 500, 500 650 T 1000 600 M0 700 Q 250 600, 500 750 T 1000 700 M0 800 Q 250 700, 500 850 T 1000 800"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M200 0 Q 100 250, 250 500 T 200 1000 M300 0 Q 200 250, 350 500 T 300 1000 M400 0 Q 300 250, 450 500 T 400 1000 M500 0 Q 400 250, 550 500 T 500 1000 M600 0 Q 500 250, 650 500 T 600 1000 M700 0 Q 600 250, 750 500 T 700 1000 M800 0 Q 700 250, 850 500 T 800 1000"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>
    </div>
  );
}
"""

if "function TopoGrid()" not in content:
    content = content.replace("export default function CommandCenter() {", topo_grid + "\nexport default function CommandCenter() {")
    content = content.replace('<div className="flex h-full overflow-hidden relative">', '<div className="flex h-full overflow-hidden relative">\n      <TopoGrid />')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

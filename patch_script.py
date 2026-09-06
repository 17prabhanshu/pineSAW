import os

path_page = "src/app/page.tsx"
path_graph = "src/components/NetworkGraph.tsx"

with open(path_page, "r") as f:
    content_page = f.read()

topo_grid_code = """function TopoGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20 z-0 flex items-center justify-center overflow-hidden">
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
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M200 0 Q 100 250, 250 500 T 200 1000 M300 0 Q 200 250, 350 500 T 300 1000 M400 0 Q 300 250, 450 500 T 400 1000 M500 0 Q 400 250, 550 500 T 500 1000 M600 0 Q 500 250, 650 500 T 600 1000 M700 0 Q 600 250, 750 500 T 700 1000 M800 0 Q 700 250, 850 500 T 800 1000"
          fill="transparent"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>
    </div>
  );
}

export default function CommandCenter()"""

content_page = content_page.replace("export default function CommandCenter()", topo_grid_code)
content_page = content_page.replace(
    '<div className="flex h-full overflow-hidden relative">\n      <NewCaseModal',
    '<div className="flex h-full overflow-hidden relative">\n      <TopoGrid />\n      <NewCaseModal'
)

with open(path_page, "w") as f:
    f.write(content_page)

with open(path_graph, "r") as f:
    content_graph = f.read()

pulse_logic = """  const [pulses, setPulses] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !filteredData.links || !filteredData.links.length) return;
    
    const interval = setInterval(() => {
      setPulses(prev => {
        const now = Date.now();
        const activePulses = prev.filter(p => now - p.createdAt < 2000);
        
        for (let i = 0; i < 2; i++) {
          const randomLink = filteredData.links[Math.floor(Math.random() * filteredData.links.length)];
          if (randomLink && randomLink.source && randomLink.target && fgRef.current) {
            const src = typeof randomLink.source === 'object' ? randomLink.source : null;
            const tgt = typeof randomLink.target === 'object' ? randomLink.target : null;
            if (src && tgt && src.x !== undefined && tgt.x !== undefined) {
              try {
                const start = fgRef.current.graph2ScreenCoords(src.x, src.y);
                const end = fgRef.current.graph2ScreenCoords(tgt.x, tgt.y);
                if (start && end) {
                  activePulses.push({
                    id: Math.random().toString(),
                    createdAt: now,
                    startX: start.x,
                    startY: start.y,
                    endX: end.x,
                    endY: end.y,
                  });
                }
              } catch(e) {}
            }
          }
        }
        return activePulses;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [mounted, filteredData.links]);"""

content_graph = content_graph.replace("""  useEffect(() => {
    setMounted(true);
  }, []);""", pulse_logic)

pulse_svg = """    <div className="w-full h-full relative bg-[#F8FAFC] overflow-hidden">
      {/* SVG Pulse Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence>
          {pulses.map(p => {
            const dx = p.endX - p.startX;
            const dy = p.endY - p.startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            return (
              <motion.path
                key={p.id}
                d={`M ${p.startX} ${p.startY} L ${p.endX} ${p.endY}`}
                stroke="#0EA5E9"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${length * 0.2} ${length}`}
                initial={{ strokeDashoffset: length, opacity: 0 }}
                animate={{ strokeDashoffset: -length * 0.2, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, ease: "linear" }}
              />
            );
          })}
        </AnimatePresence>
      </svg>"""

content_graph = content_graph.replace(
    '<div className="w-full h-full relative bg-[#F8FAFC] overflow-hidden">',
    pulse_svg
)

with open(path_graph, "w") as f:
    f.write(content_graph)


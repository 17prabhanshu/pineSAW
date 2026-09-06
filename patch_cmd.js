const fs = require('fs');
const path = './src/components/CommandPalette.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('backdrop-blur-sm', 'backdrop-blur-xl');

const variantsStr = `
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring", stiffness: 400, damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: { opacity: 0, scale: 0.95, y: -20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function CommandPalette() {`;

content = content.replace('export function CommandPalette() {', variantsStr);

const oldMotionDiv = `<motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -20 }}
            transition={motionTokens.defaultTransition}
            className="relative w-full max-w-2xl glass border border-white/5 rounded-xl shadow-2xl overflow-hidden"
          >`;

const newMotionDiv = `<motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : "hidden"}
            animate={shouldReduceMotion ? { opacity: 1 } : "visible"}
            exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
            variants={containerVariants}
            className="relative w-full max-w-2xl glass border border-white/5 rounded-xl shadow-2xl overflow-hidden"
          >`;

content = content.replace(oldMotionDiv, newMotionDiv);

// wrap inner elements of Command.Item
// The structure is:
// <Command.Item [attrs]>
//   <Icon [attrs] />
//   <span>Text</span>
// </Command.Item>

content = content.replace(/(<Command\.Item[^>]*>)\s*(<[A-Za-z]+ className="w-4 h-4 mr-3[^>]*\/>)\s*(<span>[^<]+<\/span>)\s*(<\/Command\.Item>)/g, 
  '$1\n                    <motion.div variants={itemVariants} className="flex items-center w-full">\n                      $2\n                      $3\n                    </motion.div>\n                  $4'
);

fs.writeFileSync(path, content, 'utf8');
console.log('CommandPalette.tsx updated');

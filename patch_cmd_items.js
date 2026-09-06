const fs = require('fs');
const path = './src/components/CommandPalette.tsx';
let content = fs.readFileSync(path, 'utf8');

const itemReplaceRegex = /(<Command\.Item[\s\S]*?>)\s*(<(Folder|User|FileText|Settings)[\s\S]*?\/>)\s*(<span>[\s\S]*?<\/span>)\s*(<\/Command\.Item>)/g;

content = content.replace(itemReplaceRegex, '$1\n                    <motion.div variants={itemVariants} className="flex items-center w-full">\n                      $2\n                      $3\n                    </motion.div>\n                  $5');

fs.writeFileSync(path, content, 'utf8');
console.log('Items updated');

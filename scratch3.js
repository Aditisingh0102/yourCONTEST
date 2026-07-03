const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// Replace dark mode backgrounds and borders with Slate shades
content = content.replace(/#000000/g, '#0f172a'); // Black -> Slate-900
content = content.replace(/linear-gradient\(to bottom right, #18181b, #0a0a0a\)/g, '#1e293b'); // Dark Zinc -> Slate-800
content = content.replace(/#18181b/g, '#0f172a'); // Zinc-900 -> Slate-900
content = content.replace(/#27272a/g, '#334155'); // Zinc-800 -> Slate-700
content = content.replace(/#3f3f46/g, '#475569'); // Zinc-700 -> Slate-600
content = content.replace(/#09090b/g, '#020617'); // Zinc-950 -> Slate-950
content = content.replace(/rgba\(24, 24, 27/g, 'rgba(15, 23, 42'); // Zinc-900 rgba -> Slate-900 rgba
content = content.replace(/rgba\(26, 26, 26/g, 'rgba(30, 41, 59'); // Zinc-800 rgba -> Slate-800 rgba

fs.writeFileSync(path, content, 'utf8');
console.log("Updated index.css dark mode successfully.");

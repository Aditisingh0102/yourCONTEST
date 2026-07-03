const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/background-color: #000000 !important;/g, 'background-color: #0f172a !important;');
content = content.replace(/background: linear-gradient\(to bottom right, #18181b, #0a0a0a\) !important;/g, 'background-color: #1e293b !important;');
content = content.replace(/background-color: #18181b !important;/g, 'background-color: #0f172a !important;');
content = content.replace(/background-color: #27272a !important;/g, 'background-color: #1e293b !important;');
content = content.replace(/border-color: #27272a !important;/g, 'border-color: #334155 !important;');

fs.writeFileSync(path, content, 'utf8');
console.log("Updated dark theme to slate successfully.");

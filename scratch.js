const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/pages/student/Arena.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replacements
content = content.replace(/bg-\[\#0f172a\]/g, 'bg-slate-50');
content = content.replace(/bg-\[\#1e293b\]/g, 'bg-white glass-card');
content = content.replace(/border-slate-700\/50/g, 'border-gray-200');
content = content.replace(/border-gray-700\/50/g, 'border-gray-100');
content = content.replace(/border-gray-700/g, 'border-gray-200');
content = content.replace(/border-gray-800/g, 'border-gray-200');
content = content.replace(/bg-gray-800/g, 'bg-gray-100');
content = content.replace(/bg-gray-900/g, 'bg-gray-50');
content = content.replace(/text-white/g, 'text-gray-900');
content = content.replace(/text-gray-200/g, 'text-gray-900');
content = content.replace(/text-gray-300/g, 'text-gray-800');
content = content.replace(/text-slate-400/g, 'text-gray-500');
content = content.replace(/text-gray-400/g, 'text-gray-500');

fs.writeFileSync(path, content, 'utf8');
console.log("Updated Arena.jsx successfully.");

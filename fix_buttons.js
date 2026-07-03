const fs = require('fs');
const path = '/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/pages/student/Arena.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/bg-blue-600 hover:bg-blue-500 text-gray-900/g, 'bg-blue-600 hover:bg-blue-500 text-white');
content = content.replace(/bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600\/30/g, 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30');
content = content.replace(/bg-blue-600 text-gray-900/g, 'bg-blue-600 text-white');
content = content.replace(/bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-gray-900/g, 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-white');
content = content.replace(/bg-green-600 hover:bg-green-500 text-gray-900/g, 'bg-green-600 hover:bg-green-500 text-white');
content = content.replace(/bg-red-600 hover:bg-red-500 text-gray-900/g, 'bg-red-600 hover:bg-red-500 text-white');
content = content.replace(/text-gray-900 font-semibold/g, 'text-white font-semibold');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed buttons successfully.");

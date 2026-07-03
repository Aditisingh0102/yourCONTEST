const fs = require('fs');
const css = fs.readFileSync('/Users/anshgupta/Library/CloudStorage/OneDrive-Personal/yourCONTEST/frontend/src/index.css', 'utf8');

const bgWhiteDark = css.match(/\.dark \.bg-white\s*\{[^}]+\}/g);
console.log(bgWhiteDark);

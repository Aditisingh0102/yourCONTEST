const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');
css = css.replace(/!important/g, '');
fs.writeFileSync('src/index.css', css);

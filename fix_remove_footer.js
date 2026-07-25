const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// The bottom nav usually has a specific HTML structure
// I'll search for the footer and bottom nav sections and remove them

code = code.replace(/\{\/\* ================= BOTTOM NAV ================= \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/Sidebar>)/, '');
code = code.replace(/\{\/\* FOOTER \*\/\}[\s\S]*?(?=\s*\{\/\* ================= BOTTOM NAV)/, '');

// Also remove any remaining footer or bottom nav just in case
code = code.replace(/<footer[\s\S]*?<\/footer>/g, '');
code = code.replace(/<div className=\{styles\.bottomNav\}[\s\S]*?<\/div>/g, '');

fs.writeFileSync('pages/dashboard.js', code);
console.log("Footer and bottom nav removed from dashboard.js");

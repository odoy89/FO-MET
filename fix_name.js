const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');
code = code.replace(/Foto Admin/g, 'Foto KWh');
fs.writeFileSync('pages/dashboard.js', code);
console.log("Replaced Foto Admin with Foto KWh");

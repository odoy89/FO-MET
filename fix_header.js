const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// Fix sticky header issue by applying a solid class and removing inline sticky from thead
// We rely on 'thead th { position: sticky; top: 0; }' from globals.css or we add it inline.

code = code.replace(
  '<thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>',
  '<thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8fafc", boxShadow: "inset 0 -2px 0 #e2e8f0" }}>'
);

fs.writeFileSync('pages/dashboard.js', code);
console.log("Updated sticky header styles in dashboard.js");

const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// Replace header
code = code.replace(
    /"File PK",\s*"Status",\s*\].join\(";"\)/g,
    `"File PK",\n      "Status",\n      "Foto"\n    ].join(";")`
);

// Replace mapping
code = code.replace(
    /r\[13\] \|\| "",\s*r\[11\] \|\| "",\s*r\[10\] \|\| "",\s*r\[12\] \|\| "",\s*\].map/g,
    `r[13] || "",\n        r[11] || "",\n        r[10] || "",\n        r[12] || "",\n        r[14] || "",\n      ].map`
);

fs.writeFileSync('pages/dashboard.js', code, 'utf8');
console.log("Patched via regex successfully!");

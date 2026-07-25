const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const target1 = `      "File PK",   
      "Status",
    ].join(";") + "\\n";`;

const replacement1 = `      "File PK",   
      "Status",
      "Foto"
    ].join(";") + "\\n";`;

const target2 = `        r[13] || "",
        r[11] || "",
        r[10] || "",
        r[12] || "",
      ].map((v) => \\\`"\\\${String(v ?? "").replace(/"/g, '""')}"\\\`);`;

const replacement2 = `        r[13] || "",
        r[11] || "",
        r[10] || "",
        r[12] || "",
        r[14] || "",
      ].map((v) => \\\`"\\\${String(v ?? "").replace(/"/g, '""')}"\\\`);`;

let changes = 0;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    changes++;
} else {
    console.log("target1 not found");
}

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    changes++;
} else {
    console.log("target2 not found");
}

if (changes > 0) {
    fs.writeFileSync('pages/dashboard.js', code, 'utf8');
    console.log("Patched successfully!");
} else {
    console.log("No changes made.");
}

const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// Fix 1: Validate file PK
let handleSubmitRegex = /let fileUrl = row\.fileUrl \|\| "";\r?\n\s*let fotoUrl = row\.fotoUrl \|\| "";/;
if (handleSubmitRegex.test(code)) {
    code = code.replace(handleSubmitRegex, 
        'let fileUrl = row.fileUrl || "";\n' +
        '        if (roleLogin !== "ADMINISTRATOR" && !row.file && !fileUrl) {\n' +
        '          Swal.fire("Wajib Upload", "Silakan upload File PK untuk setiap baris sebelum menyimpan", "warning");\n' +
        '          setSavingForm(false);\n' +
        '          return;\n' +
        '        }\n' +
        '        let fotoUrl = row.fotoUrl || "";'
    );
}

// Fix 2: Validation for Selesai
let handleMarkSudahRegex = /if \(\!sn \|\| \!fotoUrl\) \{\r?\n\s*Swal\.fire\("Gagal", "SN dan Foto wajib diisi oleh Admin sebelum mengubah status\.", "warning"\);\r?\n\s*return;\r?\n\s*\}/;
if (handleMarkSudahRegex.test(code)) {
    code = code.replace(handleMarkSudahRegex, 
        'const fotoSegelKiriUrl = String(r[15] || "").trim();\n' +
        '    const fotoSegelKananUrl = String(r[16] || "").trim();\n' +
        '    if (!sn || !fotoUrl || !fotoSegelKiriUrl || !fotoSegelKananUrl) {\n' +
        '      Swal.fire("Gagal", "SN dan Foto (KWh, Segel Kiri, Segel Kanan) wajib diisi oleh Admin sebelum mengubah status.", "warning");\n' +
        '      return;\n' +
        '    }'
    );
}

// Fix 3: Duplicated Input Data Header
// Original form had:
// <h5 className="mb-3">
//   <i className="bi bi-pencil-square"></i> Input Data
// </h5>
code = code.replace(/<div className="form-area p-0 shadow-none border-0" id="form-area">\r?\n\s*<h5 className="mb-3">\r?\n\s*<i className="bi bi-pencil-square"><\/i> Input Data\r?\n\s*<\/h5>/, '<div className="form-area p-0 shadow-none border-0 pt-2" id="form-area">');

// Just in case it's slightly different
code = code.replace(/<h5 className="mb-3">\s*<i className="bi bi-pencil-square"><\/i> Input Data\s*<\/h5>/, '');

fs.writeFileSync('pages/dashboard.js', code);
console.log('Fixed bugs');

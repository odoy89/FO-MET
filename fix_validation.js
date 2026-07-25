const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const targetString = `        for (const row of formRows) {
          if (!row.idpel && !row.nama) {`;

const insertString = `        for (const row of formRows) {
          if (!row.idpel && !row.nama) {
            continue;
          }
          
          if (roleLogin !== "ADMINISTRATOR" && roleLogin !== "ADMIN") {
            if (!row.file && !row.fileUrl) {
              Swal.fire("Gagal", "File PK wajib diupload sebelum data bisa disimpan!", "warning");
              setSavingForm(false);
              return;
            }
          }`;

// Let's use regex to replace safely
code = code.replace(/for\s*\(const\s*row\s*of\s*formRows\)\s*\{\s*if\s*\(!row\.idpel\s*&&\s*!row\.nama\)\s*\{\s*\/\/[^\n]*\s*continue;\s*\}/, insertString);

fs.writeFileSync('pages/dashboard.js', code);
console.log("Added validation successfully!");

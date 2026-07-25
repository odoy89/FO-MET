const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// The original line is: Swal.fire("Error", "Gagal memuat data dari server", "error");
// We want to replace it globally just to be safe.
code = code.replace(/Swal\.fire\("Error", "Gagal memuat data dari server", "error"\);/g, 'Swal.fire("Error", err.message || "Gagal memuat data dari server", "error");');

fs.writeFileSync('pages/dashboard.js', code);
console.log("Error message replaced successfully!");

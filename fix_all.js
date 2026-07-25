const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Rename 'Foto Admin' to 'Foto KWh'
code = code.replace(/Foto Admin/g, 'Foto KWh');

// 2. Add handleShowImage
if (!code.includes('function handleShowImage')) {
  code = code.replace(
    '  // ====== HAPUS ======',
    `  // ====== SHOW IMAGE ======
  function handleShowImage(url) {
    Swal.fire({
      imageUrl: url,
      imageAlt: "Foto",
      showConfirmButton: false,
      showCloseButton: true,
      width: "80%",
      padding: "1em",
    });
  }

  // ====== HAPUS ======`
  );
}

// 3. Update table wrapper and header
const oldTableDiv = '<div className="table-responsive">';
const newTableDiv = '<div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>';
if (code.includes(oldTableDiv)) {
  code = code.replace(oldTableDiv, newTableDiv);
}

const oldThead = '<thead>';
const newThead = '<thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>';
if (code.includes(oldThead)) {
  code = code.replace(oldThead, newThead);
}

// 4. Update 'Lihat' links for filePk
const oldFilePk = `{typeof r[10] === "string" && r[10].startsWith("http") ? (
  <a href={r[10]} target="_blank" rel="noreferrer">
    Lihat
  </a>
) : (
  "-"
)}`;
const newFilePk = `{typeof r[10] === "string" && r[10].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[10]); }} className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }}>
    Lihat
  </a>
) : (
  "-"
)}`;

if (code.includes(oldFilePk)) {
  code = code.replace(oldFilePk, newFilePk);
}

// 5. Update 'Lihat' links for fotoKWh
// Since we renamed Foto Admin to Foto KWh, the JSX structure might be:
const oldFotoKwh = `{typeof r[14] === "string" && r[14].startsWith("http") ? (
  <a href={r[14]} target="_blank" rel="noreferrer">Lihat</a>
) : ("-")}`;
const newFotoKwh = `{typeof r[14] === "string" && r[14].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[14]); }} className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }}>
    Lihat
  </a>
) : ("-")}`;

if (code.includes(oldFotoKwh)) {
  code = code.replace(oldFotoKwh, newFotoKwh);
}

// 6. Update layout Sidebar to Top Navbar
// The user says: "menu itu diatas kena disamping gak keren bener"
// But changing Sidebar to Top Navbar requires refactoring Sidebar.js and how it wraps children.

fs.writeFileSync('pages/dashboard.js', code);
console.log("Fixes applied successfully to dashboard.js");

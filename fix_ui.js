const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Fix Table Wrapper and Header
const tableStartOld = `<div className="table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead>`;

const tableStartNew = `<div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="table table-bordered table-striped mb-0 table-hover align-middle">
              <thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>`;

if (code.includes(tableStartOld)) {
    code = code.replace(tableStartOld, tableStartNew);
} else {
    console.log("Could not find tableStartOld");
}

// 2. Add handleShowImage
const handleDeleteRowDef = `  // ====== HAPUS ======`;
const handleShowImageFunc = `  // ====== SHOW IMAGE ======
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

  // ====== HAPUS ======`;

if (code.includes(handleDeleteRowDef)) {
    code = code.replace(handleDeleteRowDef, handleShowImageFunc);
} else {
    console.log("Could not find handleDeleteRowDef");
}

// 3. Update 'Lihat' links to use handleShowImage
// Find File PK 
const filePkLihatOld = `{typeof r[10] === "string" && r[10].startsWith("http") ? (
  <a href={r[10]} target="_blank" rel="noreferrer">
    Lihat
  </a>
) : (
  "-"
)}`;

const filePkLihatNew = `{typeof r[10] === "string" && r[10].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[10]); }} className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }}>
    Lihat
  </a>
) : (
  "-"
)}`;

if (code.includes(filePkLihatOld)) {
    code = code.replace(filePkLihatOld, filePkLihatNew);
} else {
    console.log("Could not find filePkLihatOld");
}

// Find Foto Admin (now Foto KWh)
const fotoAdminLihatOld = `{typeof r[14] === "string" && r[14].startsWith("http") ? (
  <a href={r[14]} target="_blank" rel="noreferrer">Lihat</a>
) : ("-")}`;

const fotoAdminLihatNew = `{typeof r[14] === "string" && r[14].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[14]); }} className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }}>
    Lihat
  </a>
) : ("-")}`;

if (code.includes(fotoAdminLihatOld)) {
    code = code.replace(fotoAdminLihatOld, fotoAdminLihatNew);
} else {
    console.log("Could not find fotoAdminLihatOld");
}

fs.writeFileSync('pages/dashboard.js', code);
console.log("Applied table fixes and handleShowImage");

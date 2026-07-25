const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Add showModalForm state
code = code.replace(
  'const [savingForm, setSavingForm] = useState(false);',
  'const [savingForm, setSavingForm] = useState(false);\n  const [showModalForm, setShowModalForm] = useState(false);'
);

// 2. createEmptyRow
code = code.replace(
  'fotoUrl: "",\n      status: "Belum",',
  'fotoUrl: "",\n      fotoSegelKiri: null,\n      fotoSegelKiriUrl: "",\n      fotoSegelKanan: null,\n      fotoSegelKananUrl: "",\n      status: "Belum",'
);

// 3. handleSubmitMulti logic
const uploadFotoStr = '        if (row.foto) {';
const newUploadLogic = `
        let fotoSegelKiriUrl = row.fotoSegelKiriUrl || "";
        let fotoSegelKananUrl = row.fotoSegelKananUrl || "";

        if (row.fotoSegelKiri) {
          if (row.fotoSegelKiri.size > 10 * 1024 * 1024) {
            Swal.fire("File terlalu besar", "Maksimal 10MB untuk Foto Segel Kiri", "warning");
            setSavingForm(false);
            return;
          }
          let base64DataKiri = "";
          let mimeTypeKiri = row.fotoSegelKiri.type || "application/octet-stream";
          if (row.fotoSegelKiri.type.startsWith("image/")) {
            const compressedBase64 = await compressImage(row.fotoSegelKiri);
            base64DataKiri = String(compressedBase64).split(",")[1] || compressedBase64;
            mimeTypeKiri = "image/jpeg";
          } else {
            const base64Kiri = await fileToBase64(row.fotoSegelKiri);
            base64DataKiri = String(base64Kiri).split(",")[1] || base64Kiri;
          }
          const upResKiri = await apiPost("uploadFile", {
            data: base64DataKiri,
            mimeType: mimeTypeKiri,
            filename: row.fotoSegelKiri.name,
          });
          fotoSegelKiriUrl = upResKiri.data?.data || upResKiri.data || "";
        }

        if (row.fotoSegelKanan) {
          if (row.fotoSegelKanan.size > 10 * 1024 * 1024) {
            Swal.fire("File terlalu besar", "Maksimal 10MB untuk Foto Segel Kanan", "warning");
            setSavingForm(false);
            return;
          }
          let base64DataKanan = "";
          let mimeTypeKanan = row.fotoSegelKanan.type || "application/octet-stream";
          if (row.fotoSegelKanan.type.startsWith("image/")) {
            const compressedBase64 = await compressImage(row.fotoSegelKanan);
            base64DataKanan = String(compressedBase64).split(",")[1] || compressedBase64;
            mimeTypeKanan = "image/jpeg";
          } else {
            const base64Kanan = await fileToBase64(row.fotoSegelKanan);
            base64DataKanan = String(base64Kanan).split(",")[1] || base64Kanan;
          }
          const upResKanan = await apiPost("uploadFile", {
            data: base64DataKanan,
            mimeType: mimeTypeKanan,
            filename: row.fotoSegelKanan.name,
          });
          fotoSegelKananUrl = upResKanan.data?.data || upResKanan.data || "";
        }

        if (row.foto) {`;
code = code.replace(uploadFotoStr, newUploadLogic);

// 4. payloadArray.push
code = code.replace(
  'fotoUrl,\n          peruntukan: row.peruntukan',
  'fotoUrl,\n          fotoSegelKiriUrl,\n          fotoSegelKananUrl,\n          peruntukan: row.peruntukan'
);

// 5. handleEditRow
code = code.replace(
  'fotoUrl: row[14] || "",\n      foto: null,\n      peruntukan: row[11]',
  'fotoUrl: row[14] || "",\n      fotoSegelKiriUrl: row[15] || "",\n      fotoSegelKananUrl: row[16] || "",\n      foto: null,\n      fotoSegelKiri: null,\n      fotoSegelKanan: null,\n      peruntukan: row[11]'
);
code = code.replace(
  'rowNumber: row[15] || null',
  'rowNumber: row[17] || null'
);

// 6. handleMarkSudah
code = code.replace(
  'const rowNumber = r[15];',
  'const rowNumber = r[17];'
);

// 7. handleDownloadFilter headers & data
code = code.replace(
  '"File PK",   \n      "Status",',
  '"File PK",\n      "Foto KWh",\n      "Foto Segel Kiri",\n      "Foto Segel Kanan",\n      "Status",'
);
code = code.replace(
  'r[10] || "",\n        r[12] || "",',
  'r[10] || "",\n        r[14] || "",\n        r[15] || "",\n        r[16] || "",\n        r[12] || "",'
);

// 8. Tbody Table cell rendering
code = code.replace(
  '<td>\n{typeof r[14] === "string" && r[14].startsWith("http") ? (\n  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[14]); }} className="text-primary text-decoration-underline" style={{ cursor: "pointer" }}>Lihat</a>\n) : ("-")}\n</td>',
  `<td>
{typeof r[14] === "string" && r[14].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[14]); }} className="text-primary text-decoration-underline" style={{ cursor: "pointer" }}>Lihat</a>
) : ("-")}
</td>
<td>
{typeof r[15] === "string" && r[15].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[15]); }} className="text-primary text-decoration-underline" style={{ cursor: "pointer" }}>Lihat</a>
) : ("-")}
</td>
<td>
{typeof r[16] === "string" && r[16].startsWith("http") ? (
  <a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[16]); }} className="text-primary text-decoration-underline" style={{ cursor: "pointer" }}>Lihat</a>
) : ("-")}
</td>`
);
code = code.replace('<th>Foto KWh</th>\n                  <th>Status</th>', '<th>Foto KWh</th>\n                  <th>Foto Segel Kiri</th>\n                  <th>Foto Segel Kanan</th>\n                  <th>Status</th>');

// Fixed colSpan replace
code = code.replace('colSpan={15}', 'colSpan={17}');
code = code.replace('colSpan={15}', 'colSpan={17}');


// 9. Add "Tambah Data" button above the table
code = code.replace(
  '<div className="table-area" id="table-area">',
  `<div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Data PO</h5>
            <button className="btn btn-primary" onClick={() => { setFormRows([createEmptyRow()]); setShowModalForm(true); }}>
              <i className="bi bi-plus-lg"></i> Tambah Data
            </button>
          </div>
          <div className="table-area" id="table-area">`
);

// 10. Edit handleEditRow to open modal
code = code.replace(
  'setFormRows([obj]);\n    if (typeof window !== "undefined") {\n      window.scrollTo({ top: 0, behavior: "smooth" });\n    }',
  'setFormRows([obj]);\n    setShowModalForm(true);'
);

// 11. Modal UI & Add New Photos in Form
const formAreaRegex = /<div className="form-area" id="form-area">[\s\S]*?<\/div>\s*{\/\* FILTER GRAFIK PER UNIT \*\/}/;
let formAreaMatch = code.match(formAreaRegex);

if (formAreaMatch) {
  let formContent = formAreaMatch[0];
  formContent = formContent.replace('</form>\n        </div>', '</form>\n        </div>\n        </div>\n        </div>\n        </div>');
  formContent = formContent.replace('<div className="form-area" id="form-area">', 
  `{showModalForm && (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0"><i className="bi bi-pencil-square"></i> Input Data</h5>
          <button type="button" className="btn-close" onClick={() => setShowModalForm(false)}></button>
        </div>
        <div className="form-area p-0 shadow-none border-0" id="form-area">`);
  
  // Update photo inputs
  formContent = formContent.replace(
    /<div className="col-md-2">\s*<label>Upload Foto KWh<\/label>[\s\S]*?<\/div>/,
    `<div className="col-md-2">
    <label>Upload Foto KWh</label>
    <input
      type="file"
      className="form-control form-control-sm"
      onChange={(e) => handleFormChange(idx, "foto", e.target.files?.[0] || null)}
    />
    {row.fotoUrl && (
      <a href={row.fotoUrl} target="_blank" rel="noreferrer" className="small d-block text-info mt-1">
        <i className="bi bi-image"></i> Lihat Foto Lama
      </a>
    )}
  </div>
  <div className="col-md-2">
    <label>Foto Segel Kiri</label>
    <input
      type="file"
      className="form-control form-control-sm"
      onChange={(e) => handleFormChange(idx, "fotoSegelKiri", e.target.files?.[0] || null)}
    />
    {row.fotoSegelKiriUrl && (
      <a href={row.fotoSegelKiriUrl} target="_blank" rel="noreferrer" className="small d-block text-info mt-1">
        <i className="bi bi-image"></i> Lihat Foto Lama
      </a>
    )}
  </div>
  <div className="col-md-2">
    <label>Foto Segel Kanan</label>
    <input
      type="file"
      className="form-control form-control-sm"
      onChange={(e) => handleFormChange(idx, "fotoSegelKanan", e.target.files?.[0] || null)}
    />
    {row.fotoSegelKananUrl && (
      <a href={row.fotoSegelKananUrl} target="_blank" rel="noreferrer" className="small d-block text-info mt-1">
        <i className="bi bi-image"></i> Lihat Foto Lama
      </a>
    )}
  </div>`
  );
  
  // Change form area layout to be row wrapping
  // Using \s* to handle potential whitespace variations
  formContent = formContent.replace(/className="row align-items-end g-2 mb-2"/g, 'className="row align-items-end g-3 mb-3 border-bottom pb-3"');

  code = code.replace(formAreaRegex, formContent + '\n        {/* FILTER GRAFIK PER UNIT */}');
} else {
  console.log("Could not find formAreaRegex match");
}

// 12. Submit closing modal
code = code.replace(
  'Swal.fire({\n        icon: "success",\n        title: "Berhasil!",',
  'setShowModalForm(false);\n      Swal.fire({\n        icon: "success",\n        title: "Berhasil!",'
);

// 13. CSS Adjustments
code = code.replace(
  '.form-area,\n.table-area {',
  `.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 20px;
}
.modal-container {
  background: white;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.form-area,
.table-area {`
);

// Replace mobile CSS rules
const mobileCssPattern = /\.row\.align-items-end\.g-2\.mb-2 > div {\s*flex: 0 0 100%;\s*max-width: 100%;\s*margin-bottom: 10px;\s*}/g;
code = code.replace(mobileCssPattern, `/* Update modal di HP */
  .modal-overlay {
    padding: 10px;
  }
  .modal-container {
    padding: 15px;
    max-height: 95vh;
  }
  .row.align-items-end.g-3.mb-3 > div {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 12px;
  }`);

fs.writeFileSync('pages/dashboard.js', code);
console.log('Patched dashboard.js successfully');

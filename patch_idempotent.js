const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// Fix the duplicated showModalForm
code = code.replace(/const \[showModalForm, setShowModalForm\] = useState\(false\);\r?\n\s*const \[showModalForm, setShowModalForm\] = useState\(false\);/g, 'const [showModalForm, setShowModalForm] = useState(false);');

// 1. Add showModalForm if not there
if (!code.includes('const [showModalForm, setShowModalForm] = useState(false);')) {
    code = code.replace(/const \[savingForm, setSavingForm\] = useState\(false\);/g,
      'const [savingForm, setSavingForm] = useState(false);\n  const [showModalForm, setShowModalForm] = useState(false);'
    );
}

// 2. createEmptyRow
if (!code.includes('fotoSegelKiri: null')) {
    code = code.replace(/fotoUrl:\s*"",\r?\n\s*status:\s*"Belum",/g,
      'fotoUrl: "",\n      fotoSegelKiri: null,\n      fotoSegelKiriUrl: "",\n      fotoSegelKanan: null,\n      fotoSegelKananUrl: "",\n      status: "Belum",'
    );
}

// 3. handleEditRow
if (!code.includes('fotoSegelKiriUrl: row[15]')) {
    code = code.replace(/fotoUrl:\s*row\[14\]\s*\|\|\s*"",\r?\n\s*foto:\s*null,\r?\n\s*peruntukan:\s*row\[11\]/g,
      'fotoUrl: row[14] || "",\n      fotoSegelKiriUrl: row[15] || "",\n      fotoSegelKananUrl: row[16] || "",\n      foto: null,\n      fotoSegelKiri: null,\n      fotoSegelKanan: null,\n      peruntukan: row[11]'
    );
    code = code.replace(/rowNumber:\s*row\[15\]\s*\|\|\s*null/g, 'rowNumber: row[17] || null');
}

// 4. handleSubmitMulti logic
if (!code.includes('let fotoSegelKiriUrl = row.fotoSegelKiriUrl')) {
    code = code.replace(/let fileUrl = row\.fileUrl \|\| "";\r?\n\s*let fotoUrl = row\.fotoUrl \|\| "";/g, 
      'let fileUrl = row.fileUrl || "";\n        let fotoUrl = row.fotoUrl || "";\n        let fotoSegelKiriUrl = row.fotoSegelKiriUrl || "";\n        let fotoSegelKananUrl = row.fotoSegelKananUrl || "";'
    );
}

if (!code.includes('if (row.fotoSegelKiri) {')) {
    const uploadKiriKanan = `
        // Upload Foto Segel Kiri
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

        // Upload Foto Segel Kanan
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
`;
    code = code.replace(/payloadArray\.push\(\{\s*tanggal/g, uploadKiriKanan + '\n        payloadArray.push({\n          tanggal');
}

if (!code.includes('fotoSegelKiriUrl,')) {
    code = code.replace(/fileUrl,\r?\n\s*fotoUrl,\r?\n\s*peruntukan/g, 'fileUrl,\n          fotoUrl,\n          fotoSegelKiriUrl,\n          fotoSegelKananUrl,\n          peruntukan');
}

// 5. handleMarkSudah
code = code.replace(/const rowNumber = r\[15\];/g, 'const rowNumber = r[17];');

// 6. CSV Export headers
if (!code.includes('"Foto Segel Kiri"')) {
    code = code.replace(/"File PK",\s*"Status",/g, '"File PK",\n      "Foto KWh",\n      "Foto Segel Kiri",\n      "Foto Segel Kanan",\n      "Status",');
    code = code.replace(/r\[10\] \|\| "",\r?\n\s*r\[12\] \|\| "",/g, 'r[10] || "",\n        r[14] || "",\n        r[15] || "",\n        r[16] || "",\n        r[12] || "",');
}

// 7. Data table headers and rendering
if (!code.includes('<th>Foto Segel Kiri</th>')) {
    code = code.replace(/<th>Foto KWh<\/th>\r?\n\s*<th>Status<\/th>/g, '<th>Foto KWh</th>\n                  <th>Foto Segel Kiri</th>\n                  <th>Foto Segel Kanan</th>\n                  <th>Status</th>');
    code = code.replace(/colSpan=\{15\}/g, 'colSpan={17}');

    const tbodyImageRendering = `<td>
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
</td>`;
    
    code = code.replace(/<td>\s*\{typeof r\[14\] === "string"[\s\S]*?<\/td>/g, tbodyImageRendering);
}


// 8. Add Data Button and Modal
if (!code.includes('setShowModalForm(true)')) {
    code = code.replace(/<div className="table-area" id="table-area">/g, 
      `<div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Data PO</h5>
            <button className="btn btn-primary" onClick={() => { setFormRows([createEmptyRow()]); setShowModalForm(true); }}>
              <i className="bi bi-plus-lg"></i> Tambah Data
            </button>
          </div>
          <div className="table-area" id="table-area">`
    );

    code = code.replace(/setFormRows\(\[obj\]\);\s*if \(typeof window !== "undefined"\) \{\s*window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\);\s*\}/g, 'setFormRows([obj]);\n    setShowModalForm(true);');
}

// Modal UI Form Area
if (!code.includes('modal-overlay')) {
    const formAreaRegex = /<div className="form-area" id="form-area">[\s\S]*?<\/form>\s*<\/div>/;
    let formAreaMatch = code.match(formAreaRegex);

    if (formAreaMatch) {
      let formContent = formAreaMatch[0];
      // Replace the first div
      formContent = formContent.replace('<div className="form-area" id="form-area">', 
      `{showModalForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0"><i className="bi bi-pencil-square"></i> Input Data</h5>
              <button type="button" className="btn-close" onClick={() => setShowModalForm(false)}></button>
            </div>
            <div className="form-area p-0 shadow-none border-0" id="form-area">`
      );
      
      // Close the extra divs at the end of form area
      formContent = formContent.replace(/<\/form>\s*<\/div>/, '</form>\n        </div>\n      </div>\n    </div>\n  )}');

      // Replace photo KWh input
      const photoInputHTML = `<div className="col-md-2">
        <label>Upload Foto KWh</label>
        <input
          type="file"
          className="form-control form-control-sm"
          onChange={(e) =>
            handleFormChange(idx, "foto", e.target.files?.[0] || null)
          }
        />
        {row.fotoUrl && (
          <a
            href={row.fotoUrl}
            target="_blank"
            rel="noreferrer"
            className="small d-block text-info mt-1"
          >
            <i className="bi bi-image"></i> Lihat Foto Lama
          </a>
        )}
      </div>
      <div className="col-md-2">
        <label>Foto Segel Kiri</label>
        <input
          type="file"
          className="form-control form-control-sm"
          onChange={(e) =>
            handleFormChange(idx, "fotoSegelKiri", e.target.files?.[0] || null)
          }
        />
        {row.fotoSegelKiriUrl && (
          <a
            href={row.fotoSegelKiriUrl}
            target="_blank"
            rel="noreferrer"
            className="small d-block text-info mt-1"
          >
            <i className="bi bi-image"></i> Lihat Foto Lama
          </a>
        )}
      </div>
      <div className="col-md-2">
        <label>Foto Segel Kanan</label>
        <input
          type="file"
          className="form-control form-control-sm"
          onChange={(e) =>
            handleFormChange(idx, "fotoSegelKanan", e.target.files?.[0] || null)
          }
        />
        {row.fotoSegelKananUrl && (
          <a
            href={row.fotoSegelKananUrl}
            target="_blank"
            rel="noreferrer"
            className="small d-block text-info mt-1"
          >
            <i className="bi bi-image"></i> Lihat Foto Lama
          </a>
        )}
      </div>`;
      formContent = formContent.replace(/<div className="col-md-2">\s*<label>Upload Foto KWh<\/label>[\s\S]*?<\/div>/, photoInputHTML);
      
      // Replace the row classes
      formContent = formContent.replace(/className="row align-items-end g-2 mb-2"/g, 'className="row align-items-end g-3 mb-3 border-bottom pb-3"');

      code = code.replace(formAreaRegex, formContent);
    }
}

// Submitting form should close modal
if (!code.includes('setShowModalForm(false);\n      Swal.fire({')) {
    code = code.replace(/Swal\.fire\(\{\s*icon: "success",\s*title: "Berhasil!",\s*text: "Data berhasil disimpan.",/g, 
      'setShowModalForm(false);\n      Swal.fire({\n        icon: "success",\n        title: "Berhasil!",\n        text: "Data berhasil disimpan.",'
    );
}

// 9. CSS
if (!code.includes('.modal-overlay')) {
    code = code.replace(/\.form-area,\s*\.table-area \{/g, 
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

    code = code.replace(/\.row\.align-items-end\.g-2\.mb-2 > div \{[\s\S]*?\}/g, 
      `/* Update modal di HP */
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
  }
  .table-area {
    padding: 10px !important;
    overflow-x: auto;
  }`
    );
}

fs.writeFileSync('pages/dashboard.js', code);
console.log("Idempotent patch applied to dashboard.js");

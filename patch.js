const fs = require('fs');

let content = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Add Sidebar import
if (!content.includes('import Sidebar')) {
    content = content.replace(
        'import styles from "../styles/dashboard.module.css";', 
        'import styles from "../styles/dashboard.module.css";\nimport Sidebar from "../components/Sidebar";'
    );
}

// 2. Update createEmptyRow
if (!content.includes('foto: null')) {
    content = content.replace(
        'fileUrl: "",', 
        'fileUrl: "",\n      foto: null,\n      fotoUrl: "",'
    );
}

// 4. handleMarkSudah validation
const oldMark = 'async function handleMarkSudah(rowNumber) {';
const newMark = `async function handleMarkSudah(r) {
    const rowNumber = r[15];
    const sn = String(r[9] || "").trim();
    const fotoUrl = String(r[14] || "").trim();
    
    if (!sn || !fotoUrl) {
      Swal.fire("Gagal", "SN dan Foto wajib diisi oleh Admin sebelum mengubah status.", "warning");
      return;
    }`;
if (content.includes('async function handleMarkSudah(rowNumber) {')) {
    content = content.replace(oldMark, newMark);
    content = content.replace(/onClick=\{\(\) => handleMarkSudah\(rowNumber\)\}/g, 'onClick={() => handleMarkSudah(r)}');
}

// 5. handleEditRow
if (!content.includes('fotoUrl: row[14] || "",')) {
    content = content.replace(
        'fileUrl: row[10] || "",',
        'fileUrl: row[10] || "",\n      fotoUrl: row[14] || "",\n      foto: null,'
    );
    content = content.replace('rowNumber: row[14] || null,', 'rowNumber: row[15] || null,');
}

// 6. handleSubmitMulti: upload foto
const uploadFotoLogic = `
        if (row.foto) {
          if (row.foto.size > 5 * 1024 * 1024) {
            Swal.fire("File terlalu besar", "Maksimal 5MB untuk Foto", "warning");
            continue;
          }
          const base64Foto = await fileToBase64(row.foto);
          const base64DataFoto = String(base64Foto).split(",")[1] || base64Foto;
          const upResFoto = await apiPost("uploadFile", {
            data: base64DataFoto,
            mimeType: row.foto.type || "application/octet-stream",
            filename: row.foto.name,
          });
          fotoUrl = upResFoto.data?.data || upResFoto.data || "";
        }`;

if (!content.includes('let fotoUrl =')) {
    content = content.replace(
        'let fileUrl = row.fileUrl || "";', 
        'let fileUrl = row.fileUrl || "";\n        let fotoUrl = row.fotoUrl || "";'
    );
    content = content.replace(
        'payloadArray.push({', 
        uploadFotoLogic + '\n        payloadArray.push({'
    );
    content = content.replace(
        'fileUrl,', 
        'fileUrl,\n          fotoUrl,'
    );
}

// 7. Form rendering: Add Foto input for Admin
const formFotoInput = `
                      <div className="col-md-2">
                        <label>Foto (Admin)</label>
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          onChange={(e) =>
                            handleFormChange(idx, "foto", e.target.files?.[0] || null)
                          }
                        />
                        {row.fotoUrl && (
                          <a href={row.fotoUrl} target="_blank" rel="noreferrer" className="small d-block">
                            Lihat Foto
                          </a>
                        )}
                      </div>`;
if (!content.includes('Foto (Admin)')) {
    content = content.replace(
        '</>\n                  )}', 
        formFotoInput + '\n                    </>\n                  )}'
    );
}

// 8. Table Headers and Columns
if (!content.includes('<th>Foto Admin</th>')) {
    content = content.replace('<th>File PK</th>', '<th>File PK</th>\n                  <th>Foto Admin</th>');
    
    const oldTdFile = '<td>\n{typeof r[10] === "string" && r[10].startsWith("http") ? (\n  <a href={r[10]} target="_blank" rel="noreferrer">\n    Lihat\n  </a>\n) : (\n  "-"\n)}\n</td>';
    const newTdFile = oldTdFile + '\n<td>\n{typeof r[14] === "string" && r[14].startsWith("http") ? (\n  <a href={r[14]} target="_blank" rel="noreferrer">Lihat</a>\n) : ("-")}\n</td>';
    
    // Fallback if formatting doesn't exactly match
    content = content.replace('<th>File PK</th>', '<th>File PK</th>\n                  <th>Foto Admin</th>'); // already did this but let's do td
    // Let's use regex for the td replacement because whitespace might differ
    content = content.replace(/<td>\s*\{typeof r\[10\] === "string".*?<\/td>/s, function(match) {
      return match + '\n<td>\n{typeof r[14] === "string" && r[14].startsWith("http") ? (\n  <a href={r[14]} target="_blank" rel="noreferrer">Lihat</a>\n) : ("-")}\n</td>';
    });
    
    content = content.replace('const rowNumber = r[14];', 'const rowNumber = r[15];');
}

// 9. Wrap with Sidebar
if (!content.includes('<Sidebar loginData={loginData}>')) {
    content = content.replace(
        '<div className="p-3" style={{ background: "#f4f7fb", minHeight: "100vh" }}>', 
        '<Sidebar loginData={loginData}>\n<div className="p-3" style={{ background: "transparent", minHeight: "100vh" }}>'
    );
    content = content.replace(
        '      {/* Styling singkat */}', 
        '    </Sidebar>\n\n      {/* Styling singkat */}'
    );
    
    // Remove old footer
    content = content.replace(/<footer className="modern-footer">[\s\S]*?<\/footer>/, '');
}

// 10. Hide Header wrapper
if (content.includes('header-wrapper')) {
    content = content.replace(/<div className="header-wrapper">[\s\S]*?{.*\/\* FORM INPUT MULTI-ROW \*\//, '{/* FORM INPUT MULTI-ROW */');
}

fs.writeFileSync('pages/dashboard.js', content, 'utf8');
console.log("Patched dashboard.js successfully.");

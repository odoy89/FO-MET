const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Remove duplicated <th>Foto Admin</th>
// We look for '<th>Foto Admin</th>' occurring twice consecutively
code = code.replace(/<th>Foto Admin<\/th>\s*<th>Foto Admin<\/th>/, '<th>Foto Admin</th>');

// 2. Add the Foto Admin upload field in the form.
// It should be placed right after the "Upload File" (File PK) input section.
// The File PK section looks like:
/*
                  <div className="col-md-2">
                    <label>Upload File</label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) =>
                        handleFileChange(idx, e.target.files?.[0] || null)
                      }
                    />
                    {row.fileUrl && (
                      <a
                        href={row.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="small d-block"
                      >
                        File Lama
                      </a>
                    )}
                  </div>
*/

const filePkEnd = `                      </a>
                    )}
                  </div>`;

const fotoAdminForm = `
                  {roleLogin === "ADMINISTRATOR" && (
                    <div className="col-md-2">
                      <label>Foto Admin</label>
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
                          className="small d-block"
                        >
                          File Lama
                        </a>
                      )}
                    </div>
                  )}
`;

if (code.includes(filePkEnd)) {
    code = code.replace(filePkEnd, filePkEnd + fotoAdminForm);
}

fs.writeFileSync('pages/dashboard.js', code);
console.log("Fixed dashboard.js duplication and missing form field");

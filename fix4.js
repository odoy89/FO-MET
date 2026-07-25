const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

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
                          handleFileChange(idx, e.target.files?.[0] || null, "foto")
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
    fs.writeFileSync('pages/dashboard.js', code);
    console.log("Added Foto Admin form field");
} else {
    console.log("Could not find filePkEnd in dashboard.js");
}

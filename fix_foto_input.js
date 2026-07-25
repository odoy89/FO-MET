const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const fotoInputHtml = `
                      <div className="col-md-2">
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
                            className="small d-block text-info"
                          >
                            Lihat Foto
                          </a>
                        )}
                      </div>
`;

// Find the place to insert. The Admin section ends before "Peruntukan"
// We can insert it right after the Error (%) div
const targetString = `
  <div className="col-md-1">
    <label>Error (%)</label>
    <input
      type="number"
      className="form-control form-control-sm"
      value={row.errorMeter}
      onChange={(e) => handleFormChange(idx, "errorMeter", e.target.value)}
      placeholder="%"
    />
  </div>
`;

if (code.includes(targetString)) {
  code = code.replace(targetString, targetString + '\n' + fotoInputHtml);
  fs.writeFileSync('pages/dashboard.js', code);
  console.log("Added Upload Foto KWh input successfully!");
} else {
  console.log("Could not find target string");
}

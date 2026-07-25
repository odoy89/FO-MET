const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// The issue is </Sidebar> is placed at 1375, but it should be placed right before <style jsx>.
// And the div that wraps everything should be closed right before </Sidebar>.

// Let's remove the </Sidebar> that was added wrongly.
code = code.replace('    </Sidebar>\n\n      {/* Styling singkat */}', '      {/* Styling singkat */}');

// Let's find the very last </div> before ); and replace it with </div>\n</Sidebar>
code = code.replace(/<\/div>\s*\n\s*\);\s*\}\s*$/, '</div>\n    </Sidebar>\n  );\n}');

// Also add Foto (Admin)
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

// Replace the closing fragment of the admin-only block
code = code.replace('                    </>\n                  )}', formFotoInput + '\n                    </>\n                  )}');

fs.writeFileSync('pages/dashboard.js', code);
console.log("Fixed dashboard.js");

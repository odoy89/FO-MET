const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const regex = /<div className="form-area p-0 shadow-none border-0" id="form-area">\s*<h5>\s*<i className="bi bi-pencil-square"><\/i> Input Data\s*<\/h5>/;

if (regex.test(code)) {
  code = code.replace(regex, '<div className="form-area p-0 shadow-none border-0" id="form-area">');
  fs.writeFileSync('pages/dashboard.js', code);
  console.log("Successfully removed duplicate header.");
} else {
  console.log("Regex did not match anything.");
}

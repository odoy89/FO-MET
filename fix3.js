const fs = require('fs');
const lines = fs.readFileSync('pages/dashboard.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div style={{ maxHeight: 500, overflowY: "auto" }}>')) {
    lines[i] = '          <div className="table-responsive">';
  }
  if (lines[i].includes('</Sidebar>') && lines[i+3] && lines[i+3].includes('<style jsx>')) {
    lines[i] = ''; // remove this one
  }
}

fs.writeFileSync('pages/dashboard.js', lines.join('\n'));
console.log("Fixed dashboard.js correctly using lines");

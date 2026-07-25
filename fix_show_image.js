const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const regex = /function handleShowImage\(url\) \{[\s\S]*?\}\s*\/\/\s*====== TANDAI SUDAH ======/;

const newContent = `function handleShowImage(url) {
    window.open(url, "_blank");
  }

  // ====== TANDAI SUDAH ======`;

code = code.replace(regex, newContent);

fs.writeFileSync('pages/dashboard.js', code);
console.log('REALLY Fixed handleShowImage');

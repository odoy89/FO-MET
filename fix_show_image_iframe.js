const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const regex = /function handleShowImage\(url\) \{[\s\S]*?\}\s*\/\/\s*====== TANDAI SUDAH ======/;

const newContent = `function handleShowImage(url) {
    let iframeUrl = url;
    if (url.includes("drive.google.com")) {
      const match = url.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
      const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      const id = match ? match[1] : (idMatch ? idMatch[1] : null);
      if (id) {
        iframeUrl = \`https://drive.google.com/file/d/\${id}/preview\`;
      }
    }

    Swal.fire({
      html: \`<iframe src="\${iframeUrl}" style="width:100%; height:70vh; border:none; border-radius:8px;"></iframe>\`,
      showConfirmButton: false,
      showCloseButton: true,
      width: "450px", // Portrait width
      padding: "1em",
    });
  }

  // ====== TANDAI SUDAH ======`;

code = code.replace(regex, newContent);

fs.writeFileSync('pages/dashboard.js', code);
console.log('Fixed handleShowImage to use iframe popup in portrait');

const fs = require('fs');
let css = fs.readFileSync('styles/globals.css', 'utf8');

// Ensure sticky header works correctly
if (!css.includes('.table-responsive table { border-collapse: separate; border-spacing: 0; }')) {
  css += `\n/* Fix sticky header */\n.table-responsive table { border-collapse: separate; border-spacing: 0; }\n.table-responsive thead th { position: sticky !important; top: 0 !important; z-index: 10 !important; background-color: #f8fafc !important; }\n`;
  fs.writeFileSync('styles/globals.css', css);
  console.log("Updated globals.css for sticky header");
} else {
  console.log("Sticky header fix already in globals.css");
}

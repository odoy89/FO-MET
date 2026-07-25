const fs = require('fs');
let code = fs.readFileSync('pages/api/proxy.js', 'utf8');
if (!code.includes('export const config')) {
  code = `export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

` + code;
  fs.writeFileSync('pages/api/proxy.js', code);
  console.log('Added config to proxy.js');
}

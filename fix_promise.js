const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

code = code.replace(
  /const\s*\[poRes,\s*optRes,\s*tarifRes,\s*kwhRes\]\s*=\s*await\s*Promise\.all\(\[\s*apiPost\("getPOData",\s*\{\s*unit:\s*loginData\.unit,\s*role:\s*loginData\.role\s*\}\),\s*apiPost\("getTarifOptions"\),\s*apiPost\("getTarifData"\),\s*apiPost\("getDataKWH"\),\s*\]\);/,
  `const poRes = await apiPost("getPOData", { unit: loginData.unit, role: loginData.role });\n        const optRes = await apiPost("getTarifOptions");\n        const tarifRes = await apiPost("getTarifData");\n        const kwhRes = await apiPost("getDataKWH");`
);

fs.writeFileSync('pages/dashboard.js', code);
console.log("Promise replaced!");

const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

code = code.replace(/<\/form>\r?\n\s*<\/div>\r?\n\r?\n\s*\{\/\* FILTER GRAFIK PER UNIT \*\/\}/g, 
  `</form>\n        </div>\n      </div>\n    </div>\n  )}\n\n        {/* FILTER GRAFIK PER UNIT */}`);

fs.writeFileSync('pages/dashboard.js', code);
console.log('Fixed missing closing tags');

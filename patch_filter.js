const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const regex1 = /\{\(\(\) => \{\s*const allowedUnits = ADMIN_UNIT_SCOPE\[namaUser\] \|\| \[\];\s*const showUnits = allowedUnits\.length\s*\?\s*units\.filter\(u =>\s*allowedUnits\.includes\(String\(u\)\.trim\(\)\.replace\(\/\\s\/g, ""\)\)\s*\)\s*:\s*units;\s*return showUnits\.map\(\(u\) => \(\s*<option key=\{u\} value=\{u\}>\{u\}<\/option>\s*\)\);\s*\}\)\(\)\}/g;

code = code.replace(regex1, "{renderUnitOptions()}");

// Note: One was for the graph filter, one was for the table filter.
// The table filter is slightly different:
const regex2 = /\{\(\(\) => \{\s*const allowedUnits = ADMIN_UNIT_SCOPE\[namaUser\] \|\| \[\];\s*const showUnits = allowedUnits\.length\s*\?\s*units\.filter\(u => allowedUnits\.includes\(String\(u\)\.trim\(\)\.replace\(\/\\s\/g, ""\)\)\)\s*:\s*units;\s*return showUnits\.map\(\(u\) => \(\s*<option key=\{u\} value=\{u\}>\{u\}<\/option>\s*\)\);\s*\}\)\(\)\}/g;

code = code.replace(regex2, "{renderUnitOptions()}");

fs.writeFileSync('pages/dashboard.js', code);
console.log("Patched successfully.");

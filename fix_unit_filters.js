const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Fix Table Filter Logic (filters.unit)
code = code.replace(
  /\/\/ filter unit\s*if \(filters\.unit && unit !== filters\.unit\) return false;/,
  `// filter unit
    if (filters.unit) {
      if (filters.unit.startsWith("UP3 ")) {
        const groupUnits = ADMIN_UNIT_SCOPE["ADMIN " + filters.unit] || [];
        if (!groupUnits.includes(unit)) return false;
      } else {
        if (unit !== filters.unit) return false;
      }
    }`
);

// 2. Fix Chart Filter Logic (chartUnitFilter)
code = code.replace(
  /if \(chartUnitFilter\) \{\s*sumber = sumber\.filter\(\s*\(r\) => String\(r\[1\] \|\| ""\)\.trim\(\) === chartUnitFilter\s*\);\s*\}/,
  `if (chartUnitFilter) {
  sumber = sumber.filter((r) => {
    const rUnit = String(r[1] || "").trim();
    if (chartUnitFilter.startsWith("UP3 ")) {
      const gUnits = ADMIN_UNIT_SCOPE["ADMIN " + chartUnitFilter] || [];
      return gUnits.includes(rUnit);
    }
    return rUnit === chartUnitFilter;
  });
}`
);

// 3. Helper Function for Rendering Dropdown Options
// We need to insert the helper function inside the Dashboard component, e.g., right before `// ====== RINGKASAN SUDAH / BELUM ====== ` or something.
const helperCode = `
  const renderUnitOptions = () => {
    const isUser = roleLogin === "USER";
    if (isUser) {
      return <option value={userUnit}>{userUnit}</option>;
    }
    const allowedUnits = ADMIN_UNIT_SCOPE[namaUser] || [];
    if (allowedUnits.length > 0) {
      return allowedUnits.map((u, idx) => (
        <option key={idx} value={u}>{u}</option>
      ));
    }
    return (
      <>
        <optgroup label="UP3">
          {Object.keys(ADMIN_UNIT_SCOPE).map((key) => {
            const up3Name = key.replace("ADMIN ", "");
            return <option key={up3Name} value={up3Name}>{up3Name}</option>;
          })}
        </optgroup>
        <optgroup label="Unit">
          {units.map((u, idx) => {
            const unitStr = String(u).trim();
            return <option key={idx} value={unitStr}>{unitStr}</option>;
          })}
        </optgroup>
      </>
    );
  };
`;

code = code.replace(
  /\/\/ ====== RINGKASAN SUDAH \/ BELUM ======/,
  helperCode + '\n  // ====== RINGKASAN SUDAH / BELUM ======'
);


// 4. Replace Chart Dropdown Rendering
const chartDropdownOld = `{(() => {
    const allowedUnits = ADMIN_UNIT_SCOPE[namaUser] || [];

    const showUnits = allowedUnits.length
      ? units.filter(u =>
  allowedUnits.includes(String(u).trim().replace(/\\s/g, ""))
)
      : units;

    return showUnits.map((u) => (
      <option key={u} value={u}>{u}</option>
    ));
  })()}`;
  
code = code.replace(chartDropdownOld, `{renderUnitOptions()}`);

// 5. Replace Table Dropdown Rendering
const tableDropdownOld = `{(() => {
                  const allowedUnits = ADMIN_UNIT_SCOPE[namaUser] || [];
                  const showUnits = allowedUnits.length
                    ? units.filter(u => allowedUnits.includes(String(u).trim().replace(/\\s/g, "")))
                    : units;
                  return showUnits.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ));
                })()}`;
                
code = code.replace(tableDropdownOld, `{renderUnitOptions()}`);

fs.writeFileSync('pages/dashboard.js', code);
console.log("Fixed unit filters successfully!");

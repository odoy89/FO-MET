const fs = require('fs');

let code = fs.readFileSync('pages/settings.js', 'utf8');

const scopeCode = `
const ADMIN_UNIT_SCOPE = {
  "ADMIN UP3 TANJUNG KARANG": ["17100","17110","17120","17130","17131","17150","17180"],
  "ADMIN UP3 PRINGSEWU": ["17400","17410","17420","17430","17440"],
  "ADMIN UP3 KOTABUMI": ["17300","17330","17340","17350","17360","17370"],
  "ADMIN UP3 METRO": ["17200","17210","17220","17270","17280"],
};
`;

if (!code.includes('ADMIN_UNIT_SCOPE')) {
  code = code.replace(
    'export default function SettingsPage() {',
    scopeCode + '\nexport default function SettingsPage() {'
  );
}

// Add logic to get filtered units
const logicStr = `
  const roleLogin = loginData?.role || "USER";
  const userUnit = loginData?.unit || "";
  const rawNama = loginData?.nama || userUnit;
  const namaUser = rawNama.toUpperCase().replace("(ADMINISTRATOR)", "").trim();
  const isAdminSuper = (userUnit === "admin" || userUnit === "uid");
  const allowedUnits = ADMIN_UNIT_SCOPE[namaUser] || [];

  const displayedUsers = users.filter(u => {
    if (isAdminSuper) return true;
    if (u.unit === userUnit) return true;
    return allowedUnits.includes(u.unit);
  });
`;

if (!code.includes('const isAdminSuper =')) {
  code = code.replace(
    'return (\n    <Sidebar loginData={loginData}>',
    logicStr + '\n  return (\n    <Sidebar loginData={loginData}>'
  );
}

// Replace the users mapping to displayedUsers
code = code.replace(/users\.map\(u =>/g, 'displayedUsers.map(u =>');

// Change the Unit Input to a Select for Unit Admins
const oldInput = `<input required className="form-control" value={formUser.unit} onChange={e=>setFormUser({...formUser, unit: e.target.value})} />`;
const newInput = `
  {isAdminSuper ? (
    <input required className="form-control" value={formUser.unit} onChange={e=>setFormUser({...formUser, unit: e.target.value})} />
  ) : (
    <select required className="form-select" value={formUser.unit} onChange={e=>setFormUser({...formUser, unit: e.target.value})}>
      <option value="">Pilih Unit</option>
      {allowedUnits.map(u => <option key={u} value={u}>{u}</option>)}
    </select>
  )}
`;

code = code.replace(oldInput, newInput);

fs.writeFileSync('pages/settings.js', code);
console.log("pages/settings.js updated successfully.");

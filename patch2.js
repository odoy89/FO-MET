const fs = require('fs');

// --- Fix dashboard.js ---
let dash = fs.readFileSync('pages/dashboard.js', 'utf8');

// Remove bottomNav HTML block
dash = dash.replace(/\{\/\* ================= BOTTOM NAV ================= \*\/\}.*?<\/div>/s, '');
// Remove bottomNav CSS
dash = dash.replace(/\/\* =========================================\s*BOTTOM NAV\s*=========================================\s*\*\/\s*\.bottomNav[\s\S]*?\}\s*(?=\/\* FAB BUTTON \*\/)/s, '');

// Save dashboard.js
fs.writeFileSync('pages/dashboard.js', dash);
console.log("Patched dashboard.js");

// --- Fix settings.js ---
let set = fs.readFileSync('pages/settings.js', 'utf8');

const newFetch = `
  async function fetchData() {
    try {
      setLoading(true);
      const [uRes, tRes, kRes] = await Promise.all([
        apiPost("getUsers"),
        apiPost("getTarifData"),
        apiPost("getKWHMaster")
      ]);

      if (uRes?.error === "Unknown action") {
        Swal.fire({
          icon: 'warning',
          title: 'Google Apps Script Belum Diupdate',
          text: 'Harap copy code.gs terbaru dan pastikan Deploy menggunakan "New version".'
        });
      }

      setUsers(uRes?.data || []);
      
      if(Array.isArray(tRes?.data)) {
        setTarifs(tRes.data.map((r, i) => ({ unit: r[0], tarif: r[1], daya: r[2], row: i + 2 })));
      }
      setKwhs(kRes?.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  }
`;

set = set.replace(/async function fetchData\(\) \{[\s\S]*?\}\s*\}[\s\n]*\/\* ==== HANDLERS ====\ *\//, newFetch + '\n\n  // ==== HANDLERS ====');

// Change card styling to be more compact
set = set.replace(/<div className="card shadow-sm border-0 p-4" style={{ borderRadius: 16 }}>/, '<div className="card shadow-sm border-0 p-3" style={{ borderRadius: 12 }}>');
set = set.replace(/<h3 className="mb-4 text-primary" style={{ fontWeight: 800 }}>⚙️ Settings Master<\/h3>/, '<h4 className="mb-3 text-primary" style={{ fontWeight: 800 }}>⚙️ Settings Master</h4>');

fs.writeFileSync('pages/settings.js', set);
console.log("Patched settings.js");


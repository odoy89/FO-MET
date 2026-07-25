const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// Replace the end of setUnits to restore the rest of the try block
code = code.replace(/setUnits\(\s*\(\s*u\s*\|\|\s*\[\]\)\.map\(x => String\(x\)\.trim\(\)\.replace\(\/\\\\s\/g, \"\"\)\)\s*\);/, 
  'setUnits((u || []).map(x => String(x).trim().replace(/\\\\s/g, "")));\\n\\n        setTarifData(Array.isArray(tarifRes?.data) ? tarifRes.data : []);\\n        setDataKWH(Array.isArray(kwhRes?.data) ? kwhRes.data : []);\\n\\n        setFormRows([createEmptyRow()]);\\n      } catch (err) {\\n        console.error(err);\\n        Swal.fire("Error", err.message || "Gagal memuat data dari server", "error");\\n      } finally {\\n        setLoadingData(false);\\n      }\\n    })();'
);

// Actually, I can just use a simple string replacement:
const searchStr = 'setUnits(\n  (u || []).map(x => String(x).trim().replace(/\\s/g, ""))\n  }, [loginData]);';

// Wait, the file currently looks like:
// setUnits(
//   (u || []).map(x => String(x).trim().replace(/\s/g, ""))
//   }, [loginData]);

code = code.replace('setUnits(\n  (u || []).map(x => String(x).trim().replace(/\\s/g, ""))\n  }, [loginData]);', 
`setUnits(
  (u || []).map(x => String(x).trim().replace(/\\s/g, ""))
);

        setTarifData(Array.isArray(tarifRes?.data) ? tarifRes.data : []);
        setDataKWH(Array.isArray(kwhRes?.data) ? kwhRes.data : []);

        setFormRows([createEmptyRow()]);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message || "Gagal memuat data dari server", "error");
      } finally {
        setLoadingData(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginData]);`
);

fs.writeFileSync('pages/dashboard.js', code);

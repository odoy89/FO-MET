const fs = require('fs');
let code = fs.readFileSync('components/Sidebar.js', 'utf8');

if (!code.includes('import Swal from')) {
  code = code.replace("import { useRouter }", "import { useRouter }\nimport Swal from 'sweetalert2';");
}

const oldLogout = `  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("loginData");
      router.replace("/");
    }
  }`;

const newLogout = `  async function handleLogout() {
    if (typeof window !== "undefined") {
      const res = await Swal.fire({
        title: 'Yakin Anda ingin Logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
      });
      if (res.isConfirmed) {
        window.localStorage.removeItem("loginData");
        router.replace("/");
      }
    }
  }`;

code = code.replace(oldLogout, newLogout);

fs.writeFileSync('components/Sidebar.js', code);
console.log("Updated Sidebar.js with SweetAlert2 logout");

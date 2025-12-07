import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import { apiPost } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [unit, setUnit] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginData = window.localStorage.getItem("loginData");
      if (loginData) router.replace("/dashboard");
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    if (!unit || !password) {
      Swal.fire("Oops", "Unit dan password wajib diisi", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await apiPost("login", {
        username: unit,
        password: password
      });

      const result = res?.data ?? res?.result ?? res;

      if (!result?.success) {
        Swal.fire("Gagal", "Unit atau password salah", "error");
        return;
      }

      window.localStorage.setItem("loginData", JSON.stringify(result));

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        timer: 900,
        showConfirmButton: false,
      });

      router.push("/dashboard");

    } catch (err) {
      Swal.fire("Error", err.message || "Tidak dapat terhubung ke server", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d6efd, #1e90ff)',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: 380,
        width: "100%",
        background: "#fff",
        padding: 25,
        borderRadius: 18,
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
      }}>
        
        {/* ====== LOGO FO⚡MET ====== */}
        <div className="text-center mb-4">

<div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 800,
  fontSize: 40,
  letterSpacing: 0,
}}>
  <span style={{ color: "#0d6efd", marginRight: 0 }}>FO</span>

  <span 
    style={{
      color: "orange",
      fontSize: 40,
      fontWeight: 900,
      margin: "0 2px"   // ⚡ JARAK PALING MINIMAL
    }}
  >
    ⚡
  </span>

  <span style={{ color: "#0d6efd", marginLeft: 0 }}>MET</span>
</div>

<div style={{
  marginTop: "-6px",
  fontSize: 15,
  fontWeight: "bold",
  color: "#333"
}}>
  Form Setting Meter
</div>

</div>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Unit / admin"
            className="form-control mb-3"
            value={unit}
            onChange={e => setUnit(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="form-control mb-3"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

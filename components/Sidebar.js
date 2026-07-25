import Link from "next/link";
import { useRouter } from "next/router";
import Swal from 'sweetalert2';
import { useState } from "react";

export default function Sidebar({ children, loginData }) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isAdmin = loginData?.role === "ADMINISTRATOR";

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "bi-house-door" },
    ...(isAdmin ? [{ name: "Settings Master", path: "/settings", icon: "bi-gear" }] : []),
  ];

  async function handleLogout() {
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
  }

  return (
    <div className="layout-wrapper">
      {/* Top Navbar */}
      <nav className="top-navbar shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center h-100 px-4">
          
          {/* Logo Area */}
          <div className="logo-area d-flex align-items-center">
            <span style={{ fontSize: 24, fontWeight: 900, color: "#0d6efd" }}>FO</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: "orange", margin: "0 2px" }}>⚡</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#0d6efd", marginRight: "30px" }}>MET</span>

            {/* Desktop Menu */}
            <div className="d-none d-md-flex gap-3">
              {menu.map((m) => {
                const active = router.pathname === m.path;
                return (
                  <Link key={m.path} href={m.path} className={`nav-menu-item ${active ? "active" : ""}`}>
                    <i className={`bi ${m.icon}`}></i>
                    <span>{m.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User & Logout (Desktop) */}
          <div className="d-none d-md-flex align-items-center gap-3">
            <div className="text-end">
              <strong style={{ fontSize: 13, color: "#334155", display: "block" }}>{loginData?.nama || "User"}</strong>
              <span className="badge bg-light text-primary border" style={{ fontSize: 10 }}>{loginData?.role}</span>
            </div>
            <button className="btn btn-outline-danger btn-sm fw-bold" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="btn btn-light d-md-none border-0" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            <i className={`bi ${isMobileOpen ? "bi-x-lg" : "bi-list"}`} style={{ fontSize: 24 }}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileOpen && (
        <div className="mobile-menu d-md-none shadow-sm">
          {menu.map((m) => {
            const active = router.pathname === m.path;
            return (
              <Link key={m.path} href={m.path} className={`mobile-menu-item ${active ? "active" : ""}`} onClick={() => setIsMobileOpen(false)}>
                <i className={`bi ${m.icon}`}></i>
                <span>{m.name}</span>
              </Link>
            );
          })}
          <div className="p-3 border-top bg-light">
            <div className="mb-2 text-center">
              <strong style={{ fontSize: 13, color: "#334155", display: "block" }}>{loginData?.nama || "User"}</strong>
              <span className="badge bg-white text-primary border" style={{ fontSize: 10 }}>{loginData?.role}</span>
            </div>
            <button className="btn btn-danger w-100 fw-bold shadow-sm btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .layout-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f1f5f9;
        }

        .top-navbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          height: 65px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .nav-menu-item {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          color: #475569;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
        }

        .nav-menu-item i {
          font-size: 18px;
          margin-right: 8px;
          color: #94a3b8;
        }

        .nav-menu-item:hover {
          background: #f8fafc;
          color: #2563eb;
        }
        .nav-menu-item:hover i {
          color: #2563eb;
        }

        .nav-menu-item.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }
        .nav-menu-item.active i {
          color: #2563eb;
        }

        .mobile-menu {
          position: fixed;
          top: 65px;
          left: 0;
          right: 0;
          background: white;
          z-index: 999;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: #475569;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          border-bottom: 1px solid #f1f5f9;
        }
        .mobile-menu-item i {
          font-size: 18px;
          margin-right: 12px;
          color: #94a3b8;
        }
        .mobile-menu-item.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;
        }
        .mobile-menu-item.active i {
          color: #2563eb;
        }

        .main-content {
          margin-top: 65px; /* Navbar height */
          padding: 20px;
          flex: 1;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

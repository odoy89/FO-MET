import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function Sidebar({ children, loginData }) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isAdmin = loginData?.role === "ADMINISTRATOR";

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "bi-house-door" },
    ...(isAdmin ? [{ name: "Settings", path: "/settings", icon: "bi-gear" }] : []),
  ];

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("loginData");
      router.replace("/");
    }
  }

  return (
    <div className="layout-wrapper">
      {/* Mobile Header / Toggle */}
      <div className="mobile-header d-md-none d-flex justify-content-between align-items-center p-3">
        <div className="logo-area d-flex align-items-center">
          <span style={{ fontSize: 24, fontWeight: 900, color: "#0d6efd" }}>FO</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: "orange", margin: "0 2px" }}>⚡</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#0d6efd" }}>MET</span>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <i className={`bi ${isMobileOpen ? "bi-x-lg" : "bi-list"}`}></i>
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand d-none d-md-flex align-items-center justify-content-center pt-4 pb-3">
          <span style={{ fontSize: 32, fontWeight: 900, color: "#0d6efd" }}>FO</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: "orange", margin: "0 2px" }}>⚡</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#0d6efd" }}>MET</span>
        </div>

        <div className="sidebar-menu mt-3">
          {menu.map((m) => {
            const active = router.pathname === m.path;
            return (
              <Link key={m.path} href={m.path} className={`menu-item ${active ? "active" : ""}`} onClick={() => setIsMobileOpen(false)}>
                <i className={`bi ${m.icon}`}></i>
                <span>{m.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-info mb-3 px-3 text-center">
            <small className="text-muted d-block">Login as:</small>
            <strong style={{ fontSize: 13, color: "#444" }}>{loginData?.nama || "User"}</strong>
          </div>
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .layout-wrapper {
          display: flex;
          min-height: 100vh;
          background: #f4f7fb;
        }

        .mobile-header {
          background: white;
          border-bottom: 1px solid #eee;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1001;
        }

        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #eef2f6;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .sidebar-menu {
          flex: 1;
          padding: 0 15px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          color: #555;
          text-decoration: none;
          border-radius: 10px;
          margin-bottom: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .menu-item i {
          font-size: 20px;
          margin-right: 12px;
        }

        .menu-item:hover, .menu-item.active {
          background: #e9f0fc;
          color: #0d6efd;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #eef2f6;
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          min-width: 0;
          padding-bottom: 40px;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            box-shadow: 4px 0 15px rgba(0,0,0,0.05);
            padding-top: 70px;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0;
            margin-top: 60px;
          }
        }
      `}</style>
    </div>
  );
}

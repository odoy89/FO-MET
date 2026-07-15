import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { apiPost } from "../lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  
  // Data States
  const [users, setUsers] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [kwhs, setKwhs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [formUser, setFormUser] = useState({ unit: "", password: "", role: "USER", nama: "" });
  const [formTarif, setFormTarif] = useState({ unit: "", tarif: "", daya: "" });
  const [formKwh, setFormKwh] = useState({ merk: "", type: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("loginData");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "ADMINISTRATOR") {
        router.replace("/dashboard");
        return;
      }
      setLoginData(parsed);
    } catch (err) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!loginData) return;
    fetchData();
  }, [loginData]);

  async function fetchData() {
    try {
      setLoading(true);
      const [uRes, tRes, kRes] = await Promise.all([
        apiPost("getUsers"),
        apiPost("getTarifData"), // we can use the existing or the specific settings one. Wait, in Code.gs I made `getTarifData` return raw data (unit, tarif, daya). Let's use it.
        apiPost("getKWHMaster")
      ]);
      setUsers(uRes?.data || []);
      
      // getTarifData returns array of arrays, we should map it
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

  // ==== HANDLERS ====
  async function handleAddUser(e) {
    e.preventDefault();
    await apiPost("tambahUser", formUser);
    setFormUser({ unit: "", password: "", role: "USER", nama: "" });
    fetchData();
    Swal.fire("Sukses", "User berhasil ditambah", "success");
  }

  async function handleDeleteUser(row) {
    await apiPost("hapusUser", { rowIndex: row });
    fetchData();
  }

  async function handleAddTarif(e) {
    e.preventDefault();
    await apiPost("tambahTarif", formTarif);
    setFormTarif({ unit: "", tarif: "", daya: "" });
    fetchData();
    Swal.fire("Sukses", "Tarif berhasil ditambah", "success");
  }

  async function handleDeleteTarif(row) {
    await apiPost("hapusTarif", { rowIndex: row });
    fetchData();
  }

  async function handleAddKwh(e) {
    e.preventDefault();
    await apiPost("tambahKWH", formKwh);
    setFormKwh({ merk: "", type: "" });
    fetchData();
    Swal.fire("Sukses", "KWH berhasil ditambah", "success");
  }

  async function handleDeleteKwh(row) {
    await apiPost("hapusKWH", { rowIndex: row });
    fetchData();
  }

  if (!loginData) return null;

  return (
    <Sidebar loginData={loginData}>
      <div className="p-4">
        <h3 className="mb-4 text-primary" style={{ fontWeight: 800 }}>⚙️ Settings Master</h3>
        
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link fw-bold ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-bold ${activeTab === 'tarif' ? 'active' : ''}`} onClick={() => setActiveTab('tarif')}>Tarif & Daya</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-bold ${activeTab === 'kwh' ? 'active' : ''}`} onClick={() => setActiveTab('kwh')}>Merk & Type KWH</button>
          </li>
        </ul>

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <div className="card shadow-sm border-0 p-4" style={{ borderRadius: 16 }}>
            {/* TAB USERS */}
            {activeTab === 'users' && (
              <div>
                <h5>Tambah User Baru</h5>
                <form onSubmit={handleAddUser} className="row g-2 align-items-end mb-4">
                  <div className="col-md-3">
                    <label>Unit / Username</label>
                    <input required className="form-control" value={formUser.unit} onChange={e=>setFormUser({...formUser, unit: e.target.value})} />
                  </div>
                  <div className="col-md-2">
                    <label>Password</label>
                    <input required className="form-control" value={formUser.password} onChange={e=>setFormUser({...formUser, password: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label>Nama / Jabatan</label>
                    <input required className="form-control" value={formUser.nama} onChange={e=>setFormUser({...formUser, nama: e.target.value})} />
                  </div>
                  <div className="col-md-2">
                    <label>Role</label>
                    <select className="form-select" value={formUser.role} onChange={e=>setFormUser({...formUser, role: e.target.value})}>
                      <option value="USER">USER</option>
                      <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100">Tambah</button>
                  </div>
                </form>

                <table className="table table-bordered table-striped">
                  <thead className="table-light">
                    <tr><th>Unit/User</th><th>Password</th><th>Role</th><th>Nama</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.row}>
                        <td>{u.unit}</td><td>{u.password}</td><td>{u.role}</td><td>{u.nama}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={()=>handleDeleteUser(u.row)}><i className="bi bi-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB TARIF */}
            {activeTab === 'tarif' && (
              <div>
                <h5>Tambah Tarif & Daya</h5>
                <form onSubmit={handleAddTarif} className="row g-2 align-items-end mb-4">
                  <div className="col-md-4">
                    <label>Unit</label>
                    <input required className="form-control" value={formTarif.unit} onChange={e=>setFormTarif({...formTarif, unit: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label>Tarif</label>
                    <input required className="form-control" value={formTarif.tarif} onChange={e=>setFormTarif({...formTarif, tarif: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <label>Daya</label>
                    <input required type="number" className="form-control" value={formTarif.daya} onChange={e=>setFormTarif({...formTarif, daya: e.target.value})} />
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100">Tambah</button>
                  </div>
                </form>

                <table className="table table-bordered table-striped">
                  <thead className="table-light">
                    <tr><th>Unit</th><th>Tarif</th><th>Daya</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {tarifs.map(t => (
                      <tr key={t.row}>
                        <td>{t.unit}</td><td>{t.tarif}</td><td>{t.daya}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={()=>handleDeleteTarif(t.row)}><i className="bi bi-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB KWH */}
            {activeTab === 'kwh' && (
              <div>
                <h5>Tambah Merk & Type KWH</h5>
                <form onSubmit={handleAddKwh} className="row g-2 align-items-end mb-4">
                  <div className="col-md-5">
                    <label>Merk</label>
                    <input required className="form-control" value={formKwh.merk} onChange={e=>setFormKwh({...formKwh, merk: e.target.value})} />
                  </div>
                  <div className="col-md-5">
                    <label>Type</label>
                    <input required className="form-control" value={formKwh.type} onChange={e=>setFormKwh({...formKwh, type: e.target.value})} />
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100">Tambah</button>
                  </div>
                </form>

                <table className="table table-bordered table-striped">
                  <thead className="table-light">
                    <tr><th>Merk</th><th>Type</th><th>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {kwhs.map(k => (
                      <tr key={k.row}>
                        <td>{k.merk}</td><td>{k.type}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={()=>handleDeleteKwh(k.row)}><i className="bi bi-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Sidebar>
  );
}

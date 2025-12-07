// pages/addPO.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { apiPost } from "../lib/api";

export default function AddPOPage() {
  const router = useRouter();

  const [loginData, setLoginData] = useState(null);
  const [tarifOptions, setTarifOptions] = useState({
    units: [],
    tarifs: [],
    dayas: [],
  });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tanggal: "",
    unit: "",
    pemohon: "",
    idpel: "",
    nama: "",
    tarif: "",
    daya: "",
    merk: "",
    type: "",
    sn: "",
    peruntukan: "PBPD",
    status: "Belum",
    file: null,
  });

  // ====== Ambil login dari localStorage ======
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("loginData");
    if (!stored) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setLoginData(parsed);

      // default unit & pemohon
      setForm((f) => ({
        ...f,
        unit: parsed.role === "ADMINISTRATOR" ? "" : parsed.unit || "",
        pemohon: parsed.nama || "",
      }));
    } catch {
      router.replace("/");
    }
  }, [router]);

  // ====== Ambil opsi tarif/daya/unit ======
  useEffect(() => {
    (async () => {
      try {
        const opt = await apiPost("getTarifOptions");
        setTarifOptions({
          units: opt.units || [],
          tarifs: opt.tarifs || [],
          dayas: opt.dayas || [],
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal mengambil data tarif.", "error");
      }
    })();
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!loginData) return;

    if (!form.tanggal || !form.idpel || !form.nama || !form.peruntukan) {
      Swal.fire("Oops", "Tanggal, IDPEL, Nama dan Peruntukan wajib diisi.", "warning");
      return;
    }

    try {
      setLoading(true);

      // Upload file PK jika ada
      let fileUrl = "";
      if (form.file) {
        const base64Full = await toBase64(form.file);
        const base64 = base64Full.split(",")[1] || base64Full;
        fileUrl = await apiPost("uploadFile", {
          filename: form.file.name,
          mimeType: form.file.type || "application/octet-stream",
          data: base64,
        });
      }

      const unitFinal =
        loginData.role === "ADMINISTRATOR" ? form.unit : loginData.unit || "";

      const dataArray = [
        {
          tanggal: form.tanggal,
          unit: unitFinal,
          pemohon: form.pemohon,
          idpel: form.idpel,
          nama: form.nama,
          tarif: form.tarif,
          daya: form.daya,
          merk: form.merk,
          type: form.type,
          sn: form.sn,
          fileUrl,
          peruntukan: form.peruntukan,
          status: form.status || "Belum",
        },
      ];

      const result = await apiPost("tambahDataPOMulti", { data: dataArray });
      if (result !== true) {
        // Apps Script bisa aja balikin true atau object lain
        console.log("tambahDataPOMulti result:", result);
      }

      Swal.fire({
        icon: "success",
        title: "Data PO berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Gagal menyimpan data PO.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!loginData) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #0d6efd, #1e90ff)",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <h3>Memuat halaman tambah PO...</h3>
      </div>
    );
  }

  const isAdmin = loginData.role === "ADMINISTRATOR";

  return (
    <div className="p-3" style={{ background: "#f5f7fb", minHeight: "100vh" }}>
      <div className="container">
        {/* HEADER mirip dashboard */}
        <div className="header-wrapper mb-3">
          <div className="header-left">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_PLN.svg"
              alt="Logo PLN"
            />
            <h6 className="mb-0">UP3 TANJUNG KARANG</h6>
          </div>
          <div className="header-center">
            <h3>Form Setting KWH - Tambah PO</h3>
          </div>
          <div className="header-right text-end">
            <strong>
              {loginData.nama} ({loginData.role})
            </strong>
            <br />
            <button
              className="btn btn-sm btn-secondary mt-1"
              onClick={() => router.push("/dashboard")}
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>

        {/* CARD FORM */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Tambah Data PO</h5>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    className="form-control"
                    value={form.tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Unit</label>
                  {isAdmin ? (
                    <select
                      name="unit"
                      className="form-select"
                      value={form.unit}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Pilih Unit --</option>
                      {tarifOptions.units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={loginData.unit}
                      disabled
                    />
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label">Pemohon</label>
                  <input
                    type="text"
                    name="pemohon"
                    className="form-control"
                    value={form.pemohon}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">IDPEL</label>
                  <input
                    type="text"
                    name="idpel"
                    className="form-control"
                    value={form.idpel}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Nama</label>
                  <input
                    type="text"
                    name="nama"
                    className="form-control"
                    value={form.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Tarif</label>
                  <select
                    name="tarif"
                    className="form-select"
                    value={form.tarif}
                    onChange={handleChange}
                  >
                    <option value="">-</option>
                    {tarifOptions.tarifs.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Daya</label>
                  <select
                    name="daya"
                    className="form-select"
                    value={form.daya}
                    onChange={handleChange}
                  >
                    <option value="">-</option>
                    {tarifOptions.dayas.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Merk</label>
                  <input
                    type="text"
                    name="merk"
                    className="form-control"
                    value={form.merk}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Type</label>
                  <input
                    type="text"
                    name="type"
                    className="form-control"
                    value={form.type}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">SN</label>
                  <input
                    type="text"
                    name="sn"
                    className="form-control"
                    value={form.sn}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Peruntukan</label>
                  <select
                    name="peruntukan"
                    className="form-select"
                    value={form.peruntukan}
                    onChange={handleChange}
                    required
                  >
                    <option value="PBPD">PBPD</option>
                    <option value="HAR">HAR</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Belum">Belum</option>
                    <option value="Sudah">Sudah</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Upload File PK (PDF/JPG)</label>
                  <input
                    type="file"
                    name="file"
                    className="form-control"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <div className="mt-4 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

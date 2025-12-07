// pages/updatePO.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { apiPost } from "../lib/api";

export default function UpdatePOPage() {
  const router = useRouter();
  const { row } = router.query; // rowNumber dari dashboard

  const [loginData, setLoginData] = useState(null);
  const [tarifOptions, setTarifOptions] = useState({
    units: [],
    tarifs: [],
    dayas: [],
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
    peruntukan: "",
    status: "Belum",
    file: null,
    fileLama: "",
    rowNumber: null,
  });

  // Login
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
    } catch {
      router.replace("/");
    }
  }, [router]);

  // Ambil opsi tarif
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
      }
    })();
  }, []);

  // Ambil data row yang mau diedit
  useEffect(() => {
    if (!row) return;
    (async () => {
      try {
        setLoadingData(true);
        const poData = await apiPost("getPOData"); // array of array

        const found = poData.find((r) => String(r[13]) === String(row));
        if (!found) {
          Swal.fire("Error", "Data tidak ditemukan.", "error");
          router.replace("/dashboard");
          return;
        }

        setForm({
          tanggal: found[0] || "",
          unit: found[1] || "",
          pemohon: found[2] || "",
          idpel: found[3] || "",
          nama: found[4] || "",
          tarif: found[5] || "",
          daya: found[6] || "",
          merk: found[7] || "",
          type: found[8] || "",
          sn: found[9] || "",
          fileLama: found[10] || "",
          peruntukan: found[11] || "",
          status: found[12] || "Belum",
          file: null,
          rowNumber: found[13],
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal mengambil data PO.", "error");
        router.replace("/dashboard");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [row, router]);

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
    if (!form.rowNumber) return;

    try {
      setLoading(true);

      // Upload file baru jika dipilih, kalau tidak pakai file lama
      let fileUrl = form.fileLama || "";
      if (form.file) {
        const base64Full = await toBase64(form.file);
        const base64 = base64Full.split(",")[1] || base64Full;
        fileUrl = await apiPost("uploadFile", {
          filename: form.file.name,
          mimeType: form.file.type || "application/octet-stream",
          data: base64,
        });
      }

      const dataArray = [
        {
          tanggal: form.tanggal,
          unit: form.unit,
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
          rowNumber: form.rowNumber, // penting untuk update
        },
      ];

      await apiPost("tambahDataPOMulti", { data: dataArray });

      Swal.fire({
        icon: "success",
        title: "Data PO berhasil diupdate",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Gagal mengupdate data PO.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!loginData || loadingData) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #0d6efd, #1e90ff)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <h3>Memuat data PO...</h3>
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
            <h3>Form Setting KWH - Edit PO</h3>
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
            <h5 className="card-title mb-3">Edit Data PO</h5>

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
                  <select
                    name="unit"
                    className="form-select"
                    value={form.unit}
                    onChange={handleChange}
                    disabled={!isAdmin}
                  >
                    <option value="">-- Pilih Unit --</option>
                    {tarifOptions.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
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
                  <label className="form-label">File PK (opsional)</label>
                  <input
                    type="file"
                    name="file"
                    className="form-control"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {form.fileLama && (
                    <small className="text-muted">
                      File saat ini:{" "}
                      <a href={form.fileLama} target="_blank" rel="noreferrer">
                        Lihat
                      </a>
                    </small>
                  )}
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
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

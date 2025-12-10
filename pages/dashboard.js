// pages/dashboard.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import styles from "../styles/dashboard.module.css";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { apiPost } from "../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const router = useRouter();

  // ====== STATE UTAMA ======
  const [loginData, setLoginData] = useState(null);
  const [clock, setClock] = useState("");

  const [allData, setAllData] = useState([]);
  const [units, setUnits] = useState([]);
  const [tarifData, setTarifData] = useState([]);
  const [dataKWH, setDataKWH] = useState([]);

  const [filters, setFilters] = useState({
    tanggalMulai: "",
    tanggalSelesai: "",
    idpel: "",
    unit: "",
    peruntukan: "",
    status: "",
  });

  const [chartUnitFilter, setChartUnitFilter] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // FORM multi row
  const [formRows, setFormRows] = useState([]);
  const [savingForm, setSavingForm] = useState(false);

  // ====== 1. BACA LOGIN DARI LOCALSTORAGE ======
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
    } catch (err) {
      console.error("Parse loginData error:", err);
      router.replace("/");
    }
  }, [router]);

  const roleLogin = (loginData?.role || "USER")
    .toString()
    .trim()
    .toUpperCase();

  const userUnit = (loginData?.unit || "").toString().trim();
  const namaUser = loginData?.nama || loginData?.unit || "User";

  // helper: buat baris form kosong
  function createEmptyRow() {
    const today = new Date().toISOString().slice(0, 10);

    const defaultTarif = tarifData[0]?.[1] || "";
    const defaultDaya = tarifData[0]?.[2] || "";

    return {
      tanggal: today,
      unit: roleLogin === "ADMINISTRATOR" ? "" : userUnit,
      pemohon: "",
      idpel: "",
      nama: "",
      tarif: defaultTarif,
      daya: defaultDaya,
      merk: "",
      type: "",
      sn: "",
      peruntukan: "",
      file: null,
      fileUrl: "",
      status: "Belum",
      errorMeter: "",
      rowNumber: null,
    };
  }

  // ====== 2. LOAD DATA PO + TARIF + DATA KWH ======
  useEffect(() => {
    if (!loginData) return;

    (async () => {
      try {
        setLoadingData(true);

        const [poRes, optRes, tarifRes, kwhRes] = await Promise.all([
          apiPost("getPOData", { 
            unit: loginData.unit, 
            role: loginData.role 
          }),
          apiPost("getTarifOptions"),
          apiPost("getTarifData"),
          apiPost("getDataKWH"),
        ]);

        // data terbaru di atas
        const po = Array.isArray(poRes?.data) ? [...poRes.data].reverse() : [];
        setAllData(po);

        const u = Array.isArray(optRes?.data?.units)
          ? optRes.data.units
          : [];
        setUnits(u);

        setTarifData(Array.isArray(tarifRes?.data) ? tarifRes.data : []);
        setDataKWH(Array.isArray(kwhRes?.data) ? kwhRes.data : []);

        setFormRows([createEmptyRow()]);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal memuat data dari server", "error");
      } finally {
        setLoadingData(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginData]);

  // kalau tarifData baru datang dan form kosong, isi 1 baris
  useEffect(() => {
    if (!loginData) return;
    setFormRows((prev) => (prev.length === 0 ? [createEmptyRow()] : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarifData]);

  // ====== 3. JAM REALTIME ======
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tgl = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const jam = now.toLocaleTimeString("id-ID");
      setClock(`${tgl} | ${jam}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ====== 4. FILTER TABEL ======
const filteredTableData = useMemo(() => {
  return (allData || []).filter((row) => {
    if (!Array.isArray(row) || row.length < 13) return false;

    const tanggalStr = String(row[0] || "").trim();  // yyyy-MM-dd
    const unit = String(row[1] || "").trim();
    const idpel = String(row[3] || "").trim();
    const peruntukan = String(row[11] || "").trim();
    const status = String(row[12] || "").trim();

    // USER hanya boleh lihat data unit-nya sendiri
    if (roleLogin !== "ADMINISTRATOR" && unit !== userUnit) return false;

    // =============================
    //     FILTER TANGGAL DARI / SAMPAI
    // =============================
    if (filters.tanggalMulai || filters.tanggalSelesai) {
      const rowDate = new Date(tanggalStr);

      if (!isNaN(rowDate.getTime())) {
        // filter tanggal mulai
        if (filters.tanggalMulai) {
          const dMulai = new Date(filters.tanggalMulai);
          dMulai.setHours(0, 0, 0, 0);
          if (rowDate < dMulai) return false;
        }

        // filter tanggal sampai
        if (filters.tanggalSelesai) {
          const dSelesai = new Date(filters.tanggalSelesai);
          dSelesai.setHours(23, 59, 59, 999);
          if (rowDate > dSelesai) return false;
        }
      }
    }

    // filter unit
    if (filters.unit && unit !== filters.unit) return false;

    // filter idpel
    if (filters.idpel && !idpel.toLowerCase().includes(filters.idpel.toLowerCase()))
      return false;

    // filter peruntukan
    if (filters.peruntukan && peruntukan.toLowerCase() !== filters.peruntukan.toLowerCase())
      return false;

    // filter status
    if (filters.status && status.toLowerCase() !== filters.status.toLowerCase())
      return false;

    return true;
  });
}, [allData, filters, roleLogin, userUnit]);

// ====== RINGKASAN SUDAH / BELUM ======
const countSummary = useMemo(() => {
  let sudah = 0;
  let belum = 0;
  filteredTableData.forEach((row) => {
    const st = String(row[12] || "").trim();
    if (st === "Sudah") sudah++;
    else belum++;
  });
  return { sudah, belum };
}, [filteredTableData]);


  // ====== 5. DATA GRAFIK ======
  const chartData = useMemo(() => {
    let sumber = allData || [];

    if (roleLogin !== "ADMINISTRATOR" && userUnit) {
      sumber = sumber.filter((r) => String(r[1] || "").trim() === userUnit);
    } else if (roleLogin === "ADMINISTRATOR" && chartUnitFilter) {
      sumber = sumber.filter(
        (r) => String(r[1] || "").trim() === chartUnitFilter
      );
    }

    const perUnitPBPD = {};
    const perUnitHAR = {};
    const perBulan = {};
    let totalPBPD = 0;
    let totalHAR = 0;

    sumber.forEach((row) => {
      if (!Array.isArray(row) || row.length < 13) return;

      const unit = String(row[1] || "").trim();
      const tanggal = String(row[0] || "").trim();
      const peruntukan = String(row[11] || "").trim();

      if (!unit || !tanggal) return;

      if (peruntukan === "PBPD") {
        perUnitPBPD[unit] = (perUnitPBPD[unit] || 0) + 1;
        totalPBPD++;
      } else if (peruntukan === "HAR") {
        perUnitHAR[unit] = (perUnitHAR[unit] || 0) + 1;
        totalHAR++;
      }

      const bulan = tanggal.substring(0, 7); // yyyy-MM
      perBulan[bulan] = (perBulan[bulan] || 0) + 1;
    });

    const unitList = Array.from(
      new Set([...Object.keys(perUnitPBPD), ...Object.keys(perUnitHAR)])
    ).sort();

    const pbpdArr = unitList.map((u) => perUnitPBPD[u] || 0);
    const harArr = unitList.map((u) => perUnitHAR[u] || 0);

    const bulanLabels = Object.keys(perBulan).sort();
    const bulanValues = bulanLabels.map((b) => perBulan[b]);

    return {
      unitList,
      pbpdArr,
      harArr,
      bulanLabels,
      bulanValues,
      totalPBPD,
      totalHAR,
    };
  }, [allData, chartUnitFilter, roleLogin, userUnit]);

  // ====== 6. FORM MULTI-ROW ======
  const unitOptions = useMemo(() => {
    const set = new Set(tarifData.map((r) => r[0]));
    return Array.from(set);
  }, [tarifData]);

  // MERK unik (tanpa duplikat)
const merkList = useMemo(() => {
  return [...new Set(dataKWH.map((k) => k.merk))];
}, [dataKWH]);


  function handleFormChange(idx, field, value) {
    setFormRows((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], [field]: value };
      return clone;
    });
  }

  function handleFileChange(idx, file) {
    setFormRows((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], file };
      return clone;
    });
  }

  function addFormRow() {
    setFormRows((prev) => [...prev, createEmptyRow()]);
  }

  function hapusFormRow() {
    setFormRows((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmitMulti(e) {
    e.preventDefault();
    if (!formRows.length) return;

    try {
      setSavingForm(true);

      const payloadArray = [];

      for (const row of formRows) {
        if (!row.idpel && !row.nama) {
          // baris kosong → skip
          continue;
        }

        let fileUrl = row.fileUrl || "";

        if (row.file) {
          const base64 = await fileToBase64(row.file);
          const base64Data = String(base64).split(",")[1] || base64;
          const upRes = await apiPost("uploadFile", {
            data: base64Data,
            mimeType: row.file.type,
            filename: row.file.name,
          });
          // asumsi apiPost untuk uploadFile mengembalikan URL langsung
          fileUrl = upRes;
        }

        payloadArray.push({
          tanggal: row.tanggal || "",
          unit: roleLogin === "ADMINISTRATOR" ? row.unit || "" : userUnit,
          pemohon: row.pemohon || "",
          idpel: row.idpel || "",
          nama: row.nama || "",
          tarif: row.tarif || "",
          daya: row.daya || "",
          merk: row.merk || "",
          type: row.type || "",
          sn: row.sn || "",
          fileUrl,
          peruntukan: row.peruntukan || "",
          status: row.status || "Belum",
          errorMeter: row.errorMeter || "",
          rowNumber: row.rowNumber || undefined,
        });
      }

      if (!payloadArray.length) {
        Swal.fire("Info", "Tidak ada baris yang diisi.", "info");
        return;
      }

      await apiPost("tambahDataPOMulti", { data: payloadArray });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });

      // reset form & reload data
      setFormRows([createEmptyRow()]);
      const poRes = await apiPost("getPOData");
      setAllData(Array.isArray(poRes?.data) ? [...poRes.data].reverse() : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Gagal menyimpan data", "error");
    } finally {
      setSavingForm(false);
    }
  }

  // ====== EDIT ======
  function handleEditRow(row) {
    const obj = {
      tanggal: row[0] || "",
      unit: row[1] || "",
      pemohon: row[2] || "",
      idpel: row[3] || "",
      nama: row[4] || "",
      tarif: row[5] || "",
      daya: row[6] || "",
      merk: row[7] || "",
      type: row[8] || "",
      sn: row[9] || "",
      file: null,
      fileUrl: row[10] || "",
      peruntukan: row[11] || "",
      status: row[12] || "Belum",
      errorMeter: row[13] || "",
      rowNumber: row[14] || null,
    };
    setFormRows([obj]);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ====== HAPUS ======
  async function handleDeleteRow(rowNumber) {
    if (!rowNumber) return;
    const res = await Swal.fire({
      title: "Hapus Data?",
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!res.isConfirmed) return;

    try {
      await apiPost("hapusDataPO", {
        rowIndex: Number(rowNumber),
        roleLogin,
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data telah dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
      const poRes = await apiPost("getPOData");
      setAllData(Array.isArray(poRes?.data) ? [...poRes.data].reverse() : []);
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal menghapus data", "error");
    }
  }

  // ====== TANDAI SUDAH ======
  async function handleMarkSudah(rowNumber) {
    if (!rowNumber) return;
    const res = await Swal.fire({
      title: "Tandai sebagai Sudah?",
      text: "Pastikan datanya benar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Tandai",
      cancelButtonText: "Batal",
      confirmButtonColor: "#198754",
    });
    if (!res.isConfirmed) return;

    try {
      await apiPost("ubahStatus", { rowNumber: Number(rowNumber) });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data telah ditandai sebagai Sudah.",
        timer: 1500,
        showConfirmButton: false,
      });
      const poRes = await apiPost("getPOData");
      setAllData(Array.isArray(poRes?.data) ? [...poRes.data].reverse() : []);
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal mengubah status", "error");
    }
  }

  // ====== DOWNLOAD CSV FILTER ======
  function handleDownloadFilter() {
    if (!filteredTableData.length) {
      Swal.fire("Info", "Tidak ada data hasil filter.", "info");
      return;
    }

    let csv =
      [
        "No",
        "Tanggal",
        "Unit",
        "Pemohon",
        "IDPEL",
        "Nama",
        "Tarif",
        "Daya",
        "Merk",
        "Type",
        "SN",
        "Error (%)",
        "Peruntukan",
        "Status",
      ].join(";") + "\n";

    filteredTableData.forEach((r, idx) => {
      const rowArr = [
        idx + 1,
        r[0],
        r[1],
        r[2],
        r[3],
        r[4],
        r[5],
        r[6],
        r[7] || "",
        r[8] || "",
        r[9] || "",
        r[13] || "",
        r[11] || "",
        r[12] || "",
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`);
      csv += rowArr.join(";") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Data_Filter_KWH.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ====== LOGOUT ======
  function handleLogout() {
    Swal.fire({
      title: "Yakin ingin logout?",
      text: "Sesi Anda akan diakhiri dan harus login ulang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (!result.isConfirmed) return;

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("loginData");
      }

      Swal.fire({
        icon: "success",
        title: "Logout Berhasil",
        timer: 1200,
        showConfirmButton: false,
      });

      router.replace("/");
    });
  }

  // ====== LOADING AWAL (BELUM ADA LOGIN DATA) ======
  if (!loginData) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #0d6efd, #1e90ff)",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontFamily: '"Segoe UI", sans-serif',
        }}
      >
        <h3>Memuat Dashboard...</h3>
      </div>
    );
  }

  // ====== RENDER HALAMAN ======
  return (
    <div className="p-3" style={{ background: "#f4f7fb", minHeight: "100vh" }}>
      <div className="container">
        {/* HEADER */}
        {/* HEADER */}
<div className="header-wrapper">

{/* Kiri: Logo PLN */}
<div className="header-left">
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_PLN.svg"
    alt="Logo PLN"
    style={{ height: 70 }}
  />
  <h6 className="mt-1 mb-0">UP3 TANJUNG KARANG</h6>
</div>

{/* Tengah: FO⚡MET */}
<div className="header-center text-center">

  {/* FO⚡MET LOGO */}
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 32,
    letterSpacing: 0,
    marginBottom: -5
  }}>
    <span style={{ color: "#0d6efd", marginRight: 2 }}>FO</span>

    <span style={{
      color: "orange",
      margin: "0 2px",
      fontSize: 32,
      fontWeight: 900
    }}>⚡</span>

    <span style={{ color: "#0d6efd", marginLeft: 2 }}>MET</span>
  </div>

  <div style={{
    fontSize: 13,
    marginTop: -5,
    color: "#444",
    fontWeight: 500
  }}>
    Form Setting Meter
  </div>

</div>

{/* Kanan: User info */}
<div className="header-right text-end">
  <strong>{`Halo, ${namaUser} (${roleLogin})`}</strong>
  <br />
  <span style={{ fontSize: 14, color: "#0d6efd" }}>{clock}</span>
  <br />
  <button className="btn btn-danger btn-sm mt-1" onClick={handleLogout}>
    Logout
  </button>
</div>

</div>

        {/* FORM INPUT MULTI-ROW */}
        <div className="form-area" id="form-area">
          <h5>
            <i className="bi bi-pencil-square"></i> Input Data
          </h5>
          <form onSubmit={handleSubmitMulti}>
            {formRows.map((row, idx) => {
              const isAdmin = roleLogin === "ADMINISTRATOR";
              return (
                <div
                  key={idx}
                  className="row align-items-end g-2 mb-2"
                >
                  <div className="col-md-2">
                    <label>Tanggal</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={row.tanggal}
                      onChange={(e) =>
                        handleFormChange(idx, "tanggal", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-1">
                    <label>Unit</label>
                    <select
                      className="form-select form-select-sm"
                      value={row.unit}
                      onChange={(e) =>
                        handleFormChange(idx, "unit", e.target.value)
                      }
                      disabled={!isAdmin}
                    >
                      <option value="">Pilih</option>
                      {isAdmin
                        ? unitOptions.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))
                        : userUnit && (
                            <option value={userUnit}>{userUnit}</option>
                          )}
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label>Pemohon</label>
                    <input
                      className="form-control form-control-sm"
                      value={row.pemohon}
                      onChange={(e) =>
                        handleFormChange(idx, "pemohon", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-2">
                    <label>IDPEL</label>
                    <input
                      className="form-control form-control-sm"
                      value={row.idpel}
                      onChange={(e) =>
                        handleFormChange(idx, "idpel", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-2">
                    <label>Nama</label>
                    <input
                      className="form-control form-control-sm"
                      value={row.nama}
                      onChange={(e) =>
                        handleFormChange(idx, "nama", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-1">
                    <label>Tarif</label>
                    <select
                      className="form-select form-select-sm"
                      value={row.tarif}
                      onChange={(e) =>
                        handleFormChange(idx, "tarif", e.target.value)
                      }
                    >
                      {tarifData.map((r, i) => (
                        <option key={i} value={r[1]}>
                          {r[1]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-1">
                    <label>Daya</label>
                    <select
                      className="form-select form-select-sm"
                      value={row.daya}
                      onChange={(e) =>
                        handleFormChange(idx, "daya", e.target.value)
                      }
                    >
                      {tarifData.map((r, i) => (
                        <option key={i} value={r[2]}>
                          {r[2]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Merk, Type, SN hanya admin */}
                  {roleLogin === "ADMINISTRATOR" && (
                    <>
                      <div className="col-md-2">
                        <label>Merk</label>
                        <select
  className="form-select form-select-sm"
  value={row.merk}
  onChange={(e) => {
    handleFormChange(idx, "merk", e.target.value);
    handleFormChange(idx, "type", ""); // reset TYPE
  }}
>
  <option value="">-- Pilih Merk --</option>

  {merkList.map((m, i) => (
    <option key={i} value={m}>{m}</option>
  ))}
</select>


                      </div>

                      <div className="col-md-2">
                        <label>Type</label>
                        <select
  className="form-select form-select-sm"
  value={row.type}
  onChange={(e) => handleFormChange(idx, "type", e.target.value)}
>
  <option value="">-- Pilih Type --</option>

  {dataKWH
    .filter((k) => k.merk === row.merk)
    .map((k, i) => (
      <option key={i} value={k.type}>{k.type}</option>
    ))}
</select>

                      </div>

                      <div className="col-md-2">
                        <label>SN</label>
                        <input
                          className="form-control form-control-sm"
                          value={row.sn}
                          onChange={(e) =>
                            handleFormChange(idx, "sn", e.target.value)
                          }
                        />
                      </div>
                      
  <div className="col-md-1">
    <label>Error (%)</label>
    <input
      type="number"
      className="form-control form-control-sm"
      value={row.errorMeter}
      onChange={(e) => handleFormChange(idx, "errorMeter", e.target.value)}
      placeholder="%"
    />
  </div>
                    </>
                  )}

                  <div className="col-md-1">
                    <label>Peruntukan</label>
                    <select
                      className="form-select form-select-sm"
                      value={row.peruntukan}
                      onChange={(e) =>
                        handleFormChange(idx, "peruntukan", e.target.value)
                      }
                    >
                      <option value="">Pilih</option>
                      <option value="PBPD">PBPD</option>
                      <option value="HAR">HAR</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label>Upload File</label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) =>
                        handleFileChange(idx, e.target.files?.[0] || null)
                      }
                    />
                    {row.fileUrl && (
                      <a
                        href={row.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="small d-block"
                      >
                        File Lama
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="d-flex flex-wrap gap-2 mb-1 mt-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addFormRow}
              >
                <i className="bi bi-plus-circle"></i> Tambah Baris
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={hapusFormRow}
              >
                <i className="bi bi-trash"></i> Hapus Baris
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={savingForm}
              >
                {savingForm ? "Menyimpan..." : "Simpan Semua"}
              </button>
            </div>
          </form>
        </div>

        {/* FILTER GRAFIK PER UNIT */}
        <div className="table-area" id="table-area">
          <div className="card p-2 mb-3" style={{ maxWidth: 300 }}>
            <label className="form-label mb-1" style={{ fontSize: 13 }}>
              Filter Grafik per Unit:
            </label>
            <select
              id="chartUnitFilter"
              className="form-select form-select-sm"
              value={roleLogin === "ADMINISTRATOR" ? chartUnitFilter : userUnit}
              onChange={(e) => setChartUnitFilter(e.target.value)}
              disabled={roleLogin !== "ADMINISTRATOR"}
            >
              <option value="">-- Semua Unit --</option>
              {roleLogin === "ADMINISTRATOR"
                ? units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))
                : userUnit && <option value={userUnit}>{userUnit}</option>}
            </select>
          </div>

          {/* CHARTS */}
          <div className="row mb-3 chart-container" id="charts">
            {/* Chart 1 */}
            <div className="chart-card">
              <h6>PO per Unit (PBPD & HAR)</h6>
              <Bar
                data={{
                  labels: chartData.unitList,
                  datasets: [
                    {
                      label: "PBPD",
                      data: chartData.pbpdArr,
                      backgroundColor: "rgba(0,123,255,0.6)",
                    },
                    {
                      label: "HAR",
                      data: chartData.harArr,
                      backgroundColor: "rgba(255,99,132,0.6)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true },
                  },
                }}
              />
            </div>

            {/* Chart 2 */}
            <div className="chart-card">
              <h6>Total PBPD vs HAR</h6>
              <Bar
                data={{
                  labels: ["PBPD", "HAR"],
                  datasets: [
                    {
                      label: "Total",
                      data: [chartData.totalPBPD, chartData.totalHAR],
                      backgroundColor: [
                        "rgba(0,123,255,0.7)",
                        "rgba(255,99,132,0.7)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>

            {/* Chart 3 */}
            <div className="chart-card">
              <h6>Trend Bulanan</h6>
              <Line
                data={{
                  labels: chartData.bulanLabels,
                  datasets: [
                    {
                      label: "Jumlah PO",
                      data: chartData.bulanValues,
                      borderColor: "rgba(0,123,255,1)",
                      backgroundColor: "rgba(0,123,255,0.3)",
                      tension: 0.2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* FILTER ATAS TABEL */}
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3 gap-2">
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-success btn-sm"
                onClick={handleDownloadFilter}
              >
                <i className="bi bi-file-earmark-spreadsheet"></i> Download
                Filter
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  setFilters({
                    tanggalMulai: "",
                    tanggalSelesai: "",
                    idpel: "",
                    unit: "",
                    peruntukan: "",
                    status: "",
                  })
                }
              >
                <i className="bi bi-arrow-clockwise"></i> Reset Filter
              </button>
            </div>

            <div className="d-flex gap-2">
              <span className="badge bg-success px-3 py-2">
                ✔ Sudah: {countSummary.sudah}
              </span>
              <span className="badge bg-secondary px-3 py-2">
                ⏱ Belum: {countSummary.belum}
              </span>
            </div>
          </div>

          {/* FILTER INPUT TABEL */}
          <div className="row g-2 mb-3">
            <div className="col-md-2">
              <label>Dari</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.tanggalMulai}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tanggalMulai: e.target.value }))
                }
              />
            </div>
            <div className="col-md-2">
              <label>Sampai</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.tanggalSelesai}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tanggalSelesai: e.target.value }))
                }
              />
            </div>
            <div className="col-md-2">
              <label>IDPEL</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Filter IDPEL"
                value={filters.idpel}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, idpel: e.target.value }))
                }
              />
            </div>
            <div className="col-md-2">
              <label>Unit</label>
              <select
                className="form-select form-select-sm"
                value={filters.unit}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, unit: e.target.value }))
                }
                disabled={roleLogin !== "ADMINISTRATOR"}
              >
                <option value="">-- Semua Unit --</option>
                {(roleLogin === "ADMINISTRATOR" ? units : [userUnit]).map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="col-md-2">
              <label>Peruntukan</label>
              <select
                className="form-select form-select-sm"
                value={filters.peruntukan}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, peruntukan: e.target.value }))
                }
              >
                <option value="">-- Peruntukan --</option>
                <option value="PBPD">PBPD</option>
                <option value="HAR">HAR</option>
              </select>
            </div>
            <div className="col-md-2">
              <label>Status</label>
              <select
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">Semua Status</option>
                <option value="Sudah">Sudah</option>
                <option value="Belum">Belum</option>
              </select>
            </div>
          </div>

          {/* TABEL DATA */}
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            <table className="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Unit</th>
                  <th>Pemohon</th>
                  <th>IDPEL</th>
                  <th>Nama</th>
                  <th>Tarif</th>
                  <th>Daya</th>
                  <th>Merk</th>
                  <th>Type</th>
                  <th>SN</th>
                  <th>Error KwH (%)</th>
                  <th>Peruntukan</th>
                  <th>File PK</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={15} className="text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredTableData.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="text-center">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  filteredTableData.map((r, idx) => {
                    const fileUrl = r[10];
                    const status = String(r[12] || "").trim();
                    const rowNumber = r[13];
                    const badge =
                      status === "Sudah" ? (
                        <span className="badge bg-success">Sudah</span>
                      ) : (
                        <span className="badge bg-secondary">Belum</span>
                      );

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{r[0]}</td>
                        <td>{r[1]}</td>
                        <td>{r[2]}</td>
                        <td>{r[3]}</td>
                        <td>{r[4]}</td>
                        <td>{r[5]}</td>
                        <td>{r[6]}</td>
                        <td>{r[7] || "-"}</td>
                        <td>{r[8] || "-"}</td>
                        <td>{r[9] || "-"}</td>
                        <td>{r[13] || "-"}</td>
                        <td>{r[11]}</td>
                        <td>
                          {fileUrl ? (
                            <a href={fileUrl} target="_blank" rel="noreferrer">
                              Lihat
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{badge}</td>
                        <td>
                          {roleLogin === "ADMINISTRATOR" ? (
                            <div className="d-flex flex-column gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditRow(r)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteRow(rowNumber)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              {status !== "Sudah" && (
                                <button
                                  className="btn btn-sm btn-outline-warning text-dark"
                                  onClick={() => handleMarkSudah(rowNumber)}
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="modern-footer">
  <div className="footer-logo">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_PLN.svg"
      alt="PLN"
    />
    
  </div>

  <div className="footer-text">
     <strong>FO⚡MET</strong> — Form Setting Meter - <strong>UP3 TANJUNG KARANG </strong><br />
        <span className="footer-sub">Powered By TEL © 2025</span>
  </div>
</footer>


      </div>

      {/* Styling singkat */}
      <style jsx>{`
/* =========================================
   DESKTOP LAYOUT
========================================= */

.header-wrapper {
  background: white;
  padding: 18px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.form-area,
.table-area {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.chart-container {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 16px;
  margin-top: 10px;
}

.chart-card {
  background: white;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  height: 250px;
  display: flex;
  flex-direction: column;
}

.chart-card :global(canvas) {
  max-height: 180px;
}

/* =========================================
   MOBILE RESPONSIVE PERFECT MODE
========================================= */
@media (max-width: 768px) {

  /* ===== HEADER ===== */
  .header-wrapper {
    flex-direction: column;
    text-align: center;
    padding: 14px;
  }

  .header-left img {
    height: 55px !important;
  }

  .header-right {
    margin-top: 10px;
  }

  /* ===== FORM ===== */
  .form-area {
    padding: 14px !important;
  }

  /* Semua field form jadi 1 kolom */
  .row.align-items-end.g-2.mb-2 > div {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 10px;
  }

  /* ===== CHART ===== */
  .chart-container {
    grid-template-columns: 1fr !important;
  }

  .chart-card {
    height: auto !important;
  }

  /* ===== TABLE ===== */

  .table-area {
    padding: 10px !important;
    overflow-x: auto;
  }

  .table-area table {
    min-width: 950px;
    font-size: 12px;
  }

  th, td {
    white-space: nowrap;
  }

}

/* =========================================
   BOTTOM NAV
========================================= */

.bottomNav {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  height: 58px;
  background: white;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 9999;
}

.bottomNav button {
  background: none;
  border: none;
  color: #333;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bottomNav button i {
  font-size: 20px;
  margin-bottom: 1px;
}

/* FAB BUTTON */
.fabBtn {
  position: fixed;
  bottom: 70px;
  right: 20px;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 50%;
  width: 58px;
  height: 58px;
  font-size: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 16px rgba(0,0,0,0.25);
  z-index: 9999;
}
/* ==========================================
   MODERN FOOTER – FULL VISIBLE & RESPONSIVE
=========================================== */

.modern-footer {
  text-align: center;
  padding: 35px 10px 95px; /* 95px = ruang untuk bottom nav */
  color: #6c757d;
  font-size: 13px;
  line-height: 1.5;
  border-top: 1px solid #e4e4e4;
  background: #fafafa;
}

/* Logo + PLN text */
.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}

.footer-logo img {
  height: 32px;
}

.footer-title {
  font-size: 20px;
  font-weight: 700;
  color: #0d6efd;
  letter-spacing: 2px;
}

/* Text bawah PLN */
.footer-text {
  font-weight: 500;
}

/* UP3 TANJUNG KARANG */
.footer-sub {
  font-size: 12px;
  color: #555;
  font-weight: 600;
}

/* ===== MOBILE ADJUST ===== */
@media (max-width: 768px) {
  .modern-footer {
    padding-bottom: 110px; /* beri ruang lebih di HP */
    font-size: 12px;
  }

  .footer-logo img {
    height: 28px;
  }

  .footer-title {
    font-size: 18px;
  }

  .footer-sub {
    font-size: 12px;
  }
}

`}</style>


 {/* ================= BOTTOM NAV ================= */}
 <div className={styles.bottomNav}>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <i className="bi bi-house"></i><span>Home</span>
      </button>

      <button onClick={() => document.getElementById("form-area")?.scrollIntoView({ behavior: "smooth" })}>
        <i className="bi bi-pencil-square"></i><span>Input</span>
      </button>

      <button onClick={() => document.getElementById("table-area")?.scrollIntoView({ behavior: "smooth" })}>
        <i className="bi bi-table"></i><span>Data</span>
      </button>

      <button onClick={() => document.getElementById("charts")?.scrollIntoView({ behavior: "smooth" })}>
        <i className="bi bi-bar-chart"></i><span>Grafik</span>
      </button>
    </div>


  </div>
    
  );
}




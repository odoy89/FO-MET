const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

const targetStr = `          {/* TABEL DATA */}
          <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto" }}>
            <table className="table table-bordered table-striped mb-0 table-hover align-middle" style={{ whiteSpace: "nowrap" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8fafc", boxShadow: "inset 0 -2px 0 #e2e8f0" }}>`;

const replaceStr = `          <style>{'\\
            .table-sticky-th th {\\
              position: sticky !important;\\
              top: 0 !important;\\
              background-color: #f8fafc !important;\\
              z-index: 10 !important;\\
              box-shadow: inset 0 -2px 0 #e2e8f0, inset 0 2px 0 #e2e8f0;\\
            }\\
            .table-sticky-container table {\\
              border-collapse: separate !important;\\
              border-spacing: 0 !important;\\
            }\\
          '}</style>
          {/* TABEL DATA */}
          <div className="table-responsive table-sticky-container" style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto" }}>
            <table className="table table-bordered table-striped mb-0 table-hover align-middle table-sticky-th" style={{ whiteSpace: "nowrap" }}>
              <thead>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('pages/dashboard.js', code);
console.log("Updated sticky header in dashboard.js");

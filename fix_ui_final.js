const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Remove duplicate <th>Foto KWh</th>
code = code.replace(/<th>Foto KWh<\/th>\s*<th>Foto KWh<\/th>/, '<th>Foto KWh</th>');

// 2. Fix the "Lihat" links to use handleShowImage for file (r[10]) and foto (r[14])
code = code.replace(
  /<a href=\{r\[10\]\} target="_blank" rel="noreferrer">\s*Lihat\s*<\/a>/g,
  '<a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[10]); }} className="text-primary text-decoration-underline" style={{ cursor: "pointer" }}>Lihat</a>'
);

code = code.replace(
  /<a href=\{r\[14\]\} target="_blank" rel="noreferrer">Lihat<\/a>/g,
  '<a href="#!" onClick={(e) => { e.preventDefault(); handleShowImage(r[14]); }} className="text-primary text-decoration-underline" style={{ cursor: "pointer" }}>Lihat</a>'
);

// 3. Make table text not wrap (white-space: nowrap) so it forces horizontal scroll
const tableHtmlOld = `<table className="table table-bordered table-striped mb-0 table-hover align-middle">`;
const tableHtmlNew = `<table className="table table-bordered table-striped mb-0 table-hover align-middle" style={{ whiteSpace: "nowrap" }}>`;
if (code.includes(tableHtmlOld)) {
  code = code.replace(tableHtmlOld, tableHtmlNew);
} else {
    // maybe it is the old one?
    const oldTbl2 = `<table className="table table-bordered table-striped mb-0">`;
    const newTbl2 = `<table className="table table-bordered table-striped mb-0 table-hover align-middle" style={{ whiteSpace: "nowrap" }}>`;
    if (code.includes(oldTbl2)) {
        code = code.replace(oldTbl2, newTbl2);
    }
}

// Ensure table-responsive has both max-height and overflow
const tableWrapperOld = `<div className="table-responsive">`;
const tableWrapperNew = `<div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto" }}>`;
if (code.includes(tableWrapperOld)) {
  code = code.replace(tableWrapperOld, tableWrapperNew);
} else {
    // If it already has style
    code = code.replace(/<div className="table-responsive" style=\{\{ maxHeight: "500px", overflowY: "auto" \}\}>/, tableWrapperNew);
}

fs.writeFileSync('pages/dashboard.js', code);
console.log("Applied final fixes to dashboard.js");

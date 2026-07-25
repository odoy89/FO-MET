const fs = require('fs');

let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// Remove whiteSpace: "nowrap" from thead
code = code.replace(
  'style={{ position: "sticky", top: 0, zIndex: 1, whiteSpace: "nowrap" }}',
  'style={{ position: "sticky", top: 0, zIndex: 1 }}'
);

// Add inline style to table to make font smaller so it fits horizontally
code = code.replace(
  '<table className="table table-bordered table-striped mb-0 table-hover align-middle">',
  '<table className="table table-bordered table-striped mb-0 table-hover align-middle" style={{ fontSize: "0.85rem" }}>'
);

// Group the action buttons (edit and delete) horizontally instead of vertically
code = code.replace(
  '<div className="d-flex flex-column gap-1">',
  '<div className="d-flex flex-row gap-1 justify-content-center">'
);

fs.writeFileSync('pages/dashboard.js', code);
console.log("pages/dashboard.js table styles updated.");

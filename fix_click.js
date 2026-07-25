const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// 1. Add onClick and style to <tr>
code = code.replace(/<tr key=\{idx\}>/, "<tr key={idx} onClick={() => handleEditRow(r)} style={{ cursor: 'pointer' }} title='Klik baris untuk Edit / Input' className='hover-row'>");

// 2. Add e.stopPropagation() to Lihat links
code = code.replace(/onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*handleShowImage/g, 'onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShowImage');

// 3. Add e.stopPropagation() to Delete button
code = code.replace(/onClick=\{\(\) => handleDeleteRow\(rowNumber\)\}/g, 'onClick={(e) => { e.stopPropagation(); handleDeleteRow(rowNumber); }}');

// 4. Add e.stopPropagation() to Selesai button
code = code.replace(/onClick=\{\(\) => handleMarkSudah\(r\)\}/g, 'onClick={(e) => { e.stopPropagation(); handleMarkSudah(r); }}');

// 5. Add e.stopPropagation() to Edit button just in case
code = code.replace(/<button\r?\n\s*className="btn btn-sm btn-outline-primary"\r?\n\s*onClick=\{\(\) => handleEditRow\(r\)\}/g, '<button\n                                className="btn btn-sm btn-outline-primary"\n                                onClick={(e) => { e.stopPropagation(); handleEditRow(r); }}');

// Add hover-row CSS if not exists
if (!code.includes('.hover-row:hover')) {
    code = code.replace('</style>', '\n  .hover-row:hover td { background-color: #f1f3f5 !important; }\n      </style>');
}

fs.writeFileSync('pages/dashboard.js', code);
console.log('Patch success!');

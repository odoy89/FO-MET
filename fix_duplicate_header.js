const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

// The duplicate header is at:
//         <div className="form-area p-0 shadow-none border-0" id="form-area">
//           <h5>
//             <i className="bi bi-pencil-square"></i> Input Data
//           </h5>
//           <form onSubmit={handleSubmitMulti}>

code = code.replace(
  '<div className="form-area p-0 shadow-none border-0" id="form-area">\n          <h5>\n            <i className="bi bi-pencil-square"></i> Input Data\n          </h5>',
  '<div className="form-area p-0 shadow-none border-0" id="form-area">'
);

fs.writeFileSync('pages/dashboard.js', code);
console.log("Duplicate header removed");

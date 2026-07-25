const fs = require('fs');
let code = fs.readFileSync('pages/dashboard.js', 'utf8');

code = code.replace(
`    </div>
  </Sidebar>
  );`,
`    </div>
  </Sidebar>
  );
}`
);

fs.writeFileSync('pages/dashboard.js', code);
console.log("Added missing brace");

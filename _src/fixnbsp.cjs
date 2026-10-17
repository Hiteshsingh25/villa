const fs = require("fs");
const nb = String.fromCharCode(160);
const esc = String.fromCharCode(92) + "u" + "00a0";
for (const p of ["components/Split.tsx", "components/sections/Hero.tsx", "components/Footer.tsx"]) {
  const s = fs.readFileSync(p, "utf8");
  fs.writeFileSync(p, s.split(nb).join(esc));
  console.log(p, s.split(nb).length - 1);
}

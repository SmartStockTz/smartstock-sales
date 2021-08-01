const {readdirSync, lstatSync, copyFileSync, mkdirSync} = require("fs");
const {join} = require("path");

const wDir = join(__dirname, 'dist/sales/esm2015/workers/');
try {
  lstatSync(wDir);
  const workers = readdirSync(wDir);
  try {
    mkdirSync(join(__dirname, 'dist/sales/fesm2015/workers/'));
  } catch (_43) {
  }
  workers.forEach(w => {
    const src = join(__dirname, 'dist/sales/esm2015/workers/', w);
    const dest = join(__dirname, 'dist/sales/workers/', w);
    copyFileSync(src, dest);
  });
  console.log('done copying');
} catch (e) {
  console.log(e.toString())
}

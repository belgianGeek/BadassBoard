const fs = require('fs-extra');
const exec = require('child_process').exec;
const path = require('path');

let files = fs.readdirSync('./src/js');

// Filter the files array not to contain the old minified file

let homeMinification = exec(`terser --mangle --compress -o app.min.js ${files.filter(item => item !== 'app.min.js').join(' ')}`, {
  cwd: path.join(__dirname, '/src/js')
}, (err, stdout, stderr) => {
  if (err) console.error(err); else console.log('Minification succeeded !');
  if (stderr) console.error(stderr);
  return;
});

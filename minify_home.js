const fs = require('fs');
const minify = require('minify');

let totalCode = '';

// Remove the old minified file
fs.unlink('./src/js/app.min.js', (err) => {
  if (err) {
    console.log(`Error deleting outdated minified file : ${err}`);
  }
})

fs.readdir('./src/js/home', (err, files) => {
  if (err) {
    console.log('Error reading dir ' + err);
  } else {
    for (const [i, file] of files.entries()) {
      let filename = `./src/js/home/${file}`;
      minify(filename).then((code) => {
          fs.appendFile('./src/js/app.min.js', code, (err) => {
            if (err) {
              console.log(`Error writing file : ${err}`);
            } else {
              console.log(`Successfully minified file : ${file}`);
            }
          });
        })
        .catch(console.error);
    }
  }
});

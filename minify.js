const fs = require('fs');
const minify = require('minify');

let totalCode = '';

// Remove the old minified file
fs.unlink('./src/js/app.min.js', (err) => {
  if (err && err.code !== 'ENOENT') {
    console.log(`Error deleting outdated minified file : ${err}`);
  }
})

let homeFiles = fs.readdirSync('./src/js/home');
let chatFiles = fs.readdirSync('./src/js/chat');

for (let i = 0; i < homeFiles.length; i++) {
  if (homeFiles[i] !== 'app.js') {
    let filename = `./src/js/home/${homeFiles[i]}`;
    minify(filename).then(code => {
        fs.appendFile('./src/js/app.min.js', code, err => {
          if (err) {
            console.log(`Error writing file : ${err}`);
          } else {
            console.log(`Successfully minified file : ${homeFiles[i]}`);
          }
        });
      })
      .catch(console.error);
  }

  if (i === homeFiles.length - 1) {
    minify('./src/js/home/app.js').then(code => {
        fs.appendFile('./src/js/app.min.js', code, err => {
          if (err) {
            console.log(`Error writing file : ${err}`);
          } else {
            console.log(`Successfully minified file : app.js`);
          }
        });
      })
      .catch(console.error);
  }
}

for (let i = 0; i < chatFiles.length; i++) {
  let filename = `./src/js/chat/${chatFiles[i]}`;
  minify(filename).then(code => {
      fs.appendFile('./src/js/app.min.js', code, err => {
        if (err) {
          console.log(`Error writing file : ${err}`);
        } else {
          console.log(`Successfully minified file : ${chatFiles[i]}`);
        }
      });
    })
    .catch(console.error);
}

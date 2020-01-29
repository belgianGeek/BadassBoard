const fs = require('fs');
const minify = require('minify');

let totalCode = '';

// Remove the old minified file
fs.unlink('./src/js/chat.min.js', (err) => {
  if (err) {
    console.log(`Error deleting outdated minified file : ${err}`);
  }
})

fs.readdir('./src/js/chat', (err, files) => {
  if (err) {
    console.log('Error reading dir ' + err);
  } else {
    for (const [i, file] of files.entries()) {
      let filename = `./src/js/chat/${file}`;
      minify(filename).then((code) => {
          fs.appendFile('./src/js/chat.min.js', code, (err) => {
            if (err) {
              console.log(`Error writing file : ${err}`);
            } else {
              console.log(`Successfully minified file : ${file}`);
            }
          });
        })
        .catch(console.error);
    }

    minify('./src/js/home/showSettings.js').then((code) => {
        fs.appendFile('./src/js/chat.min.js', code, (err) => {
          if (err) {
            console.log(`Error writing file : ${err}`);
          } else {
            console.log(`Successfully minified file : showSettings.js`);
          }
        });
      })
      .catch(console.error);

    minify('./src/js/home/scroll.js').then((code) => {
        fs.appendFile('./src/js/chat.min.js', code, (err) => {
          if (err) {
            console.log(`Error writing file : ${err}`);
          } else {
            console.log(`Successfully minified file : scroll.js`);
          }
        });
      })
      .catch(console.error);
  }
});

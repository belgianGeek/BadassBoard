const fs = require('fs');
const minify = require('minify');

minify('./src/js/app.js')
  .then((code) => {
    fs.writeFile('./src/js/app_minified.js', code, 'utf-8', (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Success');
      }
    });
  })
  .catch(console.error);

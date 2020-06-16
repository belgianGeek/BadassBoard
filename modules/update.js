const unzip = require('adm-zip');
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const cp = require('child_process').exec;

let tag = '0.3.0';

module.exports = function update() {
  axios({
      url: `https://api.github.com/repos/belgianGeek/BadassBoard/zipball/${tag}`,
      method: 'GET',
      responseType: 'stream'
    })
    .then(res => {
      let downloadWriteStream = fs.createWriteStream('./tmp/update.zip');
      let readStream = fs.createReadStream('./tmp/update.zip');

      if (res.status === 200) {
        res.data.pipe(downloadWriteStream);
        downloadWriteStream.on('error', err => {
            console.log('file error : ' + err);
          })
          .on('finish', () => {
            console.log('Download finished, unzipping update...');
            let zip = new unzip('./tmp/update.zip');
            let zipEntries = zip.getEntries();
            let unzippedDir = `tmp/${zipEntries[0].entryName}`;

            zip.extractAllTo('./tmp/', true);
            fs.readdir(path.join(__dirname, unzippedDir), (err, files) => {
              if (err) {
                console.error(`Error reading unzipped folder ${unzippedDir} : ${err}`);
              } else {
                console.log('Update unzipped, moving files...');
                files.forEach((file, i) => {
                  fs.moveSync(path.join(__dirname, unzippedDir, file), path.join(__dirname, file), {
                    overwrite: true
                  });

                  if (i === files.length - 1) {
                    console.log('Update successfully extracted !');
                    console.log('Checking for dependencies updates...');
                    cp('yarn install', (err, stdout, stderr) => {
                      if (err) {
                        console.error(`Error checking for dependencies updates : ${err}`);
                      } else {
                        if (!stderr) {
                          console.log(stdout);
                        } else {
                          console.error(`Error running yarn install : ${stderr}`);
                        }
                      }
                    });

                    console.log('Cleaning up...');
                    fs.remove(unzippedDir);
                  }
                });
              }
            });
          });
      } else if (res.status === 404) {
        console.error('Couldn\'t check for updates, page not found...');
      } else if (res.status === 401) {
        console.error('Hey, you\'re not allowed to visit this page ! Updating failed...');
      } else if (res.status === 500) {
        console.error('Couldn\'t check for updates : the Github server returned a 500 error code :((');
      }
    })
    .catch(err => {
      console.error(err);
    });
}

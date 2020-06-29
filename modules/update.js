const unzip = require('adm-zip');
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const cp = require('child_process').exec;

let tag = '0.3.0';

module.exports = function update(io) {
  axios({
      url: 'https://api.github.com/repositories/204866456/releases',
      method: 'GET'
    })
    .then(res => {
      if (res.status === 200) {
        if (res.data[0].tag_name > tag) {
          axios({
              url: res.data[0].zipball_url,
              method: 'GET',
              responseType: 'stream'
            })
            .then(res => {
              let downloadWriteStream = fs.createWriteStream('./tmp/update.zip');
              let readStream = fs.createReadStream('./tmp/update.zip');

              if (res.status === 200) {
                // Send update progress to the client
                io.emit('update progress', {
                  code: 200,
                  text: 'Downloading...'
                });

                res.data.pipe(downloadWriteStream);
                downloadWriteStream.on('error', err => {
                    console.log('file error : ' + err);
                  })
                  .on('finish', () => {
                    console.log('Download finished, unzipping update...');
                    let zip = new unzip('./tmp/update.zip');
                    let zipEntries = zip.getEntries();
                    let unzippedDir = `tmp/${zipEntries[0].entryName}`;

                    // Send update progress to the client
                    io.emit('update progress', {
                      code: 200,
                      text: 'Unzipping...'
                    });

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

                            // Send update progress to the client
                            io.emit('update progress', {
                              code: 200,
                              text: 'Cleaning up...'
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
        } else if (res.data[0].tag_name === tag) {
          console.log("You're already up-to-date, you badass");
          io.emit('update progress', {
            code: 200,
            text: 'Done !'
          });

          setTimeout(() => {
            io.emit('update progress', {
              code: 200,
              text: 'Check for updates'
            });
          }, 2500);
        }
      } else if (res.status === 404) {
        console.log('Couldn\'t check for updates, page not found...');
      } else if (res.status === 401) {
        console.log('Hey, you\'re not allowed to visit this page !');
      } else if (res.status === 500) {
        console.log('GitHub server error :((');
      }
    });
};

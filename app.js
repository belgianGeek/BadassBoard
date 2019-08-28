const ytdl = require('ytdl-core');
const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const feedparser = require("feedparser-promised")
const ip = require('ip');
const os = require('os');
const path = require('path');
const request = require('request');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './upload',
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,

  // Limit image size to max 5Mo
  limits: {
    fileSize: 5000000
  }
}).single('backgroundImageUploadInput');


server.listen(8080, ip.address());

const backupSettings = (settings) => {
  fs.writeFile('./settings/settings.json.bak', JSON.stringify(settings, null, 2), (err) => {
    if (err) throw err;
  });
}

const readSettings = () => {
  fs.readFile('./settings/settings.json', 'utf-8', (err, data) => {
    if (err) throw err;
    let startupElements = [];
    let settings;
    if (data !== undefined) {
      // try {
      settings = JSON.parse(data);
      let elements = settings.elements;
      if (settings.RSS === true) {
        io.emit('RSS status retrieved', settings.RSS);
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].elements !== undefined) {
            if (elements[i].elements.type === 'rss') {
                feedparser.parse(elements[i].elements.url)
                  .then(items => {
                    // Parse rss
                    io.emit('parse content', {
                      feed: items,
                      element: elements[i].elements.element,
                      type: elements[i].elements.type
                    });
                  })
                  .catch(console.error);
            } else if (elements[i].elements.type === 'weather') {
              if (elements[i].elements.location !== undefined) {
                io.emit('parse content', {
                  type: 'weather',
                  element: elements[i].elements.element,
                  location: elements[i].elements.location
                });
              }
            }
          }
        }
      }
      // } catch (err) {
      //   // If parsing fail, restore the backup
      //   console.log(`Error parsing settings !`);
      //   fs.copyFile('./settings/settings.json.bak', './settings/settings.json', (err) => {
      //     if (err) {
      //       if (err.code === 'EBUSY') {
      //         io.emit('refresh app');
      //         console.log(err);
      //       } else {
      //         console.log(`Unknown error code :\n${err}`);
      //       }
      //     } else {
      //       console.log(`Settings file successfully restored !`);
      //     }
      //   });
      // }
    } else {
      console.log(`File content is undefined !`);
    }
  });
}

const existPath = (path) => {
  fs.stat(path, (err, stats) => {
    if (err) {
      if (path.match(/\w.+\/$/)) {
        fs.mkdir(path, (err) => {
          if (err) throw err;
        });
      } else {
        fs.writeFile(path, data, 'utf-8', (err) => {
          if (err) throw err;
        });
      }
    }
  });
}

// Get current the logged in user name
let username = os.userInfo().username;

// Create an empty object to store the downloaded file properties
let downloadedFile = {
  path: '',
  name: ''
}

// Check if folders exist
existPath('upload/');
existPath('settings/');
existPath('tmp/');

// Write the current IP in a file to send it to the client
fs.writeFile('./settings/ip.txt', ip.address(), 'utf-8', (err) => {
  if (err) throw err;
})

app.use("/src", express.static(__dirname + "/src"))
  .use("/upload", express.static(__dirname + "/upload"))
  .use("/settings", express.static(__dirname + "/settings"))
  .use("/tmp", express.static(__dirname + "/tmp"))


console.log(`Hey ${username} ! You can connect to the web interface here : http://${ip.address()}:8080.`);

app.get('/', (req, res) => {
    res.render('home.ejs');

    // Open only one socket connection, to avoid memory leaks
    io.once('connection', (io) => {
      // Settings object to be written in the settings file if it doesn't exist
      let settings = {
        "RSS": false,
        "elements": [{
          "elements": {}
        },
          {
            "elements": {}
          },
          {
            "elements": {}
          }
        ]
      }

      let settingsPath = './settings/settings.json';

      fs.stat(settingsPath, (err) => {
        if (err === null) {
          readSettings();
        } else if (err.code === 'ENOENT') {
          fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
            if (err) {
              console.log(err);
            } else {
              readSettings();
            }
          });
        }
      });

      io.on('add content', (feedData) => {
        // console.log(`feedData : ${JSON.stringify(feedData, null, 2)}`);
        let element;

        if (feedData !== undefined && feedData !== null) {
          fs.readFile(settingsPath, 'utf-8', (err, data) => {
            if (err) throw err;
            let settings;
            // try {
              settings = JSON.parse(data);
              let elements = settings.elements;
              if (settings === undefined) {
                console.log(`File content is undefined`);
              } else {

                // Check if feedData is an array
                if (Array.isArray(feedData)) {
                  console.log(JSON.stringify(feedData, null, 2));

                  for (let i = 0; i < feedData.length; i++) {
                    if (feedData[i].type === 'rss') {
                      settings.RSS = true;
                      let element = feedData[i].element;
                      let iElt = element.match(/[0-9]/) - 1;
                      if (feedData[i] !== undefined) {
                        if (element !== undefined && element !== null) {
                          if (elements[iElt] === undefined) {
                            elements[iElt] = {
                              elements: {}
                            };

                            elements[iElt].elements.element = element;
                            elements[iElt].elements.url = feedData[i].url;
                            elements[iElt].elements.type = feedData[i].type;
                          } else {
                            elements[iElt].elements.element = element;
                            elements[iElt].elements.url = feedData[i].url;
                            elements[iElt].elements.type = feedData[i].type;
                          }

                          request
                            .get(feedData[i].url)
                            .on('response', (res) => {
                              if (res.headers['content-type'] === 'text/xml' || res.headers['content-type'].match(/rss/gi)) {
                                feedparser.parse(feedData[i].url)
                                  .then(items => {
                                    // Send the results to the client
                                    io.emit('parse content', {
                                      feed: items,
                                      element: element,
                                      type: feedData[i].type
                                    });
                                  })
                                  .catch((err) => {
                                    if (err == 'Error: Not a feed') {
                                      console.log('Invalid feed URL');
                                    }
                                  });

                                if (i === feedData.length - 1) {
                                  fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), (err) => {
                                    if (err) throw err;
                                  });
                                }
                              } else {
                                io.emit('errorMsg', `${feedData[i].url} is not a valid RSS feed`);
                              }
                            });
                        }
                      }
                    } else if (feedData.type === 'weather') {

                      for (let i = 0; i < elements.length; i++) {
                        let element = feedData[i].element;
                        let iElt = element.match(/[0-9]/) - 1;

                        if (feedData[i] !== undefined) {
                          if (element !== undefined && element !== null) {
                            if (elements[iElt] === undefined) {
                              elements[iElt] = {
                                elements: {}
                              };
                              elements[iElt].elements.element = element;
                              elements[iElt].elements.url = feedData[i].url;
                              elements[iElt].elements.type = feedData[i].type;
                            } else {
                              elements[iElt].elements.element = element;
                              elements[iElt].elements.url = feedData[i].url;
                              elements[iElt].elements.type = feedData[i].type;
                            }

                            // Send the results to the client
                            io.emit('parse content', {
                              location: feedData[i].location,
                              element: element,
                              type: feedData[i].type
                            });
                          }
                        }
                      }

                      fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', () => {
                        if (err) throw err;

                        io.emit('parse content', {
                          type: 'weather',
                          element: feedData[i].element,
                          location: feedData[i].location
                        });
                      });
                    }
                  }
                } else if (feedData.type === 'weather') {

                  for (let i = 0; i < elements.length; i++) {
                    let iElt = feedData.element.match(/[0-9]/) - 1;

                    if (elements[iElt] === undefined) {
                      elements[iElt] = {
                        elements: {}
                      };
                      elements[iElt].elements.element = element;
                      elements[iElt].elements.location = feedData.location;
                    } else {
                      // console.log(JSON.stringify(elements[iElt], null, 2));
                      if (elements[iElt].elements.url !== undefined) {
                        delete elements[iElt].elements.url;
                        elements[iElt].elements.element = feedData.element;
                        elements[iElt].elements.location = feedData.location;
                        elements[iElt].elements.type = feedData.type;
                      } else {
                        elements[iElt].elements.element = feedData.element;
                        elements[iElt].elements.location = feedData.location;
                        elements[iElt].elements.type = feedData.type;
                      }
                    }

                    io.emit('parse content', {
                      element: feedData.element,
                      location: feedData.location,
                      type: feedData.type
                    })
                  }

                  fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', () => {
                    if (err) throw err;
                  });
                }
              }
              // Backup the new config
              backupSettings();
            // } catch (err) {
            //   // If parsing fail, restore the backup
            //   console.log(`Error parsing settings !`);
            //   fs.copyFile('./settings/settings.json.bak', settingsPath, (err) => {
            //     if (err) {
            //       if (err.code === 'EBUSY') {
            //         io.emit('refresh app');
            //         console.log(err);
            //       } else {
            //         console.log(`Unknown error code :\n${err}`);
            //       }
            //     } else {
            //       console.log(`Settings file successfully restored !`);
            //     }
            //   });
            // }
          });
        } else if (feedData === undefined) {
          io.emit('errorMsg', `Sorrry, RSS feed couldn't be added. Intense reflexion.`);
          console.log('Error adding feed : data is undefined');
        } else if (feedData === null) {
          io.emit('errorMsg', `Sorrry, RSS feed couldn't be added. Intense reflexion.`);
          console.log('Error adding feed : data is null');
        }
      });

      io.on('customization', (customizationData) => {
        // console.log(JSON.stringify(customizationData, null, 2));
        fs.readFile(settingsPath, 'utf-8', (err, data) => {
          if (err) throw err;
          let settings;
          if (data !== undefined) {
            try {
              settings = JSON.parse(data);

              if (customizationData.backgroundImage !== null && customizationData.backgroundImage !== undefined) {
                settings.backgroundImage = customizationData.backgroundImage;
              }

              if (customizationData.RSS !== null && customizationData.RSS !== undefined) {
                settings.RSS = customizationData.RSS;
              }

              if (customizationData.owmToken !== null && customizationData.owmToken !== undefined) {
                settings.owmToken = customizationData.owmToken;
              }

              fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
                if (err) throw err;

                io.emit('server settings updated', {
                  backgroundImage: settings.backgroundImage
                });

                // Backup the new config
                backupSettings(settings);
              });
            } catch (err) {
              // If parsing fail, restore the backup
              console.log(`Error parsing settings !`);
              fs.copyFile('./settings/settings.json.bak', settingsPath, (err) => {
                if (err) {
                  if (err.code === 'EBUSY') {
                    io.emit('refresh app');
                    console.log(err);
                  } else {
                    console.log(`Unknown error code :\n${err}`);
                  }
                } else {
                  console.log(`Settings file successfully restored !`);
                }
              });
            }
          } else {
            console.log(`File content is undefined !`);
          }
        });
      });

      io.on('download', (id) => {
        var info = ytdl.getInfo(id, (err, info) => {
          if (err) throw err;

          let filename = info.player_response.videoDetails.title.replace(/[\/\\%:]/, '');
          filename = `${filename}.mp3`;

          let path = `${__dirname}\\src\\${filename}`;

          // Create a file containing the stream
          let audioFile = fs.createWriteStream(path);

          let stream = ytdl(id, {
              filter: 'audioonly'
            }, {
              quality: 'highestaudio'
            })
            .pipe(audioFile);

          stream.on('close', () => {
            // console.log(`I finished downloading ${filename} !`);

            downloadedFile.path = path;
            downloadedFile.name = filename;

            // Inform the client that the download ended
            io.emit('download ended', {
              title: info.player_response.videoDetails.title,
            });
          });
        });
      });

      io.on('audio info request', (streamData) => {
        let id = streamData.id;
        ytdl(id, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            fs.writeFile('./streamInfo.json', JSON.stringify(info, null, 2), 'utf-8', (err) => {
              if (err) throw err;
            });
            io.emit('audio info retrieved', {
              title: info.player_response.videoDetails.title
            });
          }
        });
      });

      io.on('update feed', (feed2update) => {
        fs.readFile(settingsPath, 'utf-8', (err, data) => {
          try {
            let settings = JSON.parse(data);
            for (let i = 0; i < settings.elements.length; i++) {
              if (settings.elements[i].element === feed2update.element) {
                feedparser.parse(settings.elements[i].url)
                  .then(items => {
                    // Parse rss
                    io.emit('rss parsed', {
                      feed: items,
                      element: feed2update.element
                    });
                  })
                  .catch(console.error);
              }
            }
          } catch (err) {
            console.log(`Error reading settings file : ${err}`);
          }
        });
      });

      io.on('parse playlist', (playlistUrl) => {
        request(playlistUrl, (err, response, body) => {
          if (err) throw err;
          try {
            var result = JSON.parse(body);
            fs.writeFile('./tmp/playlist.json', JSON.stringify(result, null, 2), 'utf-8', (err) => {
              if (err) throw err;
              io.emit('playlist parsed');
            });
          } catch (e) {
            console.log(`Error parsing playlist : ${e}`);
          }
        });
      });
    });
  })

  // Prompt the user to download the file
  .get('/download', (req, res) => {
    res.download(downloadedFile.path, downloadedFile.name, (err) => {
      if (err) throw err;
    });
  })

  .post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        res.render('home.ejs', {
          msg: err
        });
      } else {
        res.render('home.ejs', {
          msg: `${req.file.originalname} successfully uploaded !`,
        });

        // Add filepath to the settings
        fs.readFile('./settings/settings.json', 'utf-8', (err, data) => {
          if (err) {
            console.log(err);
          } else {
            try {
              let settings = JSON.parse(data);
              settings.backgroundImage = `${req.file.destination}/${req.file.filename}`;
              fs.writeFile('./settings/settings.json', JSON.stringify(settings, null, 2), 'utf-8', (err) => {
                if (err) throw err;

                // Backup the new config
                backupSettings(settings);
              });
            } catch (err) {
              console.log(`Error reading settings file !`);
            };
          }
        });
      }
    });
  })

  // 404 errors handling
  .use((req, res, next) => {
    // Only display an error page if the requested URL isn't /download
    if (req.url !== '/download') {
      res.status(404).render('404.ejs');
      io.once('connection', (io) => {
        fs.readFile('./settings/settings.json', 'utf-8', (err, data) => {
          if (err) throw err;
          let settings;
          if (data !== undefined) {
            try {
              settings = JSON.parse(data);
              customizeBackground(settings.backgroundImage);
            } catch (err) {
              // If parsing fail, restore the backup
              console.log(`Error parsing settings !`);
              fs.copyFile('./settings/settings.json.bak', './settings/settings.json', (err) => {
                if (err) {
                  if (err.code === 'EBUSY') {
                    io.emit('refresh app');
                    console.log(err);
                  } else {
                    console.log(`Unknown error code :\n${err}`);
                  }
                } else {
                  console.log(`Settings file successfully restored !`);
                }
              });
            }
          } else {
            console.log(`File content is undefined !`);
          }
        });
      });
    } else;
  });

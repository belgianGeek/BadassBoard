const ytdl = require('ytdl-core');
const fs = require('fs');
const express = require('express');
const app = express();
const feedparser = require("feedparser-promised")
const ip = require('ip');
const { execFile } = require('child_process');
const os = require('os');
const path = require('path');
const request = require('request');
const multer = require('multer');

// Upload configuration
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
}).single('backgroundImageUploadInput'); // the name cannot be modified because it is linked to the input name in the formData object

const server = require('http').Server(app);
const io = require('socket.io')(server);
const settingsPath = './settings/settings.json';

server.listen(8080, ip.address());

const backupSettings = (settings) => {
  fs.writeFile('./settings/settings.json.bak', JSON.stringify(settings, null, 2), (err) => {
    if (err) throw err;
  });
}

const customize = (customizationData) => {
  // console.log(JSON.stringify(customizationData, null, 2));

  fs.readFile(settingsPath, 'utf-8', (err, data) => {
    if (err) throw err;
    let settings;
    if (data !== undefined) {
      // try {
      settings = JSON.parse(data);

      const processNewSettings = (callback) => {
        if (customizationData.backgroundImage !== null && customizationData.backgroundImage !== undefined) {
          if (!customizationData.backgroundImage.match(/^http/)) {
            // fs.rename(customizationData.backgroundImage, `./upload/wallpaper.${customizationData.backgroundImage.match(/[a-z]{1,4}$/im)}`, (err) => {
            //   if (err) throw err;
            // settings.backgroundImage = `./upload/wallpaper.${customizationData.backgroundImage.match(/[a-z]{1,4}$/im)}`;
            // console.log(`file renamed : ./upload/wallpaper.${customizationData.backgroundImage.match(/[a-z]{1,4}$/im)}`);
            // });
            settings.backgroundImage = customizationData.backgroundImage;
          } else {
            settings.backgroundImage = customizationData.backgroundImage;
          }
        }

        if (customizationData.RSS !== null && customizationData.RSS !== undefined) {
          settings.RSS = customizationData.RSS;
        }

        if (customizationData.owmToken !== null && customizationData.owmToken !== undefined) {
          settings.owmToken = customizationData.owmToken;
        }

        callback();
      }

      processNewSettings(() => {
        setTimeout(() => {
          fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
            if (err) throw err;
            // console.log(`config saved : ${settings.backgroundImage}`);

            if (settings.backgroundImage !== null && settings.backgroundImage !== undefined) {
              io.emit('server settings updated', {
                backgroundImage: settings.backgroundImage
              });
            }

            // Backup the new config
            backupSettings(settings);
          });
        }, 1000)
      });
      // } catch (err) {
      //   // If parsing fail, restore the backup
      //   console.log(`Error parsing settings !`);
      //   fs.copyFile('./settings/settings.json.bak', settingsPath, (err) => {
      //     if (err) {
      //       if (err.code === 'EBUSY') {
      //         io.emit('refresh app');
      //         console.log(err);
      //       } else {
      //         console.log(`Error copying the settings file :\n${err}`);
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

const readSettings = () => {
  fs.readFile('./settings/settings.json', 'utf-8', (err, data) => {
    if (err) throw err;
    let settings;
    if (data !== undefined) {
      // try {
      settings = JSON.parse(data);
      let elements = settings.elements;
      var eltsArray = [];
      if (settings.RSS === true) {
        io.emit('RSS status retrieved', settings.RSS);
        var bigI, i;
        // let iArray = 0;
        let totalLength = 0;
        for (const [bigI, value] of elements.entries()) {
          var subElts = value.elements;
          totalLength += value.elements.length;
          for (const [i, subEltsValue] of subElts.entries()) {
            const sendData = () => {
              if (eltsArray.length === totalLength) {
                // console.log(`Array : ${JSON.stringify(eltsArray.length, null, 2)}`);
                io.emit('parse content', eltsArray);
              }
            }

            if (subEltsValue.type === 'rss') {
              let elt = subEltsValue;
              feedparser.parse(subEltsValue.url)
                .then(items => {
                  elt.feed = items;
                  eltsArray.push(elt);
                  // console.log(`bigI : ${bigI}`, `elements : ${eltsArray.length}`, `totalLength : ${totalLength}`);
                  sendData();
                })
                .catch(console.error);
            } else if (subEltsValue.type === 'weather') {
              let newElt = subEltsValue;
              eltsArray.push(newElt);
              // console.log(`bigI : ${bigI}`, `elements : ${elements.length}`, `totalLength : ${totalLength}`);
              sendData();
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
      //         console.log(`Error copying the settings file :\n${err}`);
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

const existPath = (path, callback) => {
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

    // Only execute the callback if it is defined
    if (callback) {
      callback();
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
existPath('tmp/');
existPath('settings/', () => {
  // Write the current IP in a file to send it to the client
  fs.writeFile('./settings/ip.txt', ip.address(), 'utf-8', (err) => {
    if (err) throw err;
  });
});

app.use("/src", express.static(__dirname + "/src"))
  .use("/upload", express.static(__dirname + "/upload"))
  .use("/settings", express.static(__dirname + "/settings"))
  .use("/tmp", express.static(__dirname + "/tmp"))

if (!ip.address().match(/169.254/)) {
  console.log(`Hey ${username} ! You can connect to the web interface here : http://${ip.address()}:8080.`);
} else {
  console.log(`Sorry Dude, I won't work properly if I don't have access to the Internet. Please fix your connection and try again.`);
}

// Clear the temp folder every 10 minutes
setTimeout(() => {
  fs.readdir('./tmp', (err, files) => {
    if (!err) {
      for (const file of files) {
        fs.unlink(`./tmp/${file}`, (err) => {
          if (err) {
            console.log(`Error deleting "${file}" from the temp folder :\n${err}`);
          }
        });
      }
    } else {
      console.log(`Error cleaning the temp folder:\n${err}`);
    }
  });
}, 60000);

app.get('/', (req, res) => {
    // console.log(req.secure);
    res.render('home.ejs');

    // Open only one socket connection, to avoid memory leaks
    io.once('connection', (io) => {
      // Settings object to be written in the settings file if it doesn't exist
      let settings = {
        "RSS": false,
        "elements": [{
            "elements": []
          },
          {
            "elements": []
          },
          {
            "elements": []
          }
        ]
      }

      // Read the settings file or create it if it doesn't exist
      fs.stat(settingsPath, (err) => {
        if (err === null) {
          readSettings();
        } else if (err.code === 'ENOENT') {
          fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
            if (err) {
              console.log(`Error creating the settings file : ${err}`);
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
            var elements = settings.elements;
            if (settings === undefined) {
              console.log(`The settings file content is undefined...`);
            } else {
              settings.RSS = true;

              // Check if feedData is an array
              if (Array.isArray(feedData)) {
                // console.log(JSON.stringify(feedData, null, 2));
                let newElt = {};

                for (let i = 0; i < feedData.length; i++) {
                  // Store the parent element number
                  let iParent = Number(feedData[i].parent.match(/\d/)) - 1;

                  // Define a counter to prevent multiple addings
                  let iAddElt = 0;

                  for (const [j, value] of elements.entries()) {
                    // console.log(`j : ${j}\nValue : ${JSON.stringify(value.elements, null, 2)}\n${feedData[i].parent}`);

                    const processData = (callback) => {
                      if (feedData[i].type === 'rss') {
                        request
                          .get(feedData[i].url)
                          .on('response', (res) => {
                            if (res.headers['content-type'].match(/xml/gi) || res.headers['content-type'].match(/rss/gi)) {
                              // console.log(res.headers['content-type']);
                              newElt.element = feedData[i].element;
                              newElt.parent = feedData[i].parent;
                              newElt.url = feedData[i].url;
                              newElt.type = feedData[i].type;

                              feedparser.parse(feedData[i].url)
                                .then(items => {
                                  io.emit('parse content', [{
                                    feed: items,
                                    element: feedData[i].element,
                                    parent: feedData[i].parent,
                                    type: feedData[i].type
                                  }]);

                                  callback();
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
                              newElt = {};
                              // console.log(1, newElt);

                              io.emit('errorMsg', {
                                type: 'rss verification',
                                element: `${feedData[i].parent} ${feedData[i].element}`,
                                msg: `${feedData[i].url} is not a valid RSS feed`
                              });
                            }
                          });
                        // console.log(`newElt : ${JSON.stringify(newElt, null, 2)}`);
                      } else if (feedData[i].type === 'weather') {
                        newElt.element = feedData[i].element;
                        newElt.parent = feedData[i].parent;
                        newElt.location = feedData[i].location;
                        newElt.type = feedData[i].type;

                        io.emit('parse content', [{
                          type: 'weather',
                          element: feedData[i].element,
                          parent: feedData[i].parent,
                          location: feedData[i].location
                        }]);

                        callback();
                      }
                    }

                    processData(() => {
                      // console.log(2, newElt);
                      if (newElt !== {}) {
                        if (value.elements[0] !== undefined && value.elements[0].element !== undefined) {
                          for (const [k, kValue] of value.elements.entries()) {
                            if (kValue.element === feedData[i].element && kValue.parent === feedData[i].parent) {
                              // console.log(1);
                              value.elements.splice(k, 1, newElt);
                            } else if (kValue.element !== feedData[i].element && kValue.parent === feedData[i].parent) {
                              if (iAddElt === 0) {
                                // console.log(2);
                                value.elements.push(newElt);
                                iAddElt++;
                              }
                              // console.log(JSON.stringify(value.elements[k], null, 2));
                            }
                          }
                        } else if (value.elements[0] === undefined && iParent === j) {
                          // console.log(3);
                          // Append the new element to the "elements" settings array
                          value.elements.push(newElt);
                        }

                        fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
                          if (err) throw err;

                          // Reset the addings counter
                          iAddElt = 0;

                          // Backup the new config
                          backupSettings();
                        });
                      }
                    });
                  }
                }
              }
            }
            // } catch (err) {
            //   // If parsing fail, restore the backup
            //   console.log(`Error parsing settings !`);
            //   fs.copyFile('./settings/settings.json.bak', settingsPath, (err) => {
            //     if (err) {
            //       if (err.code === 'EBUSY') {
            //         io.emit('refresh app');
            //         console.log(err);
            //       } else {
            //         console.log(`Error copying the settings file :\n${err}`);
            //       }
            //     } else {
            //       console.log(`Settings file successfully restored !`);
            //     }
            //   });
            // }
          });
        } else if (feedData === undefined || feedData === null) {
          io.emit('errorMsg', {
            msg: `Sorrry, RSS feed couldn't be added. Intense reflexion.`,
            type: 'generic'
          });
          console.log(`Error adding feed : feedData is ${feedData}`);
        }
      });

      io.on('customization', (customizationData) => {
        customize(customizationData);
      });

      io.on('download', (id) => {
        let options = [
          '-x',
          '--audio-format',
          'mp3',
          '-o',
          `./tmp/%(title)s.%(ext)s`,
          id,
          '--youtube-skip-dash-manifest',
          '--embed-thumbnail',
          '--add-metadata'
        ];

        const manualAudioDownload = () => {
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
        }

        const youtubeDlDownload = (youtubeDLpath) => {
          let download = execFile(youtubeDLpath, options, (err, stdout) => {
            if (err) {
              console.log(`Error downloading file with Youtube-dl : ${err}`);
            }

            let filename = stdout
              .match(/tmp([\/\\a-zA-ZùéàçÉÈÁÀÊîïôÔ0-9-_\[\]()\s.,;:=+~µ@&#!]{1,}\.mp3)/i)[1]
              .substring(1, 100);

            downloadedFile.path = `./tmp/${filename}`;

            downloadedFile.name = filename;
          });

          download.on('close', () => {
            // Inform the client that the download ended
            io.emit('download ended', {
              title: downloadedFile.name
            });
          });
        }

        if (os.platform() === 'win32') {
          fs.stat('./youtube-dl.exe', (err, stats) => {
            if (err) {
              if (err.code === 'ENOENT') {
                manualAudioDownload();
              } else {
                console.log(`Error downloading file without Youtube-dl : ${err}`);
              }
            } else {
              youtubeDlDownload('youtube-dl.exe');
            }
          })
        } else if (os.platform() === 'linux') {
          fs.stat('/usr/local/bin/youtube-dl', (err, stats) => {
            if (err) {
              if (err.code === 'ENOENT') {
                manualAudioDownload();
              } else {
                console.log(`Error downloading file without Youtube-dl : ${err}`);
              }
            } else {
              youtubeDlDownload('youtube-dl');
            }
          });
        } else {
          console.log('Sorry, the Youtube-dl method has not been implemented for your OS yet...');
          manualAudioDownload();
        }
      });

      io.on('audio info request', (streamData) => {
        let id = streamData.id;
        ytdl(id, (err, info) => {
          if (err) {
            console.log(`Error getting audio info with ytdl : ${err}`);
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
        // console.log(JSON.stringify(feed2update, null, 2));
        fs.readFile(settingsPath, 'utf-8', (err, data) => {
          try {
            let settings = JSON.parse(data);
            for (const i of settings.elements) {
              for (const j of i.elements) {
                // console.log(JSON.stringify(j, null, 2));
                let eltRegex = new RegExp(j.element, 'gi');
                let parentRegex = new RegExp(j.parent, 'gi');
                if (feed2update.element.match(eltRegex) && feed2update.parent.match(parentRegex)) {
                  // console.log('ok');
                  feedparser.parse(j.url)
                    .then(items => {
                      // Parse rss
                      io.emit('feed updated', {
                        feed: items,
                        element: feed2update.element,
                        parent: feed2update.parent,
                        update: true
                      });
                    })
                    .catch(console.error);
                }
              }
            }
          } catch (err) {
            console.log(`Error reading settings file : ${err}`);
          }
        });
      });

      io.on('parse playlist', (playlistUrl) => {
        request(playlistUrl, (err, response, body) => {
          if (err === 'socket hang up') {
            console.log('The websocket died... :(');
          } else {
            console.log(`Error parsing requesting playlist info on the Invidious API : ${err}`);
          }
          try {
            var result = JSON.parse(body);

            if (result.error === undefined) {
              fs.writeFile('./tmp/playlist.json', JSON.stringify(result, null, 2), 'utf-8', (err) => {
                if (err) throw err;
                io.emit('playlist parsed');
              });
            } else if (result.error !== undefined && result.error === 'Playlist is empty') {
              io.emit('errorMsg', {
                msg: 'Invalid playlist reference :((',
                type: 'generic'
              });
            }
          } catch (e) {
            console.log(`Error parsing playlist : ${e}`);
            io.emit('errorMsg', {
              msg: 'Error parsing playlist :((',
              type: 'generic'
            });
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
      if (req.file !== undefined) {
        // console.log(req.file);
        let data = {
          backgroundImage: `${req.file.destination}/${req.file.filename}`
        };

        // console.log(`customize : ${data.backgroundImage}`);
        if (err) {
          res.render('home.ejs', {
            msg: err
          });
        } else {
          res.render('home.ejs', {
            msg: `${req.file.originalname} successfully uploaded !`,
          });

          customize(data);
        }
      } else if (err) {
        // console.log(JSON.stringify(req.file, null, 2));
        console.log(`Error uploading file :(( :\n${err}`);
      }
    });
  })

  // 404 errors handling
  .use((req, res, next) => {
    res.status(404).render('404.ejs');
    io.once('connection', (io) => {
      fs.readFile('./settings/settings.json', 'utf-8', (err, data) => {
        if (err) throw err;
        let settings;
        if (data !== undefined) {
          try {
            settings = JSON.parse(data);
          } catch (err) {
            // If parsing fail, restore the backup
            console.log(`Error parsing settings !\n${err}`);
            fs.copyFile('./settings/settings.json.bak', './settings/settings.json', (err) => {
              if (err) {
                if (err.code === 'EBUSY') {
                  io.emit('refresh app');
                  console.log(err);
                } else {
                  console.log(`Error copying the settings file :\n${err}`);
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
  });

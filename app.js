const ytdl = require('ytdl-core');
const fs = require('fs');
const express = require('express');
const app = express();
const feedparser = require("feedparser-promised");
const ip = require('ip');
const {
  execFile
} = require('child_process');
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

server.listen(8080);

const customize = (customizationData) => {
  // console.log(JSON.stringify(customizationData, null, 2));

  fs.readFile(settingsPath, 'utf-8', (err, data) => {
    if (err) throw err;
    let settings;
    if (data !== undefined) {
      settings = JSON.parse(data);

      const processNewSettings = (callback) => {
        if (customizationData.backgroundImage !== null && customizationData.backgroundImage !== undefined) {
          if (!customizationData.backgroundImage.match(/^http/)) {

            // Remove the old wallpaper and rename the new
            fs.unlink(settings.backgroundImage, (err) => {
              if (!err || err.code === 'ENOENT') {
                if (customizationData.backgroundImage.match(' ')) {
                  let newFilename = customizationData.backgroundImage.split(' ').join('_');
                  fs.rename(customizationData.backgroundImage, newFilename, (err) => {
                    if (!err) {
                      settings.backgroundImage = newFilename;
                    } else {
                      // Avoid errors saying the path does not exist after renaming
                      if (err.code !== 'ENOENT') {
                        console.log(`Error renaming background-image : ${err}`);
                      }
                    }
                  });
                } else {
                  settings.backgroundImage = customizationData.backgroundImage;
                }
              }
            })
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

        // console.log(JSON.stringify(customizationData, null, 2));

        if (customizationData.searchEngine !== null && customizationData.searchEngine !== undefined) {
          settings.searchEngine = customizationData.searchEngine;
        }

        setTimeout(() => {
          callback();
        }, 500);
      }

      processNewSettings(() => {
        fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
          if (!err) {
            if (settings.backgroundImage !== null && settings.backgroundImage !== undefined) {
              io.emit('server settings updated', {
                backgroundImage: settings.backgroundImage
              });
            }
          } else {
            console.log(`Error updating settings after customization : ${err}`);
          }
        });
      });
    } else {
      console.log(`Settings file content is undefined !`);
    }
  });
}

const readSettings = () => {
  fs.readFile(settingsPath, 'utf-8', (err, data) => {
    if (err) throw err;
    let settings;
    if (data !== undefined) {
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
                  // console.log(`RSS : bigI : ${bigI}`, `elements : ${eltsArray.length}`, `totalLength : ${totalLength}`);
                  sendData();
                })
                .catch((err) => {
                  if (err == 'Error: Not a feed') {
                    io.emit('errorMsg', {
                      type: 'rss verification',
                      element: `${subEltsValue.parent} ${subEltsValue.element}`,
                      msg: `${subEltsValue.url} is not a valid RSS feed`
                    });
                  }
                });
            } else if (subEltsValue.type === 'weather' || subEltsValue.type === 'youtube search') {
              eltsArray.push(subEltsValue);
              // console.log(`WEATHER : bigI : ${bigI}`, `elements : ${elements.length}`, `totalLength : ${totalLength}`);
              sendData();
            }
          }
        }
      }
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
existPath('settings/');

app.use("/src", express.static(__dirname + "/src"))
  .use("/upload", express.static(__dirname + "/upload"))
  .use("/settings", express.static(__dirname + "/settings"))
  .use("/tmp", express.static(__dirname + "/tmp"))

if (!ip.address().match(/169.254/) || !ip.address().match(/127.0/)) {
  console.log(`Hey ${username} ! You can connect to the web interface with your local IP (http://${ip.address()}:8080) or hostname (http://${os.hostname()}:8080).`);
} else {
  console.log(`Sorry Dude, I won't work properly if I don't have access to the Internet. Please fix your connection and try again.`);
}

// Clear the temp folder every 15 minutes
setInterval(() => {
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
}, 900000);

app.get('/', (req, res) => {
    res.render('home.ejs');

    // Open only one socket connection, to avoid memory leaks
    io.once('connection', (io) => {
      // Settings object to be written in the settings file if it doesn't exist
      let settings = {
        "RSS": true,
        "elements": [{
            "elements": []
          },
          {
            "elements": []
          },
          {
            "elements": []
          }
        ],
        "owmToken": "9b013a34970de2ddd85f46ea9185dbc5",
        "searchEngine": {
          "label": "DuckDuckGo",
          "url": "https://duckduckgo.com/?q="
        }
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
                      // console.log(i);
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
                                    io.emit('errorMsg', {
                                      type: 'rss verification',
                                      element: `${feedData[i].parent} ${feedData[i].element}`,
                                      msg: `${feedData[i].url} is not a valid RSS feed`
                                    });
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
                          })
                          .on('error', (err) => {
                            console.log(`Error parsing feed : ${err}`);
                            io.emit('errorMsg', {
                              type: 'rss verification',
                              element: `${feedData[i].parent} ${feedData[i].element}`,
                              msg: `${feedData[i].url} is not a valid RSS feed`
                            });
                          });

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
                      } else if (feedData[i].type === 'youtube search') {
                        newElt.element = feedData[i].element;
                        newElt.parent = feedData[i].parent;
                        newElt.type = feedData[i].type;

                        io.emit('parse content', [{
                          type: 'youtube search',
                          element: feedData[i].element,
                          parent: feedData[i].parent,
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
                              iAddElt++;
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
                          iAddElt++;
                        }

                        fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', (err) => {
                          if (err) throw err;

                          // Reset the addings counter
                          iAddElt = 0;
                        });
                      }
                    });
                  }
                }
              }
            }
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
          let downloadLog;
          let download = execFile(youtubeDLpath, options, (err, stdout) => {
            if (err) {
              console.log(`Error downloading file with Youtube-dl : ${err}`);
            } else {
              downloadLog = stdout;
            }
          });

          download.on('close', () => {

            filename = downloadLog
              .match(/((.|)(\/|\\|)tmp(\/|\\)\w.+\.mp3)/i)[1]
              .substring(1, 100);

            if (os.platform() === 'Win32') {
              downloadedFile.path = `${__dirname}\\${filename}`;
            } else if (os.platform() === 'linux') {
              downloadedFile.path = `${__dirname}${filename}`;
            }

            downloadedFile.name = filename;

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
          if (err) {
            if (err === 'socket hang up') {
              console.log('The websocket died... :(');
            } else {
              io.emit('errorMsg', {
                type: 'generic',
                msg: `Sorry, the audio stream failed to load due to a server error... Try maybe later.`
              });
            }
          } else {
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
          }
        });
      });

      io.on('remove content', (content2remove) => {
        fs.readFile(settingsPath, 'utf-8', (err, data) => {
          if (!err) {
            let settings = JSON.parse(data);

            for (const [i, settingsElts] of settings.elements.entries()) {
              // Set a variable to stop the loop as soon as the element is removed
              let found = false;
              for (const [j, settingsElt] of settingsElts.elements.entries()) {
                if (found !== true) {
                  if (content2remove.parent === settingsElt.parent && content2remove.element === settingsElt.element) {
                    settingsElts.elements.splice(j, 1);

                    fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), (err) => {
                      if (!err) {
                        found = true;
                      } else {
                        console.log(`Error updating settings : ${err}`);
                      }
                    });
                  }
                }
              }
            }
          } else {
            console.log(`Error reading settings : ${err}`);
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
      fs.readFile(settingsPath, 'utf-8', (err, data) => {
        if (err) throw err;
        let settings;
        if (data !== undefined) {
          try {
            settings = JSON.parse(data);
          } catch (err) {
            // If parsing fail, throw an error
            console.log(`Error parsing settings !\n${err}`);
          }
        } else {
          console.log(`File content is undefined !`);
        }
      });
    });
  });

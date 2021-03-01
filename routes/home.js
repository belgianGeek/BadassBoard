module.exports = function(app, io, settings) {
  const feedparser = require("feedparser-promised");
  const {
    execFile
  } = require('child_process');
  const path = require('path');
  const axios = require('axios');
  const badassUpdate = require('../modules/update');
  const fs = require('fs-extra');
  const customize = require('../modules/customize');
  const os = require('os');
  const ytdl = require('ytdl-core');
  const getInvidiousInstanceHealth = require('../modules/getInvidiousInstanceHealth');

  // Define a counter to prevent multiple addings
  let iAddElt = 0;

  app.get('/', (req, res) => {
    res.render('home.ejs', {
      currentVersion: app.tag,
      isHomepage: true
    });

    // Open only one socket connection to avoid memory leaks
    io.once('connection', io => {
      let elements = settings.elements;
      let eltsArray = [];

      io.emit('RSS status retrieved', settings.RSS);
      if (settings.RSS === true) {
        var bigI, i;

        let totalLength = 0;
        for (const [bigI, value] of elements.entries()) {
          var subElts = value.elements;
          totalLength += value.elements.length;

          for (const [i, subEltsValue] of subElts.entries()) {
            const sendData = () => {
              if (eltsArray.length === totalLength) {
                // Send data to the client
                io.emit('parse content', eltsArray);
              }
            }

            if (subEltsValue.type === 'rss') {
              feedparser.parse(subEltsValue.url)
                .then(items => {
                  subEltsValue.feed = items;
                  eltsArray.push(subEltsValue);

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

              sendData();
            }
          }
        }
      }

      // Do not send the default wallpaper
      if (settings.backgroundImage !== './client/scss/wallpaper.jpg') {
        io.emit('wallpaper', settings.backgroundImage);
      }

      // Get some Invidious instances health each hour to handle Youtube requests
      let invidiousInstancesHealth = [];
      let iInstances = 0;

      getInvidiousInstanceHealth(instances => {
        invidiousInstancesHealth = instances;
        io.emit('invidious instances', instances);
      });

      io.on('add content', feedData => {
        var elements = settings.elements;

        settings.RSS = true;

        let newElt = {};

        // Store the parent element number
        let iParent = Number(feedData.parent.match(/\d/)) - 1;

        const processData = (callback) => {
          if (feedData.type === 'rss') {
            axios({
                url: feedData.url,
                method: 'GET'
              })
              .then(res => {
                if (res.headers['content-type'].match(/xml/gi) || res.headers['content-type'].match(/rss/gi)) {
                  newElt.element = feedData.element;
                  newElt.parent = feedData.parent;
                  newElt.url = feedData.url;
                  newElt.type = feedData.type;

                  feedparser.parse(feedData.url)
                    .then(items => {
                      io.emit('parse content', [{
                        feed: items,
                        element: feedData.element,
                        parent: feedData.parent,
                        type: feedData.type
                      }]);
                    })
                    .catch((err) => {
                      if (err == 'Error: Not a feed') {
                        console.log(`${feedData.url} is not a valid feed URL...`);

                        io.emit('errorMsg', {
                          type: 'rss verification',
                          element: `${feedData.parent} ${feedData.element}`,
                          msg: `${feedData.url} is not a valid RSS feed`
                        });
                      }
                    });
                } else {
                  newElt = {};

                  io.emit('errorMsg', {
                    type: 'rss verification',
                    element: `${feedData.parent} ${feedData.element}`,
                    msg: `${feedData.url} is not a valid RSS feed`
                  });
                }
              })
              .catch(err => {
                console.log(`Error parsing feed ${feedData.url} : ${err}`);

                io.emit('errorMsg', {
                  type: 'rss verification',
                  element: `${feedData.parent} ${feedData.element}`,
                  msg: `${feedData.url} is not a valid RSS feed`
                });
              });

          } else if (feedData.type === 'weather') {
            newElt.element = feedData.element;
            newElt.parent = feedData.parent;
            newElt.location = feedData.location;
            newElt.type = feedData.type;

            io.emit('parse content', [{
              type: 'weather',
              element: feedData.element,
              parent: feedData.parent,
              location: feedData.location
            }]);
          } else if (feedData.type === 'youtube search') {
            newElt.element = feedData.element;
            newElt.parent = feedData.parent;
            newElt.type = feedData.type;

            io.emit('parse content', [{
              type: 'youtube search',
              element: feedData.element,
              parent: feedData.parent,
            }]);
          }

          callback();
        }

        processData(() => {
          for (const [j, value] of elements.entries()) {
            if (newElt !== {}) {
              if (value.elements[0] !== undefined && value.elements[0].element !== undefined) {
                for (const [k, kValue] of value.elements.entries()) {
                  // Remove the "feed" property for each element before updating the settings
                  delete kValue.feed;
                  if (iAddElt === 0) {
                    if (kValue.element === feedData.element && kValue.parent === feedData.parent) {
                      value.elements.splice(k, 1, newElt);
                      iAddElt++;
                    } else if (kValue.element !== feedData.element && kValue.parent === feedData.parent) {
                      value.elements.push(newElt);
                      iAddElt++;
                    }
                  }
                }
              } else if (value.elements[0] === undefined && iParent === j) {
                // Append the new element to the "elements" settings array
                // if this is the first element added to named content container
                value.elements.push(newElt);
                iAddElt++;
              }
            }
          }
        });

        // Reset the addings counter
        iAddElt = 0;
      });

      io.on('customization', customizationData => {
        customize(io, settings, customizationData);
        io.emit('customization data retrieved');
      });

      io.on('download', (id) => {
        let options = [
          '-x',
          '--audio-format',
          'mp3',
          '-o',
          `${path.join(__dirname, '../tmp')}/%(title)s.%(ext)s`,
          'https://wwww.youtube.com/watch?v=' + id,
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
              app.downloadedFile.path = path;
              app.downloadedFile.name = filename;

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
            console.log(downloadLog);
            if (downloadLog !== null && downloadLog !== undefined) {
              filename = downloadLog
                .match(/(tmp\\|tmp\/).*(.mp3)/i)[0]
                .substring(4, 100);

              app.downloadedFile.path = `${path.join(__dirname, '../tmp/', filename)}`;

              app.downloadedFile.name = filename;

              // Wait one second to be sure the file processing ended
              // Inform the client that the download ended
              setTimeout(() => {
                io.emit('download ended', {
                  title: app.downloadedFile.name
                });
              }, 1000);
            } else {
              io.emit('errorMsg', {
                type: 'generic',
                msg: `Sorry, this video couldn't be downloaded... Unable to retrieve filename.`
              });
              console.log(`Sorry, this video couldn't be downloaded... Unable to retrieve filename.`);
            }
          });
        }

        if (os.platform() === 'win32') {
          fs.stat('./youtube-dl.exe', (err, stats) => {
            if (err) {
              if (err.code === 'ENOENT') {
                manualAudioDownload();
              } else {
                io.emit('errorMsg', {
                  type: 'generic',
                  msg: `Error downloading file without Youtube-dl. Please check the logs for details.`
                });
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
                console.error('Youtube-dl executable not found /usr/bin folder, using manual download method instead...');
                manualAudioDownload();
              } else {
                io.emit('errorMsg', {
                  type: 'generic',
                  msg: `Error downloading file without Youtube-dl. Please check the logs for details.`
                });
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

      io.on('audio info request', streamData => {
        ytdl(streamData)
          .on('error', err => console.error(`Error getting audio info with ytdl : ${err}`))
          .on('info', info => {
            io.emit('audio info retrieved', {
              title: info.player_response.videoDetails.title
            });
          });
      });

      io.on('update feed', data => {
        feedparser.parse(data.url)
          .then(items => {
            // Parse rss
            io.emit('feed updated', {
              feed: items,
              parent: data.parent,
              url: data.url
            });
          })
          .catch(console.error);
      });

      io.on('parse playlist', playlist => {
        fs.writeFile(path.join(__dirname, '../tmp', 'playlist.json'), JSON.stringify(playlist.playlist, null, 2), 'utf-8', (err) => {
          if (!err) {
            // Match the Invidous instance url without any argument
            io.emit('playlist parsed', playlist.url.match(/http(s|):\/\/(www\.|)[-a-zA-Z0-9\.]{1,256}\.[a-zA-Z0-9]{1,6}/g));
          } else {
            console.log(err);
            io.emit('errorMsg', {
              type: 'generic',
              msg: `Sorry, the playlist content couldn't be saved. Check the logs for details.`
            });
          }
        });
      });

      io.on('remove content', content2remove => {
        let found = false;
        for (const [i, settingsElts] of settings.elements.entries()) {
          // Set a variable to stop the loop as soon as the element is removed
          for (const [j, settingsElt] of settingsElts.elements.entries()) {
            if (!found) {
              if (content2remove.parent === settingsElt.parent && content2remove.element === settingsElt.element) {
                settingsElts.elements.splice(j, 1);
                found = true;
              }
            }
          }
        }
      });

      io.on('update check', () => {
        badassUpdate(io, app.tag);
      });
    });
  });
};

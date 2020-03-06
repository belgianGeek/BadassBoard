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

const bot = {
  name: 'Ava',
  icon: './src/scss/chat/bot.png'
}

const nlp = require('natural');
let classifier = new nlp.LogisticRegressionClassifier();
const stemmer = nlp.PorterStemmer.attach();
const tokenizer = new nlp.WordTokenizer();

nlp.LogisticRegressionClassifier.load('classifier.json', null, function(err, loadedClassifier) {
  if (!err) {
    console.log('Classifier successfully loaded !');
    classifier = loadedClassifier;
  } else {
    if (err.code !== 'ENOENT') {
      console.log(`Error calling classifier : ${JSON.stringify(err, null, 2)}`);
    }
  }
});

const rottenParser = require('./modules/rottenParser');
// rottenParser.getMovieReview('Ex Machina').then(data => {
//   console.log(data.title, data.rating);
// });

const botTraining = require('./modules/nlp');
botTraining.botTraining(classifier);

const functions = require('./modules/functions');

// Settings object to be written in the settings file if it doesn't exist
let settings = settingsTemplate = {
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

const customize = (customizationData) => {
  // console.log(JSON.stringify(customizationData, null, 2));

  if (customizationData.backgroundImage !== null && customizationData.backgroundImage !== undefined) {
    if (!customizationData.backgroundImage.match(/^http/)) {

      const renamePicture = () => {
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

        io.emit('server settings updated', {
          backgroundImage: settings.backgroundImage
        });
      }

      if (settings.backgroundImage !== undefined) {
        fs.stat(settings.backgroundImage, (err, stats) => {
          if (!err) {
            // Remove the old wallpaper and rename the new
            fs.unlink(settings.backgroundImage, (err) => {
              if (!err || err.code === 'ENOENT') {
                renamePicture();
              } else {
                console.log(`Error deleting the previous background image : ${err}`);
              }
            });
          } else {
            renamePicture();
          }
        });
      } else {
        renamePicture();
      }
    } else {
      settings.backgroundImage = customizationData.backgroundImage;

      io.emit('server settings updated', {
        backgroundImage: settings.backgroundImage
      });
    }
  }
  console.log(settings.backgroundImage);

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
}

// Get current the logged in user name
let username = os.userInfo().username;

let replyID = 0;

// Define a counter to prevent multiple addings
let iAddElt = 0;

// Define the user request theme to avoid training the bot with unecessary data
// like city names or stupid stuff (msgTheme == 'function' in that case)
let msgTheme = 'none';

function Reply(content) {
  this.author = 'Ava';
  this.content = content;
  this.id = replyID;
  this.dateTime = new Date();
  this.theme = msgTheme;
  this.send = function() {
    return new Promise((fullfill, reject) => {
      io.emit('reply', this);
      replyID++;
      fullfill(this);
    });
  }
}

// Create an empty object to store the downloaded file properties
let downloadedFile = {
  path: '',
  name: ''
}

// Check if folders exist
functions.existPath('./upload/');
functions.existPath('./tmp/');
functions.existPath('./settings/');

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
functions.clearTemp();

// Create the settings file if it doesn't exist
functions.createSettingsFile(settingsPath, settingsTemplate);
const updateSettings = () => {
  // Update the settings variable with the new data
  settings = fs.readFileSync(settingsPath, 'utf-8');
  settings = JSON.parse(settings);
  JSON.stringify(settings, null, 2);
}

updateSettings();

// Repeat the process every 5 minutes
setInterval(() => {
  functions.createSettingsFile(settingsPath, settingsTemplate);
  updateSettings();
}, 300000);

app.get('/', (req, res) => {
    res.render('home.ejs');

    // Open only one socket connection to avoid memory leaks
    io.once('connection', io => {
      let elements = settings.elements;
      var eltsArray = [];
      if (settings.RSS === true) {
        io.emit('RSS status retrieved', settings.RSS);
        var bigI, i;

        let totalLength = 0;
        for (const [bigI, value] of elements.entries()) {
          var subElts = value.elements;
          totalLength += value.elements.length;

          for (const [i, subEltsValue] of subElts.entries()) {
            const sendData = () => {
              if (eltsArray.length === totalLength) {
                // Send data to the client
                console.log('server initiated parsing !');
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
      if (settings.backgroundImage !== undefined) {
        io.emit('wallpaper', settings.backgroundImage);
      }

      io.on('add content', feedData => {
        console.log('add content !');

        var elements = settings.elements;

        settings.RSS = true;

        let newElt = {};

        // Store the parent element number
        let iParent = Number(feedData.parent.match(/\d/)) - 1;

        const processData = (callback) => {
          if (feedData.type === 'rss') {
            request
              .get(feedData.url)
              .on('response', (res) => {
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

                      callback();
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
              .on('error', (err) => {
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

            callback();
          } else if (feedData.type === 'youtube search') {
            newElt.element = feedData.element;
            newElt.parent = feedData.parent;
            newElt.type = feedData.type;

            io.emit('parse content', [{
              type: 'youtube search',
              element: feedData.element,
              parent: feedData.parent,
            }]);

            callback();
          }
        }

        processData(() => {
          for (const [j, value] of elements.entries()) {
            if (newElt !== {}) {
              if (value.elements[0] !== undefined && value.elements[0].element !== undefined) {
                for (const [k, kValue] of value.elements.entries()) {
                  if (iAddElt === 0) {
                    if (kValue.element === feedData.element && kValue.parent === feedData.parent) {
                      console.log(k, 1);
                      value.elements.splice(k, 1, newElt);
                      iAddElt++;
                    } else if (kValue.element !== feedData.element && kValue.parent === feedData.parent) {
                      console.log(k, 2);
                      value.elements.push(newElt);
                      iAddElt++;
                    }
                  }
                }
              } else if (value.elements[0] === undefined && iParent === j) {
                console.log(3);
                // Append the new element to the "elements" settings array
                value.elements.push(newElt);
                iAddElt++;
              }
            }
          }

          fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8', () => {
            // Reset the addings counter
            iAddElt = 0;
          });
        });
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
            if (downloadLog !== null) {
              filename = downloadLog
                .match(/(tmp\\|tmp\/)\w.+(.mp3)/i)[0]
                .substring(4, 100);

              if (os.platform() === 'win32') {
                downloadedFile.path = `${__dirname}\\tmp\\${filename}`;
              } else if (os.platform() === 'linux') {
                downloadedFile.path = `${__dirname}tmp/${filename}`;
              }

              downloadedFile.name = filename;

              // Inform the client that the download ended
              io.emit('download ended', {
                title: downloadedFile.name
              });
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
        fs.readFile(settingsPath, 'utf-8', (err, data) => {
          try {
            let settings = JSON.parse(data);
            for (const i of settings.elements) {
              for (const j of i.elements) {
                // console.log(JSON.stringify(j, null, 2));
                let eltRegex = new RegExp(j.element, 'gi');
                let parentRegex = new RegExp(j.parent, 'gi');
                if (feed2update.element.match(eltRegex) && feed2update.parent.match(parentRegex)) {
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
              } else {
                console.log(result.error);
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

  .get('/chat', (req, res) => {
    res.render('chat.ejs', {
      botName: bot.name
    });

    io.once('connection', io => {
      let reply = '';
      let replyType = 'generic';

      let welcomeMsg = new Reply(`Hi ! I'm ${bot.name}, how can I help you ?`).send();

      io.on('chat msg', msg => {
        const getWeatherForecast = (msg) => {
          // Strip accents and diacritics
          let location = msg.normalize('NFD');
          let url = `https://api.openweathermap.org/data/2.5/find?q=${location}&units=metric&lang=en&appid=9b013a34970de2ddd85f46ea9185dbc5`;

          request(url, function(err, res, body) {
            if (!err) {
              let result = JSON.parse(body);
              let count = result.count;

              if (count !== 0) {
                let previsions = {
                  temp: result.list[0].main.temp,
                  city: result.list[0].name,
                  description: result.list[0].weather[0].description,
                  humidity: result.list[0].main.humidity,
                  windSpeed: result.list[0].wind.speed
                };

                replyType = 'generic';
                msgTheme = 'weather';

                return new Reply(`Currently in ${previsions.city}, the temperature is ${previsions.temp} C°, ${previsions.description}. ` +
                  `Humidity is about ${previsions.humidity}%, and the wind blows at ${previsions.windSpeed} km/h.`).send();

              } else {
                msgTheme = 'weather';
                return new Reply("Sorry, I can't find this place... Make sure of the location you have given me and retry...").send();
              }
            } else {
              console.log(`Error getting weather forecast : ${err}`);
            }

          });
        }

        const revertGreetings = (msg) => {
          if (msg.content.match(/(how are (you|u)|what's up)/gi)) {
            reply = `I'm fine. What about you ?`;
            replyType = 'news';
            msgTheme = 'news';
          } else {
            reply = `Hey ${msg.author} ! What can I do for you ?`;
            msgTheme = 'greetings';
          }
        }

        const searchWiki = (args, msg) => {
          request(`https://en.wikipedia.org/api/rest_v1/page/summary/${args.join('_')}?redirect=true`, (err, res, body) => {
            if (!err) {
              let res = JSON.parse(body);
              replyType = 'generic';

              let reply = `According to Wikipedia, <i>${res.extract}</i>`;

              // Check if the API entry exists
              if (res.title !== 'Not found.') {
                if (res.type === 'disambiguation') {
                  reply += `<br>A disambiguation page is available here : <a href="${res.content_urls.desktop.page}">${res.title}</a>`;
                } else {
                  reply += `<br>More info : <a href="${res.content_urls.desktop.page}">${res.title}</a>`;
                }

                // Modify the message theme to create the embed
                msgTheme = 'wiki';
                reply.theme = 'wiki';
                return new Reply(reply).send();
              } else {
                return new Reply(`Sorry ${msg.author}, Wikipedia does not have any entry for this...`).send();
              }
            } else {
              replyType = 'generic';
              console.log(`Error parsing Wikipedia API : ${err}`);
              return new Reply(`Sorry, ${msg.author}, I was unable to complete your request. Please check the logs for details.`).send();
            }
          });
        }

        console.log(classifier.getClassifications(msg.content));

        if (replyType === 'generic') {
          if (classifier.getClassifications(msg.content)[0].value > 0.5) {
            if (classifier.classify(msg.content) === 'greetings') {
              revertGreetings(msg);
            } else if (classifier.classify(msg.content) === 'weather') {
              reply = `Which city do you want to get the forecast for ?`;
              replyType = 'forecast';
              msgTheme = 'weather';
            } else if (classifier.classify(msg.content) === 'news') {
              revertGreetings(msg);
            } else if (classifier.classify(msg.content) === 'activity') {
              reply = `I'm just talking to you ${msg.author}.`;
              msgTheme = 'activity';
            } else if (classifier.classify(msg.content) === 'love') {
              reply = `Sorry ${msg.author}, I don't think human and robots can love each other...`;
              msgTheme = 'love';
            } else if (classifier.classify(msg.content) === 'gross') {
              reply = `Don't be so gross ${msg.author} !`;
              msgTheme = 'gross';
            } else if (classifier.classify(msg.content) === 'insults') {
              reply = `Didn't you Mother teach you politeness ?`;
              msgTheme = 'insults';
            } else if (classifier.classify(msg.content) === 'thanks') {
              reply = `You're welcome ${msg.author} !`;
              msgTheme = 'thanks';
            } else if (classifier.classify(msg.content) === 'joke') {
              reply = `I don't have any jokes for now...`;
              msgTheme = 'joke';
            } else if (classifier.classify(msg.content) === 'wiki') {
              let args = msg.content.split(' ');
              msgTheme = 'wiki';

              if (msg.content.match(/^define/i)) {
                args.shift();
                searchWiki(args, msg);
              } else if (msg.content.match(/^search for/i)) {
                args.splice(0, 2);
                searchWiki(args, msg);
              } else {
                reply = `Sorry ${msg.author}, I couldn't understand... What are you searching for ?`;
                replyType = 'wiki';
              }
            }
          } else if (classifier.getClassifications(msg.content)[0].value === 0.5) {
            reply = `Sorry, I didn't understand you because I'm not clever enough for now...`;
          }
        } else {
          msgTheme = 'function';

          if (replyType === 'forecast') {
            reply = getWeatherForecast(msg.content);
          } else if (replyType === 'news') {
            replyType = 'generic';
            msgTheme = 'news';

            let answers = [
              'Nice to hear !',
              'Great !'
            ];

            reply = answers[Math.floor(Math.random() * answers.length)];
          } else if (replyType === 'wiki') {
            let args = msg.content.split(' ');

            searchWiki(args, msg);
          }
        }

        // Check if the reply is not empty before sending it
        if (reply !== '') {
          // Send the reply if it is not part of a function
          if (msgTheme !== 'function') {
            let answer = new Reply(reply).send();

            let content = tokenizer.tokenize(msg.content);

            // Add the last user message to classifier and train the bot with it
            if (classifier.getClassifications(msg.content)[0].value !== 'none') {
              classifier.addDocument(content, msgTheme);
              classifier.train();

              // Save the classifier for further usage
              classifier.save('classifier.json', function(err, classifier) {
                if (err) {
                  console.log(`Error saving changes to the classifier : ${err}`);
                }
              });
            } else {
              console.log('not classified');
            }
          }
        }
      });
    })
  })

  // Prompt the user to download the file
  .get('/download', (req, res) => {
    if (downloadedFile.path !== null) {
      res.download(downloadedFile.path, downloadedFile.name, (err) => {
        if (err) {
          console.log(`Error downloading file : ${JSON.stringify(err, null, 2)}`);
          io.emit('errorMsg', {
            type: 'generic',
            msg: 'An error occurred while downloading... Check the logs for details.'
          })
        }
      });
    } else {
      io.emit('errorMsg', {
        type: 'generic',
        msg: 'Sorry, the filename couln\'t be retrieved...'
      })
    }
  })

  .post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (req.file !== undefined) {
        let data = {
          backgroundImage: `${req.file.destination}/${req.file.filename}`
        };

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

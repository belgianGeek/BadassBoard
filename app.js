const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const express = require('express');
const app = express();
const feedparser = require("feedparser-promised");
const ip = require('ip');
const {
  execFile
} = require('child_process');
const os = require('os');
const path = require('path');
const process = require('process');
const axios = require('axios');

const server = require('http').Server(app).listen(8080);
const io = require('socket.io')(server);
const compression = require('compression');

const settingsPath = './settings/settings.json';

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
const badassUpdate = require('./modules/update');

const botTraining = require('./modules/nlp');
botTraining.botTraining(classifier, tokenizer);

const functions = require('./modules/functions');

// Settings object to be written in the settings file if it doesn't exist
let settings = settingsTemplate = {
  "backgroundImage": "./src/scss/wallpaper.jpg",
  "bot": {
    "name": "BadassBot",
    "icon": "./src/scss/icons/interface/bot.png"
  },
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
  "RSS": true,
  "searchEngine": {
    "label": "DuckDuckGo",
    "url": "https://duckduckgo.com/?q="
  }
}

const tag = '0.3.0';

const deleteNotProcessedFile = filename => fs.remove(path.join(__dirname, filename));

const customize = (io, customizationData) => {
  const handlePicture = type => {
    if (type === 'avatar') {
      if (settings.bot.icon !== undefined) {
        customizationData.bot.icon = customizationData.bot.icon.split(';base64,').pop();

        let filename = `./upload/avatar-${Date.now()}.png`;
        fs.writeFile(filename, customizationData.bot.icon, {
          encoding: 'base64'
        }, err => {
          if (err) {
            console.error(`An error occurred while saving the new avatar : ${err}`);
          } else {
            if (settings.bot.icon !== './src/scss/icons/interface/bot.png') {
              deleteNotProcessedFile(settings.bot.icon);
            }

            settings.bot.icon = filename;
            io.emit('bot avatar', filename);
          }
        });
      }
    } else {
      customizationData.backgroundImage = customizationData.backgroundImage.split(';base64,').pop();

      let filename = `./upload/wallpaper-${Date.now()}.jpg`;
      fs.writeFile(filename, customizationData.backgroundImage, {
        encoding: 'base64'
      }, err => {
        if (err) {
          console.error(`An error occurred while saving the new wallpaper : ${err}`);
        } else {
          if (settings.backgroundImage !== './src/scss/wallpaper.jpg') {
            deleteNotProcessedFile(settings.backgroundImage);
          }

          settings.backgroundImage = filename;
          io.emit('wallpaper', filename);
        }
      });
    }
  }


  if (customizationData.backgroundImage !== null && customizationData.backgroundImage !== undefined) {
    handlePicture('wallpaper');
  }

  if (customizationData.bot !== null && customizationData.bot !== undefined) {
    if (customizationData.bot.icon !== undefined) {
      handlePicture('avatar');

      let answers = [
        `Whoa, that's much better !`,
        'I like this new look ! 😎'
      ];

      new Reply(answers.random()).send();
    }

    if (customizationData.bot.name !== undefined) {
      settings.bot.name = customizationData.bot.name;
    }
  }

  if (customizationData.RSS !== null && customizationData.RSS !== undefined) {
    settings.RSS = customizationData.RSS;
  }

  if (customizationData.owmToken !== null && customizationData.owmToken !== undefined) {
    settings.owmToken = customizationData.owmToken;
  }

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
  this.author = settings.bot.name;
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
  .use((req, res, next) => {
    // Set some security headers
    res.setHeader('X-XSS-Protection', '1;mode=block')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('Feature-Policy', "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none';  picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vr 'none';")
    return next();
  })
  // Send compressed assets
  .use(compression());

// Cache views
app.set('view cache', true);

if (!ip.address().match(/169.254/) || !ip.address().match(/127.0/)) {
  console.log(`Hey ${username} ! You can connect to the web interface with your local IP (http://${ip.address()}:8080) or hostname (http://${os.hostname()}:8080).`);
} else {
  console.log(`Sorry Dude, I won't work properly if I don't have access to the Internet. Please fix your connection and try again.`);
}

// Clear the temp folder every 15 minutes
functions.clearTemp();

// Create the settings file if it doesn't exist...
functions.createSettingsFile(settingsPath, settingsTemplate);
const updateSettings = () => {
  // Update the settings variable with the new data
  settings = fs.readFileSync(settingsPath, 'utf-8');
  settings = JSON.parse(settings);

  // Sort settings elements by element to avoid frontend bugs while adding new content
  settings.elements.forEach((item, i) => {
    item.elements.sort((a, b) => {
      if (a.element < b.element) {
        return -1;
      } else if (a.element > b.element) {
        return 1;
      }
    });
  });
}

setTimeout(() => {
  updateSettings();
}, 1000);

// ... and repeat the process every 5 minutes
setInterval(() => {
  functions.createSettingsFile(settingsPath, settingsTemplate);

  // Write changes to the settings file after each update
  functions.updateSettingsFile(settingsPath, settings, () => {
    updateSettings();
  });
}, 300000);

functions.updatePrototypes();

app.get('/', (req, res) => {
    res.render('home.ejs', {
      currentVersion: tag,
      isHomepage: true
    });

    // Open only one socket connection to avoid memory leaks
    io.once('connection', io => {
      let elements = settings.elements;
      var eltsArray = [];

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
      if (settings.backgroundImage !== './src/scss/wallpaper.jpg') {
        io.emit('wallpaper', settings.backgroundImage);
      }

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
        customize(io, customizationData);
        io.emit('customization data retrieved');
      });

      io.on('download', (id) => {
        let options = [
          '-x',
          '--audio-format',
          'mp3',
          '-o',
          './tmp/%(title)s.%(ext)s',
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
            console.log(downloadLog);
            if (downloadLog !== null) {
              filename = downloadLog
                .match(/(tmp\\|tmp\/).*(.mp3)/i)[0]
                .substring(4, 100);

              downloadedFile.path = `${path.join(__dirname + '/tmp/' + filename)}`;

              downloadedFile.name = filename;

              // Wait one second to be sure the file processing ended
              // Inform the client that the download ended
              setTimeout(() => {
                io.emit('download ended', {
                  title: downloadedFile.name
                });
              }, 60000);
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
        for (const i of settings.elements) {
          for (const j of i.elements) {
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
      });

      io.on('parse playlist', (playlistUrl) => {
        axios({
            url: playlistUrl,
            method: 'GET'
          })
          .then(res => {
            try {
              let result = JSON.parse(res.data);

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
          })
          .catch(err => {
            if (err === 'socket hang up') {
              console.log('The websocket died... :(');
            } else {
              io.emit('errorMsg', {
                type: 'generic',
                msg: `Sorry, the audio stream failed to load due to a server error... Try maybe later.`
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
        badassUpdate(io, tag);
      });
    });
  })

  .get('/chat', (req, res) => {
    // Define emoijis
    let emoijis = {
      devil: '😈',
      expressionless: '😑',
      innocent: '😇',
      laugh: '😂',
      sad: '😭',
      smile: '😃',
      sunglasses: '😎',
      wink: '😉'
    }

    res.render('chat.ejs', {
      botName: settings.bot.name,
      botIcon: settings.bot.icon,
      currentVersion: tag,
      isHomepage: false,
      wallpaper: settings.backgroundImage
    });

    io.once('connection', io => {
      let reply = '';

      // Do not send the default wallpaper
      if (settings.backgroundImage !== './src/scss/wallpaper.jpg') {
        io.emit('wallpaper', settings.backgroundImage);
      }

      if (settings.bot !== undefined) {
        if (settings.bot.icon !== undefined && settings.bot.icon !== './src/scss/icons/interface/bot.png') {
          io.emit('bot avatar', settings.bot.icon);
        }
      }

      // Send the username to the frontend
      io.emit('username', username.capitalize());

      let welcomeMsg = new Reply(`Hi ! I'm ${settings.bot.name}, how can I help you ?`).send();

      io.on('chat msg', msg => {
        const tokenize = (msg) => {
          return classifier.getClassifications(tokenizer.tokenize(msg.toLowerCase()));
        }

        const getWeatherForecast = (msg) => {
          // Strip accents and diacritics
          let location = msg.normalize('NFD');
          let url = `https://api.openweathermap.org/data/2.5/find?q=${location}&units=metric&lang=en&appid=9b013a34970de2ddd85f46ea9185dbc5`;

          axios({
              url: url,
              method: 'GET'
            })
            .then(res => {
              let result = JSON.parse(res.data);
              let count = result.count;

              if (count !== 0) {
                let previsions = {
                  temp: result.list[0].main.temp,
                  city: result.list[0].name,
                  description: result.list[0].weather[0].description,
                  humidity: result.list[0].main.humidity,
                  windSpeed: result.list[0].wind.speed
                };

                msgTheme = 'weather';

                return new Reply(`Currently in ${previsions.city}, the temperature is ${previsions.temp} C°, ${previsions.description}. ` +
                  `Humidity is about ${previsions.humidity}%, and the wind blows at ${previsions.windSpeed} km/h.`).send();
              } else {
                msgTheme = 'weather';
                return new Reply("Sorry, I can't find this place... Make sure of the location you have given me and retry...").send();
              }
            })
            .catch(err => {
              console.log(`Error getting weather forecast : ${err}`);
            });
        }

        const revertGreetings = (msg) => {
          if (msg.content.match(/(how are (you|u)|what's up)/gi)) {
            reply = `I'm fine. What about you ?`;
            msgTheme = 'news';

            io.on('chat msg', msg => {
              msgTheme = 'news';

              let answers = [
                'Nice to hear !',
                'Great !'
              ];

              reply = answers.random();
            });
          } else {
            reply = `Hey ${msg.author} ! What can I do for you ?`;
            msgTheme = 'greetings';

            io.on('chat msg', msg => {
              if (msg.content.match(/nothing/i)) {
                reply = new Reply('Ok then, I\'ll leave you alone.').send();
              }
            });
          }
        }

        const searchWiki = (args, msg) => {
          return new Promise((fullfill, reject) => {
            axios({
                url: `https://en.wikipedia.org/api/rest_v1/page/summary/${args.join('_')}?redirect=true`,
                method: 'GET'
              })
              .then(res => {
                const body = res.data;

                // Check if the API entry exists
                if (!body.title.match(/not found/gi)) {
                  let reply = {
                    icon: './src/scss/icons/suggestions/wikipedia.ico',
                    title: body.title,
                    url: body.content_urls.desktop.page,
                    color: 'white',
                    description: `<p>According to Wikipedia,</p> <article><i>${body.extract}</i></article>`
                  };

                  if (body.type === 'disambiguation') {
                    reply.description += `<p>A disambiguation page is available here : <a href="${reply.url}">${body.title}</a></p>`;
                  } else {
                    reply.description += `<p>More info : <a href="${reply.url}">${body.title}</a></p>`;
                  }

                  if (body.thumbnail !== undefined) {
                    reply.img = body.thumbnail.source;
                  }

                  // Modify the message theme to create the embed
                  msgTheme = 'wiki';
                  reply.theme = 'wiki';

                  fullfill(reply);
                } else {
                  reject(`Sorry ${msg.author}, Wikipedia does not have any entry for this...`);
                }
              })
              .catch(err => {
                console.log(`Error parsing Wikipedia API : ${err}`);
                reject(`Sorry, ${msg.author}, I was unable to complete your request. Please check the logs for details.`);
              });
          });
        }

        const wikiResponse = (args, msg) => {
          searchWiki(args, msg)
            .then(res => {
              new Reply(res).send();
            })
            .catch(err => {
              new Reply(err).send();
            })
        }

        if (tokenize(msg.content)[0].value > 0.5) {
          if (classifier.classify(msg.content) === 'greetings') {
            revertGreetings(msg);
          } else if (classifier.classify(msg.content) === 'weather') {
            reply = `Which city do you want to get the forecast for ?`;
            msgTheme = 'weather';

            io.on('chat msg', msg => {
              reply = getWeatherForecast(msg.content);
              return;
            });
          } else if (classifier.classify(msg.content) === 'news') {
            revertGreetings(msg);
          } else if (classifier.classify(msg.content) === 'activity') {
            reply = `I'm just talking to you ${msg.author}.`;
            msgTheme = 'activity';
          } else if (classifier.classify(msg.content) === 'love') {
            let answers = [
              `Sorry ${msg.author}, I don't think human and robots can love each other...`,
              `Welcome to the Friendzone dude !`,
              `Forgive me but I can't express any feelings`
            ];

            reply = answers.random();
            msgTheme = 'love';
          } else if (classifier.classify(msg.content) === 'gross') {
            let answers = [
              `Don't be so gross ${msg.author} !`,
              `I'm not equiped for that kind of... activity, sorry.`,
              `What if I told you to go fuck yourself ${msg.author} ?`,
            ];

            reply = answers.random();
            msgTheme = 'gross';
          } else if (classifier.classify(msg.content) === 'insults') {
            let answers = [
              `Didn't you Mother teach you politeness ?`,
              `So you think you're better than me ? Interesting...`
            ];

            reply = answers.random();
            msgTheme = 'insults';
          } else if (classifier.classify(msg.content) === 'thanks') {
            let answers = [
              `You're welcome ${msg.author} !`,
              `Glad I could help you !`,
              `Now you owe me one ${emoijis.innocent}`,
            ];

            reply = answers.random();
            msgTheme = 'thanks';
          } else if (classifier.classify(msg.content) === 'joke') {
            reply = `I don't have any jokes for now...`;
            msgTheme = 'joke';
          } else if (classifier.classify(msg.content) === 'wiki') {
            let args = msg.content.split(' ');
            msgTheme = 'wiki';

            if (msg.content.match(/^define/i)) {
              args.shift();
              wikiResponse(args, msg);
            } else if (msg.content.match(/^search for/i)) {
              args.splice(0, 2);
              wikiResponse(args, msg);
            } else {
              reply = `Sorry ${msg.author}, I couldn't understand... What are you searching for ?`;

              io.on('chat msg', msg => {
                let args = msg.content.split(' ');
                wikiResponse(args, msg);
              });
            }
          } else if (classifier.classify(msg.content) === 'movie review') {
            let answers = [
              `Which movie do you want a review for ?`,
              `Which movie are you interested in ?`
            ];

            reply = answers.random();

            io.on('chat msg', msg => {
              let args = msg.content.split(' ');

              rottenParser.getMovieReview(msg.content)
                .then(movieData => {

                  let reply = {
                    title: movieData.title,
                    img: movieData.poster,
                    url: movieData.url,
                    description: `<u>Synopsis</u> : ${movieData.synopsis}`,
                    fields: [
                      `<u>Rating</u> : ${movieData.rating}`,
                      `<u>Critics consensus</u> : ${movieData.consensus}`
                    ]
                  };

                  if (!movieData.rating.match(/No rating found/i)) {
                    if (movieData.rating > '80%') {
                      reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/cf-lg.3c29eff04f2.png';
                      reply.color = 'gold';
                    } else if (movieData.rating > '50%' && movieData.rating < '80%') {
                      reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/new-fresh-lg.12e316e31d2.png';
                      reply.color = 'red';
                    } else {
                      reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/new-rotten-lg.ecdfcf9596f.png';
                      reply.color = 'green';
                    }
                  } else {
                    reply.icon = 'https://www.rottentomatoes.com/assets/pizza-pie/images/icons/global/new-fresh-lg.12e316e31d2.png';
                    reply.color = 'red';
                  }


                  msgTheme = 'movie review';

                  new Reply(reply).send();
                })
                .catch((err) => {
                  console.log(err);
                  let link = `https://www.rottentomatoes.com/search/?search=${args.join(' ')}`;
                  let linkTag = `<a class="embed__link" href="${link}">${link}</a>`;

                  new Reply(
                    `Sorry, I couldn't get this movie review... ${emoijis.expressionless} \n` +
                    `Please try again using another keywords or go to this results page : ${linkTag}`
                  ).send();
                });
            });
          }
        } else if (tokenize(msg.content)[0].value === 0.5) {
          reply = `Sorry, I didn't understand you because I'm not clever enough for now...`;
        }

        // Check if the reply is not empty before sending it
        if (reply !== '') {
          let answer = new Reply(reply).send();

          let content = tokenizer.tokenize(msg.content);

          // Add the last user message to classifier and train the bot with it
          if (tokenize(msg.content)[0].value !== 'none') {
            classifier.addDocument(content, msgTheme);
            classifier.train();

            // Save the classifier for further usage
            classifier.save('classifier.json', function(err, classifier) {
              if (err) {
                console.log(`Error saving changes to the classifier : ${err}`);
              }
            });
          } else {
            console.log(`The message "${msg.content}" was not classified because it didn't have a valid class...`);
          }
        }
      });

      io.on('customization', customizationData => {
        customize(io, customizationData);
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

  // 404 errors handling
  .use((req, res, next) => {
    res.status(404).render('404.ejs', {
      wallpaper: settings.backgroundImage
    });
  });

process.on('SIGINT, SIGKILL, SIGTERM', () => {
  let exitMsg = [
    `Shutdown signal received, over.`,
    `Bye !`,
    `See you ${username} !`,
    `Later dude !`
  ];

  // Write changes to the settings file before exiting the process
  functions.updateSettingsFile(settingsPath, settings, () => {
    console.log(`\n${exitMsg.random()}`);
    process.exit(0);
  });
});

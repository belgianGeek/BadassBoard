const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const express = require('express');
const app = express();
const ip = require('ip');
const os = require('os');
const process = require('process');
const cors = require('cors');

const corsOptions = {
  maxAge: 3600,
  origin: [
    /localhost$/,
    '192.168.1.*',
    '*'
  ],
  optionsSuccessStatus: 200
}

app.listen(3000);
// const io = require('socket.io')(server);
const compression = require('compression');

let username = os.userInfo().username;
const settingsPath = './settings/settings.json';

const functions = require('./modules/functions');

// Create an empty object to store downloaded files properties
app.downloadedFile = {
  path: '',
  name: ''
}

app.tag = '0.4.4';

// Check if folders exist
functions.existPath('./upload/');
functions.existPath('./tmp/');
functions.existPath('./settings/');

// Settings object to be written in the settings file if it doesn't exist
let settings = settingsTemplate = {
  "backgroundImage": "./client/scss/wallpaper.jpg",
  "bot": {
    "name": "BadassBot",
    "icon": "./client/scss/icons/interface/bot.png"
  },
  "elements": [],
  "owmToken": "9b013a34970de2ddd85f46ea9185dbc5",
  "RSS": true,
  "searchEngine": {
    "label": "DuckDuckGo",
    "url": "https://duckduckgo.com/?q="
  }
}

// Create the settings file if it doesn't exist...
functions.createSettingsFile(settingsPath, settingsTemplate);
const updateSettings = () => {
  // Update the settings variable with the new data
  settings = fs.readFileSync(settingsPath, 'utf-8');
  settings = JSON.parse(settings);

  // Sort settings elements by element to avoid frontend bugs while adding new content
  // settings.elements.forEach((item, i) => {
  //   item.sort((a, b) => {
  //     if (a.element < b.element) {
  //       return -1;
  //     } else if (a.element > b.element) {
  //       return 1;
  //     }
  //   });
  // });
}

// ... and repeat the process every 5 minutes
// setInterval(() => {
//   functions.createSettingsFile(settingsPath, settingsTemplate);
//
//   // Write changes to the settings file after each update
//   functions.updateSettingsFile(settingsPath, settings, () => {
    updateSettings();
//   });
// }, 1000 * 20);

app.use("/client", express.static(__dirname + "/client"))
  .use("/upload", express.static(__dirname + "/upload"))
  .use("/settings", express.static(__dirname + "/settings"))
  .use("/tmp", express.static(__dirname + "/tmp"))
  .use((req, res, next) => {
    // Set some security headers
    res.setHeader('X-XSS-Protection', '1;mode=block')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Feature-Policy', "accelerometer 'none'; ambient-light-sensor 'none'; autoplay 'none'; camera 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none';  picture-in-picture 'none'; speaker 'none'; sync-xhr 'none'; usb 'none'; vr 'none';")
    return next();
  })
  // Send compressed assets
  .use(compression())
  .use(express.json())
  .use(cors(corsOptions));

// Cache views
app.set('view cache', true);

if (!ip.address().match(/169.254/) || !ip.address().match(/127.0/)) {
  console.log(`Hey ${username} ! You can connect to the web interface with your local IP (http://${ip.address()}:8080) or hostname (http://${os.hostname()}:8080).`);
} else {
  console.log(`Sorry Dude, I won't work properly if I don't have access to the Internet. Please fix your connection and try again.`);
}

updateSettings();

// App routes
// require('./routes/chat')(app, io, settings);
// require('./routes/download')(app, io);
require('./routes/content')(app);
require('./routes/contentLength')(app);
require('./routes/updateContent')(app, settings);
// require('./routes/home')(app, io, settings);

// 404 error handling
require('./routes/404')(app, settings);

// Clear the temp folder every 15 minutes
functions.clearTemp();

functions.updatePrototypes();

process.on('SIGINT, SIGKILL, SIGTERM', () => {
  let exitMsg = [
    `Shutdown signal received, over.`,
    `Bye !`,
    `See you ${username} !`,
    `Later dude !`
  ];

  // Write changes to the settings file before exiting the process
  // functions.updateSettingsFile(settingsPath, settings, () => {
    console.log(`\n${exitMsg.random()}`);
    process.exit(0);
  // });
});

module.exports = app;

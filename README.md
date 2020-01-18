#  ̿̿ ̿̿ ̿'̿'\̵͇̿̿\з= ( ▀ ͜͞ʖ▀) =ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿

# What is _BadassBoard_ ?

This project intent to be an open source, self-hosted replacement for services like _start.me_.

Please not that this a project intented for me to LEARN. So do not exepect a beautifully amazing state-of-the-art stuff :innocent: . This might contains bugs or missing features you would LOVE to use. You're in that case ? Well, the deal is really simple : open a GitHub issue or email me :wink: .

Its features includes :

- RSS reader ;
- Weather forecast (thanks to the _OpenWeatherMap_ API) => you'll need a token to use this thing ;
- Web shortcuts to several websites (based on the DuckDuckGo _Bangs_ system) ;
- Audio streaming from YouTube thanks to the _Invidio.us_ API (playlist and videos are both supported) ;
- IT units converter (only from bytes to terabytes for now) ;
- Instant Youtube Search ;

All of that available through a (nice ?) and customizable UI.

**NB: This is still in beta stage, so please be patient and indulgent :grin:**

# Installation

You must have [Node.js](http://nodejs.org) installed on your system. If this is not the case, please follow this link : https://nodejs.org/en/download/.

Then, you can clone this repo or download the files using the download button in upper right corner of the main page, or by downloading the `.zip` file in the releases tab.

Once Node.js is installed, open a terminal/console in the project's root directory on your computer and install the dependencies by running the command `npm install` or `yarn install`.

:point_right: **Please note that this last step won't work if you do not have Node.js installed**.

# How to use it ?

First, make sure you are in the project's root directory. Then, you can launch the app by running the command `node run start` or `yarn start` in your console.

If you are connected to the Internet, you should get a nice message in your console, saying that you can connect to the app by typing `http://<your_IP>:8080` or `http://<your_hostname>:8080`in your web browser.

# A few notes about the features

## Using the search field

By default, you can search the web thanks to the _DuckDuckGo_ search engine, but you can choose another one from the settings panel.

AND you can use a few web shortcuts (or _Webcuts_) to get instant results in your browser from sites like _Amazon_, _Wikipedia_, _Google_, _How-to Geek_... Interested ? Just type `!<Webcut> <your search term(s)` in the search field, and you are good to go !

This search field can also be used to download audio files (`!d <YouTube URL>`) or to listen to some music (`!p <YouTube URL or ID>`). All that stuff in one place, nice uh ? :wink:

## Downloading audio files

As mentioned above, you can download audio streams from YouTube. There is two ways to do that :

- <u>The default way</u> : the audio stream will be read and written in a `.mp3` file. It works, but might take a lot of time to complete and generate some errors.

- <u>The most efficient way</u> : you can use the most recent version of _[Youtube-dl](https://github.com/ytdl-org/youtube-dl/)_. It is way faster and will provide you audio files with some metadata.

**Windows users please put the Youtube-dl executable into the project's directory**
**Linux users please put Youtube-dl into the /usr/bin folder**

## Weather forecast

_BadassBoard_ can provide you weather forecast thanks to the _OpenWeatherMap_ API. In order to use this feature, you'll need an _OpenWeatherMap_ token. As there is already one provided, you can use it as it is. But, if you want, you can use your own. More info [here](https://openweathermap.org/api).

## Audio streaming

As mentioned above, you can stream YouTube videos or playlists (thanks to the _Invidio.us_ API). Because _Invidio.us_ is becoming more and more popular, you might encounter some issues while using this feature. In this case, a message will inform you that your request couldn't be completed. If you're facing it, I invite you to open an issue with the more details that you can provide. But keep in mind that this might be related to _Invidio.us_ itself, as the audio streaming feature is based on it.

# Contributing

You found a bug or just have a suggestion ? Feel free to create an issue with the more details that you can provide (error code, context, etc.).

If you want to improve the app, you can create a pull request or a fork as well.

## Development notes

Here are a few notes if you want to modify this project :

To make development easier, the client-side JS code is minified using the _Minify_ package and the _minify.js_ script.

The CSS code is generated with the help of the SCSS package.

Please note that these packages need to be installed globally on your system to function properly. In order to do that, just type `npm i -g <package name>` or `yarn global add <package name>` in your terminal.

Like mentioned in the `package.json` file, the CSS code can be compiled with the `sass` command, and the JS code can be minified by running `node minify`.

# Libraries used

A special thank to the maintainers and creators of :

- [Express](https://github.com/expressjs/express) and [Multer](https://github.com/expressjs/multer) ;
- [Socket.io](https://socket.io) ;
- [Ytdl-core](https://github.com/fent/node-ytdl-core) ;
- [Feedparser-promised](https://github.com/alabeduarte/feedparser-promised) ;
- [Request](https://github.com/request/request) ;
- [IP](https://github.com/indutny/node-ip) ;
- [opusscript](https://github.com/abalabahaha/opusscript) ;
- [SCSS](https://yarnpkg.com/en/package/scss) ;
- [Minify](https://github.com/coderaiser/minify) ;

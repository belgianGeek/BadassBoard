#  ̿̿ ̿̿ ̿'̿'\̵͇̿̿\з= ( ▀ ͜͞ʖ▀) =ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿

# What is _BadassBoard_ ?

This project intent to be an open source, self-hosted replacement for services like _start.me_.

Its features includes :

- RSS reader ;
- Weather forecast (thanks to the _OpenWeatherMap_ API) => you'll need a token to use this thing ;
- Web shorcuts to several websites (based on the DuckduckGo _Bangs_ system) ;
- Audio streaming from YouTube thanks to the _Invidio.us_ API (playlist and videos are both supported) ;

All of that available through a (nice ?) and customizable UI.

**NB: This is still in beta stage, so please be patient and indulgent :grin:**

# Installation

You must have [Node.js](http://nodejs.org) installed on your system.

Then, you can clone this repo or download the files using the download button in upper right corner of the main page, or by downloading the `.zip` file in the releases tab.

Then, open a terminal/console in the project's root directory on your computer and install the dependencies by running the command `npm install` or `yarn install`.

# How to use it ?

First, make sure you are in the project's root directory. Then, you can launch the app by running the command `node run start` or `yarn start` in your console.

If you are connected to the Internet, you should get a nice message in your console, saying that you can connect to the app by typing `http://<your_IP>:8080` in your web browser.

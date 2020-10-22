const fs = require('fs-extra');
const path = require('path');
const Reply = require('./reply');

module.exports = function(io, settings, customizationData) {
  const deleteNotProcessedFile = filename => fs.remove(path.join(__dirname, filename));
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

      new Reply(answers.random(), io, settings).send();
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

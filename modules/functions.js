const fs = require('fs-extra');

module.exports = {
  existPath: (path, data, callback) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        if (path.match(/\.\/\w.+\/$/)) {
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
  },
  createSettingsFile: (settingsPath, settingsTemplate) => {
    fs.stat(settingsPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          fs.writeFile(settingsPath, JSON.stringify(settingsTemplate, null, 2), 'utf-8', (err) => {
            if (err) {
              console.log(`Error creating the settings file : ${err}`);
            }
          });
        } else {
          console.log(`Error retrieving settings : ${err}`);
        }
      }
    });
  },
  clearTemp: () => {
    setInterval(() => {
      fs.readdir('./tmp', (err, files) => {
        if (!err) {
          for (const file of files) {
            fs.remove(`./tmp/${file}`, (err) => {
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
  },
  updatePrototypes: () => {
    // Add a function to the Array prototype and get random elements
    Array.prototype.random = function() {
      return this[Math.floor((Math.random() * this.length))];
    }

    // To make the first letter of a string uppercase
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }
  },
  updateSettingsFile: (settingsPath, updatedSettings, callback) => {
    for (const [bigI, value] of updatedSettings.elements.entries()) {
      var subElts = value.elements;

      for (const [i, subEltsValue] of subElts.entries()) {
        if (subEltsValue.type === 'rss') {
          delete subEltsValue.feed;
          updatedSettings.elements[bigI].elements = subElts;

          if (bigI === updatedSettings.elements.length - 1 && i === subElts.length - 1) {
            fs.writeFile(settingsPath, JSON.stringify(updatedSettings, null, 2), 'utf-8', (err, data) => {
              if (err) {
                console.log(`Error saving settings : ${err}`);
              } else {
                console.log('Settings successfully saved !');
                if (callback !== undefined) {
                  callback();
                }
              }
            });
          }
        }
      }
    }
  }
}

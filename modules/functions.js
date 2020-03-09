const fs = require('fs');

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
  },
  updateSettingsFile: (settingsPath, updatedSettings, callback) => {
    for (const [i, elt] of updatedSettings.elements.entries()) {
      for (const [j, value] of elt.elements.entries()) {
        delete value.feed;

        if (i === updatedSettings.elements.length - 1 && j === elt.elements.length - 1) {
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

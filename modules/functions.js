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
  }
}
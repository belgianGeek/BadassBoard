const backupSettings = (settings) => {
  fs.writeFile('./settings/settings.json.bak', JSON.stringify(settings, null, 2), (err) => {
    if (err) throw err;
  });
}

fs.readFile(settingsPath, 'utf-8', (err, data) => {
  if (err) throw err;
  let settings;
  if (data !== undefined) {
    try {
      settings = JSON.parse(data);
    } catch (err) {
      // If parsing fail, restore the backup
      console.log(`Error parsing settings !`);
      fs.copyFile('./settings/settings.json.bak', settingsPath, (err) => {
        if (err) {
          if (err.code === 'EBUSY') {
            io.emit('refresh app');
            console.log(err);
          } else {
            console.log(`Error copying the settings file :\n${err}`);
          }
        } else {
          console.log(`Settings file successfully restored !`);
        }
      });
    }
  }
});

// Backup the new config
backupSettings(settings);

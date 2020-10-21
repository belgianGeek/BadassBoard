module.exports = function(app, io) {
  // Prompt the user to download the file
  app.get('/download', (req, res) => {
    if (app.downloadedFile.path !== null) {
      res.download(app.downloadedFile.path, app.downloadedFile.name, (err) => {
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
  });
}

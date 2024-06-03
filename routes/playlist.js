const axios = require('axios');

module.exports = function(app) {
  app.post('/api/playlist', async (req, res) => {
    if (res.data.error === undefined) {
      fs.writeFile(path.join(__dirname, '../tmp', 'playlist.json'), JSON.stringify(res.data, null, 2), 'utf-8', (err) => {
        if (err) throw err;

        res.send({
          success: true
        });
      });
    } else if (res.data.error !== undefined && res.data.error === 'Playlist is empty') {
      res.send({
        success: false
      })
    } else {
      console.log(res.data.error);
    }
  });
}

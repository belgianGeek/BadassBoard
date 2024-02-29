const axios = require('axios');

module.exports = function(app) {
  app.post('/api/ytsearch', async (req, res) => {
    let data = await axios.get(`${req.body.invidiousInstance}/api/v1/search?q=${req.body.query}&language=json&type=all`);
    res.send(data.data);
  });
}

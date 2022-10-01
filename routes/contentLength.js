const fs = require('fs');

module.exports = function(app) {
  app.get('/api/contentlength', async (req, res) => {
    let data = await fs.readFileSync('./settings/settings.json');
    data = JSON.parse(data);

    res.send(String(data.elements.length));
  });
}

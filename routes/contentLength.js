const fs = require('fs');

module.exports = function(app) {
  app.get('/api/content/length', async (req, res) => {
    let data = await fs.readFileSync('./settings/settings.json');
    data = JSON.parse(data);

    res.send(String(data.elements.length));
  });
}

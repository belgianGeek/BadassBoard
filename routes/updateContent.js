const axios = require('axios');
const fs = require('fs-extra');

module.exports = function (app, settings) {
    app.post('/api/updatecontent/', async (req, res) => {
        settings.elements[req.body.containerId].reference = req.body.itemReference;
        
        fs.writeFileSync('./settings/settings.json', JSON.stringify(settings, null, 2));

        const settingsUpdate = await axios.get(`http://localhost:3000/api/content/${req.body.containerId}`);

        res.send(settingsUpdate.data);
    });
}
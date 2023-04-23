const axios = require('axios');
const feedparser = require("feedparser-promised");
const fs = require('fs');

module.exports = function(app) {
  app.get('/api/content/:index', async (req, res) => {
    let data = await fs.readFileSync('./settings/settings.json');
    data = JSON.parse(data);

    const item = data.elements[Number(req.params.index)];

    if (item.type === 'rss') {
      feedparser.parse(item.reference)
        .then(items => {
          item.feed = items;
          res.send(item);
        })
        .catch((err) => {
          if (err == 'Error: Not a feed') {
            res.send({
              type: 'rss verification',
              element: `${item.parent} ${item.element}`,
              msg: `${item.reference} is not a valid RSS feed`
            });
          } else {
            res.send(`An error occurred : ${err}`);
            console.log(JSON.stringify(err, null, 2));
          }
        });
    } else if (item.type === 'weather') {
      if (data.owmToken.match(/[a-z0-9]{32}/)) {
        axios.post(`https://api.openweathermap.org/data/2.5/find?q=${item.reference}&units=metric&lang=en&appid=${data.owmToken}`)
          .then(axiosResponse => {
            switch (axiosResponse.status) {
              case 401:
                res.send({
                  type: 'weather',
                  msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.'
                })
                break;
              case 200:
                item.forecast = axiosResponse.data;

                if (item.forecast.count !== 0) {
                  res.send(item);
                } else {
                  res.send({
                    type: 'weather',
                    msg: 'Sorry homie, it seems this location doesn\'t exist...'
                  });
                }
                break;
              default:
                res.send(`An unknown error occurred : ${axiosResponse}`);
                console.log('An unknown error occurred : ', JSON.stringify(axiosResponse, null, 2));
                break;
            }
          })
          .catch(err => {
            res.send(`An unknown error occurred : ${err}`);
            console.log(JSON.stringify(err, null, 2));
          });
      }
    } else if (item.type === 'youtube search') {
      res.send(item);
    }
  });
}

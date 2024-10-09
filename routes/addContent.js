const axios = require("axios");
const feedparser = require("feedparser-promised");
const fs = require("fs-extra");

module.exports = function (app) {
  app.post("/api/content/add", async (req, res) => {
    const item = req.body;
    

    let settings = await fs.readFileSync("./settings/settings.json");
    settings = JSON.parse(settings);
    let lastEltIndex = settings.elements[settings.elements.length - 1].index;
    

    const addContent = (existingSettings, newContent) => {
      existingSettings.elements.push({
        index: lastEltIndex + 1,
        type: newContent.type,
        reference: newContent.reference,
      });

      console.log(existingSettings.elements);      

      fs.writeFile("./settings/settings.json", JSON.stringify(existingSettings, null, 2), 'utf-8', (err) => {
        if (err) {
          console.log(`Error updating the settings file : ${err}`);
        }
      });
    };

    if (item.type === "rss") {
      feedparser
        .parse(item.reference)
        .then((items) => {
          item.feed = items;

          addContent(settings, item);

          res.send({
            success: true,
            type: "rss",
            data: item,
          });
        })
        .catch((err) => {
          if (err === "Error: Not a feed") {
            res.send({
              success: false,
              type: "rss",
              index: lastEltIndex + 1,
              msg: `${item.reference} is not a valid RSS feed`,
            });
          } else {
            res.send({
              success: false,
              msg: `Your feed couldn't be loaded because the parser encountered an error : ${err}`,
            });
          }
        });
    } else if (item.type === "weather") {
      if (settings.owmToken.match(/[a-z0-9]{32}/)) {
        axios
          .post(
            `https://api.openweathermap.org/data/2.5/find?q=${item.reference}&units=metric&lang=en&appid=${data.owmToken}`
          )
          .then((axiosResponse) => {
            switch (axiosResponse.status) {
              case 401:
                res.send({
                  success: false,
                  type: "weather",
                  msg: "Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.",
                });
                break;
              case 200:
                item.forecast = axiosResponse.data;

                if (item.forecast.count !== 0) {
                  res.send({
                    success: true,
                    type: "weather",
                    data: item,
                  });
                } else {
                  res.send({
                    success: false,
                    type: "weather",
                    msg: "Sorry homie, it seems this location doesn't exist...",
                  });
                }
                break;
              default:
                res.send(`An unknown error occurred : ${axiosResponse}`);
                console.log(
                  "An unknown error occurred : ",
                  JSON.stringify(axiosResponse, null, 2)
                );
                break;
            }
          })
          .catch((err) => {
            res.send(`An unknown error occurred : ${err}`);
            console.log(JSON.stringify(err, null, 2));
          });
      }
    } else if (item.type === "youtubeSearch") {
      res.send({
        success: true,
        type: "youtubeSearch"
      });
    }
  });
};

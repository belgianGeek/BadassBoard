const axios = require("axios");
const { error } = require("console");
const Parser = require("rss-parser");
const feedparser = new Parser();
const fs = require("fs");

module.exports = function (app) {
  app.get("/api/content/get/:index", async (req, res) => {
    let data = await fs.readFileSync("./settings/settings.json");
    data = JSON.parse(data);

    const item = data.elements[Number(req.params.index)];

    // Send a success message by default, but overwrite it in case of error below
    item.success = true;

    if (item.type === "rss") {
      try {
        let feed = await feedparser.parseURL(item.reference);
        item.feed = feed;
        res.send(item);
      } catch (err) {
        if (err === "Error: Not a feed") {
          res.send({
            success: false,
            type: "error",
            index: Number(req.params.index),
            msg: `${item.reference} is not a valid RSS feed`,
          });
        } else {
          console.error(
            `Your feed couldn't be loaded because the parser encountered an error : ${err}`
          );

          res.send({
            success: false,
            type: "error",
            index: Number(req.params.index),
            msg: `Your feed couldn't be loaded because the parser encountered an error : ${err}`,
          });
        }
      }
    } else if (item.type === "weather") {
      if (data.owmToken.match(/[a-z0-9]{32}/)) {
        axios
          .post(
            `https://api.openweathermap.org/data/2.5/find?q=${item.reference}&units=metric&lang=en&appid=${data.owmToken}`
          )
          .then((axiosResponse) => {
            switch (axiosResponse.status) {
              case 401:
                res.send({
                  type: "weather",
                  msg: "Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.",
                });
                break;
              case 200:
                item.forecast = axiosResponse.data;

                if (item.forecast.count !== 0) {
                  res.send(item);
                } else {
                  res.send({
                    success: false,
                    type: "weather",
                    msg: "Sorry homie, it seems this location doesn't exist...",
                  });
                }
                break;
              default:
                res.send({
                  success: false,
                  type: "error",
                  msg: `An unknown error occurred : ${axiosResponse}`,
                });
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
      res.send(item);
    }
  });
};

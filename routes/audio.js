const axios = require("axios");

module.exports = function (app) {
  app.post("/api/audio", (req, res) => {
    const getData = async () => {
      return await axios.get(
        `${req.body.invidiousInstance}/api/v1/videos/${req.body.videoId}`
      );
    };

    getData()
      .then((result) => {
        let audioUrls = result.data.adaptiveFormats.filter((url) => {
          return (
            url.type.includes("audio") &&
            url.audioQuality === "AUDIO_QUALITY_MEDIUM"
          );
        });

        if (audioUrls.length === 0) {
          audioUrls = result.data.adaptativeFormats.filter((url) => {
            url.type.includes("audio");
          });
        }

        res.send({
          success: true,
          audio: {
            author: result.data.author,
            thumbnail: result.data.videoThumbnails[8].url,
            title: result.data.title,
            url: audioUrls[0].url,
          },
        });
      })
      .catch((error) => {
        const errorStatement = `Error parsing Invidious API ${req.body.invidiousInstance} : ${error.message}`;
        console.error(errorStatement);
        res.send({
          success: false,
          error: errorStatement,
        });
      });
  });
};

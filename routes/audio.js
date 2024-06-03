const axios = require("axios");

module.exports = function (app) {
  app.post('/api/audio', async (req, res) => {
    try {
      const result = await axios.get(
        `${req.body.invidiousInstance}/api/v1/videos/${req.body.videoId}`
      );

      let audioUrls = result.data.adaptiveFormats.filter((url) => url.type.match(/(audio)/gi) && url.audioQuality === 'AUDIO_QUALITY_MEDIUM');
      
      if (audioUrls.length === 0) {
        audioUrls = result.data.adaptativeFormats.filter((url) => url.type.match(/(audio)/gi));
      }

      res.send({
        success: true,
        audio: {
          author: result.data.author,
          thumbnail: result.data.videoThumbnails[8].url,
          title: result.data.title,
          url: audioUrls[0].url
        }
      });
    } catch (error) {
      const errorStatement = `An audio feed parsing error occurred : ${error}`;
      console.error(errorStatement);
      res.send({
        success: false,
        error: errorStatement
      })
    }
  });
};

const ytdl = require("@distube/ytdl-core");

module.exports = function (app) {
  app.get("/api/audio/info/:id", async (req, res) => {
    try {
      const videoId = req.params.id;

      // Get video info from YouTube
      const info = await ytdl.getInfo(
        `https://www.youtube.com/watch?v=${videoId}`
      );

      // Return video info as JSON
      res.send({
        success: true,
        audio: {
          title: info.videoDetails.title,
          author: info.videoDetails.author.name,
          url: info.videoDetails.video_url,
          thumbnail: info.videoDetails.thumbnails[0].url
        },
      });
    } catch (error) {
      const errorStatement = `Error getting the audio feed : ${error.message}`;
      console.error(errorStatement);
      res.send({
        success: false,
        error: errorStatement,
      });
    }
  });
};

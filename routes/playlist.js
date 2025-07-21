const { log } = require("console");
const fs = require("fs-extra");
const path = require("path");
const { Client } = require("youtubei");
const youtubei = new Client();

module.exports = function (app) {
  app.post("/api/audio/playlist/:id", async (req, res) => {
    try {
      const playlist = await youtubei.getPlaylist(req.params.id);
      let playlistObj = {
        id: playlist.id,
        title: playlist.title,
        videoCount: playlist.videoCount,
        videos: [],
      };      

      for (const video of playlist.videos) {
        playlistObj.videos.push({
          channelID: video.channel.id,
          channelName: video.channel.name,
          duration: video.duration,
          id: video.id,
          thumbnails: video.thumbnails,
          title: video.title,
        });
        
      }

      await fs.writeFile(
        path.join(__dirname, "../tmp", "playlist.json"),
        JSON.stringify(playlistObj, null, 2),
        "utf-8"
      );

      res.send({
        success: true,
        playlistInfo: playlistObj,
      });
    } catch (err) {
      const errorStatement = `An error occurred while parsing a playlist : ${err}`;
      console.error(errorStatement);

      res.send({
        success: false,
        msg: errorStatement,
      });
    }
  });
};

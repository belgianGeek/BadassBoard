const ytdl = require("@distube/ytdl-core");

module.exports = function (app) {
  app.get("/api/audio/play/:id", async (req, res) => {
    const videoId = req.params.id;

    try {
      const info = await ytdl.getInfo(videoId);

      // Find the best available audio-only format with an mp4 container
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      const audioFormat = audioFormats.find(
        (format) => format.container === "mp4"
      );

      // Get the content length of the chosen format
      const contentLength = Number(audioFormat.contentLength);

      // Get the requested byte range (or default to the whole file)
      const range = req.headers.range || `bytes=0-${contentLength - 1}`;
      const [rangeStart, rangeEnd] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(rangeStart, 10);
      const end = rangeEnd ? parseInt(rangeEnd, 10) : contentLength - 1;
      const chunksize = end - start + 1;

      const audioStream = ytdl(videoId, {
        quality: "highestaudio",
        range: { start, end },
      });

      // Send the appropriate headers for a partial content response
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${contentLength}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "audio/mp4",
      });

      // Redirect the stream to the web interface
      audioStream.pipe(res);

      audioStream.on("error", (err) => {
        const errorStatement = `Error getting the audio stream : ${err.message}`;
        console.error(errorStatement);
        res.send({
          success: false,
          error: errorStatement,
        });
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

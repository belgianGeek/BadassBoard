const path = require("path");

module.exports = function (app) {
  app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
};

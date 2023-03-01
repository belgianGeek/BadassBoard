module.exports = function(app, settings) {
  // 404 errors handling
  app.use((req, res, next) => {
    res
      .status(404)
      .send('<h1>Page not found ! :-(</h1>');
  });
}

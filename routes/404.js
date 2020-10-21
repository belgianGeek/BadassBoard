module.exports = function(app, settings) {
  // 404 errors handling
  app.use((req, res, next) => {
    res.status(404).render('404.ejs', {
      wallpaper: settings.backgroundImage
    });
  });
}

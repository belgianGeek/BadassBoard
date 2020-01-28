const request = require('request');
const cheerio = require('cheerio');
const jquery = require('jquery');

module.exports = {
  getMovieReview: function(title) {
    let args = title.split(' ');
    const url = `https://rottentomatoes.com/m/${args.join('_')}`;
    return new Promise((fullfill, reject) => {
      request(url, (err, response, body) => {
        if (err) throw err;

        if (!err && response.statusCode === 200) {
          const $ = cheerio.load(body);

          let rottenTitle = $('.mop-ratings-wrap__title--top').text();
          let rottenRating = $('#tomato_meter_link .mop-ratings-wrap__percentage').text().trim();
          let rottenSynopsis = $('#movieSynopsis').text().match(/[^\s]{2}[A-Za-z0-9.,;(){}@&#$"'-_\/\\ ]{250}/);
          let rottenConsensus = $('.mop-ratings-wrap__text--concensus').text().match(/[A-Za-z0-9.,;(){}@&#$"'-_\/\\ ]{1,200}/);
          let rottenPoster = $('#poster_link img').attr('data-src');

          let result = {
            title: rottenTitle,
            rating: rottenRating,
            consensus: rottenConsensus,
            synopsis: rottenSynopsis,
            poster: rottenPoster,
            url: url
          };
          fullfill(result);
        } else if (!err && response.statusCode === 404) {
          reject(new Error(`Page not found !`));
        }
      });
    });
  }
}

const request = require('request');
let $ = require('cheerio');
const puppeteer = require('puppeteer');

module.exports = {
  getMovieReview: function(title) {
    let args = title.split(' ');
    const url = `https://rottentomatoes.com/m/${args.join('_')}`;
    return new Promise((fullfill, reject) => {
      request(url, (err, response, body) => {
        if (err) throw err;
        let rottenTitle, rottenRating, rottenSynopsis, rottenConsensus, rottenPoster;

        if (!err && response.statusCode === 200) {
          $ = $.load(body);

          // Title
          if ($('.mop-ratings-wrap__title--top').length) {
            rottenTitle = $('.mop-ratings-wrap__title--top').text();
          } else {
            reject(new Error('Unknown movie title :(('));
          }

          // Rating
          if ($('#tomato_meter_link .mop-ratings-wrap__percentage').length) {
            rottenRating = $('#tomato_meter_link .mop-ratings-wrap__percentage').text().trim();
          } else {
            rottenRating = '<i>No rating found !</i>';
          }

          // Synopsis
          if ($('#movieSynopsis').length) {
            rottenSynopsis = `${$('#movieSynopsis').text().trim().match(/\w.+/)[0].substring(0,250)}...`;
          } else {
            rottenSynopsis = 'Synopsis unavailable';
          }

          // Consensus
          if ($('.mop-ratings-wrap__text--concensus').length) {
            rottenConsensus = $('.mop-ratings-wrap__text--concensus').text().match(/\w.+/)[0].substring(0,200);
          } else {
            rottenConsensus = 'No consensus yet.';
          }

          // Poster
          if ($('#poster_link img').length) {
            rottenPoster = $('#poster_link img').attr('data-src');
          }

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
  },
  getOpenings: function() {
    const url = `https://www.rottentomatoes.com/browse/opening/`;
    return new Promise((fullfill, reject) => {
      puppeteer
        .launch()
        .then(browser => {
          return browser.newPage();
        })
        .then(page => {
          return page.goto(url)
            .then(() => {
              return page.content();
            });
        })
        .then(html => {
          let openingMovies = [];

          // Avoid ES6 because it breaks $(this)...
          $('.mb-movies .mb-movie', html).each(function() {
            let movie = {};

            movie.link = `https://www.rottentomatoes.com/${$(this).find('.movie_info a').attr('href')}`;
            movie.poster = $(this).find('.poster_container img').attr('src');
            movie.releaseDate = $(this).find('.release-date').text();
            movie.title = $(this).find('.movieTitle').text();

            // Define the movie score
            if ($(this).find('.movie_info .tMeterScore').length) {
              movie.score = $(this).find('.movie_info .tMeterScore').text();
            } else {
              movie.score = 'No consensus yet...';
            }

            openingMovies.push(movie);
          });

          fullfill(openingMovies);
        });
    });
  }
}

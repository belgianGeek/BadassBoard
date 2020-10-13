const axios = require('axios');
let $ = require('cheerio');
const puppeteer = require('puppeteer');

module.exports = {
  getMovieReview: function(title) {
    let args = title.split(' ');
    const url = `https://rottentomatoes.com/m/${args.join('_')}`;
    return new Promise((fullfill, reject) => {
      axios({
          url: url,
          method: 'GET'
        })
        .then(res => {
          let rottenTitle, rottenRating, rottenSynopsis, rottenConsensus, rottenPoster;

          if (res.status === 200) {
            $ = $.load(res.data);

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
              rottenConsensus = $('.mop-ratings-wrap__text--concensus').text().match(/\w.+/)[0].substring(0, 200);
            } else {
              rottenConsensus = 'No consensus yet.';
            }

            // Poster
            if ($('.posterImage').length) {
              rottenPoster = $('.posterImage').attr('data-src');
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
          } else if (res.status === 404) {
            reject(new Error(`Page not found !`));
          }
        })
        .catch(err => {
          console.error(`Couldn't get this movie review : ${err}`);
          reject(new Error(`An error occurred : ${err}`));
        });
    });
  },
  getOpenings: function() {
    const url = `https://www.rottentomatoes.com/browse/opening/`;
    return new Promise((fullfill, reject) => {
      axios
        .get(url)
        .then(res => {
          if (res.status === 200) {
            $ = $.load(res.data);
            let openingMovies = [];

            // Avoid ES6 because it breaks $(this)...
            $('.media_list_item').each(function() {
              let movie = {};

              movie.link = `https://www.rottentomatoes.com/${$(this).find('.media-list__movie-info').attr('href')}`;
              movie.poster = $(this).find('.media-list__poster').attr('src');
              movie.releaseDate = $(this).find('.media-list__release-date').text();
              movie.title = $(this).find('.media-list__title').text();

              // Define the movie score
              if ($(this).find('.media-list__consensus').length) {
                movie.score = $(this).find('.media-list__consensus-text').text();
              } else {
                movie.score = 'No consensus yet...';
              }

              console.log(movie);
              openingMovies.push(movie);
            });

            fullfill(openingMovies);
          }
        })
        .catch(err => {
          let msg = `Error getting openings from rottentomatoes : ${err}`;
          console.error(err);
          reject(err);
        });
    });
  }
}

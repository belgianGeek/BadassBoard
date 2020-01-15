<<<<<<< HEAD
// Add content of other types than RSS
const parseContent = () => {
  socket.on('parse content', (parsedData) => {

    // console.log(JSON.stringify(parsedData, null, 2));
    for (const [i, value] of parsedData.entries()) {

      const buildElement = (parent, element, iElement, callback) => {
        if (!$(element).length) {
          let container = $('<div></div>')
            .addClass(`content content${iElement}`)
            .attr('id', `content${iElement}`);

          if (!$(element).length) {
            container.appendTo(parent);
          }

          $(element).ready(() => {
            // Append the new divs to the newly created element
            if (!$(`${element} .blank`).length && !$(`${element} .addContent`).length) {
              $(element)
                .prepend(newBlank)
                .append(newAddContent);
            }

            $(`${element} .blank`).addClass('invisible');
            callback();
          });
        } else {
          callback();
        }
      }

      let parent = value.parent;
      let element = value.element;
      let fullElementClassName = `${value.parent} ${value.element}`;
      let iElement = Number(element.match(/[0-9]{1,}/));
      let newBlank = $(`.blank`).clone()[0];
      let newAddContent = $(`.addContent`).clone()[0];

      buildElement(parent, fullElementClassName, iElement, () => {
        const addNewContentContainer = () => {
          setTimeout(() => {
            if (!$(`${parent} .newContent`).length) {
              let newContainer = $('<div></div>')
                .addClass(`newContent content subRow flex`)
                .appendTo(parent)
                .prepend(newBlank)
                .append(newAddContent);
            }

            if ($('footer').css('position') === 'absolute') {
              $('.footer').css({
                position: '',
                top: ''
              });
            }

            let svg = $(`${parent} .newContent .blank`);

            $(svg).click(() => {
              $(fullElementClassName)
                .css('padding', '0');

              $(`${parent} .newContent .addContent`)
                .css('display', '')
                .addClass('flex');

              $(svg).hide();

              $(`${parent} .newContent .addContent`).ready(() => {
                handleOptionSelection(parent, '.newContent');
              });
            });

            // Fix the content divs order
            $('.newContent').ready(() => {
              $('.newContent .blank').removeClass('invisible');
              $('.content').each(function(index) {

                // Exclude the ".newContent" div
                if (!$(this).hasClass('newContent')) {
                  $(this).css('order', $(this).attr('id').substring(7, 9));
                } else {
                  // Send the newContent div at the bottom
                  $(this).css('order', 100);
                }
              });
            });
          }, 500);
        }

        // Remove the event handler to show the "+" sign
        $(fullElementClassName).off();

        if (value.type === 'weather') {
          // Prevent duplicates
          if (!$(`${fullElementClassName} .forecast`).length) {

            // Check if location is defined and if the token is valid
            if (value.location !== undefined && owmToken.match(/[a-z0-9]{32}/)) {
              $.ajax({
                url: `https://api.openweathermap.org/data/2.5/find?q=${value.location}&units=metric&lang=en&appid=${owmToken}`,
                method: 'POST',
                dataType: 'json',
                statusCode: {
                  401: () => {
                    printError({
                      type: 'weather',
                      msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                      element: fullElementClassName
                    });
                  },
                  200: (forecast => {
                    let resCode = forecast.cod;
                    let count = forecast.count;

                    // 404 errors handling (forecast.count can't be equals to 0)
                    if (count === 1) {

                      if ($(`${fullElementClassName} .addContent:visible`).length) {
                        $(`${fullElementClassName} .addContent`).hide();
                      }

                      let cityID = forecast.list[0].id;

                      // Format the forecast summary to get the first letter uppercase
                      let tempDescription = forecast.list[0].weather[0].description.split('');
                      let firstLetter = tempDescription[0].toUpperCase();
                      tempDescription.shift();
                      tempDescription.unshift(firstLetter);

                      tempDescription = tempDescription.join('');

                      let previsions = {
                        temp: forecast.list[0].main.temp,
                        city: forecast.list[0].name,
                        description: tempDescription,
                        humidity: forecast.list[0].main.humidity,
                        windSpeed: forecast.list[0].wind.speed,
                        weatherIcon: forecast.list[0].weather[0].icon
                      };

                      // Prevent duplicates
                      if (!$(`${fullElementClassName} .forecast`).length) {
                        let forecastContainer = $('<section></section>')
                          .addClass('forecast flex')
                          .appendTo(fullElementClassName);

                        let forecastHeader = $('<span></span>')
                          .addClass('forecast__header')
                          .appendTo(forecastContainer);

                        let forecastTitle = $('<a></a>')
                          .addClass('forecast__header__title')
                          .text(`Weather in ${previsions.city}`)
                          .attr('href', `https://openweathermap.org/city/${cityID}`)
                          .appendTo(forecastHeader);

                        let forecastContent = $('<div></div>')
                          .addClass('forecast__content flex')
                          .appendTo(forecastContainer);

                        let forecastInfo = $('<div></div>')
                          .addClass('forecast__content__info flex')
                          .appendTo(forecastContent);

                        let description = $('<span></span>')
                          .addClass('forecast__content__info__desc')
                          .appendTo(forecastInfo);

                        let descriptionDesc = $('<p></p>')
                          .addClass('forecast__content__info__description__desc flex')
                          .text(previsions.description)
                          .appendTo(description);

                        let descriptionIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text('🛈')
                          .prependTo(description);

                        let temp = $('<span></span>')
                          .addClass('forecast__content__info__temp')
                          .appendTo(forecastInfo);

                        let tempDesc = $('<p></p>')
                          .addClass('forecast__content__info__temp__desc flex')
                          .text(`${previsions.temp} °C`)
                          .appendTo(temp);

                        let tempIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text('🌡')
                          .prependTo(temp);

                        let windSpeed = $('<span></span>')
                          .addClass('forecast__content__info__wind')
                          .appendTo(forecastInfo);

                        let windDesc = $('<p></p>')
                          .addClass('forecast__content__info__wind__desc')
                          .text(`${previsions.windSpeed} km/h`)
                          .appendTo(windSpeed);

                        let windIcon = $('<img>')
                          .addClass('forecastIcon')
                          .attr({
                            alt: 'wind icon',
                            src: './src/css/icons/interface/wind.svg'
                          })
                          .prependTo(windSpeed);

                        let humidity = $('<span></span>')
                          .addClass('forecast__content__info__humidity')
                          .appendTo(forecastInfo);

                        let humidityDesc = $('<p></p>')
                          .addClass('forecast__content__info__humidity__desc flex')
                          .text(`${previsions.humidity} %`)
                          .appendTo(humidity);

                        let humidityIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text(`💧`)
                          .prependTo(humidity);

                        // Create a div to store the weather icon
                        let weatherIconContainer = $('<div></div>')
                          .addClass('forecast__weatherIcon flex')
                          .appendTo(forecastContent);

                        // Define the weather icon
                        let weatherIcon = $('<span></span>')
                          .addClass('forecast__weatherIcon__icon')
                          .appendTo(weatherIconContainer);

                        // Add weather icon
                        updateWeatherIcon(previsions);

                        // Add content options
                        let contentOptions = $('<span></span>')
                          .addClass('contentOptions')
                          .appendTo(forecastHeader);

                        let updateContentBtn = $('<img>')
                          .addClass('updateContentBtn')
                          .attr({
                            alt: 'Update content',
                            src: './src/css/icons/interface/refresh.svg'
                          })
                          .appendTo(contentOptions);

                        let removeContentBtn = $('<img>')
                          .addClass('removeContentBtn')
                          .attr({
                            alt: 'Remove content',
                            src: './src/css/icons/interface/cross.svg'
                          })
                          .appendTo(contentOptions);

                        addContentOptions(fullElementClassName);

                        addNewContentContainer();
                      }
                    } else {
                      printError({
                        type: 'weather',
                        msg: 'Sorry homie, it seems this location doesn\'t exist...',
                        element: fullElementClassName
                      });
                    }
                  })
                }
              })
            }
          }
        }

        if (value.type === 'rss') {
          let feed = value.feed;

          // Create the RSS container if they don't exist
          if (!$(`${fullElementClassName} .rssContainer`).length) {
            buildRssContainer(feed, (feed, rssContainer) => {
              rssContainer.appendTo(fullElementClassName);

              let rssContainerHeader = $('<div></div>')
                .addClass('rssContainer__header')
                .prependTo(`${fullElementClassName} .rssContainer`);

              let feedTitle = $('<a></a>')
                .addClass('feedTitle')
                .attr({
                  href: feed[0].meta.link
                })
                .text(feed[0].meta.title)
                .prependTo(`${fullElementClassName} .rssContainer__header`);

              // Add content options
              let contentOptions = $('<span></span>')
                .addClass('contentOptions')
                .appendTo(rssContainerHeader);

              let updateContentBtn = $('<img>')
                .addClass('updateContentBtn')
                .attr({
                  alt: 'Update content',
                  src: './src/css/icons/interface/refresh.svg'
                })
                .appendTo(contentOptions);

              let removeContentBtn = $('<img>')
                .addClass('removeContentBtn')
                .attr({
                  alt: 'Remove content',
                  src: './src/css/icons/interface/cross.svg'
                })
                .appendTo(contentOptions);

              displayArticleSummary();

              addContentOptions(fullElementClassName);

              addNewContentContainer();
            });
          }
        }

        if (value.type === 'youtube search') {

          if (!$('.youtubeSearchContainer').length) {
            let youtubeSearchContainer = $('<section></section>')
              .addClass('youtubeSearchContainer')
              .appendTo(fullElementClassName);

            let headerText = $('<p></p>').text('Instant Youtube search');

            let youtubeSearchHeader = $('<div></div>')
              .addClass('youtubeSearchContainer__header flex')
              .appendTo(`${fullElementClassName} .youtubeSearchContainer`)
              .append(headerText);

            let youtubeSearchInput = $('<input>')
              .addClass('youtubeSearchContainer__content__input')
              .attr('placeholder', 'Type here to search Youtube...');

            let youtubeSearchResults = $('<div></div>')
              .addClass('youtubeSearchContainer__content__results flex');

            let youtubeSearchContent = $('<div></div>')
              .addClass('youtubeSearchContainer__content flex')
              .append(youtubeSearchInput, youtubeSearchResults)
              .appendTo(`${fullElementClassName} .youtubeSearchContainer`);

            // Add content options
            let contentOptions = $('<span></span>')
              .addClass('contentOptions')
              .appendTo(youtubeSearchHeader);

            let updateContentBtn = $('<img>')
              .addClass('contentOptions__clearResultsbtn')
              .attr({
                alt: 'Clear search results',
                src: './src/css/icons/interface/clear.svg'
              })
              .appendTo(contentOptions);

            let removeContentBtn = $('<img>')
              .addClass('removeContentBtn')
              .attr({
                alt: 'Remove content',
                src: './src/css/icons/interface/cross.svg'
              })
              .appendTo(contentOptions);

            addContentOptions(fullElementClassName);

            addNewContentContainer();
          }

          $('.youtubeSearchContainer *').keypress((event) => {
            if (event.keyCode === 13) {
              // Hide the results container
              $('.youtubeSearchContainer__content__results').addClass('invisible');

              $.ajax({
                url: `https://invidio.us/api/v1/search?q=${$('.youtubeSearchContainer__content__input').val()}&language=json&type=all`,
                method: 'GET',
                dataType: 'json',
                statusCode: {
                  200: (res) => {
                    for (let i = 0; i < res.length; i++) {
                      let title = '';
                      let id = '';
                      let duration = '';
                      let resultContent = '';
                      let thumbnail = '';

                      const processResults = () => {
                        let result = $('<span></span>')
                          .addClass(`youtubeSearchContainer__content__results__result youtube__result${i} flex`)
                          .append(resultContent)
                          .appendTo('.youtubeSearchContainer__content__results');

                        let thumbnailContainer = $('<div></div>')
                          .addClass('youtubeSearchContainer__content__results__result__thumbnailContainer')
                          .prependTo(result);

                        if (res[i].type !== 'channel' && res[i].type !== 'playlist') {
                          thumbnail = $('<img>')
                            .attr('alt', `${res[i].title} thumbnail`)
                            .attr('src', res[i].videoThumbnails[0].url)
                            .prependTo(thumbnailContainer);
                        } else if (res[i].type === 'channel') {
                          thumbnail = $('<img>')
                            .attr('alt', `${res[i].author} channel thumbnail`)
                            .attr('src', res[i].authorThumbnails[0].url)
                            .prependTo(thumbnailContainer);
                        } else if (res[i].type === 'playlist') {
                          thumbnail = $('<img>')
                            .attr('alt', `${res[i].title} thumbnail`)
                            .attr('src', res[i].playlistThumbnail)
                            .prependTo(thumbnailContainer);
                        }
                      }

                      if (res[i].type === 'video') {
                        title = $(`<a></a>`)
                          .attr('href', `https://invidio.us/watch?v=${res[i].videoId}`)
                          .text(res[i].title);

                        id = $('<p></p>').text(res[i].videoId).prepend('<u>Video ID</u> : ');

                        duration = $('<p></p>').text(`${res[i].lengthSeconds} s.`).prepend('<u>Duration</u> : ');
                      } else if (res[i].type === 'channel') {
                        title = $(`<a></a>`)
                          .attr('href', `https://invidio.us${res[i].authorUrl}`)
                          .text(res[i].author);

                        duration = $('<p></p>').text(res[i].videoCount).prepend('<u>Number of videos</u> : ');
                      } else if (res[i].type === 'playlist') {
                        title = $(`<a></a>`)
                          .attr('href', `https://invidio.us/playlist?list=${res[i].playlistId}`)
                          .text(res[i].title);

                        id = $('<p></p>').text(`${res[i].playlistId}`).prepend('<u>Playlist ID</u> : ');

                        duration = $('<p></p>').text(res[i].videoCount).prepend('<u>Number of videos</u> : ');
                      }

                      if (id !== '') {
                        resultContent = $('<span></span>')
                          .addClass('youtubeSearchContainer__content__results__result__content flex')
                          .append(title, duration, id);
                      } else {
                        resultContent = $('<span></span>')
                          .addClass('youtubeSearchContainer__content__results__result__content flex')
                          .append(title, duration);
                      }

                      if (!$(`.youtube__result${i}`).length) {
                        processResults();
                      } else if ($('.youtubeSearchContainer__content__results').length) {
                        $('.youtubeSearchContainer__content__results').empty();
                        processResults();
                      }

                      if (i === 1) {
                        // Show the results container
                        $('.youtubeSearchContainer__content__results')
                          .removeClass('invisible')
                          .css('visibility', 'visible');
                      }
                    }
                  }
                }
              });
            }
          });

        }

        // Add a margin to the dynamicaly created divs
        if (!parent.match(iElement)) {
          $(fullElementClassName).addClass('subRow');
        }
      });
    }
  });
}
=======
// Add content of other types than RSS
const parseContent = () => {
  socket.on('parse content', (parsedData) => {

    // console.log(JSON.stringify(parsedData, null, 2));
    for (const [i, value] of parsedData.entries()) {

      const buildElement = (parent, element, iElement, callback) => {
        $(`${element} .blank`).ready(function() {
          $(this).addClass('invisible');
        });

        if (!$(element).length) {
          let container = $('<div></div>')
            .addClass(`content content${iElement}`)
            .attr('id', `content${iElement}`);

          if (!$(element).length) {
            container.appendTo(parent);
          }

          $(element).ready(() => {
            // Append the new divs to the newly created element
            if (!$(`${element} .blank`).length && !$(`${element} .addContent`).length) {
              $(element)
                .prepend(newBlank)
                .append(newAddContent);
            }

            callback();
          });
        } else {
          callback();
        }
      }

      let parent = value.parent;
      let element = value.element;
      let fullElementClassName = `${value.parent} ${value.element}`;
      let iElement = Number(element.match(/[0-9]{1,}/));
      let newBlank = $(`.blank`).clone()[0];
      let newAddContent = $(`.addContent`).clone()[0];

      buildElement(parent, fullElementClassName, iElement, () => {
        const addNewContentContainer = () => {
          setTimeout(() => {
            if (!$(`${parent} .newContent`).length) {
              let newContainer = $('<div></div>')
                .addClass(`newContent content subRow flex`)
                .appendTo(parent)
                .prepend(newBlank)
                .append(newAddContent);
            }

            if ($('footer').css('position') === 'absolute') {
              $('.footer').css({
                position: '',
                top: ''
              });
            }

            let svg = $(`${parent} .newContent .blank`);

            $(svg).click(() => {
              $(fullElementClassName)
                .css('padding', '0');

              $(`${parent} .newContent .addContent`)
                .css('display', '')
                .addClass('flex');

              $(svg).hide();

              $(`${parent} .newContent .addContent`).ready(() => {
                handleOptionSelection(parent, '.newContent');
              });
            });

            // Fix the content divs order
            $('.newContent').ready(() => {
              $('.newContent .blank').removeClass('invisible');
              $('.content').each(function(index) {

                // Exclude the ".newContent" div
                if (!$(this).hasClass('newContent')) {
                  $(this).css('order', $(this).attr('id').substring(7, 9));
                } else {
                  // Send the newContent div at the bottom
                  $(this).css('order', 100);
                }
              });
            });
          }, 500);
        }

        // Remove the event handler to show the "+" sign
        $(fullElementClassName).off();

        if (value.type === 'weather') {
          // Prevent duplicates
          if (!$(`${fullElementClassName} .forecast`).length) {

            // Check if location is defined and if the token is valid
            if (value.location !== undefined && owmToken.match(/[a-z0-9]{32}/)) {
              $.ajax({
                url: `https://api.openweathermap.org/data/2.5/find?q=${value.location}&units=metric&lang=en&appid=${owmToken}`,
                method: 'POST',
                dataType: 'json',
                statusCode: {
                  401: () => {
                    printError({
                      type: 'weather',
                      msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                      element: fullElementClassName
                    });
                  },
                  200: (forecast => {
                    let resCode = forecast.cod;
                    let count = forecast.count;

                    // 404 errors handling (forecast.count can't be equals to 0)
                    if (count === 1) {

                      if ($(`${fullElementClassName} .addContent:visible`).length) {
                        $(`${fullElementClassName} .addContent`).hide();
                      }

                      let cityID = forecast.list[0].id;

                      // Format the forecast summary to get the first letter uppercase
                      let tempDescription = forecast.list[0].weather[0].description.split('');
                      let firstLetter = tempDescription[0].toUpperCase();
                      tempDescription.shift();
                      tempDescription.unshift(firstLetter);

                      tempDescription = tempDescription.join('');

                      let previsions = {
                        temp: forecast.list[0].main.temp,
                        city: forecast.list[0].name,
                        description: tempDescription,
                        humidity: forecast.list[0].main.humidity,
                        windSpeed: forecast.list[0].wind.speed,
                        weatherIcon: forecast.list[0].weather[0].icon
                      };

                      // Prevent duplicates
                      if (!$(`${fullElementClassName} .forecast`).length) {
                        let forecastContainer = $('<section></section>')
                          .addClass('forecast flex')
                          .appendTo(fullElementClassName);

                        let forecastHeader = $('<span></span>')
                          .addClass('forecast__header')
                          .appendTo(forecastContainer);

                        let forecastTitle = $('<a></a>')
                          .addClass('forecast__header__title')
                          .text(`Weather in ${previsions.city}`)
                          .attr('href', `https://openweathermap.org/city/${cityID}`)
                          .appendTo(forecastHeader);

                        let forecastContent = $('<div></div>')
                          .addClass('forecast__content flex')
                          .appendTo(forecastContainer);

                        let forecastInfo = $('<div></div>')
                          .addClass('forecast__content__info flex')
                          .appendTo(forecastContent);

                        let description = $('<span></span>')
                          .addClass('forecast__content__info__desc')
                          .appendTo(forecastInfo);

                        let descriptionDesc = $('<p></p>')
                          .addClass('forecast__content__info__description__desc flex')
                          .text(previsions.description)
                          .appendTo(description);

                        let descriptionIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text('🛈')
                          .prependTo(description);

                        let temp = $('<span></span>')
                          .addClass('forecast__content__info__temp')
                          .appendTo(forecastInfo);

                        let tempDesc = $('<p></p>')
                          .addClass('forecast__content__info__temp__desc flex')
                          .text(`${previsions.temp} °C`)
                          .appendTo(temp);

                        let tempIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text('🌡')
                          .prependTo(temp);

                        let windSpeed = $('<span></span>')
                          .addClass('forecast__content__info__wind')
                          .appendTo(forecastInfo);

                        let windDesc = $('<p></p>')
                          .addClass('forecast__content__info__wind__desc')
                          .text(`${previsions.windSpeed} km/h`)
                          .appendTo(windSpeed);

                        let windIcon = $('<img>')
                          .addClass('forecastIcon')
                          .attr({
                            alt: 'wind icon',
                            src: './src/css/icons/interface/wind.svg'
                          })
                          .prependTo(windSpeed);

                        let humidity = $('<span></span>')
                          .addClass('forecast__content__info__humidity')
                          .appendTo(forecastInfo);

                        let humidityDesc = $('<p></p>')
                          .addClass('forecast__content__info__humidity__desc flex')
                          .text(`${previsions.humidity} %`)
                          .appendTo(humidity);

                        let humidityIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text(`💧`)
                          .prependTo(humidity);

                        // Create a div to store the weather icon
                        let weatherIconContainer = $('<div></div>')
                          .addClass('forecast__weatherIcon flex')
                          .appendTo(forecastContent);

                        // Define the weather icon
                        let weatherIcon = $('<span></span>')
                          .addClass('forecast__weatherIcon__icon')
                          .appendTo(weatherIconContainer);

                        // Add weather icon
                        updateWeatherIcon(previsions);

                        // Add content options
                        let contentOptions = $('<span></span>')
                          .addClass('contentOptions')
                          .appendTo(forecastHeader);

                        let updateContentBtn = $('<img>')
                          .addClass('updateContentBtn')
                          .attr({
                            alt: 'Update content',
                            src: './src/css/icons/interface/refresh.svg'
                          })
                          .appendTo(contentOptions);

                        let removeContentBtn = $('<img>')
                          .addClass('removeContentBtn')
                          .attr({
                            alt: 'Remove content',
                            src: './src/css/icons/interface/cross.svg'
                          })
                          .appendTo(contentOptions);

                        addContentOptions(fullElementClassName);

                        addNewContentContainer();
                      }
                    } else {
                      printError({
                        type: 'weather',
                        msg: 'Sorry homie, it seems this location doesn\'t exist...',
                        element: fullElementClassName
                      });
                    }
                  })
                }
              })
            }
          }
        }

        if (value.type === 'rss') {
          let feed = value.feed;

          // Create the RSS container if they don't exist
          if (!$(`${fullElementClassName} .rssContainer`).length) {
            buildRssContainer(feed, (feed, rssContainer) => {
              rssContainer.appendTo(fullElementClassName);

              let rssContainerHeader = $('<div></div>')
                .addClass('rssContainer__header')
                .prependTo(`${fullElementClassName} .rssContainer`);

              let feedTitle = $('<a></a>')
                .addClass('feedTitle')
                .attr({
                  href: feed[0].meta.link
                })
                .text(feed[0].meta.title)
                .prependTo(`${fullElementClassName} .rssContainer__header`);

              // Add content options
              let contentOptions = $('<span></span>')
                .addClass('contentOptions')
                .appendTo(rssContainerHeader);

              let updateContentBtn = $('<img>')
                .addClass('updateContentBtn')
                .attr({
                  alt: 'Update content',
                  src: './src/css/icons/interface/refresh.svg'
                })
                .appendTo(contentOptions);

              let removeContentBtn = $('<img>')
                .addClass('removeContentBtn')
                .attr({
                  alt: 'Remove content',
                  src: './src/css/icons/interface/cross.svg'
                })
                .appendTo(contentOptions);

              displayArticleSummary();

              addContentOptions(fullElementClassName);

              addNewContentContainer();
            });
          }
        }

        if (value.type === 'youtube search') {

          if (!$('.youtubeSearchContainer').length) {
            let youtubeSearchContainer = $('<section></section>')
              .addClass('youtubeSearchContainer')
              .appendTo(fullElementClassName);

            let headerText = $('<p></p>').text('Instant Youtube search');

            let youtubeSearchHeader = $('<div></div>')
              .addClass('youtubeSearchContainer__header flex')
              .appendTo(`${fullElementClassName} .youtubeSearchContainer`)
              .append(headerText);

            let youtubeSearchInput = $('<input>')
              .addClass('youtubeSearchContainer__content__input')
              .attr('placeholder', 'Type here to search Youtube...');

            let youtubeSearchResults = $('<div></div>')
              .addClass('youtubeSearchContainer__content__results flex');

            let youtubeSearchContent = $('<div></div>')
              .addClass('youtubeSearchContainer__content flex')
              .append(youtubeSearchInput, youtubeSearchResults)
              .appendTo(`${fullElementClassName} .youtubeSearchContainer`);

            // Add content options
            let contentOptions = $('<span></span>')
              .addClass('contentOptions')
              .appendTo(youtubeSearchHeader);

            let updateContentBtn = $('<img>')
              .addClass('contentOptions__clearResultsbtn')
              .attr({
                alt: 'Clear search results',
                src: './src/css/icons/interface/clear.svg'
              })
              .appendTo(contentOptions);

            let removeContentBtn = $('<img>')
              .addClass('removeContentBtn')
              .attr({
                alt: 'Remove content',
                src: './src/css/icons/interface/cross.svg'
              })
              .appendTo(contentOptions);

            addContentOptions(fullElementClassName);

            addNewContentContainer();
          }

          $('.youtubeSearchContainer *').keypress((event) => {
            if (event.keyCode === 13) {
              // Hide the results container
              $('.youtubeSearchContainer__content__results').addClass('invisible');

              $.ajax({
                url: `https://invidio.us/api/v1/search?q=${$('.youtubeSearchContainer__content__input').val()}&language=json&type=all`,
                method: 'GET',
                dataType: 'json',
                statusCode: {
                  200: (res) => {
                    for (let i = 0; i < res.length; i++) {
                      let title = '';
                      let id = '';
                      let duration = '';
                      let resultContent = '';
                      let thumbnail = '';

                      const processResults = () => {
                        let result = $('<span></span>')
                          .addClass(`youtubeSearchContainer__content__results__result youtube__result${i} flex`)
                          .append(resultContent)
                          .appendTo('.youtubeSearchContainer__content__results');

                        let thumbnailContainer = $('<div></div>')
                          .addClass('youtubeSearchContainer__content__results__result__thumbnailContainer')
                          .prependTo(result);

                        if (res[i].type !== 'channel' && res[i].type !== 'playlist') {
                          thumbnail = $('<img>')
                            .attr('alt', `${res[i].title} thumbnail`)
                            .attr('src', res[i].videoThumbnails[0].url)
                            .prependTo(thumbnailContainer);
                        } else if (res[i].type === 'channel') {
                          thumbnail = $('<img>')
                            .attr('alt', `${res[i].author} channel thumbnail`)
                            .attr('src', res[i].authorThumbnails[0].url)
                            .prependTo(thumbnailContainer);
                        } else if (res[i].type === 'playlist') {
                          thumbnail = $('<img>')
                            .attr('alt', `${res[i].title} thumbnail`)
                            .attr('src', res[i].playlistThumbnail)
                            .prependTo(thumbnailContainer);
                        }
                      }

                      if (res[i].type === 'video') {
                        title = $(`<a></a>`)
                          .attr('href', `https://invidio.us/watch?v=${res[i].videoId}`)
                          .text(res[i].title);

                        id = $('<p></p>').text(res[i].videoId).prepend('<u>Video ID</u> : ');

                        duration = $('<p></p>').text(`${res[i].lengthSeconds} s.`).prepend('<u>Duration</u> : ');
                      } else if (res[i].type === 'channel') {
                        title = $(`<a></a>`)
                          .attr('href', `https://invidio.us${res[i].authorUrl}`)
                          .text(res[i].author);

                        duration = $('<p></p>').text(res[i].videoCount).prepend('<u>Number of videos</u> : ');
                      } else if (res[i].type === 'playlist') {
                        title = $(`<a></a>`)
                          .attr('href', `https://invidio.us/playlist?list=${res[i].playlistId}`)
                          .text(res[i].title);

                        id = $('<p></p>').text(`${res[i].playlistId}`).prepend('<u>Playlist ID</u> : ');

                        duration = $('<p></p>').text(res[i].videoCount).prepend('<u>Number of videos</u> : ');
                      }

                      if (id !== '') {
                        resultContent = $('<span></span>')
                          .addClass('youtubeSearchContainer__content__results__result__content flex')
                          .append(title, duration, id);
                      } else {
                        resultContent = $('<span></span>')
                          .addClass('youtubeSearchContainer__content__results__result__content flex')
                          .append(title, duration);
                      }

                      if (!$(`.youtube__result${i}`).length) {
                        processResults();
                      } else if ($('.youtubeSearchContainer__content__results').length) {
                        $('.youtubeSearchContainer__content__results').empty();
                        processResults();
                      }

                      if (i === 1) {
                        // Show the results container
                        $('.youtubeSearchContainer__content__results')
                          .removeClass('invisible')
                          .css('visibility', 'visible');
                      }
                    }
                  }
                }
              });
            }
          });

        }

        // Add a margin to the dynamicaly created divs
        if (!parent.match(iElement)) {
          $(fullElementClassName).addClass('subRow');
        }
      });
    }
  });
}
>>>>>>> 0cd98978b57529949d969ff3e42e6a3dcb3e1290

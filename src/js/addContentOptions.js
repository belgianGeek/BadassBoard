const addContentOptions = (element) => {

  const showOptionsOnHover = (element, child) => {
    $(child)
      .mouseenter(() => {
        // Show the removeContentBtn on content title hover
        $(`${element} .contentOptions`).css('display', 'flex');
      })
      .mouseleave(() => {
        $(`${element} .contentOptions`).hide();
      });
  }

  const removeContent = (parent, element2remove, child) => {
    if ($(element2remove).length) {
      showOptionsOnHover(parent, child);

      // Remove feed on button click
      $(`${parent} .removeContentBtn`).click(() => {
        $(element2remove).remove();

        addContent(`.${$(parent).parent().attr('class').match(/content\d__container/)}`, `.${$(parent).attr('class').match(/content\d{1,}/)}`);
      });
    }
  }

  const updateContent = (parent, element, child) => {
    if ($(element).length) {
      showOptionsOnHover(element, child);

      $(`${element} .updateContentBtn`).click(function() {
        // Update RSS
        if (element.match(/rss/i)) {
          socket.emit('update feed', {
            element: `.${$(this).parents('.rssContainer').parent().attr('id')}`,
            parent: `.${$(this).parents('.content__container').attr('id')}`
          });

          socket.on('feed updated', (parsedData) => {
            let parsedElt = `${parsedData.parent} ${parsedData.element}`;
            let feed = parsedData.feed;

            buildRssContainer(feed, (feed, rssContainer) => {
              $(`${parsedElt} .rssContainer`).replaceWith(rssContainer);

              let rssContainerHeader = $('<div></div>')
                .addClass('rssContainer__header')
                .prependTo(rssContainer);

              let feedTitle = $('<a></a>')
                .addClass('feedTitle')
                .attr({
                  href: feed[0].meta.link
                })
                .text(feed[0].meta.title)
                .prependTo(rssContainerHeader);

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

              addContentOptions(parsedElt);

              displayArticleSummary();

              $(`${parsedElt} .rssContainer__header`)
                .mouseenter(() => {
                  $(`${parsedElt} .contentOptions`).addClass('flex');
                })
                .mouseleave(() => {
                  $(`${parsedElt} .contentOptions`).addClass('flex');
                });
            });
          });
        } else if (element.match(/forecast/i)) {
          // Remove the "Weather in..." part of the title to extract the location
          let location = $('.forecast__header__title').text().split(' ');
          location.splice(0, 2);
          location = location[0];
          $.ajax({
            url: `https://api.openweathermap.org/data/2.5/find?q=${location}&units=metric&lang=en&appid=${owmToken}`,
            method: 'POST',
            dataType: 'json',
            statusCode: {
              401: () => {
                printError({
                  type: 'weather',
                  msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                  element: parent
                });
              },
              200: (forecast => {
                // Retrieve the updated data

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

                // Add content to the page
                $('.forecast__content__info__description__desc').text(previsions.description);
                $('.forecast__content__info__temp__desc').text(`${previsions.temp} °C`);
                $('.forecast__content__info__wind__desc').text(`${previsions.windSpeed} km/h`);
                $('.forecast__content__info__humidity__desc').text(`${previsions.humidity} %`);

                updateWeatherIcon(previsions);
              })
            }
          });
        }
      });
    }
  }

  // Clear search results
  const clearResults = (parent, element, child) => {
    if ($(element).length) {

      showOptionsOnHover(element, child);

      $(`${element} .contentOptions__clearResultsbtn`).click(function() {
        $('.youtubeSearchContainer__content__results').empty();
      });
    }
  }

  $(`${element} .rssContainer`).ready(() => {
    removeContent(element, `${element} .rssContainer`, `${element} .rssContainer__header`);
    updateContent(element, `${element} .rssContainer`, `${element} .rssContainer__header`);
  });

  $(`${element} .forecast`).ready(() => {
    removeContent(element, `${element} .forecast`, `${element} .forecast__header`);
    updateContent(element, `${element} .forecast`, `${element} .forecast__header`);
  });

  $(`${element} .youtubeSearchContainer`).ready(() => {
    removeContent(element, `${element} .youtubeSearchContainer`, `${element} .youtubeSearchContainer__header`);
    clearResults(element, `${element} .youtubeSearchContainer`, `${element} .youtubeSearchContainer__header`);
  });
}

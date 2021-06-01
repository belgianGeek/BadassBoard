const emptyConfirmationContent = () => $('.confirmation__child__content section').remove();

const addRemovalBtn = parentContainer => {
  let contentRemovalBtn = $('<img>')
    .addClass('contentRemovalBtn')
    .attr({
      alt: 'Remove content',
      src: './client/scss/icons/interface/cross.svg'
    })
    .appendTo(parentContainer)
    .click(function() {
      parentContainer = `.${$(parentContainer).parents('.content__container').attr('class').split(' ').join('.')} .${$(parentContainer).parents('.content').attr('class').split(' ').join('.')}`;

      const parent = parentContainer.split(' ')[0].match(/.content\d{1,}__container/)[0];
      const element = parentContainer.split(' ')[0].match(/.content\d{1,}/)[0];

      $(`.confirmation`)
        .fadeIn()
        .css('display', 'flex');

      // Make the div background blurry
      $('.mainContainer').addClass('blur');

      $(`${parentContainer} section`).clone().appendTo('.confirmation__child__content');

      // Disable page scroll
      disableScroll();

      $('.confirmation__child__btnContainer__saveBtn').click(function() {
        // Restore page scroll
        restoreScroll();

        // Remove the blur
        $('.mainContainer').removeClass('blur');

        $(`${parentContainer} .blank`).css('display', '');

        addContent(parent, element);

        emptyConfirmationContent();

        $('.confirmation').fadeOut();

        socket.emit('remove content', {
          parent: parent,
          element: element
        });

        // Remove the content div
        $(`${parentContainer} section`).remove();
        $(`${parentContainer} .blank`).removeClass('hidden');
      });

      $('.confirmation__child__btnContainer__cancelBtn, .click').click(() => {
        restoreScroll();
        emptyConfirmationContent();

        // Remove the blur
        $('.mainContainer').removeClass('blur');
        $('.confirmation').fadeOut();
      });
    });
}

const addContentOptions = (element) => {
  const updateContent = (parent, element, child) => {
    if ($(element).length) {
      let feedURL = $(`${element} .feedURL`).text();

      $(`${element} .updateContentBtn`).click(function() {
        // Update RSS
        if (element.match(/rss/i)) {
          socket.emit('update feed', {
            url: feedURL,
            // Send the parent element class to the server to send it back to the socket receiver down below
            parent: parent
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
      $(`${element} .contentOptions__clearResultsbtn`).click(function() {
        $('.youtubeSearchContainer__content__results').empty();
      });
    }
  }

  $(element).ready(() => {
    if ($(`${element} .article`).length) {
      updateContent(`.${$(element).parents('.content__container').attr('id')} .${$(element).parents('.content').attr('id')}`, element, `${element} .rssContainer__header`);
    }

    if ($(`${element} .forecast`).length) {
      updateContent(element, `${element} .forecast`, `${element} .forecast__header`);
    }

    if ($(`${element} .youtubeSearchContainer`).length) {
      clearResults(element, `${element} .youtubeSearchContainer`, `${element} .youtubeSearchContainer__header`);
    }
  });
}

// Place the socket receiver outside of the main function to avoid recursion
socket.on('feed updated', parsedData => {
  let feed = parsedData.feed;

  $(`${parsedData.parent} .rssContainer`).remove();

  buildRssContainer(feed, parsedData.parent, parsedData.url, (feed, rssContainer) => {
    rssContainer.appendTo(parsedData.parent);
    displayArticleSummary();
  });
});

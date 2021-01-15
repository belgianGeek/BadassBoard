const addContentOptions = (element) => {

  const emptyConfirmationContent = () => $('.confirmation__child__content section').remove();

  const removeContent = (parent, element2remove, child) => {
    if ($(element2remove).length) {
      let contentContainerParent = $(parent).parent().attr('class').match(/content\d__container/);
      let contentContainerChild = $(parent).attr('class').match(/content\d{1,}/);

      // Remove content on button click
      $(`${parent} .removeContentBtn`).click(() => {
        $(`.confirmation`)
          .fadeIn()
          .css('display', 'flex');

        // Make the div background blurry
        $('.mainContainer').addClass('blur');

        $(element2remove).clone().appendTo('.confirmation__child__content');

        // Disable page scroll
        disableScroll();

        $('.confirmation__child__btnContainer__saveBtn').click(function() {
          // Restore page scroll
          restoreScroll();

          // Remove the blur
          $('.mainContainer').removeClass('blur');

          $(`${parent} .blank`).css('display', '');

          addContent(`.${$(parent).parent().attr('class').match(/content\d__container/)}`, `.${$(parent).attr('class').match(/content\d{1,}/)}`);

          emptyConfirmationContent();

          $('.confirmation').fadeOut();

          socket.emit('remove content', {
            parent: `.${contentContainerParent}`,
            element: `.${contentContainerChild}`
          });

          // Remove the content div
          $(element2remove).remove();
          $(`.${contentContainerParent} .${contentContainerChild} .blank`).removeClass('hidden');
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
  }

  const updateContent = (parent, element, child) => {
    if ($(element).length) {

      $(`${element} .updateContentBtn`).click(function() {
        console.log($(this));
        // Update RSS
        if (element.match(/rss/i)) {
          socket.emit('update feed', {
            element: `.${$(this).parents('.rssContainer').parent().attr('id')}`,
            parent: `.${$(this).parents('.content__container').attr('id')}`
          });

          socket.on('feed updated', parsedData => {
            let parsedElt = `${parsedData.parent} ${parsedData.element}`;
            let feed = parsedData.feed;

            buildRssContainer(feed, parsedElt, (feed, rssContainer) => {
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
                  src: './client/scss/icons/interface/refresh.svg'
                })
                .appendTo(contentOptions);

              let removeContentBtn = $('<img>')
                .addClass('removeContentBtn')
                .attr({
                  alt: 'Remove content',
                  src: './client/scss/icons/interface/cross.svg'
                })
                .appendTo(contentOptions);

              displayArticleSummary();
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
      $(`${element} .contentOptions__clearResultsbtn`).click(function() {
        $('.youtubeSearchContainer__content__results').empty();
      });
    }
  }

  $(element).ready(() => {
    if ($(`${element} .article`).length) {
      removeContent(`.${$(element).parents('.content').attr('id')}`, element, `${element} .rssContainer__header`);
      updateContent(`.${$(element).parents('.content').attr('id')}`, element, `${element} .rssContainer__header`);
    }

    if ($(`${element} .forecast`).length) {
      removeContent(element, `${element} .forecast`, `${element} .forecast__header`);
      updateContent(element, `${element} .forecast`, `${element} .forecast__header`);
    }

    if ($(`${element} .youtubeSearchContainer`).length) {
      removeContent(element, `${element} .youtubeSearchContainer`, `${element} .youtubeSearchContainer__header`);
      clearResults(element, `${element} .youtubeSearchContainer`, `${element} .youtubeSearchContainer__header`);
    }
  });
}

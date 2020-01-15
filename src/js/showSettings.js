const showSettings = () => {

  const hideSettings = () => {
    if ($('.uploadWarning').length) {
      $('.uploadWarning').remove();
    }

    // restore page scroll
    restoreScroll();

    $('.backgroundImage, header, .mainContainer').css('filter', 'none');
    $('.settings__container').fadeOut();
  }

  // Create an object to store the new settings values
  let updatedSettings = {};
  let checkboxState = $('.toggleRss__Input').prop('checked');

  if (!checkboxState) {
    $('.toggleRss__Slider').addClass('unchecked');
  } else {
    $('.toggleRss__Slider').removeClass('unchecked');
  }

  $('.header__settingsBtn').click(() => {
    $('.backgroundImage, header, .mainContainer').css('filter', 'blur(4px)');

    // Disable page scroll
    disableScroll();

    $('.settings__container')
      .fadeIn()
      .css('display', 'flex');
  });

  // Simulate click on the input to upload a file and enable the rss feed feature on startup
  $('.backgroundImageUploadForm__Btn').click(() => {
    $('.backgroundImageUploadForm__InputFile').click();
  });

  $('.toggleRss__Switch').click(() => {
    updatedSettings.RSS = $('.toggleRss__Input').prop('checked');
    // Adapt the design of the slider if the input is checked
    if (!$('.toggleRss__Input').prop('checked')) {
      $('.toggleRss__Slider').addClass('unchecked');
    } else {
      $('.toggleRss__Slider').removeClass('unchecked');
    }
  });

  $('.settings__child__cancelBtn').click(() => {
    hideSettings();
  });

  // Watch for search engine changes
  $('.searchEngineSelection__select').on('change', () => {
    let searchEngineValue = $('.searchEngineSelection__select').val();
    updatedSettings.searchEngine = {};

    updatedSettings.searchEngine.label = searchEngineValue;

    if (searchEngineValue === 'Bing') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.bing.com/search?q=';
    } else if (searchEngineValue === 'DuckDuckGo') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://duckduckgo.com/?q=';
    } else if (searchEngineValue === 'Ecosia') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.ecosia.org/search?q=';
    } else if (searchEngineValue === 'Google') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.google.com/search?q=test';
    } else if (searchEngineValue === 'Qwant') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.qwant.com/?q=';
    }
  });

  $('.settings__child__saveBtn').click(() => {
    // Is there error = true, cancel the settings div hiding
    let error = false;

    // Only submit the form if one of the fields are fullfilled
    if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() === '') {
      let file = $('.backgroundImageUploadForm__InputFile').get(0).files[0];

      // Check if file is not too large by converting bytes to megabytes
      if ((file.size / 1048576) > 5) {
        error = true;

        printError({
          type: 'upload',
          msg: 'Your file is too laaaaarge ! Please select one under 5 Mb.'
        });
      } else {
        updatedSettings.backgroundImage = `./upload/${file.name}`;

        let fd = new FormData();
        fd.append('backgroundImageUploadInput', file, file.name);

        $.ajax({
          url: '/upload',
          type: 'POST',
          data: fd,
          processData: false,
          contentType: false,
          statusCode: {
            404: () => {
              console.log('page not found !');
            },
            200: () => {
              console.log('upload successfull !');
            }
          },
          success: (res) => {
            // console.log(fd, file, `${updatedSettings.backgroundImage} uploaded successfully`);
            $('.backgroundImage').css('backgroundImage', `url(${updatedSettings.backgroundImage})`);

            // Update the <style> tag to fix the blur
            $('head style').remove();
            $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage});}</style>`);
          },
          error: (err) => {
            console.log(fd, file, `Error uploading file :\n${JSON.stringify(err, null, 2)}`);
          }
        });
      }
    } else {
      if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
        if ($('.backgroundImageUploadForm__InputUrl').val().match(/^(http|https):\/\/(www.|)[a-zA-Z0-9-\.\/]{1,}\.\w.+/i)) {
          if ($('.backgroundImageUploadForm__InputUrl').val().length < 200) {
            updatedSettings.backgroundImage = $('.backgroundImageUploadForm__InputUrl').val();
            $('.backgroundImage').css('backgroundImage', `url(${updatedSettings.backgroundImage})`);

            // Update the formContainer::before background-image
            if ($('head style').length) {
              for (var i = 0; i < $('head style').length; i++) {
                if ($('head style')[i].textContent === headStyle) {
                  $('head style')[i].remove();
                }
              }

              $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage}); !important}</style>`);
            } else {
              $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage}); !important}</style>`);
            }
          } else {
            error = true;
            printError({
              type: 'upload',
              msg: 'Your URL is too large ! Please shorten it !'
            });
          }
        } else {
          error = true;
          printError({
            type: 'upload',
            msg: 'Your URL is not supported... Please try another one or open an issue on Github'
          });
        }
      } else if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
        error = true;
        printError({
          type: 'upload',
          msg: 'Hey, don\'t be too powerful dude ! One field at a time !'
        });
      }

      if (updatedSettings.RSS !== undefined) {
        // Reload the page if the RSS status is modified to be true
        if (updatedSettings.RSS === true) {
          // Send the updated RSS status to the server
          socket.emit('customization', updatedSettings);
          location.reload();
        } else {
          $('.moreContent').hide();
        }
      }

      if (checkboxState !== $('.toggleRss__Input').prop('checked')) {}

      if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() === '' && $('.owmToken__input').val() === '') {
        // If none of the fields are fullfilled, just hide the settings menu
        $('.backgroundImage, header, .mainContainer')
          .css('filter', 'none');

        $('.settings__container').fadeOut();
      }

      if ($('.owmToken__input').val().match(/[a-z0-9]{32}/)) {
        // OpenWeatherMap token
        updatedSettings.owmToken = $('.owmToken__input').val();
        owmToken = $('.owmToken__input').val();
      }
    }

    $('.owmToken__input').val(updatedSettings.owmToken);

    // If there is no errors, hide the div
    if (!error) {

      hideSettings();

      // Send the updated settings to the server
      socket.emit('customization', updatedSettings);

      if ($('.uploadWarning').length) {
        $('.uploadWarning').remove();
      }
    }
  });
}

const showSettings = () => {

  const hideSettings = () => {
    if ($('.uploadWarning').length) {
      $('.uploadWarning').remove();
    }

    // restore page scroll
    restoreScroll();

    $('.backgroundImage, header, .mainContainer').removeClass('blur');
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
    $('.backgroundImage, header, .mainContainer').addClass('blur');

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

  // Upload bot avatar event handler
  $('.chatCustomizationForm__btn').click(() => {
    $('.chatCustomizationForm__inputFile').click();
  });

  $('.toggleRss__Switch').click(() => {
    updatedSettings.RSS = $('.toggleRss__Input').prop('checked');
    // Adapt the design of the slider if the input is checked
    if (!$('.toggleRss__Input').prop('checked')) {
      $('.toggleRss__Slider').addClass('unchecked');

      // Hide the content containers
      $('.contentContainers').toggleClass('hidden flex');
      $('.footer').toggleClass('fixed');
    } else {
      $('.toggleRss__Slider').removeClass('unchecked');

      if ($('.contentContainers').hasClass('hidden')) {
        $('.contentContainers').toggleClass('hidden flex');
      }

      if ($('.footer').hasClass('fixed')) {
        $('.footer').toggleClass('fixed');
      }
    }
  });

  $('.settings__child__cancelBtn').click(() => {
    hideSettings();
    $('.backgroundImageUploadForm__InputFile').val('');
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
    // Wallpaper upload
    if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() === '') {
      let file = $('.backgroundImageUploadForm__InputFile').get(0).files[0];

      // Check if file is not too large by converting bytes to megabytes
      if ((file.size / 1048576) > 5) {
        error = true;

        printError({
          type: 'wallpaper upload',
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
          success: (res) => {
            console.log(`${file.name} was uploaded successfully !`);
            $('.backgroundImage').css('backgroundImage', `url(${updatedSettings.backgroundImage})`);

            // Update the <style> tag to fix the blur
            $('head style').remove();
            $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage});}</style>`);
          },
          error: (err) => {
            printError({
              type: 'generic',
              msg: 'Your new wallpaper failed uploading... Please check the logs for details.'
            });

            console.log(fd, file, `Error uploading wallpaper :\n${JSON.stringify(err, null, 2)}`);
          }
        })
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
              type: 'wallpaper upload',
              msg: 'Your URL is too large ! Please shorten it !'
            });
          }
        } else {
          error = true;
          printError({
            type: 'wallpaper upload',
            msg: 'Your URL is not supported... Please try another one or open an issue on Github'
          });
        }
      } else if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
        error = true;
        printError({
          type: 'wallpaper upload',
          msg: 'Hey, don\'t be too powerful dude ! One field at a time !'
        });
      }

      if (checkboxState !== $('.toggleRss__Input').prop('checked')) {}

      if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() === '' && $('.owmToken__input').val() === '') {
        // If none of the fields are fullfilled, just hide the settings menu
        $('.backgroundImage, header, .mainContainer').removeClass('blur');

        $('.settings__container').fadeOut();
      }

      if ($('.owmToken__input').val().match(/[a-z0-9]{32}/)) {
        // OpenWeatherMap token
        updatedSettings.owmToken = owmToken = $('.owmToken__input').val();
      }
    }

    // Chatbot avatar upload
    if ($('.chatCustomizationForm__inputFile').val() !== '' && $('.chatCustomizationForm__inputUrl').val() === '') {
      let file = $('.chatCustomizationForm__inputFile').get(0).files[0];

      if ((file.size / 1048576) > 5) {
        error = true;

        printError({
          type: 'avatar upload',
          msg: 'Your file is too laaaaarge ! Please select one under 5 Mb.'
        });
      } else {
        updatedSettings.bot = {
          icon: `./upload/${file.name}`
        }

        let fd = new FormData();
        fd.append('chatBotAvatarUploadInput', file, file.name);

        $.ajax({
          url: '/upload',
          type: 'POST',
          data: fd,
          processData: false,
          contentType: false,
          success: (res) => {
            console.log(`${file.name} was uploaded successfully !`);
            $('.chatContainer__botInfo__icon').attr('src', updatedSettings.bot.icon);
          },
          error: (err) => {
            console.log(fd, file, `Error uploading bot avatar :\n${JSON.stringify(err, null, 2)}`);
          }
        })
      }
    } else {
      if ($('.chatCustomizationForm__inputFile').val() === '' && $('.chatCustomizationForm__inputUrl').val() !== '') {
        if ($('.chatCustomizationForm__inputUrl').val().match(/^(http|https):\/\/(www.|)[a-zA-Z0-9-\.\/]{1,}\.\w.+/i)) {
          if ($('.chatCustomizationForm__inputUrl').val().length < 250) {
            updatedSettings.bot = {
              icon: $('.chatCustomizationForm__inputUrl').val()
            }

            $('.chatContainer__botInfo__icon').attr('src', updatedSettings.bot.icon);

          } else {
            error = true;
            printError({
              type: 'avatar upload',
              msg: 'Your URL is too large ! Please shorten it !'
            });
          }
        } else {
          error = true;
          printError({
            type: 'avatar upload',
            msg: 'Your URL is not supported... Please try another one or open an issue on Github'
          });
        }
      } else if ($('.chatCustomizationForm__inputFile').val() !== '' && $('.chatCustomizationForm__inputUrl').val() !== '') {
        error = true;
        printError({
          type: 'avatar upload',
          msg: 'Hey, don\'t be too powerful dude ! One field at a time !'
        });
      }
    }

    $('.owmToken__input').val(updatedSettings.owmToken);

    // ChatBot name
    if ($('.botNameCustomizationForm__input').val() !== '' && $('.botNameCustomizationForm__input').val() !== $('.chatContainer__botInfo p').text()) {
      updatedSettings.bot = {
        name: $('.botNameCustomizationForm__input').val()
      };

      $('.chatContainer__botInfo p').text(updatedSettings.bot.name);
    }

    // If there is no errors, hide the div
    if (!error) {

      hideSettings();

      // Send the updated settings to the server
      socket.emit('customization', updatedSettings);

      // Reset the updatedSettings object to its default value
      updatedSettings = {};

      // Reset the file upload input value
      $('.backgroundImageUploadForm__InputFile').val('');

      if ($('.uploadWarning').length) {
        $('.uploadWarning').remove();
      }

      if (updatedSettings.RSS !== undefined) {
        // Reload the page if the RSS status is modified to be true
        if (updatedSettings.RSS === true) {
          location.reload();
        } else {
          $('.contentContainers').hide();
        }
      }
    }
  });
}

const showSettings = () => {
  let avatarEncoded, wallpaperEncoded;

  const compress = (input, type, callback) => {
    const file = document.querySelector(input).files[0];
    if (!file) {
      return console.error('Compression failed because there is no file !');
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = event => {
        const img = document.createElement('img');
        img.src = event.target.result;

        img.onload = e => {
          const maxWidth = window.innerWidth;
          const canvas = document.createElement('canvas');
          canvas.height = e.target.height * (maxWidth / e.target.width);
          canvas.width = maxWidth;

          const ctx = canvas.getContext('2d');

          ctx.drawImage(e.target, 0, 0, canvas.width, canvas.height);

          if (input === '.backgroundImageUploadForm__InputFile') {
            wallpaperEncoded = ctx.canvas.toDataURL(type, 0.8);
            callback(wallpaperEncoded);
          } else {
            avatarEncoded = ctx.canvas.toDataURL(type, 0.8);
            callback(avatarEncoded);
          }
        }
      }
    }
  }

  const hideSettings = () => {
    if ($('.uploadWarning').length) {
      $('.uploadWarning').remove();
    }

    // restore page scroll
    restoreScroll();

    $('.backgroundImage, header, .mainContainer').removeClass('blur');
    $('.settings__container').fadeOut();
  }

  // Only submit the form if one of the fields are fullfilled
  // Wallpaper upload
  const check4WallpaperUpload = () => {
    return new Promise((resolve, reject) => {
      if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() === '') {
        let file = $('.backgroundImageUploadForm__InputFile')[0].files[0];

        // Check if the file is not too large by converting bytes to megabytes
        if ((file.size / 1048576) > 4.8) {
          error = true;

          printError({
            type: 'wallpaper upload',
            msg: 'Your file is too laaaaarge ! Please select one under 5 Mb.'
          });

          reject('Your file is too laaaaarge ! Please select one under 5 Mb.');
        } else {
          compress('.backgroundImageUploadForm__InputFile', 'image/jpeg', data => {
            updatedSettings.backgroundImage = data;

            resolve(data);
          });
        }
      } else if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() === '') {
        let data;
        resolve(data);
      } else {
        if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
          if ($('.backgroundImageUploadForm__InputUrl').val().match(/^(http|https):\/\/(www.|)[a-zA-Z0-9-\.\/]{1,}\.\w.+/i)) {
            if ($('.backgroundImageUploadForm__InputUrl').val().length < 200) {
              updatedSettings.backgroundImage = $('.backgroundImageUploadForm__InputUrl').val();

              resolve(updatedSettings.backgroundImage);
            } else {
              error = true;
              printError({
                type: 'wallpaper upload',
                msg: 'Your URL is too large ! Please shorten it !'
              });

              reject('Your URL is too large ! Please shorten it !');
            }
          } else {
            error = true;
            printError({
              type: 'wallpaper upload',
              msg: 'Your URL is not supported... Please try another one or open an issue on Github'
            });

            reject('Your URL is not supported... Please try another one or open an issue on Github');
          }
        } else if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
          error = true;
          printError({
            type: 'wallpaper upload',
            msg: 'Hey, don\'t be too powerful dude ! One field at a time !'
          });

          reject('Hey, don\'t be too powerful dude ! One field at a time !');
        } else if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() === '' && $('.owmToken__input').val() === '') {
          // If none of the fields are fullfilled, just hide the settings menu
          $('.backgroundImage, header, .mainContainer').removeClass('blur');

          $('.settings__container').fadeOut();
        }
      }
    });
  }

  // Chatbot avatar upload
  const check4AvatarUpload = () => {
    return new Promise((resolve, reject) => {
      if ($('.chatCustomizationForm__inputFile').val() !== '' && $('.chatCustomizationForm__inputUrl').val() === '') {
        let file = $('.chatCustomizationForm__inputFile')[0].files[0];

        if ((file.size / 1048576) > 4.8) {
          error = true;

          printError({
            type: 'avatar upload',
            msg: 'Your file is too laaaaarge ! Please select one under 5 Mb.'
          });

          reject('Your file is too laaaaarge ! Please select one under 5 Mb.');
        } else {
          compress('.chatCustomizationForm__inputFile', 'image/png', data => {
            updatedSettings.bot = {
              icon: data
            }

            $('.chatContainer__botInfo__icon').attr('src', data);

            resolve(data);
          });
        }
      } else if ($('.chatCustomizationForm__inputFile').val() === '' && $('.chatCustomizationForm__inputUrl').val() === '') {
        let data;
        resolve(data);
      } else {
        if ($('.chatCustomizationForm__inputFile').val() === '' && $('.chatCustomizationForm__inputUrl').val() !== '') {
          if ($('.chatCustomizationForm__inputUrl').val().match(/^(http|https):\/\/(www.|)[a-zA-Z0-9-\.\/]{1,}\.\w.+/i)) {
            if ($('.chatCustomizationForm__inputUrl').val().length < 250) {
              updatedSettings.bot = {
                icon: $('.chatCustomizationForm__inputUrl').val()
              }

              $('.chatContainer__botInfo__icon').attr('src', updatedSettings.bot.icon);

              resolve(updatedSettings.bot.icon);
            } else {
              error = true;
              printError({
                type: 'avatar upload',
                msg: 'Your URL is too large ! Please shorten it !'
              });

              reject('Your URL is too large ! Please shorten it !');
            }
          } else {
            error = true;
            printError({
              type: 'avatar upload',
              msg: 'Your URL is not supported... Please try another one or open an issue on Github'
            });

            reject('Your URL is not supported... Please try another one or open an issue on Github');
          }
        } else if ($('.chatCustomizationForm__inputFile').val() !== '' && $('.chatCustomizationForm__inputUrl').val() !== '') {
          error = true;
          printError({
            type: 'avatar upload',
            msg: 'Hey, don\'t be too powerful dude ! One field at a time !'
          });

          reject('Hey, don\'t be too powerful dude ! One field at a time !');
        }
      }
    });
  }

  // Create an object to store the new settings values
  let updatedSettings = {};

  // Is there error = true, cancel the settings div hiding
  let error = false;

  let checkboxState = $('.toggleRss__Input').prop('checked');

  if (!checkboxState) {
    $('.toggleRss__Slider').addClass('unchecked');
  } else {
    $('.toggleRss__Slider').removeClass('unchecked');
  }

  $('.settingsLink').click(() => {
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
      $('.contentContainers')
        .fadeOut()
        .toggleClass('hidden flex')
        .removeAttr('style');
      $('.footer').toggleClass('fixed');
    } else {
      $('.toggleRss__Slider').removeClass('unchecked');

      if ($('.contentContainers').hasClass('hidden')) {
        $('.contentContainers')
          .fadeIn()
          .toggleClass('hidden flex')
          .removeAttr('style');
      }

      if ($('.footer').hasClass('fixed')) {
        $('.footer').toggleClass('fixed');
      }
    }
  });

  $('.settings__child__cancelBtn').click(() => {
    hideSettings();
    $('.backgroundImageUploadForm__InputFile, .chatCustomizationForm__inputFile').val('');

    if ($('.contentContainers').hasClass('hidden')) {
      $('.contentContainers')
        .fadeIn()
        .toggleClass('hidden flex')
        .removeAttr('style');
    }
  });

  $('.settings__child__saveBtn').click(() => {
    if ($('.owmToken__input').val().match(/[a-z0-9]{32}/)) {
      // OpenWeatherMap token
      updatedSettings.owmToken = owmToken = $('.owmToken__input').val();
    }

    $('.owmToken__input').val(updatedSettings.owmToken);

    // ChatBot name
    if ($('.botNameCustomizationForm__input').val() !== '' && $('.botNameCustomizationForm__input').val() !== $('.chatContainer__botInfo p').text()) {
      updatedSettings.bot = {
        name: $('.botNameCustomizationForm__input').val()
      };

      $('.chatContainer__botInfo p').text(updatedSettings.bot.name);
    }

    check4WallpaperUpload()
      .then(data => {
        if (data !== undefined) {
          $('head style').remove();

          headStyle = `<style>.formContainer__container::before {background-image: url(${data});}</style>`;
          $('head').append(headStyle);

          $('.backgroundImage').css('backgroundImage', `url(${data})`);
        }
      })
      .then(() => {
        check4AvatarUpload()
          .then(data => {
            // If there aren't any errors, hide the div
            if (!error) {

              hideSettings();

              // Send the updated settings to the server
              socket.emit('customization', updatedSettings);

              // Reset the file upload input value
              $('.backgroundImageUploadForm__InputFile').val('');

              if ($('.uploadWarning').length) {
                $('.uploadWarning').remove();
              }

              if (updatedSettings.RSS !== undefined) {
                // Reload the page if the RSS status is modified to be true
                if (updatedSettings.RSS) {
                  location.reload();
                } else {
                  $('.contentContainers').hide();
                }
              }
            }

            $('.backgroundImageUploadForm__InputFile, .chatCustomizationForm__inputFile').val('');

            // Reset the updatedSettings object to its default value
            socket.on('customization data retrieved', () => {
              updatedSettings = {};
            });
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
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
}

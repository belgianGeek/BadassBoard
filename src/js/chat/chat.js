//Websocket connection
const socket = io();

// Define the message ID
let msgID = 0;

// Get the background image from the settings and add it to the page
$.ajax({
  url: './settings/settings.json',
  method: 'GET',
  dataType: 'json'
}).done(settings => {
  if (settings.backgroundImage !== undefined) {
    const handle404ImageError = () => {
      let backrgoundImageReply = $('<span></span>')
        .addClass('msg reply')
        .text('Sorry, your background image couldn\'t be loaded... Maybe try another one')
        .appendTo('.msgContainer__msgList__list');

      $('.backgroundImage').css('backgroundImage', '');
    }

    $.ajax({
        url: settings.backgroundImage,
        method: 'GET',
        dataType: '',
        statusCode: {
          200: () => {
            $('.backgroundImage').css('backgroundImage', `url(${settings.backgroundImage})`);
          },
          404: () => {
            handle404ImageError();
          }
        }
      })
      .fail(err => {
        // CORS error handling
        if (err.statusText === 'error' && err.readyState === 0) {
          handle404ImageError();
        }
      });
  }

  if (settings.owmToken !== undefined) {
    owmToken = settings.owmToken;
  }
});

$('.msgContainer__msgList__form').submit((event) => {
  event.preventDefault();
  let msg = new Message();
  msg.send();
});

$('.header__homeIcon').click(() => {
  window.open('/');
});

$('.header__settingsBtn').click(() => {
  showSettings();
});

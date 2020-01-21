//Websocket connection
const socket = io();

// Get the background image from the settings and add it to the page
$.ajax({
  url: './settings/settings.json',
  method: 'GET',
  dataType: 'json'
}).done(settings => {
  if (settings.backgroundImage !== undefined) {
    const handle404ImageError = () => {
      $('.msgContainer').text('Sorry, your background image couldn\'t be loaded... Maybe try another one')
      fade('.msgContainer');

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

$('.msgContainer__form').submit((event) => {
  event.preventDefault();
  let msg = new Message();
  msg.send();
});

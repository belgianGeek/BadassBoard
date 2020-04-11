//Websocket connection
const socket = io();

// Define the message ID
let msgID = 0;

let msgAuthor = '';

Array.prototype.random = function() {
  return this[Math.floor((Math.random() * this.length))];
}

// Get the background image from the settings and add it to the page
$.ajax({
  url: './settings/settings.json',
  method: 'GET',
  dataType: 'json'
}).done(settings => {
  if (settings.searchEngine !== undefined) {
    $('.searchEngineSelection__select').val(settings.searchEngine.label);
  } else {
    $('.searchEngineSelection__select').val(searchEngine.label);

    // Send the search engine to the server
    socket.emit('customization', searchEngine);
  }

  if (settings.RSS) {
    $('.toggleRss__Input').prop('checked', true);
    $('.toggleRss__Slider').removeClass('unchecked');
  } else {
    $('.toggleRss__Input').prop('checked', false);
  }

  if (settings.bot.name !== 'BadassBot') {
    $('.botNameCustomizationForm__input').val(settings.bot.name);
  }

  if (settings.bot.icon.startsWith('http')) {
    $('.chatCustomizationForm__inputUrl').val(settings.bot.icon);
  }
});

socket.on('username', username => {
  msgAuthor = username;
  console.log(msgAuthor);
});

socket.on('wallpaper', wallpaper => {
  const handle404ImageError = () => {
    if (!$('.backgroundMsg').length) {
      let backrgoundImageReply = $('<span></span>')
        .addClass('msg reply backgroundMsg')
        .text('Sorry, your background image couldn\'t be loaded... Maybe try another one')
        .appendTo('.chatContainer__msgList__list');
    }

    $('.backgroundImage').css('backgroundImage', '');
  }

  $.ajax({
      url: wallpaper,
      method: 'GET',
      dataType: '',
      statusCode: {
        200: () => {
          $('.backgroundImage').css('backgroundImage', `url(${wallpaper})`);
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
});

socket.on('bot avatar', avatar => {
  const handle404ImageError = () => {
    if (!$('.avatarMsg').length) {
      let backgroundImageReply = $('<span></span>')
        .addClass('msg reply avatarMsg')
        .text('Sorry, my new avatar couldn\'t be loaded... Maybe try another one')
        .appendTo('.chatContainer__msgList__list');
    }

    $('.chatContainer__botInfo__icon').attr('src', './src/scss/icons/interface/bot.png');
  }

  $.ajax({
      url: avatar,
      method: 'GET',
      dataType: '',
      statusCode: {
        200: () => {
          $('.chatContainer__botInfo__icon').attr('src', avatar);
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
});

$('.chatContainer__msgList__form').submit(event => {
  event.preventDefault();
  let msg = new Message();
  msg.send();
  console.log(msg);
});

$('.header__homeIcon').click(() => {
  window.open('/', '_self');
});

showSettings();

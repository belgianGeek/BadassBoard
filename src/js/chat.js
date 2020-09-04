// Define the message ID
let msgID = 0;

let msgAuthor = '';

Array.prototype.random = function() {
  return this[Math.floor((Math.random() * this.length))];
}

socket.on('username', username => {
  msgAuthor = username;
  console.log(msgAuthor);
});

// Get the background image and add it to the page
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

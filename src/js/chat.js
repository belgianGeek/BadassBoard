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

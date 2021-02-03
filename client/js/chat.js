// Define the message ID
let msgID = 0;

let msgAuthor = '';

Array.prototype.random = function() {
  return this[Math.floor((Math.random() * this.length))];
}

socket.on('username', username => {
  msgAuthor = username;
});

socket.on('bot avatar', avatar => {
  const handle404ImageError = () => {
    if (!$('.avatarMsg').length) {
      let backgroundImageReply = $('<span></span>')
        .addClass('msg reply avatarMsg')
        .text('Sorry, my new avatar couldn\'t be loaded... Maybe try another one')
        .appendTo('.chatContainer__msgList__list');
    }

    $('.chatContainer__botInfo__icon').attr('src', './client/scss/icons/interface/bot.png');
  }

  $.ajax({
      url: avatar,
      method: 'GET',
      success: () => {
        $('.chatContainer__botInfo__icon').attr('src', avatar);
      }
    })
    .fail(err => {
      // CORS error handling
      if (err.status !== 200) {
        handle404ImageError();
      }
    });
});

$('.chatContainer__msgList__form').submit(event => {
  event.preventDefault();
  let msg = new Message();
  msg.send();
});

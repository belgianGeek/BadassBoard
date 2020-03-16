const Message = function() {
  this.author = 'Max';
  this.content = $('.chatContainer__msgList__form__inputMsg').val();
  this.id = msgID;
  this.dateTime = new Date();
  this.send = function() {
    return new Promise((fullfill, reject) => {
      if (this.content !== null && this.content !== '') {
        let chatContainer = $('<span></span>')
          .addClass('msg flex')
          .text(this.content)
          .appendTo('.chatContainer__msgList__list');

        socket.emit('chat msg', this);
        $('.chatContainer__msgList__form__inputMsg').val('');
        msgID++;
        fullfill(this);
      } else {
        reject(this);
      }
    });
  }
}

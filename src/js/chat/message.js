const Message = function() {
  this.author = 'Max';
  this.content = $('.msgContainer__msgList__form__inputMsg').val();
  this.id = msgID;
  this.dateTime = new Date();
  this.send = function() {
    return new Promise((fullfill, reject) => {
      if (this.content !== null && this.content !== '') {
        let msgContainer = $('<span></span>')
          .addClass('msg flex')
          .text(this.content)
          .appendTo('.msgContainer__msgList__list');

        socket.emit('chat msg', this);
        $('.msgContainer__msgList__form__inputMsg').val('');
        msgID++;
        fullfill(this);
      } else {
        reject(this);
      }
    });
  }
}

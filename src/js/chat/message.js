const Message = function() {
  this.author = 'Max';
  this.content = $('.msgContainer__form__inputMsg').val();
  this.dateTime = new Date();
  this.send = function() {
    let msgContainer = $('<span></span>')
      .addClass('msg flex')
      .text(`${this.content}`)
      .appendTo('.msgContainer__list');

    socket.emit('chat msg', this.content);
  }
}

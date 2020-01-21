const Message = function() {
  this.author = 'Max';
  this.content = $('.mainContainer__form__inputMsg').val();
  this.dateTime = new Date();
  this.send = function() {
    if (this.content !== null && this.content !== '') {
      let msgContainer = $('<span></span>')
        .addClass('msg flex')
        .text(this.content)
        .appendTo('.msgContainer__list');

      socket.emit('chat msg', this);
      $('.mainContainer__form__inputMsg').val('');
    }
  }
}

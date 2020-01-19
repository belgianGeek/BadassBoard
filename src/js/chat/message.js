const Message = function() {
  this.author = 'Max';
  this.content = $('.msg__container__inputMsg').val();
  this.dateTime = new Date();
  this.send = function() {
    socket.emit('chat msg', this.content);
  }
}

socket.on('reply', reply => {
  reply.add = function() {
    setTimeout(() => {
      let replyElt = $('<span></span>')
        .addClass('msg reply')
        .text(reply.content)
        .appendTo('.msgContainer__list');
    }, 1000);
  }
  
  reply.add();
});

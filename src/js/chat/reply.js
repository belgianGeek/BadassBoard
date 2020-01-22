socket.on('reply', reply => {
  reply.add = function() {
    setTimeout(() => {
      let replyElt = $('<span></span>')
        .addClass('msg reply')
        .text(reply.content)
        .appendTo('.msgContainer__msgList__list');
    }, 500);
  }

  reply.add();
});

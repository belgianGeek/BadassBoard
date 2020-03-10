socket.on('reply', reply => {
  console.log(JSON.stringify(reply, null, 2));
  reply.add = function() {
    setTimeout(() => {
      let replyElt = $('<span></span>')
        .addClass('msg reply')
        .text(reply.content)
        .appendTo('.msgContainer__msgList__list');
    }, 500);
  };

  reply.addEmbed = function() {
    let fieldsContainer = $('<div></div>')
      .addClass('embed__fields');

    for (const field of reply.content.fields) {
      let span = $('<span></span>')
        .addClass('embed__field')
        .append(field)
        .appendTo(fieldsContainer);
    }

    let replyElt = $('<span></span>')
      .addClass('msg reply embed')
      .css('border-left', `0.5em solid ${reply.content.color}`)
      .append(`<img src="${reply.content.icon}" alt="${reply.content.title} icon" class="embed__icon"/>`)
      .append(`<a href="${reply.content.url}" class="embed__title">${reply.content.title}</a>`)
      .append(fieldsContainer)
      .append(`<article class="embed__desc">${reply.content.description}</article>`)
      .append(`<img src="${reply.content.img}" alt="${reply.content.title} picture" class="embed__pic"/>`)
      .appendTo('.msgContainer__msgList__list');
  }

  if (reply.theme !== 'wiki' && reply.theme !== 'movie review') {
    reply.add();
  } else {
    reply.addEmbed();
  }
});

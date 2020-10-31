socket.on('reply', reply => {

  reply.add = function() {
    setTimeout(() => {
      let replyElt = $('<span></span>')
        .addClass('msg reply')
        .append(reply.content)
        .appendTo('.chatContainer__msgList__list');
    }, 500);
  };

  reply.addEmbed = function() {
    let replyElt = $('<span></span>').addClass('msg reply embed');

    if (reply.content.title !== undefined) {
      let fieldsContainer = $('<div></div>').addClass('embed__fields');

      replyElt
        .css('border-left', `0.5em solid ${reply.content.color}`)
        .append(`<img src="${reply.content.icon}" alt="${reply.content.title} icon" class="embed__icon"/>`)
        .append(`<a href="${reply.content.url}" class="embed__title">${reply.content.title}</a>`);

      if (reply.content.fields !== undefined) {
        for (const [i, field] of reply.content.fields.entries()) {
          let div = $('<div></div>')
            .addClass('embed__field')
            .append(field)
            .appendTo(fieldsContainer);

          if (i === reply.content.fields.length - 1) {
            replyElt.append(fieldsContainer);
          }
        }
      }

      replyElt.append(`<article class="embed__desc">${reply.content.description}</article>`);

      if (reply.content.img !== undefined) {
        replyElt.append(`<img src="${reply.content.img}" alt="${reply.content.title} picture" class="embed__pic"/>`)
      }
    } else {
      replyElt.append(`<span>${reply.content}</span>`);
    }

    replyElt.appendTo('.chatContainer__msgList__list');
  }

  if (reply.theme !== 'wiki' && reply.theme !== 'movie review') {
    reply.add();
  } else {
    reply.addEmbed();
  }
});

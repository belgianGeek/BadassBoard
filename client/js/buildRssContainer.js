const buildRssContainer = (feed, callback) => {
  let rssContainer = $('<section></section>');
  let linksContainer = $('<div></div>');
  for (let i = 0; i <= 50; i++) {
    if (feed[i] !== undefined && feed[i].title !== undefined && feed[i].link !== undefined) {
      let article = $('<div></div>')
        .addClass('article flex')
        .appendTo(linksContainer);

      let link = $('<a></a>')
        .addClass('link')
        .attr('href', feed[i].link)
        .append(`<span>${feed[i].title}</span>`)
        .appendTo(article);


      let summary = $('<div></div>')
        .addClass('article__desc')
        .append(feed[i].summary)
        .appendTo(linksContainer);

      if (i % 10 === 0 && i !== 0) {
        linksContainer
          .addClass('linksContainer')
          .appendTo(rssContainer);

        if (i > 10) rssContainer.addClass('rssContainer hidden')
        else rssContainer.addClass('rssContainer flex');

        callback(feed, rssContainer);
        console.log(i, feed[i].title);

        rssContainer = $('<section></section>');
        linksContainer = $('<div></div>');
      }
    }
  }
}

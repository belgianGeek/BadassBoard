const buildRssContainer = (feed, callback) => {
  let rssContainer = $('<section></section>');
  let linksContainer = $('<div></div>');
  for (let i = 0; i < 10; i++) {
    if (feed[i] !== undefined && feed[i].title !== undefined && feed[i].link !== undefined) {
      rssContainer
        .addClass('rssContainer flex');

      linksContainer
        .addClass('linksContainer')
        .appendTo(rssContainer);

      let article = $('<div></div>')
        .addClass('article flex')
        .appendTo(linksContainer);

      let link = $('<a></a>')
        .addClass('link')
        .attr('href', feed[i].link)
        .text(feed[i].title)
        .appendTo(article);


      let summary = $('<div></div>')
        .addClass('article__desc')
        .append(feed[i].summary)
        .appendTo(linksContainer);
    }
  };
  callback(feed, rssContainer);
}

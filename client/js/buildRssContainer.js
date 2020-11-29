const buildRssContainer = (feed, fullElementClassName, callback) => {
  let rssContainer = $('<section></section>');
  let linksContainer = $('<div></div>');
  let length = 50;
  console.log(feed[0].meta.title, feed.length);

  if (feed.length <= length) length = feed.length;

  let pageCount = (length - 1).toString().split('');
  for (let i = 0; i < length; i++) {
    if (feed[i] !== undefined && i <= 49) {
      if (feed[i].meta.title === 'Korben') console.log(i, feed[i].title);
      else console.log(i, feed[i].meta.title);
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

      if ((i + 1) % 10 === 0 && i > 0) {
        linksContainer
          .addClass('linksContainer')
          .appendTo(rssContainer);

        if (i > 10) rssContainer.addClass('rssContainer hidden')
        else rssContainer.addClass('rssContainer flex');

        let leftArrow = $('<svg class="rssContainer__arrows__left" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>');
        let rightArrow = $('<svg class="rssContainer__arrows__right" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>');

        let totalPages;
        if (pageCount[1] > 0) totalPages = Number(pageCount[0]) + 1;
        else totalPages = Number(pageCount[0]);

        let arrowsContainer = $('<span></span>')
          .addClass('rssContainer__arrows')
          .prepend(leftArrow)
          .append(`<span>1 / ${totalPages}</span>`)
          .append(rightArrow)
          .appendTo(rssContainer);

        callback(feed, rssContainer);

        rssContainer = $('<section></section>');
        linksContainer = $('<div></div>');
      }
    }
  }
}

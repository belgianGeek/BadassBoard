const buildRssContainer = (feed, fullElementClassName, callback) => {
  let rssContainer = $('<section></section>');
  let linksContainer = $('<div></div>');
  let length = 50;
  console.log(feed[0].meta.title, feed.length);

  if (feed.length <= length) length = feed.length;

  let pageCount = (length - 1).toString().split('');
  let iContainer = 0;

  for (let i = 0; i < length; i++) {
    if (feed[i] !== undefined && i <= length - 1) {
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

        rssContainer.addClass(`rssContainer__${iContainer + 1}`);

        if (!$(`${fullElementClassName} .rssContainer__${iContainer + 1} .rssContainer__header`).length) {
          let rssContainerHeader = $('<div></div>')
            .addClass('rssContainer__header')
            .prependTo(`${fullElementClassName} .rssContainer__${iContainer + 1}`);

          let feedTitle = $('<a></a>')
            .addClass('feedTitle')
            .attr({
              href: feed[0].meta.link
            })
            .text(feed[0].meta.title)
            .prependTo(rssContainerHeader);

          // Add content options
          let contentOptions = $('<span></span>')
            .addClass('contentOptions')
            .appendTo(rssContainerHeader);

          let updateContentBtn = $('<img>')
            .addClass('updateContentBtn')
            .attr({
              alt: 'Update content',
              src: './client/scss/icons/interface/refresh.svg'
            })
            .appendTo(contentOptions);

          let removeContentBtn = $('<img>')
            .addClass('removeContentBtn')
            .attr({
              alt: 'Remove content',
              src: './client/scss/icons/interface/cross.svg'
            })
            .appendTo(contentOptions);

          addContentOptions(fullElementClassName);
        }

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
    } else {
      iContainer = 0;
    }
  }
}

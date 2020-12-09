const buildRssContainer = (feed, fullElementClassName, callback) => {
  let rssContainer = $('<section></section>');
  let linksContainer = $('<div></div>');
  let length = 50;

  let mod = feed.length % 10;

  if ((feed.length <= length && mod === 0) || feed.length <= 10) length = feed.length;
  else if (feed.length <= length && mod > 0) length = feed.length - mod;

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

      // Create containers each ten articles and if there is more of 10 elements to append
      // Else, create only one container and append elements to it

      if ((length < 10 && (i + 1) % 10 !== 0 && i > 0) || (length >= 10 && (i + 1) % 10 === 0 && i > 0)) {
        linksContainer
          .addClass('linksContainer')
          .appendTo(rssContainer);

        rssContainer.addClass(`rssContainer__${iContainer + 1}`);

        if (!rssContainer.children('.rssContainer__header').length) {
          let rssContainerHeader = $('<div></div>')
            .addClass('rssContainer__header')
            .prependTo(rssContainer);

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

        if (length > 10) {
          let leftArrow = $('<svg class="rssContainer__arrows__left opacity0" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>');
          let rightArrow = $('<svg class="rssContainer__arrows__right flex" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>');

          let totalPages;
          if (pageCount[1] > 0) totalPages = Number(pageCount[0]) + 1;
          else totalPages = Number(pageCount[0]);

          let arrowsContainer = $('<span></span>')
            .addClass('rssContainer__arrows flex')
            .prepend(leftArrow)
            .append(`<span>${iContainer + 1} / ${totalPages}</span>`)
            .append(rightArrow)
            .appendTo(rssContainer);

          leftArrow.click(function() {
            let rssContainerClass = $(this).parents('.rssContainer').attr('class').split(' ')[0];
            let rssContainerId = Number(rssContainerClass.match(/\d{1,}/));

            if (rssContainerId > 1) {
              $(`${fullElementClassName} .${rssContainerClass}, ${fullElementClassName} .rssContainer__${rssContainerId - 1}`).toggleClass('hidden flex');

              if ((rssContainerId - 1) === 1) {
                $(`${fullElementClassName} .rssContainer__${rssContainerId - 1} .rssContainer__arrows__right`)
                  .removeClass('opacity0')
                  .addClass('flex');

                $(`${fullElementClassName} .rssContainer__${rssContainerId - 1} .rssContainer__arrows__left`)
                  .removeClass('flex')
                  .addClass('opacity0');
              } else $(`${fullElementClassName} .rssContainer__${rssContainerId - 1} .rssContainer__arrows__right`).removeClass('opacity0').addClass('flex');
            }
          });


          rightArrow.click(function() {
            let rssContainerClass = $(this).parents('.rssContainer').attr('class').split(' ')[0];
            let rssContainerId = Number(rssContainerClass.match(/\d{1,}/));

            if (rssContainerId < totalPages) {
              $(`${fullElementClassName} .${rssContainerClass}, ${fullElementClassName} .rssContainer__${rssContainerId + 1}`).toggleClass('hidden flex');

              if ((rssContainerId + 1) === totalPages) {
                $(`${fullElementClassName} .rssContainer__${rssContainerId + 1} .rssContainer__arrows__right`).removeClass('flex').addClass('opacity0');
                $(`${fullElementClassName} .rssContainer__${rssContainerId + 1} .rssContainer__arrows__left`).removeClass('opacity0').addClass('flex');
              } else {
                $(`${fullElementClassName} .rssContainer__${rssContainerId + 1} .rssContainer__arrows__left, ${fullElementClassName} .rssContainer__${rssContainerId + 1} .rssContainer__arrows__right`).removeClass('opacity0').addClass('flex');
              }
            }
          });
        }

        iContainer++;

        callback(feed, rssContainer);

        rssContainer = $('<section></section>');
        linksContainer = $('<div></div>');
      }
    } else {
      iContainer = 0;
    }
  }
}

const displayArticleSummary = () => {
  $(`.article`)
    .mouseenter((event) => {
      if (!$('.rssTooltip .article__desc').length && event.currentTarget.className.match('article')) {
        $(event.currentTarget.nextElementSibling)
          .clone()
          .appendTo('.rssTooltip');

        if (mousePosition.x < ($(window).width() / 100 * 30)) {
          $('.rssTooltip .article__desc')
            .css({
              display: 'inline-block',
              top: mousePosition.y - ($(window).width() / 100 * 5),
              left: mousePosition.x + ($(window).width() / 100 * 15)
            });
        } else {
          $('.rssTooltip .article__desc')
            .css({
              display: 'inline-block',
              top: mousePosition.y - ($(window).width() / 100 * 5),
              left: mousePosition.x - ($(window).width() / 100 * 35)
            });
        }
      }
    }).mouseleave((event) => {
      $('.rssTooltip .article__desc').remove();
    });
}

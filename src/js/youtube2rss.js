const youtube2rss = () => {
  $('.yt2rssLink').click(() => {
    $('.yt2rss')
      .addClass('flex')
      .removeClass('hidden');

    disableScroll();

    $('.mainContainer, header, .backgroundImage').addClass('blur');

    $('.yt2rss__container__child__left__input').on('input', function() {
      if ($(this).val().match(/[A-Za-z0-9]{24}/)) {
        let result = `https://www.youtube.com/feeds/videos.xml?channel_id=${$(this).val()}`;
        $('.yt2rss__container__child__left__output').val(result);
      }
    });

    $('.yt2rss').click(function(e) {
      if (e.target === this) {
        $(this)
          .addClass('hidden')
          .removeClass('flex');

        $('.mainContainer, .header, .backgroundImage').removeClass('blur');

        restoreScroll();
      }
    });

    $('.yt2rss__container__child__right__svgBtn').click(() => {
      copyText('.yt2rss__container__child__left__output');
    });
  });
}

youtube2rss();

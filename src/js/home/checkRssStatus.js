const checkRSSstatus = (rssStatus) => {
  if (rssStatus) {
    $('.toggleRss__Input').prop('checked', true);
    $('.toggleRss__Slider').removeClass('unchecked');

    addContent('.content1__container', '.content1');
    addContent('.content2__container', '.content2');
    addContent('.content3__container', '.content3');

    if ($('.contentContainers').css('display') === 'none') {
      $('.contentContainers').css('display', '');

      $('.formContainer__container').css({
        position: '',
        top: ''
      });
    }
  } else {
    $('.toggleRss__Input').prop('checked', false);

    // If RSS feeds are disabled, hide the contentContainers div
    if (!$('.toggleRss__Input').prop('checked')) {
      $('.contentContainers').hide();

      $('.formContainer__container').css({
        position: 'absolute',
        top: '30%'
      });
    }
  }
}

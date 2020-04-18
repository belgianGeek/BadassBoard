const checkRSSstatus = (rssStatus) => {
  if (rssStatus) {
    $('.toggleRss__Input').prop('checked', true);
    $('.toggleRss__Slider').removeClass('unchecked');

    addContent('.content1__container', '.content1');
    addContent('.content2__container', '.content2');
    addContent('.content3__container', '.content3');
  } else {
    $('.toggleRss__Input').prop('checked', false);

    $('.contentContainers')
      .toggleClass('hidden flex')
      .removeAttr('style');
  }
}

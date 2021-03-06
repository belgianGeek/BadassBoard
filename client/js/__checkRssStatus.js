const checkRSSstatus = (rssStatus) => {
  if (rssStatus) {
    $('.toggleRss__Input').prop('checked', true);
    $('.toggleRss__Slider').removeClass('unchecked');

    addContent('.content1__container', '.content1');
    addContent('.content2__container', '.content2');
    addContent('.content3__container', '.content3');
  } else {
    hideLoading();
    $('.toggleRss__Input').prop('checked', false);

    $('.contentContainers')
      .fadeOut()
      .toggleClass('hidden flex')
      .removeAttr('style');
  }
}

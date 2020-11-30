const rssCarrousel = () => {
  $('.rssContainer__arrows__left').click(function() {
    let rssContainerClass = $(this).parents('.rssContainer').attr('class').split(' ')[0];
    let fullClassName = `.${$(this).parents('.content__container').attr('id')} .${$(this).parents('.content').attr('id')}`;
    let rssContainerId = Number(rssContainerClass.match(/\d{1,}/));

    $(`${fullClassName} .${rssContainerClass}, ${fullClassName} .rssContainer__${rssContainerId--}`).toggleClass('hidden flex');
  });

  $('.rssContainer__arrows__right').click(function() {
    let rssContainerClass = $(this).parents('.rssContainer').attr('class').split(' ')[0];
    let fullClassName = `.${$(this).parents('.content__container').attr('id')} .${$(this).parents('.content').attr('id')}`;
    let rssContainerId = Number(rssContainerClass.match(/\d{1,}/));

    $(`${fullClassName} .${rssContainerClass}, ${fullClassName} .rssContainer__${rssContainerId++}`).toggleClass('hidden flex');
  });
}

rssCarrousel();

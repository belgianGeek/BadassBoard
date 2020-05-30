const showAbout = () => {
  $('.aboutLink').click(function() {
    // Disable page scroll
    disableScroll();

    $('.backgroundImage, header, .mainContainer').toggleClass('blur');
    $('.about__container')
      .fadeIn()
      .toggleClass('hidden flex')
      .removeAttr('style');
  });
}

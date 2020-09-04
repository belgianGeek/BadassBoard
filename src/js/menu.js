$('.menu__item').click(() => {
  // Hide the sidebar on item click if it is currently shown
  if ($('.header__menu__switch').prop('checked')) {
    $('.header__menu__switch').prop('checked', false);
  }
});

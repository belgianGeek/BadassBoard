const hideLoading = () => {
  // Hide the animation
  $('.loading')
    .fadeOut(function() {
      $(this)
        .removeClass('flex')
        .addClass('hidden')
        .removeAttr('style');
    });
}

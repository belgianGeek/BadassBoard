const hideLoading = () => {
  // Hide the animation
  setTimeout(() => {
    $('.loading')
      .fadeOut(function() {
        $(this)
          .removeClass('flex')
          .addClass('hidden')
          .removeAttr('style');
      });
  }, 3000);
}

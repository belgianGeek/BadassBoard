const hideLoading = () => {
  // Hide the animation
  $('.loading')
    .fadeOut(() => {
      setTimeout(() => {
        $('.loading')
          .toggleClass('hidden flex')
          .removeAttr('style');
      }, 500);
    });
}

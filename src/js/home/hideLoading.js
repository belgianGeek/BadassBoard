const hideLoading = () => {
  // Hide the animation
  $('.loading')
    .fadeOut()
    .toggleClass('hidden flex')
    .removeAttr('style');
}

const fade = (element) => {
  $(element).fadeIn(2000, () => {
    setTimeout(() => {
      $(element).fadeOut(2000);
    }, 5000);
  });
}

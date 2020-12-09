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

  $('.updateBtn').click(function() {
    socket.emit('update check');
  });

  socket.on('update progress', msg => {
    console.log(msg);
    $('.updateBtn').text(msg.text);
  });

  // Hide the "About" page on parent click
  $('.about__container').click(function(e) {
    if (e.target === this) {
      $(this)
        .fadeOut(function() {
          $(this)
            .toggleClass('hidden flex')
            .removeAttr('style');

          $('.mainContainer, .header, .backgroundImage').removeClass('blur');

          // Restore scroll
          restoreScroll();
        });
    }
  });
}

const hideContent = (element2hide) => {
  $(element2hide).click(() => {
    if (element2hide === '.audio__remove') {
      // Stop the audio playback
      document.getElementById('audio__player').pause();

      // Hide the whole audio container
      $('.audio').hide();
    } else if (element2hide === '.converter__body__remove') {
      $('.converter').fadeOut();
    }
  });

  // Adapt the height of the contentContainers container
  $('.contentContainers').css('marginTop', '');
}

const questionBoxSubmit = () => {
  if ($('.questionBox').val() !== '') {
    $('.form').submit((event) => {
      // Reset the playlist counter
      iPlaylist = 0;

      let msg = $(".questionBox").val();
      event.preventDefault();
      processInput(msg);
    });
  }
}

const openUrl = (msg) => {
  let args = msg.split(' ');

  for (let i = 0; i < suggestions.length; i++) {
    if (args[0] === suggestions[i].label) {
      args.shift();
      let keywords = args.join(' ');

      // Check if suggestion URL is not null
      if (suggestions[i].url !== undefined && suggestions[i] !== null) {
        if (suggestions[i].label === '!iv') {
          window.open(`${suggestions[i].url}${keywords}&local=true`);
        } else if (suggestions[i].label === '!mmnl') {
          window.open(`${suggestions[i].url}${keywords}&searchProfile=onlineshop&channel=mmnlnl`)
        } else if (suggestions[i].label === '!pb') {
          window.open(`${suggestions[i].url}${keywords}/-/`);
        } else {
          window.open(`${suggestions[i].url}${keywords}`);
        }
      }
    }
  }

  // Empty the search box and hide the suggestions
  $(".questionBox").val('');

  $('.formContainer')
    .css({
      borderRadius: '2em'
    });

  $('.suggestion').hide();
}

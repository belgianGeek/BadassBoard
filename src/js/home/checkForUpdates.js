const checkForUpdates = () => {
  $.ajax({
    url: 'https://api.github.com/repositories/204866456/releases',
    method: 'GET',
    dataType: 'json',
    statusCode: {
      200: (res) => {
        if (res[0].tag_name !== currentVersion) {
          let updateIcon = $('<svg class="header__updateBtn" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"/></svg>')
            .prependTo($('header'))
            .click(() => {
              window.open('https://github.com/Leroux47/BadassBoard/releases');
            });

          $('.msgContainer')
            .text('A new BadassBoard version is available ! Please click on the top right button to download the latest release 😉')
            .fadeIn(2000);

          setTimeout(() => {
            $('.msgContainer').fadeOut(2000);
          }, 5000);
        } else if (res[0].tag_name === currentVersion) {
          $('.header__updateBtn').remove();
          $('.msgContainer')
            .text('')
            .hide();
        }
      },
      404: () => {
        console.log('Couldn\'t check for updates, page not found...');
      },
      401: () => {
        console.log('Hey, you\'re not allowed to visit this page !');
      },
      500: () => {
        console.log('GitHub server error :((');
      }
    }
  })
}

const listen2Playlist = (data) => {
  if (data.videos[iPlaylist] === undefined) {
    printError({
      type: 'generic',
      msg: 'Invalid playlist reference !'
    });
  } else {
    if (iPlaylist < data.videoCount && !data.videos[iPlaylist].title.match(/deleted video/gi) && data.videos[iPlaylist] !== undefined) {
      // Remove the player on delete button click
      hideContent('.audio__remove');

      $('.audio').addClass('playlist flex');

      $('.audio__leftSvg, .audio__rightSvg').off();

      // Adapt the .moreContent height so all the elements can fit on the page
      $('.moreContent').css('marginTop', 0);

      // Define the audio player
      if (!$('.audio__player').length) {
        let audioPlayer = $('<audio></audio>')
          .attr({
            id: 'audio__player',
            controls: 'controls',
            autoplay: 'autoplay'
          })
          .addClass('audio__player')
          .text('Your browser does not support the audio element :(')
          .appendTo('.player');

        let leftSvg = $('<svg class="audio__leftSvg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>')
          .prependTo('.audio');

        let rightSvg = $('<svg class="audio__rightSvg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>')
          .appendTo('.audio');

        // Define the source tag
        let audioSrc = $('<source>')
          .attr({
            id: 'audioSrc',
            src: `https://www.invidio.us/latest_version?id=${data.videos[iPlaylist].videoId}&itag=251&local=true`,
            type: ' audio/mpeg',
          })
          .appendTo('.audio__player');
      } else {
        $('#audioSrc').attr('src', `https://www.invidio.us/latest_version?id=${data.videos[iPlaylist].videoId}&itag=251&local=true`);

        // Add playlist controls if they do not exist
        if (!$('.audio__leftSvg').length) {
          let leftSvg = $('<svg class="audio__leftSvg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>')
            .hide()
            .prependTo('.audio');

          let rightSvg = $('<svg class="audio__rightSvg" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>')
            .hide()
            .appendTo('.audio');
        }

        $('.streamInfoContainer, .player, .playlistInfo, .audio__leftSvg, .audio__rightSvg').show();
        $('.playlistEndMsg').hide();
      }

      // If the info about the track are not displayed, add them
      if (!$('.streamInfoContainer').length) {
        let playlistInfo = $('<span></span>')
          .addClass('playlistInfo')
          .text(`${iPlaylist + 1}/${data.videoCount}`)
          .show()
          .prependTo('.audioMsg');

        let streamInfoContainer = $('<span></span>')
          .addClass('streamInfoContainer')
          .appendTo('.audioMsg');

        // Display some info about the played track
        let streamTitle = $('<p></p>')
          .attr('id', 'streamTitle')
          .addClass('streamTitle')
          .text(data.videos[iPlaylist].title)
          .appendTo('.streamInfoContainer');

        let streamId = $('<p></p>')
          .text(` (Youtube ID : ${data.videos[iPlaylist].videoId})`)
          .attr('id', 'YtId')
          .addClass('YtId')
          .appendTo('.streamInfoContainer');
      } else {
        $('#streamTitle').text(data.videos[iPlaylist].title);
        $('#YtId').text(`(Youtube ID : ${data.videos[iPlaylist].videoId})`);

        if (!$('.playlistInfo').length) {
          let playlistInfo = $('<span></span>')
            .addClass('playlistInfo')
            .text(`${iPlaylist + 1}/${data.videoCount}`)
            .show()
            .prependTo('.audioMsg');
        } else {
          $('.playlistInfo')
            .show()
            .text(`${iPlaylist + 1}/${data.videoCount}`);
        }
      }

      // Avoid the Jquery 'load' function and show the audio player
      document.getElementById('audio__player').load();

      document.getElementById('audio__player').onended = () => {
        iPlaylist++;
        if (data.videos[iPlaylist] !== undefined) {
          listen2Playlist(data);
        } else {
          $('.audio__leftSvg, .audio__remove').hide();

          $('.player, .streamInfoContainer, .playlistInfo').hide();

          if (!$('.endOfPlaylist').length) {
            let endOfPlaylist = $('<span></span>')
              .text('There is no track left in here... 😭')
              .addClass('audioMsg__playlistEnd')
              .prependTo('.audioMsg');

            $('.audio').removeClass('playlist');
          }

          $('.audio').css('width', '50%');

          $('.audioMsg')
            .css({
              justifyContent: 'center',
              width: '100%'
            });

          fade($('.audio'));
        }
      }

      $('.audio__player').show();
      $('.audioMsg').show();
      $('.audio').fadeIn(1500, () => {
        $('.audio').css('display', 'flex');
      });

      // Display playlist controls
      displaySvg(data);
    } else if (data.videos[iPlaylist] === undefined) {
      printError({
        type: 'generic',
        msg: 'Video ID not found !'
      });
    } else if (data.videos[iPlaylist].title.match(/(deleted video) || (private video)/gi)) {
      iPlaylist++;
      listen2Playlist(data);
    }
  }
}

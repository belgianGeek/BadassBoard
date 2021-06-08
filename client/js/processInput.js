const processInput = (msg) => {
  let args = msg.split(' ');

  if (msg.startsWith('!')) {
    // Search shortcuts
    openUrl(msg);

    // Download an audio file
    if (msg.startsWith('!d ')) {
      let url = '';
      if (msg.match(/[0-9A-Za-z_-]{11}/)) {
        let id = msg.match(/[0-9A-Za-z_-]{11}/)[0];
        // Emit an event tAo server to handle the download
        socket.emit('download', id);

        // Ask for some audio info
        socket.emit('audio info request', id);

        socket.on('audio info retrieved', (audioInfo) => {
          if (audioInfo.title !== undefined && audioInfo.title !== null) {
            let title = `Your download for ${audioInfo.title} started !`;
            $('.msgContainer').text(title);
            $('.msgContainer').show();
          }
        });

        socket.on('download ended', (data) => {
          $('.msgContainer').text(`Your download for ${data.title} ended !`);
          setTimeout(() => {
            $('.msgContainer').fadeOut(1500);
          }, 2000);

          window.open(`${window.location.href}download`);
        });
      } else {
        printError({
          type: 'generic',
          msg: `You pasted an invalid link. If you tried to paste a URL, try the video ID only`
        });
      }
    } else if (msg.startsWith('!p ')) {
      socket.emit('invidious instances');

      socket.on('invidious instances', invidiousInstances => {
        socket.on('playlist parsed', () => {
          $.ajax({
            url: './tmp/playlist.json',
            dataType: 'json',
            method: 'GET'
          }).done(data => {
            listen2Playlist(invidiousInstances, data);
          });
        });
        
        // Play audio function
        if (msg.match(/[0-9A-Za-z_-]{11}/) && !msg.match(/[0-9A-Za-z_-]{13,34}/)) {
          // Match a single video
          let id = msg.match(/[0-9A-Za-z_-]{11}/)[0];

          const handleResults = (res, instance) => {
            const findUrl = () => {
              for (const [i, resValue] of res.adaptiveFormats.entries()) {
                if (resValue.type.match(/audio/)) {
                  return `${instance}/latest_version?id=${id}&itag=251&local=true`;
                } else {
                  if (i === res.adaptiveFormats.length - 1) {
                    printError({
                      type: 'generic',
                      msg: `Sorry, this stream couldn't be played. Please try another video.`
                    });
                  }
                }
              }
            }

            let title = res.title;
            let url = findUrl();

            if (!$('.audio__player').length) {
              let audioPlayer = $('<audio></audio>');
              audioPlayer
                .attr({
                  id: 'audio__player',
                  controls: 'controls',
                  autoplay: 'autoplay'
                })
                .addClass('audio__player')
                .text('Your browser does not support the audio element.')
                .appendTo('.audio__container__player');

              let audioSrc = $('<source>');
              audioSrc.attr({
                  id: 'audioSrc',
                  src: url,
                  type: 'audio/mpeg'
                })
                .appendTo('.audio__player');
            } else {
              $('#audioSrc').attr('src', url);

              document.getElementById('audioSrc').onerror = () => {
                ytPlay(invidiousInstances[iInstance++]);
              };
            }

            // If the info about the track are not displayed, add them
            if (!$('.streamInfoContainer').length) {
              let streamInfoContainer = $('<span></span>')
                .addClass('streamInfoContainer')
                .appendTo('.audio__container__msg');

              let streamTitle = $('<p></p>')
                .attr('id', 'streamTitle')
                .addClass('streamTitle')
                .appendTo(streamInfoContainer);

              let YtId = $('<p></p>')
                .attr('id', 'YtId')
                .addClass('YtId')
                .appendTo(streamInfoContainer);
            }

            // Avoid the Jquery 'load' function and show the audio player
            document.getElementById('audio__player').load();

            // Hide playlist controls if they exists
            if ($('.audio__leftSvg').length || $('.audio__rightSvg').length) {
              $('.audio__leftSvg, .audio__rightSvg, .playlistInfo').hide();
            }

            // Else, just replace the old info with the new ones
            $('#streamTitle').text(title);
            $('#YtId').text(`(Youtube ID : ${id})`);

            $('.streamInfoContainer')
              .css({
                textAlign: 'center',
                width: '100%'
              });

            $('.audio__container__msg, .streamInfoContainer, .audio__player').show();
            $('.audio').fadeIn(1500, () => {
              $('.audio').css('display', 'flex');
            });

            document.getElementById('audio__player').onended = () => {
              $('.audio').fadeOut(1500);
            };

            // Remove the player on delete button click
            hideContent('.audio__remove');
          }

          const ytPlay = instance => {
            $.ajax({
                url: `${instance}/api/v1/videos/${id}`,
                method: 'GET',
                dataType: 'json'
              })
              .done(res => {
                if (res.length !== 0) {
                  handleResults(res, instance);
                  iInstance = 0;
                } else {
                  ytPlay(invidiousInstances[iInstance++]);
                }
              })
              .fail(err => {
                if (iInstance < invidiousInstances.length) {
                  ytPlay(invidiousInstances[iInstance++]);
                } else {
                  iInstance = 0;
                  printError({
                    type: 'generic',
                    msg: `Sorry, the audio stream failed to load due to a server error... Try maybe later.`
                  });
                }
              });
          }

          if (Array.isArray(invidiousInstances)) {
            ytPlay(invidiousInstances[iInstance]);
          } else {
            iInstance = 0;
            printError({
              type: 'generic',
              msg: 'Your stream couldn\'t be played because the Invidious instances list couldn\'t be fetched. Please try again later.'
            });
          }
        } else if (msg.match(/[a-zA-Z0-9-_]{15,34}/)) {
          // Check if the keyword match a playlist pattern

          if (Array.isArray(invidiousInstances)) {
            // Reset the playlist counter
            iPlaylist = 0;
            let id = msg.match(/[a-zA-Z0-9-_]{15,34}/)[0];
            let apiUrl = `${invidiousInstances[iInstance]}/api/v1/playlists/${id}`;

            socket.emit('parse playlist', {
              url: apiUrl,
              id: `/playlists/${id}`
            });
          } else {
            printError({
              type: 'generic',
              msg: 'Your playlist couldn\'t be played because the Invidious instances list couldn\'t be fetched. Please try again later.'
            });
          }
        } else if (msg.match(/[0-9A-Za-z_-]{13}/) && !msg.match(/[0-9A-Za-z_-]{14,34}/)) {
          // Match a mix pattern

          if (Array.isArray(invidiousInstances)) {
            // Reset the playlist counter
            iPlaylist = 0;
            let mixID = msg.match(/[0-9A-Za-z_-]{13}/);
            let apiUrl = `${instance}/api/v1/mixes/${mixID}`;

            socket.emit('parse playlist', {
              url: apiUrl,
              id: `/mixes/${mixID}`
            });
          } else {
            printError({
              type: 'generic',
              msg: 'Your mix couldn\'t be played because the Invidious instances list couldn\'t be fetched. Please try again later.'
            });
          }
        } else {
          printError({
            type: 'generic',
            msg: 'Bad URL :(('
          });
        }
      });
    }
  } else {
    if (msg !== null && msg !== undefined && msg !== '') {
      // web search
      let keywords = args.join(' ');
      window.open(`${searchEngine.url}${keywords}`);

      // Empty the search box
      $(".questionBox").val('');
    }
  }
}

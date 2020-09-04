const displaySvg = (data) => {
  // Playlist controls

  if (data.videos[iPlaylist] !== undefined) {
    if (iPlaylist < data.videos.length) {
      if (iPlaylist === 0) {
        $('.audio__leftSvg').hide();
      }

      $('.audio__rightSvg')
        .click(() => {
          iPlaylist++;
          if (iPlaylist < data.videos.length && data.videos[iPlaylist] !== undefined) {
            $('#audioSrc').attr('src', `https://www.invidio.us/latest_version?id=${data.videos[iPlaylist].videoId}&itag=251&local=true`);
            document.getElementById('audio__player').load();
            $('#streamTitle').text(data.videos[iPlaylist].title);
            $('#YtId').text(` (Youtube ID : ${data.videos[iPlaylist].videoId})`);
            $('.playlistInfo').text(`${iPlaylist + 1}/${data.videos.length}`);

            if (iPlaylist > 0) {
              $('.audio__leftSvg')
                .show();
            }

            if (iPlaylist === data.videos.length - 1) {
              $('.audio__rightSvg').hide();
            }
          }
        });

      $('.audio__leftSvg')
        .click(() => {
          if (iPlaylist > 0) {
            iPlaylist--;
            $('#audioSrc').attr('src', `https://www.invidio.us/latest_version?id=${data.videos[iPlaylist].videoId}&itag=251&local=true`);
            document.getElementById('audio__player').load();
            $('#streamTitle').text(data.videos[iPlaylist].title);
            $('#YtId').text(` (Youtube ID : ${data.videos[iPlaylist].videoId})`);
            $('.playlistInfo').text(`${iPlaylist + 1}/${data.videos.length}`);
          }

          if (iPlaylist === 0) {
            $('.audio__leftSvg').hide();
          } else if (iPlaylist > 0) {
            $('.audio__rightSvg').show();
          }
        });
    } else {
      $('.audio__rightSvg').show();
    }
  }
}

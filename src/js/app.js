// Store the current version number
let currentVersion = '0.1.1';

// Define a variable to store the ID of the currently played track
let iPlaylist = 0;

// Define a vriable to store the mouse coordinates
let mousePosition = {};

// Store the OpenWeatherMap API token
let owmToken = '';

let contentHeight;

// Store the default search engine
let searchEngine = {};

//Websocket connection
const socket = io();

// Store the style added to the head tag
let headStyle = '';

// Get the background image from the settings and add it to the page
$.ajax({
  url: './settings/settings.json',
  method: 'GET',
  dataType: 'json'
}).done(settings => {
  if (settings.backgroundImage !== undefined) {
    $.ajax({
      url: settings.backgroundImage,
      method: 'GET',
      dataType: '',
      statusCode: {
        200: () => {
          headStyle = `<style>.formContainer__container::before {background-image: url(${settings.backgroundImage});}</style>`;
          $('head').append(headStyle);

          $('.backgroundImage').css('backgroundImage', `url(${settings.backgroundImage})`);
        },
        404: () => {
          $('.msgContainer')
            .text('Sorry, your background image couldn\'t be loaded... Maybe try another one')
            .fade('.msgContainer');
        }
      }
    })
    .fail(() => {
      // CORS error handling
      headStyle = `<style>.formContainer__container::before {background-image: url(${settings.backgroundImage});}</style>`;
      $('head').append(headStyle);

      $('.backgroundImage').css('backgroundImage', `url(${settings.backgroundImage})`);
    });
  }

  if (settings.owmToken !== undefined) {
    owmToken = settings.owmToken;
    $('.owmToken__input').val(settings.owmToken);
  }

  if (settings.searchEngine !== undefined) {
    searchEngine.label = settings.searchEngine.label;
    searchEngine.url = settings.searchEngine.url;

    // Update the default search engine parameter
    $('.searchEngineSelection__select').val(settings.searchEngine.label);
  } else {
    // Define the default search engine if it doesn't exist
    searchEngine.label = 'DuckDuckGo';
    searchEngine.url = 'https://duckduckgo.com/?q=';

    $('.searchEngineSelection__select').val(searchEngine.label);

    // Send the search engine to the server
    socket.emit('customization', searchEngine);
  }
});

// Design the content divs
const addContent = (parent, element) => {
  let svg = `${parent} ${element} .blank`;
  contentHeight = $('.content').height();

  $(element, svg).off();

  setTimeout(() => {
    if (!$(`${element} section`).length) {
      $(element)
        .mouseenter(() => {
          $(svg)
            .addClass('flex visible')
            .removeClass('invisible');
        })
        .mouseleave(() => {
          $(svg)
            .addClass('invisible')
            .removeClass('visible');
        });
    }

    // Show the "addContent" form on svg click
    $(svg).click(() => {
      $(element).css('padding', '0');

      $(`${parent} ${element} .addContent`).addClass('flex');
      $(svg).hide();
      $(element)
        .mouseenter(() => {
          // Only show the 'blank' div if the addContent div is hidden
          if ($(`${parent} ${element} .addContent`).is(':visible')) {
            $(svg).hide();
          }
        });

      $(`${parent} ${element} .addContent`).ready(() => {
        // Add RSS on form "addContent" submit

        // Handle option selection
        $(`${parent} ${element} .addContent__select`).on('change', () => {

          $(`${parent} ${element} .addContent__btnContainer`).css('display', 'inline-flex');

          // If the feed option is selected, handle the adding
          if ($(`${parent} ${element} .addContent__select`).val() === 'Add a feed') {

            $(`${parent} ${element} .addContent`).removeClass('menu');

            $(`${parent} ${element} .addContent__select`).addClass('select');

            $(`${parent} ${element} .addContent__feed`)
              .css('display', '')
              .addClass('flex');

            // Hide uneccesary elements
            if ($(`${parent} ${element} .addContent__weather:visible`).length) {
              $(`${parent} ${element} .addContent__weather`).hide();
            }

            // Add RSS feed on form submit
            const submitForm = () => {
              $(`${parent} ${element} .addContent__submitBtn`)
                .click(() => {
                  // Call a server-side function to parse the feed if the url isn't null or undefined
                  if ($(`${parent} ${element} .addContent__feed__input`).val() !== null && $(`${parent} ${element} .addContent__feed__input`).val() !== undefined && $(`${parent} ${element} .addContent__feed__input`).val().match(/^http/i)) {
                    // Ask the server to parse the feed
                    socket.emit('add content', [{
                      element: element,
                      parent: parent,
                      url: $(`${parent} ${element} .addContent__feed__input`).val(),
                      type: 'rss',
                      new: false
                    }]);

                    // Add content to the page
                    parseContent();

                    $(`${parent} ${element} .addContent`).hide();
                  } else {
                    printError({
                      type: 'rss',
                      msg: `Hey, this value is invalid !`,
                      element: `${parent} ${element} .addContent__feed`
                    });

                    submitForm();
                  }
                });
            }

            submitForm();
          } else if ($(`${parent} ${element} .addContent__select`).val() === 'Weather forecast') {

            $(`${parent} ${element} .addContent`).removeClass('menu');

            $(`${parent} ${element} .addContent__select`).addClass('select');

            if ($(`${parent} ${element} .addContent__feed:visible`).length) {
              $(`${parent} ${element} .addContent__feed`).hide();
            }

            $(`${parent} ${element} .addContent__weather`)
              .css({
                justifyContent: 'center',
                alignItems: 'center',
                display: ''
              })
              .addClass('flex');

            // Search for weather forecast on form submit
            const submitForm = () => {
              $(`${parent} ${element} .addContent__submitBtn`)
                .click(() => {
                  $.ajax({
                    url: `https://api.openweathermap.org/data/2.5/find?q=${$(`${parent} ${element} .addContent__weather__input`).val()}&units=metric&lang=en&appid=${owmToken}`,
                    method: 'POST',
                    dataType: 'json',
                    statusCode: {
                      401: () => {
                        printError({
                          type: 'weather',
                          msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                          element: `${parent} ${element}`
                        });

                        submitForm();
                      },
                      200: (forecast => {
                        let count = forecast.count;

                        if (count === 1) {
                          // Add content to the page
                          parseContent();

                          // Send the changes to the server side
                          socket.emit('add content', [{
                            element: element,
                            parent: parent,
                            location: $(`${parent} ${element} .addContent__weather__input`).val(),
                            type: 'weather',
                            new: false
                          }]);
                        } else {
                          printError({
                            type: 'weather',
                            msg: 'Sorry homie, it seems this location doesn\'t exist...',
                            element: `${parent} ${element}`
                          });
                        }
                      })
                    }
                  });
                });
            }

            submitForm();
          } else {
            $(`${parent} ${element} .addContent`).addClass('menu');
            $(`${parent} ${element} .addContent__select`).removeClass('select');
            $(`${parent} ${element} .addContent__feed, ${parent} ${element} .addContent__weather, ${parent} ${element} .addContent__btnContainer`).hide();
          }
        });

        // Cancel new content adding
        $(`${parent} ${element} .addContent__cancelBtn`).click(() => {
          $(`${parent} ${element} .addContent`).hide();
          $(svg).show();
        });
      });
    });
  }, 3000);
}

const addContentOptions = (element) => {
  contentHeight = $('.content').height();

  const removeContent = (parent, element2remove, child) => {
    if ($(element2remove).length) {
      $(child)
        .mouseenter(() => {
          // Show the removeContentBtn on feedtitle hover
          $(`${parent} .contentOptions`).css('display', 'flex');
        })
        .mouseleave(() => {
          $(`${parent} .contentOptions`).hide();
        });

      // Remove feed on button click
      $(`${parent} .removeContentBtn`).click(() => {
        $(element2remove).remove();

        if (!$(element2remove).length) {
          $(parent)
            .css({
              height: contentHeight
            });

          $(`${parent} .blank`)
            .css({
              height: contentHeight
            })
            .addClass('flex');
        }

        addContent(`.${$(parent).parent().attr('class').match(/content\d__container/)}`, `.${$(parent).attr('class').match(/content\d{1,}/)}`);
      });
    }
  }

  const updateContent = (parent, element, child) => {
    if ($(element).length) {
      $(child)
        .mouseenter(() => {
          // Show the removeContentBtn on content title hover
          $(`${element} .contentOptions`).addClass('flex');
        })
        .mouseleave(() => {
          $(`${element} .contentOptions`).hide();
        });

      $(`${element} .updateContentBtn`).click(function() {
        // Update RSS
        if (element.match(/rss/i)) {
          socket.emit('update feed', {
            element: `.${$(this).parents('.rssContainer').parent().attr('id')}`,
            parent: `.${$(this).parents('.content__container').attr('id')}`
          });

          socket.on('feed updated', (parsedData) => {
            console.log('update successfull');
            let parsedElt = `${parsedData.parent} ${parsedData.element}`;
            let feed = parsedData.feed;

            buildRssContainer(feed, (feed, rssContainer) => {
              $(`${parsedElt} .rssContainer`).replaceWith(rssContainer);

              let rssContainerHeader = $('<div></div>')
                .addClass('rssContainer__header')
                .prependTo(rssContainer);

              let feedTitle = $('<a></a>')
                .addClass('feedTitle')
                .attr({
                  href: feed[0].meta.link
                })
                .text(feed[0].meta.title)
                .prependTo(rssContainerHeader);

              // Add content options
              let contentOptions = $('<span></span>')
                .addClass('contentOptions')
                .appendTo(rssContainerHeader);

              let updateContentBtn = $('<img>')
                .addClass('updateContentBtn')
                .attr({
                  alt: 'Update content',
                  src: './src/css/icons/interface/refresh.svg'
                })
                .appendTo(contentOptions);

              let removeContentBtn = $('<img>')
                .addClass('removeContentBtn')
                .attr({
                  alt: 'Remove content',
                  src: './src/css/icons/interface/cross.svg'
                })
                .appendTo(contentOptions);

              addContentOptions(parsedElt);

              displayArticleSummary();

              $(`${parsedElt} .rssContainer__header`)
                .mouseenter(() => {
                  $(`${parsedElt} .contentOptions`).addClass('flex');
                })
                .mouseleave(() => {
                  $(`${parsedElt} .contentOptions`).addClass('flex');
                });
            });
          });
        } else if (element.match(/forecast/i)) {
          // Remove the "Weather in..." part of the title to extract the location
          let location = $('.forecast__header__title').text().split(' ');
          location.splice(0, 2);
          location = location[0];
          $.ajax({
            url: `https://api.openweathermap.org/data/2.5/find?q=${location}&units=metric&lang=en&appid=${owmToken}`,
            method: 'POST',
            dataType: 'json',
            statusCode: {
              401: () => {
                printError({
                  type: 'weather',
                  msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                  element: parent
                });
              },
              200: (forecast => {
                // Retrieve the updated data

                // Format the forecast summary to get the first letter uppercase
                let tempDescription = forecast.list[0].weather[0].description.split('');
                let firstLetter = tempDescription[0].toUpperCase();
                tempDescription.shift();
                tempDescription.unshift(firstLetter);

                tempDescription = tempDescription.join('');

                let previsions = {
                  temp: forecast.list[0].main.temp,
                  city: forecast.list[0].name,
                  description: tempDescription,
                  humidity: forecast.list[0].main.humidity,
                  windSpeed: forecast.list[0].wind.speed,
                  weatherIcon: forecast.list[0].weather[0].icon
                };

                // Add content to the page
                $('.forecast__content__info__description__desc').text(previsions.description);
                $('.forecast__content__info__temp__desc').text(`${previsions.temp} °C`);
                $('.forecast__content__info__wind__desc').text(`${previsions.windSpeed} km/h`);
                $('.forecast__content__info__humidity__desc').text(`${previsions.humidity} %`);

                updateWeatherIcon(previsions);
              })
            }
          });
        }
      });
    }
  }

  $(`${element} .rssContainer`).ready(() => {
    removeContent(element, `${element} .rssContainer`, `${element} .rssContainer__header`);
    updateContent(element, `${element} .rssContainer`, `${element} .rssContainer__header`);
  });

  $(`${element} .forecast`).ready(() => {
    removeContent(element, `${element} .forecast`, `${element} .forecast__header`);
    updateContent(element, `${element} .forecast`, `${element} .forecast__header`);
  });
}

const autocomplete = (search) => {
  let matches = suggestions.filter(suggestion => {
    const regex = new RegExp(`^${search}`, 'gi');
    return suggestion.label.match(regex);
  });

  // Prevent suggestions if the input is empty
  if (!search.length) {
    matches = [];
    $('.suggestions').text('');
    $('.formContainer')
      .css({
        borderRadius: '2em',
        padding: '0.5% 1%'
      });

    $('.suggestions').removeClass('active');
  }

  if (matches !== [] && search.length >= 2 && search.startsWith('!')) {
    $('.formContainer')
      .css({
        borderRadius: '2em 2em 0 0',
        paddingBottom: 0
      });

    if (!$('.suggestions').hasClass('active')) {
      $('.suggestions').addClass('active');
    }

    $('.suggestions')
      .css({
        width: $('.formContainer').innerWidth()
      });

    // Check if matches are not null
    if (matches !== [] && matches.length > 0) {
      const html = matches.map(match => `
            <div class="suggestion flex">
              <img class="suggestion__icon" src="${match.icon}" alt="${match.desc} icon" height="20px" />
              <span class="suggestion__label">${match.label}</span>
              <span class="suggestion__desc">${match.desc}</span>
            </div>
            `)
        .join('');

      $('.suggestions').html(html);
      $('.suggestion').click((event) => {
        let nodevalue;
        let target = event.target;
        if (target.className === 'suggestion__label') {
          nodevalue = target.textContent;
        } else if (target.className === 'suggestion__icon') {
          nodevalue = target.nextElementSibling.textContent;
        } else if (target.className === 'suggestion__desc') {
          nodevalue = target.previousElementSibling.textContent;
        } else if (target.className === 'suggestion') {
          nodevalue = target.children[1].textContent;
        }

        if (nodevalue) {
          $('.questionBox')
            .val(`${nodevalue} `)
            .focus();
        }
      });
    } else {
      $('.suggestions').removeClass('active');
    }
  }
}

const buildRssContainer = (feed, callback) => {
  let rssContainer = $('<section></section>');
  let linksContainer = $('<div></div>');
  for (let i = 0; i < 10; i++) {
    if (feed[i] !== undefined && feed[i].title !== undefined && feed[i].link !== undefined) {
      rssContainer
        .addClass('rssContainer flex');

      linksContainer
        .addClass('linksContainer')
        .appendTo(rssContainer);

      let article = $('<div></div>')
        .addClass('article flex')
        .appendTo(linksContainer);

      let link = $('<a></a>')
        .addClass('link')
        .attr('href', feed[i].link)
        .text(feed[i].title)
        .appendTo(article);


      let summary = $('<div></div>')
        .addClass('article__desc')
        .append(feed[i].summary)
        .appendTo(linksContainer);
    }
  };
  callback(feed, rssContainer);
}

const checkForUpdates = () => {
  $.ajax({
    url: 'https://api.github.com/repos/Leroux47/BadassBoard/releases',
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
            .text('A new BadassBoard version is available ! Please click on the top left button to download the latest release 😉')
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

const checkRSSstatus = (rssStatus) => {
  if (rssStatus) {
    $('.toggleRss__Input').prop('checked', true);
    $('.toggleRss__Slider').removeClass('unchecked');

    addContent('.content1__container', '.content1');
    addContent('.content2__container', '.content2');
    addContent('.content3__container', '.content3');

    if ($('.moreContent').css('display') === 'none') {
      $('.moreContent').css('display', '');

      $('.formContainer__container').css({
        position: '',
        top: ''
      });
    }
  } else {
    $('.toggleRss__Input').prop('checked', false);

    // If RSS feeds are disabled, hide the moreContent div
    if (!$('.toggleRss__Input').prop('checked')) {
      $('.moreContent').hide();

      $('.formContainer__container').css({
        position: 'absolute',
        top: '30%'
      });
    }
  }
}

const displayArticleSummary = () => {
  $(`.article`)
    .mouseenter((event) => {
      if (!$('.rssTooltip .article__desc').length && event.currentTarget.className.match('article')) {
        $(event.currentTarget.nextElementSibling)
          .clone()
          .appendTo('.rssTooltip');

        if (mousePosition.x < ($(window).width() / 100 * 30)) {
          $('.rssTooltip .article__desc')
            .css({
              display: 'inline-block',
              top: mousePosition.y - ($(window).width() / 100 * 5),
              left: mousePosition.x + ($(window).width() / 100 * 15)
            });
        } else {
          $('.rssTooltip .article__desc')
            .css({
              display: 'inline-block',
              top: mousePosition.y - ($(window).width() / 100 * 5),
              left: mousePosition.x - ($(window).width() / 100 * 35)
            });
        }
      }
    }).mouseleave((event) => {
      $('.rssTooltip .article__desc').remove();
    });
}

const displaySvg = (data) => {
  // Playlist controls

  if (data.videos[iPlaylist] !== undefined) {
    if (iPlaylist < data.videoCount) {
      if (iPlaylist === 0) {
        $('.audio__leftSvg').hide();
      }

      $('.audio__rightSvg')
        .click(() => {
          iPlaylist++;
          if (iPlaylist < data.videoCount && data.videos[iPlaylist] !== undefined) {
            $('#audioSrc').attr('src', `https://www.invidio.us/latest_version?id=${data.videos[iPlaylist].videoId}&itag=251&local=true`);
            document.getElementById('audio__player').load();
            $('#streamTitle').text(data.videos[iPlaylist].title);
            $('#YtId').text(` (Youtube ID : ${data.videos[iPlaylist].videoId})`);
            $('.playlistInfo').text(`${iPlaylist + 1}/${data.videoCount}`);

            if (iPlaylist > 0) {
              $('.audio__leftSvg')
                .show();
            }

            if (iPlaylist === data.videoCount - 1) {
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
            $('.playlistInfo').text(`${iPlaylist + 1}/${data.videoCount}`);
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

const fade = (element) => {
  $(element).fadeIn(2000, () => {
    setTimeout(() => {
      $(element).fadeOut(2000);
    }, 5000);
  });
}

const getMousePosition = () => {
  $(window).mousemove((event) => {
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
  });
}

const hideContent = (element2hide) => {
  $(element2hide).click(() => {
    if (element2hide === '.audio__remove') {
      // Stop the audio playback
      document.getElementById('audio__player').pause();

      // Hide the whole audio container
      $('.audio').hide();
    } else if (element2hide === '.converter__remove') {
      $('.upperContainer__converter').fadeOut();
    }
  });

  // Adapt the height of the moreContent container
  $('.moreContent').css('marginTop', '');
}

const listen2Playlist = (data) => {
  $('.audio').addClass('flex');

  $('.audio__leftSvg, .audio__rightSvg').off();

  // Remove the player on delete button click
  hideContent('.audio__remove');

  if (data.videos[iPlaylist] === undefined) {
    printError({
      type: 'generic',
      msg: 'Invalid playlist reference !'
    });
  } else {
    if (iPlaylist < data.videoCount && !data.videos[iPlaylist].title.match(/deleted video/gi) && data.videos[iPlaylist] !== undefined) {
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

// Add content of other types than RSS
const parseContent = () => {
  socket.on('parse content', (parsedData) => {
    // console.log('parsing requested');
    // console.log(JSON.stringify(parsedData, null, 2));
    for (const [i, value] of parsedData.entries()) {
      // console.log(i, `${value.parent} ${value.element}`);
      const buildElement = (parent, element, iElement, callback) => {
        if (!$(element).length) {
          let container = $('<div></div>')
            .addClass(`content content${iElement}`)
            .attr('id', `content${iElement}`);

          if (!$(element).length) {
            container.appendTo(parent);
          }

          $(element).ready(() => {
            if (!$(`${element} .blank`).length && !$(`${element} .addContent`).length) {
              $(element)
                .prepend(newBlank)
                .append(newAddContent);
            }
            callback();
          });
        } else {
          callback();
        }
      }

      let parent = value.parent;
      let element = value.element;
      let fullElementClassName = `${value.parent} ${value.element}`;
      let iElement = Number(element.match(/[0-9]{1,}/));
      let newBlank = $(`.blank`).clone()[0];
      let newAddContent = $(`.addContent`).clone()[0];

      buildElement(parent, fullElementClassName, iElement, () => {
        const addNewContentContainer = () => {
          setTimeout(() => {
            if (!$(`${parent} .newContent`).length) {
              let newContainer = $('<div></div>')
                .addClass(`newContent content subRow flex`)
                .appendTo(parent)
                .prepend(newBlank)
                .append(newAddContent);
            }

            if ($('footer').css('position') === 'absolute') {
              $('.footer').css({
                position: '',
                top: ''
              });
            }

            let svg = $(`${parent} .newContent .blank`);
            svg.addClass('flex');

            $(`${parent} .newContent`)
              .mouseenter(() => {
                $(svg).css({
                    visibility: 'visible',
                    display: ''
                  })
                  .addClass('flex');

                $(svg).click(() => {
                  $(fullElementClassName)
                    .css('padding', '0');

                  $(`${parent} .newContent .addContent`)
                    .css('display', '')
                    .addClass('flex');

                  $(svg)
                    .off()
                    .hide();

                  $(`${parent} .newContent`)
                    .mouseenter(() => {
                      // Only show the 'blank' div if the addContent div is hidden
                      if ($(`${parent} .newContent .addContent`).is(':visible')) {
                        // console.log(`${parent} .newContent .addContent`);
                        $(svg).hide();
                      }
                    });

                  $(`${parent} .newContent .addContent`).ready(() => {
                    let iNewElt;
                    const updateClass = () => {
                      // console.log(parent, $(`${parent} .subRow`).prev());
                      // Toggle classes to match a regular pattern
                      if ($(`${parent} .newContent`).prev().attr('class') !== undefined) {
                        iNewElt = Number($(`${parent} .newContent`).prev().attr('id').substring(7, 9)) + 1;
                        console.log($(`${parent} .newContent`).prev().attr('id').substring(7, 9), iNewElt);
                      }

                      $(`${parent} .newContent`)
                        .removeClass('newContent subRow flex')
                        .attr('id', `content${iNewElt}`)
                        .addClass(`content${iNewElt}`);
                    }

                    // Handle option selection
                    $(`${parent} .newContent .addContent__select`).on('change', () => {

                      $(`${parent} .newContent .addContent__btnContainer`).css('display', 'inline-flex');

                      // If the feed option is selected, handle the adding
                      if ($(`${parent} .newContent .addContent__select`).val() === 'Add a feed') {

                        $(`${parent} .newContent .addContent`).removeClass('menu');

                        $(`${parent} .newContent .addContent__select`).addClass('select');

                        if ($(`${parent} .newContent .addContent__weather:visible`).length) {
                          $(`${parent} .newContent .addContent__weather`).hide();
                        }

                        $(`${parent} .newContent .addContent__feed`).addClass('flex');

                        // Add RSS feed on form submit
                        const submitForm = (btnClass) => {
                          $(`${btnClass} .addContent__submitBtn`)
                            .click(() => {
                              updateClass();

                              // Call a server-side function to parse the feed if the url isn't null or undefined
                              if ($(`${parent} .content${iNewElt} .addContent__feed__input`).val() !== null && $(`${parent} .content${iNewElt} .addContent__feed__input`).val() !== undefined && $(`${parent} .content${iNewElt} .addContent__feed__input`).val().match(/^http/i)) {

                                // Ask the server to parse the feed
                                socket.emit('add content', [{
                                  element: `.content${iNewElt}`,
                                  parent: parent,
                                  url: $(`${parent} .content${iNewElt} .addContent__feed__input`).val(),
                                  type: 'rss',
                                  new: true
                                }]);

                                $(`${parent} .content${iNewElt} .addContent`).hide();

                                // Add content to the page
                                parseContent();
                              } else {
                                printError({
                                  type: 'rss',
                                  msg: `Hey, this value is invalid !`,
                                  element: `${parent} .content${iNewElt} .addContent__feed`
                                });

                                submitForm(`${parent} .content${iNewElt}`);
                              }
                            });
                        }

                        submitForm(`${parent} .newContent`);
                      } else if ($(`${parent} .newContent .addContent__select`).val() === 'Weather forecast') {

                        $(`${parent} .newContent .addContent`).removeClass('menu');

                        $(`${parent} .newContent .addContent__select`).addClass('select');

                        if ($(`${parent} .newContent .addContent__feed:visible`).length) {
                          $(`${parent} .newContent .addContent__feed`).hide();
                        }

                        $(`${parent} .newContent .addContent__weather`)
                          .css({
                            justifyContent: 'center',
                            alignItems: 'center'
                          })
                          .addClass('flex');

                        // Search for weather forecast on form submit
                        const submitForm = (btnClass) => {
                          // Avoid ES6 here because it breaks $(this)
                          $(btnClass).click(function() {
                            updateClass();

                            let parent = `.${$(this).parents('.content__container').attr('id')}`;
                            let element = `.${$(this).parents('.content').attr('id')}`;

                            $.ajax({
                              url: `https://api.openweathermap.org/data/2.5/find?q=${$(`${parent} .content${iNewElt} .addContent__weather__input`).val()}&units=metric&lang=en&appid=${owmToken}`,
                              method: 'POST',
                              dataType: 'json',
                              statusCode: {
                                400: () => {
                                  printError({
                                    type: 'weather',
                                    msg: 'Something is wrong with your request... Please contact the dev to fix it.',
                                    element: `${parent} ${element}`
                                  });
                                },
                                401: () => {
                                  printError({
                                    type: 'weather',
                                    msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                                    element: `${parent} ${element}`
                                  });

                                  submitForm(`${parent} .content${iNewElt} .addContent__submitBtn`);
                                },
                                200: (forecast => {

                                  // Add content to the page
                                  parseContent();

                                  $(`${parent} ${element} .addContent`).hide();
                                  // console.log(`${parent} .content${iNewElt}`);

                                  // Send the changes to the server side
                                  socket.emit('add content', [{
                                    element: element,
                                    parent: parent,
                                    location: $(`${parent} ${element} .addContent__weather__input`).val(),
                                    type: 'weather',
                                    new: true
                                  }]);
                                })
                              }
                            })
                          });
                        }

                        submitForm(`${parent} .newContent .addContent__submitBtn`);
                      } else {
                        $(`${parent} .newContent .addContent`).addClass('menu');
                        $(`${parent} .newContent .addContent__select`).removeClass('select');
                        $(`${parent} .newContent .addContent__feed, ${parent} .newContent .addContent__weather, ${parent} .newContent .addContent__btnContainer`).hide();
                      }
                    });

                    // Cancel new content adding
                    $(`${parent} .newContent .addContent__cancelBtn`).click(function() {
                      $(this).parent('.addContent').hide();
                      $(this).parent('.blank')
                        .css({
                          visibility: 'visible',
                          display: 'flex'
                        })
                    });
                  });
                });
              })
              .mouseleave(() => {
                $(svg).css({
                  visibility: 'hidden'
                });
              });

            // Fix the content divs order
            $('.newContent').ready(() => {
              $('.content').each(function(index) {

                // Exclude the ".newContent" div
                if (!$(this).hasClass('newContent')) {
                  $(this).css('order', $(this).attr('id').substring(7, 9));
                } else {

                  // Send the newContent div at the bottom
                  $(this).css('order', 100);
                }
              });
            });
          }, 500);
        }

        // Remove the event handler to show the "+" sign
        $(fullElementClassName).off();

        if (value.type === 'weather') {
          // Prevent duplicates
          if (!$(`${fullElementClassName} .forecast`).length) {

            // Check if location is defined and if the token is valid
            if (value.location !== undefined && owmToken.match(/[a-z0-9]{32}/)) {
              $.ajax({
                url: `https://api.openweathermap.org/data/2.5/find?q=${value.location}&units=metric&lang=en&appid=${owmToken}`,
                method: 'POST',
                dataType: 'json',
                statusCode: {
                  401: () => {
                    printError({
                      type: 'weather',
                      msg: 'Sorry dude, your OpenWeatherMap token is invalid 😢. Please modify it in the settings.',
                      element: fullElementClassName
                    });
                  },
                  200: (forecast => {
                    let resCode = forecast.cod;
                    let count = forecast.count;

                    // 404 errors handling (forecast.count can't be equals to 0)
                    if (count === 1) {

                      if ($(`${fullElementClassName} .addContent:visible`).length) {
                        $(`${fullElementClassName} .addContent`).hide();
                      }

                      let cityID = forecast.list[0].id;

                      // Format the forecast summary to get the first letter uppercase
                      let tempDescription = forecast.list[0].weather[0].description.split('');
                      let firstLetter = tempDescription[0].toUpperCase();
                      tempDescription.shift();
                      tempDescription.unshift(firstLetter);

                      tempDescription = tempDescription.join('');

                      let previsions = {
                        temp: forecast.list[0].main.temp,
                        city: forecast.list[0].name,
                        description: tempDescription,
                        humidity: forecast.list[0].main.humidity,
                        windSpeed: forecast.list[0].wind.speed,
                        weatherIcon: forecast.list[0].weather[0].icon
                      };

                      // Prevent duplicates
                      if (!$(`${fullElementClassName} .forecast`).length) {
                        let forecastContainer = $('<section></section>')
                          .addClass('forecast flex')
                          .appendTo(fullElementClassName);

                        let forecastHeader = $('<span></span>')
                          .addClass('forecast__header')
                          .appendTo(forecastContainer);

                        let forecastTitle = $('<a></a>')
                          .addClass('forecast__header__title')
                          .text(`Weather in ${previsions.city}`)
                          .attr('href', `https://openweathermap.org/city/${cityID}`)
                          .appendTo(forecastHeader);

                        let forecastContent = $('<div></div>')
                          .addClass('forecast__content flex')
                          .appendTo(forecastContainer);

                        let forecastInfo = $('<div></div>')
                          .addClass('forecast__content__info flex')
                          .appendTo(forecastContent);

                        let description = $('<span></span>')
                          .addClass('forecast__content__info__desc')
                          .appendTo(forecastInfo);

                        let descriptionDesc = $('<p></p>')
                          .addClass('forecast__content__info__description__desc flex')
                          .text(previsions.description)
                          .appendTo(description);

                        let descriptionIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text('🛈')
                          .prependTo(description);

                        let temp = $('<span></span>')
                          .addClass('forecast__content__info__temp')
                          .appendTo(forecastInfo);

                        let tempDesc = $('<p></p>')
                          .addClass('forecast__content__info__temp__desc flex')
                          .text(`${previsions.temp} °C`)
                          .appendTo(temp);

                        let tempIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text('🌡')
                          .prependTo(temp);

                        let windSpeed = $('<span></span>')
                          .addClass('forecast__content__info__wind')
                          .appendTo(forecastInfo);

                        let windDesc = $('<p></p>')
                          .addClass('forecast__content__info__wind__desc')
                          .text(`${previsions.windSpeed} km/h`)
                          .appendTo(windSpeed);

                        let windIcon = $('<img>')
                          .addClass('forecastIcon')
                          .attr({
                            alt: 'wind icon',
                            src: './src/css/icons/interface/wind.svg'
                          })
                          .prependTo(windSpeed);

                        let humidity = $('<span></span>')
                          .addClass('forecast__content__info__humidity')
                          .appendTo(forecastInfo);

                        let humidityDesc = $('<p></p>')
                          .addClass('forecast__content__info__humidity__desc flex')
                          .text(`${previsions.humidity} %`)
                          .appendTo(humidity);

                        let humidityIcon = $('<span></span>')
                          .addClass('forecastIcon')
                          .text(`💧`)
                          .prependTo(humidity);

                        // Create a div to store the weather icon
                        let weatherIconContainer = $('<div></div>')
                          .addClass('forecast__weatherIcon flex')
                          .appendTo(forecastContent);

                        // Define the weather icon
                        let weatherIcon = $('<span></span>')
                          .addClass('forecast__weatherIcon__icon')
                          .appendTo(weatherIconContainer);

                        // Add weather icon
                        updateWeatherIcon(previsions);

                        // Add content options
                        let contentOptions = $('<span></span>')
                          .addClass('contentOptions')
                          .appendTo(forecastHeader);

                        let updateContentBtn = $('<img>')
                          .addClass('updateContentBtn')
                          .attr({
                            alt: 'Update content',
                            src: './src/css/icons/interface/refresh.svg'
                          })
                          .appendTo(contentOptions);

                        let removeContentBtn = $('<img>')
                          .addClass('removeContentBtn')
                          .attr({
                            alt: 'Remove content',
                            src: './src/css/icons/interface/cross.svg'
                          })
                          .appendTo(contentOptions);

                        addContentOptions(fullElementClassName);

                        addNewContentContainer();
                      }
                    } else {
                      printError({
                        type: 'weather',
                        msg: 'Sorry homie, it seems this location doesn\'t exist...',
                        element: fullElementClassName
                      });
                    }
                  })
                }
              })
            }
          }
        }

        if (value.type === 'rss') {
          let feed = value.feed;

          // Create the RSS container if they don't exist
          if (!$(`${fullElementClassName} .rssContainer`).length) {
            buildRssContainer(feed, (feed, rssContainer) => {
              rssContainer.appendTo(fullElementClassName);

              let rssContainerHeader = $('<div></div>')
                .addClass('rssContainer__header')
                .prependTo(`${fullElementClassName} .rssContainer`);

              let feedTitle = $('<a></a>')
                .addClass('feedTitle')
                .attr({
                  href: feed[0].meta.link
                })
                .text(feed[0].meta.title)
                .prependTo(`${fullElementClassName} .rssContainer__header`);

              // Add content options
              let contentOptions = $('<span></span>')
                .addClass('contentOptions')
                .appendTo(rssContainerHeader);

              let updateContentBtn = $('<img>')
                .addClass('updateContentBtn')
                .attr({
                  alt: 'Update content',
                  src: './src/css/icons/interface/refresh.svg'
                })
                .appendTo(contentOptions);

              let removeContentBtn = $('<img>')
                .addClass('removeContentBtn')
                .attr({
                  alt: 'Remove content',
                  src: './src/css/icons/interface/cross.svg'
                })
                .appendTo(contentOptions);

              displayArticleSummary();

              addContentOptions(fullElementClassName);

              addNewContentContainer();
            });
          }
        }

        // Add a margin to the dynamicaly created divs
        if (!parent.match(iElement)) {
          $(fullElementClassName).addClass('subRow');
        }
      });

      // Hide the '.blank' divs if there are visibles siblings
      $(fullElementClassName).ready(() => {
        if (i === parsedData.length - 1 && !$(`${fullElementClassName} .blank`).siblings('*:visible')) {
          $(`${fullElementClassName} .blank`).hide();
        }
      });
    }
  });
}

const printError = (err) => {
  if (err.type === 'generic') {
    $('.msgContainer')
      .addClass('warning')
      .text(err.msg)
      .show();

    setTimeout(() => {
      $('.msgContainer')
        .hide()
        .removeClass('warning');
    }, 5000);
  } else if (err.type === 'weather') {
    if (err.element !== null && err.element !== undefined) {

      // Disable all the events handler on the content div
      $(err.element).off();
      if (!$(`${err.element} .warning`).length) {
        let warning = $('<span></span>')
          .addClass('warning')
          .text(err.msg)
          .appendTo(`${err.element} .addContent__weather`);
      }
    }
  } else if (err.type === 'rss') {
    let errMsg = $('<span></span>')
      .addClass('warning')
      .text(err.msg)
      .appendTo(err.element);
  } else if (err.type === 'rss verification') {
    $(err.element).off();
    if (!$(`${err.element} .rssWarning`).length) {
      $(`${err.element} .addContent, ${err.element} .addContent__feed`)
        .css('display', '')
        .addClass('flex');

      let errMsg = $('<span></span>')
        .addClass('warning rssWarning')
        .text(err.msg)
        .appendTo($(`${err.element} .addContent__feed`));
    }
  } else if (err.type === 'unit conversion') {
    if (!$('.upperContainer__converter .warning').length) {
      let warning = $('<b></b>')
        .text(err.msg)
        .addClass('warning')
        .appendTo(err.element);
    } else {
      $('.upperContainer__converter .waring').css('display', 'flex');
    }
  } else if (err.type === 'upload') {
    if (!$(`.settings__container .uploadWarning`).length) {
      let warning = $('<b></b>')
        .text(err.msg)
        .addClass('warning uploadWarning')
        .css('display', '');

      $('.backgroundImageUploadForm').after(warning);
    }
  }
}

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
        socket.emit('audio info request', {
          id: id
        });

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
    } else if (msg.startsWith('!sv ')) {
      // Extract the command to only keep the keywords
      args.shift();

      $.ajax({
        url: `https://invidio.us/api/v1/search?q=${args.join(' ')}&language=json&type=video`,
        method: 'GET',
        dataType: 'json',
        statusCode: {
          200: (res) => {
            let results = '';
            for (let i = 0; i < 10; i++) {
              results += `${i + 1}) ${res[i].title} - ${res[i].videoId}\n\n`;

              if (i === 9) {
                console.log(results);
              }
            }
          }
        }
      });
    }
    if (msg.startsWith('!p ')) {
      // Play audio function
      if (msg.match(/[0-9A-Za-z_-]{11}/) && !msg.match(/[0-9A-Za-z_-]{15,34}/)) {
        let id = msg.match(/[0-9A-Za-z_-]{11}/)[0];

        $.ajax({
          url: `https://invidio.us/api/v1/videos/${id}`,
          method: 'GET',
          dataType: 'json',
          statusCode: {
            200: (res) => {
              const findUrl = () => {
                for (const [i, resValue] of res.adaptiveFormats.entries()) {
                  if (resValue.type.match(/audio/)) {
                    return resValue.url;
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
                  .appendTo('.player');

                let audioSrc = $('<source>');
                audioSrc.attr({
                    id: 'audioSrc',
                    src: url,
                    type: 'audio/mpeg'
                  })
                  .appendTo('.audio__player');
              } else {
                $('#audioSrc').attr('src', url);
              }

              // If the info about the track are not displayed, add them
              if (!$('.streamInfoContainer').length) {
                let streamInfoContainer = $('<span></span>')
                  .addClass('streamInfoContainer')
                  .appendTo('.audioMsg');

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

              $('.audioMsg, .streamInfoContainer, .audio__player').show();
              $('.audio').fadeIn(1500, () => {
                $('.audio').css('display', 'flex');
              });

              document.getElementById('audio__player').onended = () => {
                $('.audio').fadeOut(1500);
              };

              // Remove the player on delete button click
              hideContent('.audio__remove');
            },
            500: (res) => {
              printError({
                type: 'generic',
                msg: `Sorry, the audio stream failed to load due to a server error... Try maybe later.`
              });
            }
          }
        });
      } else if (msg.match(/[a-zA-Z0-9-_]{15,34}/)[0] !== null) {
        // Check if the keyword match a playlist pattern

        // Reset the playlist counter
        iPlaylist = 0;
        let id = msg.match(/[a-zA-Z0-9-_]{15,34}/)[0];
        let apiUrl = `https://invidio.us/api/v1/playlists/${id}`;

        socket.emit('parse playlist', apiUrl);

        socket.on('playlist parsed', () => {
          $.ajax({
            url: './tmp/playlist.json',
            dataType: 'json',
            method: 'GET'
          }).done((data) => {
            listen2Playlist(data);
          });
        });
      } else {
        printError({
          type: 'generic',
          msg: 'Bad URL :(('
        });
      }
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

const showConverter = () => {
  let result;

  $('.header__converterBtn').on('click', function() {
    $('.upperContainer__converter')
      .fadeIn()
      .css('display', 'flex');
  });

  $('.converter__input, .converter__value1, .converter__value2').on('change', () => {
    let inputUnit = $('.converter__value1').val();
    let inputValue = Number($('.converter__input').val());
    let resultUnit = $('.converter__value2').val();

    const appendResult = (result) => {
      if (result !== undefined) {
        $('.converter__result').val(result);
      } else {
        $('.converter__result').val('');
        console.log(`Error converting unit... Result value : ${result}`);
      }
    }

    const convert = () => {
      if (!isNaN(inputValue)) {
        if (inputUnit === 'Byte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue / Math.pow(1024, 1);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue / Math.pow(1024, 2);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue / Math.pow(1024, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(1024, 4);
          } else if (resultUnit === 'Byte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Kilobyte') {
          if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue / Math.pow(10, 3);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue / Math.pow(10, 6);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(10, 9);
          } else if (resultUnit === 'Kilobyte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Megabyte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue * Math.pow(10, 3);
          } else if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue / Math.pow(10, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(10, 6);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Gigabyte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 9);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue * Math.pow(10, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(10, 3);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Terabyte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue * Math.pow(10, 9);
          } else if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 12);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue * Math.pow(10, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue;
          }
        }

        $('.upperContainer__converter .warning').hide();

        if (inputValue !== '') {
          appendResult(result);
        }
      } else {
        printError({
          type: 'unit conversion',
          element: $('.upperContainer__converter'),
          msg: `Please enter a numeric value... 😑`
        });
      }
    }

    convert();
  });

  hideContent('.converter__remove');
}

const showSettings = () => {

  const hideSettings = () => {
    if ($('.uploadWarning').length) {
      $('.uploadWarning').remove();
    }

    $('.backgroundImage, header, .mainContainer').css('filter', 'none');
    $('.settings__container').fadeOut();
  }

  // Create an object to store the new settings values
  let updatedSettings = {};
  let checkboxState = $('.toggleRss__Input').prop('checked');

  if (!checkboxState) {
    $('.toggleRss__Slider').addClass('unchecked');
  } else {
    $('.toggleRss__Slider').removeClass('unchecked');
  }

  $('.header__settingsBtn').click(() => {
    $('.backgroundImage, header, .mainContainer')
      .css('filter', 'blur(4px)');
    $('.settings__container')
      .fadeIn()
      .css('display', 'flex');
  });

  // Simulate click on the input to upload a file and enable the rss feed feature on startup
  $('.backgroundImageUploadForm__Btn').click(() => {
    $('.backgroundImageUploadForm__InputFile').click();
  });

  $('.toggleRss__Switch').click(() => {
    updatedSettings.RSS = $('.toggleRss__Input').prop('checked');
    // Adapt the design of the slider if the input is checked
    if (!$('.toggleRss__Input').prop('checked')) {
      $('.toggleRss__Slider').addClass('unchecked');
    } else {
      $('.toggleRss__Slider').removeClass('unchecked');
    }
  });

  $('.settings__child__cancelBtn').click(() => {
    hideSettings();
  });

  // Watch for search engine changes
  $('.searchEngineSelection__select').on('change', () => {
    let searchEngineValue = $('.searchEngineSelection__select').val();
    updatedSettings.searchEngine = {};

    updatedSettings.searchEngine.label = searchEngineValue;

    if (searchEngineValue === 'Bing') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.bing.com/search?q=';
    } else if (searchEngineValue === 'DuckDuckGo') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://duckduckgo.com/?q=';
    } else if (searchEngineValue === 'Ecosia') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.ecosia.org/search?q=';
    } else if (searchEngineValue === 'Google') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.google.com/search?q=test';
    } else if (searchEngineValue === 'Qwant') {
      updatedSettings.searchEngine.url = searchEngine.url = 'https://www.qwant.com/?q=';
    }
  });

  $('.settings__child__saveBtn').click(() => {
    // Is there error = true, cancel the settings div hiding
    let error = false;

    // Only submit the form if one of the fields are fullfilled
    if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() === '') {
      let file = $('.backgroundImageUploadForm__InputFile').get(0).files[0];

      // Check if file is not too large by converting bytes to megabytes
      if ((file.size / 1048576) > 5) {
        error = true;

        printError({
          type: 'upload',
          msg: 'Your file is too laaaaarge ! Please select one under 5 Mb.'
        });
      } else {
        updatedSettings.backgroundImage = `./upload/${file.name}`;

        let fd = new FormData();
        fd.append('backgroundImageUploadInput', file, file.name);

        $.ajax({
          url: '/upload',
          type: 'POST',
          data: fd,
          processData: false,
          contentType: false,
          statusCode: {
            404: () => {
              console.log('page not found !');
            },
            200: () => {
              console.log('upload successfull !');
            }
          },
          success: (res) => {
            // console.log(fd, file, `${updatedSettings.backgroundImage} uploaded successfully`);
            $('.backgroundImage').css('backgroundImage', updatedSettings.backgroundImage);

            // Update the <style> tag to fix the blur
            $('head style').remove();
            $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage});}</style>`);
          },
          error: (err) => {
            console.log(fd, file, `Error uploading file :\n${JSON.stringify(err, null, 2)}`);
          }
        });
      }
    } else {
      if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
        if ($('.backgroundImageUploadForm__InputUrl').val().match(/^(http|https):\/\/(www.|)[a-zA-Z0-9-\.\/]{1,}\.\w.+/i)) {
          if ($('.backgroundImageUploadForm__InputUrl').val().length < 200) {
            updatedSettings.backgroundImage = $('.backgroundImageUploadForm__InputUrl').val();
            $('.backgroundImage').css('backgroundImage', updatedSettings.backgroundImage);

            // Update the formContainer::before background-image
            if ($('head style').length) {
              for (var i = 0; i < $('head style').length; i++) {
                if ($('head style')[i].textContent === headStyle) {
                  $('head style')[i].remove();
                  $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage}); !important}</style>`);
                }
              }
            } else {
              $('head').append(`<style>.formContainer__container::before {background-image: url(${updatedSettings.backgroundImage}); !important}</style>`);
            }
          } else {
            error = true;
            printError({
              type: 'upload',
              msg: 'Your URL is too large ! Please shorten it !'
            });
          }
        } else {
          error = true;
          printError({
            type: 'upload',
            msg: 'Your URL is not supported... Please try another one or open an issue on Github'
          });
        }
      } else if ($('.backgroundImageUploadForm__InputFile').val() !== '' && $('.backgroundImageUploadForm__InputUrl').val() !== '') {
        error = true;
        printError({
          type: 'upload',
          msg: 'Hey, don\'t be too powerful dude ! One field at a time !'
        });
      }

      if (updatedSettings.RSS !== undefined) {
        // Reload the page if the RSS status is modified to be true
        if (updatedSettings.RSS === true) {
          // Send the updated RSS status to the server
          socket.emit('customization', updatedSettings);
          location.reload();
        } else {
          $('.moreContent').hide();
        }
      }

      if (checkboxState !== $('.toggleRss__Input').prop('checked')) {}

      if ($('.backgroundImageUploadForm__InputFile').val() === '' && $('.backgroundImageUploadForm__InputUrl').val() === '' && $('.owmToken__input').val() === '') {
        // If none of the fields are fullfilled, just hide the settings menu
        $('.backgroundImage, header, .mainContainer')
          .css('filter', 'none');

        $('.settings__container').fadeOut();
      }

      if ($('.owmToken__input').val().match(/[a-z0-9]{32}/)) {
        // OpenWeatherMap token
        updatedSettings.owmToken = $('.owmToken__input').val();
        owmToken = $('.owmToken__input').val();
      }
    }

    $('.owmToken__input').val(updatedSettings.owmToken);

    // If there is no errors, hide the div
    if (!error) {

      hideSettings();

      // Send the updated settings to the server
      socket.emit('customization', updatedSettings);

      if ($('.uploadWarning').length) {
        $('.uploadWarning').remove();
      }
    }
  });
}

const suggestions = [{
    label: '!1337x',
    desc: '1337x.to',
    icon: './src/css/icons/suggestions/1337x.ico',
    url: 'https://1337x.to/search/'
  },
  {
    label: '!afr',
    desc: 'Amazon (FR)',
    icon: './src/css/icons/suggestions/amazon.png',
    url: 'https://www.amazon.fr/s?k='
  },
  {
    label: '!a',
    desc: 'Amazon (US)',
    icon: './src/css/icons/suggestions/amazon.png',
    url: 'https://www.amazon.com/s?k='
  },
  {
    label: '!alto',
    desc: 'AlternativeTo',
    icon: './src/css/icons/suggestions/alto.ico',
    url: 'https://alternativeto.net/browse/search?q='
  },
  {
    label: '!css',
    desc: 'CSS Tricks',
    icon: './src/css/icons/suggestions/csstricks.png',
    url: 'https://css-tricks.com/?s='
  },
  {
    label: '!d',
    desc: 'Download a YouTube audio stream',
    icon: './src/css/icons/suggestions/download.png'
  },
  {
    label: '!fdroid',
    desc: 'F-Droid',
    icon: './src/css/icons/suggestions/fdroid.png',
    url: 'https://search.f-droid.org/?q='
  },
  {
    label: '!g',
    desc: 'Google',
    icon: './src/css/icons/suggestions/google.png',
    url: 'https://www.google.com/search?q='
  },
  {
    label: '!gh',
    desc: 'Github',
    icon: './src/css/icons/suggestions/github.ico',
    url: 'https://github.com/search?q='
  },
  {
    label: '!gt',
    desc: 'Google translate',
    icon: './src/css/icons/suggestions/gt.ico',
    url: 'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text='
  },
  {
    label: '!gmap',
    desc: 'Google Maps',
    icon: './src/css/icons/suggestions/maps.ico',
    url: 'https://www.google.be/maps/search/'
  },
  {
    label: '!htg',
    desc: 'How-to Geek',
    icon: './src/css/icons/suggestions/howtogeek.ico',
    url: 'https://www.howtogeek.com/search/?q='
  },
  {
    label: '!iv',
    desc: 'Invidio.us',
    icon: './src/css/icons/suggestions/invidious.png',
    url: 'https://invidio.us/search?q='
  },
  {
    label: '!jq',
    desc: 'Jquery API',
    icon: './src/css/icons/suggestions/jquery.ico',
    url: 'https://api.jquery.com/?ns0=1&s='
  },
  {
    label: '!ldlc',
    desc: 'LDLC',
    icon: './src/css/icons/suggestions/ldlc.png',
    url: 'https://www.ldlc.com/fr-be/recherche/'
  },
  {
    label: '!li',
    desc: 'LinkedIn',
    icon: './src/css/icons/suggestions/linkedin.ico',
    url: 'https://www.linkedin.com/search/results/all/?keywords='
  },
  {
    label: '!ln',
    desc: 'Les Numériques',
    icon: './src/css/icons/suggestions/ln.png',
    url: 'https://www.lesnumeriques.com/recherche?q='
  },
  {
    label: '!mdn',
    desc: 'Mozilla Developer network',
    icon: './src/css/icons/suggestions/mdn.png',
    url: 'https://developer.mozilla.org/en-US/search?q='
  },
  {
    label: '!mmfr',
    desc: 'Media Markt (BE FR)',
    icon: './src/css/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.be/fr/search.html?query='
  },
  {
    label: '!mmnl',
    desc: 'Media Markt (BE NL)',
    icon: './src/css/icons/suggestions/mm.png',
    url: 'https://www.mediamarkt.nl/nl/search.html?query='
  },
  {
    label: '!mt',
    desc: 'Marine Traffic',
    icon: './src/css/icons/suggestions/marinetraffic.ico',
    url: 'https://www.marinetraffic.com/en/ais/index/search/all?keyword='
  },
  {
    label: '!pb',
    desc: 'Pages Blanches (BE)',
    icon: './src/css/icons/suggestions/pagesblanches.ico',
    url: 'https://www.pagesblanches.be/chercher/personne/'
  },
  {
    label: '!os',
    desc: 'OpenSubtitles',
    icon: './src/css/icons/suggestions/opensub.ico',
    url: 'https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-'
  },
  {
    label: '!osm',
    desc: 'OpenStreetMap',
    icon: './src/css/icons/suggestions/osm.png',
    url: 'https://www.openstreetmap.org/search?query='
  },
  {
    label: '!owm',
    desc: 'OpenWeatherMap',
    icon: './src/css/icons/suggestions/owm.ico',
    url: 'https://openweathermap.org/find?q='
  },
  {
    label: '!p',
    desc: 'Play a Youtube audio stream or playlist',
    icon: './src/css/icons/suggestions/play.svg'
  },
  {
    label: '!rarbg',
    desc: 'RARBG',
    icon: './src/css/icons/suggestions/rarbg.png',
    url: 'http://rarbgmirror.org/torrents.php?search='
  },
  {
    label: '!rt',
    desc: 'Rottentomatoes',
    icon: './src/css/icons/suggestions/rottentomatoes.png',
    url: 'https://www.rottentomatoes.com/search/?search='
  },
  {
    label: '!rtbf',
    desc: 'RTBF',
    icon: './src/css/icons/suggestions/rtbf.png',
    url: 'https://www.rtbf.be/info/recherche?q='
  },
  {
    label: '!sc',
    desc: 'SoundCloud',
    icon: './src/css/icons/suggestions/soundcloud.ico',
    url: 'https://soundcloud.com/search?q='
  },
  {
    label: '!so',
    desc: 'Stack Overflow',
    icon: './src/css/icons/suggestions/so.ico',
    url: 'https://stackoverflow.com/search?q='
  },
  {
    label: '!sv',
    desc: 'Instant video search',
    icon: ''
  },
  {
    label: '!torrent',
    desc: 'Oxtorrent.com',
    icon: './src/css/icons/suggestions/torrent.ico',
    url: 'https://www.oxtorrent.com/recherche/'
  },
  {
    label: '!uc',
    desc: 'Unicode table',
    icon: './src/css/icons/suggestions/unicode.ico',
    url: 'https://unicode-table.com/en/search/?q='
  },
  {
    label: '!w',
    desc: 'Wikipedia (EN)',
    icon: './src/css/icons/suggestions/wikipedia.ico',
    url: 'https://en.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wfr',
    desc: 'Wikipedia (FR)',
    icon: './src/css/icons/suggestions/wikipedia.ico',
    url: 'https://fr.wikipedia.org/w/index.php?search='
  },
  {
    label: '!wt',
    desc: 'Wikitionnary (EN)',
    icon: './src/css/icons/suggestions/wt.ico',
    url: 'https://en.wiktionary.org/w/index.php?search='
  },
  {
    label: '!wtfr',
    desc: 'Wikitionnary (FR)',
    icon: './src/css/icons/suggestions/wt.ico',
    url: 'https://fr.wiktionary.org/w/index.php?search='
  },
  {
    label: '!yarn',
    desc: 'Yarn',
    icon: './src/css/icons/suggestions/yarn.ico',
    url: 'https://yarnpkg.com/en/packages?q='
  },
  {
    label: '!yt',
    desc: 'Youtube',
    icon: './src/css/icons/suggestions/yt.ico',
    url: 'https://www.youtube.com/results?search_query='
  }
];

const updateWeatherIcon = (previsions) => {
  if (previsions.description.match(/clear sky/i)) {
    $('.forecast__weatherIcon__icon')
      .text('☼')
      .css({
        color: 'yellow'
      });
  } else if (previsions.description.match(/clouds/i)) {
    $('.forecast__weatherIcon__icon')
      .text('☁');
  } else if (previsions.description.match(/rain/i)) {
    $('.forecast__weatherIcon__icon')
      .text('🌧');
  } else if (previsions.description.match(/mist/i)) {
    $('.forecast__weatherIcon__icon').addClass('icon flex');

    let mistIcon = $('<img>')
      .attr({
        src: './src/css/icons/interface/mist.svg',
        alt: 'Mist icon'
      });

    if (!$('.forecast__weatherIcon__icon img').length) {
      mistIcon.appendTo($('.forecast__weatherIcon__icon'));
    } else {
      $('.forecast__weatherIcon__icon img').replaceWith(mistIcon);
    }
  }
}

$(document).ready(() => {
  $('.credits').hide();

  socket.on('RSS status retrieved', rssStatus => {
    checkRSSstatus(rssStatus);
  });

  if (!$('.subRow').length) {
    $('footer').css({
      position: 'absolute',
      top: '90%'
    });
  }

  checkForUpdates();

  // Show settings on button click
  showSettings();

  // Display the units converter on button click
  showConverter();

  // Add containers on startup
  parseContent();

  socket.on('refresh app', () => {
    location.reload();
  });

  socket.on('errorMsg', (err) => {
    printError(err);
  });

  socket.on('server settings updated', (data) => {
    if (data !== null && data !== undefined) {
      $('.backgroundImage').css('background-image', `url(${data.backgroundImage})`);

      $('.backgroundImage, header, .mainContainer').css('filter', 'none');

      $('.settings').fadeOut();
    }
  });

  // Autocomplete
  $('.questionBox').on('input', () => {
    autocomplete($('.questionBox').val());
  });

  $('.form').keypress((event) => {
    if (event.keyCode === 13) {
      questionBoxSubmit();
      $('.formContainer').css({
        padding: '0.5% 1%'
      });
    }
  })

  //Submit form on svg icon click
  $('.formSubmit').click(() => {
    questionBoxSubmit();
  });

  // If the msgContainer is empty, hide it
  if (!$('.msgContainer').text().match(/\w.+/)) {
    $('.msgContainer').hide();
  } else {
    fade('.msgContainer');
  }

  // Get current mouse position
  getMousePosition();

  // Dynamically show the footer
  $('.footer').mouseenter(() => {
    $('.credits')
      .fadeIn();
  }).mouseleave(() => {
    $('.credits').fadeOut();
  });
});

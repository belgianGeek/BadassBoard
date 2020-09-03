const handleOptionSelection = (parent, child) => {
  let newContentClass = '';
  let elementsObject = {};

  let iNewElt = 2;

  const hideSiblings = (selector) => {

    // Check if the element exist and if arguments are not null/undefined
    if (selector !== undefined) {
      $(`${parent} ${child} .addContent`).children().not(`${selector}, ${selector}__input, select, option, label, .addContent__btnContainer, .addContent__submitBtn, .addContent__cancelBtn`).hide();
    } else if (selector === undefined) {
      $(`${parent} ${child} .addContent__feed`)
        .css('display', 'flex')
        .addClass('hidden');

      $(`${parent} ${child} .addContent`).children().not(`.addContent__feed, select, option, label, .addContent__btnContainer, .addContent__submitBtn, .addContent__cancelBtn`).hide();
    }
  }

  const updateClass = () => {
    // Toggle classes to match a regular pattern
    if (parent === '.content1__container') {
      lastContent.content1++;
      iNewElt = lastContent.content1;
      console.log(lastContent, iNewElt);
    } else if (parent === '.content2__container') {
      lastContent.content2++;
      iNewElt = lastContent.content2;
    } else if (parent === '.content3__container') {
      lastContent.content3++;
      iNewElt = lastContent.content3;
    }

    $(`${parent} .newContent`)
      .removeClass('newContent subRow flex')
      .attr('id', `content${iNewElt}`)
      .addClass(`content${iNewElt}`);
  }

  // Handle option selection
  $(`${parent} ${child} .addContent__select`).on('change', () => {

    $(`${parent} ${child} .addContent__btnContainer`).css('display', 'inline-flex');

    // If the feed option is selected, handle the adding
    if ($(`${parent} ${child} .addContent__select`).val() === 'Add a feed') {

      $(`${parent} ${child} .addContent`).removeClass('justifyCentered');

      $(`${parent} ${child} .addContent__select`).addClass('select');

      $(`${parent} ${child} .addContent__feed`)
        .removeClass('hidden')
        .addClass('flex')
        .css('display', '');

      // Hide uneccesary elements
      hideSiblings(`.addContent__feed`);

      // Add RSS feed on form submit
      $(`${parent} ${child} .addContent__submitBtn`)
        .click(() => {
          let btnClass = `${parent} ${child}`;

          if (child === '.newContent') {
            updateClass();
            btnClass = `${parent} .content${iNewElt}`;

            elementsObject = {
              element: `.content${iNewElt}`,
              parent: parent,
              url: $(`${parent} .content${iNewElt} .addContent__feed__input`).val(),
              type: 'rss'
            }
          } else {
            elementsObject = {
              element: child,
              parent: parent,
              url: $(`${parent} ${child} .addContent__feed__input`).val(),
              type: 'rss'
            }
          }

          // Call a server-side function to parse the feed if the url isn't null or undefined
          if ($(`${btnClass} .addContent__feed__input`).val() !== null && $(`${btnClass} .addContent__feed__input`).val() !== undefined && $(`${btnClass} .addContent__feed__input`).val().match(/^http/i)) {

            // Ask the server to parse the feed
            socket.emit('add content', elementsObject);

            $(`${btnClass} .addContent`).hide();
          } else {
            printError({
              type: 'rss',
              msg: `Hey, this value is invalid !`,
              element: `${parent} ${child} .addContent__feed`
            });
          }
        });
    } else if ($(`${parent} ${child} .addContent__select`).val() === 'Weather forecast') {

      $(`${parent} ${child} .addContent`).removeClass('justifyCentered');

      $(`${parent} ${child} .addContent__select`).addClass('select');

      $(`${parent} ${child} .addContent__weather`)
        .css('display', '')
        .addClass('flex');

      hideSiblings(`.addContent__weather`);

      // Search for weather forecast on form submit
      // Avoid ES6 here because it breaks $(this)
      $(`${parent} ${child} .addContent__submitBtn`).click(function() {
        let addContentParentClass = `${parent} ${child}`;

        if (child === '.newContent') {
          updateClass();
          addContentParentClass = `${parent} .${$(this).parents('.content').attr('id')}`;
        }

        let element = `.${$(this).parents('.content').attr('id')}`;

        $.ajax({
          url: `https://api.openweathermap.org/data/2.5/find?q=${$(`${addContentParentClass} .addContent__weather__input`).val()}&units=metric&lang=en&appid=${owmToken}`,
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
            },
            200: (forecast => {
              if (child !== '.newContent') {
                elementsObject = {
                  element: child,
                  parent: parent,
                  location: $(`${parent} ${element} .addContent__weather__input`).val(),
                  type: 'weather'
                };
              } else {
                elementsObject = {
                  element: element,
                  parent: parent,
                  location: $(`${parent} ${element} .addContent__weather__input`).val(),
                  type: 'weather'
                }
              }

              let count = forecast.count;

              if (count !== 0) {
                $(`${parent} ${element} .addContent`).hide();

                // Send the changes to the server side
                socket.emit('add content', elementsObject);
              } else {
                printError({
                  type: 'weather',
                  msg: 'Sorry homie, it seems this location doesn\'t exist...',
                  element: `${parent} ${child}`
                });
              }
            })
          }
        })
      });
    } else if ($(`${parent} ${child} .addContent__select`).val() === 'Youtube search box') {
      $(`${parent} ${child} .addContent`).removeClass('justifyCentered');

      $(`${parent} ${child} .addContent__select`).addClass('select');

      $(`${parent} ${child} .addContent__youtube`)
        .css('display', '')
        .addClass('flex');

      hideSiblings('.addContent__youtube');

      $(`${parent} ${child} .addContent__submitBtn`).click(function() {
        if (child === '.newContent') {
          updateClass();
          addContentParentClass = `${parent} .${$(this).parents('.content').attr('id')}`;
        }

        let element = `.${$(this).parents('.content').attr('id')}`;

        if (child !== '.newContent') {
          // Send the changes to the server side
          socket.emit('add content', {
            element: child,
            parent: parent,
            type: 'youtube search'
          });
        } else {
          // Send the changes to the server side
          socket.emit('add content', {
            element: element,
            parent: parent,
            type: 'youtube search'
          });
        }

        $(`${parent} ${element} .addContent`).hide();
      });
    } else {
      $(`${parent} ${child} .addContent`).addClass('justifyCentered');
      $(`${parent} ${child} .addContent__select`).removeClass('select');
      $(`${parent} ${child} .addContent`).children().not(`select, option, label`).hide();
    }
  });

  // Cancel new content adding
  $(`${parent} ${child} .addContent__cancelBtn`).click(function() {
    $(this).parents('.addContent').fadeOut();
    $(`${parent} ${child} .blank`).css('display', '');
  });
}

const handleOptionSelection = (parent, child) => {
  let newContentClass = '';
  let elementsObject = {};

  let iNewElt;
  const updateClass = () => {
    // Toggle classes to match a regular pattern
    if ($(`${parent} ${child}`).prev().attr('class') !== undefined) {
      iNewElt = Number($(`${parent} ${child}`).prev().attr('id').substring(7, 9)) + 1;
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

      $(`${parent} ${child} .addContent`).removeClass('menu');

      $(`${parent} ${child} .addContent__select`).addClass('select');

      $(`${parent} ${child} .addContent__feed`)
        .addClass('flex')
        .css('display', '');

      // Hide uneccesary elements
      if ($(`${parent} ${child} .addContent__weather:visible`).length) {
        $(`${parent} ${child} .addContent__weather`).hide();
      }

      // Add RSS feed on form submit
      const submitForm = (btnClass) => {
        $(`${btnClass} .addContent__submitBtn`)
          .click(() => {
            if (child === '.newContent') {
              updateClass();
              btnClass = `${parent} .content${iNewElt}`;

              elementsObject = {
                element: `.content${iNewElt}`,
                parent: parent,
                url: $(`${parent} .content${iNewElt} .addContent__feed__input`).val(),
                type: 'rss',
                new: true
              }
            } else {
              elementsObject = {
                element: child,
                parent: parent,
                url: $(`${parent} ${child} .addContent__feed__input`).val(),
                type: 'rss',
                new: true
              }
            }

            // Call a server-side function to parse the feed if the url isn't null or undefined
            if ($(`${btnClass} .addContent__feed__input`).val() !== null && $(`${btnClass} .addContent__feed__input`).val() !== undefined && $(`${btnClass} .addContent__feed__input`).val().match(/^http/i)) {

              // Ask the server to parse the feed
              socket.emit('add content', [elementsObject]);

              $(`${btnClass} .addContent`).hide();

              // Add content to the page
              parseContent();
            } else {
              printError({
                type: 'rss',
                msg: `Hey, this value is invalid !`,
                element: `${btnClass} .addContent__feed`
              });

              submitForm(btnClass);
            }
          });
      }

      submitForm(`${parent} ${child}`);
    } else if ($(`${parent} ${child} .addContent__select`).val() === 'Weather forecast') {

      $(`${parent} ${child} .addContent`).removeClass('menu');

      $(`${parent} ${child} .addContent__select`).addClass('select');

      if ($(`${parent} ${child} .addContent__feed:visible`).length) {
        $(`${parent} ${child} .addContent__feed`).hide();
      }

      $(`${parent} ${child} .addContent__weather`)
        .css({
          justifyContent: 'center',
          alignItems: 'center',
          display: ''
        })
        .addClass('flex');

      // Search for weather forecast on form submit
      const submitForm = (submitBtnClass, addContentParentClass) => {
        // Avoid ES6 here because it breaks $(this)
        $(submitBtnClass).click(function() {
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

                submitForm(`${parent} ${element} .addContent__submitBtn`);
              },
              200: (forecast => {
                if (child !== '.newContent') {
                  let count = forecast.count;

                  if (count === 1) {
                    // Add content to the page
                    parseContent();

                    $(`${parent} ${element} .addContent`).hide();

                    // Send the changes to the server side
                    socket.emit('add content', [{
                      element: child,
                      parent: parent,
                      location: $(`${parent} ${element} .addContent__weather__input`).val(),
                      type: 'weather',
                      new: true
                    }]);
                  } else {
                    printError({
                      type: 'weather',
                      msg: 'Sorry homie, it seems this location doesn\'t exist...',
                      element: `${parent} ${child}`
                    });
                  }
                } else {
                  // Add content to the page
                  parseContent();

                  $(`${parent} ${element} .addContent`).hide();

                  // Send the changes to the server side
                  socket.emit('add content', [{
                    element: element,
                    parent: parent,
                    location: $(`${parent} ${element} .addContent__weather__input`).val(),
                    type: 'weather',
                    new: true
                  }]);
                }
              })
            }
          })
        });
      }

      submitForm(`${parent} ${child} .addContent__submitBtn`, child);
    } else {
      $(`${parent} ${child} .addContent`).addClass('menu');
      $(`${parent} ${child} .addContent__select`).removeClass('select');
      $(`${parent} ${child} .addContent__feed, ${parent} ${child} .addContent__weather, ${parent} ${child} .addContent__btnContainer`).hide();
    }
  });

  // Cancel new content adding
  $(`${parent} ${child} .addContent__cancelBtn`).click(function() {
    $(this).parent('.addContent').hide();
    $(this).parent('.blank')
      .css({
        visibility: 'visible',
        display: 'flex'
      });
  });
}

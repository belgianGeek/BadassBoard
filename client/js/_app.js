// Define a variable to store the ID of the currently played track
let iPlaylist = 0;

// Define a vriable to store the mouse coordinates
let mousePosition = {};

// Store the OpenWeatherMap API token
let owmToken = '';

// Store the default search engine
let searchEngine = {};

//Websocket connection
const socket = io();

// Store the style added to the head tag
let headStyle = '';

// Store the last created element number for each content container
let lastContent = {};

// Add the user data to the page
$.ajax({
  url: './settings/settings.json',
  method: 'GET',
  dataType: 'json'
}).done(settings => {
  const retrieveLastElementNumber = () => {
    if (settings.elements[0].elements.length > 0) {
      lastContent.content1 = Number(settings.elements[0].elements[settings.elements[0].elements.length - 1].element.substring(8, 9));
    } else {
      lastContent.content1 = 1;
    }

    if (settings.elements[1].elements.length > 0) {
      lastContent.content2 = Number(settings.elements[1].elements[settings.elements[1].elements.length - 1].element.substring(8, 9));
    } else {
      lastContent.content2 = 1;
    }

    if (settings.elements[2].elements.length > 0) {
      lastContent.content3 = Number(settings.elements[2].elements[settings.elements[2].elements.length - 1].element.substring(8, 9));
    } else {
      lastContent.content3 = 1;
    }
  }

  retrieveLastElementNumber();

  if (settings.owmToken !== undefined) {
    owmToken = settings.owmToken;
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
  }

  if (settings.bot.name !== 'BadassBot') {
    $('.botNameCustomizationForm__input').val(settings.bot.name);
  }

  if (settings.bot.icon.startsWith('http')) {
    $('.chatCustomizationForm__inputUrl').val(settings.bot.icon);
  }
});

socket.on('wallpaper', wallpaper => {
  const handle404ImageError = () => {
    headStyle = `<style>.formContainer__container::before {background-image: url('./client/scss/wallpaper.jpg');}</style>`;
    $('head').append(headStyle);

    $('.msgContainer').text('Sorry, your background image couldn\'t be loaded... Maybe try another one')
    fade('.msgContainer');

    $('.backgroundImage').css('backgroundImage', '');
  }

  $.ajax({
      url: wallpaper,
      method: 'GET',
      dataType: '',
      success: () => {
        // Remove the old style tag and replace it with an updated one
        $('head style').remove();
        headStyle = `<style>.formContainer__container::before {background-image: url(${wallpaper});}</style>`;
        $('head').append(headStyle);

        $('.backgroundImage').css('backgroundImage', `url(${wallpaper})`);
      }
    })
    .fail(err => {
      // CORS error handling
      if (err.status !== 200) {
        handle404ImageError();
      }
    });
});

$('.credits').hide();

socket.on('RSS status retrieved', rssStatus => {
  checkRSSstatus(rssStatus);
});

// Show the "about" page
showAbout();

// Show settings on button click
showSettings();

// Display the units converter on button click
showConverter();

// Add containers on startup
parseContent();

socket.on('refresh app', () => {
  location.reload();
});

socket.on('errorMsg', err => {
  printError(err);
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
});

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
  $('.credits').fadeIn();
}).mouseleave(() => {
  $('.credits').fadeOut();
});

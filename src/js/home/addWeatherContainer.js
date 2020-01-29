const addWeatherContainer = (forecast, fullElementClassName, addNewContentContainer) => {
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
      .appendTo(fullElementClassName, () => {
        $(`${fullElementClassName} .blank`).addClass('invisible');
      });

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
        src: './src/scss/icons/interface/wind.svg'
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
        src: './src/scss/icons/interface/refresh.svg'
      })
      .appendTo(contentOptions);

    let removeContentBtn = $('<img>')
      .addClass('removeContentBtn')
      .attr({
        alt: 'Remove content',
        src: './src/scss/icons/interface/cross.svg'
      })
      .appendTo(contentOptions);

    addContentOptions(fullElementClassName);

    addNewContentContainer();
  }
}

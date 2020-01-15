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

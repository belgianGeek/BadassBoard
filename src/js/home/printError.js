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

// Design the content divs
const addContent = (parent, element) => {
  let svg = `${parent} ${element} .blank`;

  $(element, svg).off();

  setTimeout(() => {
    if (!$(`${parent} ${element} section`).length) {
      $(svg).removeClass('invisible');
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
        handleOptionSelection(parent, element);
      });
    });
  }, 3000);
}

// Design the content divs
const addContent = (parent, element) => {
  let svg = `${parent} ${element} .blank`;
  contentHeight = $('.content').height();

  $(element, svg).off();

console.log(svg);
  setTimeout(() => {
    console.log(1);
    if (!$(`${parent} ${element} section`).length) {
      console.log(2);
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
        handleOptionSelection(parent, element);
      });
    });
  }, 3000);
}

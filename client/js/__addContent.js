// Design the content divs
const addContent = (parent, element) => {
  let svg = `${parent} ${element} .blank`;

  $(element, svg).off();

  if (!$(`${parent} ${element} section`).length) {
    $(svg)
      .removeClass('hidden')
      .addClass('flex')
  }

  // Show the "addContent" form on svg click
  $(svg).click(function() {
    $(svg)
      .removeClass('flex')
      .addClass('hidden');

    $(`${parent} ${element} .addContent`)
      .css('display', '')
      .removeClass('hidden')
      .addClass('flex');

    $(`${parent} ${element} .addContent`).ready(() => {

      // Handle option selection
      handleOptionSelection(parent, element);
    });
  });
}

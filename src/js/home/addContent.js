// Design the content divs
const addContent = (parent, element) => {
  let svg = `${parent} ${element} .blank`;

  $(element, svg).off();

  if (!$(`${parent} ${element} section`).length) {
    $(svg).removeClass('invisible');
  }

  // Show the "addContent" form on svg click
  $(svg).click(() => {
    $(element).css('padding', '0');

    $(`${parent} ${element} .addContent`)
      .css('display', '')
      .addClass('flex');

    $(svg).hide();

    $(`${parent} ${element} .addContent`).ready(() => {

      // Handle option selection
      handleOptionSelection(parent, element);
    });
  });
}

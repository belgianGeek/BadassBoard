const showConverter = () => {
  let result;

  $('.header__converterBtn').on('click', function() {
    $('.upperContainer__converter')
      .fadeIn()
      .css('display', 'flex');
  });

  $('.converter__input, .converter__value1, .converter__value2').on('change', () => {
    let inputUnit = $('.converter__value1').val();
    let inputValue = Number($('.converter__input').val());
    let resultUnit = $('.converter__value2').val();

    const appendResult = (result) => {
      if (result !== undefined) {
        $('.converter__result').val(result);
      } else {
        $('.converter__result').val('');
        console.log(`Error converting unit... Result value : ${result}`);
      }
    }

    const convert = () => {
      if (!isNaN(inputValue)) {
        if (inputUnit === 'Byte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue / Math.pow(1024, 1);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue / Math.pow(1024, 2);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue / Math.pow(1024, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(1024, 4);
          } else if (resultUnit === 'Byte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Kilobyte') {
          if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue / Math.pow(10, 3);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue / Math.pow(10, 6);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(10, 9);
          } else if (resultUnit === 'Kilobyte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Megabyte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue * Math.pow(10, 3);
          } else if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue / Math.pow(10, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(10, 6);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Gigabyte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 9);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue * Math.pow(10, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue / Math.pow(10, 3);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue;
          }
        } else if (inputUnit === 'Terabyte') {
          if (resultUnit === 'Kilobyte') {
            result = inputValue * Math.pow(10, 9);
          } else if (resultUnit === 'Byte') {
            result = inputValue * Math.pow(10, 12);
          } else if (resultUnit === 'Megabyte') {
            result = inputValue * Math.pow(10, 6);
          } else if (resultUnit === 'Gigabyte') {
            result = inputValue * Math.pow(10, 3);
          } else if (resultUnit === 'Terabyte') {
            result = inputValue;
          }
        }

        $('.upperContainer__converter .warning').hide();

        if (inputValue !== '') {
          appendResult(result);
        }
      } else {
        printError({
          type: 'unit conversion',
          element: $('.upperContainer__converter'),
          msg: `Please enter a numeric value... 😑`
        });
      }
    }

    convert();
  });

  hideContent('.converter__remove');
}

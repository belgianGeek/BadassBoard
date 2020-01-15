const restoreScroll = () => {
  $('html, body').css({
    overflow: '',
    height: ''
  });
}

const disableScroll = () => {
  $('html, body').css({
    overflow: 'hidden',
    height: '100%'
  });
}

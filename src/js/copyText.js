const copyText = text2copy => {
  let text = document.querySelector(text2copy);
  text.select();
  text.setSelectionRange(0, 99999);
  document.execCommand('copy');
}

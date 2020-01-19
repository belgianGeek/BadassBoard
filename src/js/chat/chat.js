//Websocket connection
const socket = io();

$('.msg__container__sendBtn').click(() => {
  let msg = new Message();
  msg.send();
});

const getMousePosition = () => {
  $(window).mousemove((event) => {
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
  });
}

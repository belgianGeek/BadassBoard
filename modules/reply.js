module.exports = function(content, io, settings, replyID, msgTheme) {
  this.author = settings.bot.name;
  this.content = content;

  if (replyID !== undefined) {
    this.id = replyID;
  }

  this.dateTime = new Date();

  if (msgTheme !== undefined) {
    this.theme = msgTheme;
  }
  
  this.send = function() {
    return new Promise((fullfill, reject) => {
      io.emit('reply', this);
      replyID++;
      fullfill(this);
    });
  }
}

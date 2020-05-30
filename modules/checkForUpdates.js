const axios = require('axios');
const currentVersion = '0.3.0';

const checkForUpdates = () => {
  axios.get('https://api.github.com/repositories/204866456/releases')
    .then(res => {
      if (res.status === 200) {
        if (res.data[0].tag_name !== currentVersion) {
          io.emit('update available', res.data[0].zipball_url);
        } else {
          console.log('BadassBoard is already up to date !');
        }
      } else if (res.status === 404) {
        console.error('Couldn\'t check for updates, page not found...');
      } else if (res.status === 401) {
        console.error('Hey, you\'re not allowed to visit this page ! Updating failed...');
      } else if (res.status === 500) {
        console.error('Couldn\'t check for updates : the GitHub server returned a 500 error code :((');
      }
    })
    .catch(err => {
      console.error(err);
    });
}

module.exports = checkForUpdates;

const axios = require('axios');

async function getInvidiousInstanceHealth() {
  const temp = [];
  const res = await axios.get('https://api.invidious.io/instances.json?pretty=1&sort_by=type,users');
  for (var i = 0; i < res.data.length; i++) {
    if (res.data[i][1].monitor !== null) {
      if (res.data[i][1].monitor['30dRatio'].ratio > 98 && temp.length < 5) {
        // Remove the final / if any
        temp.push(res.data[i][1].uri.replace(/\/$/, ''));
      } else if ((i === res.data.length -1 || temp.length === 5) || (i === res.data.length -1 || temp.length < 5)) {
        if (temp[0] === undefined) {
          return 'Unable to retrieve Invidious instances health : instances health is unknown.';
        } else {
          return temp;
        }
      }
    }
  }
}

module.exports = getInvidiousInstanceHealth;

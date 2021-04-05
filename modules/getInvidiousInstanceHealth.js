const axios = require('axios');

async function getInvidiousInstanceHealth(callback) {
  const temp = [];
  const res = await axios.get('https://api.invidious.io/instances.json?pretty=1&sort_by=type,users');
  for (var i = 0; i < res.data.length; i++) {
    if (res.data[i][1].monitor !== null) {
      if (res.data[i][1].monitor['30dRatio'].ratio > 98 && temp.length < 3) {
        // Remove the final / if any
        temp.push(res.data[i][1].uri.replace(/\/$/, ''));
      }
    }
  }
  callback(temp);
  return;
}

module.exports = getInvidiousInstanceHealth;

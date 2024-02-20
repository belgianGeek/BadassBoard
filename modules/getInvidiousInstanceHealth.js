const axios = require('axios');

async function getInvidiousInstanceHealth() {
  let instancesList = [];
  const res = await axios.get('https://api.invidious.io/instances.json?pretty=1&sort_by=health');
  for (let i = 0; i < res.data.length; i++) {
    if (res.data[i][1].monitor !== null) {
      if (res.data[i][1].monitor['30dRatio'].ratio > 98) {
        // Remove the final / if any
        instancesList.push(res.data[i][1].uri.replace(/\/$/, ''));
      } else if (i === res.data.length -1) {
        if (instancesList[0] === undefined) {
          return 'Unable to retrieve Invidious instances health : instances health is unknown.';
        } else {
          return instancesList;
        }
      }
    } else {
      return `Monitoring data unavailable for instance ${res.data[i][0]}`;
    }
  }
}

module.exports = getInvidiousInstanceHealth;

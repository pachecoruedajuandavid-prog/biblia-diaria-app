const fs = require('fs');
const https = require('https');

const urls = [
  'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr.json',
  'https://raw.githubusercontent.com/seven1m/bibles/master/es-rvr1960.json'
];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  for (const url of urls) {
    console.log('Trying', url);
    try {
      const data = await download(url);
      const parsed = JSON.parse(data);
      if (parsed) {
        fs.writeFileSync('C:/robot/aplicacion de plan de lectuta/RVR60.json', data);
        console.log('Success! Saved RVR60.json (' + (data.length / 1024 / 1024).toFixed(2) + ' MB)');
        return;
      }
    } catch (e) {
      console.error('Failed', e.message);
    }
  }
  console.error('All failed.');
})();

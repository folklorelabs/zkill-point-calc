const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const ensureRecursiveSync = require('./utils/ensureRecursiveSync');

const BASE_DUMP_URL = 'https://www.fuzzwork.co.uk/dump/latest';

async function getCsv(url) {
  const res = await fetch(url);
  const data = await res.text();
  return new Promise((resolve) => {
    csv().fromString(data).then(resolve);
  });
}

async function getAndSaveCsv(csvName) {
  const data = await getCsv(`${BASE_DUMP_URL}/${csvName}.csv`);
  const dest = path.resolve(__dirname, `../temp/${csvName}.json`);
  ensureRecursiveSync(path.dirname(dest));
  await fs.writeFileSync(dest, JSON.stringify(data));
  return data;
}

(async () => {
  await Promise.all([
    getAndSaveCsv('invCategories'),
    getAndSaveCsv('invTypes'),
    getAndSaveCsv('invGroups'),
    getAndSaveCsv('dgmAttributeCategories'),
    getAndSaveCsv('dgmAttributeTypes'),
  ]);
})();
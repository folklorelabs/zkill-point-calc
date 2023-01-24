const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const ensureRecursiveSync = require('./ensureRecursiveSync');

const BASE_DUMP_URL = 'https://www.fuzzwork.co.uk/dump/latest';
const DEFAULT_DUMP_DIR = path.resolve(process.cwd(), './dump');

async function getCsv(url) {
  const res = await fetch(url);
  const data = await res.text();
  return new Promise((resolve) => {
    csv().fromString(data).then(resolve);
  });
}

async function getFuzzworkDataDump(dataName, destDir=DEFAULT_DUMP_DIR) {
  const data = await getCsv(`${BASE_DUMP_URL}/${dataName}.csv`);
  const dest = path.resolve(process.cwd(), `${destDir}/${dataName}.json`);
  ensureRecursiveSync(path.dirname(dest));
  await fs.writeFileSync(dest, JSON.stringify(data));
  return data;
}

module.exports = getFuzzworkDataDump;
const path = require('path');

const fetchAndCacheCsv = require('./fetchAndCacheCsv');

const FUZZWORK_BASE_URL = 'https://www.fuzzwork.co.uk/dump/latest';
const DEFAULT_DUMP_DIR = path.resolve(process.cwd(), './temp');

async function getData(dataName, cacheDir=DEFAULT_DUMP_DIR) {
    const cachePath = cacheDir && path.resolve(__dirname, `${cacheDir}/${dataName}.json`);
    return fetchAndCacheCsv(`${FUZZWORK_BASE_URL}/${dataName}.csv`, cachePath);
}

module.exports = {
    getData,
};
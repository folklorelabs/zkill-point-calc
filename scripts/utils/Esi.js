const path = require('path');

const fetchAndCacheJson = require('./fetchAndCacheJson');

const ESI_BASE_URL = 'https://esi.evetech.net/latest';
const DEFAULT_DUMP_DIR = path.resolve(process.cwd(), './temp');

async function getType(typeId, cacheDir=`${DEFAULT_DUMP_DIR}/types`) {
    const cachePath = cacheDir && path.resolve(process.cwd(), `${cacheDir}/${typeId}.json`);
    return fetchAndCacheJson(`${ESI_BASE_URL}/universe/types/${typeId}`, cachePath);
}

module.exports = {
    getType,
};
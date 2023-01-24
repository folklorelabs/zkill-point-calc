const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

const ensureRecursiveSync = require('./ensureRecursiveSync');

async function getCsv(url) {
    const res = await fetch(url);
    const data = await res.text();
    return new Promise((resolve) => {
        csv().fromString(data).then(resolve);
    });
}

async function fetchAndCacheCsv(url, cachePath) {
    const isCahced = cachePath && await fs.existsSync(cachePath);
    if (isCahced) {
        const res = await fs.readFileSync(cachePath);
        const data = JSON.parse(res);
        return data;
    }
    console.log(`Fetching "${url}"...`);
    const data = await getCsv(url);
    if (cachePath) {
        ensureRecursiveSync(path.dirname(cachePath));
        await fs.writeFileSync(cachePath, JSON.stringify(data));
    }
    return data;
}

module.exports = fetchAndCacheCsv;
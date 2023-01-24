const fs = require('fs');
const path = require('path');

const ensureRecursiveSync = require('./ensureRecursiveSync');

async function fetchAndCacheJson(url, cachePath) {
    const isCahced = cachePath && await fs.existsSync(cachePath);
    if (isCahced) {
        const res = await fs.readFileSync(cachePath);
        const data = JSON.parse(res);
        return data;
    }
    console.log(`Fetching "${url}"...`);
    const res = await fetch(url);
    const data = await res.json();
    if (cachePath) {
        ensureRecursiveSync(path.dirname(cachePath));
        await fs.writeFileSync(cachePath, JSON.stringify(data));
    }
    return data;
}

module.exports = fetchAndCacheJson;
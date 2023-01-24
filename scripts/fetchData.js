const path = require('path');

const getEveDataDump = require('./utils/getEveDataDump');

(async () => {
  const destDir = path.resolve(__dirname, './temp');
  await Promise.all([
    getEveDataDump('invCategories', destDir),
    getEveDataDump('invTypes', destDir),
    getEveDataDump('invGroups', destDir),
    getEveDataDump('dgmAttributeCategories', destDir),
    getEveDataDump('dgmAttributeTypes', destDir),
  ]);
})();
const path = require('path');

const getFuzzworkDataDump = require('./utils/getFuzzworkDataDump');

(async () => {
  const destDir = path.resolve(__dirname, './temp');
  await Promise.all([
    getFuzzworkDataDump('invCategories', destDir),
    getFuzzworkDataDump('invTypes', destDir),
    getFuzzworkDataDump('invGroups', destDir),
    getFuzzworkDataDump('dgmAttributeCategories', destDir),
    getFuzzworkDataDump('dgmAttributeTypes', destDir),
  ]);
})();
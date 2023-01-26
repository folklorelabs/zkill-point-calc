const Esi = require('./utils/Esi');
const Fuzzworks = require('./utils/Fuzzworks');
const promiseAllBatches = require('./utils/promiseAllBatches');

async function getAllTypesByCategory(categoryName) {
  // look up category for categoryType
  const categories = await Fuzzworks.getData('invCategories');
  const typeCategory = categories.find((c) => c.categoryName === categoryName);
  if (!typeCategory) throw new Error(`Cannot find categoryName "${categoryName}". Please ensure it is a valid EVE category.`);
  const typeCategoryId = typeCategory.categoryID;

  // find all groups with matching category
  const groups = await Fuzzworks.getData('invGroups');
  const categoryGroups = groups.filter((g) => g.categoryID === typeCategoryId);
  const categoryGroupIds = categoryGroups.map((g) => g.groupID);

  // get all types that match groups
  const allFuzzworkTypes = await Fuzzworks.getData('invTypes');
  const matchingFuzzworkTypes = allFuzzworkTypes
    .filter((t) => categoryGroupIds.includes(t.groupID));

  // get esi data for each matching type
  const data = await promiseAllBatches(async (fuzzworkType) => {
    const esiType = await Esi.getType(fuzzworkType.typeID);
    return {
      ...fuzzworkType,
      ...esiType,
      ...categoryGroups.find((g) => g.groupID === fuzzworkType.groupID),
      ...typeCategory,
    };
  }, matchingFuzzworkTypes, 10);
  return data;
}

module.exports = getAllTypesByCategory;

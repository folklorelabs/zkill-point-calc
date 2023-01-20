const fs = require('fs');
const path = require('path');

const DOGMA_ATTR_RIG = 1547;

async function getInvData(invType) {
    const res = await fs.readFileSync(path.resolve(__dirname, `../temp/${invType}.json`));
    const data = JSON.parse(res);
    return data;
}

async function getType(typeId) {
    const cachePath = path.resolve(__dirname, `../temp/types/${typeId}.json`);
    const isCahced = await fs.existsSync(cachePath);
    if (isCahced) {
        const res = await fs.readFileSync(cachePath);
        const data = JSON.parse(res);
        return data;
    }
    const res = await fetch(`https://esi.evetech.net/latest/universe/types/${typeId}`);
    const data = await res.json();
    await fs.writeFileSync(cachePath, JSON.stringify(data));
    return data;
}

(async () => {
    const categories = await getInvData('invCategories');
    const shipCategory = categories.find(c => c.categoryName === 'Ship');
    const shipCategoryId = shipCategory.categoryID;

    const groups = await getInvData('invGroups');
    const shipGroups = groups.filter(g => g.categoryID === shipCategoryId);
    const shipGroupIds = shipGroups.map(g => g.groupID);

    const types = await getInvData('invTypes');
    const ships = types.filter(t => shipGroupIds.includes(t.groupID));

    const formattedShips = ships.map((ship) => ({
        id: ship.typeID,
        name: ship.typeName,
        group: groups.find(g => g.groupID === ship.groupID).groupName,
    }));
    
    const promises = formattedShips.map(async (ship) => {
        const data = await getType(ship.id);
        const attrs = data.dogma_attributes;
        const rigSize = attrs && attrs.find((attr) => attr.attribute_id === DOGMA_ATTR_RIG);
        ship.rigSize = rigSize ? rigSize.value : 1;
    });
    await Promise.all(promises);
    
    const dest = path.resolve(__dirname, '../src/data/ships.json');
    await fs.writeFileSync(dest, JSON.stringify(formattedShips));
})();
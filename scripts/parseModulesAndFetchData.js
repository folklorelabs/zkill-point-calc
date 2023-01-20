const fs = require('fs');
const path = require('path');

const DOGMA_ATTR_META_LVL = 633
const DOGMA_ATTR_HEAT_DMG = 1211;


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
    // set up temp
    const tempDir = path.resolve(__dirname, '../temp');
    const tempDirExists = await fs.existsSync(tempDir);
    if (!tempDirExists) {
        await fs.mkdirSync(tempDir);
    }
    const tempTypeDir = path.resolve(__dirname, '../temp/types');
    const tempTypeDirExists = await fs.existsSync(tempTypeDir);
    if (!tempTypeDirExists) {
        await fs.mkdirSync(tempTypeDir);
    }
    

    // look up category for modules
    const categories = await getInvData('invCategories');
    const moduleCategory = categories.find(c => c.categoryName === 'Module');
    const moduleCategoryId = moduleCategory.categoryID;

    // find all module groups based on category
    const groups = await getInvData('invGroups');
    const moduleGroups = groups.filter(g => g.categoryID === moduleCategoryId);
    const moduleGroupIds = moduleGroups.map(g => g.groupID);

    // get all module types
    const types = await getInvData('invTypes');
    const modules = types.filter(t => moduleGroupIds.includes(t.groupID));
    const formattedModules = modules.map((module) => ({
        id: module.typeID,
        name: module.typeName,
        groupId: module.groupID,
        group: groups.find(g => g.groupID === module.groupID).groupName,
    }));
    
    // get all modules (meta level and heat damage)
    const processModuleBatch = async (modules) => {
        const promises = modules.map(async (module) => {
            const data = await getType(module.id);
            const attrs = data.dogma_attributes;
            const metaLevelAttr = attrs && attrs.find((attr) => attr.attribute_id === DOGMA_ATTR_META_LVL);
            const heatDamageAttr = attrs && attrs.find((attr) => attr.attribute_id === DOGMA_ATTR_HEAT_DMG);
            const metaLevel = metaLevelAttr && metaLevelAttr.value;
            const heatDamage = heatDamageAttr && heatDamageAttr.value;
            module.metaLevel = parseInt(metaLevel, 10);
            let dangerMulti = 0;
            if (parseFloat(heatDamage, 10) > 0) {
                module.hasHeat = true;
                dangerMulti += 1;
            }
            if (module.groupID === 645) {
                module.isDroneMod = true;
                dangerMulti += 1;
            }
            if (module.groupID === 54) {
                module.isMiningMod = true;
                if (module.isMiningMod) dangerMulti -= 1;
            }
            const meta = 1 + Math.floor(module.metaLevel / 2);
            module.dangerFactor = meta * dangerMulti;
        });
        return await Promise.all(promises);
    };
    const numPerBatch = 10;
    let moduleIndex = 0;
    while(moduleIndex < formattedModules.length) {
        const nextBatch = formattedModules.slice(moduleIndex, moduleIndex + numPerBatch);
        await processModuleBatch(nextBatch);
        moduleIndex += numPerBatch;
        // TODO: add wait function if timeouts are an issue
    }
    
    // save file
    const dest = path.resolve(__dirname, '../src/data/modules.json');
    await fs.writeFileSync(dest, JSON.stringify(formattedModules));
})();
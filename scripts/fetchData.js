const fs = require('fs');
const path = require('path');

const Fuzzworks = require('./utils/Fuzzworks');
const getAllTypesByCategory = require('./getAllTypesByCategory');

async function getShips() {
    const ships = await getAllTypesByCategory('Ship');
    const structures = await getAllTypesByCategory('Structure');
    // const entities = await getAllTypesByCategory('Entity');
    const allShips = [
        ...ships,
        ...structures,
        // ...entities,
    ];

    // look up attr ids
    const attrTypes = await Fuzzworks.getData('dgmAttributeTypes');
    const attrRigId = parseInt(attrTypes.find((a) => a.attributeName === 'Rig Size').attributeID, 10);

    // format obj to output
    const formattedShips = allShips.map((ship) => {
        const attrs = ship.dogma_attributes;
        const rigSize = attrs && attrs.find((attr) => attr.attribute_id === attrRigId);
        return {
            id: ship.typeID,
            name: ship.typeName,
            group: ship.groupName,
            category: ship.categoryName,
            rigSize: rigSize ? rigSize.value : 1,
        };
    });

    // add static ships
    formattedShips.push({
        id: '30193',
        name: 'Rat',
        group: 'Rat',
        category: 'Entity',
        rigSize: 1,
    });

    return formattedShips;
}

async function getModules() {
    const modules = await getAllTypesByCategory('Module');

    // look up attr ids
    const attrTypes = await Fuzzworks.getData('dgmAttributeTypes');
    const attrMetaLevelId = parseInt(attrTypes.find((a) => a.attributeName === 'Meta Level').attributeID, 10);
    const attrHeadDmgId = parseInt(attrTypes.find((a) => a.attributeName === 'Heat Damage').attributeID, 10);

    // format obj to output
    const formattedModules = modules.map((module) => {
        const attrs = module.dogma_attributes;
        const metaLevelAttr = attrs && attrs.find((attr) => attr.attribute_id === attrMetaLevelId);
        const heatDamageAttr = attrs && attrs.find((attr) => attr.attribute_id === attrHeadDmgId);
        const metaLevel = (metaLevelAttr && metaLevelAttr.value) || 0;
        const hasHeat = heatDamageAttr && parseFloat(heatDamageAttr.value, 10) > 0;
        const isDroneMod = module.groupName === 'Drone Damage Modules';
        const isMiningMod = module.groupName === 'Mining Laser';

        // calc danger factor
        let dangerMulti = 0;
        if (hasHeat) dangerMulti += 1;
        if (isDroneMod) dangerMulti += 1;
        if (isMiningMod) dangerMulti -= 1;
        const dangerFactor = (1 + Math.floor(metaLevel / 2)) * dangerMulti;

        const data = {
            id: module.typeID,
            name: module.typeName,
            metaLevel,
            dangerFactor,
            hasHeat,
            isDroneMod,
            isMiningMod,
        };

        // clean up data by removing unnecessary false values
        Object.keys(data).forEach((key) => typeof data[key] === 'boolean' && !data[key] && delete data[key]);

        return data;
    });

    return formattedModules;
}


(async () => {
    const ships = await getShips();
    const shipsDest = path.resolve(__dirname, '../src/data/ships.json');
    await fs.writeFileSync(shipsDest, JSON.stringify(ships));

    const modules = await getModules();
    const modulesDest = path.resolve(__dirname, '../src/data/modules.json');
    await fs.writeFileSync(modulesDest, JSON.stringify(modules));
})();
export default function getKillmailSimUrl(state, excludeSnugglyMods) {
  const {
    shipInfo,
    modules,
    attackers,
    zkillId,
  } = state;
  const urlObj = new URL(window.location);
  urlObj.searchParams.delete('shipInfo');
  urlObj.searchParams.delete('victimModules');
  urlObj.searchParams.delete('attackers');

  if (!shipInfo) {
    urlObj.searchParams.delete('k');
    return urlObj;
  }

  const killmail = [];

  // add ship id to killmail array
  killmail.push(shipInfo.id || '');

  // add ship modules to killmail array
  const shipModulesObj = modules
    .filter((m) => !(excludeSnugglyMods && m.dangerFactor < 1))
    .map((m) => m.id)
    .reduce((all, mId) => ({
      ...all,
      [mId]: all[mId] ? all[mId] + 1 : 1,
    }), {});
  const shipModules = Object.keys(shipModulesObj).map((mId) => {
    const qty = shipModulesObj[mId];
    return `${mId}${qty > 1 ? `_${qty}` : ''}`;
  }).join('.');
  killmail.push(shipModules || '');

  // add attackers to killmail array
  const attackerShipsObj = attackers && attackers.map((s) => s.id)
    .reduce((all, sId) => ({
      ...all,
      [sId]: all[sId] ? all[sId] + 1 : 1,
    }), {});
  const attackerShips = Object.keys(attackerShipsObj).map((sId) => {
    const qty = attackerShipsObj[sId];
    return `${sId}${qty > 1 ? `_${qty}` : ''}`;
  }).join('.');
  killmail.push(attackerShips || '');

  // add zkillId to killmail array
  if (zkillId) {
    killmail.push(zkillId);
  }

  urlObj.searchParams.set('k', killmail.join('-'));

  return urlObj;
}

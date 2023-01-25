import {
    useMemo,
} from 'react';

import {
  useZkillPointsContext,
} from '../contexts/ZkillPoints';

function useSimUrl() {
  const { zkillPointsState } = useZkillPointsContext();
  const url = useMemo(() => {
    const { shipInfo, attackers } = zkillPointsState;
    if (!shipInfo) return '';
    const killmail = [];

    // add ship id to killmail array
    killmail.push(shipInfo.id);

    // add ship modules to killmail array
    const shipModulesObj = shipInfo.modules && shipInfo.modules
      .filter((m) => m.dangerFactor !== 0)
      .map((m) => m.id)
      .reduce((all, mId) => {
        all[mId] = all[mId] ? all[mId] + 1 : 1;
        return all;
      }, {});
    const shipModules = Object.keys(shipModulesObj).map((mId) => {
      const qty = shipModulesObj[mId];
      return `${mId}${qty > 1 ? `_${qty}` : ''}`;
    }).join('.');
    killmail.push(shipModules);

    // add attackers to killmail array
    const attackerShipsObj = attackers && attackers.map((s) => s.id)
      .reduce((all, sId) => {
        all[sId] = all[sId] ? all[sId] + 1 : 1;
        return all;
      }, {});
    const attackerShips = Object.keys(attackerShipsObj).map((sId) => {
      const qty = attackerShipsObj[sId];
      return `${sId}${qty > 1 ? `_${qty}` : ''}`;
    }).join('.');
    killmail.push(attackerShips);

    // add zkillId to killmail array
    if (zkillPointsState.zkillId) {
      killmail.push(zkillPointsState.zkillId);
    }

    const url = new URL(window.location);
    url.searchParams.set('k', killmail.join('-'));
    window.history.replaceState({}, '', url);
    return `${url}`;
  }, [zkillPointsState]);

  return url;
}
  
export default useSimUrl;
  
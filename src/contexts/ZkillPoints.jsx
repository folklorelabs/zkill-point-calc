import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useEffect,
} from 'react';
import { childrenProps, childrenDefaults } from '../propTypes/children';
import SHIPS from '../data/ships.json';
import MODULES from '../data/modules.json';

import getKillmailSimUrl from '../utils/getKillmailSimUrl';
import uuid from '../utils/uuid';

export function parseUrlLegacy() {
  const url = new URL(window.location);
  const params = url.searchParams;
  const shipInfo = SHIPS.find((s) => s.name === params.get('shipInfo'));
  if (!shipInfo) return {};
  const victimModulesQuery = params.get('victimModules') || '';
  const victimModules = victimModulesQuery.split(',')
    .map((moduleName) => MODULES.find((m) => m.name === moduleName))
    .filter((module) => !!module)
    .map((module) => ({
      ...module,
      uuid: uuid(),
    }));
  const attackersQuery = params.get('attackers') || '';
  const attackers = attackersQuery.split(',')
    .map((shipName) => SHIPS.find((s) => s.name === shipName))
    .filter((matchingShip) => !!matchingShip);
  return {
    shipInfo,
    modules: victimModules,
    attackers,
  };
}

export function parseUrl() {
  const legacyData = parseUrlLegacy();
  const url = new URL(window.location);
  const params = url.searchParams;

  const [shipStr, modulesStr = '', attackersStr = '', zkillId = ''] = (params.get('k') || '').split('-');
  if (!shipStr && !legacyData.shipInfo) return {};
  const shipInfo = legacyData.shipInfo || SHIPS.find((s) => s.id === shipStr);
  if (!shipInfo && !legacyData.shipInfo) return {};
  const modulesQuery = modulesStr || '';
  const modules = legacyData.modules || modulesQuery.split('.')
    .filter((m) => !!m)
    .reduce((all, m) => {
      const [moduleId, qtyStr] = m.split('_');
      const qty = parseInt(qtyStr || 1, 10);
      const module = MODULES.find((md) => md.id === moduleId);
      if (!module) return all;
      return [
        ...all,
        ...Array.from(Array(qty || 1)).map(() => ({
          ...module,
          uuid: uuid(),
        })),
      ];
    }, []);

  const attackers = legacyData.attackers || attackersStr.split('.')
    .filter((s) => !!s)
    .reduce((all, s) => {
      const [shipId, qtyStr] = s.split('_');
      const qty = parseInt(qtyStr || 1, 10);
      const matchingShip = SHIPS.find((sd) => sd.id === shipId);
      if (!shipInfo) return all;
      return [
        ...all,
        ...Array.from(Array(qty || 1)).map(() => ({
          ...matchingShip,
        })),
      ];
    }, []);

  const data = {
    shipInfo,
    modules,
    attackers,
    zkillId,
  };
  return data;
}

// STATE
const INITIAL_STATE = {
  shipInfo: null,
  modules: [],
  attackers: [],
  zkillId: null,
  url: window.location.href,
};

// ACTIONS
export const ACTIONS = {
  RESET: 'RESET',
  LOAD: 'LOAD',
};
export function resetZkill() {
  return [ACTIONS.RESET];
}
export function loadZkill({
  shipInfo,
  modules,
  attackers,
  zkillId,
}) {
  const payload = {
    shipInfo: {
      ...shipInfo,
    },
    modules: modules ? modules.map((m) => ({
      ...m,
      uuid: m.uuid || uuid(),
    })) : INITIAL_STATE.modules,
    attackers: attackers ? attackers.map((a) => ({
      ...a,
      uuid: a.uuid || uuid(),
    })) : INITIAL_STATE.attackers,
    zkillId,
  };
  const url = `${getKillmailSimUrl(payload)}`;
  return [ACTIONS.LOAD, {
    ...payload,
    url,
  }];
}

// REDUCER
function REDUCER(state, [type, payload]) {
  switch (type) {
    case ACTIONS.RESET:
      return {
        ...state,
        ...INITIAL_STATE,
        url: window.location.origin,
      };
    case ACTIONS.LOAD:
      return {
        ...state,
        shipInfo: payload.shipInfo,
        modules: payload.modules,
        attackers: payload.attackers,
        zkillId: payload.zkillId,
        url: payload.url,
      };
    default:
      return { ...state };
  }
}

// GETTERS
export function getBasePoints(state) {
  if (!state.shipInfo) return 0;
  const basePoints = 5 ** state.shipInfo.rigSize;
  return basePoints;
}
export function getDangerFactor(state) {
  /*
    $typeID = $item['item_type_id'];
    $qty = @$item['quantity_destroyed'] + @$item['quantity_dropped'];
    $metaLevel = Info::getDogma($typeID, 633);
    $meta = 1 + floor($metaLevel / 2);
    $heatDamage = Info::getDogma($typeID, 1211);
    // offensive/defensive modules overloading are good for pvp
    $dangerFactor += ((bool) $heatDamage) * $qty * $meta;
    // drone damange multipliers
    $dangerFactor += ($itemInfo['groupID'] == 645) * $qty * $meta;
    // Mining ships don't earn as many points
    $dangerFactor -= ($itemInfo['groupID'] == 54) * $qty * $meta;
  */
  if (!state.shipInfo || !state.modules || !state.modules.length) return 0;
  const victimDangerFactor = state.modules
    .reduce((totalDanger, module) => totalDanger + module.dangerFactor, 0);
  return victimDangerFactor;
}
export function getBlobPenalty(state) {
  /*
    $numAttackers = sizeof($killmail['attackers']);
    $involvedPenalty = max(1, $numAttackers * max(1, $numAttackers / 2));
  */
  const numAttackers = state.attackers.length;
  const involvedPenalty = Math.max(1, numAttackers * Math.max(1, numAttackers / 2));
  return involvedPenalty;
}
export function getShipSizeMultiplier(state) {
  /*
    $size = 0;
    $hasChar = false;
    foreach ((array) $killmail['attackers'] as $attacker) {
        // $hasChar |= @$attacker['character_id'] > 0;
        $shipTypeID = @$attacker['ship_type_id'];
        // $categoryID = Info::getInfoField("typeID", $shipTypeID, "categoryID");
        // if ($categoryID == 65) return 1; // Structure on your mail, only 1 point

        $aInfo = Info::getInfo('typeID', $shipTypeID);
        $aInfo['rigSize'] = self::getRigSize($shipTypeID);
        $size += pow(5, ((@$aInfo['groupID'] != 29)
          ? @$aInfo['rigSize'] : @$shipInfo['rigSize'] + 1));
    }
    if ($hasChar == false) return 1;
    $avg = max(1, $size / $numAttackers);
    $modifier = min(1.2, max(0.5, $basePoints / $avg));
  */
  const basePoints = getBasePoints(state);
  const { shipInfo } = state;
  const numAttackers = state.attackers.length;
  if (!shipInfo || !numAttackers) return 1;
  const size = state.attackers.reduce((aSize, aInfo) => aSize + 5 ** (aInfo.group !== 'Capsule' ? aInfo.rigSize : shipInfo.rigSize + 1), 0);
  const avg = Math.max(1, size / numAttackers);
  const modifier = Math.min(1.2, Math.max(0.5, basePoints / avg));
  return modifier;
}

export function getTotalPoints(state) {
  if (!state.shipInfo) return 0;
  if (state.shipInfo.group === 'Capsule') return 1;
  if (state.attackers.find((a) => a.category === 'Structure')) return 1;
  if (state.attackers.length && !state.attackers.reduce((all, a) => all || a.name !== 'Rat', false)) return 1;

  const basePoints = getBasePoints(state);
  let points = basePoints;

  const dangerFactor = getDangerFactor(state);
  points += dangerFactor;
  points *= Math.max(0.01, Math.min(1, dangerFactor / 4));

  const blobPenaltyModifier = 1 / getBlobPenalty(state);
  points *= blobPenaltyModifier;

  const shipSizeMultiplier = getShipSizeMultiplier(state);
  points = Math.floor(points * shipSizeMultiplier);

  return Math.max(1, points);
}

const ZkillPointsContext = createContext({
  zkillPointsState: INITIAL_STATE,
  zkillPointsDispatch: () => {},
});

export function ZkillPointsProvider({
  children,
}) {
  const [zkillPointsState, zkillPointsDispatch] = useReducer(REDUCER, INITIAL_STATE);

  useEffect(() => {
    const loadStateFromUrl = () => {
      const {
        shipInfo,
        modules,
        attackers,
        zkillId,
      } = parseUrl();
      if (!shipInfo) return;
      zkillPointsDispatch(loadZkill({
        shipInfo,
        modules,
        attackers,
        zkillId,
      }));
    };
    window.addEventListener('popstate', loadStateFromUrl);
    loadStateFromUrl();
    return () => {
      window.removeEventListener('popstate', loadStateFromUrl);
    };
  }, []);

  useEffect(() => {
    if (zkillPointsState.url !== window.location.href) {
      window.history.pushState({}, '', `${zkillPointsState.url}`);
    }
  }, [zkillPointsState.url]);

  // wrap value in memo so we only re-render when necessary
  const providerValue = useMemo(() => ({
    zkillPointsState,
    zkillPointsDispatch,
  }), [zkillPointsState, zkillPointsDispatch]);

  return (
    <ZkillPointsContext.Provider value={providerValue}>
      {children}
    </ZkillPointsContext.Provider>
  );
}
ZkillPointsProvider.defaultProps = {
  children: childrenDefaults,
};

ZkillPointsProvider.propTypes = {
  children: childrenProps,
};

export function useZkillPointsContext() {
  return useContext(ZkillPointsContext);
}

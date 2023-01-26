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

import uuid from '../utils/uuid';
import parseEft from '../utils/parseEft';

export function parseUrlLegacy() {
  const url = new URL(window.location);
  const params = url.searchParams;
  const ship = SHIPS.find((s) => s.name === params.get('shipInfo'));
  if (!ship) return {};
  const victimModulesQuery = params.get('victimModules') || '';
  const victimModules = victimModulesQuery.split(',')
    .map((moduleName) => MODULES.find((m) => m.name === moduleName))
    .filter((module) => !!module)
    .map((module) => ({
      ...module,
      uuid: uuid(),
    }));
  const shipInfo = victimModules.length && {
    ...ship,
    modules: victimModules,
  };
  const attackersQuery = params.get('attackers') || '';
  const attackers = attackersQuery.split(',')
    .map((shipName) => SHIPS.find((s) => s.name === shipName))
    .filter((matchingShip) => !!matchingShip);
  return {
    shipInfo,
    attackers,
  };
}

export function parseUrl() {
  const url = new URL(window.location);
  const params = url.searchParams;
  const [shipStr, modulesStr = '', attackersStr = '', zkillId = ''] = (params.get('k') || '').split('-');
  if (!shipStr) return {};
  const ship = SHIPS.find((s) => s.id === shipStr);
  if (!ship) return {};
  const victimModulesQuery = modulesStr || '';
  const victimModules = victimModulesQuery.split('.')
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
  const shipInfo = {
    ...ship,
    modules: victimModules,
  };
  const attackers = attackersStr.split('.')
    .reduce((all, s) => {
      const [shipId, qtyStr] = s.split('_');
      const qty = parseInt(qtyStr || 1, 10);
      const matchingShip = SHIPS.find((sd) => sd.id === shipId);
      if (!ship) return all;
      return [
        ...all,
        ...Array.from(Array(qty || 1)).map(() => ({
          ...matchingShip,
        })),
      ];
    }, []);
  return {
    shipInfo,
    attackers,
    zkillId,
  };
}

// STATE
const INITIAL_STATE = {
  shipInfo: null,
  attackers: [],
  zkillId: null,
};

// ACTIONS
export const ACTIONS = {
  RESET: 'RESET',
  LOAD_VICTIM: 'LOAD_VICTIM',
  LOAD_INVOLVED: 'LOAD_INVOLVED',
  SET_ZKILL_ID: 'SET_ZKILL_ID',
};
export function reset() {
  return [ACTIONS.RESET];
}
export function loadVictim(victim) {
  const shipInfo = typeof victim === 'string' ? parseEft(victim) : victim;
  return [ACTIONS.LOAD_VICTIM, shipInfo];
}
export function loadAttackers(ships) {
  const attackers = ships.map((ship) => ({
    ...ship,
    uuid: uuid(),
  }));
  return [ACTIONS.LOAD_INVOLVED, attackers];
}
export function setZkillId(zkillId) {
  return [ACTIONS.SET_ZKILL_ID, zkillId];
}

// REDUCER
function REDUCER(state, [type, payload]) {
  switch (type) {
    case ACTIONS.RESET:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    case ACTIONS.LOAD_VICTIM:
      return {
        ...state,
        shipInfo: payload,
      };
    case ACTIONS.ADD_INVOLVED:
      return {
        ...state,
        attackers: [
          ...state.attackers,
          {
            ...payload,
            uuid: uuid(),
          },
        ],
      };
    case ACTIONS.LOAD_INVOLVED:
      return {
        ...state,
        attackers: payload,
      };
    case ACTIONS.REMOVE_INVOLVED:
      return {
        ...state,
        attackers: [
          ...state.attackers.filter((ship) => ship.uuid !== payload),
        ],
      };
    case ACTIONS.SET_ZKILL_ID:
      return {
        ...state,
        zkillId: payload,
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
  if (!state.shipInfo) return 0;
  const victimDangerFactor = state.shipInfo.modules
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

  // wrap value in memo so we only re-render when necessary
  const providerValue = useMemo(() => ({
    zkillPointsState,
    zkillPointsDispatch,
  }), [zkillPointsState, zkillPointsDispatch]);

  useEffect(() => {
    const legacyData = parseUrlLegacy();
    const data = parseUrl();
    const shipInfo = data.shipInfo || legacyData.shipInfo;
    const attackers = data.attackers || legacyData.attackers;
    const { zkillId } = data;
    if (shipInfo && shipInfo.id && shipInfo.name) {
      zkillPointsDispatch(loadVictim(shipInfo));
    }
    if (attackers && attackers.length) {
      zkillPointsDispatch(loadAttackers(attackers));
    }
    if (zkillId) {
      zkillPointsDispatch(setZkillId(zkillId));
    }
  }, []);

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

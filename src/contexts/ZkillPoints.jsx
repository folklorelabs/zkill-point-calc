import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import SHIPS from '../data/ships.json';
import MODULES from '../data/modules.json';

// UTILS
export function uuid() {
  return Math.random().toString(16).slice(2);
}
export function parseEft(eft) {
  const shipNameRegExp = /^\[([\w ]+)/;
  const shipNameMatch = shipNameRegExp.exec(eft);
  const shipName = shipNameMatch.length > 1 ? shipNameMatch[1] : null;
  if (!shipName) throw new Error('Invalid EFT. Cannot parse ship name.');
  const ship = SHIPS.find((s) => s.name === shipName);
  if (!ship) throw new Error(`Invalid EFT. Unknown ship ${shipName}.`);
  const eftLines = eft.split('\n');
  const eftLinesClean = eftLines
    .slice(1, eftLines.length - 1)
    .filter((line) => !!line)
    .map(line => line.split(',')[0]);
  const modules = eftLinesClean
    .map((line) => {
      const module = MODULES.find(module => module.name === line);
      return module ? {
        ...module,
        uuid: uuid(),
      } : null;
    })
    .filter((module) => !!module);
  return {
    ...ship,
    modules,
  };
}

// STATE
const INITIAL_STATE = {
  shipInfo: null,
  attackers: [],
};

// ACTIONS
export const ACTIONS = {
  RESET: 'RESET',
  LOAD_VICTIM: 'LOAD_VICTIM',
  LOAD_INVOLVED: 'LOAD_INVOLVED',
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
    default:
      return { ...state };
  }
}

// GETTERS
export function getBasePoints(state) {
  if (!state.shipInfo) return 0;
  const basePoints = Math.pow(5, state.shipInfo.rigSize);
  return basePoints;
}
export function getDangerFactor(state) {
  /*
    $typeID = $item['item_type_id'];
    $qty = @$item['quantity_destroyed'] + @$item['quantity_dropped'];
    $metaLevel = Info::getDogma($typeID, 633);
    $meta = 1 + floor($metaLevel / 2);
    $heatDamage = Info::getDogma($typeID, 1211);
    $dangerFactor += ((bool) $heatDamage) * $qty * $meta; // offensive/defensive modules overloading are good for pvp
    $dangerFactor += ($itemInfo['groupID'] == 645) * $qty * $meta; // drone damange multipliers
    $dangerFactor -= ($itemInfo['groupID'] == 54) * $qty * $meta; // Mining ships don't earn as many points
  */
  if (!state.shipInfo) return 0;
  const victimDangerFactor = state.shipInfo.modules.reduce((totalDanger, module) => {
    return totalDanger + module.dangerFactor;
  }, 0);
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
        $size += pow(5, ((@$aInfo['groupID'] != 29) ? @$aInfo['rigSize'] : @$shipInfo['rigSize'] + 1));
    }
    if ($hasChar == false) return 1;
    $avg = max(1, $size / $numAttackers);
    $modifier = min(1.2, max(0.5, $basePoints / $avg));
  */
  const basePoints = getBasePoints(state);
  const shipInfo = state.shipInfo;
  const numAttackers = state.attackers.length;
  if (!shipInfo || !numAttackers) return 1;
  const size = state.attackers.reduce((size, aInfo) => {
    return size + Math.pow(5, aInfo.group !== 'Capsule' ? aInfo.rigSize : shipInfo.rigSize + 1);
  }, 0);
  const avg = Math.max(1, size / numAttackers);
  const modifier = Math.min(1.2, Math.max(0.5, basePoints / avg));
  return modifier;
}

export function getTotalPoints(state) {
  if (state.shipInfo && state.shipInfo.group === 'Capsule') return 1;
  if (state.attackers.find((a) => a.group === 'Structure')) return 1;
  if (state.attackers.length && !state.attackers.reduce((all, a) => all || a.name !== 'Rat', false)) return 1;

  const basePoints = getBasePoints(state);
  let points = basePoints;

  const dangerFactor = getDangerFactor(state);
  points += dangerFactor;
  points *= Math.max(0.01, Math.min(1, dangerFactor / 4));

  const blobPenaltyModifier = 1 / getBlobPenalty(state);
  points = points * blobPenaltyModifier;

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
    const url = new URL(window.location);
    const params = url.searchParams;
    const shipInfo = SHIPS.find((s) => s.name === params.get('shipInfo'));
    const victimModulesQuery = params.get('victimModules') || '';
    const victimModules = victimModulesQuery.split(',')
      .map((moduleName) => MODULES.find((m) => m.name === moduleName))
      .filter((module) => !!module)
      .map((module) => ({
        ...module,
        uuid: uuid(),
      }));
    if (victimModules.length) {
      zkillPointsDispatch(loadVictim({
        ...shipInfo,
        modules: victimModules,
      }));
    }
    const attackersQuery = params.get('attackers') || '';
    const attackers = attackersQuery.split(',')
      .map((shipName) => SHIPS.find((s) => s.name === shipName))
      .filter((ship) => !!ship);
    if (attackers.length) {
      zkillPointsDispatch(loadAttackers(attackers));
    }
  }, []);

  return (
    <ZkillPointsContext.Provider value={providerValue}>
      {children}
    </ZkillPointsContext.Provider>
  );
}
ZkillPointsProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export function useZkillPointsContext() {
  return useContext(ZkillPointsContext);
}

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
  victimShip: null,
  involvedShips: [],
};

// ACTIONS
export const ACTIONS = {
  RESET: 'RESET',
  LOAD_VICTIM: 'LOAD_VICTIM',
  ADD_INVOLVED: 'ADD_INVOLVED',
  REMOVE_INVOLVED: 'REMOVE_INVOLVED',
};
export function reset() {
  return [ACTIONS.RESET];
}
export function loadVictim(victim) {
  const victimShip = typeof victim === 'string' ? parseEft(victim) : victim;
  return [ACTIONS.LOAD_VICTIM, victimShip];
}
export function loadInvolved(shipName) {
  const involvedShip = SHIPS.find((s) => `${s.name}` === shipName) || {
    name: shipName,
  };
  return [ACTIONS.ADD_INVOLVED, involvedShip];
}

export function unloadInvolved(uuid) {
  return [ACTIONS.REMOVE_INVOLVED, uuid];
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
        victimShip: payload,
      };
    case ACTIONS.ADD_INVOLVED:
      return {
        ...state,
        involvedShips: [
          ...state.involvedShips,
          {
            ...payload,
            uuid: uuid(),
          },
        ],
      };
    case ACTIONS.REMOVE_INVOLVED:
      return {
        ...state,
        involvedShips: [
          ...state.involvedShips.filter((ship) => ship.uuid !== payload),
        ],
      };
    default:
      return { ...state };
  }
}

// GETTERS
export function getVictimBasePoints(state) {
  if (!state.victimShip) return 0;
  const victimBasePoints = Math.pow(5, state.victimShip.rigSize);
  return victimBasePoints;
}
export function getVictimDangerFactor(state) {
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
  if (!state.victimShip) return 0;
  const victimDangerFactor = state.victimShip.modules.reduce((totalDanger, module) => {
    return totalDanger + module.dangerFactor;
  }, 0);
  return victimDangerFactor;
}
export function getInvolvedQtyPenalty(state) {
  /*
    $numAttackers = sizeof($killmail['attackers']);
    $involvedPenalty = max(1, $numAttackers * max(1, $numAttackers / 2));
  */
  const numInvolved = state.involvedShips.length;
  const involvedQtyPenalty = Math.max(1, numInvolved * Math.max(1, numInvolved / 2));
  return involvedQtyPenalty;
}
export function getInvolvedSizeMultiplier(state) {
  /*
    $size = 0;
    $hasChar = false;
    foreach ((array) $killmail['attackers'] as $attacker) {
        $hasChar |= @$attacker['character_id'] > 0;
        $victimShipTypeID = @$attacker['ship_type_id'];
        $categoryID = Info::getInfoField("typeID", $victimShipTypeID, "categoryID");
        if ($categoryID == 65) return 1; // Structure on your mail, only 1 point

        $aInfo = Info::getInfo('typeID', $victimShipTypeID);
        $aInfo['rigSize'] = self::getRigSize($victimShipTypeID);
        $size += pow(5, ((@$aInfo['groupID'] != 29) ? @$aInfo['rigSize'] : @$victimShipInfo['rigSize'] + 1));
    }
    if ($hasChar == false) return 1;
    $avg = max(1, $size / $numAttackers);
    $modifier = min(1.2, max(0.5, $basePoints / $avg));
  */
  const victimBasePoints = getVictimBasePoints(state);
  const numInvolved = state.involvedShips.length;
  if (!victimBasePoints || !numInvolved) return 1;
  const involvedSizeTotal = state.involvedShips.reduce((total, ship) => {
    const shipVal = !ship.rigSize
      ? victimBasePoints + 1
      : ship.rigSize;
    return total + Math.pow(5, shipVal);
  }, 0);
  const involvedAvgSize = Math.max(1, involvedSizeTotal / numInvolved);
  const involvedSizeMultiplier = Math.min(1.2, Math.max(0.5, victimBasePoints / involvedAvgSize));
  return involvedSizeMultiplier;
}

export function getTotalPoints(state) {
  const victimBasePoints = getVictimBasePoints(state);
  let points = victimBasePoints;

  const victimDangerFactor = getVictimDangerFactor(state);
  points += victimDangerFactor;
  points *= Math.max(0.01, Math.min(1, victimDangerFactor / 4));

  const involvedQtyPenalty = getInvolvedQtyPenalty(state);
  points = points / involvedQtyPenalty;

  const involvedSizeMultiplier = getInvolvedSizeMultiplier(state);
  points = Math.floor(points * involvedSizeMultiplier);

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
    const victimShip = SHIPS.find((s) => s.name === params.get('victimShip'));
    const victimModulesQuery = params.get('victimModules');
    const victimModules = victimModulesQuery && victimModulesQuery.split(',')
      .map((moduleName) => MODULES.find((m) => m.name === moduleName))
      .filter((module) => !!module)
      .map((module) => ({
        ...module,
        uuid: uuid(),
      }));
    if (victimModules && victimModules.length) {
      zkillPointsDispatch(loadVictim({
        ...victimShip,
        modules: victimModules,
      }));
    }
    const involvedShipsQuery = params.get('involvedShips');
    if (involvedShipsQuery) {
      involvedShipsQuery.split(',').forEach((shipName) => {
        zkillPointsDispatch(loadInvolved(shipName));
      });
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

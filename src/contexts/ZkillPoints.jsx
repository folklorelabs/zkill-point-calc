import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import SHIPS from '../data/ships.json';
import MODULES from '../data/modules.json';

// STATE
const INITIAL_STATE = {
  ships: SHIPS,
  victimShip: null,
  victimModules: [],
  victimBasePoints: 0,
  victimDangerFactor: 0,
  victimTotalPoints: 0,
  involvedQtyPenalty: 1,
  involvedSizeMultiplier: 0,
  involvedShips: [],
};

// ACTIONS
export const ACTIONS = {
  INITIALIZE: 'INITIALIZE',
  LOAD_VICTIM: 'LOAD_VICTIM',
  ADD_INVOLVED: 'ADD_INVOLVED',
  REMOVE_INVOLVED: 'REMOVE_INVOLVED',
};
export function reset() {
  return [ACTIONS.INITIALIZE];
}
export async function loadVictim(victimEft) {
  const shipNameRegExp = /^\[([\w ]+)/;
  const shipNameMatch = shipNameRegExp.exec(victimEft);
  const shipName = shipNameMatch.length > 1 ? shipNameMatch[1] : null;
  if (!shipName) throw new Error('Invalid EFT. Cannot parse ship name.');
  const victimShip = SHIPS.find((s) => s.name === shipName);
  if (!victimShip) throw new Error(`Invalid EFT. Unknown ship ${shipName}.`);
  const eftLines = victimEft.split('\n');
  const eftLinesClean = eftLines
    .slice(1, eftLines.length - 1)
    .filter((line) => !!line)
    .map(line => line.split(',')[0]);
  victimShip.modules = eftLinesClean
    .map((line) => {
      const module = MODULES.find(module => module.name === line);
      return module ? {
        ...module,
        uuid: Math.random().toString(16).slice(2),
      } : null;
    })
    .filter((module) => !!module);
  return [ACTIONS.LOAD_VICTIM, victimShip];
}
export function loadInvolved(shipId) {
  const involvedShip = SHIPS.find((s) => `${s.id}` === shipId) || {
    name: shipId,
  };
  return [ACTIONS.ADD_INVOLVED, involvedShip];
}

export function unloadInvolved(uuid) {
  return [ACTIONS.REMOVE_INVOLVED, uuid];
}

// REDUCER
function REDUCER(state, [type, payload]) {
  switch (type) {
    case ACTIONS.INITIALIZE:
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
            uuid: Math.random().toString(16).slice(2),
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
  const involvedSize = Math.max(1, involvedSizeTotal / numInvolved);
  const involvedSizeMultiplier = Math.min(1.2, Math.max(0.5, victimBasePoints / involvedSize));
  return involvedSizeMultiplier;
}

export function getTotalPoints(state) {
  const victimBasePoints = getVictimBasePoints(state);
  const victimDangerFactor = getVictimDangerFactor(state);
  const involvedQtyPenalty = getInvolvedQtyPenalty(state);
  const involvedSizeMultiplier = getInvolvedSizeMultiplier(state);
  let points = victimBasePoints;
  points += victimDangerFactor;
  points *= Math.max(0.01, Math.min(1, victimDangerFactor / 4));
  points = points / involvedQtyPenalty;
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

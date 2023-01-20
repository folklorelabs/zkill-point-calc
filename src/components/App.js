import { useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  useZkillPointsContext,
  loadVictim,
  loadInvolved,
  unloadInvolved,
  getVictimBasePoints,
  getVictimDangerFactor,
  getInvolvedQtyPenalty,
  getInvolvedSizeMultiplier,
  getTotalPoints,
} from '../contexts/ZkillPoints';

import SHIPS from '../data/ships.json';
import './App.css';

function App() {
  const selInvolvedRef = useRef();
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  const state = useMemo(() => ({
    victimShip: zkillPointsState.victimShip,
    victimBasePoints: getVictimBasePoints(zkillPointsState),
    victimDangerFactor: getVictimDangerFactor(zkillPointsState),
    involvedQtyPenalty: getInvolvedQtyPenalty(zkillPointsState),
    involvedSizeMultiplier: getInvolvedSizeMultiplier(zkillPointsState),
    totalPoints: getTotalPoints(zkillPointsState),
  }), [zkillPointsState]);
  const txtEftHandler = useCallback(async (e) => {
    const val = e.target.value;
    const action = await loadVictim(val);
    zkillPointsDispatch(action);
  }, [zkillPointsDispatch]);
  const btnAttackerAddHandler = useCallback(() => {
    const val = selInvolvedRef.current.value;
    zkillPointsDispatch(loadInvolved(val));
  }, [zkillPointsDispatch]);
  const btnAttackerRemoveHandler = useCallback((uuid) => {
    zkillPointsDispatch(unloadInvolved(uuid));
  }, [zkillPointsDispatch]);
  
  return (
    <div className="App">
      <textarea
        onChange={txtEftHandler}
      ></textarea>
      {state.victimShip ? (
        <>
          <h1>{state.victimShip.name}</h1>
          <ul>
            <li>Base Points: {state.victimBasePoints}</li>
            {state.victimShip.modules.filter(module => module.dangerFactor > 0).map((module, i) => (
                <li
                  key={module.uuid}
                  value={module.id}
                >
                  {module.name} ({module.dangerFactor})
                </li>
            ))}
            <li>Danger Factor: {state.victimDangerFactor}</li>
            <li>Involved Qty Penalty: {state.involvedQtyPenalty}</li>
            <li>Involved Size Multiplier: {state.involvedSizeMultiplier}</li>
            <li>{state.totalPoints}</li>
          </ul>
          <select
            ref={selInvolvedRef}
          >
            <option key="capsule">
              Capsule
            </option>
            {SHIPS.map((ship) => (
                <option
                  key={ship.id}
                  value={ship.id}
                >
                    {ship.name}
                </option>
            ))}
          </select>
          <button
            onClick={btnAttackerAddHandler}
          >Add attacker</button>
          <ul>
              {zkillPointsState.involvedShips.map((ship) => (
                <li
                  key={ship.uuid}
                >
                  {ship.name}
                  <button
                    onClick={() => btnAttackerRemoveHandler(ship.uuid)}
                  >Remove attacker</button>
                </li>
              ))}
            </ul>
        </>
      ) : ''}
    </div>
  );
}

export default App;

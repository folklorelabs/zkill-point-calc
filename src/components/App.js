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

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import SHIPS from '../data/ships.json';
import './App.css';

function App() {
  const txtEftRef = useRef();
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
  const url = useMemo(() => {
    const { victimShip, involvedShips } = zkillPointsState;
    if (!victimShip) return '';
    const params = new URLSearchParams();
    params.append('victimShip', victimShip.name);
    const victimModuleNames = victimShip.modules && victimShip.modules
      .filter((m) => m.dangerFactor !== 0)
      .map((m) => m.name)
      .join(',');
    if (victimModuleNames) {
      params.append('victimModules', victimModuleNames);
    }
    const involvedShipNames = involvedShips && involvedShips.map((m) => m.name).join(',');
    if (involvedShipNames) {
      params.append('involvedShips', involvedShipNames);
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [zkillPointsState]);
  const btnEftHandler = useCallback(async () => {
    const val = txtEftRef.current.value;
    const action = await loadVictim(val);
    zkillPointsDispatch(action);
  }, [zkillPointsDispatch]);
  const btnAttackerAddHandler = useCallback((newValue) => {
    const val = typeof newValue === 'string' ? newValue : selInvolvedRef.current.value;
    zkillPointsDispatch(loadInvolved(val));
  }, [zkillPointsDispatch]);
  const btnAttackerRemoveHandler = useCallback((uuid) => {
    zkillPointsDispatch(unloadInvolved(uuid));
  }, [zkillPointsDispatch]);
  
  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="h4" gutterBottom>
        Zkill Point Appraisal
      </Typography>
      {state.victimShip ? (
        <>
          <Typography variant="h2" gutterBottom>
            {state.totalPoints} Points
          </Typography>
          <Typography variant="h5" gutterBottom>
            Victim Breakdown
          </Typography>
          <ul>
            <li>
              <Tooltip title="Determined by rig slot size">
                <span>{state.victimShip.name} ({state.victimBasePoints} points)</span>
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Based on meta value of DDAs and modules with heat. Mining harvesters reduce by same amount.">
                <span>Danger Factor ({state.victimDangerFactor} points)</span>
              </Tooltip>
              <ul>
                {state.victimShip.modules.filter(module => module.dangerFactor !== 0).map((module, i) => (
                  <li
                    key={module.uuid}
                    value={module.id}
                  >
                    <Tooltip title={`This module ${module.hasHeat ? 'has heat' : ''}${module.isDroneMod ? 'is a drone dmg mod' : ''}${module.isMiningMod ? 'is a mining harvester' : ''}`}>
                      <span>{module.name} ({module.dangerFactor} points)</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
          <Typography variant="h5" gutterBottom>
            Attacker Breakdown
          </Typography>
          <ul>
            <li>
              <span>Involved Ships ({zkillPointsState.involvedShips.length})</span>
              <ul>
                {zkillPointsState.involvedShips.map((ship) => (
                  <li
                    key={ship.uuid}
                  >
                    {ship.name} ({Math.pow(5, ship.rigSize)} points)
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() => btnAttackerRemoveHandler(ship.uuid)}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Tooltip title="Reduces points exponentially based on the number of attackers.">
                <span>Involved Qty Penalty: {state.involvedQtyPenalty}</span>
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Apply a bonus/penalty from -50% to 20% depending on average size of attacking ships. For example: Smaller ships blowing up bigger ships get a bonus or bigger ships blowing up smaller ships get a penalty. Also uses rig slot size for comparison and averages all attacking ships involved. Capsules are equal to victim ship rig size + 1.">
                <span>Involved Size Multiplier: {state.involvedSizeMultiplier}</span>
              </Tooltip>
            </li>
          </ul>
          <a href={url}>{url.length < 60 ? url : `${url.slice(0, 40)}...${url.slice(url.length - 20, url.length)}`}</a>
        </>
      ) : ''}
      <Divider />
      <FormControl sx={{ m: 1, minWidth: 320 }} size="small">
        <TextField
          id="eft-input"
          label="EFT"
          multiline
          maxRows={15}
          variant="standard"
          inputRef={txtEftRef}
        />
      </FormControl>
      <div>
        <Button
          onClick={btnEftHandler}
        >Submit</Button>
      </div>
      <Autocomplete
        id="attacker-select"
        options={SHIPS.sort((a, b) => `${a.rigSize} ${a.group}`.localeCompare(`${b.rigSize} ${b.group}`))}
        groupBy={(option) => `${option.group} (${Math.pow(5, option.rigSize)} points)`}
        getOptionLabel={(option) => option.name}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} inputRef={selInvolvedRef} variant="standard" />}
        // onChange={(event, newValue) => {
        //   if (!newValue || !newValue.name) return;
        //   btnAttackerAddHandler(newValue.name);
        //   event.target.value = '';
        // }}
        clearOnEscape
      />
      <div>
        <Button
          onClick={btnAttackerAddHandler}
        >Add attacker</Button>
      </div>
    </Box>
  );
}

export default App;

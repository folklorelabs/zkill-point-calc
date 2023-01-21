import {
  useMemo,
} from 'react';
import {
  useZkillPointsContext,
  loadVictim,
  loadAttackers,
  getBasePoints,
  getDangerFactor,
  getBlobPenalty,
  getShipSizeMultiplier,
  getTotalPoints,
} from '../contexts/ZkillPoints';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/system';

import SHIPS from '../data/ships.json';
import './App.css';

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: '#1976db',
  backgroundColor: '#e2f1fd',
}));

const GroupItems = styled('ul')({
  padding: 0,
});

function App() {
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  const state = useMemo(() => ({
    shipInfo: zkillPointsState.shipInfo,
    basePoints: getBasePoints(zkillPointsState),
    dangerFactor: getDangerFactor(zkillPointsState),
    blobPenalty: getBlobPenalty(zkillPointsState),
    shipSizeMultiplier: getShipSizeMultiplier(zkillPointsState),
    totalPoints: getTotalPoints(zkillPointsState),
  }), [zkillPointsState]);
  const url = useMemo(() => {
    const { shipInfo, attackers } = zkillPointsState;
    if (!shipInfo) return '';
    const params = new URLSearchParams();
    params.append('shipInfo', shipInfo.name);
    const victimModuleNames = shipInfo.modules && shipInfo.modules
      .filter((m) => m.dangerFactor !== 0)
      .map((m) => m.name)
      .join(',');
    if (victimModuleNames) {
      params.append('victimModules', victimModuleNames);
    }
    const involvedShipNames = attackers && attackers.map((m) => m.name).join(',');
    if (involvedShipNames) {
      params.append('attackers', involvedShipNames);
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [zkillPointsState]);
  const availableAttackers = useMemo(() => {
    return [
      ...SHIPS,
    ].sort((a, b) => `${a.rigSize} ${a.group}`.localeCompare(`${b.rigSize} ${b.group}`));
  }, []);
  const averageAttackerSize = useMemo(() => {
    const attackerShips = zkillPointsState.attackers;
    return Math.max(1, attackerShips.reduce((total, ship) => {
      return total + (ship.name === 'Capsule' ? Math.pow(5, zkillPointsState.shipInfo.rigSize + 1) : Math.pow(5, ship.rigSize));
    }, 0) / attackerShips.length);
  }, [zkillPointsState]);
  
  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Zkill Point Appraisal
      </Typography>
      <div style={{ textAlign: 'center' }}>
        <FormControl sx={{ m: 1, minWidth: 320 }} size="small">
          <TextField
            id="eft-input"
            label="EFT"
            multiline
            maxRows={15}
            variant="standard"
            onChange={(e) => {
              zkillPointsDispatch(loadVictim(e.target.value));
            }}
          />
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 320 }} size="small">
          <Autocomplete
            id="attacker-select"
            multiple
            limitTags={2}
            options={availableAttackers}
            value={zkillPointsState.attackers}
            isOptionEqualToValue={(option, value) => false}
            groupBy={(option) => `${option.group} (${Math.pow(5, option.rigSize)} points)`}
            getOptionLabel={(option) => option.name}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Ship" variant="standard" />}
            renderGroup={(params) => (
              <li>
                <GroupHeader>{params.group}</GroupHeader>
                <GroupItems>{params.children}</GroupItems>
              </li>
            )}
            clearOnEscape
            onChange={(event, newValue) => {
              zkillPointsDispatch(loadAttackers(newValue));
            }}
          />
        </FormControl>
      </div>
      {state.shipInfo ? (
        <>
          <Divider sx={{ margin: '3em 0' }} />
          <Typography variant="h2" gutterBottom sx={{ textAlign: 'center' }}>
            {state.totalPoints} Points
          </Typography>
          <Typography variant="h5" gutterBottom>
            Victim Breakdown
          </Typography>
          <ul>
            <li>
              <Tooltip title={`Determined by rig slot size (5 ^ ${state.shipInfo.rigSize})`}>
                <span>{state.shipInfo.name} ({state.basePoints} points)</span>
              </Tooltip>
            </li>
            <li>
              <Tooltip title={`The sum of all fitted "dangerous" modules flagged as a High Slot, Mid Slot, Low Slot, or SubSystem at time of death. Modules are considered "dangerous" if they are a Drone Damage mod or if they can be overheated. Likewise, Mining Lasers actually reduce this value.`}>
                <span>Danger Factor ({state.dangerFactor} points)</span>
              </Tooltip>
              <ul>
                {state.shipInfo.modules.map((module, i) => (
                  <li
                    key={module.uuid}
                    value={module.id}
                    style={{ opacity: module.dangerFactor === 0 ? 0.5 : 1 }}
                  >
                    <Tooltip title={`This module ${module.dangerFactor === 0 ? 'is not factored into point tally.' : ''} ${module.hasHeat ? 'is factored into point tally because it has heat damage.' : ''}${module.isDroneMod ? 'is factored into point tally because it is a drone damage mod.' : ''}${module.isMiningMod ? 'is factored into point tally because it is a mining harvester.' : ''}${module.hasHeat || module.isDroneMod || module.isMiningMod ? ` The point value is based on the module's meta level (${module.metaLevel}). Calculation is 1 + floor(metaLevel / 2)).` : ''}`}>
                      <span>{module.name} ({module.dangerFactor} points)</span>
                    </Tooltip>
                  </li>
                ))}
                <li style={{ opacity: 0.5 }}>
                  <Tooltip title="Cargo items are ignored in tally.">
                    <span>Cargo Items (0 points)</span>
                  </Tooltip>
                </li>
              </ul>
            </li>
          </ul>
          <Typography variant="h5" gutterBottom>
            Attacker Breakdown
          </Typography>
          <ul>
            <li>
              <Tooltip title="Reduces points exponentially based on the number of attackers.">
                <span>Blob Multiplier Penalty: {`${1 / state.blobPenalty < 1 ? '-' : '+'}${100 - Math.round(1 / state.blobPenalty * 100)}%`}</span>
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Apply a bonus/penalty from -50% to 20% depending on average size of attacking ships. For example: Smaller ships blowing up bigger ships get a bonus or bigger ships blowing up smaller ships get a penalty. Applied after blob penalty.">
                <span>Ship Size Multiplier: {`${state.shipSizeMultiplier < 1 ? '-' : '+'}${100 - Math.round(state.shipSizeMultiplier * 100)}%`}</span>
              </Tooltip>
              <ul>
                <li>
                <Tooltip title="Average ship size of all attacking ships. Based on rig size for direct comparison to victim ship.">
                  <span>Average: {averageAttackerSize}</span>
                </Tooltip>
                  <ul>
                    {zkillPointsState.attackers.map((ship) => (
                      <li
                        key={ship.uuid}
                      >
                        <Tooltip title={ship.name === 'Capsule' ? 'Capsules are equal to victim ship rig size + 1.' : `Determined by rig slot size (5 ^ ${ship.rigSize})`}>
                          <span>{ship.name} ({ship.name === 'Capsule' ? Math.pow(5, state.shipInfo.rigSize + 1) : Math.pow(5, ship.rigSize)} points)</span>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <Typography variant="h5" gutterBottom>
            Static URL
          </Typography>
          <p>
            <a href={url}>{url.length < 60 ? url : `${url.slice(0, 40)}...${url.slice(url.length - 20, url.length)}`}</a>
          </p>
        </>
      ) : ''}
    </Box>
  );
}

export default App;

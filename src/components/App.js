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
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/system';

import Item from './Item';

import SHIPS from '../data/ships.json';
import './App.css';

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '0.4em 1em',
  color: '#000000de',
  backgroundColor: '#ebebeb',
}));

const GroupItems = styled('ul')({
  padding: 0,
});

function ShipIconOption({ ship, className, ...params }) {
  return (
    <li className={`ShipIconOption ${className}`} {...params}>
      <img
        loading="lazy"
        className="ShipIconOption-image"
        src={`https://images.evetech.net/types/${ship.id === 'Rat' ? '30193' : ship.id}/icon?size=32`}
        alt=""
      />
      <span>{ship.name}</span>
    </li>
  );
}

function ShipIconChip({ ship, ...params }) {
  return (
    <Chip
      avatar={(<img
        className="ShipIconChip-image"
        src={`https://images.evetech.net/types/${ship.id === 'Rat' ? '30193' : ship.id}/icon?size=32`}
        alt=""
      />)}
      label={ship.name}
      {...params}
    />
  );
}

function App() {
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  const state = useMemo(() => {
    const dangerFactor = getDangerFactor(zkillPointsState);
    return {
      shipInfo: zkillPointsState.shipInfo,
      basePoints: getBasePoints(zkillPointsState),
      dangerFactor,
      blobPenalty: Math.round(1 / getBlobPenalty(zkillPointsState) * 100) - 100,
      sealClubbingPenalty: Math.max(0.01, Math.min(1, dangerFactor / 4)) * 100 - 100,
      shipSizeMultiplier: Math.round(getShipSizeMultiplier(zkillPointsState) * 100) - 100,
      totalPoints: getTotalPoints(zkillPointsState),
    };
  }, [zkillPointsState]);
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
  // const averageAttackerSize = useMemo(() => {
  //   const attackerShips = zkillPointsState.attackers;
  //   return Math.max(1, attackerShips.reduce((total, ship) => {
  //     return total + (ship.name === 'Capsule' ? Math.pow(5, zkillPointsState.shipInfo.rigSize + 1) : Math.pow(5, ship.rigSize));
  //   }, 0) / attackerShips.length);
  // }, [zkillPointsState]);
  
  return (
    <Box sx={{ width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <div className="App-header">
        <h1 className="App-headline">Killmail Simulator</h1>
        <p className="App-tagline">"What's the <em>point</em> of this anyway?"</p>
      </div>
      <div className="Controls">
        <FormControl sx={{ m: 1, minWidth: 320 }}>
          <TextField
            id="eft-input"
            label="Victim Fit (EFT Format)"
            multiline
            maxRows={15}
            variant="standard"
            onChange={(e) => {
              zkillPointsDispatch(loadVictim(e.target.value));
            }}
          />
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 320 }}>
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
            slotProps={{
              style: {
                padding: 0,
                margin: 0,
              }
           }}
            renderInput={(params) => <TextField label="Attacker Ships" variant="standard" {...params} />}
            renderTags={(tagValue, getTagProps) => (tagValue.map((option, index) => <ShipIconChip key={option.id} ship={option} {...getTagProps({ index })} />))}
            renderOption={(params, option) => (<ShipIconOption key={option.id} ship={option} {...params} />)}
            renderGroup={(params) => (
              <li key={params.group}>
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
        <p className="App-instructions">
          This is a tool for simulating the point value of <a href="https://zkillboard.com/" target="_blank" rel="noreferrer">zkillboard</a> killmails.
          Add a ship fit (in <a href="https://www.eveonline.com/news/view/import-export-fittings" target="_blank" rel="noreferrer">EFT format</a>) and select some attacker ships to get started.
        </p>
      </div>
      {state.shipInfo ? (
        <>
          <Divider sx={{ margin: '3em 0' }} />
          <Typography variant="h3" gutterBottom sx={{ textAlign: 'center' }}>
            {state.totalPoints} Points
          </Typography>
          <p style={{ textAlign: 'center' }}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              {url.length < 60 ? url : `${url.slice(0, 40)}...${url.slice(url.length - 20, url.length)}`}
            </a>
          </p>
          <div className="PointBreakdown">
            <div className="PointBreakdown-victim">
              <h2 className="PointBreakdown-headline">
                Point Breakdown
              </h2>
              <ul className="ItemList">
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/${state.shipInfo.id}/icon?size=64`}
                    itemName={state.shipInfo.name}
                    itemTooltip={`Point value is based on the ship's rig slot size (${state.shipInfo.rigSize}). Calculation is (5 ^ rigSlotSize).`}
                    itemText={`${state.basePoints} points`}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/23740/icon?size=64`}
                    itemName="Danger Factor"
                    itemTooltip={`The sum of all fitted "dangerous" modules flagged as a High Slot, Mid Slot, Low Slot, or SubSystem at time of death. Modules are considered "dangerous" if they are a Drone Damage mod or if they can be overheated. Likewise, Mining Lasers actually reduce this value.`}
                    itemText={`${state.dangerFactor} points`}
                  />
                </li>
                <li>
                  <ul className="ItemList">
                    {state.shipInfo.modules.sort((a, b) => b.dangerFactor - a.dangerFactor).map((module, i) => (
                      <li
                        className="ItemList-item"
                        key={module.uuid}
                      >
                        <Item
                          key={module.uuid}
                          itemImageSrc={`https://images.evetech.net/types/${module.id}/icon?size=64`}
                          itemName={module.name}
                          itemTooltip={`This module ${module.dangerFactor === 0 ? 'is not factored into point tally.' : ''} ${module.hasHeat ? 'is factored into point tally because it has heat damage.' : ''}${module.isDroneMod ? 'is factored into point tally because it is a drone damage mod.' : ''}${module.isMiningMod ? 'is factored into point tally because it is a mining harvester.' : ''}${module.hasHeat || module.isDroneMod || module.isMiningMod ? ` Point value is based on the module's meta level (${module.metaLevel}). Calculation is 1 + floor(metaLevel / 2)).` : ''}`}
                          itemText={`${module.dangerFactor} points`}
                          demphasized={module.dangerFactor === 0}
                        />
                      </li>
                    ))}
                    <li className="ItemList-item">
                      <Item
                        itemImageSrc="https://images.evetech.net/types/1317/icon?size=64"
                        itemName="Cargo Items"
                        itemTooltip="Cargo items are ignored in tally."
                        itemText="0 points"
                        demphasized={true}
                      />
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <div className="PointBreakdown-attacker">
              <h2 className="PointBreakdown-headline">
                Modifiers
              </h2>
              <ul className="ItemList">
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/28837/icon?size=64`}
                    itemName="Seal Clubbing Penalty"
                    itemTooltip="Apply a substantial penalty if the victim's danger rating is less than 4. Non-pvp ship, empty ships, etc are worth much less."
                    itemText={`${state.sealClubbingPenalty ? `${state.sealClubbingPenalty}%` : '--'}`}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/alliances/1354830081/logo?size=64`}
                    itemName="Blob Penalty"
                    itemTooltip="Reduces points exponentially based on the number of attackers. Applied after Seal Clubbing Penalty."
                    itemText={`${state.blobPenalty ? `${state.blobPenalty}%` : '--'}`}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/40348/icon?size=64`}
                    itemName="Ship Size Multiplier"
                    itemTooltip="Apply a bonus/penalty from -50% to 20% depending on average size of attacking ships. For example: Smaller ships blowing up bigger ships get a bonus or bigger ships blowing up smaller ships get a penalty. Applied after blob penalty."
                    itemText={`${state.shipSizeMultiplier > 0 ? `+${state.shipSizeMultiplier}%` : state.shipSizeMultiplier < 0 ? `${state.shipSizeMultiplier}%` : '--'}`}
                  />
                  <ul className="ItemList">
                    {zkillPointsState.attackers.map((ship) => (
                      <li
                        className="ItemList-item"
                        key={ship.uuid}
                      >
                        <Item
                          itemImageSrc={`https://images.evetech.net/types/${ship.id === 'Rat' ? '30193' : ship.id}/icon?size=64`}
                          itemName={ship.name}
                          itemTooltip={ship.name === 'Capsule' ? `Capsules are a special case. Point value is based on the victim ship's rig slot size + 1 (${state.shipInfo.rigSize + 1}). Calculation is (5 ^ (victimRigSlotSize + 1)).` : `Point value is based on the ship's rig slot size (${ship.rigSize}). Calculation is (5 ^ rigSlotSize).`}
                          itemText={`${ship.name === 'Capsule' ? Math.pow(5, state.shipInfo.rigSize + 1) : Math.pow(5, ship.rigSize)} points`}
                        />
                      </li>
                    ))}
                  </ul>
                  {/* {zkillPointsState.attackers.length ? (
                    <ul className="ItemList">
                      <li className="ItemList-item">
                        <Item
                          itemImageSrc={`https://images.evetech.net/types/24698/icon?size=64`}
                          itemName="Ship Average "
                          itemTooltip="Average ship size of all attacking ships. Based on rig size for direct comparison to victim ship."
                          itemText={`~${Math.round(averageAttackerSize)} points`}
                        />
                        
                      </li>
                    </ul>
                  ) : ''} */}
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : ''}
    </Box>
  );
}

export default App;

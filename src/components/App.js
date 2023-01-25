import {
  useMemo, useState,
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

import { debounce } from 'throttle-debounce';
import { useSnackbar } from 'notistack';

import {
  Box,
  Typography,
  FormControl,
  Link,
  Autocomplete,
  TextField,
  Divider,
  Chip,
  Popover,
} from '@mui/material';

import { styled } from '@mui/system';

import Item from './Item';
import AppToolbar from './AppToolbar';
import { TypeEmphasis } from './TypeEmphasis';

import SHIPS from '../data/ships.json';
import  {
  NestedItemList,
} from './App.styles.js';
import './App.css';
import useSimUrl from '../hooks/useSimUrl';
import { useTheme } from '@emotion/react';

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '0.4em 1em',
  color: 'rgba(theme.palette.text.secondary, 0.8)',
  backgroundColor: theme.palette.background.default,
}));

const GroupItems = styled('ul')({
  padding: 0,
});

function ShipIconOption({ ship, className, ...params }) {
  const theme = useTheme();
  return (
    <li className={`ShipIconOption ${className}`} style={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.secondary }} {...params}>
      <img
        loading="lazy"
        className="ShipIconOption-image"
        src={`https://images.evetech.net/types/${ship.id}/icon?size=32`}
        alt=""
      />
      <span>{ship.name}</span>
    </li>
  );
}

function ShipIconChip({ ship, ...params }) {
  const theme = useTheme();
  return (
    <Chip
      sx={{ color: theme.palette.text.secondary }}
      avatar={(<img
        className="ShipIconChip-image"
        src={`https://images.evetech.net/types/${ship.id}/icon?size=32`}
        alt=""
      />)}
      label={ship.name}
      {...params}
    />
  );
}

function App() {
  const { enqueueSnackbar } = useSnackbar();
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  const state = useMemo(() => {
    const dangerFactor = getDangerFactor(zkillPointsState);
    return {
      shipInfo: zkillPointsState.shipInfo,
      basePoints: getBasePoints(zkillPointsState),
      dangerFactor,
      blobPenalty: (Math.round(1 / getBlobPenalty(zkillPointsState) * 1000) - 1000) / 10,
      snugglyPenalty: (Math.max(0.01, Math.min(1, dangerFactor / 4)) * 1000 - 1000) / 10,
      shipSizeMultiplier: (Math.round(getShipSizeMultiplier(zkillPointsState) * 1000) - 1000) / 10,
      totalPoints: getTotalPoints(zkillPointsState),
    };
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
  const url = useSimUrl();
  const [popAnchor, setPopAnchor] = useState(null);
  
  return (
    <Box sx={{ width: '100%', maxWidth: 1050, margin: '0 auto', textAlign: 'center', }}>
      <AppToolbar />
      <Box>
        <div className="App-header">
          <a className="App-headlineLink" href="/">
            <TypeEmphasis>
              <Typography variant="h4" className="App-headline">Killmail Simulator</Typography>
            </TypeEmphasis>
          </a>
          <Typography  variant="subtitle" className="App-tagline">"What's the <TypeEmphasis>point</TypeEmphasis> of this anyway?"</Typography>
        </div>
        <div className="Controls">
          <FormControl sx={{ p: 2, maxWidth: '100%'  }}>
            <TextField
              id="eft-input"
              label="Victim Fit (EFT Format)"
              multiline
              maxRows={15}
              variant="standard"
              sx={{ width: 320, maxWidth: '100%' }}
              onChange={debounce(300, (e) => {
                if (!e.target.value) return;
                try {
                  zkillPointsDispatch(loadVictim(e.target.value));
                } catch(err) {
                  enqueueSnackbar(`${err}`, { variant: 'error' });
                }
              })}
            />
          </FormControl>
          <FormControl sx={{ p: 2, maxWidth: '100%' }}>
            <Autocomplete
              id="attacker-select"
              multiple
              disableCloseOnSelect
              clearOnEscape
              limitTags={1}
              options={availableAttackers}
              value={zkillPointsState.attackers}
              isOptionEqualToValue={(option, value) => false}
              groupBy={(option) => `${option.group} (${Math.pow(5, option.rigSize)} points)`}
              getOptionLabel={(option) => option.name}
              sx={{ width: 320, maxWidth: '100%' }}
              renderInput={(params) => <TextField label="Attacker Ships" variant="standard" {...params} />}
              renderTags={(tagValue, getTagProps) => (tagValue.map((option, index) => <ShipIconChip key={option.id} ship={option} {...getTagProps({ index })} />))}
              renderOption={(params, option) => (<ShipIconOption key={option.id} ship={option} {...params} />)}
              renderGroup={(params) => (
                <li key={params.group}>
                  <GroupHeader>{params.group}</GroupHeader>
                  <GroupItems>{params.children}</GroupItems>
                </li>
              )}
              onChange={(event, newValue) => {
                zkillPointsDispatch(loadAttackers(newValue));
              }}
            />
          </FormControl>
          <div className="App-instructions">
            <Typography variant="body2" sx={{ m: 2, }}>
              This is a "pointless" tool that simulates and breaks down the point value of <Link href="https://zkillboard.com/" target="_blank" rel="noreferrer">zkillboard</Link> killmails.
              Add a ship fit (in <Link href="https://www.eveonline.com/news/view/import-export-fittings" target="_blank" rel="noreferrer">EFT format</Link>) and select some attacker ships to get started.
              Note that structures are not currently supported as they are only ever worth 1 point.
            </Typography>
          </div>
        </div>
      </Box>
      {state.shipInfo ? (
        <>
          <Divider sx={{ margin: '110px 0' }} />
          <Box sx={{ textAlign: 'center', margin: '0 auto', maxWidth: 760, px: 2, }}>
            <Typography variant="h4" gutterBottom>
              This <TypeEmphasis>{state.shipInfo.name}</TypeEmphasis> is valued at <TypeEmphasis>{state.totalPoints} points</TypeEmphasis> based on the breakdown below.
            </Typography>
            <Link
              href={url}
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(url);
                setPopAnchor(e.currentTarget);
              }}
            >
              Share this simulation
            </Link>
            {zkillPointsState.zkillId ? (
              <>
                {' | '}
                <Link
                  href={`https://zkillboard.com/kill/${zkillPointsState.zkillId}/`}
                  target="_blank"
                  rel="noreferrer"
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   navigator.clipboard.writeText(`https://zkillboard.com/kill/${zkillPointsState.zkillId}/`);
                  //   setPopAnchor(e.currentTarget);
                  // }}
                >
                  Killmail on zkillboard
                </Link>
              </>
            ) : ''}
            <Popover
              open={Boolean(popAnchor)}
              anchorEl={popAnchor}
              onClose={() => {
              setPopAnchor(null);
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Typography sx={{ p: 2 }}>Link to this simulation copied to clipboard</Typography>
            </Popover>
          </Box>
          <Box className="PointBreakdown" sx={{ maxWidth: 900, margin: '80px auto 180px', padding: '0 30px', columnGap: '40px' }}>
            <Box className="PointBreakdown-victim" sx={{ marginBottom: '60px' }}>
              <Typography variant="h6" className="PointBreakdown-headline">
                Point Summary (<TypeEmphasis>{state.basePoints + state.dangerFactor}</TypeEmphasis>)
              </Typography>
              <Divider sx={{ margin: '0.45em 0 0' }} />
              <ul className="ItemList">
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/${state.shipInfo.id}/icon?size=64`}
                    itemName={state.shipInfo.name}
                    itemTooltip={`Ship points are determined by their in-game "Rig Size" attribute. The formula is 5 ⁽ʳⁱᵍ ˢⁱᶻᵉ⁾.`}
                    itemText={`${state.basePoints} points`}
                    />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/23740/icon?size=64`}
                    itemName="Danger Factor"
                    itemTooltip={`Danger Factor is the sum of all "dangerous" and "snuggly" modules fitted to the ship and flagged as a "High Slot", "Mid Slot", "Low Slot", or "SubSystem" in the killmail. A module is considered "dangerous" if it can be overehated or if it belongs to the "Drone Damage Module" group. A module is considered "snuggly" if it belonging to the "Mining Laser" group. Abyssal mods are not factored into this calculation more than likely because of complexity.`}
                    itemText={`${state.dangerFactor || 0} points`}
                    />
                </li>
                <li>
                  <NestedItemList className="ItemList">
                    {state.shipInfo.modules.sort((a, b) => Math.abs(b.dangerFactor) - Math.abs(a.dangerFactor)).map((module, i) => (
                      <li
                      className="ItemList-item"
                      key={module.uuid}
                      >
                        <Item
                          key={module.uuid}
                          itemImageSrc={`https://images.evetech.net/types/${module.id}/icon?size=64`}
                          itemName={module.name}
                          itemTooltip={!module.dangerFactor ? 'This module is not considered "dangerous" or "snuggly".' : `This module is considered ${module.isMiningMod ? '"snuggly"' : '"dangerous"'} because it ${module.isMiningMod ? 'is a Mining Laser' : module.isDroneMod ? 'is a Dron Damage Module' : 'can be overheated'}. Module points are determined by their in-game "Meta Level" attribute. The formula is 1 + floor(metaLevel / 2).`}
                          itemText={`${module.dangerFactor ? `${module.dangerFactor} points` : '--'}`}
                          demphasized={!module.dangerFactor}
                        />
                      </li>
                    ))}
                    <li className="ItemList-item">
                      <Item
                        itemImageSrc="https://images.evetech.net/types/1317/icon?size=64"
                        itemName="Cargo Items"
                        itemTooltip="Cargo items are ignored in tally."
                        itemText="--"
                        demphasized={true}
                      />
                    </li>
                  </NestedItemList>
                </li>
              </ul>
            </Box>
            <Box className="PointBreakdown-attacker">
              <Typography variant="h6" className="PointBreakdown-headline">
                Modifiers
              </Typography>
              <Divider sx={{ margin: '0.45em 0 0' }} />
              <ul className="ItemList">
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/28837/icon?size=64`}
                    itemName="Defenseless Penalty"
                    itemTooltip="A penalty from -0% to -99% increasing inversely proportional to the victim's danger rating. Non-pvp ship, empty ships, etc are worth much less. Penalty is only applied to ships with a danger factor less than 4."
                    itemText={`${state.snugglyPenalty ? `${state.snugglyPenalty}%` : '--'}`}
                    demphasized={!state.snugglyPenalty}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/alliances/1354830081/logo?size=64`}
                    itemName="Blob Penalty"
                    itemTooltip="A penalty from -0% to -99.9...% based on the number of attackers. Starts at -0% for solo, -50% for two, -78% for three, -87% for four, etc. Penalty is applied after Defenseless Penalty."
                    itemText={`${state.blobPenalty ? `${state.blobPenalty}%` : '--'}`}
                    demphasized={!state.blobPenalty}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/40348/icon?size=64`}
                    itemName="Ship Size Multiplier"
                    itemTooltip="A bonus/penalty from -50% to 20% depending on average size of attacking ships. For example: Smaller ships blowing up bigger ships get a bonus or bigger ships blowing up smaller ships get a penalty. Penalty is applied after blob penalty."
                    itemText={`${state.shipSizeMultiplier > 0 ? `+${state.shipSizeMultiplier}%` : state.shipSizeMultiplier < 0 ? `${state.shipSizeMultiplier}%` : '--'}`}
                    demphasized={!state.shipSizeMultiplier}
                  />
                  <NestedItemList className="ItemList">
                    {zkillPointsState.attackers.map((ship) => (
                      <li
                        className="ItemList-item"
                        key={ship.uuid}
                      >
                        <Item
                          itemImageSrc={`https://images.evetech.net/types/${ship.id}/icon?size=64`}
                          itemName={ship.name}
                          itemTooltip={`Ship points are determined by their in-game "Rig Size" attribute. The formula is 5 ⁽ʳⁱᵍ ˢⁱᶻᵉ⁾. ${ship.name === 'Capsule' ? ` Capsules are a special case. A capsules "Rig Size" is equal to that of the victim ship + 1.` : ''}`}
                          itemText={`${ship.name === 'Capsule' ? Math.pow(5, state.shipInfo.rigSize + 1) : Math.pow(5, ship.rigSize)} points`}
                        />
                      </li>
                    ))}
                  </NestedItemList>
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
            </Box>
          </Box>
        </>
      ) : ''}
    </Box>
  );
}

export default App;

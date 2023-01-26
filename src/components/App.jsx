import React, {
  useMemo, useState,
} from 'react';

import {
  Box,
  Typography,
  Link,
  Divider,
  Popover,
} from '@mui/material';

import {
  useZkillPointsContext,
  getBasePoints,
  getDangerFactor,
  getBlobPenalty,
  getShipSizeMultiplier,
  getTotalPoints,
} from '../contexts/ZkillPoints';

import Item from './Item';
import AppToolbar from './AppToolbar';
import AppHeader from './AppHeader';
import SimControls from './SimControls';
import { TypeEmphasis } from './TypeEmphasis';

import {
  NestedItemList,
} from './App.styles';
import './App.css';
import percentLabel from '../utils/percentLabel';
import SimSummary from './SimSummary';

function App() {
  const { zkillPointsState } = useZkillPointsContext();
  const state = useMemo(() => {
    const dangerFactor = getDangerFactor(zkillPointsState);
    return {
      shipInfo: zkillPointsState.shipInfo,
      basePoints: getBasePoints(zkillPointsState),
      dangerFactor,
      blobPenalty: (Math.round((1 / getBlobPenalty(zkillPointsState)) * 1000) - 1000) / 10,
      snugglyPenalty: (Math.max(0.01, Math.min(1, dangerFactor / 4)) * 1000 - 1000) / 10,
      shipSizeMultiplier: (Math.round(getShipSizeMultiplier(zkillPointsState) * 1000) - 1000) / 10,
      totalPoints: getTotalPoints(zkillPointsState),
    };
  }, [zkillPointsState]);
  const [copyPopAnchor, setCopyPopAnchor] = useState(null);

  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          margin: '0 auto',
          maxWidth: 900,
        }}
      >
        <AppToolbar />
      </Box>
      <Divider />
      {!state.shipInfo ? (
        <Box
          sx={{
            margin: '40px auto 80px',
            px: 2,
            maxWidth: 500,
          }}
        >
          <AppHeader />
          <SimControls />
        </Box>
      ) : (
        <Box>
          <SimSummary />
          <Box
            className="PointBreakdown"
            sx={{
              maxWidth: 900,
              margin: '0 auto 180px',
              columnGap: '40px',
              px: 2,
            }}
          >
            <Box className="PointBreakdown-victim" sx={{ marginBottom: '60px' }}>
              <Typography variant="h6" className="PointBreakdown-headline">
                Point Summary (
                <TypeEmphasis>{state.basePoints + state.dangerFactor}</TypeEmphasis>
                )
              </Typography>
              <Divider sx={{ margin: '0.45em 0 0' }} />
              <ul className="ItemList">
                <li className="ItemList-item">
                  <Item
                    itemImageSrc={`https://images.evetech.net/types/${state.shipInfo.id}/icon?size=64`}
                    itemName={state.shipInfo.name}
                    itemTooltip={'Ship points are determined by their in-game "Rig Size" attribute. The formula is 5 ⁽ʳⁱᵍ ˢⁱᶻᵉ⁾.'}
                    itemText={`${state.basePoints} points`}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc="https://images.evetech.net/types/23740/icon?size=64"
                    itemName="Danger Factor"
                    itemTooltip={'Danger Factor is the sum of all "dangerous" and "snuggly" modules fitted to the ship and flagged as a "High Slot", "Mid Slot", "Low Slot", or "SubSystem" in the killmail. A module is considered "dangerous" if it can be overehated or if it belongs to the "Drone Damage Module" group. A module is considered "snuggly" if it belonging to the "Mining Laser" group. Abyssal mods are not factored into this calculation more than likely because of complexity.'}
                    itemText={`${state.dangerFactor || 0} points`}
                  />
                </li>
                <li>
                  <NestedItemList className="ItemList">
                    {
                      state.shipInfo.modules
                        .sort((a, b) => Math.abs(b.dangerFactor) - Math.abs(a.dangerFactor))
                        .map((module) => (
                          <li
                            className="ItemList-item"
                            key={module.uuid}
                          >
                            <Item
                              key={module.uuid}
                              itemImageSrc={`https://images.evetech.net/types/${module.id}/icon?size=64`}
                              itemName={module.name}
                              itemTooltip={!module.dangerFactor ? 'This module is not considered "dangerous" or "snuggly".' : `This module is considered ${module.isMiningMod ? '"snuggly"' : '"dangerous"'} because it ${(() => { if (module.isMiningMod) return 'is a Mining Laser'; if (module.isDroneMod) return 'is a Dron Damage Module'; return 'can be overheated'; })()}. Module points are determined by their in-game "Meta Level" attribute. The formula is 1 + floor(metaLevel / 2).`}
                              itemText={`${module.dangerFactor ? `${module.dangerFactor} points` : '--'}`}
                              demphasized={!module.dangerFactor}
                            />
                          </li>
                        ))
                    }
                    <li className="ItemList-item">
                      <Item
                        itemImageSrc="https://images.evetech.net/types/1317/icon?size=64"
                        itemName="Cargo Items"
                        itemTooltip="Cargo items are ignored in tally."
                        itemText="--"
                        demphasized
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
                    itemImageSrc="https://images.evetech.net/types/28837/icon?size=64"
                    itemName="Defenseless Penalty"
                    itemTooltip="A penalty from -0% to -99% increasing inversely proportional to the victim's danger rating. Non-pvp ship, empty ships, etc are worth much less. Penalty is only applied to ships with a danger factor less than 4."
                    itemText={`${state.snugglyPenalty ? `${state.snugglyPenalty}%` : '--'}`}
                    demphasized={!state.snugglyPenalty}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc="https://images.evetech.net/alliances/1354830081/logo?size=64"
                    itemName="Blob Penalty"
                    itemTooltip="A penalty from -0% to -99.9...% based on the number of attackers. Starts at -0% for solo, -50% for two, -78% for three, -87% for four, etc. Penalty is applied after Defenseless Penalty."
                    itemText={`${state.blobPenalty ? `${state.blobPenalty}%` : '--'}`}
                    demphasized={!state.blobPenalty}
                  />
                </li>
                <li className="ItemList-item">
                  <Item
                    itemImageSrc="https://images.evetech.net/types/40348/icon?size=64"
                    itemName="Ship Size Multiplier"
                    itemTooltip="A bonus/penalty from -50% to 20% depending on average size of attacking ships. For example: Smaller ships blowing up bigger ships get a bonus or bigger ships blowing up smaller ships get a penalty. Penalty is applied after blob penalty."
                    itemText={`${percentLabel(state.shipSizeMultiplier)}`}
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
                          itemTooltip={`Ship points are determined by their in-game "Rig Size" attribute. The formula is 5 ⁽ʳⁱᵍ ˢⁱᶻᵉ⁾. ${ship.name === 'Capsule' ? ' Capsules are a special case. A capsules "Rig Size" is equal to that of the victim ship + 1.' : ''}`}
                          itemText={`${ship.name === 'Capsule' ? 5 ** (state.shipInfo.rigSize + 1) : 5 ** ship.rigSize} points`}
                        />
                      </li>
                    ))}
                  </NestedItemList>
                </li>
              </ul>
            </Box>
          </Box>
        </Box>
      )}
      <Box className="App-instructions" sx={{ px: 2, my: 6 }}>
        <Typography variant="body2">
          Killmail Simulator was brought to you by
          {' '}
          <Link href="https://zkillboard.com/character/879471236/" target="_blank" rel="noreferrer">peebun</Link>
          {' '}
          and has no affiliation with zKillboard.
          All
          {' '}
          <Link href="https://zkillboard.com/information/legal/" target="_blank" rel="noreferrer">EVE related materials</Link>
          {' '}
          are property of
          {' '}
          <Link href="http://www.ccpgames.com/" target="_blank" rel="noreferrer">CCP Games</Link>
          .
        </Typography>
      </Box>
      <Popover
        open={Boolean(copyPopAnchor)}
        anchorEl={copyPopAnchor}
        onClose={() => {
          setCopyPopAnchor(null);
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
  );
}

export default App;

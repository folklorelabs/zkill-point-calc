import React, {
  useMemo,
} from 'react';

import {
  Box,
  Typography,
} from '@mui/material';

import {
  useZkillPointsContext,
  getBasePoints,
  getDangerFactor,
  getBlobPenalty,
  getShipSizeMultiplier,
  getTotalPoints,
} from '../contexts/ZkillPoints';

import { TypeEmphasis } from './TypeEmphasis';

import ZkillLink from './ZkillLink';
import SimLink from './SimLink';
import ResetSimButton from './ResetSimButton';
import EditSimButton from './EditSimButton';
import CopySimButton from './CopySimButton';

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

  return (
    <Box
      sx={{
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: 900,
        // padding: '120px 16px',
        pb: 8,
        px: 2,
      }}
    >
      <Box
        sx={{
          my: 1,
          mx: 'auto',
          maxWidth: 900,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box />
        <Box>
          <ResetSimButton />
          {' '}
          <EditSimButton />
          {' '}
          <CopySimButton />
        </Box>
      </Box>
      <Box sx={{ display: 'block', textAlign: 'center', margin: '80px 0 40px' }}>
        <Box>
          {zkillPointsState.zkillId ? (
            <>
              <ZkillLink />
              {' | '}
            </>
          ) : ''}
          <SimLink />
        </Box>
        <Typography variant="h4">
          This
          {' '}
          <TypeEmphasis>
            {state.shipInfo.name}
          </TypeEmphasis>
          {' '}
          is valued at
          {' '}
          <TypeEmphasis>
            {state.totalPoints}
            {' '}
            points
          </TypeEmphasis>
          {' '}
          based on the breakdown below.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;

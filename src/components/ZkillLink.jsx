import React from 'react';

import {
  Button,
  Tooltip,
} from '@mui/material/';
import {
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useZkillPointsContext } from '../contexts/ZkillPoints';

function ZkillLink() {
  const { zkillPointsState } = useZkillPointsContext();
  return zkillPointsState.zkillId ? (
    <Tooltip title="Go to related killmail on zKillboard">
      <Button
        endIcon={<LaunchIcon />}
        href={`https://zkillboard.com/kill/${zkillPointsState.zkillId}/`}
        target="_blank"
        rel="noreferrer"
      >
        zKillboard
      </Button>
    </Tooltip>
  ) : '';
}

export default ZkillLink;

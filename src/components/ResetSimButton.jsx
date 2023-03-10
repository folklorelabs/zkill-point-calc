import React from 'react';

import {
  IconButton,
  Tooltip,
} from '@mui/material/';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { resetZkill, useZkillPointsContext } from '../contexts/ZkillPoints';

function ResetSimButton() {
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  return zkillPointsState.shipInfo ? (
    <Tooltip title="Reset this simulation">
      <IconButton
        // endIcon={<DeleteIcon />}
        onClick={() => {
          const confirm = window.confirm('Are you sure you want to reset reset the simulation?');
          if (confirm) zkillPointsDispatch(resetZkill());
        }}
      >
        {/* Reset */}
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  ) : '';
}

export default ResetSimButton;

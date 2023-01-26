import React, {
  useState,
} from 'react';

import {
  IconButton,
  Tooltip,
  Typography,
  Popover,
} from '@mui/material/';
import {
  IosShare as IosShareIcon,
} from '@mui/icons-material';
import { useZkillPointsContext } from '../contexts/ZkillPoints';
import useSimUrl from '../hooks/useSimUrl';

function CopySimButton() {
  const { zkillPointsState } = useZkillPointsContext();
  const url = useSimUrl();
  const [copyPopAnchor, setCopyPopAnchor] = useState(null);
  return (
    <>
      {zkillPointsState.shipInfo ? (
        <Tooltip title="Copy this simulation URL to clipboard">
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(url);
              setCopyPopAnchor(e.currentTarget);
            }}
            // endIcon={<IosShareIcon />}
          >
            {/* Copy */}
            <IosShareIcon />
          </IconButton>
        </Tooltip>
      ) : ''}
      <Popover
        open={Boolean(copyPopAnchor)}
        anchorEl={copyPopAnchor}
        onClose={() => {
          setCopyPopAnchor(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Typography sx={{ p: 2 }}>Link to this simulation copied to clipboard</Typography>
      </Popover>
    </>
  );
}

export default CopySimButton;

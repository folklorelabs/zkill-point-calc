import React, {
  useState,
} from 'react';

import {
  Button,
  Tooltip,
  Typography,
  Popover,
} from '@mui/material/';
import {
  Star as StarIcon,
} from '@mui/icons-material';
import { zkillScrapeBookmarklet } from '../utils/zkillScrapeBookmarklet';

function CopySimButton() {
  const [copyPopAnchor, setCopyPopAnchor] = useState(null);
  return (
    <>
      <Tooltip title="Bookmarklet for parsing a killmail while viewing it on zkillboard.com">
        <Button
          onClick={(e) => {
            e.preventDefault();
            // navigator.clipboard.writeText(zkillScrapeBookmarklet);
            setCopyPopAnchor(e.currentTarget);
          }}
          href={zkillScrapeBookmarklet}
          endIcon={<StarIcon />}
        >
          Killmail Simulator Bookmarklet
        </Button>
      </Tooltip>
      <Popover
        open={Boolean(copyPopAnchor)}
        anchorEl={copyPopAnchor}
        onClose={() => {
          setCopyPopAnchor(null);
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Typography sx={{ p: 2 }}>
          Drag this bookmarklet into your bookmarks bar.
          <br />
          Then click it while viewing a
          {' '}
          <a href="https://zkillboard.com" target="_blank" rel="noreferrer">zKillboard</a>
          {' '}
          killmail
          {' '}
          to see the simulation here.
        </Typography>
      </Popover>
    </>
  );
}

export default CopySimButton;

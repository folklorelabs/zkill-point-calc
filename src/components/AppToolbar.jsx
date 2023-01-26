import React from 'react';

import {
  Typography,
  Box,
  Toolbar,
  Link,
} from '@mui/material/';
import ColorModeToggle from './ColorModeToggle';

function AppToolbar() {
  return (
    <Box>
      <Toolbar>
        <Link className="App-headlineLink" color="inherit" href="/" sx={{ textDecoration: 'none', flexGrow: 1, textAlign: 'left' }}>
          <Typography variant="h6" component="span">
            Killmail Simulator
          </Typography>
        </Link>
        <ColorModeToggle />
      </Toolbar>
    </Box>
  );
}

export default AppToolbar;

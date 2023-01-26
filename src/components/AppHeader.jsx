import React from 'react';

import {
  Typography,
} from '@mui/material/';

import { TypeEmphasis } from './TypeEmphasis';

export default function AppHeader() {
  return (
    <div className="App-header">
      <a className="App-headlineLink" href="/">
        <TypeEmphasis>
          <Typography variant="h4" className="App-headline">Killmail Simulator</Typography>
        </TypeEmphasis>
      </a>
      <Typography variant="subtitle" className="App-tagline">
        For predicting zKillboard point values
      </Typography>
    </div>
  );
}

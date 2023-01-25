import {
    useMemo,
  } from 'react';
  
import {
  useZkillPointsContext,
  loadVictim,
  loadAttackers,
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
  Chip,
} from '@mui/material';

import { styled } from '@mui/system';

import { TypeEmphasis } from './TypeEmphasis';

import SHIPS from '../data/ships.json';
import  {

} from './AppControls.styles.js';
import './App.css';
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
  <span>
    {ship.name}
    {/* {' - '}
    {Math.pow(5, ship.rigSize)} */}
  </span>
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

const TAGLINE = (<>For predicting zKillboard point values</>);
  
function App() {
  const { enqueueSnackbar } = useSnackbar();
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  const availableAttackers = useMemo(() => {
    return [
      ...SHIPS,
    ].sort((a, b) => `${a.category} ${a.group} ${a.rigSize}`.localeCompare(`${b.category} ${b.group} ${b.rigSize}`));
  }, []);
    
  return (
    <Box>
      <div className="App-header">
        <a className="App-headlineLink" href="/">
          <TypeEmphasis>
            <Typography variant="h4" className="App-headline">Killmail Simulator</Typography>
          </TypeEmphasis>
        </a>
        <Typography  variant="subtitle" className="App-tagline">
          {TAGLINE}
        </Typography>
      </div>
      <div className="Controls">
        <FormControl sx={{ p: 2, maxWidth: '100%'  }}>
          <TextField
            id="eft-input"
            label="Victim Fit"
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
          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
            Fit must be in <Link href="https://www.eveonline.com/news/view/import-export-fittings" target="_blank" rel="noreferrer">EFT format</Link>.
          </Typography>
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
            groupBy={(option) => `${option.category !== 'Ship' ? `${option.category} - ${option.group}` : option.group}`}
            getOptionLabel={(option) => option.name}
            sx={{ width: 320, maxWidth: '100%' }}
            renderInput={(params) => <TextField label="Attackers" variant="standard" {...params} />}
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
          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
            Select the "Rat" option for any non-player attacker.
          </Typography>
        </FormControl>
      </div>
    </Box>
  );
}
  
  export default App;
  
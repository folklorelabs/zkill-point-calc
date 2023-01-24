import {
    useMemo,
    useState,
} from 'react';
import { useColorModeContext } from '../contexts/ColorMode';
import {
  useZkillPointsContext,
} from '../contexts/ZkillPoints';

import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import IosShareIcon from '@mui/icons-material/IosShare';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function AppToolbar() {
  const theme = useTheme();
  const colorMode = useColorModeContext();
  const { zkillPointsState } = useZkillPointsContext();
  const url = useMemo(() => {
    const { shipInfo, attackers } = zkillPointsState;
    if (!shipInfo) return '';
    const killmail = [];

    // add ship id to killmail array
    killmail.push(shipInfo.id);

    // add ship modules to killmail array
    const shipModulesObj = shipInfo.modules && shipInfo.modules
      .filter((m) => m.dangerFactor !== 0)
      .map((m) => m.id)
      .reduce((all, mId) => {
        all[mId] = all[mId] ? all[mId] + 1 : 1;
        return all;
      }, {});
    const shipModules = Object.keys(shipModulesObj).map((mId) => {
      const qty = shipModulesObj[mId];
      return `${mId}${qty > 1 ? `_${qty}` : ''}`;
    }).join('.');
    killmail.push(shipModules);

    // add attackers to killmail array
    const attackerShipsObj = attackers && attackers.map((s) => s.id)
      .reduce((all, sId) => {
        all[sId] = all[sId] ? all[sId] + 1 : 1;
        return all;
      }, {});
    const attackerShips = Object.keys(attackerShipsObj).map((sId) => {
      const qty = attackerShipsObj[sId];
      return `${sId}${qty > 1 ? `_${qty}` : ''}`;
    }).join('.');
    killmail.push(attackerShips);

    const url = new URL(window.location);
    url.searchParams.set('k', killmail.join('-'));
    window.history.replaceState({}, '', url);
    return `${url}`;
  }, [zkillPointsState]);

  const [popAnchor, setPopAnchor] = useState(null);  
  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
          {/* Killmail Simulator */}
        </Typography>
        <div>
          <IconButton
            sx={{ ml: 1 }}
            onClick={(e) => {
              navigator.clipboard.writeText(url);
              setPopAnchor(e.currentTarget);
            }}
            color="inherit"
          >
            {<IosShareIcon />}
          </IconButton>
          
        </div>
        <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Popover
          open={Boolean(popAnchor)}
          anchorEl={popAnchor}
          onClose={() => {
            setPopAnchor(null);
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
      </Toolbar>
    </Box>
  );
}
  
export default AppToolbar;
  
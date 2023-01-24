import {
    useState,
} from 'react';
import { useColorModeContext } from '../contexts/ColorMode';
import useSimUrl from '../hooks/useSimUrl';

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
  const url = useSimUrl();
  const [popAnchor, setPopAnchor] = useState(null);  
  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
          {/* Killmail Simulator */}
        </Typography>
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
  
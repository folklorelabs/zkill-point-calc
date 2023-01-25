import {
    useState,
} from 'react';
import { useColorModeContext } from '../contexts/ColorMode';

import { useTheme } from '@mui/material/styles';

import {
  Button,
  Tooltip,
  Typography,
  Popover,
  Box,
  Toolbar,
} from '@mui/material/';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function AppToolbar() {
  const theme = useTheme();
  const colorMode = useColorModeContext();
  const [popAnchor, setPopAnchor] = useState(null);  
  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
          {/* Killmail Simulator */}
        </Typography>
        <Tooltip title="Toggle dark/light mode">
          <Button sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit" endIcon={theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}>
              {theme.palette.mode} mode
          </Button>
        </Tooltip>
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
  
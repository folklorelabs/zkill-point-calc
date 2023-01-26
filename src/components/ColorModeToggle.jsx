import React from 'react';

import { useTheme } from '@mui/material/styles';

import {

  Button,
} from '@mui/material/';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useColorModeContext } from '../contexts/ColorMode';

function ColorModeToggle() {
  const theme = useTheme();
  const colorMode = useColorModeContext();
  return (
    <>
      {/* <Tooltip title="Toggle dark/light mode"> */}
      <Button
        color="inherit"
        onClick={colorMode.toggleColorMode}
        endIcon={theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      >
        {theme.palette.mode}
        {' '}
        mode
        {/* {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />} */}
      </Button>
      {/* </Tooltip> */}
    </>
  );
}

export default ColorModeToggle;

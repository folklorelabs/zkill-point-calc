import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from '@mui/material/';
import {
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useZkillPointsContext } from '../contexts/ZkillPoints';

function CopySimButton({ onClick }) {
  const { zkillPointsState } = useZkillPointsContext();
  return zkillPointsState.shipInfo ? (
    <Button
      onClick={onClick}
      endIcon={<LaunchIcon />}
      href={zkillPointsState.url}
      target="_blank"
      rel="noreferrer"
    >
      This simulation
    </Button>
  ) : '';
}

CopySimButton.defaultProps = {
  onClick: () => {},
};

CopySimButton.propTypes = {
  onClick: PropTypes.func,
};

export default CopySimButton;

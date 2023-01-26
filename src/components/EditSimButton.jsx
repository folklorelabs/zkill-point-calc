import React from 'react';

import {
  IconButton,
  Tooltip,
} from '@mui/material/';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { useZkillPointsContext } from '../contexts/ZkillPoints';
import EditModal from './EditModal';

function EditSimButton() {
  const { zkillPointsState } = useZkillPointsContext();
  return zkillPointsState.shipInfo ? (
    <EditModal
      renderButton={({ onClick }) => (
        <Tooltip title="Edit this simulation">
          <IconButton
            // endIcon={<EditIcon />}
            onClick={onClick}
          >
            {/* Edit */}
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}
    />
  ) : '';
}

export default EditSimButton;

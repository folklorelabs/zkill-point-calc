import React from 'react';
import PropTypes from 'prop-types';

import {
  Typography,
  Link,
  TextField,
  Box,
  Modal,
  Button,
} from '@mui/material';

import { debounce } from 'throttle-debounce';
import { useSnackbar } from 'notistack';
import parseEft from '../utils/parseEft';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 540,
  maxWidth: '100%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function EftImportModal({ buttonText, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const [eftString, setEftString] = React.useState('');
  const submit = React.useCallback(() => {
    try {
      const data = parseEft(eftString);
      setOpen(false);
      onSuccess(data);
    } catch (err) {
      enqueueSnackbar(`${err}`, { variant: 'error' });
    }
  }, [onSuccess, enqueueSnackbar, eftString]);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonText}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField
            label="Ship Fit"
            multiline
            maxRows={20}
            minRows={20}
            fullWidth
            onChange={debounce(300, (e) => setEftString(e.target.value))}
          />
          <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1, mb: 4 }}>
            Ship Fit must be in
            {' '}
            <Link href="https://www.eveonline.com/news/view/import-export-fittings" target="_blank" rel="noreferrer">EFT format</Link>
            .
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={submit}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </>
  );
}

EftImportModal.defaultProps = {
  buttonText: 'Import via EFT',
  onSuccess: () => {},
};

EftImportModal.propTypes = {
  onSuccess: PropTypes.func,
  buttonText: PropTypes.string,
};

export default EftImportModal;

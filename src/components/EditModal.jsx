import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import AppControls from './SimControls';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  maxWidth: '100%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function EditModal({ renderButton }) {
  const [open, setOpen] = React.useState(false);
  const trigger = renderButton({
    onClick: () => setOpen(true),
  });
  return (
    <>
      {trigger}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <AppControls submitText="Update" onSuccess={() => setOpen(false)} />
        </Box>
      </Modal>
    </>
  );
}

EditModal.defaultProps = {
  renderButton: ({ onClick }) => (<Button onClick={onClick}>Controls</Button>),
};

EditModal.propTypes = {
  renderButton: PropTypes.func,
};

export default EditModal;

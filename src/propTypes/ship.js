import PropTypes from 'prop-types';

export const shipDefaults = {};

export const shipProps = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  rigSize: PropTypes.number.isRequired,
});

export default shipProps;

import PropTypes from 'prop-types';

export const moduleDefaults = {
  hasHeat: false,
  isDroneMod: false,
  isMiningMod: false,
};

export const moduleProps = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  metaLevel: PropTypes.number.isRequired,
  dangerFactor: PropTypes.number.isRequired,
  hasHeat: PropTypes.bool,
  isDroneMod: PropTypes.bool,
  isMiningMod: PropTypes.bool,
});

export default moduleProps;

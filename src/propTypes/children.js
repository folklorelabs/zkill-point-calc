import PropTypes from 'prop-types';

export const childrenDefaults = null;

export const childrenProps = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]);
export default childrenProps;

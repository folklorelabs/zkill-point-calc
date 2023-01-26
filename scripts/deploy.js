/* eslint-disable import/no-extraneous-dependencies */

const ghpages = require('gh-pages');

ghpages.publish('build', (err) => {
  if (err) {
    console.log('Uh oh.', err);
  } else {
    console.log('Deployment done-zo!');
  }
});

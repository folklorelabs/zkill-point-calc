var ghpages = require('gh-pages');

ghpages.publish('build', function(err) {
    if (err) {
        console.log('Uh oh.', err);
    } else {
        console.log('Deployment done-zo!');
    }
});

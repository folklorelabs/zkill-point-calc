export const zkillScrape = () => {
  try {
    const u = /zkillboard.com\/kill\/(\d+)(\/|$)/.exec(window.location.href);
    if (!u || u.length < 2) throw new Error('This bookmarklet only works on zkillboard.com killmail pages');
    const s = document.querySelector('#bigship a');
    const m = document.querySelector('#Fitting_Panel');
    const a = document.querySelectorAll('.attacker td:first-child :nth-child(2)');
    if (!s || !m || !a) throw new Error('Cannot parse killmail. Please ensure this is the latest version of the bookmarklet');
    const k = [
      /\/ship\/(\d+)(\/|$)/.exec(s.href)[1],
      Array.from(m.querySelectorAll('a'))
        .map((x) => /\/item\/(\d+)(\/|$)/.exec(x.href))
        .filter((x) => !!x)
        .map((x) => x[1])
        .join('.'),
      Array.from(a)
        .map((x) => /\/ship\/(\d+)(\/|$)/.exec(x.href))
        .map((x) => (!x ? 670 : x[1]))
        .join('.'),
      u[1],
    ];
    const dest = new URL('https://killmailsimulator.com');
    dest.searchParams.set('k', k.join('-'));
    window.open(`${dest}`, '_blank');
  } catch (err) {
    window.alert(err);
  }
};
export const zkillScrapeBookmarklet = `javascript:(${encodeURI(zkillScrape.toString())})()`;

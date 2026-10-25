# Phenytoin (moved)

The standalone phenytoin dose adjuster was merged into the PK suite on 2026-10-25: [`../pk-suite/phenytoin.html`](../pk-suite/phenytoin.html). It does everything the standalone tool did, plus a dose-history tab, CrCl, ICU and CYP2C9 options, and a Site model that reproduces the old Winter binding equations.

[`index.html`](index.html) here only redirects, so old links and bookmarks keep working. It carries saved settings across once and removes the old saved data.

The calculation tests are in `../pk-suite/tests/phenytoin.test.js` (every case from the old `calc.test.js` is there), and the browser self-check is `../pk-suite/tests/phenytoin-ui-smoke.js`.

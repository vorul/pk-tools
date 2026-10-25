# Phenytoin calculator tests

## Calculation tests

From the repository root:

```
node --test phenytoin/tests/calc.test.js
```

These load the calculation code straight out of `../index.html`, so they always test what is published. They cover:

- Winter's worked examples (Q1–Q10, Q12–Q14, Q16, Q17, Eq 14.8)
- binding corrections, weights and population values
- cross-checks between the model's equations
- capsule and tablet rounding rules
- invalid inputs and safety checks
- 2,000 random patients and regimens

## Interface tests

1. Open `phenytoin/index.html` in Chrome or Edge.
2. Press F12 to open the console.
3. Paste the contents of `ui-smoke.js` and press Enter.

The script clicks through every tab, unit toggle, country preset, panel and the copy note, and returns a pass/fail list.

The saved-settings check confirms that settings are kept and patient values are not. When it runs on a local file it reports as skipped if the browser gives the page no storage.

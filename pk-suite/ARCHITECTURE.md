# PK Suite: build conventions

These conventions came from the original standalone phenytoin tool, which was merged into `phenytoin.html` on 2026-10-25 (`../phenytoin/` now redirects there).

## Layout
```
pk-suite/
  lib/pkcore.js      shared calculation library (no DOM). Classic script that sets globalThis.PK and also does module.exports = PK when `module` exists
  lib/pk.css         shared design tokens and components, taken from the original phenytoin tool (IBM Plex if installed, else system fonts; light/dark tokens on :root)
  lib/pk-ui.js       optional small shared UI helpers (unit toggles, number formatting, warning banners)
  <tool>.html        one page per tool. Loads lib/pk.css, lib/pkcore.js and its own inline <script>
  index.html         launcher listing all tools
  tests/pkcore.test.js, tests/<tool>.test.js   node:test. Run with: node --test pk-suite/tests/
  specs/             research specs (source of truth for formulas); kept in the private vorul/pk-tools-research repo
  lit/               literature cross-checks (source of truth where the site is wrong or outdated)
```

## Rules
- **Pure math lives between `// CALC-START` and `// CALC-END`** in each tool page. The tool's test file loads that block with `new Function` (every test file here works this way), after first evaluating `lib/pkcore.js`.
- **Every tool uses PK.\*** for body weight, CrCl, one- and two-compartment math, Bayesian fitting and rounding. Never re-implement them locally. If something is missing from pkcore, note it in the tool's README section; don't fork it.
- **Units:** time in h, concentration in mg/L (= mcg/mL; digoxin uses ng/mL at the UI edge only), CL in L/h, V in L, weight in kg, height in cm internally (UI accepts in/cm), SCr in mg/dL internally (UI accepts µmol/L, ÷ 88.4).
- **Policies are explicit options** with documented defaults, never silent: weight policy, SCr floor, obesity threshold, and the CrCl method.
- **Provenance:** each displayed parameter or default carries a source tag. Values from outside the site or unverified ones show a visible "verify" badge.
- **Worked examples become tests:** every spec's worked-example and live-server-verification rows go into the tool's test file, with tolerances stated.
- **No network calls at runtime.** No web fonts, frameworks or build step. Works from file:// and as a published artifact.
- **Two parameter sets per drug:** `"literature"` (the default: values recommended in `lit/*.md`) and `"site"` (reproduces pkineticdrugdosing.com exactly, used for regression tests against the live-server tables). Both are selectable in a "Model" setting, and the active set is shown on the result card.
- **Safety copy:** an educational-use disclaimer goes in the footer. Warnings for out-of-range inputs and for levels drawn at the wrong time.
- **Patient fields start blank.** Mark every patient value (demographics, labs, doses, levels, times, histories, interactions) `data-patient`, with no sample value. Pages store settings only, never patient values. A required select (sex, acyclovir indication) has an empty "Select" option.
- **Plausibility limits:** call `PKUI.checkLimits` and `PKUI.limitGate` before calculating. Adult tools use 18–110 y, 25–350 kg, 120–230 cm; tools that accept children use 0–110 y, 0.4–350 kg, 30–230 cm; SCr 0.1–20 mg/dL. Out-of-range values withhold the result until the user ticks "Use these values anyway". A Cockcroft-Gault CrCl of 0 or below blocks with no override.

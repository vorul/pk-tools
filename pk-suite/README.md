# PK Suite

## Status (2026-10-25)
- **Built:** 11 tools and a launcher (`index.html`), with shared code in `lib/` (`pkcore.js`, `pk.css`, `pk-ui.js`). Every tool has a Literature model (the default) and a Site model that reproduces pkineticdrugdosing.com, including the live-server results.
- **Workbook models:** digoxin, vancomycin, aminoglycosides and lithium also have a Workbook model that reproduces Pierce's Excel tools. Vancomycin-HD has a "Pierce HD workbook" preset under Site. The values saved in the workbooks are hard-coded as regression tests. The workbook comparisons are in the private research repo (below); see also the "Applied 2026-10-24" section of `DECISIONS.md`.
- **Tests:** `npm test` from the repository root (or `node --test pk-suite/tests/`). All pass. `tests/phenytoin-ui-smoke.js` is a browser self-check for the phenytoin page (paste it into the console).
- **Phenytoin:** the standalone tool was merged into `phenytoin.html` on 2026-10-25; `../phenytoin/` redirects here.
- **Source material:** the downloaded site (workbooks, PDFs, pages, and text dumps of the workbooks) is kept in a local `site-mirror` folder outside this repository. It is copyrighted reference material, so keep it out of any public repo.
- **Run:** serve the `pk-suite` folder over HTTP (pages load `lib/` with relative paths). Opening a file directly works in a normal browser but not in the app's preview pane.
- **Research trail:**
  - The per-tool specs (site behaviour, including the live-server verification) and the workbook comparisons are in the private repo `vorul/pk-tools-research` (`specs/`, `workbook-checks/`), because they describe third-party material in detail. Source tags such as `specs/vanco-auc.md §8` refer to it. Clone it next to this repository to run the vancomycin chart regression tests; without it those 4 tests are skipped.
  - `lit/` holds the literature cross-checks.
  - `decisions/` and `DECISIONS.md` hold the sign-off research and recommended defaults. All of them are applied to the Literature models; builder notes are in the "Applied with notes" section.
- **Safety (2026-10-25):** patient fields start blank on every load, and no tool stores patient values (settings only). Values outside plausible ranges withhold the result until confirmed, and a Cockcroft-Gault CrCl of 0 or below cannot be overridden (see `ARCHITECTURE.md`). Vancomycin keeps the rounded regimen inside AUC 400–600 when one exists (Literature and Workbook models; Site is unchanged).
- **Still open:** institutional limits (infusion hard maxima, HD protocol details) and the unverified items listed at the end of `DECISIONS.md`.

The sections below are the original build reference compiled from the specs. Where they conflict with `DECISIONS.md`, `DECISIONS.md` wins.

# Build reference

This reference is compiled from 17 per-tool specs (`specs/*.md`, now in the private research repo). Each spec was researched from https://pkineticdrugdosing.com on 2026-10-23. The tool inventory is in `TOOLS.md`.

## 1. How confident each spec is

| Spec | Source of formulas | Checked against the author's own numbers? |
|---|---|---|
| core-equations | Plain-text equations and 11 example PDFs | Yes. All example sheets recomputed |
| vanco-charts-hd | Chart PDFs and HD study pages | Yes. 569/600 chart cells exact, the rest within ±0.3. HD dose 787 vs study 785 mg |
| infusion-rate | 29 chart PDFs | Yes. About 230 rows, 0 mismatches |
| ag-once-daily | Nomogram PDF vector data and prose | Yes. Curves reproduced within 0.5% |
| vanco-bayesian | Excel manual PDF | Yes. MAP fit reproduces the site's 5-trough chart within about 2 mg·h/L |
| bayesian-engine | Methods page and PHP simplex listing | Partly. Vd/CL match. The SSE trace is not reproducible |
| two-comp-auc | Plain-text equations | Yes. The site's own "AUC 490" example is wrong (520.8) |
| lithium | Workbook screenshot and prose | Population method yes. Level-based methods reconstructed from Winter |
| phenytoin | Local workbooks (formulas dumped) and site | Yes. Workbook cases and the Winter Q1–Q17 cases in `tests/` |
| crcl | Client-side JS (readable) | Yes. Site logic re-run |
| hepatic-score | Client-side JS (readable) | Yes. This is a Child-Pugh sum only |
| ag-traditional, vanco-auc, digoxin, theophylline | Prose and form labels. **The calculators compute server-side (ASP)** | **No.** Hidden constants are listed in each spec |
| phenobarbital, acyclovir | Prose only (literature/info pages) | Partly. Gaps filled from outside the site and marked `[EXT]` or "proposal" |

## 2. Shared modules (build these first)

1. **`body`**: IBW (Devine), adjusted BW (`IBW + 0.4·(TBW−IBW)`), Janmahasatian FFM (use the corrected formula: male 6680, female `8780 + 244·BMI`), DuBois BSA.
2. **`renal`**: Cockcroft-Gault with a configurable weight policy and SCr floor, Chow iterative non-steady-state CrCl, and a normalized CrCl per 1.73 m². Returns the unrounded value. See `crcl.md` §"for other modules".
3. **`pk1c`**: one-compartment bolus, infusion and oral models, superposition over an arbitrary dose history, steady-state shortcuts, Sawchuk-Zaske, and AUC (primary method `Dose/CL·24/τ`).
4. **`pk2c`**: Goti two-compartment model (α/β, A/B, infusion superposition).
5. **`bayes`**: MAP objective = Σ((obs−pred)/(CV_assay·obs))² + Σ((θ−θpop)/(CV·θpop))². Defaults are CV 0.3 on CL and Vd and 0.1 on the assay. Optimizer is Levenberg-Marquardt with a Nelder-Mead fallback in log-parameter space. This replaces the site's PHP simplex, which has a `rand(0,1)` bug.
6. **`mm`**: phenytoin Michaelis-Menten (steady state, 1- and 2-level, non-steady state, Lambert W, Bayesian).
7. **`round`**: product-strength and dose-increment rounding per drug.

## 3. Drug models (population parameters)

| Drug | K / CL | Vd | Notes |
|---|---|---|---|
| Gent/tobra/amikacin | K = 0.0026·CrCl + 0.014 | 0.25 L/kg dosing wt | The PDF prints 0.026 (typo). Once-daily nomogram curves sit at CrCl 55/35/25 |
| Vancomycin (1-comp) | K = 0.00107·CrCl(per 1.73 m²) + 0.0052 | 0.65 L/kg TBW | LD about 25 mg/kg, max 3 g |
| Vancomycin (2-comp) | CL = 6.04·(CrCl/120)^0.8 | Vc 58.4·WT/70, Vp 38.4·WT/70, Q 6.5 | IIV and residual error are `[EXT]` and must be verified against Goti (PMID 29470227) |
| Vanco HD | non-renal CL 0.46 L/h, HD CL 4.08 L/h | 1.03 L/kg | Post-HD flat 750 mg; goal pre-HD 15–20 |
| Digoxin | Sheiner / Koup (± CHF) × interaction factors | Jusko / Paulson | F: tab 0.7, elixir 0.8, IV/capsule 1 |
| Theophylline | base CL **unknown (server)** × 15 multipliers | **unknown** (proposed 0.5 L/kg) | Aminophylline S = 0.84 |
| Lithium | CL = 0.25·CrCl | 0.7 L/kg (dosing wt = min(FFM, TBW)) | 300 mg carbonate = 8.12 mEq |
| Phenobarbital | 0.0047 / 0.0082 / 0.0056 / 0.0024 L/h/kg by age | 0.96 / 0.63 / 0.61 L/kg | Two conflicting CL sets on the site |
| Phenytoin | Vmax and Km by age (Murphy 2005) | 0.65 L/kg (1 L/kg under 1 year) | Winter albumin correction; 0.48 factor in ESRD |
| Acyclovir | CL = 0.2022·CrCl + 1.722 (Blum) | 0.6 L/kg | Renal dose table is `[EXT]` (package insert) |

## 4. Decisions needed before building

1. **Server-side calculators:** submit synthetic test patients to the 7 server-side ASP calculators (AG traditional, AG once-daily, vanco AUC, digoxin, theophylline, lithium, infusion rate) to pin down the hidden constants? This needs explicit approval because it is form submission on a third-party site.
2. **Excel workbooks:** download them (digoxin ×2, lithium, phenobarbital, vanco/gent ×2, Bayesian simulation) to dump formulas? They are not needed for a complete spec, only for exact parity.
3. **Obesity threshold** for using adjusted BW in CrCl (the site never states one; proposed TBW > 1.3·IBW).
4. **Target ranges** where the site conflicts with itself: digoxin (0.5–0.8 vs 0.8–1.2 CHF), lithium, phenobarbital (10–40), amikacin trough (<1 vs <0.9), AG max AUCs.
5. **Phenobarbital CL set**: the main list or the dosing-table back-calculation.
6. **Vanco HD**: maintenance-dose rule (flat 750 vs tiers) and adjustment actions outside 15–20 (the site gives none).
7. **`[EXT]` content** (acyclovir renal table, Goti IIV, Cooper lithium nomogram, argatroban dosing): keep it with a "verify" badge or drop it.
8. **Infusion library review**: ReoPro is discontinued, bivalirudin uses an old regimen, and the procainamide bag-size label is wrong.

## 5. Known site errors (do not copy)

- FFM / Janmahasatian constants are mistyped on several pages.
- Gentamicin K slope prints as 0.026 (it should be 0.0026).
- Chow and Winter CrCl equations are dimensionally broken as printed.
- Phenobarbital time-to-SS formula is missing a minus sign, and its NSS formula has `1*Exp` where it should be `1-Exp`.
- Theophylline: cirrhosis is labelled as a clearance *increase*.
- The 2-comp steady-state formula ignores carry-over at t = 0. The site's "baseline AUC 490" should be 520.8.
- The vanco superposition trough formula is mis-parenthesized.
- Phenytoin workbooks: Vmax/Km are fitted on uncorrected total levels; the `ABS()` hides invalid level pairs; and the saved Solver fit is not the true minimum.
- The once-daily AG nomogram region labels (>60 / 41–60 / 31–40) don't match the CrCl the curves are drawn at (55 / 35 / 25).

## 6. Suggested build order

`body` + `renal` → `pk1c` → AG traditional / once-daily + vanco AUC (one shared module) → `bayes` → vanco Bayesian / digoxin / lithium / phenobarbital / theophylline → `pk2c` → phenytoin (extend the existing standalone phenytoin tool, since merged into `phenytoin.html`) → infusion-rate, hepatic score, acyclovir. Every spec's "Worked examples" section becomes that module's test file.

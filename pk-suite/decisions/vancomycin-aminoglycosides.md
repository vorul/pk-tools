# Open clinical decisions: vancomycin (incl. HD) and aminoglycosides

Compiled 2026-10-23. This file builds on `lit/vancomycin.md` and `lit/aminoglycosides-renal.md` and on `specs/vanco-charts-hd.md` §4–5. It does not repeat their cross-checks. It goes deeper where those files left a choice open or a fact unverified. No other files were edited.

**Evidence tags**
- **[V]** I read the primary source this session (abstract, full text or label).
- **[V2]** I read it only in a secondary source that reproduces the primary.
- **[V-code]** Read in a maintained open-source implementation: InsightRX `PKPDsim` model library, `inst/models/pk_vanco_*.json5`, v0.2.31, https://github.com/InsightRX/PKPDsim. This is secondary but machine-exact.
- **[I]** Institutional protocol document (not peer-reviewed). I read it this session.
- **[D]** My own derivation or calculation. It is not a published value.
- **[R]** Recalled and not verified this session. Confirm before coding it as fact.

**Confidence scale.** *High*: guideline or consistent primary data. *Moderate*: guideline plus supportive studies, or several concordant studies. *Low*: no direct evidence, single small study, or derivation.

---

## Summary of recommended defaults

| # | Decision | Recommended default | Confidence |
|---|---|---|---|
| 1 | Post-HD maintenance dose (high-flux) | 10 mg/kg TBW rounded to 250 mg, floor 500 mg, cap 1500 mg. Flat 750 mg and weight tiers stay as options. Mandatory pre-HD level before the 2nd post-load session | Moderate (dose basis), low (floor and cap) |
| 2 | Adjustment by pre-HD level | Band table: < 10 → supplemental 10–15 mg/kg now and MD +250–500; 10–<15 → +250; 15–20 → no change; > 20–25 → −250; > 25 → hold, recheck, resume −250 to −500. Also show a proportional estimate | Low–moderate (institutional consensus, not trial-based) |
| 3 | Pre-HD goal 20–25 | Not the default. Default 15–20. Offer "15–25 (severe infection)" as a labelled option with a warning | Moderate |
| 4 | Residual renal function add-on | Linear interpolation: about 40 mg per mL/min residual CrCl per 48 h gap (×1.5 for 72 h); round only the final dose | Low (derived; no published rule) |
| 5 | Vd in obesity; LD cap | 0.5 L/kg TBW when BMI ≥ 30, no TBW cap (warn > 200 kg). LD cap 3 g; 4 g as an option | Moderate (Vd), moderate (3 g), low (4 g) |
| 6 | MAP priors (1-comp site model) | Log-normal. ω_CL ≈ 0.30, ω_V ≈ 0.30, optional r(CL,V) 0.25. Residual 15% proportional + 1.5 mg/L additive on predicted. Published models use their own published Ω and σ | Moderate |
| 7 | Goti 2018 parameters | Confirmed (see §7). Erratum = elderly SCr-rounding age threshold 60 → 65 [V-code, erratum text not read]. Default the SCr rounding OFF ("modified Goti") | Moderate–high |
| 8 | EID dose; amikacin in sepsis | Gent/tobra 7 mg/kg; 5 mg/kg option for UTI/MIC ≤ 1/synergy. Amikacin 15 mg/kg standard; 25 mg/kg (range 25–30) preset for septic shock/ICU | Moderate–high |
| 9 | Trough targets | EID: gent/tobra < 0.5, amikacin < 2.5 (strict option < 1). Traditional: see table | Moderate |
| 10 | Hartford nomogram coordinates | **Not obtained.** Do not ship Hartford as a numeric nomogram until it is digitised from Nicolau 1995 Fig. 1 | — |

---

## 1. High-flux HD maintenance dose after each session

**Options.** (a) Flat 750 mg post-HD (site 2020 MUE). (b) 10 mg/kg post-HD (Rybak 2020). (c) Weight tiers.

**Evidence**

| Source | Regimen | Result |
|---|---|---|
| Rybak 2020 guideline (verified in `lit/vancomycin.md`) | High-permeability: 10 mg/kg after each HD (7.5 mg/kg low-flux); intradialytic 10–15 mg/kg | Guideline (moderate-quality evidence). Recommends +25% for the 72 h gap |
| Lewis SJ, Mueller BA. *J Clin Pharmacol* 2021;61(2):211-23. PMID 32851685. doi:10.1002/jcph.1727 [V abstract] | Monte Carlo, high/low flux, intra vs post | LD 25–35 mg/kg plus MD **7.5–15 mg/kg** needed for 90% target attainment. **+30%** for the 3-day gap. A single level before the **2nd** session "greatly enhances" target attainment. Full text blocked (Cloudflare), so the TDM table was not read |
| Zelenitsky SA et al. *Clin Infect Dis* 2012;55(4):527-33. PMID 22573855. doi:10.1093/cid/cis458 [V abstract] | Intradialytic tiers: < 70 kg 1000/500; 70–100 kg 1250/750; > 100 kg 1500/1000 (LD/MD) | Prospective validation: maintenance pre-HD 17.3 ± 4.0; 65.5% within 10–20; 89.7% within 10–22 |
| Zelenitsky SA, Ariano RE. *AJHP* 2022;79(12):1006-10. PMID 35234825. doi:10.1093/ajhp/zxac066 [V abstract] | Intradialytic, AUC 400–700: 50–69 kg 1500/750; 70–89 kg 2000/1000; 90–110 kg 2500/1250 | Median MD **12.5 mg/kg** (intradialytic); PTA 74.7% day 1, 70.8% day 8; < 10% above range |
| Maxson R et al. *Ren Fail* 2016;38(10):1677-82. PMID 27756193. doi:10.1080/0886022X.2016.1229992 [V abstract] | Weight tiers | 37% in 15–20, none < 10. Improved < 75 kg; tiers were problematic > 105 kg (spec §4f: % above range rose across tiers 19/52/67/100%) |
| Sun et al. *Can J Hosp Pharm* 2019;72(5):369-76. PMID 31692636 [V full text via CJHP] | < 70 kg 1000/500; 70–100 kg 1500/750; > 100 kg 2000/1000; intra or post | 15–20: 44% vs 20% (NS). 10–22: 94% vs 53%. Median MD 9.7 mg/kg. Authors suggest higher MDs (750/1000) in the two lower tiers |
| Taylor ME, Allon M. *AJKD* 2010;55(6):1163-5. PMID 20497837. doi:10.1053/j.ajkd.2010.03.016 [V full text] | LD 20 mg/kg, then **flat 1000 mg** in the last hour of each HD | Pre-HD 19.0 ± 6.6; 35% in 15–20; 79% in 10–25; 15% > 25. Authors warn of overdosing in small patients and underdosing in morbid obesity or with residual function |
| El Nekidy WS et al. *Can J Hosp Pharm* 2016;69(5):341-7 [V full text] | Post-HD, GEE model | Pre-HD = 6.329 + 0.658·(MD mg/kg) + 0.492·(previous pre-HD) − 2.133·(72 h gap). To hold 15–20 from 15–20: **5.9 mg/kg (48 h)** / 7.1 mg/kg (72 h). From 10–15: 9.2 / 10.0 mg/kg |
| Soto Guerrero Y et al. *Bol Asoc Med P R* 2012;104(3):10-4. PMID 23156886 [V abstract] | 1 g LD + 500 mg MD | Inadequate: 36% of sessions at target. Regression suggests LD 23 mg/kg and **MD 8 mg/kg** |
| El Nekidy WS et al. *Clin Nephrol* 2022;97(2):111-20. PMID 34958297. doi:10.5414/CN110664 [V abstract] | Review | Studies used MD 8–13 mg/kg (~1 g) in the last hour (high-flux). Favours a standard MD for simplicity |
| Site 2020 MUE (unpublished; spec §4f) | Post-HD | Dose for 20 mg/L: 785 ± 240 mg (410–1398). Weight vs required dose R² = 0.028 |
| UNMC/Nebraska Medicine nephrology strategy, updated 3/2024 [I] https://www.unmc.edu/intmed/_documents/id/asp/dose-vancomycin-nephrology-preferred-dosing-strategy.pdf | LD 20 mg/kg (1–2 g), then **flat 750 mg post-HD** ("roughly 7–10 mg/kg") | Institutional |

**Synthesis**
- Post-HD doses that reach 15–20 cluster around **8–10 mg/kg**: El Nekidy needs about 6–9 mg/kg depending on the starting level, Soto 8, Sun 9.7, site 757 mg at about 9 mg/kg.
- Intradialytic doses need about 25–30% more: Zelenitsky 2022 12.5 mg/kg, Taylor 1000 mg.
- At 75–85 kg, flat 750 mg ≈ 10 mg/kg ≈ the middle tier, so the options **differ only at the extremes**.
- The flat-dose argument rests on weak weight correlation in single-centre data (site MUE, R² 0.03). The weight-based argument rests on Vd and CL scaling in simulations (Lewis, Zelenitsky) and the guideline.
- Taylor and Maxson both report overdosing small patients with fixed or tiered doses, and Maxson reports overdosing in heavy tiers. This argues for mg/kg with sensible bounds rather than an unbounded flat dose or unbounded tiers.

**RECOMMENDED DEFAULT.** Post-HD MD = **10 mg/kg TBW**, rounded to 250 mg, with a **floor of 500 mg and a cap of 1500 mg**. The floor and cap are my proposal (no published source), chosen to reproduce the observed 410–1398 mg range.
- Intradialytic (last hour): 12.5 mg/kg (range 10–15).
- 72 h gap: +25% (Rybak) to +30% (Lewis). Default +25%.
- Pre-HD level **before the 2nd session after the load** (Lewis 2021; UNMC), then before the next session after any change, then weekly.

**Alternatives to keep.** "Flat 750 mg (site MUE)". "Weight tiers": post-HD < 75 / 75–99 / ≥ 100 kg → 500/750/1000 (legacy site, Maxson-type) or the Zelenitsky 2012 intradialytic tiers. "Low-flux": 7.5 mg/kg (Rybak).

**Confidence.** Moderate for 10 mg/kg as the basis. Low for the floor and cap values.

**Institutional choice.** Flat vs mg/kg. Floor and cap. Rounding increment. Intra- vs post-HD administration. Whether to apply the +25% before the long gap.

---

## 2. Adjustment by pre-HD level outside 15–20

**Published or institutional rules with explicit actions**

| Source | Goal | Rule |
|---|---|---|
| Panais R et al. *J Nephrol* 2010;23(5):569-74. PMID 20540035 [V abstract] | 10–20 | MD 500 mg each HD. Level before doses 3 and 5. **> 20 → next dose −50%; < 10 → next dose +50%** |
| UNMC 2024 [I] | 15–20 | **> 20 → −250 mg; 15–20 → continue; < 15 → +250 mg.** Recheck before the next HD after any change, weekly once stable. "It may be necessary to skip a dose and then resume 500 mg… when level is > 30" |
| Stanford Health Care Vancomycin Dosing Guide, rev. 02/2023 §F [I] https://med.stanford.edu/content/dam/sm/bugsanddrugs/documents/antimicrobial-dosing-protocols/SHC%20Vancomycin%20Dosing%20Guide.pdf | 15–20 | Dose-by-level, each session: **< 10 → 10–15 mg/kg post-HD; 10–15 → 500–750 mg or 7.5–10 mg/kg; 15–20 → 250–500 mg or 5 mg/kg; 20–25 → hold ×1 or 250 mg (2.5 mg/kg); > 25 → hold until in range; check a level 4–6 h after the next HD; re-dose if < 20–25.** Consider giving 20% more pre-HD in severe infection. LD 20–25 mg/kg (max 2 g) |
| Sun 2019 (previous institutional guideline quoted) [V] | 8–20 | MD changed in 250 mg steps by pre-HD level |
| Site 2020 MUE (spec §4c) | 15–20 | 10–<15 → +≤250; 15–20 → no change; ≥ 25–30 → −250–500; > 25 → hold. Gaps at < 10 and 20–25 |
| El Nekidy 2016 [V] | 15–20 | Regression above gives the mg/kg needed from the current level |
| Lewis SJ et al. *BMC Nephrol* 2023;24:270. PMID 37710245. doi:10.1186/s12882-023-03314-y [V full text] | Home HD | **Proportional**: new MD = initial MD × (target ÷ measured), target pre-HD 24 mg/L for home HD regimens |
| Ho E et al. *Nephrology* 2023;28(4):227-33. PMID 36651874. doi:10.1111/nep.14144 [V abstract] | 15–20 | Titration by same-day pre-HD level. In range rose from 23% to 46%; held doses fell 19/117 → 1/118. **Table not accessed** |
| Gunning H et al. *Ir Med J* 2016;109(9):465. PMID 28125179 [V abstract] | 10–20 | Level-guided dosing; 84% therapeutic. Rules not in abstract |
| Mahmoud LB et al. *Clin Nephrol* 2017;88(10):198-204. PMID 28793955 [V abstract] | — | Levels before HD 2 and 6 performed as well as levels before every session |
| Crew P et al. *AJHP* 2015;72:1856-64. PMID 26490819 [V abstract] | — | Review; no single standard algorithm |

Ghasemi and Cooper HD vancomycin protocols were **not found** in PubMed under those author names with vancomycin and hemodialysis. Taylor 2010 is above; it has no graded rule beyond "increase if < 10". Rybak 2020 gives no graded rule.

**Synthesis.** Every rule found uses 250 mg steps (or ±50% around a 500 mg base, which is the same thing), holds for high levels (> 25 or > 30), and uses a re-load-sized dose for < 10. The 20–25 band is handled as either −250 mg (UNMC, Stanford) or "hold ×1" (Stanford).

**RECOMMENDED DEFAULT** (goal 15–20; post-HD dosing):

| Pre-HD (mg/L) | Action | Next level |
|---|---|---|
| < 10 | Give **10–15 mg/kg** after this HD (Stanford), then MD **+250 to +500 mg** (+500 if < 7.5) | Before next HD |
| 10 to < 15 | MD **+250 mg** | Before next HD |
| 15–20 | No change | Weekly |
| > 20 to 25 | MD **−250 mg** (or no change if a 15–25 goal is selected, §3) | Before next HD |
| > 25 to 30 | **Hold** this dose. Resume at MD −250 to −500 mg when the next pre-HD level is ≤ 20 | Before next HD |
| > 30 | Hold. Recheck pre-HD each session. Resume at MD −500 mg when ≤ 20. Flag for pharmacist review | Each HD |

Also show the **proportional estimate** next to the table: MD_new = MD_current × 17.5 / C_preHD, rounded to 250 mg and bounded to ±50%. This assumes linear PK at steady state. It is approximate before about the 3rd maintenance dose, because the level still contains load carry-over [D]. When the two disagree, show both.

**Alternatives.** UNMC simple ±250 (two-sided only). Panais ±50%. Stanford dose-by-level, which computes each session's dose from that day's level rather than adjusting a standing MD.

**Confidence.** Low–moderate. The rules are consistent across institutions, but none was validated against outcomes.

**Institutional choice.** The step size (250 vs 50%). The hold threshold (25 vs 30). Whether to give the supplemental dose at < 10 or < 15.

---

## 3. Is a pre-HD goal of 20–25 acceptable?

**Evidence linking pre-HD level to AUC**
- **Vandecasteele et al.** (quoted in Rambaran KA et al., *Cureus* 2018;10:e2917, doi:10.7759/cureus.2917) [V2]: with high-flux HD and MIC 1, pre-HD 10 / 15 / 20 → AUC24/MIC about **269 / 404 / 538**. Linear extrapolation gives about 672 at 25 [D].
- **Site MUE regression** (spec §4f): AUC = 24.715·C + 53.958 → 15 → 425, 20 → 548, 25 → 672 [D from site data].
- **Kambe M et al.** *Antibiotics* 2026;15(1):47. PMID 41594084. doi:10.3390/antibiotics15010047 [V full text]: AUC 400–600 was reached at a **median pre-HD 17.5 (IQR 16.6–19.4)**. Pre-HD level was strongly correlated with AUC (R² 0.921). AUC/MIC ≥ 400 independently predicted early response. AUC 600–700 did not increase adverse effects. The authors flag that the correlation may partly be a modelling artefact.
- **Lewis 2023** [V]: simulations needed pre-HD **20–24** to keep AUC ≥ 400 in ≥ 90% of **home-HD** patients. The authors state this is above the 15–20 recommended for thrice-weekly IHD. They cite their own 2021 simulation, in which pre-HD 10–20 corresponded to a mean AUC of 250–450 in thrice-weekly IHD.
- **Ables M et al.** *J Pharm Pract* 2023;37(4):922-6. PMID 37715731. doi:10.1177/08971900231198927 [V abstract]: set a goal of 20–25, which they say "correlates with an AUC/MIC of 480–600". They justify it by reduced immune function in ESRD.
- **Stanford 2023** [I]: the "trough-based protocol (IHD…)" random target is **17–25 mg/L**, but the IHD algorithm itself targets 15–20.
- **Rybak 2020** [verified previously]: pre-HD 15–20 "likely" achieves AUC 400–600 (low-quality evidence).
- **El Nekidy 2022 review** [V]: outcomes were favourable at pre-HD ≥ 13 for bacteremia and SSTI. "Regardless of how high the pre-HD vancomycin concentrations were", vancomycin was not associated with favourable outcomes in deep-seated infections.
- **Site MUE** (spec §4f): the 20–25 cohort ran a mean of 21.3. 16.5% of all levels were > 25.

**Synthesis.** Pre-HD 20 maps to an AUC of about 540–550 and pre-HD 25 to about 670 (two independent mappings agree [V2/D]). A 20–25 goal therefore centres the AUC at about 600–670, above the 400–600 window. Nephrotoxicity is moot in anuric patients but not in those with residual function. Ototoxicity data at these exposures are lacking. 15–20 maps to about 400–550. The upper 20–23 region is defensible for severe infection or high MIC. The evidence that higher levels help deep-seated infections is negative (El Nekidy 2022).

**RECOMMENDED DEFAULT.** Goal **15–20**. Offer **"15–25 (severe infection: bacteremia, endocarditis, osteomyelitis, MIC 2)"** as a selectable goal. When it is selected, show the AUC estimate (pre-HD × ~27, or the site regression) and warn if the estimate is > 600 with residual function present. Do not offer **20–25** as a stand-alone goal; if an institution insists, provide it as a configurable range with the same warning.

**Confidence.** Moderate.

**Institutional choice.** Whether to expose 15–25 or 20–25. Which indications unlock it.

---

## 4. Residual renal function add-on (+200 mg at 5, +400 mg at 10 mL/min)

**Source search.** No published source was found in PubMed or on the web for this exact rule (searched for "residual" plus vancomycin plus hemodialysis plus mg increments). Taylor 2010 and Crew 2015 [V] name residual function as a reason for underdosing but give no number. It is probably the site author's own rule.

**Derivation that reproduces it [D]**
- Matzke 1984 (verified in `lit/vancomycin.md`): CL_vanco (mL/min) = 3.66 + **0.689·CrCl**. Each mL/min of residual CrCl adds 0.689 mL/min = **0.0413 L/h** of vancomycin clearance.
- Extra drug removed over a 48 h interdialytic period at an average concentration of 20 mg/L: 0.0413 × 48 × 20 = **39.7 mg per mL/min**.
  - 5 mL/min → **198 mg**.
  - 10 mL/min → **397 mg**.
- This matches the site rule almost exactly. The rule is therefore linear in CrCl.
  - Use ×1.5 for the 72 h gap.
  - At C_avg 15–17.5 the factor is about 30–35 mg per mL/min.

**RECOMMENDED DEFAULT.** **Interpolate linearly** rather than stepping: add-on (mg) = 0.0413 × CrCl_resid × T_gap(h) × C_target_avg (default 20).
- This gives about 40 mg/(mL/min) per 48 h. Round only the final total dose to 250 mg.
- Apply the add-on to the 10 mg/kg (or flat) base.
- Above a residual CrCl of about 15 mL/min, show a "not ESRD-like; use the standard renal model" warning [proposal].
- The Goti model (DIAL = 1) or the HD PK estimator can absorb residual CL directly. Prefer that path when levels are available.

**Alternatives.** The site's two-step rule (0 / +200 / +400), for parity. Use urine output instead of CrCl when no timed urine collection is available (> 100 mL/day suggests clinically relevant residual function [R]).

**Confidence.** Low. The rule is derivation-based, though it is consistent with Matzke.

**Institutional choice.** Whether to apply the add-on at all. The CrCl source (timed urine collection vs estimate). C_target_avg.

---

## 5. Vd in obesity; LD cap 3 g vs 4 g

**Vd evidence**
- Rybak 2020 (verified previously): about 0.5 L/kg in obese adults and 0.32 in morbid obesity, vs 0.68 at normal weight.
- **Adane 2015** (verified previously; BMI ≥ 40, median 148 kg): **0.51 L/kg TBW**. The Adane model uses V = 0.51·WT with ω_V² 0.0713 [V-code].
- **Dunn RD et al.** *AJHP* 2019;76(24):2013-8. PMID 31630155. doi:10.1093/ajhp/zxz241 [V abstract]: class III obesity, n = 241. Mean V 72.4 L (BMI 40–49.9) vs 79.3 L (BMI ≥ 50). Body size poorly predicts V (R² < 0.20). A **fixed 75 L** or **0.52 L/kg TBW** gave similar bias.
- **Smit C et al.** *Br J Clin Pharmacol* 2020;86(2):303-17. PMID 31661553. doi:10.1111/bcp.14144 [V abstract]: peripheral V and CL increased with TBW; central V did not. Recommends 35 mg/kg/day, max 5500 mg/day.
- **Hughes MA et al.** *Ther Drug Monit* 2024;46(5):575-83. PMID 38758633. doi:10.1097/FTD.0000000000001214 [V abstract; V-code]: BMI ≥ 40. V scales with Janmahasatian FFM: V1 = 64.3·FFM/70, V2 = 59.0·FFM/70. CL uses CG with FFM.
- **Crass RL et al.** *JAC* 2018;73(11):3081-6. PMID 30203073. doi:10.1093/jac/dky310 [V abstract]: > 4500 mg/day was not needed.
- No published **TBW cap** for Vd was found. Dunn's finding of a near-constant 72–79 L above BMI 40 is the nearest thing to a plateau.

**LD cap evidence**
- Rybak 2020 (verified previously): obese LD 20–25 mg/kg, max 3000 mg.
- Stanford 2023 [I]: 20–35 mg/kg TBW, **max 3 g**; obese "modified" load 20–25 mg/kg.
- **Payne W et al.** *Cureus* 2024;16(10):e70849. PMID 39493211. doi:10.7759/cureus.70849 (NCT02764359) [V abstract]: randomized, > 100 kg, 20 mg/kg capped at **2 g vs 4 g** (n = 33/34). The 4 g group had a higher post-load peak (30.9 vs 23.9) with no excess short-term renal harm. Small, single-centre, short follow-up.
- No study comparing a 3 g with a 4 g cap was found.

**RECOMMENDED DEFAULT**
- Vd: **0.65 L/kg TBW for BMI < 30** (site) and **0.5 L/kg TBW for BMI ≥ 30**. Apply no TBW cap, but warn when TBW > 200 kg, and offer "fixed 75 L (Dunn)" when BMI ≥ 40.
- LD: 20–25 mg/kg TBW when BMI ≥ 30, **cap 3000 mg**.
- For Bayesian use in BMI ≥ 40, offer Adane (1-comp) or Hughes (2-comp, FFM) as the prior instead of the site model.

**Alternatives.** LD cap 4000 mg (Payne 2024) behind a toggle for critically ill patients > 120 kg. Vd 0.52 L/kg (Dunn) instead of 0.5; the difference is immaterial.

**Confidence.** Moderate for Vd 0.5. Moderate for the 3 g cap (guideline). Low for 4 g.

**Institutional choice.** The BMI threshold (30 vs 35/40). The cap value. Whether to allow the 4 g option.

---

## 6. Bayesian priors for 1-compartment MAP

Published IIV and residual error for models used by validated MIPD tools. The %CV column is √ω² as conventionally reported; the true log-normal CV is √(e^ω² − 1).

| Model (cmt) | CL IIV | V IIV | Other | Residual error | Source |
|---|---|---|---|---|---|
| **Buelga 2005** (1) CL = 1.08·CrCl (L/h); V = 0.98 L/kg TBW | **28.2%** (ω² 0.0793) | **37.2%** (ω² 0.138) | r(CL,V) assumed 0.25 by InsightRX | **Additive 3.52 mg/L** | *AAC* 2005;49:4934-41, PMID 16304155, doi:10.1128/AAC.49.12.4934-4941.2005 [V abstract for CV; V-code for σ] |
| **Adane 2015** (1), BMI ≥ 40 | 23.9% (ω² 0.0571) | 26.7% (ω² 0.0713) | — | **Proportional 18.9%** | PMID 25644478 [V-code] |
| **Thomson 2009** (2), CL 2.99·(1 + 0.0154·(CrCl − 66)) | 27% (ω² 0.0729) | V1 15% (0.0225) | Q 49%, V2 130%; cov(CL,V1) 0.01 | **15% + 1.6 mg/L** | *JAC* 2009;63:1050-7, PMID 19299472, doi:10.1093/jac/dkp085 [V abstract; V-code] |
| **Goti 2018** (2) | 39.8% (ω² 0.1584) | V1 81.6% (0.6659) | V2 57.1% (0.326) | Published 22.7% + 3.4 mg/L. InsightRX uses **19.7% + 1.42 mg/L** "to improve MAP estimation stability" | §7 |
| **Hughes 2024** (2), FFM, BMI ≥ 40 | 21.8% (ω² 0.0473) | V1 18% (0.0322) | V2 80% (0.635), with covariances | 13.3% + 0.001 | PMID 38758633 [V-code] |
| **Carreno 2017** (2), 110–250 kg | ω² 0.206 (on V) … | — | — | 10% + 0.1 | PMC5404576 [V-code] |

- **Rodvold 1988**: it gives regression dosing, not a popPK Ω/σ. Not usable as a MAP prior source [R].
- **DoseMeRx**: no published model file or parameter set was located this session. Do not cite DoseMeRx priors.
- **InsightRX model selection**: the published InsightRX evaluations used "modified Goti", later switched to "capped Thomson" (CrCl ≤ 150) for BMI < 40 and Hughes for BMI ≥ 40. *JAC-AMR* 2026;8(1):dlag016. PMID 41710913. doi:10.1093/jacamr/dlag016 [V full text]. Capped Thomson gave higher AUC target attainment.

**Synthesis.**
- One-compartment CL IIV clusters at **24–28%**, and V IIV at **27–37%**.
- Residual error in usable MAP implementations is **13–20% proportional plus 0–3.5 mg/L additive**.
- InsightRX deliberately shrank Goti's large additive error.

**RECOMMENDED DEFAULT** (site 1-comp model):
- Log-normal ω_CL = 0.30 and ω_V = 0.30 (ω² ≈ 0.09 each). Optional correlation 0.25.
- Residual error combined: σ² = (0.15·Ĉ)² + 1.5², on the **predicted** concentration.
- This tightens the earlier proposal of ω_CL 0.35 to fit the 24–28% cluster. Either value is defensible.
- Ship Buelga, Adane and Thomson (capped) as selectable published priors, using their own Ω and σ.

**Alternatives.** Site parity mode (normal, CV 0.3, assay CV 0.1 on the observed value).

**Confidence.** Moderate.

**Institutional choice.** The default model per population: site model vs capped Thomson vs Goti for BMI < 40; Adane vs Hughes for BMI ≥ 40.

---

## 7. Goti 2018: primary paper and 2019 erratum

**Access.** The primary paper (PMID 29470227, doi:10.1097/FTD.0000000000000490) and the erratum (*Ther Drug Monit* 2019;41(4):549, **PMID 31306395, doi:10.1097/FTD.0000000000000666**) are both paywalled; the LWW site returned HTTP 402. Neither was read. Parameters were cross-checked against two independent secondary reproductions plus the InsightRX code.

| Parameter | Value | Agreement |
|---|---|---|
| CL (L/h) | 4.5 · (CrCl/120)^0.8 · 0.7^DIAL | CTS 2023 Table [V2] = InsightRX [V-code] = Mena 2023 |
| CrCl | Cockcroft-Gault with **TBW** (WT), ×0.85 female, **capped 150 mL/min** | [V-code]. The earlier file had "weight not verified": it is TBW |
| SCr rounding | SCr set to 1.0 if **age > 65** and SCr < 1.0 | [V-code]. InsightRX comment: the original paper said **age > 60**; the **erratum changed it to > 65**. The erratum text itself was not read |
| V1 (L) | 58.4 · (TBW/70) · 0.5^DIAL | [V2] = [V-code] |
| V2 (L) | 38.4 fixed | [V2] = [V-code] |
| Q (L/h) | 6.5, no IIV | [V2] = [V-code] |
| IIV (ω²) | CL 0.1584, V1 0.6659, V2 0.326, diagonal (no covariance) | √ = 39.8 / 81.6 / 57.1% matches the published "%CV" [V2]. True log-normal CV is 41.4 / 97.3 / 62.1% [D] |
| Residual error | 22.7% proportional + 3.4 mg/L additive (published) | CTS 2023 [V2]; InsightRX quotes the same as the original values |
| Data | n = 1812, 2765 samples, age 57 (17–101), weight 79 (33–255) kg, CrCl 62 (4–150) | CTS 2023 [V2] |

**Related evidence**
- Tong DMH, Hughes JH, Keizer RJ. *Ther Drug Monit* 2021;43(1):139-40. PMID 33009289. doi:10.1097/FTD.0000000000000819 [V metadata]: "Use of age-adjusted serum creatinine in a vancomycin PK model decreases predictive performance in elderly patients." This is the "modified Goti" (`pk_vanco_tong`), identical except that the SCr rounding is removed.
- External validations: Broeker 2019 *Clin Microbiol Infect* 25:1286.e1-7, PMID 30872102, doi:10.1016/j.cmi.2019.02.029 [V abstract] (best of 31 models). Duong 2024 *Pharmacotherapy* 44:425-34, PMID 38803279, doi:10.1002/phar.2941 [V abstract] (best of 8).

**RECOMMENDED DEFAULT.** Implement Goti exactly as tabled, with **SCr rounding OFF by default** (modified Goti/Tong), the option "original (age > 65, per erratum)", and Ω as ω² values. The residual default is 19.7% + 1.42 mg/L (InsightRX MAP-stable); "published 22.7% + 3.4" is an option.

**Confidence.** Moderate–high for the parameters. **The erratum's exact content is still unverified at source.** One remaining action: read the erratum (one page) through institutional access.

---

## 8. EID default dose: 7 vs 5 mg/kg gent/tobra; amikacin 15 vs 20–30 mg/kg

**Evidence**
- **CLSI M100-Ed33 (2023)**: breakpoints assume gent/tobra **7 mg/kg q24h** and amikacin **15 mg/kg q24h**. Verified previously via the FDA STIC page. CLSI's sample document lists the same dosing basis [V2].
- **EUCAST** rationale/guidance (Amikacin Rationale v3.1, Sept 2024 [V]; EUCAST AG guidance document [V]):
  - Breakpoints assume gent/tobra **6–7 mg/kg/day** and amikacin **25–30 mg/kg/day** (q24h), "initial doses in seriously ill patients prior to TDM".
  - EUCAST notes that practice is often 15–20 mg/kg amikacin and calls this inadequate.
  - It recommends combination therapy for systemic infection and lean-type body weight for dosing.
- **Taccone FS et al.** *Crit Care* 2010;14:R53. PMID 20370907. doi:10.1186/cc8945 [V abstract]: severe sepsis/shock, amikacin **25 mg/kg TBW**. Peak > 64 in 70%. Vd 0.41 L/kg. Concludes ≥ 25 mg/kg is required.
- **de Montmollin E et al.** *Intensive Care Med* 2014;40:998-1005. PMID 24687298. doi:10.1007/s00134-014-3276-x [V abstract]: ICU, 25 mg/kg TBW. Cmax 69; 33% < 60. Positive fluid balance predicted underexposure.
- **Abdul-Aziz MH et al.** *Intensive Care Med* 2020;46:1127-53. PMID 32383061. PMC7223855 [V full text]: "High, single-dose, extended-interval dosing should be used". Higher-than-standard doses may be needed in critical illness. Routine TDM.
- **Labels** [V, Pfizer gentamicin label rev 10/2022]: 3 mg/kg/day (up to 5) in divided doses. The US amikacin label caps at 15 mg/kg/day (verified previously). EID at 7 mg/kg and amikacin 25 mg/kg are off-label.

**RECOMMENDED DEFAULT**
- Gent/tobra EID **7 mg/kg** of dosing weight. Option of 5 mg/kg for cystitis/UTI, MIC ≤ 1 with combination therapy, or the site parity mode.
- Amikacin: **15 mg/kg** standard EID. Preset **"critically ill / septic shock / P. aeruginosa / MIC ≥ 8": 25 mg/kg** (configurable to 30) for the first dose, with mandatory TDM.

**Weight conflict to resolve.** Taccone and de Montmollin used **TBW**, while the suite uses AdjBW (dosing weight) when TBW > IBW. In non-obese septic patients these coincide. In obese patients follow the dosing-weight rule from `lit/aminoglycosides-renal.md` R3. This is flagged rather than resolved.

**Confidence.** Moderate–high for 7 mg/kg. Moderate for amikacin 25 mg/kg in sepsis.

**Institutional choice.** Whether to adopt the EUCAST 25–30 amikacin standard for all systemic use. Whether to keep 15 mg/kg (CLSI/label) as the default.

---

## 9. Trough targets: EID and traditional dosing

**EID evidence**
- **Abdul-Aziz 2020** Table [V full text]:
  - C_min target: **amikacin < 2.5 mg/L; gentamicin/tobramycin < 0.5 mg/L**.
  - Toxicity thresholds: amikacin C_min > 5, gent/tobra C_min > 1.
  - AUC monitoring: 2 samples (30 min post-infusion and 6–22 h); AUC 80–120 mg·h/L; Cmax/MIC ≥ 8–10.
- Site values: < 0.3 (5 mg/kg), < 0.5 (7 mg/kg), amikacin < 1 (protocol < 0.9).
- tl;dr pharmacy (non-peer-reviewed) gives gent/tobra < 1 and amikacin < 4 [I-grade web].

**Traditional dosing evidence**
- Gentamicin label [V]: avoid prolonged peaks > 12 and troughs > 2 mcg/mL.
- Amikacin label (verified previously plus [V2]): avoid peak > 35 and trough > 10.
- Cmax/MIC ≥ 8–10 (Moore 1987; Kashuba 1999; verified previously).

**RECOMMENDED DEFAULT**

| Regimen | Peak (mg/L) | Trough (mg/L) |
|---|---|---|
| EID gent/tobra | ≥ 10 × MIC; otherwise ~20 (5 mg/kg) / 25–30 (7 mg/kg) | **< 0.5** (alert at ≥ 1) |
| EID amikacin | ≥ 8–10 × MIC; otherwise 50–60 (15 mg/kg), ≥ 60–80 (25 mg/kg) | **< 2.5** (option: strict < 1, site). Alert at ≥ 5 |
| Traditional gent/tobra | UTI/low burden 4–6; moderate (SSTI, intra-abdominal) 6–8; serious (pneumonia, sepsis, Pseudomonas) 8–10 [R, textbook convention]; or 8–10 × MIC | **< 1** (alert > 2, label) |
| Traditional amikacin | Moderate 20–25; serious 25–30 [R]; or 8–10 × MIC | **< 5** (alert > 10, label) |
| Gentamicin synergy (Gram-positive endocarditis) | 3–4 | < 1 [R, AHA 2015 recalled, not verified] |

**Confidence.** Moderate for the EID troughs (Abdul-Aziz position paper). Low–moderate for the traditional peak-by-indication bands ([R], textbook convention).

**Institutional choice.** Amikacin EID < 1 vs < 2.5. Traditional trough < 1 vs < 2. Whether synergy targets are shown at all.

---

## 10. Hartford nomogram coordinates (Nicolau 1995)

**Status: not obtained.**
- Nicolau DP et al. *AAC* 1995;39(3):650-5. PMID 7793867. PMC162599. The figure is only in the scanned PDF.
- Europe PMC and PMC served Cloudflare or cookie challenges, which I did not bypass.
- The in-app browser had no free tab.
- No accessible reproduction states the line coordinates numerically. Checked: ClinCalc, revisemrcem (states only "based on Nicolau et al. (1995)"), and several hospital protocols.

**What is known (secondary only)**
- 7 mg/kg dose.
- Single random level **6–14 h after the start** of infusion (revisemrcem and tl;dr pharmacy [I-grade web]; ClinCalc, verified previously).
- Three regions: q24h / q36h / q48h. Above the q48h line → switch to traditional dosing.
- One non-peer-reviewed source (tl;dr pharmacy) says "above the nomogram" means > 13 mcg/mL at 6 h or > 6 mcg/mL at 14 h. **Unverified; do not code it.**
- Amikacin: some protocols plot the level ÷ 2 on the gentamicin nomogram [I-grade web, unverified].

**RECOMMENDED DEFAULT.** Do **not** ship a numeric Hartford nomogram yet.
- The default EID path is the individualised 1- or 2-level fit already recommended in `lit/aminoglycosides-renal.md` E7.
- To add Hartford, someone with library access should digitise Fig. 1 of Nicolau 1995 (PMC scan) and record start-of-infusion time zero.
- A model-derived "Hartford-like" curve set (7 mg/kg, Vd 0.3 L/kg) is possible [D], but it must not be labelled "Hartford".

**Confidence.** — (open item).

---

## References (new in this file; references already verified in `lit/*.md` are cited inline only)

Vancomycin HD
1. Lewis SJ, Mueller BA. *J Clin Pharmacol* 2021;61(2):211-23. PMID 32851685. https://doi.org/10.1002/jcph.1727
2. Lewis SJ, Jang SM, Mueller BA. *BMC Nephrol* 2023;24:270. PMID 37710245. https://doi.org/10.1186/s12882-023-03314-y
3. Zelenitsky SA, Ariano RE, McCrae ML, Vercaigne LM. *Clin Infect Dis* 2012;55(4):527-33. PMID 22573855. https://doi.org/10.1093/cid/cis458
4. Zelenitsky SA, Ariano RE. *Am J Health Syst Pharm* 2022;79(12):1006-10. PMID 35234825. https://doi.org/10.1093/ajhp/zxac066
5. Maxson R, Pate J, Starr J. *Ren Fail* 2016;38(10):1677-82. PMID 27756193. https://doi.org/10.1080/0886022X.2016.1229992
6. Sun et al. Validation of a weight threshold-based vancomycin dosing protocol for IHD. *Can J Hosp Pharm* 2019;72(5):369-76. PMID 31692636. PMC6799958. https://cjhp-online.ca/index.php/cjhp/article/download/2930/4043?inline=1
7. Taylor ME, Allon M. *Am J Kidney Dis* 2010;55(6):1163-5. PMID 20497837. https://doi.org/10.1053/j.ajkd.2010.03.016
8. El Nekidy WS, El-Masri MM, Umstead GS, Dehoorne-Smith M. *Can J Hosp Pharm* 2016;69(5):341-7. https://cjhp-online.ca/index.php/cjhp/article/view/1588
9. El Nekidy WS, Cha R, Ghazi IM. *Clin Nephrol* 2022;97(2):111-20. PMID 34958297. https://doi.org/10.5414/CN110664
10. Soto Guerrero Y et al. *Bol Asoc Med P R* 2012;104(3):10-4. PMID 23156886
11. Panais R et al. *J Nephrol* 2010;23(5):569-74. PMID 20540035
12. Ho E et al. *Nephrology* 2023;28(4):227-33. PMID 36651874. https://doi.org/10.1111/nep.14144
13. Gunning H et al. *Ir Med J* 2016;109(9):465. PMID 28125179
14. Mahmoud LB et al. *Clin Nephrol* 2017;88(10):198-204. PMID 28793955. https://doi.org/10.5414/CN109091
15. Kambe M et al. *Antibiotics* 2026;15(1):47. PMID 41594084. https://doi.org/10.3390/antibiotics15010047
16. Ables M, Welch RW, Walley B. *J Pharm Pract* 2023;37(4):922-6. PMID 37715731. https://doi.org/10.1177/08971900231198927
17. Martin J et al. *Clin Ther* 2025;47(4):e1-e7. PMID 39875240. https://doi.org/10.1016/j.clinthera.2025.01.001 (72 h gap → more sub-therapeutic levels)
18. Rambaran KA, Alzghari SK, Seifert CF. *Cureus* 2018;10(7):e2917. https://doi.org/10.7759/cureus.2917 (secondary source for the Vandecasteele pre-HD↔AUC mapping)
19. Vandecasteele SJ, De Bacquer D, De Vriese AS. *Clin Infect Dis* 2011;53(2):124-9. PMID 21690618. https://doi.org/10.1093/cid/cir337 (dose calculator; no abstract; formula **not read**)
20. Nebraska Medicine/UNMC. Nephrology Preferred Dosing Strategy: Adult HD Patients Receiving Vancomycin, updated 3/2024 [I].
21. Stanford Health Care. SHC Vancomycin Dosing Guide, rev. 02/22/2023, §F [I].

Vancomycin obesity and priors
22. Dunn RD, Crass RL, Hong J, Pai MP, Krop LC. *AJHP* 2019;76(24):2013-8. PMID 31630155. https://doi.org/10.1093/ajhp/zxz241
23. Crass RL et al. *J Antimicrob Chemother* 2018;73(11):3081-6. PMID 30203073. https://doi.org/10.1093/jac/dky310
24. Smit C et al. *Br J Clin Pharmacol* 2020;86(2):303-17. PMID 31661553. https://doi.org/10.1111/bcp.14144
25. Hughes MA et al. *Ther Drug Monit* 2024;46(5):575-83. PMID 38758633. https://doi.org/10.1097/FTD.0000000000001214
26. Payne W, Thompson S, Burton BN. *Cureus* 2024;16(10):e70849. PMID 39493211. https://doi.org/10.7759/cureus.70849
27. Buelga DS et al. *Antimicrob Agents Chemother* 2005;49(12):4934-41. PMID 16304155. https://doi.org/10.1128/AAC.49.12.4934-4941.2005
28. Thomson AH et al. *J Antimicrob Chemother* 2009;63(5):1050-7. PMID 19299472. https://doi.org/10.1093/jac/dkp085
29. Goti V et al. *Ther Drug Monit* 2018;40(2):212-21. PMID 29470227. https://doi.org/10.1097/FTD.0000000000000490. **Erratum**: *Ther Drug Monit* 2019;41(4):549. PMID 31306395. https://doi.org/10.1097/FTD.0000000000000666 (not read)
30. Tong DMH, Hughes JH, Keizer RJ. *Ther Drug Monit* 2021;43(1):139-40. PMID 33009289. https://doi.org/10.1097/FTD.0000000000000819
31. Oda K et al. *Clin Transl Sci* 2023. PMC10651648. https://doi.org/10.1111/cts.13626 (Goti parameter table)
32. Vancomycin target attainment improved following popPK model switch. *JAC-AMR* 2026;8(1):dlag016. PMID 41710913. https://doi.org/10.1093/jacamr/dlag016
33. Broeker A et al. *Clin Microbiol Infect* 2019;25(10):1286.e1-7. PMID 30872102. https://doi.org/10.1016/j.cmi.2019.02.029
34. Duong A et al. *Pharmacotherapy* 2024;44(6):425-34. PMID 38803279. https://doi.org/10.1002/phar.2941
35. InsightRX PKPDsim model library (pk_vanco_goti, _tong, _buelga, _thomson, _thomson_capped, _adane, _hughes, _carreno). https://github.com/InsightRX/PKPDsim/tree/master/inst/models

Aminoglycosides
36. Taccone FS et al. *Crit Care* 2010;14(2):R53. PMID 20370907. https://doi.org/10.1186/cc8945
37. de Montmollin E et al. *Intensive Care Med* 2014;40(7):998-1005. PMID 24687298. https://doi.org/10.1007/s00134-014-3276-x
38. Abdul-Aziz MH et al. *Intensive Care Med* 2020;46(6):1127-53. PMID 32383061. PMC7223855. https://doi.org/10.1007/s00134-020-06050-1 (AG TDM table read this session)
39. EUCAST. Amikacin: Rationale for EUCAST Clinical Breakpoints, v3.1, Sept 2024. https://www.eucast.org/fileadmin/eucast/pdf/rationale_documents/bacteria/Amikacin_Rationale_Document_v_3.1_20240901.pdf
40. EUCAST. Guidance document on aminoglycoside breakpoints (Breakpoint Tables v10.0 era). Copy read at https://ugc.futurelearn.com/uploads/files/94/38/94385d72-c496-4b55-9311-5d37797270a3/EUCAST_aminoglycoside_guidance_document.pdf (third-party host; the canonical EUCAST URL was not located)
41. Pfizer. Gentamicin sulfate injection USPI, rev. 10/2022. https://labeling.pfizer.com/ShowLabeling.aspx?id=4470
42. Nicolau DP et al. *AAC* 1995;39(3):650-5. PMID 7793867. PMC162599 (figure not accessed)

**Not verified [R]:** textbook traditional peak bands by indication; AHA 2015 synergy gentamicin targets; urine output > 100 mL/day as a marker of residual function; the Rodvold 1988 IIV; DoseMeRx model parameters; the Hartford line coordinates.

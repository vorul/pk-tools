# Sign-off decisions: research summary (2026-10-23)

**Applied 2026-10-23.** Every row below is in the tools' Literature model (the default). Site models are unchanged. At that point the suite passed 714/714 tests, and every page loaded in the browser with no errors. Where the builders deviated from or went beyond a row, it is noted under "Applied with notes" at the end.

Evidence, citations and the alternatives for each item are in `decisions/*.md`. Confidence: **H** high, **M** moderate, **L** low.
"Change" means the built tool's current default differs from the recommendation. "Institutional" means local P&T must set it; the tool keeps it as a labelled setting.

## Renal function and body size (`decisions/renal-body.md`)
| Question | Recommended default | Conf. | Change to build |
|---|---|---|---|
| Obesity trigger for adjusted BW in CG | TBW > 1.2×IBW; 1.3× and BMI ≥ 30 as options | M | none |
| Adjusted-weight factor | 0.4 (0.3 option); at BMI ≥ 40 also show CG with Janmahasatian LBW | M / L-M | renal-hepatic: label the LBW row as a comparison |
| SCr floor | Off. Aminoglycoside tool also shows a 0.8-floor value. SCI: no floor plus a warning (optional CG × 0.8) | M-H | renal-hepatic: remove the 0.5 SCI floor |
| Children 1–<18 y | CKiD U25; bedside Schwartz 0.413 option; original Schwartz only for Jaffe SCr | M | renal-hepatic: switch from original Schwartz |
| Two SCr values | Chow default, kinetic eGFR (Chen 2013) as cross-check, "get levels" banner | L | add kinetic eGFR |
| Units | Compute absolute mL/min; compare to each label in that label's units | H | acyclovir (see below) |
| lb → kg | × 0.45359237 exactly; round for display only | H | infusion literature mode, pkcore check |

## Vancomycin and aminoglycosides (`decisions/vancomycin-aminoglycosides.md`)
| Question | Recommended default | Conf. | Change to build |
|---|---|---|---|
| High-flux HD maintenance | 10 mg/kg TBW post-HD, rounded to 250 mg; flat 750 and tiers as options | M (floor 500 / cap 1500: L) | vancomycin-hd: default was flat 750 |
| Pre-HD level adjustment | <10: 10–15 mg/kg now, then +250–500 · 10–15: +250 · 15–20: none · 20–25: −250 · >25: hold, recheck, resume 250–500 lower; proportional estimate alongside | L-M | vancomycin-hd: replaces the "proposed" placeholders |
| Pre-HD goal | 15–20 default; labelled 15–25 option for severe infection | M | add option |
| Residual-function add-on | Linear, ~40 mg per mL/min per 48 h, ×1.5 for a 72 h gap | L | vancomycin-hd: was stepped +200/+400 |
| Obese Vd | 0.5 L/kg TBW at BMI ≥ 30, no TBW cap (warn > 200 kg); LD cap 3 g (4 g option) | M | vancomycin-hd charts: still 0.65 |
| MAP priors | Log-normal, IIV 0.30 CL and V; residual 15% + 1.5 mg/L on predicted | M | vancomycin: was 35/30 % |
| Goti 2018 | Confirmed; CG on TBW capped 150; elderly SCr rounding default off | M-H | none |
| Extended-interval dose | Gent/tobra 7 mg/kg (5 option); amikacin 15, with a 25 mg/kg ICU/septic-shock preset | M-H | aminoglycosides: add amikacin preset |
| Troughs | Extended-interval: gent/tobra < 0.5, amikacin < 2.5 (< 1 option). Traditional: < 1 / < 5 | M | aminoglycosides: amikacin EI was < 1 |
| Hartford nomogram | Don't ship numeric lines until Nicolau 1995 Fig. 1 is digitised | — | aminoglycosides: hide or keep as an illustration only |

## Digoxin and theophylline (`decisions/digoxin-theophylline.md`)
| Question | Recommended default | Conf. | Change to build |
|---|---|---|---|
| Digoxin targets | AF "< 1.2 ng/mL"; HF 0.5–0.9, aim 0.7 | H / M | none |
| Vd equation | Reuning 3.8·Wt + 3.1·CrCl (Winter); Sheiner CL; hide Paulson–Welling | H | digoxin: literature default was Jusko |
| CHF input | Yes / No / Unknown; Unknown uses the CHF equation; no extra ×0.4 | M | digoxin: add Unknown |
| Interactions | Amiodarone 0.5, quinidine 0.5 (V 0.7), verapamil 0.6, dronedarone 0.4, propafenone 0.6, itraconazole 0.55, clarithromycin 0.6; thyroid ±30% | M | add clarithromycin |
| Digoxin priors / absorption | Log-normal CV 35%; residual 0.15 ng/mL + 10%; ka 1.6 h⁻¹; exclude levels < 6 h after oral or < 4 h after IV | L-M / M | digoxin: priors, absorption model |
| Theophylline pediatric CL | 0.08 / 0.07 / 0.05 / 0.04 L/kg/h (matches label Table V, same as site); cap < 45 kg at 12–14 mg/kg/day, max 300 | H | theophylline: literature used 0.10/0.09/0.055 |
| Elderly > 60 | 0.028 L/kg/h, cap 400 mg/day | M | was 0.025 |
| Aminophylline S | 0.79 (all US injections); 0.86 bulk anhydrous only; drop 0.84 | H (US) | none in literature mode |
| Multipliers | Smoking ×1.4 (12–16 y), ×1.5 (16–60 y), ×1.8 (> 60 y); CHF 0.5; CF 1.5; fever 0.6; pulmonary edema 0.5; propranolol 0.5; rifampin 1.4; fluvoxamine 0.33; flu vaccine 1.0 | M | smoking, fever, fluvoxamine |
| SR sampling | At the product's peak (IR 1–2 h; 12-h ER 12 h after evening or 9 h after morning dose; Theo-24 12 h); never trough | H | wording |

## Lithium, phenobarbital and phenytoin (`decisions/lithium-phenobarb-phenytoin.md`)
| Question | Recommended default | Conf. | Change to build |
|---|---|---|---|
| Phenytoin, dialysis / CrCl < 10 | Soriano C/(0.2·Alb + 0.1), capped at 1, with a mandatory free-level banner. CrCl 10–25 not on dialysis: standard correction plus a free level. Legacy 0.1·Alb + 0.1 is an option only (over-predicts free fraction 75–200%). | M (0.2 itself: L-M) | none, already built this way |
| Albumin coefficient | Anderson 0.25; Kane 2013 0.29 for ICU; cap factor at 1 | M / M-H | none |
| Elderly Vmax | 6.0 mg/kg/day at 60–79 y; ≥ 80 y keep 6.0, flagged | H / L | none |
| Graves-Cloyd | Graves 1986 (PMID 3824428): Dnew = Dold·(Cnew/Cold)^0.2; round up | H | update the source tag |
| Single-level method | One-level Bayesian primary; Km 4 (Winter) as cross-check | M | phenytoin: Adjust default was Km 4 |
| Lithium dosing weight | CL 0.25·CrCl; V 0.7 L/kg TBW, IBW in obesity | L-M | lithium: was FFM |
| Lithium targets | 12-h 0.6–0.8; Nolen 2019 elderly bands | H | none |
| Lithium interactions | Thiazide 0.75 (0.5 option), ACEi 0.75, ARB 0.75 flagged, NSAID 0.8 (indomethacin 0.7), loop: warning only | M-L | lithium: was 0.5 / 0.5 / 0.5 / 0.7 |
| Lithium SR F | 1 | M | none |
| Phenobarbital CL | Adult 0.004; elderly 0.0032; child 0.008; neonate 0.0047 with V 0.96 | M | phenobarbital: elderly, child, neonate values |
| Phenobarbital target | 10–40 mg/L (Patsalos 2018) | H | was 15–40 |
| Valproate | CL −25% per 1 g/day, floor 0.5 | M | minor |
| Rectal | S 0.91 × F 0.9 | M-H | none |

## Acyclovir and infusions (`decisions/acyclovir-infusions.md`)
| Question | Recommended default | Conf. | Change to build |
|---|---|---|---|
| Acyclovir obesity weight | Adjusted BW (0.4) when TBW > 1.2×IBW or BMI ≥ 30; never TBW in obesity; one-click IBW (label) | M | acyclovir: was IBW |
| Renal bands | Compare in label units (per 1.73 m²), show absolute alongside, warn when the bands differ | M | acyclovir: was absolute |
| CRRT / HD / PD | CRRT 10 mg/kg q12h (CNS, VZV, severe), else 5–7.5 mg/kg q24h. HD 2.5–5 mg/kg q24h, dose after HD. PD 50% q24h | L-M / M / M | acyclovir: CRRT, HD |
| HSV / VZV encephalitis | HSV 10 mg/kg q8h for 14–21 d (H); VZV 10 mg/kg (15 option) for 10–14 d (M) | H / M | VZV default |
| Blum CL | Display only, flagged | L-M | none |
| Hard maxima | From labels (H): dopamine 50, esmolol 300, dobutamine 40, epinephrine 2 mcg/kg/min; milrinone 0.75; nicardipine and diltiazem 15 mg/h; vasopressin 0.1 units/min; amiodarone 1 mg/min. **Institutional (L):** heparin 35 units/kg/h or 2,500 units/h, insulin 30 units/h, nitroglycerin 400, norepinephrine 3, propofol 80. Labetalol 8 mg/min (M-L). Phenylephrine unresolved. | mixed | infusion-rate: update the table |
| Procainamide load | 17 mg/kg hard stop, soft alert > 1 g, 20 mg/min default, 50 mg/min max | M | update |
| Labetalol | mg/min at 1 or 5 mg/mL | H | none |
| Argatroban | EU Novastan two-track aPTT table; 1.5–3× baseline, ≤ 100 s, max 10 mcg/kg/min | M-H | infusion-rate: replace the institutional table |
| Availability | Remove fenoldopam, nesiritide, abciximab | H | remove fenoldopam |

## Applied with notes (builder choices to confirm)
- **Phenobarbital elderly:** CL 0.0032 applies above 65 y. The decisions file says ≥ 65.
- **Phenobarbital children:** kept finer bands (infant 0.006; 12–14 y 0.006; 15–18 y 0.005) with verify badges around the approved child value of 0.008.
- **Theophylline smoking:** no adjustment at 12 y or under (the label table has none).
- **Vancomycin Goti residual:** default 19.7% + 1.42 mg/L (from the decisions file); the published 22.7% + 3.4 is an option.
- **Vancomycin-HD:** intradialytic maintenance is 12.5 mg/kg with the same 500/1500 floor and cap. The proportional estimate is bounded ±50%.
- **Lithium:** combined interaction factor floored at 0.4. CrCl uses the suite renal policy (1.2×IBW trigger).
- **Aminoglycosides:** critical alerts at trough ≥ 1 / ≥ 5 (extended interval) and > 2 / > 10 (traditional). The SCI 0.5 floor option was removed.
- **Renal-hepatic:** CG × 0.8 for SCI applies to CG only, not Chow. Kinetic eGFR is anchored to CG at the earlier SCr.
- **Phenytoin:** a new "CrCl < 10, not on dialysis" option uses Soriano. The free level becomes required at CrCl 10–25 when Alb < 3.5. At ≥ 80 y, the prior CV is ≥ 0.35.
- **Infusions:**
  - procainamide load uses weight capped at 100 kg;
  - heparin also hard-stops above 2,500 units/h;
  - propofol warns above 66.7 mcg/kg/min;
  - phenylephrine keeps a provisional 6 mcg/kg/min hard stop pending sign-off.

## Workbook findings applied 2026-10-24 (`workbook-checks/*.md`, private research repo)
The site's Excel workbooks were downloaded on 2026-10-23 and read as text; no macros were run. Changes:
- **Library:** `PK.body.peckLBW` now returns kg. It had returned the pound polynomial. It uses the exact pound, which is 0.2% from the workbook's ÷ 2.2. It is tested against the workbook's 32 saved values.
- **Phenobarbital Site:**
  - uses the workbook's dosing-table clearances (MD ÷ 480), not the page list;
  - valproate ×0.75 at 1 g/day;
  - fit defaults reproduce the workbook's Bayesian fit.
- **Phenobarbital, both models:** "days to hold doses" output; a level drawn before the first dose can be used.
- **Acyclovir Site:** V = 48 L/1.73 m² × BSA, so all 70 renal-grid cells match. Literature keeps 0.6 L/kg as default, with 48 L/1.73 m² as an option.
- **Acyclovir, both models:**
  - new urine-concentration output, flagged above the 1.3 mg/mL solubility limit;
  - a note at the band boundary of CrCl 10.
- **New Workbook models:**
  - **Digoxin:** Paulson–Welling Vd, interaction factor applied once, SCr floor 0.7, normal K/V priors of 30%. Literature can now select Paulson–Welling; Reuning stays the default.
  - **Vancomycin:** K/V priors, SCr floor 0.7, Solver bounds, and the AUC-workbook variant.
    - Goti on Site: 6.4 (2023) is now the default; 6.04 (2022) is a legacy option.
    - Carreno on Site: added. Its priors are assumed and badged "verify".
  - **Aminoglycosides:** the workbook's pediatric branch, targets and interval snap.
  - **Lithium:** now matches the workbook itself rather than a reconstruction: a 12-h level target, no interaction factors, citrate as 8 mEq per 300 mg-equivalent, and the 2–3-level test-dose method.
- **Vancomycin-HD:** a "Pierce HD workbook" preset under Site (Vd 1.0 L/kg, 56 h gap, target 15) reproduces the workbook's 11-weight table exactly.
- **Workbook bugs, not ported:**
  - digoxin: interaction factor applied twice, the 0.014 K intercept, the hours/days mix-up;
  - fitting workbooks: the post-infusion equation used for levels drawn during an infusion;
  - vancomycin AUC workbook: the 2/T′ helper AUC;
  - acyclovir: the "excreted during infusion" cell;
  - lithium: the reversed 0.6 mania factor in the site's prose.
- **Not done:**
  - per-dose SCr and per-limb amputation multipliers;
  - the vancomycin pediatric branch;
  - the digoxinweb K-only option;
  - the steady-state button emulation;
  - phenobarbital P3/P7;
  - a bounded fit in `PK.fit`. The tools use local bounded helpers for now.

## Still unverified (blocked or paywalled)
Soriano 2017 full text (the 0.2 coefficient) · Anderson / Kane coefficients (ClinCalc only) · Hartford nomogram coordinates · Goti 2019 erratum text · 2022 AHA HF digoxin table · Sheiner, Reuning and Paulson–Welling primary PDFs · Blum 1982 coefficients · Trotman 2005 CRRT table · Canadian aminophylline salt form · traditional aminoglycoside peak bands by indication · per-NSAID lithium magnitudes.

# Decisions: digoxin and theophylline/aminophylline

Scope: the 11 open clinical choices for `digoxin.html` and `theophylline.html`. This builds on `lit/digoxin-theophylline.md` (rows D1–D32, T1–T30), which is not repeated here. It goes further where that file left a value unverified or a choice open. It also uses the live-server findings in `specs/digoxin.md` §12 and `specs/theophylline.md` "Live-server verification". Researched 2026-10-23.

**Method.**
- PubMed (E-utilities connector) for metadata and abstracts.
- Full text of the 2023 ACC/AHA/ACCP/HRS AF guideline via PMC (PMC11095842), searched locally.
- The 2021 ESC HF guideline and 2024 ESC AF guideline PDFs (public mirrors), converted to text and searched.
- Current DailyMed SPL XML, downloaded and searched:
  - Lanoxin tablets
  - Theo-24
  - Hospira aminophylline injection
  - Theophylline ER tablets: Teva 300/450 mg; Glenmark 400/600 mg once-daily
  - Theophylline oral solution (Cranbury)
  - Fluvoxamine ER (Upsher-Smith)
- Health Canada DPD API for aminophylline products.
- A full textbook chapter: Boro MS, Winter ME. "Digoxin", chapter 3 in Winter ME, *Basic Clinical Pharmacokinetics*, 5th ed., Lippincott Williams & Wilkins 2010 (ISBN 9780781779036). This is the publisher's free sample chapter, read in full: http://downloads.lww.com/wolterskluwer_vitalstream_com/sample-content/9780781779036_Winter/samples/Chapter03.pdf. Cited below as **Winter-Ch3**.
- The AHA journal site, JACC, CCJM, Springer and OUP (2021 ESC) blocked automated access (403).

**Evidence tags** (same as `lit/`):
- **[V]** I read the abstract, label or full text and it supports the claim.
- **[V-ft]** I read the full text (guideline or textbook).
- **[V-meta]** The paper exists (PMID and DOI confirmed), but the detail is not in the abstract.
- **[2nd]** Verified only through a secondary source (lecture notes, review, calculator site).
- **[R]** Recalled, not verified in this session.

---

## Summary of recommended defaults

| # | Decision | Recommended default | Confidence |
|---|---|---|---|
| 1 | Digoxin target wording | HF: **0.5–0.9 ng/mL** (point target 0.7). AF: **"<1.2 ng/mL"** (point target 0.8–0.9). Hard warning ≥1.2 | High for AF and ESC-HF text. Moderate for the AHA-HF wording |
| 2 | Coefficients | Sheiner (Winter-Ch3): non-CHF **0.8 mL/kg/min·Wt + 1.0·CrCl**; CHF **0.33·Wt + 0.9·CrCl** (mL/min, Wt = IBW if obese). Reuning (Winter-Ch3): **V = 3.8·Wt + 3.1·CrCl** (L). Koup/Jusko: **1.303·CrCl + 40 (20 in mod–severe HF)**. Jusko V: **226 + 298·CrCl/(29.1 + CrCl)**, scaled by Wt/70 (Bauer) or BSA/1.73 (RxKinetics). Paulson–Welling: **unverified**, hide | High (Sheiner, Reuning via textbook). Moderate (Koup, Jusko). Low (Paulson) |
| 3 | "CHF present" default | Three-state input **Yes / No / Unknown**. Unknown → use the **CHF (Sheiner) equation** and show a banner. Do not apply any extra flat ×0.4 | Moderate |
| 4 | Digoxin interaction factors | CL: amiodarone 0.5, quinidine 0.5 (V 0.7), verapamil 0.6, dronedarone 0.4, propafenone 0.6 (range 0.3–0.6), itraconazole 0.55, clarithromycin 0.6, ritonavir 0.55, lapatinib 0.35, generic strong P-gp inhibitor 0.6. Thyroid CL and V: hypo ×0.7, hyper ×1.3 | Moderate (label-derived). Low-moderate for thyroid |
| 5 | Digoxin Bayesian priors | Log-normal; **CL CV 35%, V CV 35%**. Residual: **additive SD 0.15 ng/mL + proportional 10%** | Low-moderate |
| 6 | Oral absorption | First-order, **ka 1.6 h⁻¹, no lag**, F tablet 0.7. Exclude or flag levels drawn <6 h post-dose (oral) and <4 h (IV) | Moderate |
| 7 | Theophylline pediatric CL | Label **Table V** dosing bands (as L/kg/h at 10 mg/L): **1–<9 y 0.08; 9–<12 y 0.07; 12–<16 y 0.05** (smoking adolescents 0.07); ≥16 y 0.04. **Cap the initial oral dose** for <45 kg at **12–14 mg/kg/day, max 300 mg/day**, then 16 (max 400) and 20 (max 600) | High |
| 8 | Elderly (>60 y) CL | **0.028 L/kg/h** (adult 0.04 × 0.7, from the label's "−30% on average"). Plus the label cap of **400 mg/day** unless levels guide | Moderate |
| 9 | Aminophylline S | **0.79** (USP dihydrate; every US injection label). 0.86 only for bulk anhydrous aminophylline. Remove 0.84 | High (US). Low (Canada: salt form not stated in DPD) |
| 10 | Theophylline multipliers | Smoking ×1.5 (16–60 y), ×1.8 (>60 y), ×1.4 (12–16 y). CHF ×0.5 (severe/decompensated ×0.4 option). CF ×1.5. Fever/viral illness ×0.6. Pulmonary edema ×0.5. Propranolol ×0.5. Rifampin ×1.4. Fluvoxamine ×0.33. Influenza vaccine ×1.0 (none) | Moderate (high for fluvoxamine, influenza vaccine and propranolol per label) |
| 11 | SR sampling time | Product-specific **peak**. IR/solution 1–2 h. 12-h ER tablets **and** once-daily ER tablets: 12 h after an evening dose or 9 h after a morning dose. Theo-24: 12 h after the dose. At steady state (≥3 days). Never default to a trough | High (all four current labels read) |

---

## Q1. Digoxin target-range wording for HF and AF

### Options
A. One range for all indications (the site calculator's 0.8–1.2 / 1.5–2).
B. Indication-specific: HF 0.5–0.9, AF <1.2.
C. ESC-style "<1.2 ng/mL" for both.

### Evidence
- **2023 ACC/AHA/ACCP/HRS AF guideline**, §7.2.2 "Long-Term Rate Control", recommendation 2, **COR 2a, LOE B-NR** [V-ft, verbatim]: *"For patients with AF in whom measuring serum digoxin levels is indicated, it is reasonable to target levels <1.2 ng/mL."* The supportive text also says:
  - the traditional 0.8–2.0 ng/mL range rests on a small toxicity series;
  - DIG post hoc analyses found 0.5–0.9 ng/mL linked to lower mortality and fewer hospitalizations than ≥1.0;
  - in HF, levels <0.8 had the lowest mortality.

  Citation: Joglar JA et al. *Circulation* 2024;149:e1–e156. PMID 38033089. PMCID PMC11095842. DOI 10.1161/CIR.0000000000001193.
- **2021 ESC HF guideline** [V-ft, PDF text]: *"Digoxin has a narrow therapeutic window and so levels should be checked aiming for a serum digoxin concentration <1.2 ng/mL."* It adds caution in females, the elderly, frail, hypokalaemic and malnourished patients. Citation: McDonagh TA et al. *Eur Heart J* 2021;42:3599–3726. PMID 34447992. DOI 10.1093/eurheartj/ehab368.
- **2024 ESC AF guideline** [V-ft, PDF text]. It gives **no numeric target**. Quote: *"Lower doses of digoxin may be associated with better prognosis. Serum digoxin concentrations can be monitored to avoid toxicity, especially in patients at higher risk due to older age, renal dysfunction, or use of interacting medications."* Citation: Van Gelder IC et al. *Eur Heart J* 2024;45:3314–3414. PMID 39210723. DOI 10.1093/eurheartj/ehae176.
- **2022 AHA/ACC/HFSA HF guideline.**
  - Digoxin is **class 2b, B-R** in symptomatic HFrEF despite GDMT [2nd: CCJM 2024 review].
  - Several secondary sources say the guideline's drug-dosing table targets **"0.5 to <0.9 ng/mL"** [2nd: Medscape summary]. One CCJM summary instead mentions 0.5–1.2 [2nd]. **I could not read the guideline text (403).**
  - Citation: Heidenreich PA et al. *Circulation* 2022;145:e895–e1032. PMID 35363499. DOI 10.1161/CIR.0000000000001063.
- **2026 ESC HF guideline** (*Eur Heart J* 2026;47(38):5346ff; DOI reconstructed as 10.1093/eurheartj/ehag100 — confirm) exists. Its page was partly read [2nd/partial]:
  - Digoxin is still class IIb in HFrEF in sinus rhythm.
  - A new "cardiac glycoside (digoxin or digitoxin)" recommendation appears.
  - **No ng/mL target was found in the part read.** Verify before citing.
- **Textbook:** Winter-Ch3 key-parameter table gives "CHF 0.5–0.9 mcg/L". For AF it gives "0.5–2 mcg/L for ventricular rate control", adding that some AF patients need >2 [V-ft]. That AF range predates the 2023 guideline.
- **Outcome data** (already verified in `lit/`):
  - Rathore 2003 (PMID 12588271)
  - Ahmed 2006 (PMID 16339157)
  - Lopes 2018 ARISTOTLE: ≥1.2 ng/mL → HR 1.56 (PMID 29519345)

### Recommended default
Option B. Wording in the UI:
- **HF (any EF): "Target 0.5–0.9 ng/mL."**
  - Default point target 0.7.
  - Soft warning ≥1.0.
  - Hard warning ≥1.2: "associated with higher mortality (DIG post hoc); ESC HF: aim <1.2".
- **AF rate control: "Target <1.2 ng/mL (ACC/AHA/ACCP/HRS 2023, class 2a)."**
  - Default point target 0.8–0.9.
  - Note that levels above ~1.0 add little rate control.
  - Hard warning ≥1.2.
- **AF + HF:** use the HF range.
- Cite the guidelines by name and year. **Do not attribute "0.5–<0.9" to the 2022 AHA guideline** until someone reads its Table (see "Institutional" below).

### Alternatives
- Option C (ESC "<1.2" for both) is simpler, but less protective in HF.
- Keep the site's 0.8–1.2 / 1.5–2 only in an "about legacy ranges" note.

### Confidence
- High: the AF wording (verbatim) and the ESC-HF wording.
- Moderate: the 2022 AHA-HF "0.5–<0.9" phrasing (secondary only).

### Institutional
- The point targets (0.7 for HF, 0.8 vs 0.9 for AF).
- The warning thresholds.
- Whether a cardiologist override can raise the AF target (Winter notes some patients need more).
- Someone with journal access should read the 2022 AHA/ACC/HFSA HFrEF drug-dosing table and the 2026 ESC HF digoxin text.

---

## Q2. Exact coefficients of the original equations

### Evidence

| Equation | Value (units) | Source | Tag |
|---|---|---|---|
| **Sheiner CL, no CHF** | Cl (mL/min) = **0.8 mL/kg/min × Wt (kg) + 1.0 × CrCl (mL/min)** | Winter-Ch3 Eq 3.3 "Using the data from Sheiner et al. [J Pharmacokinet Biopharm 1977;5:445]" | [V-ft textbook]; original PMID 925881 [V-meta] |
| **Sheiner CL, CHF** | Cl (mL/min) = **0.33 mL/kg/min × Wt + 0.9 × CrCl** | Winter-Ch3 Eq 3.4 | [V-ft textbook] |
| Weight for Sheiner | IBW ("non-obese weight") in obese patients; CrCl in obese patients also uses IBW | Winter-Ch3 text + Table 3.1 | [V-ft] |
| Background | Non-renal (metabolic) CL in healthy people 0.57–0.86 mL/kg/min; "CHF reduces the metabolic clearance of digoxin to about one-half its usual value and may reduce the renal clearance slightly" | Winter-Ch3 (refs Sheiner 1972/1977, Iisalo 1977, Smith 1973) | [V-ft] |
| **Reuning V** | V (L) = **3.8 L/kg × Wt (kg) + 3.1 × CrCl (mL/min)**, CrCl absolute for the patient | Winter-Ch3 Eq 3.1, ref Reuning 1973 (PMID 4487163) | [V-ft textbook]; original [V-meta]. **The "3.84 / 3.12" in `lit/` was [R] and is not supported. The site's 3.12 is a hybrid.** |
| **Koup/Jusko CL** | Cl (mL/min) = **1.303 × CrCl + Cl_NR**, with Cl_NR **40 mL/min** (no or mild HF) and **20 mL/min** (moderate–severe HF, NYHA III–IV) | Bauer-style lecture reproductions (two Iraqi pharmacy-college PDFs reproducing Bauer's *Applied Clinical Pharmacokinetics* chapter, incl. worked example 1.303×97+40 = 167 mL/min, CrCl by Cockcroft–Gault, absolute) | [2nd] |
| Koup original normalisation | Koup 1975 reports volumes per 1.73 m². The original regression was probably on normalised CrCl | Koup JR et al. *Clin Pharmacol Ther* 1975;18:9–21, PMID 1149366 (abstract) | [V] for /1.73 m² reporting; coefficients [V-meta] |
| Bauman 2006 | Uses "Cldig = (1.303 × Clcr) + Clnr", CG CrCl, F 0.75, target 0.7 ng/mL. As fetched, the text gave Clnr = 41 mL/min *with* HF and 20 *without*. That is the reverse of every other source, so it is probably a transcription or extraction error | *Arch Intern Med* 2006;166:2539, PMID 17159022 | [2nd/inconsistent] |
| **Jusko V** | V (L) = **226 + 298 × CrCl / (29.1 + CrCl)**, then × (Wt/70) [Bauer reproduction, absolute CrCl] **or** × (BSA/1.73) with CrCl normalised to 1.73 m² [RxKinetics] | Jusko 1974 PMID 4430731 [V-meta]; reproductions [2nd]. Bauer recommends it only when CrCl < 30 mL/min and otherwise uses **7 L/kg IBW** [2nd] | [2nd] |
| Winter V (normal kidneys) | ≈ 7.3 L/kg | Winter-Ch3 | [V-ft] |
| Koda-Kimble (alternative) | Cl = [(A·CrCl) + B] × C; A 0.88 / B 23 in acute CHF, otherwise A 1, B 40; C = quinidine 0.65, spironolactone 0.75, verapamil 0.7 | RxKinetics help page | [2nd] |
| **Paulson–Welling V** | `(4.5 + 0.028·CrCl_n)·LBW` (site) | Paulson & Welling 1976 PMID 993361: the abstract confirms three methods and that adding a renal-impairment V term improved prediction; **no coefficients** | **Unverified** |

**Live-server cross-check.** `specs/digoxin.md` §12 reconstructs the site as Reuning `3.8·LBW + 3.12·CrCl` and Sheiner `0.8/1.0` and `0.33/0.9`. The Sheiner terms match Winter exactly. The Reuning CrCl term (3.12) differs from Winter (3.1) by <1% of V.

### Recommended default
- **CL: Sheiner (Winter-Ch3)**, weight = IBW (or TBW if less), CrCl by the suite's `renal` module in absolute mL/min.
- **V: Reuning (Winter-Ch3) 3.8·Wt + 3.1·CrCl.**
  - Keep a "site-parity" switch with 3.12 for the regression tests in §12.
  - **The previous `lit/` recommendation of Jusko V as default is reversed.** Reasons:
    - The Jusko inputs are ambiguous (Wt/70 vs BSA/1.73 scaling; normalised vs absolute CrCl).
    - Winter states Eq 3.1 "appears to be useful over a wider range of creatinine clearance values, especially in young adults with good renal function".
    - The site already uses Reuning.
- **Alternatives** (offered): Koup/Jusko CL (1.303·CrCl + 40/20, absolute CrCl, Bauer convention) and Jusko V (Bauer Wt/70 convention).
- **Hide Paulson–Welling** until the coefficients are read from the paper.

### Confidence
- High: Sheiner and Reuning coefficients (verified textbook reproduction by Winter, citing the originals).
- Moderate: Koup 1.303/40/20 (several consistent secondary reproductions).
- Moderate–low: Jusko scaling conventions.
- Low: Paulson–Welling.

### Institutional
- Whether to make Reuning or Jusko the default V. Pharmacy committee.
- Someone with library access should pull Sheiner 1977 (DOI 10.1007/BF01061728), Reuning 1973 and Paulson 1976 PDFs to confirm the primary coefficients.

---

## Q3. Default for "CHF present" when unknown, and whether CHF lowers non-renal CL

### Evidence
- **Winter-Ch3** [V-ft]:
  - CHF halves metabolic CL. This is built into the Sheiner CHF equation: the non-renal term falls 0.8→0.33 mL/kg/min and the renal term ×0.9.
  - Quote: *"It is the authors' opinion that ClDigoxin (Patients with CHF) equation is the more conservative approach and is recommended to use even in patients without a diagnosis of heart failure."*
- **Bauer reproductions** [2nd]: "Nonrenal clearance is lower for patients with moderate-severe heart failure because reduced cardiac output results in decreased liver blood flow and digoxin hepatic clearance" (Cl_NR 40 → 20 mL/min).
- **Bauman 2006** [V, from `lit/`]: in a modern HF cohort, Jusko/Koup with or without the HF adjustment performed comparably (RMSE 0.401 vs 0.375). The modern HF population is closer to the "no-CHF" curve than 1970s CHF patients were.
- **Williams 1996** (PMID 8947982) [V, `lit/`]: CHF was under-predicted by some methods.
- **Yukawa 1997** NONMEM (PMID 9055134) [V]: CHF retained as a covariate of digoxin CL in 385 patients.
- **Site behaviour:** the site defaults CHF = Yes and uses the Sheiner CHF form (no extra ×0.4 found in the live probe; see §12).

### Options
A. Default Yes (site). B. Default No (`lit/` recommendation). C. Require an answer: Yes / No / Unknown, with Unknown → CHF equation.

### Recommended default
**C.**
- The field starts blank and the calculation is blocked until the user answers.
- **"Unknown" maps to the Sheiner CHF equation**, and the result shows the banner "assumed CHF (conservative, Winter)".
- Define "CHF = Yes" as NYHA III–IV or decompensated (the Bauer/Koup definition for Cl_NR 20). Patients with NYHA I–II may answer "No".
- No additional flat CHF multiplier.

### Confidence
Moderate. The direction of the CHF effect is well supported. Its magnitude in modern GDMT-treated HF is uncertain (Bauman).

### Institutional
Whether NYHA I–II counts as CHF for the equation.

---

## Q4. Interaction factors and thyroid status

Conversion: an X% rise in level → CL × 1/(1+X).

| Drug | Best evidence | Derived factor | Recommended |
|---|---|---|---|
| **Amiodarone** | Label: serum +70%, reduce dose 30–50% [V]. Fenster 1985 (healthy, 400 mg/d × 3 wk): CL 234 → 172 mL/min (×0.74), V unchanged [V, PMID 3964797]. Winter-Ch3: "most patients have about a 50% reduction"; onset over 1–2 weeks [V-ft] | 0.5–0.74 | **CL ×0.5** (clinical patients; keep). Show the onset note |
| **Quinidine** | Label: serum +100% [V]. Hager 1979: CL 3.08 → 1.96 mL/min/kg (**×0.64**), V 10.87 → 7.35 L/kg (**×0.68**) [V, PMID 431681]. Leahey 1981: CL −30 to −36%, V not significantly changed in volunteers [V, PMID 7304462]. Winter-Ch3: V falls to 70%; SS level ~doubles; hold one dose, then halve [V-ft] | CL 0.5–0.64; V 0.68–1.0 | **CL ×0.5, V ×0.7** (keep the site values) |
| **Verapamil** | Label: serum +50–75% [V]. Pedersen 1981: CL 3.28 → 2.15 mL/min/kg (**×0.66**) [V, PMID 7273594]. Winter Table 3.1: 0.75 [V-ft] | 0.57–0.75 | **CL ×0.6** (label midpoint; Winter 0.75 as alternative) |
| **Dronedarone** | Label: AUC +150% [V] | 0.40 | **×0.4** |
| **Propafenone** | Label: AUC +60–270% [V] | 0.27–0.63 | **×0.6**, with a "range 0.3–0.6, check level" warning |
| **Itraconazole** | Label: serum +80% [V] | 0.56 | **×0.55** |
| **Clarithromycin** | Label: AUC +70% [V] | 0.59 | **×0.6** |
| **Ritonavir** | Label: AUC +86% [V] | 0.54 | **×0.55** |
| **Lapatinib** | Label: AUC +180% [V] | 0.36 | **×0.35** |
| **Other P-gp inhibitors** | Label groups: ">50% rise → reduce dose 30–50%"; "<50% rise → reduce 15–30%" (atorvastatin, carvedilol, conivaptan, diltiazem, nifedipine, spironolactone, ticagrelor…) [V] | 0.5–0.7 / 0.7–0.85 | Pick-list with label values. Free-entry factor. Generic "strong P-gp inhibitor" ×0.6 |
| **Thyroid** | Label: hypothyroid may need less; hyperthyroid AF resistant (qualitative) [V]. Winter-Ch3 Table 3.1 and Q12: hypothyroid **V ×0.7 and CL ×0.7**; hyperthyroid **V ×1.3 and CL ×1.3**. K is unchanged (Doherty & Perkins 1966, *Ann Intern Med* 64:489, PMID 4159745 [V-meta]). Lawrence 1977 (PMID 872497) and Croxson attribute the CL change to GFR [V-ft via Winter; primaries V-meta] | ±30% | **Keep ×0.7 / ×1.3 on both CL and V**, labelled "approximate (Winter)". When CrCl is measured in hyperthyroidism, apply the factor to V only, because the GFR change is already in CrCl |

**Note on Winter Table 3.1.** The PDF layout scrambles the columns. The values are V: obesity → IBW; quinidine 0.7; hypo 0.7; hyper 1.3. CL: CHF → Eq 3.4; obesity → IBW; amiodarone 0.5; quinidine 0.5; verapamil 0.75; hypo 0.7; hyper 1.3. This reading matches the live-server multipliers exactly (site `Mcl`/`Mvd`). Winter adds: "Although not tested, one might anticipate the factors to be multiplicative."

### Confidence
- Moderate: label-derived CL factors (they come from level changes, not CL studies, and populations differ).
- Low–moderate: thyroid.

### Institutional
The verapamil choice: label-derived 0.6 vs textbook 0.75.

---

## Q5. Bayesian priors for digoxin MAP

### Evidence (published NONMEM digoxin models)
- **Yukawa 1992** (*J Pharm Pharmacol* 44:761; PMID 1360530) [V]: additive IIV on CL, SD 46.15 L/day. **Residual SD 0.209 ng/mL.**
- **Yukawa 1997** (*J Clin Pharmacol* 37:92; PMID 9055134; n = 385) [V]: **CL IIV CV ≈22%. Residual ≈25%** (proportional). Covariates: CHF, spironolactone, half-tablet.
- **Zhou 2010** (*Acta Pharmacol Sin* 31:753; PMID 20523346; older Chinese patients) [V]: **CL/F IIV CV 49.0%; V/F 94.3%** (trough-only data, so V is poorly identified). **Residual SD 0.365 µg/L.** ka 1.63 h⁻¹, V/F 550 L.
- **Choi 2014** (*Clin Ther* 36:389; PMID 24612944) [V]: **CL/F CV 34.3%. Residual SD 0.225 µg/L.**
- **Abdel Jalil 2021** systematic review of 16 adult popPK studies (*Eur J Drug Metab Pharmacokinet* 46:325; PMID 33616855) [V]:
  - Typical CL 0.005–0.2 L/h/kg; V 3.14–15.2 L/kg.
  - 68.8% of the studies were East Asian.
  - Mostly one-compartment models on trough data.
- **Suite convention** (`specs/bayesian-engine.md`): linear-normal priors with CV 0.30 and assay CV 0.10 on the *measured* level.

### Recommended default
- Priors centred on the covariate equations from Q2.
- **CL CV 35%, V CV 35%, log-normal.** Use the linear-scale form only when the site-parity mode is switched on.
- **Residual: combined, additive SD 0.15 ng/mL + proportional 10%.**
  - At 0.7 ng/mL this gives an SD of about 0.17, consistent with the published 0.21–0.37 additive values (which include model misspecification).
  - The suite's 10%-only assay error (SD 0.07 at 0.7 ng/mL) would overweight single troughs. Do not use it for digoxin.
- **With trough-only data, fit CL only and fix V at its prior.** Published V IIV is not identifiable from troughs.

### Confidence
Low–moderate. Published values come mostly from Asian cohorts. None were derived for the Sheiner/Reuning structural model.

### Institutional
- The exact CVs. Validate them on local TDM data: shrinkage and bias on a held-out set.

---

## Q6. Oral absorption model (tablets)

### Evidence
- **Lanoxin label §12.3** [V]: "peak serum concentrations of digoxin occur at 1 to 3 hours". Tablets are 60–80% bioavailable. Food slows the rate but not the extent.
- **Winter-Ch3** [V-ft]:
  - F tablet 0.7, elixir 0.8, soft-gel capsule 1.
  - Two-compartment distribution; distribution t½ ≈35 min.
  - Levels are meaningful only ≥4 h after IV and ≥6 h after oral doses.
  - Trough sampling is preferred.
- **Zhou 2010** [V]: ka 1.63 h⁻¹ (one-compartment, trough data).
- **Site:** zero-order input over 1 h (oral) or 0.25 h (IV) (live-server reconstruction).

### Recommended default
- One-compartment model with first-order absorption, **ka 1.6 h⁻¹, no lag**. Equivalently, a zero-order 1 h input for site parity.
- **Refuse levels drawn <6 h after an oral dose or <4 h after an IV dose**, or mark them "distribution phase, excluded".
- Within the valid window (≥6 h) the absorption model changes predictions by <1%, so the choice only matters for display curves.
- Do not model a lag; no published value was found [R: some models use ~0.3–0.5 h, unverified].

### Confidence
Moderate. The structural choice hardly affects valid samples.

### Institutional
Whether to block or just flag early samples.

---

## Q7. Theophylline pediatric clearance and the <45 kg dose cap

### Evidence
- **Label Table I** (Theo-24 and Hospira aminophylline, identical) [V]. Mean (range), mL/kg/min → L/kg/h:
  - 1–4 y: 1.7 (0.5–2.9) → **0.102**
  - 4–12 y: 1.6 (0.8–2.4) → **0.096**
  - 13–15 y: 0.9 (0.48–1.3) → **0.054**
  - 6–17 y: 1.4 (0.2–2.6) → 0.084
  - Adults 16–60: 0.65 → 0.039
- **Label text** [V]: "Theophylline clearance reaches maximal values by one year of age, remains relatively constant until about 9 years of age and then slowly decreases by approximately 50% to adult values at about age 16."
- **Aminophylline label Table V** (initial infusion rates to reach **10 mcg/mL**, theophylline mg/kg/h; "use ideal body weight for obese patients") [V]. Implied CL = rate/10:
  - 1–9 y: 0.8 → **0.08 L/kg/h**
  - 9–12 y: 0.7 → **0.07**
  - 12–16 y smokers: 0.7 → **0.07**
  - 12–16 y non-smokers: 0.5 → **0.05**
  - 16–60 y: 0.4 → **0.04** (§ not to exceed 900 mg/day unless levels indicate)
  - >60 y: 0.3 → **0.03** (ǀ not to exceed 400 mg/day)
  - Cardiac decompensation, cor pulmonale, liver dysfunction, sepsis with MOF, or shock: 0.2 → **0.02** (ǀ 400 mg/day)
  - Infants 6–52 wk: mg/kg/h = 0.008 × age(wk) + 0.21

  **This table reproduces the site's hidden constants exactly**: 0.08 / 0.07 / 0.05 / 0.04, and smoker = max(base, 0.07). The site therefore follows the label dosing table, not Table I.
- **Theo-24 oral titration** [V]:
  - Children <45 kg: start **12–14 mg/kg/day, max 300 mg/day**; after 3 days **16 mg/kg/day, max 400**; after 3 more days **20 mg/kg/day, max 600**.
  - Children >45 kg and adults: 300–400 → 400–600 mg/day.
  - Doses >600 mg must be titrated by level.
  - The label also warns that starting above 300 mg/day (adults) or >12 mg/kg/day (children >1 y) raises the risk of caffeine-like adverse effects.

### Options
A. Table I means (0.10 / 0.096 / 0.054). B. Table V dosing bands (0.08 / 0.07 / 0.05; the site). C. Table V plus the oral-start cap.

### Recommended default
**C.**
- Use the Table V bands for the PK estimate: 1–<9 y 0.08, 9–<12 y 0.07, 12–<16 y 0.05 (0.07 if smoking), ≥16 y 0.04.
  - They are deliberately below the Table I means, so they are conservative.
  - They give site parity.
- For **oral maintenance in children <45 kg, display min(PK dose, label step dose)** for the first titration step: 12–14 mg/kg/day, ≤300 mg/day. Show the 3-day titration ladder.
- Once a steady-state level exists, the level-guided Table VI adjustment overrides the cap.
- **Infants <1 y:** use the label formula. Neonates: out of scope / specialist.
- The `lit/` proposal of Table I bands (0.10 / 0.09 / 0.055) is withdrawn as the default. Those are population means, not dosing values.

### Confidence
High: both tables and the titration caps were read in current labels.

### Institutional
- Whether to enforce the cap (block) or only display it.
- The age-band cut-points (9 vs 12 y boundaries are inclusive at the site: ≤9 → 0.08).

---

## Q8. Elderly (>60 y) clearance

### Evidence
- **Label Table I** [V]: elderly non-smokers with normal cardiac, liver and renal function have CL **0.41 (0.21–0.61) mL/kg/min = 0.0246 L/kg/h**. That is 63% of the 16–60 y value of 0.65.
- **Label "Geriatric" text** [V]: "decreased by an average of **30%** in healthy elderly adults (>60 yrs)" → 0.04 × 0.7 = **0.028**.
- **Aminophylline Table V** [V]: >60 y **0.3 mg/kg/h → 0.03 L/kg/h**, "not to exceed 400 mg/day unless serum levels indicate". Also: in patients >60 y, infusion ordinarily should not exceed **17 mg/h** theophylline (21 mg/h aminophylline) unless levels are monitored [V].
- **Jusko 1979** (*J Pharm Sci* 68:1358; PMID 41932) [V-meta]: age is a CL factor.
- **Site:** no elderly band (live probe: ages 65 and 90 → 0.04).

### Recommended default
**0.028 L/kg/h (adult × 0.7) for age >60**, plus a hard cap warning at **400 mg/day** (17 mg/h IV) unless levels guide.
- Options: 0.025 (Table I mean, most conservative) and 0.03 (Table V).
- All three come from the same label. 0.028 matches the label's own summary sentence.

### Confidence
Moderate. The magnitude is −25% to −37% depending on which label table you read.

### Institutional
The choice between 0.025, 0.028 and 0.03, and whether the 400 mg/day cap blocks or warns.

---

## Q9. Aminophylline salt factor (S)

### Evidence
- **Hospira Aminophylline Injection USP** (DailyMed setid 9a663ef3-881f-48bd-2689-3713b24545c2, version 29, May 2026) [V]:
  - "Aminophylline (dihydrate) is approximately 79% of anhydrous theophylline by weight."
  - "25 mg/mL (equivalent to 19.7 mg/mL anhydrous theophylline)"
  - MW 456.46.
  - Its Table V footnote, however, says "Aminophylline = theophylline/0.8" (rounded).
- **Every US aminophylline SPL on DailyMed (Oct 2026) is an injection**: Hospira, Henry Schein, HealthFirst, Medical Purchasing Solutions, ProPharma. All are relabels of USP dihydrate injection. The only other listings are **bulk "aminophylline anhydrous powder"** (Bluebay, Evereen) for compounding [V, DailyMed API]. No US oral aminophylline tablet SPL was found.
- **Molecular weights** [computed]:
  - dihydrate: 2 × 180.16 / 456.46 = **0.789**
  - anhydrous: 2 × 180.16 / 420.43 = **0.857**
- **Fluvoxamine label** [V]: "375 mg as 442 mg aminophylline" (ratio 0.848, the anhydrous salt) for the oral study product.
- **Canada** (Health Canada DPD API) [V]:
  - **Only Omega Laboratories Aminophylline Inj 25 mg/mL (DIN 00582662) is "Marketed".**
  - Pfizer 25 mg/mL (DIN 00497193) is "Dormant" (2024).
  - All Canadian aminophylline tablets (Lederle, Stanley 97.5 mg, Jaapharm) and the 50 mg/mL injections are cancelled.
  - **The DPD does not state the salt form of the Omega product.** The USP monograph for the injection is the dihydrate basis [R].
- The site's **0.84 matches neither salt**. The "Aminodur 0.84" entry is a discontinued product.

### Recommended default
- **S = 0.79 for "aminophylline injection (US/Canada)"**. Display "25 mg/mL ≙ 19.7 mg/mL theophylline".
- **S = 0.86 for "aminophylline anhydrous (bulk/compounded or non-North-American tablets)"**.
- Oxtriphylline 0.64 (legacy).
- Theophylline 1.0.
- Remove 0.84 (keep it only in a site-parity test).

### Confidence
- High for the US.
- Moderate for Canada (Omega's monograph was not read).

### Institutional
- Confirm the salt statement on the Omega Canadian product monograph.
- Map formulary items to S.

---

## Q10. Theophylline interaction and disease multipliers

| Factor | Evidence | Derived | Recommended |
|---|---|---|---|
| **Smoking** | Label [V]: CL **+50% young adults, +80% elderly**; passive smoke up to +50%; 1 week of abstinence → −40%; nicotine gum no effect. Jusko 1978: 52 → 74 mL/kg/h (**×1.42**); tobacco + marijuana 93 (×1.8) [V, PMID 688731]. Hunt 1976: 45 → 100 mL/min/1.73 m² (**×2.2**) [V, PMID 1277710]. Table V adolescents 0.07 vs 0.05 (×1.4) [V]. Site: max(base, 0.07) (×1.75 in adults) | 1.4–2.2 | **×1.5 (16–60 y), ×1.8 (>60 y), ×1.4 (12–16 y)**, i.e. label age-specific. 1.6 and 1.75 are rejected as single values. Quit <1 wk: no reduction yet but recheck; quit >1 wk: ×1.0 with a "levels rising" warning |
| **CHF** | Label [V]: "decreased by 50% or more … correlated to the severity". Table V: decompensation 0.2 vs 0.4 (**×0.5**). Powell 1978: CL significantly decreased in CHF (qualitative) [V, PMID 697173] | 0.4–0.5 | **×0.5**; option "severe/decompensated" ×0.4. The site uses 0.4 |
| **Cystic fibrosis** | Label Table I: 1.25 (0.31–2.2) mL/kg/min at 14–28 y [V]. That is ×1.9 vs adult 0.65 and ×1.4 vs 13–15 y 0.9. Isles 1983: total CL **twice** controls; V larger [V, PMID 6838048] | 1.4–2.0 | **×1.5** (conservative) |
| **Fever / acute viral illness** | Label [V]: decrease, "precise data are lacking"; ≥39 °C (102 °F) for ≥24 h probably needed; Table I lists only t½ (7 h, children 9–15 y). Chang 1978: t½ 420 vs 250 min in serologically confirmed viral URTI → CL ≈**×0.6**; febrile but seronegative children unchanged [V, PMID 77421]. Kraemer 1982: influenza B toxicity cluster, CL recovered over 1–3 months [V, PMID 7070895]. Shilalukey 1993 (n = 2,254 records): URTI, not fever, associated with lower CL; recommends a **60% dose-rate correction** [V, PMID 8458824] | ≈0.6 | **×0.6**, labelled "acute viral illness or sustained fever ≥39 °C ≥24 h; approximate; check level". Site 0.5 |
| **Acute pulmonary edema** | Label Table I: median **0.33** (0.07–2.45) mL/kg/min vs 0.65 → **×0.51** [V] | 0.5 | **×0.5** |
| **Propranolol** | Label Table II: level **+100%** (×0.5) [V]. Conrad & Nyman 1980: 160 mg/d, CL 0.0464 → 0.0294 L/kg/h (**×0.63**) [V, PMID 7408406]. Miners 1985: 120 mg/d ×0.70; 720 mg/d **×0.48** [V, PMID 4041342] | 0.48–0.70, dose-dependent | **×0.5** (label, conservative); note "×0.65–0.7 at low doses". The site uses 0.6. Clinically, avoid in asthma |
| **Rifampin** | Label: level −20 to −40% (×1.25–1.67) [V, `lit/`]. Robson 1984 (steady state): CL **+82%** [V, PMID 6487483]. Powell-Jackson 1985: metabolic CL +45%, V +17% [V, PMID 4003946]. Straughn 1984: oral CL ×1.25 [V, PMID 6740733] | 1.25–1.82 | **×1.4**; warn "full effect ~1 week; reverse and reduce when stopped" |
| **Fluvoxamine** | Fluvoxamine label (Upsher-Smith ER, DailyMed setid 49601858-df61-4522-ac99-0d2892f92e11) [V]: CL decreased "approximately 3-fold"; "reduce to one-third of the usual daily maintenance dose". Rasmussen 1997: CL 80 → 24 mL/min (**×0.30**) [V, PMID 9029748] | 0.30–0.33 | **×0.33** (add; the site lacks it) |
| **Influenza vaccine** | Label Table III lists it among drugs with **no significant interaction** [V]. No effect: Bukowskyj 1984 (PMID 6721267), Grabowski 1985 (split virus, PMID 2408526), Hannan 1988 (whole virus, PMID 2451459), Stults 1983 (PMID 6659488) [all V]. Meredith 1985: a small, transient day-1 decrease only [V, PMID 3979001] | 1.0 | **×1.0 (remove)**. Info note only. The site uses 0.5 |

**Combination.** Multiply, and warn when the product is <0.25 or >2.5 (unchanged from `lit/`).

### Confidence
- High: fluvoxamine, influenza vaccine, propranolol direction.
- Moderate: smoking, CHF, rifampin, pulmonary edema.
- Low–moderate: CF and viral illness.

### Institutional
- Single vs age-specific smoking factor.
- CHF 0.5 vs 0.4.
- The viral-illness factor (0.6 vs the site's 0.5).

---

## Q11. SR product sampling time

### Evidence (current US labels, all [V])

| Product type | Label | Sampling instruction |
|---|---|---|
| IR oral solution | Theophylline Oral Solution USP 80 mg/15 mL (Cranbury, setid 78a99bfe-…) | Peak "**1 to 2 hours after a dose** at steady-state" |
| 12-h ER tablets (300, 450 mg; q12h) | Teva (setid 25eabefa-…), Amneal | "**12 hours after an evening dose or 9 hours after a morning dose** at steady-state" |
| Once-daily ER tablets (400, 600 mg; Uniphyl-type, q24h) | Glenmark (setid 56fc2167-…); others with 100–600 mg strengths say the same | Same: **12 h after an evening dose or 9 h after a morning dose** |
| Theo-24 ER capsules (q24h) | Endo (setid 7a108fa0-…) | "**12 hours after a dose** at steady-state" (expected peak range 5–15 mcg/mL). Single-dose Tmax 13.3 ± 4.7 h; high-fat meal ↑ peak and extent |
| IV continuous infusion | Hospira aminophylline | Level 30 min after the load, one t½ after starting the infusion, then 12–24 h later and every 24 h |

All oral labels say: "A trough concentration … provides no additional useful information and may lead to an inappropriate dose increase." Steady state is reached after 3 days with no missed, extra or unequally spaced doses.

### Recommended default
- Product-specific **peak** sampling advice, chosen from the product picker.
- The fitting engine takes **actual time-after-dose** and the product's absorption model (site: SR first-order ka 0.18 h⁻¹, no lag; IR bolus). It never assumes "trough".
- Warn if a sample is drawn <3 days after a dose change.
- Warn if an ER sample is drawn <4 h post-dose. This is a heuristic, not from the labels.

### Confidence
High. All four product-type labels were read.

### Institutional
- Local product list (which ER brand is stocked).
- Whether a trough is ever accepted, e.g. for adherence checks.

---

## Corrections to `lit/digoxin-theophylline.md`

1. **D6 Reuning:** use **3.8 / 3.1** (Winter-Ch3, verified). "3.84 / 3.12" was recalled and is unsupported.
2. **D7 / "Default Vd = Jusko":** changed to **Reuning default**, Jusko as an option (see Q2 for the reasons).
3. **D9 / D24 thyroid and quinidine V:** now sourced. Winter-Ch3 Table 3.1 (thyroid ±30% on CL and V; quinidine V 0.7) and Hager 1979 (V ×0.68).
4. **D5 CHF default:** "No" changed to **Yes / No / Unknown, with Unknown → CHF equation** (Winter's explicit recommendation).
5. **T2 / T3:** the site's pediatric bands come from **aminophylline label Table V**, not Hendeles/Winter. Table V is now the default; the Table I bands are withdrawn.
6. **T6 smoking:** the label gives age-specific values (+50% / +80%), now used instead of a single 1.6.
7. **T11 fever:** ×0.6 (Chang 1978, Shilalukey 1993) instead of ×0.5.
8. **T23:** the label's own Table V footnote uses /0.8. The S = 0.79 default stands, because the description section states 79% / 19.7 mg/mL.

## References (new in this file; others are in `lit/digoxin-theophylline.md`)

Guidelines
- Joglar JA et al. 2023 ACC/AHA/ACCP/HRS AF guideline. *Circulation* 2024;149:e1–e156. PMID 38033089. https://doi.org/10.1161/CIR.0000000000001193 [V-ft]
- McDonagh TA et al. 2021 ESC HF guidelines. *Eur Heart J* 2021;42:3599–3726. PMID 34447992. https://doi.org/10.1093/eurheartj/ehab368 [V-ft]
- Van Gelder IC et al. 2024 ESC AF guidelines. *Eur Heart J* 2024;45:3314–3414. PMID 39210723. https://doi.org/10.1093/eurheartj/ehae176 [V-ft]
- Heidenreich PA et al. 2022 AHA/ACC/HFSA HF guideline. *Circulation* 2022;145:e895–e1032. PMID 35363499. https://doi.org/10.1161/CIR.0000000000001063 [V-meta; digoxin text 2nd]
- 2026 ESC HF guidelines. *Eur Heart J* 2026;47(38):5346ff. https://academic.oup.com/eurheartj/article/47/38/5346/8766302 [2nd/partial]

Textbook
- Boro MS, Winter ME. Digoxin. In: Winter ME. *Basic Clinical Pharmacokinetics*, 5th ed. LWW; 2010:198–239. Sample chapter PDF (link above) [V-ft]

Digoxin PK and interactions
- Koup JR et al. *Clin Pharmacol Ther* 1975;18:9–21. PMID 1149366. https://doi.org/10.1002/cpt19751819 [V]
- Hager WD et al. Digoxin-quinidine interaction. *N Engl J Med* 1979;300:1238–41. PMID 431681. https://doi.org/10.1056/NEJM197905313002202 [V]
- Leahey EB et al. *Am J Cardiol* 1981;48:1141–6. PMID 7304462. https://doi.org/10.1016/0002-9149(81)90332-5 [V]
- Fenster PE et al. Digoxin-amiodarone. *J Am Coll Cardiol* 1985;5:108–12. PMID 3964797. https://doi.org/10.1016/s0735-1097(85)80091-7 [V]
- Pedersen KE et al. Digoxin-verapamil. *Clin Pharmacol Ther* 1981;30:311–6. PMID 7273594. https://doi.org/10.1038/clpt.1981.165 [V]
- Lawrence JR et al. Digoxin kinetics in thyroid dysfunction. *Clin Pharmacol Ther* 1977;22:7–13. PMID 872497. https://doi.org/10.1002/cpt19772217 [V-meta]
- Doherty JE, Perkins WH. *Ann Intern Med* 1966;64:489. PMID 4159745 [V-meta]
- Yukawa E et al. *J Pharm Pharmacol* 1992;44:761–5. PMID 1360530. https://doi.org/10.1111/j.2042-7158.1992.tb05515.x [V]
- Yukawa E et al. *J Clin Pharmacol* 1997;37:92–100. PMID 9055134. https://doi.org/10.1002/j.1552-4604.1997.tb04766.x [V]
- Zhou XD et al. *Acta Pharmacol Sin* 2010;31:753–8. PMID 20523346. https://doi.org/10.1038/aps.2010.51 [V]
- Choi SA et al. *Clin Ther* 2014;36:389–400. PMID 24612944. https://doi.org/10.1016/j.clinthera.2014.01.019 [V]
- Abdel Jalil M et al. *Eur J Drug Metab Pharmacokinet* 2021;46:325–42. PMID 33616855. https://doi.org/10.1007/s13318-021-00672-6 [V]
- LANOXIN tablets label (DailyMed setid d91e3646-4c63-4512-ab22-db39c085c4dc), §7.2 table and §12.3 [V]

Theophylline
- Aminophylline Injection USP, Hospira (DailyMed setid 9a663ef3-881f-48bd-2689-3713b24545c2): Table I, Table V, description [V]
- Theophylline ER tablets: Teva (25eabefa-518b-4030-9b72-01ac8b3deba9), Glenmark 400/600 mg (56fc2167-ceb6-4e3e-8ff7-5e400dfbd533). Theophylline Oral Solution, Cranbury (78a99bfe-6ebe-4ace-80b0-ee019921435e). Theo-24 (7a108fa0-c230-475f-be93-6f864b98a410) [V]
- Fluvoxamine maleate ER capsules, Upsher-Smith (DailyMed setid 49601858-df61-4522-ac99-0d2892f92e11) [V]
- Rasmussen BB et al. *Ther Drug Monit* 1997;19:56–62. PMID 9029748. https://doi.org/10.1097/00007691-199702000-00010 [V]
- Conrad KA, Nyman DW. *Clin Pharmacol Ther* 1980;28:463–7. PMID 7408406. https://doi.org/10.1038/clpt.1980.189 [V]
- Miners JO et al. *Br J Clin Pharmacol* 1985;20:219–23. PMID 4041342. https://doi.org/10.1111/j.1365-2125.1985.tb05064.x [V]
- Robson RA et al. *Br J Clin Pharmacol* 1984;18:445–8. PMID 6487483. https://doi.org/10.1111/j.1365-2125.1984.tb02487.x [V]
- Powell-Jackson PR et al. *Am Rev Respir Dis* 1985;131:939–40. PMID 4003946. https://doi.org/10.1164/arrd.1985.131.6.939 [V]
- Straughn AB et al. *Ther Drug Monit* 1984;6:153–6. PMID 6740733. https://doi.org/10.1097/00007691-198406000-00004 [V]
- Jusko WJ et al. Marihuana and tobacco smokers. *Clin Pharmacol Ther* 1978;24:405–10. PMID 688731 [V]
- Hunt SN, Jusko WJ, Yurchak AM. *Clin Pharmacol Ther* 1976;19:546–51. PMID 1277710. https://doi.org/10.1002/cpt1976195part1546 [V]
- Isles A et al. Cystic fibrosis. *Am Rev Respir Dis* 1983;127:417–21. PMID 6838048. https://doi.org/10.1164/arrd.1983.127.4.417 [V]
- Chang KC et al. Viral illness. *Lancet* 1978;1:1132–3. PMID 77421. https://doi.org/10.1016/s0140-6736(78)90305-7 [V]
- Kraemer MJ et al. Influenza B. *Pediatrics* 1982;69:476–80. PMID 7070895 [V]
- Shilalukey K et al. *J Asthma* 1993;30:109–21. PMID 8458824. https://doi.org/10.3109/02770909309054505 [V]
- Influenza vaccine, no effect:
  - Bukowskyj M et al. 1984, PMID 6721267, https://doi.org/10.1164/arrd.1984.129.5.672
  - Grabowski N et al. 1985, PMID 2408526, https://doi.org/10.1164/arrd.1985.131.6.934
  - Hannan SE et al. 1988, PMID 2451459, https://doi.org/10.1164/ajrccm/137.4.903
  - Stults BM, Hashisaki PA 1983, PMID 6659488
  - Meredith CG et al. 1985 (transient day-1 effect), PMID 3979001, https://doi.org/10.1038/clpt.1985.61

  All [V].
- Health Canada Drug Product Database API, aminophylline (DINs 00582662, 00497193 and others), accessed 2026-10-23 [V]

Secondary sources used
- Bauer-style digoxin lecture notes reproducing *Applied Clinical Pharmacokinetics*: https://www.uomus.edu.iq/img/lectures21/MUCLecture_2024_52428968.pdf ; https://cpha.tu.edu.iq/images/mhadrat/shyma%20salh/lec.9.pdf
- SEFH Jusko–Koup exercise: https://gruposdetrabajo.sefh.es/pkgen/images/stories/MANUAL_FIR/Actividad8_Digoxina_DosificacionJusko_Koup.pdf
- RxKinetics digoxin formulas: https://www.rxkinetics.com/kin_help/hlp_digoxin_formulas.htm
- Bauman 2006 full text (JAMA Network page) for its Koup–Jusko usage.

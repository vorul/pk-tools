# Literature cross-check: digoxin and theophylline/aminophylline

Checked 2026-10-23 against `specs/digoxin.md`, `specs/theophylline.md` and `specs/core-equations.md` §5.
Sources: PubMed (metadata and abstracts retrieved this session), DailyMed current labels (Lanoxin tablets, rev. 12/2024; Theo-24, rev. 05/2024), Hospira aminophylline label, and secondary web pages where noted.

**Evidence tags**
- **[V]** verified this session: the citation exists (PMID/DOI resolved) and the value was read in an abstract or label text.
- **[V-cit]** the citation exists, but the numeric value could not be read (no abstract or full text was available). The value matches standard textbook reproductions.
- **[R]** recalled from training knowledge and **not verified** this session. Treat it as a lead, not a citation.
- **[2nd]** read only in a secondary source (web reproduction), not in the primary document.

Conversions used: a drug that raises the steady-state level by X% is modelled as CL × 1/(1+X). One that lowers the level by Y% is modelled as CL × 1/(1−Y).

---

## 1. Comparison table

### 1A. Digoxin

| # | Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|---|
| D1 | Koup/Jusko CL, no CHF | `(1.303·CrCl + 41)·0.06` L/h | CL_dig = 1.303·CrCl + CL_NR, with CL_NR ≈ 40 mL/min (no or mild HF). Units are mL/min; the originals normalise to 1.73 m². | Koup JR, Jusko WJ et al. *Clin Pharmacol Ther* 1975;18:9-21, PMID 1149366 [V-cit: abstract confirms a linear CL_B vs CrCl relationship, but the coefficients were not in the abstract]. Jusko 1974 PMID 4430731 [V-cit]. Reproduced as 40 / 20 in lecture notes and Bauer-style texts [2nd] | minor difference (41 vs 40) | Use 40 mL/min. State the CrCl normalisation (per 1.73 m² vs absolute) explicitly. Default to absolute CrCl (Cockcroft-Gault) to match common practice, and flag it. |
| D2 | Koup/Jusko CL, CHF | `(1.303·CrCl + 20)·0.06` | CL_NR = 20 mL/min in moderate–severe HF | same as D1 [2nd] | agrees | Keep. |
| D3 | Sheiner CL, no CHF | `(0.8 mL/kg/min·LBW + CrCl)·0.06` | Same form: 0.8·Wt + 1.0·CrCl (mL/min) | Sheiner LB, Rosenberg B, Marathe VV. *J Pharmacokinet Biopharm* 1977;5:445-79, PMID 925881 [V-cit: no abstract in PubMed; coefficients R] | agrees (unverified coefficients) | Keep as the default CL equation (the site recommends it, and it is the more conservative option). Confirm the coefficients from the PDF before release. |
| D4 | Sheiner CL, CHF | `(0.33·LBW + 0.9·CrCl)·0.06` | 0.33·Wt + 0.9·CrCl | same [R] | agrees (unverified) | Keep. |
| D5 | Calculator CHF factor | "Clearance reduced 60%" (flat ×0.4?). **CHF defaults to Yes** | No literature basis for a flat ×0.4 on total CL. The Sheiner CHF form gives roughly 0.55–0.75 × the non-CHF CL, depending on CrCl. | Derived from D3/D4 | site wrong / unverifiable (server hidden) | Do not use a flat 0.4. Use the equation-specific CHF terms. **Default CHF = No** and require an explicit answer. |
| D6 | Reuning Vd | `3.8·LBW + 3.1·CrCl` | Usually cited as 3.84·Wt + 3.12·CrCl | Reuning RH, Sams RA, Notari RE. *J Clin Pharmacol New Drugs* 1973;13:127-41, PMID 4487163 [V-cit; coefficients R] | minor difference (rounding) | Use 3.84 and 3.12 if the PDF confirms them. Offer as an alternative only. |
| D7 | Jusko Vd | `[226 + 298·CrCl_n/(29.1+CrCl_n)]·(BSA/1.73)` L | Same. CrCl normalised to 1.73 m². | Jusko 1974 PMID 4430731 [V-cit]. RxKinetics help page reproduces it identically [2nd]. Tsujimoto 1982 (PMID 7066164) found Jusko Vd the best predictor in elderly patients [V] | agrees | **Default Vd = Jusko.** |
| D8 | Paulson & Welling Vd | `(4.5 + 0.028·CrCl_n)·LBW` | Paper exists. It compared 3 prediction methods, and accounting for the smaller Vd in renal impairment improved prediction. The coefficients are not in the abstract. | Paulson MF, Welling PG. *J Clin Pharmacol* 1976;16:660-5, PMID 993361 [V-cit] | unverifiable (coefficients) | Offer as an option. Verify the coefficients from the paper. |
| D9 | Vd multipliers | Quinidine 0.7, hypo 0.7, hyper 1.3 | Quinidine lowers digoxin Vd (tissue displacement) [R]. The label gives thyroid effects only qualitatively. | Lanoxin label §5.9 [V, qualitative] | unverifiable (magnitude) | Keep, but label them "approximate". |
| D10 | F tablet | 0.7 | 60–80% absolute | Lanoxin tablets label §12.3 [V] | agrees (0.7 = mid-range; some tools use 0.75) | Keep 0.7. |
| D11 | F elixir / oral solution | 0.8 | Commonly 0.7–0.85 [R]. Not read in the tablet label this session. RxKinetics uses 0.8 [2nd] | — | agrees (approx.) | Keep 0.8. |
| D12 | F soft-gel capsule | 1.0 | Lanoxicaps ≈ 0.9–1.0 [R]. RxKinetics uses 0.95 [2nd]. **No longer marketed in the US** [R] | — | site outdated | Keep as a legacy option (0.95–1.0) or remove it. |
| D13 | F IV | 1.0 | 1.0 | label [V] | agrees | — |
| D14 | Amiodarone | CL ×0.5 | Serum digoxin +70% → ×0.59. Label: reduce dose 30–50% | Lanoxin label §7.2 [V] | agrees (×0.5 is the conservative end) | Keep 0.5. |
| D15 | Quinidine | CL ×0.5, Vd ×0.7 | Serum +100% → ×0.5 | label [V]. Marcus 1985 review PMID 2985676 [V] | agrees | Keep. |
| D16 | Verapamil | CL ×0.75 | Serum +50–75% → ×0.57–0.67 | label [V] | **site underestimates** | Use ×0.6. |
| D17 | Dronedarone (info page only) | ×0.5 | AUC +150% → ×0.40 | label [V] | minor difference (site less conservative) | Use ×0.4 and **add it to the calculator** (the site calculator omits it). |
| D18 | Propafenone (info page) | ×0.75 | Serum +60–270% → ×0.27–0.63 | label [V] | **site wrong (underestimates)** | Use ×0.6 with a "range 0.3–0.6, monitor" warning. |
| D19 | Ketoconazole/itraconazole | ×0.5 | Itraconazole +80% → ×0.56 | label [V] | agrees | Keep. |
| D20 | Ranolazine | ×0.67 | +50% → ×0.67 | label [V] | agrees | Keep. |
| D21 | Carvedilol | ×0.75 | Label groups it with "<50% increase; reduce 15–30%" | label [V] | agrees | Keep. |
| D22 | Canagliflozin | ×0.8 | AUC ≈ +20% [R, from the canagliflozin label] | — | agrees (unverified) | Keep. |
| D23 | Missing interactions | — | Label lists >50% increases for clarithromycin (AUC +70%), erythromycin (+100%), tetracycline (+100%), gentamicin (+129–212%), captopril (+58%), lapatinib (AUC +180%), ritonavir (AUC +86%). Decreases: rifampin, phenytoin, St John's wort, cholestyramine, antacids (increase dose 20–40%). | label §7.2 [V] | site incomplete | Add a free-entry "other interaction" multiplier and a pick-list from the label. |
| D24 | Thyroid | CL & Vd ×1.3 (hyper), ×0.7 (hypo) | Label is qualitative only: hypothyroid needs less digoxin, hyperthyroid AF is resistant | label §5.9, §7.3 [V qualitative] | unverifiable (magnitude) | Keep as approximate, with a warning. |
| D25 | HF target | Info page 0.5–0.8. Calculator trough goal **0.8–1.2**, peak <1.5 | 0.5–0.8 ng/mL linked to lower mortality (men, EF ≤45%). ≥1.2 linked to +11.8% absolute mortality vs placebo. Ahmed 2006: 0.5–0.9 linked to benefit at all EF. | Rathore 2003 *JAMA* 289:871, PMID 12588271 [V]. Ahmed 2006 *Eur Heart J* 27:178, PMID 16339157 [V]. DIG 1997 PMID 9036306 [V]. 2022 AHA/ACC/HFSA HF guideline (PMID 35363499) gives digoxin class 2b in HFrEF [2nd]. A 0.5–<0.9 target in that guideline is [2nd/unverified]. HFSA 2010: 0.5–<1.0 [2nd] | **calculator site outdated / wrong** (0.8–1.2 sits mostly in the no-benefit or harm band) | **Default HF target 0.7 ng/mL (range 0.5–0.9).** Warn at ≥1.0. Hard warning at ≥1.2. |
| D26 | AF target | Info 0.5–2. Calculator **1.5–2**, peak <2.5 | 2023 ACC/AHA/ACCP/HRS AF guideline: "reasonable to target <1.2 ng/mL" when levels are measured (class 2a, B-NR) [2nd quote]. ARISTOTLE: SDC ≥1.2 → adjusted HR for death 1.56. Each +0.5 ng/mL → +19% hazard. | Joglar 2023 *Circulation* 149:e1, PMID 38033089 [V-cit] [2nd text]. Lopes 2018 *JACC* 71:1063, PMID 29519345 [V] | **site outdated / wrong** | **Default AF target 0.8–1.0. Upper limit <1.2.** Remove the 1.5–2 goal. |
| D27 | Fixed LD/MD target | 1 ng/mL | Within range for AF, but above the HF optimum | as above | minor difference | Make the target user-selectable, indication-driven (HF 0.7, AF 0.9). |
| D28 | Sampling time | Calculator ≥6 h IV / ≥8 h PO. Info page 6 h / 12 h | Label: just before the next dose or ≥6 h after the last dose. At QD dosing, 24-h levels run 10–25% lower than 8-h levels. | label §2.5 [V] | agrees (both are acceptable) | Warn below 6 h (IV or PO). Prefer 12–24 h (trough) for PO. Fit with time-after-dose, not "trough" assumed. |
| D29 | Loading dose | 50%/25%/25% q6h. "Not recommended in CHF, used in AF" | Label: 10–15 mcg/kg total (adults, >10 y), split ½, ¼, ¼ q6–8h, based on lean weight. LD optional: "may start maintenance without LD". In chronic HF, LD is generally unnecessary [R]. | label §2.2 [V] | agrees | Keep the split. Hide or de-emphasise LD when indication = HF. Show LD by default for AF rate control. |
| D30 | Renal dosing | Via CrCl in the CL equations | Label: smaller MD in renal impairment. Alternative: MD = LD × (14 + CrCl/5)/100. t½ 1.5–2 d normal, 3.5–5 d anuric. 50–70% excreted unchanged. | label §2.3, §8.6, §12.3 [V] | agrees (site says ESRD t½ 4–6 d, label says 3.5–5 d: minor) | Keep. Add the label "% daily loss" method as a cross-check. HD removes little: agrees. |
| D31 | Site reference "Sheiner & Beal 1982 J Pharm Sci 71:1344" | Cited on the digoxin page | Real paper, but it is about **Bayesian estimation of theophylline clearance**, not digoxin | PMID 7153881 [V] | site mis-cites (in context) | Cite it as Bayesian-method support, not as a digoxin equation source. |
| D32 | Site reference "Koup 1975 J Pharmacokinet Biopharm 3:181" | Cited as source of the Koup CL equation | Real paper (digoxin in **normal subjects** after IV bolus/infusion). The CHF/renal regression equation is more properly Koup, Jusko et al. *Clin Pharmacol Ther* 1975;18:9 (PMID 1149366) | PMID 1159622 [V] | minor (likely wrong source for the equation) | Cite PMID 1149366 and Jusko 1974 for the equation. |

Other site digoxin references were all verified to exist, and their content matches what the site uses them for:
- Bauman 2006 (PMID 17159022): HF dosing method targeting 0.7 ng/mL. Jusko/Koup with HF performed comparably (RMSE 0.401 vs 0.375).
- DiDomenico 2014 (PMID 25164709): simplified nomogram, target 0.5–0.9.
- Konishi 2002 (PMID 12174027): hyperbolic L/D vs CrCl model in CHF, best with Cockcroft-Gault.
- Marcus 1985 (PMID 2985676): interaction review.
- Tsujimoto 1982 (PMID 7066164).
- Williams 1996 (PMID 8947982): three methods compared. Quinidine and CHF were under-predicted by some methods.

### 1B. Theophylline / aminophylline

| # | Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|---|
| T1 | Adult nonsmoker CL | hidden. Spec proposes 0.04 L/kg/h | 0.65 mL/kg/min (0.27–1.03) = **0.039 L/kg/h**, healthy nonsmoking asthmatic adults 16–60 y. Powell 1978: 44.5 mL/h/kg in acutely ill patients without CHF or pneumonia. | Theo-24 label Table I [V]. Powell JR et al. *Am Rev Respir Dis* 1978;118:229, PMID 697173 [V] | agrees | **0.04 L/kg/h × IBW** (or TBW if less). |
| T2 | Elderly >60 | hidden. Spec proposes ~0.03 | 0.41 mL/kg/min = **0.025 L/kg/h** (≈ −30–37%) | label [V] | spec proposal slightly high | Use 0.025 L/kg/h for age >60 (or ×0.65 multiplier). |
| T3 | Pediatric bands | hidden. Spec proposes 1–9 y 0.08, 9–12 y 0.07, 12–16 y 0.05 | Label (mL/kg/min → L/kg/h): 1–4 y 1.7 → 0.10. 4–12 y 1.6 → 0.096. 13–15 y 0.9 → 0.054. 6–17 y 1.4 → 0.084. Wide ranges (e.g. 0.5–2.9). | label Table I [V]. The 1–9 / 9–12 / 12–16 banding is Hendeles/Winter-style [R] | spec proposal = minor difference (lower = more conservative) | Use label bands: 1–<4 y 0.10, 4–<13 y 0.09, 13–<16 y 0.055, ≥16 y adult. **Cap initial oral doses at the label empiric doses** (<45 kg: 12–14 mg/kg/d, max 300 mg). See §3. |
| T4 | Vd | hidden. Spec proposes 0.5 L/kg | 0.45 L/kg (0.3–0.7), on IBW. Larger in neonates, cirrhosis, acidemia, elderly (lower protein binding). | label [V]. Aminophylline label [2nd] | minor difference | 0.5 L/kg IBW is acceptable (textbook standard). 0.45 is the label value. Default 0.5 with a note. |
| T5 | Dosing weight | IBW or TBW if less (proposed) | Vd and CL based on IBW. Limited fat distribution. | label [V]. Shum & Jusko 1984 rat model, PMID 6694116 [V, animal] | agrees | Keep. |
| T6 | Smoking | ×1.6 | +50% (young adult), +80% (elderly), passive smoke up to +50%. Quitting for 1 wk → −40%. | label [V]. Jusko 1979 *J Pharm Sci* 68:1358, PMID 41932 [V-cit]. Powell 1978 [V qualitative] | agrees | Keep 1.6. Add a "quit <1 wk / recent quit" note. |
| T7 | CHF | ×0.4 | Decrease ≥50%, proportional to severity | label [V]. Powell 1978 [V qualitative]. Jusko 1979 [V-cit] | minor difference (site is the severe end) | Default ×0.5. Optional "severe/decompensated" ×0.4. |
| T8 | **Cirrhosis** | **"clearance increase 50%"** (would be ×1.5) | Hepatic insufficiency (cirrhosis, acute hepatitis, cholestasis): **decrease ≥50%** | label [V]. Jusko 1979 (title includes cirrhosis) [V-cit] | **site wrong (sign error)** | **×0.5.** Add a hard unit test asserting cirrhosis < 1. |
| T9 | Cystic fibrosis | ×1.5 | CF raises theophylline CL ~1.5× [R] | — | unverifiable | Keep 1.5, labelled "approximate". |
| T10 | Acute pulmonary edema | ×0.5 | Textbook ×0.5 [R] | — | unverifiable | Keep, labelled approximate. |
| T11 | Acute viral illness / fever | ×0.5 | Label: fever (≥39 °C for ≥24 h) decreases CL. No % given. Large decreases reported in influenza/viral illness [R]. | label [V qualitative] | unverifiable (magnitude). ×0.5 is aggressive | Keep as an option with a "fever ≥39 °C ≥24 h" qualifier. |
| T12 | Severe obstructive pulmonary disease | ×0.8 | Severe airway obstruction significantly decreased CL | Powell 1978 [V qualitative] | agrees (magnitude unverified) | Keep. |
| T13 | Cimetidine | ×0.6 | Level +70% → ×0.59 | label Table II [V] | agrees | Keep. |
| T14 | Ciprofloxacin | ×0.7 | +40% → ×0.71 | label [V] | agrees | Keep. |
| T15 | Erythromycin | ×0.75 | +35% → ×0.74 | label [V] | agrees | Keep. |
| T16 | **Influenza vaccine** | ×0.5 | Label Table III: **no significant interaction** | label [V] | **site outdated** | **Remove (×1.0)**, or keep with an info note only. |
| T17 | Phenobarbital | ×1.3 | Level −25% after 2 wk → ×1.33 | label [V] | agrees | Keep. Note the ~2-week onset. |
| T18 | Phenytoin | ×1.6 | Theophylline and phenytoin levels both −40% → ×1.67 | label [V] | agrees | Keep. Warn that phenytoin levels also fall. |
| T19 | Propranolol | ×0.6 | +100% → ×0.5 | label [V] | minor difference (site less conservative) | Use ×0.5. |
| T20 | Rifampin | ×1.3 | −20 to −40% → ×1.25–1.67 | label [V] | minor difference (site at the low end) | Use ×1.4. |
| T21 | Missing interactions | "Other: blank" | Label Table II: enoxacin +300%, thiabendazole +190%, interferon-α +100%, troleandomycin +33–100%, tacrine +90%, mexiletine +80%, ticlopidine +60%, disulfiram +50%, propafenone +40%, estrogen +30%, pentoxifylline +30%, allopurinol (≥600 mg/d) +25%, clarithromycin +25%, methotrexate +20%. Fluvoxamine "similar to cimetidine" (in practice a strong CYP1A2 inhibitor [R]). Decreases: carbamazepine −30%, moricizine −25%, aminoglutethimide −25%, sulfinpyrazone −20%. | label [V] | site incomplete | Add the label pick-list and a free multiplier. |
| T22 | Multiplier combination | Multiply. "Conservative": strongest up and strongest down only | No literature standard [R] | — | unverifiable | Multiply, with floor/ceiling warnings (product <0.25 or >2.5). |
| T23 | Aminophylline S | **0.84** (also "Aminodur 0.84") | **Dihydrate (US injection, USP): 0.79** (25 mg/mL = 19.7 mg/mL theophylline). **Anhydrous: 0.86** (by molecular weight: 2×180.16/420.43 = 0.857). Dihydrate: 360.32/456.46 = 0.789. | Hospira aminophylline label [2nd, via search snippet of labeling.pfizer.com]. MW arithmetic [computed] | minor difference (0.84 matches neither salt) | Offer **0.79 (aminophylline dihydrate; US IV and tablets)** as default and 0.86 (anhydrous). Remove 0.84. |
| T24 | Oxtriphylline (Choledyl) S | 0.64 | 180.16/283.3 = 0.64 [computed; product discontinued in the US, R] | — | agrees (legacy) | Keep as a legacy option. |
| T25 | F for SR | 1 for all forms | IR is rapid and complete. ER products are comparable to IR in extent (Theo-24 ≈ 12-h ER). A high-fat meal can raise Theo-24 absorption ("dose dumping" risk at ≥900 mg or ≥13 mg/kg). | label [V] | agrees (F) | Keep F = 1. Add the food warning for once-daily ER. |
| T26 | SR kinetics / sampling | "Troughs are recommended" | Theo-24: sample the **peak ~12 h post-dose** at steady state (≥3 days). A trough "provides no additional useful information". | label [V] | **site conflicts with labeling for once-daily ER** | For SR, model as zero-order input over ~τ (Cavg ≈ Css). Ask for time-after-dose. Recommend product-specific peak sampling. Do not default to a trough. |
| T27 | Target range | Avg 10. Trough 5–15. Peak max 20 | Label: 5–20 bronchodilation. Peaks 10–15 give most benefit with least risk. AEs rise >20. NAEPP EPR-3 (2007): 5–15 mcg/mL [2nd/R]. Hendeles & Weinberger 1983: 10–20 (historic) [V]. GINA treats theophylline as a low-preference add-on [R]. | label [V]. Hendeles 1983 PMID 6344032 [V] | agrees (10–20 is outdated) | Default target avg 10 mg/L. Acceptable 5–15. Warn >15, alert >20. |
| T28 | Loading dose | 10 mg/L × V / S, no drug on board | Standard. Partial load (Cdes − Cnow)·V/S. | Hendeles 1983 [V abstract: LD based on mean Vd] | agrees | Add the partial-load input. |
| T29 | Max dose caps | none | Adults with risk factors or elderly: ≤400 mg/d unless levels guide. Increase ≤25% per step, ≥3 days apart. | label [V] | site missing | Add cap warnings. |
| T30 | Sheiner & Beal 1982 (core list) | Cited | Bayesian theophylline CL estimation. Real. | PMID 7153881 [V] | agrees | Cite for Bayesian fitting. |

---

## 2. Recommended defaults for our build

**Digoxin**

- **Vd: Jusko** (BSA-scaled, normalised CrCl).
  - It is the site's own recommendation alongside Paulson.
  - It performed best in Tsujimoto 1982.
  - Reuning and Paulson-Welling are selectable alternatives.
- **CL: Sheiner** (CHF and non-CHF forms), LBW = IBW, or TBW if less.
  - Gives the lower, more conservative CL.
  - Koup/Jusko 1.303·CrCl + 40 (20 in CHF) as an alternative. Use 40, not 41.
  - Do **not** apply an extra flat CHF ×0.4.
- **CHF default = No** (unanswered blocks calculation).
- **F:**
  - tablet 0.7
  - oral solution 0.8
  - IV 1.0
  - capsule 0.95–1.0, legacy only
- **Interaction CL multipliers (label-derived):**
  - amiodarone 0.5
  - quinidine 0.5 (Vd 0.7)
  - verapamil 0.6
  - dronedarone 0.4
  - propafenone 0.6 (warn: range 0.3–0.6)
  - itraconazole/ketoconazole 0.55
  - clarithromycin 0.6
  - ranolazine 0.67
  - carvedilol 0.75
  - canagliflozin 0.8
  - thyroid ±30% (approximate)
  - free "other" field
- **Targets by indication:**
  - HF: 0.7 ng/mL (0.5–0.9). Warn ≥1.0, hard warning ≥1.2.
  - AF: 0.9 ng/mL (range 0.5–<1.2). Warn ≥1.2.
  - Show the site's legacy ranges only in an "about" note.
- **Sampling:**
  - Reject or flag levels drawn <6 h post-dose.
  - Prefer ≥12 h (PO), ideally just before the next dose.
  - The steady-state fit requires ≥5 t½ (t½ often 2–6 days). Otherwise use the non-steady-state superposition fit.
- **Loading dose:**
  - Shown by default for AF only, split ½, ¼, ¼ q6–8h.
  - Cross-check against the label's 10–15 mcg/kg lean weight.

**Theophylline**

- **Base CL (L/kg/h × IBW):**
  - 1–<4 y: 0.10
  - 4–<13 y: 0.09
  - 13–<16 y: 0.055
  - 16–60 y: 0.04
  - >60 y: 0.025
- **Vd:** 0.5 L/kg IBW (label 0.45).
- **Multipliers:**
  - smoker 1.6
  - CHF 0.5 (severe 0.4)
  - **cirrhosis 0.5**
  - CF 1.5
  - acute pulmonary edema 0.5
  - fever ≥39 °C ≥24 h 0.5 (approximate)
  - severe COPD 0.8
  - cimetidine 0.6
  - ciprofloxacin 0.7
  - erythromycin 0.75
  - clarithromycin 0.8
  - propranolol 0.5
  - phenobarbital 1.33
  - phenytoin 1.67
  - rifampin 1.4
  - carbamazepine 1.4
  - **influenza vaccine removed**
  - label pick-list for the rest
- **Salt S:**
  - aminophylline (dihydrate) 0.79 as default for aminophylline
  - anhydrous aminophylline 0.86
  - oxtriphylline 0.64 (legacy)
  - theophylline 1
- **F = 1** for all forms. SR modelled as zero-order over τ. Sampling for SR products at the product-specific peak (Theo-24 ~12 h).
- **Target:** Cavg 10 mg/L. Range 5–15. Peak alert >20.
- **Safety caps:**
  - ≤400 mg/d in elderly or risk-factor patients unless guided by levels.
  - Titrate ≤25% per step every ≥3 days.
  - Pediatric initial oral dose ≤ label empiric dose.

---

## 3. Items needing clinician sign-off

1. **Digoxin HF target 0.7 (0.5–0.9) and AF target <1.2.** The exact wording of the 2022 HF and 2023 AF guidelines was confirmed only through secondary quotes. A clinician should check the guideline text (PMID 35363499, 38033089).
2. **Sheiner vs Koup/Jusko as the default CL, and absolute vs BSA-normalised CrCl in the Koup equation.** The coefficients were not read from the primary PDFs.
3. **Removing the flat CHF ×0.4 (digoxin) and changing the default CHF answer from Yes to No.**
4. **Interaction multipliers that are more conservative than the site's** (verapamil 0.6, dronedarone 0.4, propafenone 0.6, theophylline propranolol 0.5, rifampin 1.4). Also deleting the influenza vaccine factor.
5. **Theophylline pediatric CL bands** (label vs textbook banding) and whether to cap PK-predicted doses at the label's empiric starting doses.
6. **Elderly theophylline CL 0.025 L/kg/h vs the spec's 0.03.**
7. **Aminophylline default S = 0.79** (US dihydrate) vs the site's 0.84. Check the local formulary product (some non-US products are labelled differently, e.g. Australia 25 mg ≙ 20.63 mg [2nd]).
8. **SR theophylline sampling guidance** (peak vs trough) per product.
9. Unverified magnitudes: thyroid ±30%, quinidine Vd ×0.7, CF ×1.5, pulmonary edema ×0.5, viral illness ×0.5. These need either primary sources or an explicit "approximate" label.
10. Paulson-Welling and Reuning coefficients, from the primary PDFs if those options are offered.

---

## 4. References

Verified this session ([V] = metadata or abstract retrieved from PubMed, or label text read on DailyMed).

**Digoxin: population PK**
1. Jusko WJ, Szefler SJ, Goldfarb AL. Pharmacokinetic design of digoxin dosage regimens in relation to renal function. *J Clin Pharmacol*. 1974;14:525-35. PMID 4430731. https://doi.org/10.1002/j.1552-4604.1974.tb01367.x [V-cit]
2. Koup JR, Jusko WJ, Elwood CM, Kohli RK. Digoxin pharmacokinetics: role of renal failure in dosage regimen design. *Clin Pharmacol Ther*. 1975;18:9-21. PMID 1149366. https://doi.org/10.1002/cpt19751819 [V]
3. Koup JR, Greenblatt DJ, Jusko WJ, Smith TW, Koch-Weser J. Pharmacokinetics of digoxin in normal subjects after intravenous bolus and infusion doses. *J Pharmacokinet Biopharm*. 1975;3:181-92. PMID 1159622. https://doi.org/10.1007/BF01067907 [V] (site-cited)
4. Sheiner LB, Rosenberg B, Marathe VV. Estimation of population characteristics of pharmacokinetic parameters from routine clinical data. *J Pharmacokinet Biopharm*. 1977;5:445-79. PMID 925881. https://doi.org/10.1007/BF01061728 [V-cit]
5. Reuning RH, Sams RA, Notari RE. Role of pharmacokinetics in drug dosage adjustment. I. Pharmacologic effect kinetics and apparent volume of distribution of digoxin. *J Clin Pharmacol New Drugs*. 1973;13:127-41. PMID 4487163. https://doi.org/10.1002/j.1552-4604.1973.tb00074.x [V-cit]
6. Paulson MF, Welling PG. Calculation of serum digoxin levels in patients with normal and impaired renal function. *J Clin Pharmacol*. 1976;16:660-5. PMID 993361. https://doi.org/10.1002/j.1552-4604.1976.tb01506.x [V-cit]
7. Tsujimoto G et al. Re-examination of digoxin dosage regimen: comparison of the proposed nomograms or formulae in elderly patients. *Br J Clin Pharmacol*. 1982;13:493-500. PMID 7066164. https://doi.org/10.1111/j.1365-2125.1982.tb01410.x [V]
8. Williams PJ et al. Direct comparison of three methods for predicting digoxin concentrations. *Pharmacotherapy*. 1996;16:1085-92. PMID 8947982 [V]
9. Konishi H et al. Predictive performance of serum digoxin concentration in patients with CHF by a hyperbolic model based on creatinine clearance. *J Clin Pharm Ther*. 2002;27:257-65. PMID 12174027. https://doi.org/10.1046/j.1365-2710.2002.00418.x [V]
10. Bauman JL, DiDomenico RJ, Viana M, Fitch M. A method of determining the dose of digoxin for heart failure in the modern era. *Arch Intern Med*. 2006;166:2539-45. PMID 17159022. https://doi.org/10.1001/archinte.166.22.2539 [V]
11. DiDomenico RJ et al. Use of a simplified nomogram to individualize digoxin dosing versus standard dosing practices in patients with heart failure. *Pharmacotherapy*. 2014;34:1121-31. PMID 25164709. https://doi.org/10.1002/phar.1480 [V]

**Digoxin: interactions and labeling**
12. Marcus FI. Pharmacokinetic interactions between digoxin and other drugs. *J Am Coll Cardiol*. 1985;5(5 Suppl A):82A-90A. PMID 2985676. https://doi.org/10.1016/s0735-1097(85)80466-6 [V]
13. LANOXIN (digoxin) tablets, prescribing information, Advanz Pharma, rev. 12/2024. DailyMed setid d91e3646-4c63-4512-ab22-db39c085c4dc. https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d91e3646-4c63-4512-ab22-db39c085c4dc [V]

**Digoxin: outcomes and guidelines**
14. The Digitalis Investigation Group. The effect of digoxin on mortality and morbidity in patients with heart failure. *N Engl J Med*. 1997;336:525-33. PMID 9036306. https://doi.org/10.1056/NEJM199702203360801 [V]
15. Rathore SS, Curtis JP, Wang Y, Bristow MR, Krumholz HM. Association of serum digoxin concentration and outcomes in patients with heart failure. *JAMA*. 2003;289:871-8. PMID 12588271. https://doi.org/10.1001/jama.289.7.871 [V]
16. Ahmed A et al. Digoxin and reduction in mortality and hospitalization in heart failure: a comprehensive post hoc analysis of the DIG trial. *Eur Heart J*. 2006;27:178-86. PMID 16339157. https://doi.org/10.1093/eurheartj/ehi687 [V]
17. Lopes RD et al. Digoxin and mortality in patients with atrial fibrillation. *J Am Coll Cardiol*. 2018;71:1063-74. PMID 29519345. https://doi.org/10.1016/j.jacc.2017.12.060 [V]
18. Heidenreich PA et al. 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. *Circulation*. 2022;145:e895-e1032. PMID 35363499. https://doi.org/10.1161/CIR.0000000000001063 [V-cit; digoxin text 2nd]
19. Joglar JA et al. 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation. *Circulation*. 2024;149:e1-e156. PMID 38033089. https://doi.org/10.1161/CIR.0000000000001193 [V-cit; "<1.2 ng/mL" text 2nd]

**Theophylline / aminophylline**
20. Jusko WJ, Gardner MJ, Mangione A, Schentag JJ, Koup JR, Vance JW. Factors affecting theophylline clearances: age, tobacco, marijuana, cirrhosis, congestive heart failure, obesity, oral contraceptives, benzodiazepines, barbiturates, and ethanol. *J Pharm Sci*. 1979;68:1358-66. PMID 41932. https://doi.org/10.1002/jps.2600681106 [V-cit]
21. Powell JR, Vozeh S, Hopewell P, Costello J, Sheiner LB, Riegelman S. Theophylline disposition in acutely ill hospitalized patients: the effect of smoking, heart failure, severe airway obstruction, and pneumonia. *Am Rev Respir Dis*. 1978;118:229-38. PMID 697173. https://doi.org/10.1164/arrd.1978.118.2.229 [V]
22. Hendeles L, Weinberger M. Theophylline: a "state of the art" review. *Pharmacotherapy*. 1983;3:2-44. PMID 6344032. https://doi.org/10.1002/j.1875-9114.1983.tb04531.x [V]
23. Sheiner LB, Beal SL. Bayesian individualization of pharmacokinetics: simple implementation and comparison with non-Bayesian methods. *J Pharm Sci*. 1982;71:1344-8. PMID 7153881. https://doi.org/10.1002/jps.2600711209 [V] (site-cited on the digoxin page; it is a theophylline paper)
24. Shum L, Jusko WJ. Theophylline disposition in obese rats. *J Pharmacol Exp Ther*. 1984;228:380-6. PMID 6694116 [V] (animal; fat partitioning)
25. THEO-24 (theophylline anhydrous) ER capsules, prescribing information, Endo USA, rev. 05/2024. DailyMed setid 7a108fa0-c230-475f-be93-6f864b98a410. https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7a108fa0-c230-475f-be93-6f864b98a410 [V]
26. Aminophylline injection (dihydrate), Hospira/Pfizer labeling: 25 mg/mL ≙ 19.7 mg/mL anhydrous theophylline (~79%). https://labeling.pfizer.com/ShowLabeling.aspx?id=4641 [2nd: search snippet, page not opened]

**Recalled, not verified (do not cite without checking)**
- NHLBI NAEPP Expert Panel Report 3 (2007): theophylline target 5–15 mcg/mL.
- GINA (current): theophylline as a low-preference controller.
- HFSA 2010 HF guideline: digoxin 0.5–<1.0 ng/mL.
- Lanoxicaps bioavailability 90–100%.
- Canagliflozin label: digoxin AUC +20%.
- Primary sources for theophylline CF, pulmonary edema and viral-illness multipliers.
- Digoxin thyroid ±30% and quinidine Vd ×0.7.

**Secondary web sources used**
- RxKinetics digoxin formulas: https://www.rxkinetics.com/kin_help/hlp_digoxin_formulas.htm and https://www.rxkinetics.com/dig.html (Jusko Vd and F values: tablet 0.75, elixir 0.8, capsule 0.95)

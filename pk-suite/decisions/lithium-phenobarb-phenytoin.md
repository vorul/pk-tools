# Open clinical decisions: phenytoin, lithium, phenobarbital

Prepared 2026-10-23. This follows up `lit/lithium-phenobarb-phenytoin.md`, which is not repeated here. It covers only the choices that file left open or could not verify.

**How sources are tagged**
- **[V-PM]**: PubMed record (PMID/DOI) and abstract read this session.
- **[V-FT]**: full text read this session.
- **[V-W6]**: read in the local Winter 6e PDF. Its text extraction drops the digit "1", so "< 0 mL/min" in the PDF means "< 10".
- **[V-2nd]**: the number comes only from a secondary source (ClinCalc, MDCalc, NHS pages).
- **[UNVERIFIED]**: recalled, or the primary source was not accessible. Do not ship without checking.

The local PDFs `tang2007.pdf` (Tang & Xiao 2007, Lambert-W MM solutions) and `10.1007@s13318-011-0040-2.pdf` (Golicnik 2011, explicit approximations) are about the math only. They bear on none of these decisions.

---

## Summary of recommended defaults

| # | Decision | Recommended default | Confidence |
|---|---|---|---|
| 1 | PHT binding correction: HD/ESRD | `C/(0.2·Alb + 0.1)` (Soriano 2017), factor capped at 1, plus a mandatory "measure free level" banner. Trigger: on HD/PD, or CrCl < 10 mL/min. CrCl 10–25 not on dialysis: no ESRD equation; use the non-ESRD default and require a free level. Legacy `0.1·Alb + 0.1` (≈ Winter 0.48) only as an option. | Moderate that 0.1 should not be the default; low–moderate for the exact 0.2 |
| 2 | PHT non-ESRD coefficient | Anderson 0.25 (default); Kane 0.29 (neuro-ICU option); Cheng 0.275; Winter 0.2 (legacy) | Moderate |
| 3 | PHT elderly Vmax | 60–79 y: Vmax 6.0 mg/kg/d, Km 5.8 (Bauer & Blouin 1982). ≥80 y: same 6.0 (no data), with a "no population data ≥80" flag | Moderate (60–79); low (≥80) |
| 4 | Graves-Cloyd | Primary located: **Graves NM, Leppik IE et al., Ther Drug Monit 1986**. Implement `Dnew = Dold·(Cnew/Cold)^0.2` (abstract form); the Bauer 0.199/0.804 form is equivalent within rounding. Label it "biased low; round up" | High (equation); moderate (use) |
| 5 | Km for single-level adjustment | Primary: one-level MAP Bayesian with age-banded priors. Cross-check display: fixed Km = 4 mg/L (Winter) | Moderate |
| 6 | Cap the binding factor at 1? | **Yes**: `Ccorr = C / min(1, denominator)` | Moderate–high |
| 7 | Li dosing weight | CL: 0.25·CrCl (CG per suite renal weight policy). V: 0.7 L/kg × TBW if non-obese; × IBW (or FFM) if TBW > 1.3·IBW | Low–moderate |
| 8 | Li targets (12-h) | 0.6–0.8 (aim 0.7); options 0.4–0.6 and 0.8–1.0; acute mania 0.8–1.2; elderly 65–79 y 0.4–0.6 (max 0.7–0.8), ≥80 y 0.4–0.6 (max 0.7) | High (maintenance/elderly); moderate (acute) |
| 9 | Li interaction CL factors | Thiazide 0.75 (option 0.5 "halve dose"); ACEi 0.75; ARB 0.75 [flag]; regular Rx NSAID 0.8, indomethacin 0.7; aspirin, sulindac and short OTC naproxen 1.0; loop diuretic 1.0 plus a high-risk warning | Moderate (ACEi, thiazide); low (ARB, NSAID, loop) |
| 10 | Li SR F | F = 1 for IR and SR (SR option 0.9) | Moderate |
| 11 | PB clearance and V by age | Adult 0.004; ≥65 y 0.0032; child 1–<12 y 0.008; 12–<18 y 0.005–0.006; infant 2 wk–1 y about 0.006–0.010 [weak]; neonate 0.0047 L/kg/h with V 0.96 (Grasela 1985), or 0.004/0.9 (Winter); V 0.7 otherwise | Moderate (adult, elderly, neonate); low (infant, adolescent) |
| 12 | PB target range | 10–40 mg/L reference range (ILAE/Patsalos), shown with a 15–40 "usual therapeutic" overlay (Winter) | High |
| 13 | PB + VPA; rectal | CL × (1 − 0.25·VPA_g/day), floor 0.5 at ≥2 g/d. Rectal (injectable solution): S 0.91, F 0.9 | Moderate–high |

---

## PHENYTOIN

### Q1. ESRD/dialysis albumin correction

**The problem.** Soriano's revised equation `C/(0.2·Alb + 0.1)` gives a denominator of 0.98 at Alb 4.4 g/dL, so there is essentially no correction. The classic ESRD form `0.1·Alb + 0.1` gives 0.54 (×1.85), and Winter's `0.9·0.48·Alb/4.4 + 0.1` gives 0.53. The table shows the denominators by albumin:

| Alb (g/dL) | Soriano 0.2 | Legacy 0.1 | Winter 0.48 | Anderson 0.25 | Kane 0.29 | Winter-Tozer (WT) 0.9/4.4 |
|---|---|---|---|---|---|---|
| 4.4 | 0.98 | 0.54 | 0.53 | 1.20 | 1.38 | 1.00 |
| 4.0 | 0.90 | 0.50 | 0.49 | 1.10 | 1.26 | 0.92 |
| 3.5 | 0.80 | 0.45 | 0.44 | 0.98 | 1.12 | 0.82 |
| 3.0 | 0.70 | 0.40 | 0.40 | 0.85 | 0.97 | 0.71 |
| 2.5 | 0.60 | 0.35 | 0.35 | 0.73 | 0.83 | 0.61 |

Example: an HD patient with Alb 3.0 and total 8 mg/L. Soriano normalizes to 11.4 mg/L; legacy normalizes to 20 mg/L. The two lead to opposite dosing actions.

**Evidence**
- **Winter 6e, Eq 14.3 [V-W6].** In ESRD, fu rises from 0.1 to 0.2–0.35. Part of this is low albumin and part is reduced binding affinity. Above CrCl 25 mL/min there is no renal adjustment. If CrCl is below 10 *and* the patient is on HD, use Eq 14.3, whose 0.48 affinity factor was "derived from this type of patient". For CrCl 10–25 without HD, binding is "unpredictably altered" and Eq 14.3 "cannot be applied". Winter Q10 (HD, Alb 3.3, total 5 mg/L) normalizes to about 11.9 mg/L.
- **Liponi DF, Winter ME, Tozer TN.** *Renal function and therapeutic concentrations of phenytoin.* Neurology 1984;34(3):395–7. PMID 6538287. doi:[10.1212/wnl.34.3.395](https://doi.org/10.1212/wnl.34.3.395) [V-PM].
  - n = 40, stable renal impairment, equilibrium dialysis (37 °C).
  - Apparent affinity fell with renal function, mostly below CrCl 25.
  - This is the origin of the 0.48 / 0.1 form, and it is explicitly a model of **uremic displacement** (an affinity term).
- **Soriano VV, Tesoro EP, Kane SP.** *Characterization of free phenytoin concentrations in ESRD using the Winter-Tozer equation.* Ann Pharmacother 2017;51(8):669–74. PMID 28470115. doi:[10.1177/1060028017707541](https://doi.org/10.1177/1060028017707541) [V-PM abstract only; full text paywalled, HTTP 403].
  - Retrospective, n = 21 adults with ESRD on HD and paired free and total levels.
  - The ESRD WT form had a percentage error of **75%**, RMSE 1.76 µg/mL, and >50% error in 67% of samples.
  - A "revised ESRD WT equation" had >50% error in only 5% of samples.
  - The **coefficient 0.2** comes from ClinCalc and MDCalc [V-2nd]. The abstract does not print it.
  - Not accessible: the assay temperature, mean albumin and the derivation method.
  - **Uremic displacement is not modelled separately.** The 0.2 is an empirical lumped coefficient. That it equals the non-renal WT coefficient implies that in this modern HD cohort, binding behaved about like non-uremic binding.
- **Palumbo AM, Soliman A, Cloud K, et al.** *Impact of population-specific phenytoin correction factors on estimation of free phenytoin concentrations in a community teaching hospital.* Ann Pharmacother 2026 (epub Aug 6). PMID 42557917. doi:[10.1177/10600280261470029](https://doi.org/10.1177/10600280261470029) [V-PM abstract].
  - n = 66 levels; an intermittent-HD subgroup (size not in the abstract).
  - In the IHD cohort, **CF 0.201 outperformed CF 0.1**: MPE −74% vs −198% (negative = over-prediction of free); RMSE 2.07 vs 5.32.
  - This is the first independent confirmation that the 0.1 form badly over-predicts free phenytoin in HD. Even 0.2 still over-predicts.
- **Montgomery MC, Chou JW, McPharlin TO, Baird GS, Anderson GD.** *Predicting unbound phenytoin concentrations: effects of albumin concentration and kidney dysfunction.* Pharmacotherapy 2019;39(7):756–66. PMID 31067355. doi:[10.1002/phar.2273](https://doi.org/10.1002/phar.2273) [V-PM].
  - n = 344.
  - Normal albumin with eGFR 30–90: free fraction unchanged, so total reflects free.
  - Hypoalbuminemia with mild or moderate dysfunction: WT and Anderson performed best, but less accurately (P20 50–67%).
  - **Severe dysfunction plus hypoalbuminemia (n = 14): no coefficient (0.15–0.30) reached P20 >45%.** Measure free.
- **Khan AM, Marvanova M.** Consult Pharm 2017;32(8):461–7. PMID 29029667. doi:[10.4140/TCP.n.2017.461](https://doi.org/10.4140/TCP.n.2017.461) [V-PM].
  - 12 ESRD patients, room-temperature assay. Correlation for standard and revised WT r = 0.95.
  - It reports only r, not bias, so it adds little.
- **ter Heine R, Kane SP, Huitema ADR, Krasowski MD, van Maarseveen EM.** *Nonlinear protein binding of phenytoin in clinical practice.* Br J Clin Pharmacol 2019;85(10):2360–8. PMID 31269540. doi:[10.1111/bcp.14053](https://doi.org/10.1111/bcp.14053) [V-PM].
  - A mechanistic model in which binding depends on albumin, **severe renal dysfunction** and phenytoin concentration (fu rises with exposure).
  - It outperformed WT in 4 of 5 external datasets. Parameter values were not readable this session (full text blocked).
  - Note that fu is concentration-dependent, so any linear WT form is approximate.
- **Assay temperature: Temme PP et al.** Eur J Clin Pharmacol 2025;81(12):1833–9. PMID 40924145. doi:[10.1007/s00228-025-03918-3](https://doi.org/10.1007/s00228-025-03918-3) [V-PM].
  - Ultrafiltration at 37 °C vs 20 °C raised measured fu by **14.8–26.3%**. Most labs ultrafilter at room temperature.
  - This is the same mechanism Anderson 1997 used to justify 0.25. It is a plausible part of why modern room-temperature HD cohorts look less "displaced" than 1980s equilibrium-dialysis data. That explanation is our **hypothesis, not a finding**.
- **Others the brief named.**
  - **"Cheng 2022"**: not found. The Cheng paper is Cheng W, Kiang TK, Bring P, Ensom MH, Can J Hosp Pharm **2016**, PMID 27621486. It **excluded HD patients**.
  - **"Hong"**: Hong JM, Choi YC, Kim WJ, Yonsei Med J 2009;50(4):517–20, doi:[10.3349/ymj.2009.50.4.517](https://doi.org/10.3349/ymj.2009.50.4.517) [V-FT summary]. It **excluded ESRD** (n = 49; WT did not improve correlation; fu 25% in hypoalbuminemia).
  - **Kiang**: Kiang & Ensom 2016 review (PMID 26825643) and Jun… Kiang 2020 linear-binding popPK (Drugs R D 20:343, PMID 33026608, doi:[10.1007/s40268-020-00323-2](https://doi.org/10.1007/s40268-020-00323-2), n = 37). Neither gives an ESRD equation.
  - No other ESRD-specific equation was found in PubMed (2015–2026 title search).

**Options**
1. Soriano `0.2·Alb + 0.1` for HD/ESRD (ClinCalc ESRD option; MDCalc "CrCl < 20").
2. Legacy `0.1·Alb + 0.1` / Winter 0.48 (Liponi 1984). This explicitly models uremic displacement, but it fails in both modern HD cohorts.
3. No equation for ESRD: require a measured free level and refuse to normalize.
4. Mechanistic ter Heine model (parameters not extracted).

**RECOMMENDED DEFAULT**

| Population | Default equation | UI behaviour |
|---|---|---|
| Intermittent HD or PD, any albumin; or CrCl < 10 mL/min not on dialysis | `Ccorr = C / min(1, 0.2·Alb + 0.1)` (Soriano) | **Mandatory banner**: "Equation unreliable in ESRD; obtain a free phenytoin level (target 1–2 mg/L)." If a free level is entered, use it and hide the estimate |
| CrCl 10–25 mL/min, not on dialysis | Non-ESRD default (Anderson 0.25, capped at 1). **Do not** apply the ESRD equation | Banner: "Binding unpredictable at CrCl 10–25 (Winter/Liponi). Free level recommended, required if Alb < 3.5" |
| CrCl ≥ 25 | Non-ESRD default | Free level advised if Alb < 3.5 plus an interacting drug, or ICU |
| CRRT | No validated equation | Free level required |
| Option (toggle) | Legacy ESRD `0.1·Alb + 0.1` ("Winter/Liponi 1984") | Show both values side by side when the toggle is on |

Rationale:
- Two independent HD cohorts (Soriano 2017; Palumbo 2026) show the 0.1 form over-predicts free phenytoin by about 75–200%.
- Acting on it would label sub-therapeutic HD patients "therapeutic" and withhold dose increases.
- 0.2 is less wrong but still over-predicts (Palumbo), so it should never replace a measured free level.
- A CrCl < 20 trigger (MDCalc) is a defensible alternative. CrCl < 10 / dialysis is chosen because Winter and Liponi derived the ESRD form in HD patients and describe CrCl 10–25 as unpredictable rather than ESRD-like.

**Confidence**: moderate that 0.1 should not be the default; low–moderate that 0.2 is the right number (n = 21 primary, coefficient V-2nd).

**Institutional choices**
- CrCl trigger (10 vs 20 vs 25).
- Whether the ESRD estimate is shown at all, or only a "measure free" block.
- The lab's free-assay temperature: at 37 °C, results move toward the older equations.

### Q2. Anderson 0.25 and Kane 0.29: primary papers

**Anderson GD, Pak C, Doane KW, Griffy KG, Temkin NR, Wilensky AJ, Winn HR.** *Revised Winter-Tozer equation for normalized phenytoin concentrations in trauma and elderly patients with hypoalbuminemia.* Ann Pharmacother 1997;31(3):279–84. PMID 9066931. doi:[10.1177/106002809703100301](https://doi.org/10.1177/106002809703100301) [V-PM].
- 46 elderly nursing-home patients (prospective) and 58 head-trauma patients (from an RCT).
- WT over-predicted: MPE 3.2 and 3.3; RMSE 5.9 and 4.8.
- The revision reflects **higher binding at room-temperature ultrafiltration**, and it reduced bias significantly.
- Equation `C/(0.25·Alb + 0.1)`: coefficient per ClinCalc [V-2nd]. The abstract does not print it.

**Kane SP, Bress AP, Tesoro EP.** *Characterization of unbound phenytoin concentrations in neurointensive care unit patients using a revised Winter-Tozer equation.* Ann Pharmacother **2013**;47(5):628–36. PMID 23606554. doi:[10.1345/aph.1R651](https://doi.org/10.1345/aph.1R651) [V-PM].
- n = 140 NICU adults; 80% derivation, 20% validation; mean free 1.4 µg/mL (fu 10%).
- Traditional WT under-predicted free, with 32% of patients having >50% error.
- Two new equations were derived: a revised WT (`C/(0.29·Alb + 0.1)` per ClinCalc [V-2nd]) and a regression model using albumin, total, sex and CrCl.
- **No "Kane 2016" was found.** The ICU 0.29 paper is 2013.

**Validation since**
- Cheng 2016 (n = 133, HD excluded): Anderson over-predicted free (MPE +0.5 µmol/L); Kane-1 slightly under-predicted (−0.2); Kane-2 under-predicted (−0.3). All performed poorly in critical care. New coefficient 0.275 [V-PM].
- Montgomery 2019: **Anderson had the highest P20 (82–92%)** with normal renal function [V-PM].
- Parikh L, MacLaren R. J Crit Care 2017;44:95–100. PMID 29078132. doi:[10.1016/j.jcrc.2017.10.028](https://doi.org/10.1016/j.jcrc.2017.10.028) [V-PM].
  - Medical ICU n = 30, 90 levels. ST, Kane, Anderson and Cheng were all biased and imprecise.
  - **Exogenous albumin negated** ST and Kane.
  - Estimating in the medical ICU is discouraged.
- Barra 2020: original WT had the smallest mean difference in their cohort (n = 81); no equation was accurate in ICU [V-PM].
- Palumbo 2026: active seizures with BUN < 50, **0.29 beat 0.2**; age < 65, **0.275 beat 0.2** [V-PM].

**RECOMMENDED DEFAULT**: Anderson 0.25 for non-ESRD.

**Superseded 2026-10-25 (pharmacist sign-off, safety-oriented):** the coefficient follows the lab's free-phenytoin assay temperature. Anderson's 0.25 was derived for room-temperature (25 °C) free assays (Anderson 1997 abstract). With a 37 °C assay, the original Winter-Tozer had the smallest bias and Anderson and Kane under-predicted free levels; Winter-Tozer missed about half of the supratherapeutic free levels in ICU patients (Barra 2020, PMID 32049893, full text PMC7377971, which also confirms the 0.25 and 0.29 coefficients). The tool therefore has a setting: 25 °C → Anderson 0.25 (ICU Kane 0.29); 37 °C or unknown → Winter-Tozer, the default, because it gives the higher corrected level and errs toward flagging toxicity. Dialysis and CrCl < 10 stay on Soriano 0.2 with the mandatory free-level banner (also signed off): both HD cohorts (Soriano 2017; Palumbo 2026, CF 0.201 vs 0.1, MPE −74% vs −198%) show the legacy 0.1 / Winter 0.48 form over-predicts free levels much more.

Alternatives:
- Kane 0.29 preset ("neuro-ICU"), which also performed better in Palumbo's active-seizure group.
- Cheng 0.275.
- Winter/WT 0.2 (legacy parity with the textbook and the workbooks).
- In any ICU patient, or after exogenous albumin, show the estimate greyed out with "measure free".

**Confidence**: moderate. The coefficients are V-2nd and should be checked against the PDFs before release.

**Institutional choice**: free-assay temperature. With 37 °C ultrafiltration, WT 0.2 is more appropriate than 0.25.

### Q3. Elderly Vmax

**Bauer LA, Blouin RA.** *Age and phenytoin kinetics in adult epileptics.* Clin Pharmacol Ther 1982;31(3):301–4. PMID 7060313. doi:[10.1038/clpt.1982.37](https://doi.org/10.1038/clpt.1982.37) [V-PM].
- n = 92, ages 21–78, no interacting drugs.
- Vmax **7.5 ± 2.2, 6.6 ± 1.8 and 6.0 ± 1.9 mg/kg/day** for 20–39, 40–59 and 60–79 y.
- Km 5.4–5.8 mg/L, not age-related.
- **Confirmed: 6.0 for 60–79 y.**

For ≥80 y there is **no Vmax/Km dataset**:
- Ahn JE, Cloyd JC, et al. Neurology 2008;71(1):38–43. PMID 18591503. doi:[10.1212/01.wnl.0000316392.55784.57](https://doi.org/10.1212/01.wnl.0000316392.55784.57) [V-PM].
  - Stable-isotope study, n = 63 (45 aged ≥65).
  - **No difference** in CL, V or t½ between healthy elderly and younger adults (mean t½ 40 h).
  - Lower dose needs may be pharmacodynamic.
- Wright DFB, Begg EJ. Br J Clin Pharmacol 2010;70(1):132–8. PMID 20642556. doi:[10.1111/j.1365-2125.2010.03673.x](https://doi.org/10.1111/j.1365-2125.2010.03673.x) [V-PM].
  - A non-significant trend to lower free-phenytoin apparent clearance in the elderly: 0.27 vs 0.37 and 0.12 vs 0.18 L/kg/day.
- Bachmann & Belloto 1999 (Drugs Aging 15:235, PMID 10503815) [V-PM]. A review with conflicting data. It advises lower starting doses in elderly patients on monotherapy, with TDM.

**RECOMMENDED DEFAULT**: ≥60 y Vmax 6.0, Km 5.8. Keep 6.0 for ≥80 y, flagged "no population data ≥80; titrate on levels". Use the Bayesian prior CV ≥ 0.35 on Vmax for age ≥80.

**Alternatives**: site/Murphy 7.0 (adult), or a further empirical reduction for ≥80 (no evidence base).

**Confidence**: moderate for 60–79; low for ≥80.

### Q4. Graves-Cloyd method: primary found

**Graves NM, Leppik IE, Termond E, Taylor JW.** *Phenytoin clearances in a compliant population: description and application.* Ther Drug Monit 1986;8(4):427–33. PMID 3824428. doi:[10.1097/00007691-198612000-00009](https://doi.org/10.1097/00007691-198612000-00009) [V-PM].
- Exact equation (abstract): **`new dose = first dose × Cpss(desired)^0.2 × Cpss(achieved)^−0.2`**.
- It was derived from an exponential CL–Css relation: 177 pairs from 59 compliant patients (Minnesota), validated in Iowa.
- It is "relatively precise, somewhat biased" and **under-predicts**. Mean under-prediction: PCM 46 mg; Bayesian 6; average-Vmax 21; average-Km 11. The authors advise rounding the calculated dose upward.
- **Bauer's form** `Dnew = (Dold/Cold)·Cnew^0.199·Cold^0.804` = `Dold·Cnew^0.199·Cold^−0.196`, which is the same equation with unrounded exponents.
- Test case 368 mg, 6.2 → 10 mg/L: 404.9 mg (abstract exponents) vs 406.9 mg (Bauer exponents).
- Because it is a dose ratio, the salt factor cancels when the product is unchanged.
- **The "Cloyd" in the eponym is not on this paper.** Cloyd co-authored Welty, Graves, Cloyd, Postgrad Med 1983;74(5):287–305 (PMID 6415634, no abstract), which may be the textbook's source [UNVERIFIED].
- Simulation: Toscano & Jameson 1986 (PMID 3720209) found "Graves" and Bayesian had the lowest mean error and MSE [V-PM].

**RECOMMENDED**:
- Implement as the optional "Graves (population-clearance) one-level" method using the 1986 exponents 0.2/−0.2.
- Show the Bauer variant only as a cross-check.
- Add the note "tends to under-predict; round up".
- Test: 368, 6.2, 10 → 405 ± 1 (abstract) / 407 ± 1 (Bauer).

**Confidence**: high (citation and equation); moderate (clinical role).

### Q5. Default Km for single-level adjustment

**Evidence**
- **Winter 6e Q2 [V-W6]**: assume Km 4 mg/L and back-solve Vmax. The orbit graph (Vozeh-Sheiner Bayesian) "is perhaps slightly superior" because it finds the most probable Vmax/Km pair.
- **Population Km**: Bauer & Blouin 1982 adult Km 5.4–5.8 [V-PM]; site 4.3 [unsourced].
- **Method comparisons**:
  - Graves 1986: average-Km under-predicted by a mean of 11 mg; Bayesian was best [V-PM].
  - Hudson SA et al. J Clin Pharm Ther 1990;15(1):25–34, PMID 2318914 [V-PM]. Elderly: similar precision across methods, but the **population-Km method tended to over-predict dose**, especially at low concentrations.
  - Pryka 1991 (PMID 1902764): Bayesian or individualized methods are superior [V-PM].

**Arithmetic**: for a dose *increase*, a smaller assumed Km gives a smaller increment. For example, 8 → 15 mg/L gives a dose ratio of 1.18 with Km 4 vs 1.24 with Km 5.8. Km 4 is therefore the conservative choice when titrating upward.

**RECOMMENDED DEFAULT**:
- Primary: one-level MAP Bayesian with age-banded Vmax/Km priors (from the `bayes` module; prior CV about 0.3 Vmax, 0.5 Km).
- Always also display the fixed-Km result with Km = 4 mg/L (Winter parity, conservative upward).
- Offer age-based population Km (5.7–6.8 pediatric, 5.8 elderly) as an alternative.
- Below a Css of about 5 mg/L, warn that all single-level methods are unreliable (Toscano: performance better above 8 mg/L).

**Confidence**: moderate.

### Q6. Cap the binding factor at 1?

**Evidence**
- WT is 1.0 at Alb 4.4. Anderson gives 1.20 and Kane 1.38 at Alb 4.4, so without a cap they would **lower** a normal-albumin patient's level by 17–27%. That would prompt dose increases.
- Montgomery 2019: with normal albumin and no displacer, the free fraction is unchanged and total reflects free [V-PM].
- MDCalc applies the correction only at Alb ≤ 3.2 g/dL [V-2nd].
- A denominator >1 reflects room-temperature fu <0.1, an assay artifact rather than a clinical signal.

**RECOMMENDED**: `Ccorr = C / min(1, denominator)` for every coefficient, with the uncapped value shown in an expandable detail.

**Alternative**: apply corrections only when Alb < 3.5 g/dL (institutional threshold 3.2–3.5).

**Confidence**: moderate–high.

---

## LITHIUM

### Q7. Dosing weight in obesity

**Reiss RA, Haas CE, Karki SD, Gumbiner B, Welle SL, Carson SW.** *Lithium pharmacokinetics in the obese.* Clin Pharmacol Ther 1994;55(4):392–8. PMID 8162665. doi:[10.1038/clpt.1994.47](https://doi.org/10.1038/clpt.1994.47) [V-PM].
- 10 obese subjects (110 ± 29 kg) vs 8 controls (63 kg); single dose of lithium citrate 31.4 mEq.
- **Li CL was higher in obese subjects: 33.9 vs 23.0 mL/min (+47%)**, and it correlated with **TBW**, *not* measured CrCl.
- **Vss/kg was lower: 0.42 vs 0.66 L/kg TBW.** Vss correlated with **IBW and FFM, not TBW**. The absolute Vss was about 46 vs 42 L.
- The authors conclude obese patients may need larger maintenance doses.

Other sources:
- Methaneethorn 2018 systematic review (PMID 28555320) [V-PM]: renal function and body size are the main CL covariates in popPK models.
- Millischer 2022 Lancet Psychiatry (PMID 35569502, n = 2357) [V-PM]: CL predictors were age, sex, eGFR, diuretics and RAAS agents. Weight was not retained as a top predictor in the abstract.
- **No study supports the Janmahasatian FFM for lithium CL specifically.**

**Implication**: maintenance dose depends only on CL. Under-estimating CL leads to under-dosing, which is the safer failure for lithium. V affects only loading and time course.

**Options**: (a) site min(FFM, TBW) for both CL and V; (b) Winter TBW; (c) split CL and V weights.

**RECOMMENDED DEFAULT**: split.
- **CL = 0.25 × CrCl**, with CrCl from Cockcroft-Gault using the suite-wide renal weight policy (TBW if TBW ≤ 1.3·IBW, else AdjBW).
- **V = 0.7 L/kg × TBW** if non-obese, else **× IBW** (option FFM). This matches Reiss: obese about 46 L, roughly 0.7 × FFM.
- Show the "Reiss: obese CL may be ~1.5× higher; titrate on 12-h level" note.
- Do **not** use FFM for CrCl in non-obese patients. FFM < TBW always, so min(FFM, TBW) systematically under-estimates CL by about 20–40% in lean patients.

**Confidence**: low–moderate (one small single-dose study).

**Institutional choice**: the obesity threshold and whether to use FFM vs IBW for V.

### Q8. 12-h targets

**Nolen WA, Licht RW, Young AH, et al.** ISBD/IGSLi Task Force. Bipolar Disord 2019;21(5):394–409. PMID 31112628. doi:[10.1111/bdi.12805](https://doi.org/10.1111/bdi.12805) [V-PM abstract].
- Adults (consensus): **0.60–0.80 mmol/L**. Reduce to 0.40–0.60 for good response with poor tolerance; raise to 0.80–1.00 for insufficient response with good tolerance.
- Children: no consensus, but the majority endorsed the same ranges.
- Elderly (majority, not consensus): **usually 0.40–0.60**, maximum 0.70 or 0.80 at 65–79 y, and **maximum 0.70 at ≥80 y**.

Other guidance:
- **NICE CG185** [V-2nd; NICE page returned HTTP 403]: 0.6–0.8 mmol/L at 12 h for first-time prescribing; 0.8–1.0 for at least 6 months for people who relapsed on lithium or have subthreshold symptoms with functional impairment.
- **CANMAT/ISBD 2018** (Yatham, PMID 29536616): acute mania 0.8–1.2 mmol/L [UNVERIFIED wording; recalled].
- Malhi GS et al. Aust Prescr 2020;43:91–3. PMID 32675910. doi:[10.18773/austprescr.2020.024](https://doi.org/10.18773/austprescr.2020.024) [V-FT]: maintenance 0.6–0.8, acute mania 0.6–1.0, depression 0.4–0.8, always 12 h post-dose.
- Grandjean & Aubry 2009, CNS Drugs 23:331, PMID 19374461 [V-PM]: with SR products, some advise a 12-h target of 0.8–1.0 because of the later peak.

**RECOMMENDED DEFAULT**:
- 12-h level of 0.6–0.8 (solve for 0.7).
- Presets: "low/tolerability" 0.4–0.6; "insufficient response" 0.8–1.0; "acute mania" 0.8–1.2 (upper bound flagged).
- Elderly 65–79 y: 0.4–0.6 (hard warning above 0.8).
- ≥80 y: 0.4–0.6 (hard warning above 0.7).
- Once-daily dosing: target the 12-h value (the 24-h trough differs).

**Confidence**: high for maintenance and elderly; moderate for acute mania.

### Q9. Interaction factors (CL multipliers)

| Drug | Best quantitative evidence | Recommended factor | Confidence |
|---|---|---|---|
| Thiazide | Finley, Warner, Peabody, Clin Pharmacokinet 1995;29(3):172–91, PMID 8521679, doi:[10.2165/00003088-199529030-00004](https://doi.org/10.2165/00003088-199529030-00004) [V-PM]: **levels ↑25–40%** after initiation (implies CL × 0.71–0.80). Winter: "lower Li dose by 50%" [V-W6]. Malhi 2020: "many prescribers halve the dose" [V-FT]. Juurlink 2004: thiazides not independently associated with toxicity admission [V-PM] | **0.75**; option "conservative 0.5 (halve dose)" | Moderate |
| ACE inhibitor | Finley PR, O'Brien JG, Coleman RW. J Clin Psychopharmacol 1996;16(1):68–71. PMID 8834421. doi:[10.1097/00004714-199602000-00011](https://doi.org/10.1097/00004714-199602000-00011) [V-PM]: n = 20, **levels +36.1%, CL −25.5%**, effect larger with age and rising SCr. Juurlink 2004 RR 7.6 for toxicity within 1 month of starting [V-PM] | **0.75**; suggest 0.65 if ≥65 y or SCr rising [judgement] | Moderate |
| ARB | Case reports only (e.g. valsartan, Bipolar Disord 2014, PMID 24372930; candesartan/olmesartan reports). Bisogni 2016 J Hypertens review (PMID 26630207) [V-PM]: severity predicted by RAAS inhibitors and diuretics. No CL study | **0.75** (by analogy with ACEi), flagged "no PK study" | Low |
| NSAID (regular, prescription dose) | Ragheb M. J Clin Psychopharmacol 1990;10(5):350–4, PMID 2258452 [V-PM]: effect varies widely; **indomethacin most potent**; ibuprofen and naproxen significant but variable; **no convincing effect of sulindac or aspirin**. Levin 1998 (PMID 9617983) [V-PM]: OTC naproxen 220 mg q8h × 5 d, no change. Finley 1995: large inter-individual differences. Magnitudes of +25–60% are [UNVERIFIED from abstracts] | **0.8** generic; **0.7** indomethacin; **1.0** aspirin, sulindac, short-course OTC naproxen | Low |
| Loop diuretic | Finley 1995: "minor variable effects" on Li PK [V-PM], **but** Juurlink 2004 RR 5.5 (1.9–16.1) for toxicity admission within 1 month in elderly patients (volume depletion) [V-PM] | **1.0** (no PK factor) plus a **red warning** to recheck level within 5–7 days | Low–moderate |

Implementation:
- Multiply the factors, with a floor of 0.4 on the product.
- Every factor triggers "check 12-h level 5–7 days after start or stop" (Malhi 2020; Ragheb: every 4–5 days for NSAIDs).
- Reversing a factor on discontinuation needs the same warning.

**Institutional choice**: thiazide 0.75 vs 0.5. The suite currently uses 0.5. That is safer against toxicity but predicts doses about 33% too low if the true effect is ×0.75.

### Q10. SR vs IR bioavailability

**Evidence**
- Winter 6e [V-W6]: IR or solution 95–100%; slow-release "may be more variable and can be as low as 85%".
- Arancibia A et al. Int J Clin Pharmacol Ther Toxicol 1986;24(5):240–5, PMID 3089949 [V-PM]: urinary recovery CR 90.2% vs IR 94.5% (relative about 0.95); Cmax 22% lower.
- Caldwell HC et al. J Clin Pharmacol 1981;21(2):106–9, PMID 6785324, doi:[10.1002/j.1552-4604.1981.tb01758.x](https://doi.org/10.1002/j.1552-4604.1981.tb01758.x) [V-PM]: "no loss of total bioavailability"; IR fluctuation 1.4× greater.
- Grandjean & Aubry 2009 [V-PM]: SR lowers peaks 30–50% "without major changes in AUC".
- Tyrer S et al. Psychol Med 1976;6(1):51–8, PMID 935297 [V-PM]: one older SR product was poorly absorbed in some subjects.

**RECOMMENDED DEFAULT**: F = 1.0 for IR, SR and citrate. Offer an SR option of 0.9 ("Winter lower bound") for IR↔SR conversions, and recommend a level 5–7 days after any product switch.

**Confidence**: moderate.

---

## PHENOBARBITAL

### Q11. Default CL and V by age

| Group | Evidence | Recommended |
|---|---|---|
| Adult | Winter 0.004 L/kg/h ("1 mg/kg/d → ~10 mg/L") [V-W6]. Messina 2005 controls 20–50 y: **0.0041 ± 0.0012** [V-PM]. Patsalos 2018 t½ 70–140 h with Vd 0.61 gives about 0.003–0.006 [V-FT]. The site's 0.0056 is at the high end and not traced to a source | **0.004** |
| Elderly ≥65 | **Messina S, Battino D, Croci D, Mamoli D, Ratti S, Perucca E.** Epilepsia 2005;46(3):372–7. PMID 15730534. doi:[10.1111/j.0013-9580.2005.47504.x](https://doi.org/10.1111/j.0013-9580.2005.47504.x) [V-PM]: n = 224 aged ≥65 (mean 73) vs 224 matched controls; CL/F **0.0032 ± 0.0008** vs 0.0041 L/kg/h. Winter 0.003 cites this paper | **0.0032** (Winter 0.003 acceptable; site 0.0024 too low) |
| Children 1–<12 y | Winter about 2× adult (0.008) [V-W6]. Botha JH, Gray AL, Miller R. Eur J Clin Pharmacol 1995;48(5):381–3, PMID 8641326, doi:[10.1007/BF00194954](https://doi.org/10.1007/BF00194954) [V-PM]: monotherapy **0.0076** (95% CI 0.0062–0.0090) L/kg/h | **0.008** |
| Adolescents 12–<18 | Site table 0.0052–0.0060 [unverified primary]; CL falls toward adult values | **0.006** (12–14), **0.005** (15–17) [low] |
| Infant 2 wk–1 y | CL rises with postnatal age. Yukawa E et al. J Clin Pharm Ther 2005;30(2):159–63, PMID 15811169 [V-PM]: CL (mL/h) = 3.41·WT + 1.64·PNA(weeks); e.g. 4 kg at 8 wk ≈ 0.0067 L/kg/h. Marsot A et al. Fundam Clin Pharmacol 2014;28(4):465–71, PMID 23855753 [V-PM]: 0.0054 L/kg/h, V 0.64 L/kg (0–206 days). Site table 0.0104 [unverified] | **Yukawa equation**, or 0.006 if a single value is needed; flag low confidence |
| Neonate (<2 wk) | **Grasela TH, Donn SM.** Dev Pharmacol Ther 1985;8(6):374–83. PMID 4075936. doi:[10.1159/000457062](https://doi.org/10.1159/000457062) [V-PM]: preterm n = 59, **CL 0.0047 L/kg/h (CV 19%), V 0.96 L/kg (CV 16%)**, t½ 141 h; V +13% with asphyxia. This is the source of the site's 0.0047 / 0.96. Winter 0.004 / 0.9 (0.7–1.0) [V-W6]. Šíma 2021 review (PMID 33668911): actual weight is the best covariate; LD 15–20 mg/kg, MD 3–5 mg/kg/d [V-PM] | **CL 0.0047, V 0.96** (primary popPK; Winter 0.004/0.9 as option). The difference is <7% for V |
| V, non-neonates | Winter 0.7 [V-W6]; Patsalos 2018 0.61 [V-FT] (likely the site's source) | **0.7** (option 0.61) |

The two V values are both sourced and differ by 13%. Winter 0.7 is kept for parity with the textbook cases in `tests/`.

**Confidence**: moderate for adult, elderly, child and neonate; low for infant and adolescent.

**Institutional choices**: neonatal V 0.96 vs 0.9 (immaterial); ECMO and hypothermia need specific models (not covered).

### Q12. Target range

**Evidence**
- **Patsalos PN, Spencer EP, Berry DJ.** *TDM of antiepileptic drugs in epilepsy: a 2018 update.* Ther Drug Monit 2018;40(5):526–48. PMID 29957667. doi:[10.1097/FTD.0000000000000546](https://doi.org/10.1097/FTD.0000000000000546) [V-FT, UCL accepted manuscript].
  - "The current reference range for phenobarbital in plasma is **10–40 mg/L**" (43–172 µmol/L), citing Patsalos 2008.
  - Phenytoin 10–20 mg/L. No free-phenytoin range is given; free monitoring is marked "useful".
  - It stresses that a reference range is not a therapeutic range.
- Winter 6e [V-W6]: 10–30 is usually needed; the "overall therapeutic range now 15–40 mg/L".
- MSD Manual table: 10–30 [V-2nd].

**RECOMMENDED DEFAULT**: reference band 10–40 mg/L (ILAE/Patsalos), with a default *dose-solve* target of 20 mg/L. Show Winter's 15–40 as a "usual therapeutic" overlay. Keep the indication presets (e.g. neonatal 20–40, SE ≥20 [institutional]).

**Confidence**: high (the citation is now verified).

### Q13. Valproate interaction; rectal dosing

**Valproate**
- **Vučićević K, Jovanović M, Golubović B, et al.** Eur J Clin Pharmacol 2015;71(2):183–90. PMID 25380628. doi:[10.1007/s00228-014-1778-7](https://doi.org/10.1007/s00228-014-1778-7) [V-PM].
  - NONMEM, 136 adults. VPA daily dose was the significant CL/F covariate.
  - **1000 mg/d → CL −25%; 2000 mg/d → −50%.**
  - This is the primary source behind Winter Q7 (ref 26) [V-W6].
- Mechanism: metabolic inhibition (Kapetanović 1981, PMID 6781810) [V-PM].
- Children: Botha 1995, VPA multiplier 0.62 (dose not specified) [V-PM].

**RECOMMENDED**: `factor = max(0.5, 1 − 0.25 × VPA_mg_day/1000)`, with a "recheck level at 2–3 weeks" warning. For children, use 0.62 as a flat factor [low] or mg/kg scaling [institutional]. **Confidence**: moderate–high (adults).

**Rectal**
- **Graves NM, Holmes GB, Kriel RL, et al.** *Relative bioavailability of rectally administered phenobarbital sodium parenteral solution.* DICP 1989;23(7–8):565–8. PMID 2763578. doi:[10.1177/1060028089023007-806](https://doi.org/10.1177/1060028089023007-806) [V-PM].
  - 7 adults, 5 mg/kg rectal vs IM. **Relative F 90%**, tmax 4.4 vs 2.1 h.
- Matsukura 1981 (PMID 7346746) and Yukawa 2005 (suppository F = 1) [V-PM].
- The sodium salt factor applies: S = 0.91 (232.24/254.22) [V-W6; arithmetic].

**RECOMMENDED**: rectal administration of the **injectable sodium solution**: S 0.91 × F 0.9 (effective 0.82 vs oral acid tablet). Commercial suppository: F 1.0, with S per the product's labelled salt [institutional]. **Confidence**: moderate–high.

---

## Items still unverified (check before release)

1. Soriano 2017 full text: exact revised equation form, assay temperature, mean albumin. The coefficient 0.2 is from ClinCalc and MDCalc; **partly checked 2026-10-25**: Palumbo 2026 (abstract) tested "CF 0.201" against 0.1 in its intermittent-HD cohort, which corroborates a coefficient of about 0.2. Soriano's own text is still unread (paywalled).
2. ~~Anderson 0.25 and Kane 0.29 coefficients~~ **Verified 2026-10-25** in the peer-reviewed full text of Barra 2020 (PMC7377971): Anderson proposed "an interaction coefficient with albumin of 0.25 instead of the traditional 0.2" for free levels measured at room temperature; Kane proposed 0.29 in neuro-ICU patients. Barra's lab assayed free phenytoin at 37 °C, and there the original Winter-Tozer equation had the smallest bias while Anderson and Kane under-predicted free levels more. **The non-ESRD coefficient depends on the lab's free-assay temperature** (open question for sign-off).
3. ter Heine 2019 mechanistic-model parameters, including the definition of "severe renal dysfunction".
4. Palumbo 2026: size of the IHD subgroup and the free-assay method.
5. NICE CG185 recommendation wording and numbers (page blocked); the CANMAT 2018 acute-mania range.
6. NSAID magnitudes per agent (Ragheb abstracts give direction only).
7. "Graves-Cloyd" eponym source (Bauer's citation). The method itself is Graves 1986.
8. Site phenobarbital table values for infants and adolescents (0.0104, 0.0052–0.0060) and the adult 0.0056.

## References (all PMIDs resolved via PubMed this session unless marked)

- Anderson GD, et al. Ann Pharmacother 1997;31:279–84. PMID 9066931. https://doi.org/10.1177/106002809703100301
- Kane SP, Bress AP, Tesoro EP. Ann Pharmacother 2013;47:628–36. PMID 23606554. https://doi.org/10.1345/aph.1R651
- Soriano VV, Tesoro EP, Kane SP. Ann Pharmacother 2017;51:669–74. PMID 28470115. https://doi.org/10.1177/1060028017707541
- Palumbo AM, et al. Ann Pharmacother 2026 (epub). PMID 42557917. https://doi.org/10.1177/10600280261470029
- Cheng W, Kiang TK, Bring P, Ensom MH. Can J Hosp Pharm 2016;69:269–79. PMID 27621486. https://doi.org/10.4212/cjhp.v69i4.1573
- Montgomery MC, et al. Pharmacotherapy 2019;39:756–66. PMID 31067355. https://doi.org/10.1002/phar.2273
- Barra ME, et al. Ther Drug Monit 2020;42:617–25. PMID 32049893. https://doi.org/10.1097/FTD.0000000000000739
- Parikh L, MacLaren R. J Crit Care 2018;44:95–100. PMID 29078132. https://doi.org/10.1016/j.jcrc.2017.10.028
- Khan AM, Marvanova M. Consult Pharm 2017;32:461–7. PMID 29029667. https://doi.org/10.4140/TCP.n.2017.461
- ter Heine R, et al. Br J Clin Pharmacol 2019;85:2360–8. PMID 31269540. https://doi.org/10.1111/bcp.14053
- Temme PP, et al. Eur J Clin Pharmacol 2025;81:1833–9. PMID 40924145. https://doi.org/10.1007/s00228-025-03918-3
- Liponi DF, Winter ME, Tozer TN. Neurology 1984;34:395–7. PMID 6538287. https://doi.org/10.1212/wnl.34.3.395
- Hong JM, Choi YC, Kim WJ. Yonsei Med J 2009;50:517–20. https://doi.org/10.3349/ymj.2009.50.4.517 (PMID not looked up)
- Jun H, …, Kiang TKL. Drugs R D 2020;20:343–58. PMID 33026608. https://doi.org/10.1007/s40268-020-00323-2
- Bauer LA, Blouin RA. Clin Pharmacol Ther 1982;31:301–4. PMID 7060313. https://doi.org/10.1038/clpt.1982.37
- Ahn JE, Cloyd JC, et al. Neurology 2008;71:38–43. PMID 18591503. https://doi.org/10.1212/01.wnl.0000316392.55784.57
- Wright DFB, Begg EJ. Br J Clin Pharmacol 2010;70:132–8. PMID 20642556. https://doi.org/10.1111/j.1365-2125.2010.03673.x
- Bachmann KA, Belloto RJ. Drugs Aging 1999;15:235–50. PMID 10503815. https://doi.org/10.2165/00002512-199915030-00006
- Graves NM, Leppik IE, Termond E, Taylor JW. Ther Drug Monit 1986;8:427–33. PMID 3824428. https://doi.org/10.1097/00007691-198612000-00009
- Welty TE, Graves NM, Cloyd JC. Postgrad Med 1983;74:287–305. PMID 6415634. https://doi.org/10.1080/00325481.1983.11698512 (not read)
- Toscano JP, Jameson JP. Clin Pharm 1986;5:396–402. PMID 3720209.
- Hudson SA, Farquhar DL, Thompson D, Smith RG. J Clin Pharm Ther 1990;15:25–34. PMID 2318914. https://doi.org/10.1111/j.1365-2710.1990.tb00352.x
- Pryka RD, Rodvold KA, Erdman SM. Clin Pharmacokinet 1991;20:209–17. PMID 1902764. https://doi.org/10.2165/00003088-199120030-00003
- Reiss RA, et al. Clin Pharmacol Ther 1994;55:392–8. PMID 8162665. https://doi.org/10.1038/clpt.1994.47
- Methaneethorn J. Eur J Drug Metab Pharmacokinet 2018;43:25–34. PMID 28555320. https://doi.org/10.1007/s13318-017-0421-2
- Millischer V, et al. Lancet Psychiatry 2022;9:447–57. PMID 35569502. https://doi.org/10.1016/S2215-0366(22)00100-6
- Nolen WA, et al. Bipolar Disord 2019;21:394–409. PMID 31112628. https://doi.org/10.1111/bdi.12805
- Yatham LN, et al. Bipolar Disord 2018;20:97–170. PMID 29536616. https://doi.org/10.1111/bdi.12609 (ranges not re-read)
- Malhi GS, et al. Aust Prescr 2020;43:91–3. PMID 32675910. https://doi.org/10.18773/austprescr.2020.024
- Grandjean EM, Aubry JM. CNS Drugs 2009;23:331–49. PMID 19374461. https://doi.org/10.2165/00023210-200923040-00005
- Finley PR, Warner MD, Peabody CA. Clin Pharmacokinet 1995;29:172–91. PMID 8521679. https://doi.org/10.2165/00003088-199529030-00004
- Finley PR, O'Brien JG, Coleman RW. J Clin Psychopharmacol 1996;16:68–71. PMID 8834421. https://doi.org/10.1097/00004714-199602000-00011
- Juurlink DN, et al. J Am Geriatr Soc 2004;52:794–8. PMID 15086664. https://doi.org/10.1111/j.1532-5415.2004.52221.x
- Ragheb M. J Clin Psychopharmacol 1990;10:350–4. PMID 2258452.
- Levin GM, Grum C, Eisele G. J Clin Psychopharmacol 1998;18:237–40. PMID 9617983. https://doi.org/10.1097/00004714-199806000-00009
- Bisogni V, et al. J Hypertens 2016;34:20–8. PMID 26630207. https://doi.org/10.1097/HJH.0000000000000758
- Arancibia A, et al. Int J Clin Pharmacol Ther Toxicol 1986;24:240–5. PMID 3089949.
- Caldwell HC, et al. J Clin Pharmacol 1981;21:106–9. PMID 6785324. https://doi.org/10.1002/j.1552-4604.1981.tb01758.x
- Tyrer S, et al. Psychol Med 1976;6:51–8. PMID 935297. https://doi.org/10.1017/s0033291700007492
- Messina S, et al. Epilepsia 2005;46:372–7. PMID 15730534. https://doi.org/10.1111/j.0013-9580.2005.47504.x
- Botha JH, Gray AL, Miller R. Eur J Clin Pharmacol 1995;48:381–3. PMID 8641326. https://doi.org/10.1007/BF00194954
- Grasela TH, Donn SM. Dev Pharmacol Ther 1985;8:374–83. PMID 4075936. https://doi.org/10.1159/000457062
- Touw DJ, et al. Eur J Pharm Sci 2000;12:111–6. PMID 11102738. https://doi.org/10.1016/s0928-0987(00)00145-7
- Yukawa E, et al. J Clin Pharm Ther 2005;30:159–63. PMID 15811169. https://doi.org/10.1111/j.1365-2710.2005.00619.x
- Marsot A, et al. Fundam Clin Pharmacol 2014;28:465–71. PMID 23855753. https://doi.org/10.1111/fcp.12042
- Šíma M, et al. Pharmaceutics 2021;13:301. PMID 33668911. https://doi.org/10.3390/pharmaceutics13030301
- Patsalos PN, Spencer EP, Berry DJ. Ther Drug Monit 2018;40:526–48. PMID 29957667. https://doi.org/10.1097/FTD.0000000000000546 (accepted manuscript via UCL Discovery)
- Vučićević K, et al. Eur J Clin Pharmacol 2015;71:183–90. PMID 25380628. https://doi.org/10.1007/s00228-014-1778-7
- Kapetanović IM, et al. Clin Pharmacol Ther 1981;29:480–6. PMID 6781810. https://doi.org/10.1038/clpt.1981.66
- Graves NM, Holmes GB, Kriel RL, et al. DICP 1989;23:565–8. PMID 2763578. https://doi.org/10.1177/1060028089023007-806
- Matsukura M, et al. Pediatr Pharmacol 1981;1:259–65. PMID 7346746.
- Beringer PM (ed). *Winter's Basic Clinical Pharmacokinetics*, 6th ed. 2018: ch. 12, 13, 14 (local PDF).
- Secondary: ClinCalc phenytoin correction (https://clincalc.com/phenytoin/correction.aspx); MDCalc phenytoin correction (https://www.mdcalc.com/calc/333/phenytoin-dilantin-correction-albumin-renal-failure); NHS lithium pages (gloshospitals.nhs.uk, nbt.nhs.uk).

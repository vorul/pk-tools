# Vancomycin: literature cross-check

Scope: `specs/vanco-auc.md`, `specs/vanco-bayesian.md`, `specs/vanco-charts-hd.md`, `specs/two-comp-auc.md`, `specs/bayesian-engine.md`, and the vancomycin references in `specs/core-equations.md` §5. Compiled 2026-10-23.

Each fact below is tagged with how it was checked:
- **[V]** read in the primary source or its PubMed abstract during this check.
- **[V2]** read in a secondary source that reproduces the primary source; the primary itself was paywalled.
- **[R]** recalled but not verified in this session. Confirm before coding it as fact.

Specs were not edited.

---

## 1. Cross-check table

Verdict codes: **agrees**, **minor difference**, **site outdated**, **site wrong**, **unverifiable**.

### 1a. Targets, monitoring and dosing limits (Rybak 2020 consensus guideline)

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| Efficacy/safety target | AUC24 400–600 mg·h/L | AUC24/MIC(BMD) 400–600, assuming MIC 1 mg/L (A-II) [V] | Rybak MJ et al., *Am J Health Syst Pharm* 2020;77:835-864. PMID 32191793. doi:10.1093/ajhp/zxaa036 | agrees | Default 400–600. Keep the MIC input fixed at 1 unless the user overrides it. |
| Trough-only monitoring (charts, trough page) | Site says it is "no longer recommended", but still ships trough charts and a trough-only AUC | "Trough-only monitoring, with a target of 15 to 20 mg/L, is no longer recommended" (A-II) [V] | Rybak 2020; Neely 2014 *AAC* 58:309 (PMID 24165176): trough-only data underestimated AUC by 23% without a Bayesian prior [V] | agrees (site caveat is correct) | Ship the charts only as a legacy/educational tool with a banner. Warn on trough-only first-order AUC. |
| AUC estimation methods | Peak+trough first-order (Sawchuk-Zaske); 1-comp MAP Bayesian; trough-only K fit | Bayesian software is preferred (A-II). Two concentrations with first-order equations are an acceptable alternative (A-II). A trough alone may suffice *with Bayesian* in some patients (B-II). Peak drawn 1–2 h after the end of infusion [V] | Rybak 2020; Pai MP et al., *Adv Drug Deliv Rev* 2014;77:50-57, PMID 24910345 [V abstract] | agrees | Keep both methods. Label the trough-only non-Bayesian K-fit (Mode A) as "not guideline-supported". |
| Two-level AUC formula | `AUC = [(Cmax−Cmin)/K + (Cmax+Cmin)·T′/2]·24/τ`, with Cmax and Cmin back-extrapolated | Linear trapezoid during the infusion plus log/exponential decline after it, from 2 steady-state levels (Pai 2014 approach) [R for exact notation; the method is V in the abstract] | Pai 2014; Chanapiwat 2023 *Pharmacol Res Perspect* (PMID 36588162); Olney 2022 *Pharmacotherapy* (PMID 35134264) | agrees | Implement as specified. Also show `Dose/CL·24/τ`. The two agree within <1%. |
| Loading dose (non-HD) | 25 mg/kg TBW (label), or the Cp-40 equation; prose 20–25 mg/kg; max 3 g | 20–35 mg/kg actual BW, not exceeding 3000 mg (B-II) [V] | Rybak 2020 | minor difference | Default 25 mg/kg ABW, configurable 20–35, cap 3000 mg. Drop the Cp-40 equation as the default: with Vd 0.65 L/kg it gives about 26–30 mg/kg, which is inside the guideline range but not guideline-derived. |
| Loading dose (obese) | No separate rule | 20–25 mg/kg ABW, max 3000 mg (B-II) [V] | Rybak 2020 | site outdated | Cap the mg/kg at 25 when BMI ≥ 30. |
| Max maintenance dose | None stated | Empiric maintenance in obese adults "usually do[es] not exceed 4,500 mg/day" (B-II) [V] | Rybak 2020; Adane 2015 *Pharmacotherapy* 35:127 (PMID 25644478): 4000–5000 mg/day in BMI ≥ 40 [V] | site outdated | Warn when the empiric daily dose is > 4500 mg/day. Add no hard cap on level-guided doses. |
| Continuous infusion | Css 20–25 mg/L (AUC 480–600) | LD 15–20 mg/kg, then 30–40 (up to 60) mg/kg/day, targeting Css 20–25 mg/L (B-II) [V] | Rybak 2020 | agrees | Keep it. AUC = Css × 24. |
| Infusion rate | 1000 mg/h label; ≤15 mg/min prose | ≤ 1 g/h (about 15 mg/min) is the conventional label rate [R] | Product labeling [R] | agrees | Warn at > 1000 mg/h. |
| Sampling | Peak 2 h post-infusion plus trough after the same dose; steady state after 3–5 doses | Peak 1–2 h post-infusion plus trough. Bayesian methods do not need steady state [V] | Rybak 2020 | minor difference | Accept peaks ≥ 1 h post-infusion. Warn under 1 h. The site's ≥ 2 h is acceptable but stricter. |

### 1b. One-compartment population model (site regression)

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| K regression | K = 0.00107·CrCl(mL/min/1.73 m², C-G with min(IBW,TBW)) + 0.0052. Own data, 2007, n = 107 | (a) Matzke: CL_vanco (mL/min) = 3.66 + 0.689·CrCl; t½ 9.1 / 32.3 / 146.7 h by CrCl group [V abstract]. (b) Textbook form of Matzke: K = 0.00083·CrCl + 0.0044 with V 0.7 L/kg [R, Bauer *Applied Clinical Pharmacokinetics*]. (c) Rodvold 1988: dose (mg/kg/24 h) = 0.227·CrCl + 5.67 (CrCl per 70 kg); CL 98.4 / 52.6 / 31.3 mL/min/1.73 m² by group [V abstract] | Matzke GR et al., *AAC* 1984;25:433-7, PMID 6732213, doi:10.1128/AAC.25.4.433. Rodvold KA et al., *AAC* 1988;32:848-52, PMID 3415206, doi:10.1128/AAC.32.6.848 | minor difference (site-specific, unpublished, not peer-reviewed) | Keep it as the "site model" for parity. It predicts **higher** CL than Matzke: at CrCl_norm 100 and 70 kg, site CL ≈ 5.1 L/h vs Matzke ≈ 4.4 L/h. Site t½ is 6.2 h vs about 7.9 h with the textbook Matzke K. This lands between Matzke and Rodvold. Offer Matzke as an alternate prior. |
| Matzke K quoted by the site | K = 0.00083·CrCl + 0.0044 | Matzke's paper gives CL, not K. The K form is the textbook transformation [R] | Matzke 1984 [V]; Bauer [R] | agrees (as a textbook form) | Label it "Matzke (textbook form)". |
| Vd (non-obese) | 0.65 L/kg TBW | Vss 0.72–0.90 L/kg (Matzke) [V]. Textbook 0.7 L/kg [R]. Blouin 1982: 0.39 L/kg in normal-weight subjects [V]. Rybak 2020 cites 0.68 L/kg normal weight [V] | Matzke 1984; Blouin RA et al., *AAC* 1982;21:575-80, PMID 7081978; Rybak 2020 | agrees (within the published range) | Keep 0.65 L/kg as the default for non-obese patients. |
| Vd (obese) | 0.65 L/kg TBW, uncapped | Vd does not scale proportionally with ABW: about 0.5 L/kg in obese adults, 0.32 L/kg in morbid obesity vs 0.68 normal (Rybak 2020) [V]. Adane 2015: 0.51 L/kg TBW at BMI ≥ 40 (median 148 kg) [V]. Blouin 1982: 0.26 L/kg TBW in morbid obesity [V] | Rybak 2020; Adane 2015 PMID 25644478 doi:10.1002/phar.1531; Blouin 1982 | **site outdated** | For BMI ≥ 30 use 0.5 L/kg TBW, or an obesity model (Smit 2020, site ref 45). A 0.65 L/kg prior overstates Vd by about 30%. That inflates LDs (masked by the 3 g cap) and biases MAP Vd estimates. Needs clinician sign-off (§3). |
| CrCl weight | min(IBW, TBW), even in obese patients; per 1.73 m² normalization | No single standard. Goti used C-G (weight not verified) [V2]. Obese models (Adane, Smit) use TBW-based covariates [V abstract] | — | unverifiable (site-specific) | Keep it for the site model. Use each published model's own CrCl definition when that model is selected. |
| SCr floor 0.7 mg/dL | Applied in the workbook | Goti: SCr floored at 1.0 mg/dL if age > 65, CrCl capped at 150 [V2]. A later "modified Goti" removed the elderly floor and predicted better [V2, InsightRX 2026] | Mena 2023 *Antibiotics* 12:301 (PMID 36830212, PMC9952184); JAC-AMR 2026 dlag016 (PMID 41710913) | minor difference | Make the SCr floor and CrCl cap model-specific settings. |

### 1c. Two-compartment Goti model

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| CL | "Modified Goti" CL = **6.04**·(CrCl/120)^0.8. The MC #2 page uses **4.5** | CL = **4.5**·(CrCl/120)^0.8·**0.7^DIAL** L/h [V2: two secondary sources agree] | Goti V et al., *Ther Drug Monit* 2018;40(2):212-221, PMID 29470227, doi:10.1097/FTD.0000000000000490 (erratum *TDM* 2019;41(4):549, content not located). Reproduced in Mena 2023 Table 2 (PMC9952184) and *Clin Transl Sci* 2023 (PMC10651648, doi:10.1111/cts.13626) | **site's 6.04 is unverifiable** (no published source). The 4.5 variant agrees | Ship published Goti (4.5) as "Goti 2018". If the site's variant is kept, label it "site-modified (unpublished)". The factor 6.04/4.5 = 1.34 roughly matches the site's own 1-comp CL at CrCl 120 and 70 kg (0.1336 h⁻¹ × 45.5 L = 6.08 L/h), so the modification was **probably** a rescaling to the site's regression (inference). External data show published Goti over-predicts concentrations (under-predicts CL) a priori in non-ICU patients with normal renal function: rBias +34% (*J Pharmacokinet Pharmacodyn* 2026, PMID 42800832) [V abstract]. So the direction of the site's change is plausible, but its magnitude is unvalidated. |
| V1 (Vc) | 58.4·WT/70 | 58.4·(TBW/70)·**0.5^DIAL** L [V2] | as above | agrees (non-HD); site lacks the HD term | Add the DIAL term. |
| V2 (Vp) | Modified: 38.4·WT/70 (weight-scaled). MC #2: 38.4 fixed | **38.4 L, fixed (no weight or dialysis scaling)** [V2] | as above | **site wrong** (modified variant) | Vp = 38.4 L, not weight-scaled. |
| Q | 6.5 L/h | 6.5 L/h, no IIV ("fixed") [V2] | as above | agrees | — |
| Dialysis effects | None on the site | CL × 0.7 and V1 × 0.5 when DIAL = 1. The abstract says HD was significant on Vc and Vp in building, but the final model kept it on CL and Vc [V abstract + V2] | Goti 2018 abstract [V] | site incomplete | Implement DIAL only if the 2-comp tool will be offered for HD. The site keeps HD separate (its MUE model), which is acceptable. |
| CrCl rules | "Use adjusted BW when TBW > LBW"; equation unspecified | C-G; CrCl capped at 150 mL/min; SCr floored at 1 mg/dL if age > 65 [V2, Mena 2023 only]. Weight used in C-G not found | Mena 2023 | unverifiable / minor difference | Cap at 150. Make the elderly SCr floor a toggle, defaulting **off** per the modified-Goti evidence. Needs sign-off. |
| IIV | Prior CV 0.3 for all 4 parameters (MC #2) | CL **39.8%**, V1 **81.6%**, V2 **57.1%**, Q none [V2: two sources agree] | Mena 2023; *Clin Transl Sci* 2023 | **site outdated / inconsistent with model** | Use the published IIV when Goti is the prior. Note that `specs/two-comp-auc.md` §3.1 recalls V2 IIV as **74.1%**, which is **wrong** (published 57.1%). |
| Residual error | Assay CV 0.1, weighted on the observed level | **22.7% proportional + 3.4 mg/L additive** [V2: *Clin Transl Sci* 2023]. Mena 2023 prints "σ1 = 5.13, σ2 = 3.4 (SD mg/L)", probably mislabelled | as above | site differs | Use combined error σ² = (0.227·Ĉ)² + 3.4², on the **predicted** concentration. Confirm against the Goti paper or erratum before release. |
| Vss vs 1-comp Vd | — | Goti non-HD Vss = 96.8 L per 70 kg (about 1.38 L/kg), roughly 2× the 1-comp 0.65 L/kg | derived | (context) | Never use Vss × C for the LD with Goti. Use the exact first-infusion LD form (`two-comp-auc.md` §4.6), or cap at 3 g. |
| 1-comp vs 2-comp AUC | 1-comp fitted to a post-distribution peak plus trough is adequate | 1-comp underestimates AUC by < 10% vs 2-comp/NCA [V abstract] | Shingde RV et al., *TDM* 2019;41:726-31, PMID 31725694 | agrees | — |

### 1d. Bayesian prior and error assumptions

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| Prior CV, CL | 0.30 (normal, linear) | Goti 39.8% (2-comp). One-compartment models typically report about 25–45% [R; e.g. Llopis 29.2%, Revilla 30.1% per Mena 2023 Table 2, V2] | Mena 2023 | minor difference | Default **0.35** for the site 1-comp model. Use the published IIV for published models. Keep 0.30 in "site-parity" mode. |
| Prior CV, Vd | 0.30 | Revilla 1-comp V 22.8%; Goti Vc 81.6% [V2] | Mena 2023 | agrees (1-comp) | 0.30 for 1-comp. |
| Prior distribution | Normal on the linear scale | Population models use log-normal IIV (NONMEM exponential η) [R, standard] | — | minor difference | Default log-normal (ω² = ln(1+CV²)). Normal is a parity option. `bayesian-engine.md` already proposes this. |
| Residual error | Proportional, CV 0.1 × **observed** level ("assay CV") | Model residual errors are much larger than assay error: Goti 22.7% + 3.4 mg/L [V2]; Llopis/Revilla additive SDs of about 4–5 mg/L [V2]. Assay CV alone (about 5–10%) omits timing and model error [R] | Mena 2023; *Clin Transl Sci* 2023 | **site understates residual error** | Default combined error on the predicted value: about 15% proportional + 1–2 mg/L additive for the site 1-comp model (proposal), or the published σ for published models. CV 0.1 on observed values overweights levels and makes trough-only MAP behave like a non-Bayesian fit. |
| Trough-only Bayesian | Allowed; MC sensitivity 81% | Acceptable in some patients (B-II); a rich prior is needed [V] | Rybak 2020; Neely 2014 | agrees | — |

### 1e. Hemodialysis

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| LD, dose after HD | 25 mg/kg TBW, cap 3000 mg | 25 mg/kg (low and high permeability) [V] | Rybak 2020 table | agrees | Keep it. |
| LD, intradialytic | 35 mg/kg | High-permeability 35 mg/kg; low-permeability 30 mg/kg [V] | Rybak 2020 | agrees (high-flux) | Use 30 mg/kg if the low-flux path is ever enabled. |
| LD, older literature | 2016 MUE: 20–25 mg/kg | 20–25 mg/kg [V abstract]; Brown 2011: ABW-based LD predictably reaches therapeutic levels [V abstract] | Vandecasteele SJ, De Vriese AS, *Semin Dial* 2011;24:50-5, PMID 21338394; Brown M et al., *CID* 2011;53:164-6, PMID 21690623 | agrees | — |
| MD after HD | Flat 750 mg (range 750–1000); legacy weight tiers 500/750/1000 | High-permeability **10 mg/kg** (low 7.5 mg/kg) after each session, three times weekly [V]. Barth 1996: 500 mg after each HD after a 20 mg/kg LD gave a mean pre-HD level of 15.9 [V]. Heintz 2009: 500–1000 mg or 5–10 mg/kg after each IHD [R] | Rybak 2020; Barth RH, DeVincenzo N, *Kidney Int* 1996;50:929-36, PMID 8872968; Heintz BH et al., *Pharmacotherapy* 2009;29:562-77, PMID 19397464 | minor difference | Default 10 mg/kg ABW rounded to 250 mg, **or** flat 750 mg per the site MUE. These agree for 60–90 kg and diverge for very heavy or light patients. Sign-off needed. |
| MD intradialytic | 1000–1250 mg | 10–15 mg/kg high-flux (7.5–10 low-flux) [V] | Rybak 2020 | agrees | — |
| 72 h interdialytic gap | "72 h gap needs more drug" (no rule) | "25% larger doses are needed for the 3-day interdialytic period" [V] | Rybak 2020 | site incomplete | Add +25% for the dose before the long gap. |
| Fraction removed | 30–46% intra-HD; ~33% post-HD dose (MUE) | Intradialytic 20–40% (Rybak) [V]; 35 ± 15% (Nyman, Polyflux) [V]; 39 ± 13% (Pai & Pai) [V]; Pollard: 17% of body stores in 2 h HF-HD [V] | Rybak 2020; Nyman HA et al., *Hemodial Int* 2018;22:383-7, PMID 29380499; Pai AB, Pai MP, *AJHP* 2004;61:1812-6, PMID 15462252; Pollard TA et al., *Kidney Int* 1994;45:232-7, PMID 8127014 | agrees | — |
| Pre-HD goal | 15–20 mcg/mL (or 20–25 by indication) | 15–20 mg/L likely achieves AUC 400–600 (C-III); monitor pre-HD at least weekly (B-II) [V]. Vandecasteele: 15–20 [V] | Rybak 2020 | agrees (15–20). 20–25 is not guideline-supported | Default 15–20. Allow 20–25 only with sign-off. |
| Post-HD level timing | Wait ≥ 6 h (rebound up to 12 h, 20–40%) | Post-HD rebound to 87% of the pre-HD concentration (Pollard) [V]. Rybak recommends pre-HD sampling [V] | Pollard 1994; Rybak 2020 | agrees | Warn on levels < 6 h post-HD. Prefer pre-HD sampling. |
| Low-flux HD | ~8% removed, "no supplemental dose" | Low-permeability: after-HD MD 7.5 mg/kg three times weekly; LD 25 or 30 (intra) [V] | Rybak 2020 | **site outdated** | Do not claim "no dose needed". Either block low-flux or use the Rybak low-permeability row. Modern US HD is almost entirely high-flux [R]. |
| HD PK parameters | Vd 1.03 L/kg; CL_nonHD 0.46 L/h; CL_HD 4.08 L/h (2020 MUE). 2016: 1.17 L/kg, 0.33, 6.9 | ESRD Vss 0.72–0.90 L/kg (Matzke group III) [V]. Pollard: HD CL about 120 mL/min (7.2 L/h) vs endogenous 9 mL/min (0.54 L/h) [V]. AAC 2023 MIPD-HD model: non-HD CL 0.316 L/h [V abstract, PMID 37195225] | Matzke 1984; Pollard 1994; *AAC* 2023 e00089-23 | minor difference (site-specific institutional fit) | Keep the 2020 MUE values as defaults for parity. They fall within the published ranges. Present them as "institutional MUE (unpublished)". |
| HD AUC regression | AUC (mg·day/L) = 24.715·trough + 53.958 | Not found in peer-reviewed literature | — | unverifiable | Display as "site MUE estimate" only. |
| Adjustment outside 15–20 | 10–<15: +≤250 mg; 15–20: no change; ≥25–30: −250–500; >25: hold. **20–25 is undefined; <10 is undefined; ">25 hold" overlaps "25–30 decrease"** | No graded rule in Rybak 2020 [V]. Crew 2015 reviews institutional algorithms without one standard [V abstract] | Crew P et al., *AJHP* 2015;72:1856-64, PMID 26490819 | **site incomplete / internally inconsistent** | Clinician sign-off required (§3). |

### 1f. Site reference list (core-equations §5): existence and accuracy

All vancomycin references were found in PubMed. Citation errors on the site:

| Site ref | Site citation | Verified citation | Verdict |
|---|---|---|---|
| 8 Pallotta & Manley | *Semin Dial* **2007; 23**:63-70 | *Semin Dial* **2008;21(1)**:63-70, PMID 18251960 | site wrong (year/volume) |
| 9 Vandecasteele & De Vriese | no year; "Doing" | *Semin Dial* **2011**;24(1):50-5, PMID 21338394 ("Dosing") | minor (missing year, typo) |
| 10 Pollard et al. | *Kidney Internationa*;45:232-237 (no year) | *Kidney Int* **1994**;45(1):232-7, PMID 8127014 | minor |
| 11 Barth & DeVincenzo | 1996;50:929-36 | same; PMID 8872968 | agrees |
| 12 Brown et al. | *CID* 2011;53:164-66 | same; PMID 21690623 | agrees |
| 13 Crew, Heintz, Heintz | *AJHP* 2015;72:1856-64 | same; PMID 26490819 | agrees |
| 14 Nyman et al. | *Hemodial Int* 2018;22:383-87 | same; PMID 29380499 | agrees |
| 15 Westra et al. | *PLoS One* 2019;14(5):e0216801 | PMID 31086400, PMC6516654 | agrees |
| 7 Mehvar | *Am J Pharm Educ* 2006;70:96-114 | 2006;70(5):**96** (article number), PMID 17149425 | minor (page range wrong) |
| 26 Neely 2014 | *AAC* 58(1):309-16 | PMID 24165176 | agrees |
| 27 Pai, Hong, Krop 2017 | *AAC* 61(4):e02490-16 | PMID 28096158 | agrees |
| 28 Neely 2018 | *AAC* 62(2):e02042-17 | PMID 29203493 | agrees |
| 29 Finch 2017 | *AAC* 61(12):e01293-17 | PMID 28923869 | agrees |
| 30 Lodise 2020 (PROVIDE) | *CID* 70(8):1536-45 | PMID 31157370 | agrees |
| 31 Pai 2014 | *Adv Drug Deliv Rev* 77:50-7 | PMID 24910345 | agrees |
| 32 Fewel 2021 | *J Clin Pharm Ther* 46(5):1426-32 | PMID 34169543 | agrees |
| 33 Aljutayli 2022 | *Clin Transl Sci* 15(4):942-53 | PMID 35170243 | agrees |
| 34 Bellamy & Covington 2023 | *J Pharm Technol* 39(4):183-90 | PMID 37529152 | agrees |
| 35 / 38 Chang 2022 | *JAC* 77(8):2245-50 | PMID 35640658 | agrees, **listed twice** (35 and 38 are duplicates) |
| 36 Chanapiwat 2023 | *Pharmacol Res Perspect* 11(1):e01046 | PMID 36588162 | agrees |
| 37 Olney 2022 | *Pharmacotherapy* 42(4):284-91 | PMID 35134264 | agrees |
| 39 Zasowski 2017 | *AAC* 62(1):e01684-17 | PMID 29084753 | agrees |
| 40 Chavada 2017 | *AAC* 61(5):e02535-16 | PMID 28242672 | agrees |
| 41 Pitcock 2023 | *ASHE* 3(1):e225 | PMID 38156206 | agrees |
| 42 Abdelmessih 2022 | *Pharmacotherapy* 42(9):741-53 | PMID 35869689 | agrees |
| 43 Zhang 2024 | *Clin Pharmacokinet* 63(1):79-91 (title truncated) | PMID 37971650 | minor (truncated title) |
| 44 D'Amico 2022 | *AAC* 66(1):e0088621 | PMID 34633843 | agrees |
| 45 Smit 2020 | *Br J Clin Pharmacol* 86(2):303-17 | PMID 31661553 | agrees |
| 46 Al-Sulaiti 2019 | *Eur J Drug Metab Pharmacokinet* 44(5):639-52 | PMID 30919233 | agrees |
| 47 Polášková 2024 | *Front Pharmacol* 15:1364681 | PMID 38895623 | agrees |
| 48 Maung 2022 | *Eur J Hosp Pharm* 29(e1):e57-62 | PMID 34285111 | agrees |
| 49 Chen 2024 | *BMC Infect Dis* 24(1):330 | PMID 38509460 | agrees |
| 50 Shingde 2019 | *TDM* 41(6):726-31 | PMID 31725694 | agrees; supports the site claim that 1-comp is adequate (< 10% AUC underestimate) |
| (2-comp pages) Goti 2018 | *TDM* 40(2):212-221, erratum 2019;41(4):549 | PMID 29470227 confirmed; erratum not retrieved | agrees (citation). The **site's parameter values do not match it** (see 1c) |
| (Bayesian pages) Matzke | "K = 0.00083·CrCl + 0.0044" | Paper gives CL = 3.66 + 0.689·CrCl (mL/min) [V] | minor (textbook transformation, not the paper's own equation) |

**Not in the site list, but the build relies on them:** Rybak 2020 (PMID 32191793), Matzke 1984, Rodvold 1988, Blouin 1982, Adane 2015, Heintz 2009, Pai & Pai 2004. Add them.

---

## 2. Recommended defaults for our build

1. **Targets.** AUC24 400–600 mg·h/L (MIC 1). Continuous-infusion Css 20–25. Trough charts are legacy/educational only, behind a banner. *Rybak 2020.*
2. **Loading dose (non-HD).** 25 mg/kg ABW (configurable 20–35), rounded to 250 mg, cap 3000 mg. When BMI ≥ 30, cap at 25 mg/kg (range 20–25). *Rybak 2020.*
3. **Empiric maintenance.** `Dose = AUC_target × CL_pop × τ/24`, rounded to 250 mg. Warn when > 4500 mg/day. *Rybak 2020.*
4. **1-comp population model ("site model", parity default).** K = 0.00107·CrCl_norm + 0.0052, with Vd 0.65 L/kg TBW for BMI < 30 and **0.5 L/kg TBW for BMI ≥ 30** (proposal, pending sign-off). Offer Matzke as an alternate (CL = 3.66 + 0.689·CrCl mL/min; Vd 0.7 L/kg [R]). *Matzke 1984; Rybak 2020; Adane 2015.*
5. **Two-level (first-order) AUC.** Sawchuk-Zaske K and Vd from peak (≥ 1 h post-infusion) and trough; AUC by the linear-up/log-down formula, with Dose/CL shown as a check. *Pai 2014; Rybak 2020.*
6. **Bayesian engine defaults.**
   - Site 1-comp prior: log-normal IIV with CV_CL 0.35 and CV_V 0.30.
   - Residual error: combined, σ = √((0.15·Ĉ)² + 1.5²) mg/L on the **predicted** value. This is a proposal: it sits between assay-only and published popPK residuals.
   - "Site-parity" mode: normal priors with CV 0.3/0.3 and assay CV 0.1 on the observed value, to reproduce the site's examples.
7. **Goti 2018 two-compartment model (published).** [V2: Mena 2023 PMC9952184 Table 2; *Clin Transl Sci* 2023 PMC10651648. Primary paper not read.]

   ```
   CL (L/h) = 4.5 · (CrCl/120)^0.8 · 0.7^DIAL        IIV 39.8 %CV
   V1 (L)   = 58.4 · (TBW/70) · 0.5^DIAL             IIV 81.6 %CV
   V2 (L)   = 38.4                                   IIV 57.1 %CV
   Q  (L/h) = 6.5                                    no IIV (fixed)
   DIAL = 1 if on hemodialysis, else 0
   CrCl: Cockcroft-Gault, capped at 150 mL/min; original model floors SCr at 1.0 mg/dL if age > 65 (default OFF, see §3)
   Residual: 22.7 % proportional + 3.4 mg/L additive
   IIV correlations: none reported
   ```

   - Expose the site's "modified Goti" (CL coefficient 6.04, Vp weight-scaled) only as a labelled, non-default "site variant". The Vp weight scaling should be removed even there.
   - **Before release, verify every number above against the Goti paper and its 2019 erratum.** The erratum's content is unknown and may change a parameter.
8. **HD (high-flux, chronic IHD only).**
   - LD: 25 mg/kg ABW after HD, or 35 mg/kg if intradialytic. Cap 3000 mg.
   - MD after HD: 10 mg/kg ABW rounded to 250 mg (show the site's flat 750 mg as an alternative). Intradialytic: 10–15 mg/kg.
   - +25% for the dose before the 72 h gap.
   - Pre-HD goal 15–20. Pre-HD monitoring at least weekly (the site's schedule of before MD 2–4 is fine).
   - Warn on levels < 6 h post-HD. Block CRRT, AKI-HD and low-flux (or apply the Rybak low-permeability row).
   - Optional PK estimate uses the site MUE parameters (Vd 1.03 L/kg, CL_nonHD 0.46 L/h, CL_HD 4.08 L/h), labelled "institutional".
   - *Rybak 2020; Barth 1996; Pollard 1994; Nyman 2018.*

---

## 3. Items needing clinician sign-off

1. **HD adjustment rules outside 15–20.** No guideline or peer-reviewed algorithm was found. The site's 2020 MUE has gaps (< 10 and 20–25 undefined) and an overlap (≥ 25–30 "decrease" vs > 25 "hold"). Proposed rules (**not literature-derived**), each needing approval:
   - < 10: give a supplemental dose (for example, 10–15 mg/kg rounded to 250 mg, or re-load), increase the MD by 250–500 mg, and recheck pre-HD.
   - 10 to < 15: increase the MD by 250 mg.
   - 15–20: no change.
   - > 20–25: decrease by 250 mg, or no change if the goal is 20–25 by indication.
   - > 25: hold this post-HD dose, recheck pre-next-HD, resume at a dose 250–500 mg lower when < 20.
2. **Pre-HD goal 20–25** for some indications: not guideline-supported (Rybak says 15–20 for AUC 400–600).
3. **HD maintenance basis**: flat 750 mg (site MUE: weight correlated poorly with dose need) vs 10 mg/kg (Rybak). The two diverge below about 60 kg and above about 100 kg.
4. **Obese Vd**: 0.5 L/kg TBW (Rybak/Adane) vs the site's 0.65, and the BMI threshold (proposed ≥ 30).
5. **Prior and residual defaults** for MAP: CV_CL 0.35, log-normal, and combined residual 15% + 1.5 mg/L are proposals. The site uses 0.3 normal priors and an assay CV of 0.1 on the observed value.
6. **Goti variant**: published (CL 4.5), site-modified (6.04), or both; whether to apply the elderly SCr = 1.0 floor; and confirmation of parameters from the primary paper and erratum.
7. **Trough-only non-Bayesian K-fit (Mode A)**: keep with a warning, or remove (it is not a guideline method).
8. **Low-flux HD**: block it, or adopt the Rybak low-permeability doses (7.5 mg/kg).
9. **Peak timing**: accept ≥ 1 h post-infusion (guideline) vs the site's ≥ 2 h.

---

## 4. References

Primary and guideline sources. Items marked [V2] were seen only in secondary reproductions; [R] items are recalled and unverified.

1. Rybak MJ, Le J, Lodise TP, et al. Therapeutic monitoring of vancomycin for serious MRSA infections: a revised consensus guideline (ASHP/IDSA/PIDS/SIDP). *Am J Health Syst Pharm*. 2020;77(11):835-864. PMID 32191793. https://doi.org/10.1093/ajhp/zxaa036
2. Goti V, Chaturvedula A, Fossler MJ, Mok S, Jacob JT. Hospitalized patients with and without hemodialysis have markedly different vancomycin pharmacokinetics. *Ther Drug Monit*. 2018;40(2):212-221. PMID 29470227. https://doi.org/10.1097/FTD.0000000000000490 (erratum *Ther Drug Monit* 2019;41(4):549, [R], not retrieved)
3. Mena SJ, et al. Implementing vancomycin population pharmacokinetic models: an app for individualized antibiotic therapy in critically ill patients. *Antibiotics*. 2023;12(2):301. PMID 36830212. https://doi.org/10.3390/antibiotics12020301 (Goti parameter table, [V2])
4. Model-informed precision dosing of vancomycin for rapid achievement of target AUC: a simulation study. *Clin Transl Sci*. 2023. PMC10651648. https://doi.org/10.1111/cts.13626 (Goti parameters incl. residual error, [V2], read by sub-agent)
5. Vancomycin target attainment improved following population pharmacokinetic model switch. *JAC Antimicrob Resist*. 2026;8(1):dlag016. PMID 41710913. https://doi.org/10.1093/jacamr/dlag016 (modified Goti)
6. Evaluation of two model-based Bayesian approaches for vancomycin dosing in general hospitalized patients. *J Pharmacokinet Pharmacodyn*. 2026;53(6). PMID 42800832. https://doi.org/10.1007/s10928-026-10066-3
7. Matzke GR, McGory RW, Halstenson CE, Keane WF. Pharmacokinetics of vancomycin in patients with various degrees of renal function. *Antimicrob Agents Chemother*. 1984;25(4):433-7. PMID 6732213. https://doi.org/10.1128/AAC.25.4.433
8. Rodvold KA, Blum RA, Fischer JH, et al. Vancomycin pharmacokinetics in patients with various degrees of renal function. *Antimicrob Agents Chemother*. 1988;32(6):848-52. PMID 3415206. https://doi.org/10.1128/AAC.32.6.848
9. Blouin RA, Bauer LA, Miller DD, Record KE, Griffen WO. Vancomycin pharmacokinetics in normal and morbidly obese subjects. *Antimicrob Agents Chemother*. 1982;21(4):575-80. PMID 7081978. https://doi.org/10.1128/AAC.21.4.575
10. Adane ED, Herald M, Koura F. Pharmacokinetics of vancomycin in extremely obese patients. *Pharmacotherapy*. 2015;35(2):127-39. PMID 25644478. https://doi.org/10.1002/phar.1531
11. Smit C, et al. Population pharmacokinetics of vancomycin in obesity. *Br J Clin Pharmacol*. 2020;86(2):303-317. PMID 31661553. https://doi.org/10.1111/bcp.14144
12. Pai MP, Neely M, Rodvold KA, Lodise TP. Innovative approaches to optimizing the delivery of vancomycin in individual patients. *Adv Drug Deliv Rev*. 2014;77:50-7. PMID 24910345. https://doi.org/10.1016/j.addr.2014.05.016
13. Neely MN, Youn G, Jones B, et al. Are vancomycin trough concentrations adequate for optimal dosing? *Antimicrob Agents Chemother*. 2014;58(1):309-16. PMID 24165176. https://doi.org/10.1128/AAC.01653-13
14. Shingde RV, et al. Comparison of the AUC for vancomycin estimated using compartmental and noncompartmental methods. *Ther Drug Monit*. 2019;41(6):726-731. PMID 31725694. https://doi.org/10.1097/FTD.0000000000000690
15. Olney KB, et al. Comparison of Bayesian-derived and first-order analytic equations for vancomycin AUC. *Pharmacotherapy*. 2022;42(4):284-291. PMID 35134264. https://doi.org/10.1002/phar.2670
16. Chanapiwat P, et al. Mathematical equation vs trapezoidal approach for vancomycin AUC24. *Pharmacol Res Perspect*. 2023;11(1):e01046. PMID 36588162. https://doi.org/10.1002/prp2.1046
17. Crew P, Heintz SJ, Heintz BH. Vancomycin dosing and monitoring for patients with ESRD receiving intermittent hemodialysis. *Am J Health Syst Pharm*. 2015;72(21):1856-64. PMID 26490819. https://doi.org/10.2146/ajhp150051
18. Vandecasteele SJ, De Vriese AS. Vancomycin dosing in patients on intermittent hemodialysis. *Semin Dial*. 2011;24(1):50-5. PMID 21338394. https://doi.org/10.1111/j.1525-139X.2010.00803.x
19. Pallotta KE, Manley HJ. Vancomycin use in patients requiring hemodialysis: a literature review. *Semin Dial*. 2008;21(1):63-70. PMID 18251960. https://doi.org/10.1111/j.1525-139X.2007.00333.x
20. Pollard TA, Lampasona V, Akkerman S, et al. Vancomycin redistribution: dosing recommendations following high-flux hemodialysis. *Kidney Int*. 1994;45(1):232-7. PMID 8127014. https://doi.org/10.1038/ki.1994.28
21. Barth RH, DeVincenzo N. Use of vancomycin in high-flux hemodialysis: experience with 130 courses of therapy. *Kidney Int*. 1996;50(3):929-36. PMID 8872968. https://doi.org/10.1038/ki.1996.393
22. Brown M, Polisetty R, Gracely EJ, Cuhaci B, Schlecht HP. Weight-based loading of vancomycin in patients on hemodialysis. *Clin Infect Dis*. 2011;53(2):164-6. PMID 21690623. https://doi.org/10.1093/cid/cir322
23. Nyman HA, Agarwal A, Senekjian HO, Leypoldt JK, Cheung AK. Removal of vancomycin administered during dialysis by a high-flux dialyzer. *Hemodial Int*. 2018;22(3):383-387. PMID 29380499. https://doi.org/10.1111/hdi.12637
24. Pai AB, Pai MP. Vancomycin dosing in high flux hemodialysis: a limited-sampling algorithm. *Am J Health Syst Pharm*. 2004;61(17):1812-6. PMID 15462252. https://doi.org/10.1093/ajhp/61.17.1812
25. Heintz BH, Matzke GR, Dager WE. Antimicrobial dosing concepts and recommendations for critically ill adults receiving CRRT or intermittent hemodialysis. *Pharmacotherapy*. 2009;29(5):562-77. PMID 19397464. https://doi.org/10.1592/phco.29.5.562 (vancomycin IHD dose range quoted from memory, [R])
26. Model-informed precision dosing of vancomycin in adult patients undergoing hemodialysis. *Antimicrob Agents Chemother*. 2023;67:e00089-23. PMID 37195225. https://doi.org/10.1128/aac.00089-23
27. Westra N, et al. Vancomycin PK model development in patients on intermittent online hemodiafiltration. *PLoS One*. 2019;14(5):e0216801. PMID 31086400. https://doi.org/10.1371/journal.pone.0216801
28. Mehvar R. Estimation of pharmacokinetic parameters based on the patient-adjusted population data. *Am J Pharm Educ*. 2006;70(5):96. PMID 17149425. https://doi.org/10.5688/aj700596
29. Bauer LA. *Applied Clinical Pharmacokinetics* (vancomycin chapter: K = 0.00083·CrCl + 0.0044, V 0.7 L/kg). McGraw-Hill. [R]

The other site references (27–30, 32–49) were confirmed via DOI→PMID mapping. PMIDs are in table 1f.

# Decisions: renal function and body size (shared `body` / `renal` modules)

Scope: the six open choices that every drug tool inherits from `PK.body` and `PK.renal`. This builds on `lit/aminoglycosides-renal.md` (rows R1–R10), which is not repeated here. This file goes further where that one left a choice open or a claim unverified. Researched 2026-10-23.

Method: PubMed (E-utilities connector) for metadata and abstracts, plus the full text of Pierce 2021 via PMC. Consensus semantic search was used to find papers; every paper it surfaced was then confirmed in PubMed. The FDA March 2024 guidance PDF was downloaded and its text extracted and read. Label wording came from mirror sites. NIDDK web page.

Evidence tags (same as `lit/`):
- **[V]** I read the abstract or full text and it supports the claim.
- **[V-ft]** I read the full text.
- **[V-meta]** The paper exists (PMID and DOI confirmed), but the specific detail is not in the abstract.
- **[2nd]** Verified only through a secondary source.
- **[R]** Recalled, not verified in this session.

---

## Summary of recommended defaults

| # | Decision | Recommended default | Keep as options | Confidence |
|---|---|---|---|---|
| 1 | Obesity trigger for using AdjBW in CG | **TBW > 1.2 × IBW** | 1.3 × IBW; BMI ≥ 30; BMI ≥ 25 (Winter categories) | Moderate |
| 2 | SCr floor | **Off.** Use the actual SCr. Warn when SCr < 0.7 and the patient is elderly, cachectic, amputated or has SCI. For AG K, also show a sensitivity value with a 0.8 floor | 0.7 / 0.8 / 1.0 floors (per-tool toggle) | Moderate-high for CrCl accuracy; moderate for drug-level prediction |
| 2b | Spinal cord injury | **No SCr floor.** Show a strong warning and an optional CG × 0.8 correction. Advise measured CrCl or cystatin C | Kaji 45/SCr | Low-moderate |
| 3 | Pediatric (age 1 to < 18) | **CKiD U25 creatinine equation (age- and sex-dependent K)**, then de-indexed to mL/min for dosing | Bedside Schwartz 0.413; original Schwartz k (Jaffe assay only; infants); U25 cystatin C if available | Moderate |
| 4a | AdjBW factor | **0.4** | 0.3 | Moderate |
| 4b | CG with Janmahasatian LBW at BMI ≥ 40 | **Show it beside CG-AdjBW(0.4). AdjBW stays the default number** | Make LBW primary at BMI ≥ 40 (Park/Demirovic strategy) | Low-moderate |
| 5 | Two SCr values (non-steady state) | **Chow-Schweizer mass balance (mL/min)**, with Chen KeGFR shown as a cross-check, plus a "levels/TDM required" banner | Jelliffe 2002; Brater (off by default) | Low |
| 6 | Units of renal bands | **Compute absolute mL/min.** Compare against each label in that label's own units: de-index for mL/min bands, normalize for /1.73 m² bands. Always display both | — | High (FDA 2024 text read) |

Note: `specs/crcl.md` currently lists `roundScr` default **true [SUITE]** with floors of 0.7 and 0.5 (SCI). Both conflict with decisions 2 and 2b above.

---

## Q1. Obesity threshold for switching the CG weight to adjusted body weight

### Options
A. TBW > 1.2 × IBW  B. TBW > 1.3 × IBW  C. BMI ≥ 30  D. BMI ≥ 25 (Winter categories)  E. No step: range or other descriptor.

### Evidence
- **Winter 2012** (n = 3,678 with 24-h measured CrCl) [V]. CG was unbiased with TBW in **underweight** patients (−0.22 mL/min) and with IBW in **normal-weight** patients (−1.3 mL/min). In the **overweight, obese and morbidly obese** groups, no weight gave an unbiased result, and **AdjBW(0.4) was the least biased and most accurate**. The categories appear to be WHO BMI classes, so overweight means **BMI ≥ 25** [2nd: calculator pages citing Winter; full text not read]. This is the largest direct study, and its implied trigger is BMI 25, which is *lower* than 1.3 × IBW. Pharmacotherapy 32:604-12. PMID 22576791. DOI 10.1002/j.1875-9114.2012.01098.x
- **Emanuel 2023** (n = 742 HCT candidates, 24-h CrCl) [V]. AdjBW(0.4) correlated best overall. **A threshold of 120% IBW gave less bias and greater accuracy than 140% IBW.** Below 120% IBW, **TBW** was most accurate. Clin Transplant 37:e15059. PMID 37395991. DOI 10.1111/ctr.15059. This is the only study found that directly compares %IBW triggers. It did not test 130%.
- **Busse 2021** (n = 30; fosfomycin CL used as the GFR reference) [V]. CG with IBW, or with AdjBW applied when TBW > **1.3 × IBW**, had the best concordance (CCC 0.47). The sample was small and the 1.3 trigger was pre-specified, not compared with 1.2. Br J Clin Pharmacol 88:2973-81. PMID 34688225. DOI 10.1111/bcp.15115
- **Wilhelm 2011** meta-analysis (13 studies, n = 1,197) [V]. TBW overestimates (+15.9 mL/min). IBW underestimates (−5.2). AdjBW 0.3 or 0.4 is "reasonable" in obesity. Pharmacotherapy 31:658-64. PMID 21923452. DOI 10.1592/phco.31.7.658
- **Park 2012** (FDA, n = 590, BMI 17–96) [V]. CG with TBW is badly biased at BMI ≥ 40 (−107 mL/min). Using **total or adjusted weight below BMI 40** and **lean weight at BMI ≥ 40** was unbiased, with ≥ 60.7% accuracy in every stratum. Ann Pharmacother 46:317-28. PMID 22395245. DOI 10.1345/aph.1Q374
- **Bouquegneau 2016** (BMI > 30, measured GFR) [V]. AdjBW instead of TBW raised CG accuracy from **57% to 79%**. Br J Clin Pharmacol 81:349-61. PMID 26531818. DOI 10.1111/bcp.12817
- **Leader 1994** [V]. CG with dosing weight was unbiased for gentamicin K in obese patients. The definition of "obese" used is [V-meta]. PMID 7985687
- **Brown 2013** (review) [V]. The weight controversy is "unresolved". The authors propose reporting a **CrCl range** from CG(IBW) to CG(TBW). Ann Pharmacother 47:1039-44. PMID 23757387. DOI 10.1345/aph.1S176
- **FDA 2024** [V-ft]. In overweight or obese individuals, IBW or AdjBW in CG "is likely to provide a more accurate estimate" than actual weight (§IV.A, citing Pai 2010, PMID 20727504). The guidance gives no numeric trigger.
- Arithmetic check [own calculation]: Devine IBW corresponds to a BMI of about 21–23 depending on height and sex. So 1.2 × IBW ≈ BMI 25–28, which is close to Winter's "overweight" cut-off. 1.3 × IBW ≈ BMI 27–30. BMI ≥ 30 leaves the overweight band on TBW or IBW, which Winter found biased.

### Recommendation
- **Default: AdjBW(0.4) when TBW > 1.2 × IBW.** Below that: IBW if IBW ≤ TBW ≤ 1.2 × IBW; TBW if TBW < IBW. This keeps the `lit/` R4 rule. 1.2 now has direct comparative support (Emanuel) and approximates Winter's BMI ≥ 25 category.
- **Options:** 1.3 × IBW (Busse; earlier README proposal); BMI ≥ 30; BMI ≥ 25.
- **Option for the 1.0–1.2 × IBW band:** TBW instead of IBW (Emanuel found TBW better, Winter found IBW better). The gap is ≤ 20%. IBW is the default because it matches site parity and the larger dataset.
- **UI:** always show the Brown range (CG-IBW to CG-TBW) beside the chosen value whenever TBW > IBW.
- **Confidence: moderate.** All the evidence is retrospective. 1.2 vs 1.3 was never compared head-to-head.
- **Local choice:** the trigger (1.2 vs 1.3 vs BMI). Also whether oncology or transplant services use different rules.

---

## Q2. SCr floor (rounding low SCr up)

### Options
Off · round up to 0.7 · 0.8 · 1.0 · special SCI value (site: 0.5).

### Evidence vs measured CrCl (all point the same way)
- **Smythe 1994** (elderly): rounding to 1.0 **underestimated** CrCl [V, in `lit/` R9]. PMID 8160670
- **Winter 2012**: in patients ≥ 65 with SCr < 0.8 or < 1.0, the **actual SCr was unbiased** (−3 and −9 mL/min) and more accurate than a rounded value. Rounding did not help at any age [V]. PMID 22576791
- **Wilhelm 2011** meta-analysis: "use of … a rounded Scr value cannot be recommended" [V]. (TBW combined with rounded SCr happened to land near measured CrCl because two biases cancelled.) PMID 21923452
- **Emanuel 2023**: age ≥ 60, rounding to 0.8 or 1.0 worsened correlation and bias [V]. PMID 37395991
- **Dooley 2004**: rounding to 0.06 mmol/L helped only when CrCl ≤ 100 [V, `lit/`]. PMID 14997195. *The "Dooley 2013" named in the brief* is Dooley MJ et al., Ann Oncol 2013;24:2746-52 (PMID 23928359, DOI 10.1093/annonc/mdt300). That paper compares CG, MDRD, CKD-EPI, Wright and Martin against Tc-DTPA for chemotherapy dosing (CG concordance was the lowest at 46.2%). **It is not a rounding study** [V].

### Evidence vs drug levels (mixed)
- **Reichley 1995** (gentamicin): a minimum SCr of 0.8 improved prediction of K [V, `lit/`]. PMID 8570436
- **Young 2017** (vancomycin, age ≥ 65, non-obese, n = 56): predicted troughs were further from measured troughs with SCr rounded to 1.0 (mean error 8.84) than with the actual SCr (4.54 µg/mL), p < 0.0001 [V]. Drugs R D 17:435-40. PMID 28815425. DOI 10.1007/s40268-017-0200-1
- **Bukhari 2024** (vancomycin, elderly, n = 245): doses based on actual SCr correlated better with the target maintenance dose (r 0.55 vs 0.31) [V]. Healthcare 12:1144. PMID 38891219. DOI 10.3390/healthcare12111144
- **Nakano 2026** (pilot, n = 24): models using rounded-up SCr systematically underestimated vancomycin CL [V]. PMID 42609167. DOI 10.1111/bcpt.70287
- **Khuu 2010** (underweight, ≥ 10% below IBW): CG with actual SCr *overestimated* AG clearance. Rounding to 1.0 was less biased than actual SCr. A ×0.69 factor was better again [V]. AJHP 67:274-9. PMID 20133531. DOI 10.2146/ajhp090251

### Spinal cord injury (the site's 0.5 rule)
- In chronic SCI, CG and MDRD **overestimate** GFR at every level. Correction factors of **0.8 for CG** and 0.7 for MDRD brought the fractional error below 20% (Chikkalingaiah 2010, n = 116) [V]. PMID 20087164. DOI 10.1097/MAJ.0b013e3181c62279
- Five standard methods overestimated AG clearance by **70–160%**. The Lee-Dang equation performed better (Lee & Truong 2014, 2015) [V]. PMID 34860964 (DOI 10.1177/8755122514559844); PMID 26330088 (DOI 10.1159/000439186). The Lee-Dang formula itself was not retrieved [R].
- Kaji 1990: in SCI, CrCl ≈ 45/SCr [V]. PMID 2370884. Cystatin C equations were most accurate in SCI (Brown N 2024 PMID 39619822; Erlandsen 2012 PMID 22547045) [V]. Young & Ensom 2011 review: estimates are inaccurate in SCI; use levels [V]. PMID 21856806
- **Implication:** a floor of 0.5 is *lower* than 0.7, so it applies *less* correction in exactly the group where CG overestimates most. The site's rule has the direction backwards. **[own analysis]**

### Recommendation
- **Default: floor OFF** for the CrCl that every tool uses. **Confidence: moderate-high** for accuracy against measured CrCl (Winter, Wilhelm, Emanuel and Smythe all agree). **Moderate** for drug-level prediction: Reichley and Khuu go the other way in specific groups.
- **Keep as options:** a per-tool floor toggle (0.7 / 0.8 / 1.0). For AG tools, when SCr < 0.8, also show a "sensitivity" K with SCr = 0.8 (Reichley), as `lit/` R9 already proposes.
- **Underweight (TBW < 0.9 × IBW):** warn that CG with actual SCr may overestimate (Khuu). Offer the 1.0 floor or ×0.69 as options. Neither is the default.
- **SCI:** remove the 0.5 floor. Default: no floor plus a red warning ("CG overestimates by up to 2-fold in SCI; get a measured CrCl, cystatin C or levels"). Option: CG × 0.8 (Chikkalingaiah). **Confidence: low-moderate.**
- **Local choice:** whether an institution mandates a floor (many vancomycin protocols do). If so, record it in the institution profile and show it on the result card.

---

## Q3. Pediatric renal function (age < 18)

### Options
- Bedside Schwartz 2009: eGFR = 0.413 × height(cm) / SCr (ages 1–16, IDMS enzymatic SCr).
- Original Schwartz k: 0.33 preterm, 0.45 term infant, 0.55 child and adolescent girl, 0.70 adolescent boy (Jaffe-era SCr).
- CKiD U25 2021 (ages 1–25).
- Others: EKFC, FAS.

### Evidence
- **Schwartz 2009** (CKiD, n = 349, aged 1–16, median iGFR 41): the bedside 0.413 × ht/SCr "provides a good approximation". The authors note that "additional studies of children with higher GFR are needed" [V]. JASN 20:629-37. PMID 19158356. DOI 10.1681/ASN.2008030287
- **Original k values** [V]: Schwartz 1987 Pediatr Clin North Am 34:571-90 (PMID 3588043, k 0.33/0.45/0.55/0.70); Schwartz 1984 J Pediatr 104:849 (PMID 6726515, term infants 0.45); Schwartz 1985 J Pediatr 106:522 (PMID 3973793, adolescent boys 0.70); Schwartz 1976 Pediatrics 58:259 (PMID 951142). These constants are tied to **Jaffe creatinine**. With IDMS-traceable enzymatic SCr they overestimate GFR (Schwartz 2009 abstract) [V].
- **Pierce 2021, CKiD U25** (2,655 visits, 928 participants, iohexol mGFR) [V-ft]. The bedside equation was biased by **+17.6% (boys) and +12.4% (girls) under age 5** and by **−16.4% / −10.9% at ages ≥ 18**. With the age- and sex-dependent K, all age-group biases were < 5% (males) and < 7% (females). U25 was the only equation with **P30 > 85% in both children and young adults**. Caveat: **validation was internal only**, in children with CKD (median mGFR ≈ 48). Kidney Int 99:948-56. PMID 33301749. DOI 10.1016/j.kint.2020.10.047
  - K formula (height in **metres**, SCr in mg/dL), reconstructed from the full text. The anchor values were checked: 35.7 at age 1, 50.8 at ≥ 18 (M); 33.1 and 41.4 (F):
    - Males: K = 39.0 × 1.008^(age−12) for age < 12; 39.0 × 1.045^(age−12) for 12 ≤ age < 18; 50.8 for age ≥ 18.
    - Females: K = 36.1 × 1.008^(age−12) for age < 12; 36.1 × 1.023^(age−12) for 12 ≤ age < 18; 41.4 for age ≥ 18.
    - The paper's supplementary integer-age K table was not opened. Build a test that reproduces it before release. The text says to use the K for the nearest integer age (±0.5 y); the continuous formula differs by < 0.5%.
  - Cystatin C U25: constant K 81.9 (M) / 74.9 (F) ÷ CysC. The age-dependent form is in the supplement and was not extracted. The paper also suggests averaging the creatinine and cystatin C estimates when both are available.
- **NIDDK** (web page, read 2026-10-23) [V]: CKiD U25 "is the preferred calculator for use in children". The bedside equation (ages 1–16) "is still commonly used".
- **KDIGO 2024 CKD guideline** (Kidney Int 105(4S):S117, PMID 38490803, DOI 10.1016/j.kint.2023.10.018): support for U25 is reported only by secondary sources [2nd]. The guideline text itself was not read.
- **External validations, 2024–2026** (mixed, none decisive) [V]:
  - Averina 2026, Norway, 2,981 children with iohexol GFR: **EKFC outperformed bedside Schwartz and U25** from age 2. PMID 42343553. DOI 10.1515/cclm-2026-0464
  - Marpaung 2026, CAKUT, n = 276: in children > 2 years, bedside Schwartz and U25 both had P30 75% vs 90% for EKFC. Bedside Schwartz bias was −21.7. PMID 41494029
  - Kim 2026, Korea, n = 221: combined creatinine + cystatin C equations were best. PMID 42015823
  - Ibrahim 2024: U25-creatinine overestimated (bias +22.6), and U25-CysC was best. PMID 38656545
- **Drug dosing link** [V-ft]: the FDA 2024 guidance refers pediatric renal assessment to its 2022 pediatric clinical pharmacology draft guidance and accepts "any widely accepted contemporary equation". It does not name one.

### Recommendation
- **Default for age 1 to < 18: CKiD U25 creatinine (age/sex K).** It is the current US reference (NIDDK) and has the least age-related bias in its development data. **De-index for dosing:** eGFR × BSA/1.73 → mL/min (see Q6).
- **Options:** bedside Schwartz 0.413 (for continuity and pediatric references that use it); U25 cystatin C or the creatinine/CysC average when CysC is available; EKFC (emerging; not yet in the US workflow).
- **Original Schwartz k values:** offer only with an "assay = Jaffe (non-IDMS)" setting. Never use them as the default.
- **Age < 1 year:** no default. No equation in this list is validated there with IDMS creatinine. Show a "use levels / neonatal references" message. Offer k = 0.45 (term) and 0.33 (preterm) behind an explicit toggle, with a non-IDMS caveat. **[own judgement]**
- **Ages 18–25:** adult CG stays the default for drug dosing (the suite's drug models are built on CG). Display U25 alongside for young adults with CKD.
- **Confidence: moderate.** U25 beats bedside in its own cohort, but external validations are mixed, and nothing links either equation to drug clearance in children.
- **Local choice:** which pediatric equation the institution's lab reports (consistency matters). Also whether pediatric drug tools are in scope at all; the site says CG is for ≥ 18 only.

---

## Q4. AdjBW factor (0.4 vs 0.3 vs 0.43) and Janmahasatian FFM in CG at BMI ≥ 40

### Evidence: factor
- **0.4:** Winter 2012 [V]: AdjBW(0.4) was least biased and most accurate in overweight through morbidly obese patients. Whether Winter also tested 0.3 is [V-meta]. Emanuel 2023 [V]: AdjBW(0.4) correlated best. Bouquegneau 2016 used AIBW (factor [V-meta]). The 0.4 factor originates in AG Vd work (Schwartz 1978, PMID 712111, [V] in `lit/` R3).
- **0.3:** Wilhelm 2011 meta-analysis [V]: AdjBW 0.3 gave MD +4.6 mL/min (95% CI −11 to +21) and 0.4 gave MD +19.9 (−9.6 to +49). Both CIs include zero and are very wide; the authors call either "reasonable". Few studies tested 0.3. The primary sources for 0.3 were not identified [R].
- **0.43:** Traynor 1995 derived it for the **aminoglycoside dosing weight (Vd)**, not for CrCl [V, `lit/` R3]. No CrCl study found used 0.43. 0.4 vs 0.43 changes the weight by < 3% of the excess.
- A 2026 narrative review (Choudhary, Eur J Clin Pharmacol) credits 0.4 to Bauer 1983. That contradicts `lit/` R3 (Schwartz 1978). Its PMID was not retrieved; treat it as [2nd] and do not cite it for provenance.

### Evidence: Janmahasatian LBW in CG at BMI ≥ 40
- **Demirovic 2009** (n = 54, BMI 50 ± 13) [V]: CG-LBW (Janmahasatian) and CG-fat-free weight were **unbiased**. TBW and **AdjBW overestimated**; IBW underestimated. PMID 19299371
- **Park 2012** (n = 590, FDA; includes BMI ≥ 40 data, likely overlapping Demirovic [R]) [V]: **LBW at BMI ≥ 40** was unbiased with accuracy ≥ 60.7%.
- **Bouquegneau 2016** [V]: at BMI > 40, **CG-LBW and CG-AIBW had equal accuracy**. De-indexed MDRD was best overall.
- **Winter 2012** [V]: AdjBW(0.4) was least biased even in the morbidly obese. The size of that subgroup is [V-meta].
- **Pai 2011** (AG, n = 2,073) [V]: Janmahasatian LBW normalized AG **Vd** (≈ 0.45 L/kg LBW) across all weight strata. **CKD-EPI** best predicted AG **clearance**. PMID 21670189. DOI 10.1128/AAC.00174-11
- **Basolo 2023** (n = 342, mean BMI 47.6, 24-h CrCl) [V]: measured CrCl *increases* with weight (hyperfiltration). Plain CG overestimated at high CrCl. The authors propose a new CG-based formula for BMI ≥ 32. This argues against strongly down-weighting (IBW) at extreme BMI. PMID 37296533. DOI 10.1210/clinem/dgad330

### Recommendation
- **Factor default 0.4** (most direct CrCl evidence; FDA-cited review; site parity). **Option 0.3.** Do not use 0.43 for CrCl; keep it, if at all, only in the AG dosing-weight module. **Confidence: moderate.**
- **BMI ≥ 40:** keep **CG-AdjBW(0.4) as the default number** and **always show CG-LBW (Janmahasatian) beside it**, with a note when they differ by more than 20%. Offer a "Park strategy" option: LBW is primary at BMI ≥ 40 and AdjBW below 40. Head-to-head data are split: Demirovic/Park favour LBW, Winter favours AdjBW, Bouquegneau finds them equal. **Confidence: low-moderate.**
- **Local choice:** whether bariatric or ICU services adopt the Park strategy, or add de-indexed CKD-EPI or cystatin C as the reference.

---

## Q5. Two SCr values with unstable renal function

### Options
Chow-Schweizer iterative mass balance (1985) · Jelliffe (1972 "ASHP" form, or 2002 mass balance) · Brater · Chen kinetic eGFR (KeGFR 2013) · others (Chiou-Hsu, Moran-Myers, Yashiro, Seelhammer).

### Evidence
- **Chow & Schweizer 1985**: the iteration method had the lowest error of four methods when no urine was collected [V, `lit/` R7]. This is a small, old validation. **No modern validation against measured GFR was found**, and it was **not among the 7 formulas tested by Desgrouas 2021**.
- **Chen 2013** (KeGFR): derived from creatinine mass balance and illustrated with cases. **No validation in the paper itself** [V]. JASN 24:877-88. PMID 23704286. DOI 10.1681/ASN.2012070653. Chen 2019 extends it with the "true average creatinine" [V]. PMID 32734201
- **Desgrouas 2021** (shock, n = 57, iohexol) [V]. Tested Jelliffe, Chen, Chiou-Hsu, Moran-Myers, Yashiro, Seelhammer and **Brater** (33 variants). Biases ranged from 12 to 47 mL/min/1.73 m². The best (corrected Moran-Myers) was within 30% in only 47%. Conclusion: "Clinicians should not use kinetic GFR equations … in patients with shock." Crit Care Med 49:e761-70. PMID 33710029. DOI 10.1097/CCM.0000000000004946
- **Pelletier 2020** (AKI, n = 119, Tc-DTPA, multicentre) [V]. **Jelliffe r = 0.73, KeGFR r = 0.68.** Both *underestimated* mGFR and had limits of agreement > 40 mL/min/1.73 m². KeGFR did better in older patients. NDT 35:1886-93. PMID 33151336. DOI 10.1093/ndt/gfz178
- **Sangla 2020** (ICU, n = 63, iohexol) [V]. Every equation was biased. "Kinetic models did not improve performances, except in patients with unstable creatinine levels." Cystatin C equations were best. Crit Care Med 48:e1232-41. PMID 33044285. DOI 10.1097/CCM.0000000000004650
- **Kadivarian 2022** (ICU AKI, n = 95, 6-h urine CrCl) [V]. No formula correlated well. **Kinetic GFR correlated best in AKI stage 2–3** (r 0.76 / 0.37). Brater, Jelliffe and Chiou were also tested. PMID 35545239. DOI 10.4266/acc.2021.01256
- **Jain 2024** (post-kidney-transplant, SCr falling) [V]. **Chen and Brater KeGFR were significantly lower than measured CrCl**, so kinetic methods under-dose during recovery. PMID 38981764. DOI 10.1016/j.transproceed.2024.05.026
- **Carrié 2018** (letter): KeGFR is not interchangeable with measured CrCl for predicting piperacillin under-exposure in augmented renal clearance [V-meta]. PMID 30037335
- **Bairy 2020**: KeGFR vs CG vs MDRD drug-dosing categories had only partial concordance [V]. PMID 32369818
- **Brater**: the original source is a 1983 textbook [R]. It appears only as a comparator above and never performs best.
- All of these methods share the same mass-balance core (production, Vcr, ΔSCr/Δt). They differ mainly in how production is estimated and in their output units. Chow outputs **CrCl in mL/min** from patient weight and age. Chen outputs eGFR in whatever units the anchoring steady-state eGFR uses. Jelliffe 1972 outputs **per 1.73 m²**. **[own analysis]**

### Recommendation
- **Default: Chow-Schweizer** (the dimensionally corrected form per `lit/` R7). It outputs **mL/min on the CG scale** that the suite's drug models (AG K, lithium CL, acyclovir CL) were parameterised on. Show **Chen KeGFR** beside it as a cross-check, anchored to CG so the units match. Show a fixed banner: "non-steady-state estimate. Low accuracy (P30 < 50% in shock). Obtain drug levels / measured CrCl."
- **Options:** Jelliffe 2002 (best correlation in Pelletier); Jelliffe 1972 per 1.73 m² (display only, see `lit/` R8); Brater (off; no supporting evidence).
- **Guards:** if SCr is rising and the patient is anuric/oliguric, cap at "< 10 mL/min" and flag. If SCr is falling (recovery or post-transplant), warn that kinetic estimates *underestimate* (Jain 2024). Do not apply an SCr floor inside the kinetic calculation (consistent with crcl.md §117).
- **Confidence: low.** No method is well validated. Choosing Chow is about unit consistency and continuity with the site, not proven superiority.
- **Local choice:** whether ICU and renal services prefer KeGFR (commonly used by nephrologists) as the primary display.

---

## Q6. Units of renal dose bands (absolute vs normalized) and FDA 2024

### FDA guidance (final, March 2024, CDER; docket FDA-2010-D-0133) [V-ft: PDF text extracted and read]
"Pharmacokinetics in Patients with Impaired Renal Function — Study Design, Data Analysis, and Impact on Dosing." https://www.fda.gov/regulatory-information/search-fda-guidance-documents/pharmacokinetics-patients-impaired-renal-function-study-design-data-analysis-and-impact-dosing (PDF: https://www.fda.gov/media/78573/download)
- §IV.A: renal drug clearance is proportional to the individual's GFR in mL/min. When recommending adult renal dosing, **use eGFR in mL/min rather than mL/min/1.73 m²**. De-index by multiplying by the individual's BSA (DuBois or Mosteller) and dividing by 1.73.
- §IV.A: CG CLcr (mL/min) is listed as an acceptable estimate. In overweight or obese patients, IBW or AdjBW is likely more accurate than actual weight (cites Pai 2010).
- §IV.A: eGFR is recommended **over** CG CLcr for *PK studies*. Measured GFR, measured CLcr or "any contemporary, widely accepted" equation is also considered reasonable. Pediatric patients: any widely accepted pediatric equation, with reference to the 2022 pediatric draft guidance.
- Table 1 (classification for dedicated renal studies, **mL/min**): normal ≥ 90; mild 60–< 90; moderate 30–< 60; severe and kidney failure not on dialysis < 30 (the "normal ≥ 90" row was garbled in extraction and is reconstructed from the band edges). Footnotes define eGFR in mL/min (de-indexed) and eCLcr by CG.
- §V.C: dosing recommendations "can significantly differ" between equations. Sponsors should evaluate this impact.
- **The guidance addresses sponsors and labeling, not third-party dosing tools.** Nothing in it is directed at calculators. The relevant implication is that **modern labels are written in absolute mL/min**.

### What existing labels for suite drugs use
- **Acyclovir IV:** renal table in **mL/min/1.73 m²** (> 50 q8h; 25–50 q12h; 10–25 q24h; 0–10 50% q24h) [2nd: label mirrors medlibrary/medthority; DailyMed not reached].
- **Digoxin (Lanoxin):** maintenance table by **CrCl corrected to 70 kg or 1.73 m²** × lean body weight. Corrected CrCl ≈ (140 − age)/SCr (×0.85 F) [2nd: drugs.com/RxList mirrors].
- **Vancomycin (suite model):** K = 0.00107·CrCl **per 1.73 m²** (README §3), i.e., normalized.
- **Aminoglycosides:** the suite's K equation uses absolute CG mL/min (`lit/` "AG K" default).
- **Older labels in general:** CG-era labels (before about 2010) mostly used CG CLcr in mL/min. Some used per-1.73 m² or per-70 kg normalization [R as a generalisation; check each label].
- KDIGO 2011 drug-dosing conference (Matzke, Kidney Int 80:1122, PMID 21918498) [V-meta] and Delanaye 2022 editorial [V]: FDA, EMA and KDIGO all advise de-indexing eGFR for dosing, though this is rarely done in practice.

### Recommendation
- `PK.renal` returns **absolute CrCl (mL/min)** as the primary value, plus **CrCl normalized per 1.73 m²** and the BSA used. Every drug-model parameter and every label band carries a **units tag** (`mL/min` | `mL/min/1.73m2` | `mL/min/70kg`). The renal module converts to that tag before any comparison or lookup. No implicit mixing.
- Pediatric eGFR (Q3) and any CKD-EPI/EKFC value are **de-indexed** (× BSA/1.73) before they feed drug dosing.
- The UI always shows both numbers with units. It highlights when the two differ enough to cross a band edge, for example in large or small BSA.
- **Confidence: high** for the de-index rule (FDA text read). **Moderate** for the per-label units of older products (secondary sources only). Every `[EXT]` renal table needs its units verified against current DailyMed.
- **Local choice:** for drugs whose label is ambiguous, whether to use absolute or normalized values (default: absolute, per FDA 2024).

---

## Remaining verification work (not done in this session)
1. Winter 2012 full text: the exact BMI cut-offs, the size of the morbid-obesity subgroup, and whether 0.3 was tested.
2. CKiD U25 supplementary K table: confirm the reconstructed piecewise formula, and extract the age-dependent cystatin C K values.
3. KDIGO 2024 practice-point wording for pediatric equations.
4. The Lee-Dang SCI equation (Lee & Truong 2014/2015 full text).
5. Current DailyMed labels for acyclovir, vancomycin, gentamicin/tobramycin/amikacin and lithium: renal band units.
6. Choudhary 2026 review: retrieve its PMID if it is cited at all. Its 0.4 = "Bauer 1983" attribution conflicts with `lit/` R3.

## Additional references (new in this file; PubMed-verified unless tagged)
- Brown DL, Masselink AJ, Lalla CD. *Ann Pharmacother* 2013;47:1039-44. PMID 23757387. https://doi.org/10.1345/aph.1S176
- Park EJ, Pai MP, Dong T, et al. *Ann Pharmacother* 2012;46:317-28. PMID 22395245. https://doi.org/10.1345/aph.1Q374
- Wilhelm SM, Kale-Pradhan PB. Estimating creatinine clearance: a meta-analysis. *Pharmacotherapy* 2011;31:658-64. PMID 21923452. https://doi.org/10.1592/phco.31.7.658
- Emanuel NA, Price S, Hansen DK, et al. *Clin Transplant* 2023;37:e15059. PMID 37395991. https://doi.org/10.1111/ctr.15059
- Bouquegneau A, Vidal-Petiot E, Moranne O, et al. *Br J Clin Pharmacol* 2016;81:349-61. PMID 26531818. https://doi.org/10.1111/bcp.12817
- Busse D, Borghardt JM, Petroff D, et al. *Br J Clin Pharmacol* 2022;88:2973-81. PMID 34688225. https://doi.org/10.1111/bcp.15115
- Pai MP. *Adv Chronic Kidney Dis* 2010;17:e53-62. PMID 20727504. https://doi.org/10.1053/j.ackd.2010.05.010
- Pai MP, Nafziger AN, Bertino JS. *Antimicrob Agents Chemother* 2011;55:4006-11. PMID 21670189. https://doi.org/10.1128/AAC.00174-11
- Basolo A, Salvetti G, Giannese D, et al. *J Clin Endocrinol Metab* 2023;108:3280-6. PMID 37296533. https://doi.org/10.1210/clinem/dgad330
- Salazar DE, Corcoran GB. *Am J Med* 1988;84:1053-60. PMID 3376975. https://doi.org/10.1016/0002-9343(88)90310-5
- Spinler SA, Nawarskas JJ, Boyce EG, et al. *Ann Pharmacother* 1998;32:1275-83. PMID 9876806. https://doi.org/10.1345/aph.18122
- Young M, et al. *Drugs R D* 2017;17:435-40. PMID 28815425. https://doi.org/10.1007/s40268-017-0200-1
- Bukhari et al. *Healthcare (Basel)* 2024;12:1144. PMID 38891219. https://doi.org/10.3390/healthcare12111144
- Nakano et al. *Basic Clin Pharmacol Toxicol* 2026;139:e70287. PMID 42609167. https://doi.org/10.1111/bcpt.70287
- Khuu T, Bagdasarian G, Leung J, et al. *Am J Health Syst Pharm* 2010;67:274-9. PMID 20133531. https://doi.org/10.2146/ajhp090251
- Dooley MJ, et al. Dosing of cytotoxic chemotherapy: impact of renal function estimates on dose. *Ann Oncol* 2013;24:2746-52. PMID 23928359. https://doi.org/10.1093/annonc/mdt300
- Chikkalingaiah KB, Grant ND, Mangold TM, et al. *Am J Med Sci* 2010;339:108-16. PMID 20087164. https://doi.org/10.1097/MAJ.0b013e3181c62279
- Lee JP, Truong TT. *J Pharm Technol* 2015;31:115-9. PMID 34860964. https://doi.org/10.1177/8755122514559844. And *Nephron* 2015;131:66-72. PMID 26330088. https://doi.org/10.1159/000439186
- Kaji D, Strauss I, Kahn T. *Mt Sinai J Med* 1990;57:160-4. PMID 2370884
- Young F, Ensom MHH. *Am J Health Syst Pharm* 2011;68:1607-14. PMID 21856806. https://doi.org/10.2146/ajhp100473
- Brown N, et al. *Top Spinal Cord Inj Rehabil* 2024;30:57-65. PMID 39619822. https://doi.org/10.46292/sci24-00001
- Erlandsen EJ, et al. *Spinal Cord* 2012;50:778-83. PMID 22547045. https://doi.org/10.1038/sc.2012.52
- Schwartz GJ, Muñoz A, Schneider MF, et al. *J Am Soc Nephrol* 2009;20:629-37. PMID 19158356. https://doi.org/10.1681/ASN.2008030287
- Schwartz GJ, Haycock GB, Edelmann CM, Spitzer A. *Pediatrics* 1976;58:259-63. PMID 951142 (metadata only)
- Schwartz GJ, Brion LP, Spitzer A. *Pediatr Clin North Am* 1987;34:571-90. PMID 3588043. https://doi.org/10.1016/s0031-3955(16)36251-4
- Schwartz GJ, Feld LG, Langford DJ. *J Pediatr* 1984;104:849-54. PMID 6726515. Schwartz GJ, Gauthier B. *J Pediatr* 1985;106:522-6. PMID 3973793
- Pierce CB, Muñoz A, Ng DK, et al. *Kidney Int* 2021;99:948-56. PMID 33301749. PMC9083470. https://doi.org/10.1016/j.kint.2020.10.047
- KDIGO 2024 CKD Guideline. *Kidney Int* 2024;105(4S):S117-S314. PMID 38490803. https://doi.org/10.1016/j.kint.2023.10.018 (pediatric content [2nd])
- Averina et al. *Clin Chem Lab Med* 2026;64:2207-15. PMID 42343553. https://doi.org/10.1515/cclm-2026-0464
- Marpaung et al. *PLoS One* 2026;21:e0340649. PMID 41494029. Kim et al. *Ann Lab Med* 2026;46:427-38. PMID 42015823. Ibrahim et al. *J Appl Lab Med* 2024;9:803-8. PMID 38656545
- Chen S. *J Am Soc Nephrol* 2013;24:877-88. PMID 23704286. https://doi.org/10.1681/ASN.2012070653. Chen S. *Kidney Med* 2019;1:207-16. PMID 32734201
- Desgrouas M, Merdji H, Bretagnol A, et al. *Crit Care Med* 2021;49:e761-70. PMID 33710029. https://doi.org/10.1097/CCM.0000000000004946
- Pelletier K, Lafrance JP, Roy L, et al. *Nephrol Dial Transplant* 2020;35:1886-93. PMID 33151336. https://doi.org/10.1093/ndt/gfz178
- Sangla F, Marti PE, Verissimo T, et al. *Crit Care Med* 2020;48:e1232-41. PMID 33044285. https://doi.org/10.1097/CCM.0000000000004650
- Kadivarian S, et al. *Acute Crit Care* 2022;37:185-92. PMID 35545239. https://doi.org/10.4266/acc.2021.01256
- Jain A, et al. *Transplant Proc* 2024;56:1319-26. PMID 38981764. https://doi.org/10.1016/j.transproceed.2024.05.026
- Carrié C, et al. *Crit Care* 2018;22:177. PMID 30037335. https://doi.org/10.1186/s13054-018-2117-7
- Bairy M, et al. *Nephron* 2020;144:299-303. PMID 32369818. https://doi.org/10.1159/000507260
- Matzke GR, Aronoff GR, Atkinson AJ, et al. *Kidney Int* 2011;80:1122-37. PMID 21918498. https://doi.org/10.1038/ki.2011.322
- Delanaye P, Cavalier E. *Br J Clin Pharmacol* 2022 (editorial) [V via Consensus abstract; PMID not retrieved]
- US FDA. Pharmacokinetics in Patients with Impaired Renal Function — Study Design, Data Analysis, and Impact on Dosing. Final guidance, March 2024. https://www.fda.gov/media/78573/download
- NIDDK. eGFR calculators for adults and pediatrics. https://www.niddk.nih.gov/health-information/professionals/clinical-tools-patient-management/kidney-disease/laboratory-evaluation/estimated-gfr-calculators/adults-pediatrics
- [R] Brater DC. *Drug Use in Renal Disease.* ADIS Health Science Press, 1983. Chiou WL, Hsu FH, 1975. Moran SM, Myers BD, 1985.

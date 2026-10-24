# Decisions: acyclovir IV and the adult infusion library

Prepared 2026-10-23. This builds on `lit/acyclovir-infusions-hepatic.md` (the "prior cross-check") and does not repeat it. It goes deeper on items left open there, marked [R] there, or listed in its section 3 (sign-off). No other files were edited.

**Evidence tags**
- **[V]**: read this session in the primary source. That means the DailyMed SPL text, the ASHP S4S PDF, the guideline full text, or the PubMed abstract or full text.
- **[V2]**: read only in a secondary or institutional reproduction.
- **[R]**: recalled or seen only in a search snippet. Not verified. Confirm before release.
- **inst.**: a proposal with no external source. It needs P&T or clinician sign-off.

**How DailyMed labels were read:** SPL XML from the DailyMed v2 API, pulled 2026-10-23. Setids are given so each one can be re-checked. Generic labels from other manufacturers can word things differently.

---

## Summary of recommended defaults

| # | Decision | Recommended default | Confidence |
|---|---|---|---|
| 1 | Acyclovir dosing weight in obesity | **AdjBW (IBW + 0.4·(TBW−IBW)) when TBW > 1.2·IBW (or BMI ≥ 30); otherwise TBW.** Never TBW in obesity. Always show the label's "use IBW" statement, with a one-click IBW option | Moderate (evidence conflicting) |
| 2 | Renal band units | **Compare in the label's own units (mL/min/1.73 m²)** by normalising CG CrCl by BSA. Display absolute mL/min alongside. Warn when the two fall in different bands. Same rule as `decisions/renal-body.md` Q6 | Moderate |
| 3 | CRRT / HD / PD | CRRT: **5–10 mg/kg q12–24h (Heintz 2009)**. Default **10 mg/kg q12h for CNS / VZV / severe infection**, and **5–7.5 mg/kg q24h otherwise**. HD: **2.5–5 mg/kg q24h, dosed after HD on HD days** (label: "additional dose after each dialysis"). PD: label 50% q24h, no supplement | Moderate (CRRT low-moderate) |
| 4 | HSE duration; VZV encephalitis dose | HSE **10 mg/kg q8h × 14–21 d** (IDSA 2008 A-I [V]). VZV encephalitis **10–15 mg/kg q8h × 10–14 d** (IDSA B-III [V]), default 10 mg/kg with a 15 mg/kg option | High (HSE) / Moderate (VZV) |
| 5 | Blum CL equation | Keep CL (L/h/1.73 m²) = 0.2022·CrCl + 1.722. **Coefficients still unverified from full text.** It reproduces the label CL table at 3 of 4 points | Low-moderate (coefficients) |
| 6 | Infusion hard maxima | Label-based where the label states a maximum (dopamine 50, esmolol 300, dobutamine 40, epinephrine 2, milrinone 0.75, nicardipine 15, diltiazem 15, vasopressin 0.1). Institutional elsewhere. See table Q6 | High where label; Low where inst. |
| 7 | Procainamide load | **Default 17 mg/kg (ACLS) with a soft alert at 1 g (label) and a hard stop at 17 mg/kg**; rate 20 mg/min default, **hard max 50 mg/min** | Moderate |
| 8 | Labetalol units | **mg/min** (S4S [V]), 1 mg/mL (5 mg/mL fluid-restricted) | High |
| 9 | Argatroban nomogram | **EU Novastan SmPC table** (two tracks: standard and critically ill / hepatic). US label targets: aPTT 1.5–3× baseline, ≤100 s, max 10 mcg/kg/min | Moderate-high |
| 10 | Market availability | **Remove fenoldopam, nesiritide, abciximab** (all discontinued in the US). Keep isoproterenol and procainamide (marketed) | High |
| 11 | lb → kg | **kg = lb × 0.45359237** (exact definition). Display 1 decimal. Prefer kg entry only | High |

---

## Q1. Acyclovir dosing weight in obesity

**Options:** IBW (label) · AdjBW 0.4 · TBW · tiered by BMI or %IBW.

**Evidence**
- **Label** [V, prior file]: "Obese patients should be dosed … using Ideal Body Weight." There are no supporting data in the label.
- **Turner RB et al. 2016**, AAC 60:1830-3. PMID 26824940, doi:10.1128/AAC.02010-15 [V abstract, prior file]. Prospective, single-dose study, n = 7 obese (>190% IBW) vs 7 normal-weight.
  - Dosing obese patients on IBW gave a **lower AUC (15.2 vs 24.0 mg·h/L) and Cmax** than normal-weight patients dosed on TBW.
  - The authors suggest AdjBW would approximate normal exposure, but AdjBW was not studied directly.
- **Hernandez JO, Norstrom J, Wysock G 2009**, AJHP 66:1288-91. PMID 19574603, doi:10.2146/ajhp080307 [V abstract].
  - A single case: 108.9 kg, 170 cm, given 1 g q8h on TBW, developed AKI by day 3. SCr was 3.1 mg/dL at discharge.
  - This is the case report usually cited against TBW dosing.
- **Barber KE et al. 2019**, OFID 6:ofz121. PMID 31024972, doi:10.1093/ofid/ofz121 [V, prior file]. Nephrotoxicity was 21%. Obesity OR 3.2 (1.19–8.67) and concomitant vancomycin OR 4.7 were risk factors.
- **Newer comparative cohorts** [V, prior file]. Both cohorts are retrospective.
  - **Saad MO et al. 2025**, Ann Pharmacother 59:801. PMID 39956984, n = 339. AKI was 17.3% with TBW, 11.6% with AdjBW and 7% with IBW. The IBW aOR was 0.27 vs TBW; the AdjBW aOR of 0.48 was not significant.
  - **Zelnicek TD et al. 2023**, IJAA 62:106871. PMID 37257520, n = 94. AKI was 0/33 with AdjBW vs 8/61 with IBW.
- **Aboelezz A, Mahmoud SH 2024**, J Am Pharm Assoc 64:102040. PMID 38364888, doi:10.1016/j.japh.2024.02.013 [V abstract].
  - Scoping review of 22 articles. It found "a lack of consistency" in which weight to use.
  - Proposed approach: TBW if normal weight, AdjBW if obese, and up to maximum doses in augmented renal clearance.
- **Aboelezz 2025**, J Clin Neurosci, PMID 40188662 [V, prior file]. In HSE (n = 237), supratherapeutic dosing was linked to AKI (aOR 12.9). Authors favour AdjBW in obesity.
- **Practice survey: Wong A, Pickering AJ, Potoski BA 2016/17**, J Pharm Pract 30:324-8. PMID 27067742, doi:10.1177/0897190016642689 [V abstract]. 240 ACCP critical-care and ID pharmacists responded. As weight increased, respondents moved toward AdjBW, but practice in obesity was inconsistent.
- **Polso AK, Lassiter JL, Nagel JL 2014**, J Clin Pharm Ther 39:584-608. PMID 25203631, doi:10.1111/jcpt.12200 [V abstract]. University of Michigan obese antimicrobial dosing guideline, covering 15 drugs including acyclovir. The acyclovir weight it chose is not visible in the abstract [R: believed AdjBW].

**Institutional choices** (all [R] or [V2]; none read in full this session)
- Pharmacists increasingly use AdjBW (survey above).
- A West Virginia trial registration (NCT02879630, search snippet [V2]) states that its institution doses IV acyclovir in obesity on AdjBW 0.4.
- Lexicomp-style references quote the label (IBW) and note that some clinicians use AdjBW [R].
- Johns Hopkins ABX Guide: IBW [R].

**Recommended default: AdjBW 0.4 when TBW > 1.2·IBW (or BMI ≥ 30). TBW otherwise. Never TBW in obesity.**
- Rationale: IBW under-exposes patients (Turner 2016) in a disease (HSE) where underdosing is costly. AdjBW avoids the TBW AKI signal.
- The one cohort favouring IBW (Saad) did not show a significant AdjBW-vs-TBW difference. Its AKI risk for AdjBW was lower than TBW in point estimate.
- The obesity threshold should match the suite-wide threshold set in `renal-body.md`.
- **Alternatives:**
  - IBW (label-concordant). Offer it as a one-click option and display the label sentence.
  - For non-CNS indications, IBW is a reasonable institutional default.
- **Confidence: moderate.** There is no outcome RCT, and the cohorts conflict.
- **Guardrails:** keep the label hard maximum of 20 mg/kg q8h, calculated on the chosen dosing weight. Show a soft alert above 1,000 mg per dose and a vancomycin co-therapy warning (Barber).

---

## Q2. Renal bands: absolute mL/min vs mL/min/1.73 m²

**Evidence**
- **Label Table 5 units** are CrCl in mL/min/1.73 m² [V, prior file and subagent: ProPharma setid 23a7cf9e-f21b-06c2-e063-6394a90aa623, updated 2025-07-18].
- **Blum 1982** regressed CL on CrCl normalised per 1.73 m² (the units of the Blum line, see Q5) [R units, consistent with label Table 2].
- **FDA 2024 final guidance** *PK in Patients with Impaired Renal Function* prefers **absolute (non-BSA-indexed) eGFR** for dosing recommendations [V2 via review articles; `renal-body.md` Q6 reports the text as read]. It addresses new labels, not legacy ones.
- **Common practice:** drug references and institutions apply the acyclovir bands to Cockcroft-Gault CrCl in mL/min without normalising [R].

**Options**
- (a) CG mL/min against the label bands. This is common practice.
- (b) Normalise to per 1.73 m² (label fidelity).
- (c) Compute both and use the lower.

**Recommended default: (b) compare in the label's units.** This keeps the suite-wide rule in `decisions/renal-body.md` Q6, where each band carries a units tag.
- Display the absolute value too, and flag when (a) and (b) fall in different bands.
- In obese patients, normalised CrCl is lower than absolute CrCl, which is the conservative direction for a nephrotoxic drug.
- In small or elderly patients, normalised CrCl is higher than absolute. Option (c) is the safety-maximal alternative; the drawback is that it underdoses CNS infection in small patients.
- **Confidence: moderate.**

---

## Q3. CRRT, intermittent HD and PD

**Evidence**

*CRRT*
- **Trotman RL et al. 2005**, Clin Infect Dis 41:1159-66. PMID 16163635, doi:10.1086/444500 [V abstract]. The paper covers acyclovir, but the table was not accessible. The commonly quoted values are **5–7.5 mg/kg q24h for CVVH and 5–7.5 mg/kg q12–24h for CVVHD/CVVHDF** [R].
- **Heintz BH, Matzke GR, Dager WE 2009**, Pharmacotherapy 29:562-77. PMID 19397464, doi:10.1592/phco.29.5.562 [V abstract]. Acyclovir row as reproduced in the UC Davis stewardship ESRD table ("adapted from Heintz 2009") [V2; the PDF text layer is misaligned, so the row mapping was inferred]:
  - **CVVH 5–10 mg/kg q24h.**
  - **CVVHD and CVVHDF 5–10 mg/kg q12–24h.**
  - **IHD 2.5–5 mg/kg q24h**, dosed after HD.
  - Use the high end for meningoencephalitis or VZV, e.g. 10 mg/kg q12h on CVVHDF.
  - The doses assume effluent of 1–2 L/h.
  - https://health.ucdavis.edu/media-resources/antibiotic-stewardship/documents/pdfs/guidelines/esrd_abx_dosing.pdf
- **Li L et al. 2020**, Front Pharmacol 11:786. PMID 32547394, PMC7273837, doi:10.3389/fphar.2020.00786 [V full text]. Table 3 gives 5–7.5 mg/kg q24h for CVVH, CVVHD and CVVHDF. The authors state that no newer modality-specific data exist and that individual monitoring is needed.
- **Khajehdehi P et al. 2000**, Clin Nephrol 54:351. PMID 11076113 [V abstract]. Single anuric patient:
  - Acyclovir clearance was 14 mL/min on CVVHD and 17 mL/min on CVVHDF.
  - Off renal replacement, t½ was 22–25 h. On CVVHDF it was 19.5 h.
- **UBC Critical Care CRRT anti-infective guide** (2020) [V2]: 10 mg/kg q12h. https://ubccriticalcaremedicine.ca/wp-content/uploads/2023/07/Anti-Infective-IV-Dosing-in-Continuous-Renal-Replacement-Therapy-CRRT.pdf
- **UCSF and LHSC guides:** search snippets only [R].
  - UCSF: 5 mg/kg q24h for non-CNS infection; 10 mg/kg q12h for HSE or disseminated VZV.
  - LHSC: 5–7.5 mg/kg q12h.

*Intermittent HD*
- **Label** [V]: HD t½ is about 5 h, and a 6-h session gives a 60% fall in plasma levels. "An additional dose is administered after each dialysis."
- **Laskin OL et al. 1982**, Clin Pharmacol Ther 31:594. PMID 7075109, doi:10.1038/clpt.1982.83 [V abstract]. In ESRD, t½ was 19.5 h off HD and 5.7 h on HD. Dialysis clearance was 81.8 mL/min.
- **Krasny HC et al. 1982**, Am J Med 73(1A):202. PMID 7102703, doi:10.1016/0002-9343(82)90091-2 [V abstract]. Recommended dosing: "one-half the suggested IV dose … every 24 hours and a similar replacement dose … after each dialysis."

*PD*
- **Label** [V]: no supplemental dose is needed after adjusting the interval.

**Recommended defaults**
- **CRRT:** a modality selector (CVVH / CVVHD / CVVHDF). All modalities map to the Heintz range of 5–10 mg/kg.
  - **CNS infection, VZV or immunocompromised severe infection: 10 mg/kg q12h.**
  - **Mucocutaneous HSV: 5–7.5 mg/kg q24h.**
  - Require an effluent ≥ 20 mL/kg/h assumption checkbox.
  - Banner: "No adult PK study; modelled on effluent 1–2 L/h; monitor neuro status; consider levels."
  - Confidence: **low-moderate**. Institutions range from 5–7.5 q24h to 10 q12h.
- **IHD:** 2.5–5 mg/kg q24h (50% of the indication dose), with the daily dose given **after** HD on HD days. This satisfies the label's "additional dose after dialysis" wording, which should be displayed verbatim. If the patient's daily dose was already given before HD, add a supplemental 50% dose after HD. Confidence: **moderate**.
- **PD:** 50% of the dose q24h, no supplement. Confidence: **moderate** (label only).

---

## Q4. HSE duration and VZV encephalitis dose

**Evidence**
- **Tunkel AR et al. IDSA 2008**, Clin Infect Dis 47:303-27. PMID 18582201, doi:10.1086/589747 [V, full text on OUP read this session].
  - HSV: "acyclovir is recommended (A-I)". Dosing text: "10 mg/kg intravenously every 8 h for 14–21 days" in normal renal function.
  - VZV: "acyclovir is recommended (B-III)". Dosing text: "10–15 mg/kg intravenously every 8 h for 10–14 days". This rests on case reports and series.
  - The guideline does not address obesity.
- **Solomon T et al. 2012, ABN/BIA UK guideline**, J Infect 64:347-73. PMID 22120595, doi:10.1016/j.jinf.2011.11.014 [V record].
  - Content [R]: aciclovir 10 mg/kg q8h for at least 14 days in immunocompetent adults and 21 days in immunocompromised adults. Repeat the LP and PCR before stopping.
  - VZV: 10–15 mg/kg [R].
- **Label** [V, prior file]: HSE 10 days. This reflects the 1980s trials, and relapse after 10-day courses is described.
- No newer IDSA encephalitis guideline was found this session [R: none known as of 2026-10].

**Recommended default**
- **HSE: 10 mg/kg q8h, duration 14 d (immunocompetent) / 21 d (immunocompromised).** Show a 14–21 d range, with the label's 10 d as a footnote. Confidence: **high**.
- **VZV encephalitis: 10 mg/kg q8h by default, with 15 mg/kg selectable; 10–14 d.**
  - The 15 mg/kg option triggers a renal/neuro warning and stays capped at the 20 mg/kg q8h label maximum.
  - With the Q1 dosing weight, 15 mg/kg on AdjBW is the common "severe VZV" choice [R].
  - Confidence: **moderate**. The evidence grade is B-III.

---

## Q5. Blum 1982 clearance equation

**Source:** Blum MR, Liao SH, de Miranda P. Am J Med 1982;73(1A):186-92. PMID 7048911, doi:10.1016/0002-9343(82)90088-2.
- The abstract was re-read this session [V]. It pools 10 studies and says "dosage adjustment for various stages of renal impairment are proposed based on the observed relationship between Cltot and Clcr". It gives no coefficients.
- **The full text is not accessible** (Elsevier paywall; no PMC copy). A web search for "0.2022" with acyclovir and Blum returned nothing [V negative].
- **Coefficients remain unverified [R].**

**Consistency check against label Table 2 (own calculation)**

| CrCl band (mL/min/1.73 m²) | Label CL (mL/min/1.73 m²) | Blum equation | CrCl at which Blum gives the label value |
|---|---|---|---|
| anuric (0) | 29 | 28.7 (at CrCl 0) | 0 ✓ |
| 50–80 | 248 | 248 at CrCl 65 (band midpoint) | 65 ✓ |
| >80 | 327 | 332 at CrCl 90 | 88.5 ✓ |
| 15–50 | 190 | 138 at CrCl 32.5 (midpoint) | 47.9 (upper edge) ✗ |

The intercept and slope reproduce three label points almost exactly. This makes it very likely that the label table and the equation come from the same pooled data, and that the coefficients are correctly transcribed. The 15–50 band would fit only if its patients clustered near 48.

**Recommended default:** keep the equation, with input CrCl in mL/min/1.73 m² and output CL in L/h/1.73 m², de-normalised by BSA.
- Use it to show the expected Css and t½ only, not to choose the regimen. The regimen comes from the label table.
- Badge: "coefficients not verified against full text; consistent with label Table 2".
- **To verify:** obtain the PDF through a library (ScienceDirect, Am J Med 73(1A) supplement).
- **Confidence: low-moderate.**

---

## Q6. Infusion hard maxima

S4S (Sept 2026) standardises concentrations and dosing units only. **It sets no dose limits** [V, S4S PDF text extracted this session]. Its notes say only "standardize dosing units" (note 6) and recommend weight-based dosing for vasopressors.

ISMP's 2020 smart-pump guidelines are process-only and give no numbers [R]. The only public numeric library found was Vanderbilt's 2013 Alaris stepdown profile [V2, dated and not ICU]. Its values: norepinephrine 1–17 mcg/min, NTG 5–30, dopamine 1–15, dobutamine 0.5–20, diltiazem 2.5–15.

So the "hard max" values below are **label-anchored where the label states a ceiling**, and **institutional** otherwise. Label quotes are [V], read from DailyMed SPL this session; setids are in the source list.

| Drug (S4S unit) | Label statement (max) | Soft max (alert) | **Hard max (no override)** | Basis / confidence |
|---|---|---|---|---|
| Amiodarone (mg/min) | 1 mg/min × 6 h, then 0.5 mg/min; "do not exceed the recommended rate"; breakthrough 150 mg over 10 min (Nexterone, Baxter) | 1 | **1 mg/min** (continuous); bolus 150 mg over 10 min (15 mg/min) via the bolus function only | Label; moderate-high |
| Dopamine (mcg/kg/min) | "do not exceed 50 mcg/kg/minute" (Hospira) | 20 | **50** | Label; high |
| Esmolol (mcg/kg/min) | "maximum of 200 (tachycardia) or 300 (hypertension)" (Brevibloc) | 200 | **300** | Label; high |
| Heparin (units/kg/h) | No adult max. Label is 20,000–40,000 units/24 h fixed | 25 | **35 units/kg/h** inst.; **absolute 2,500 units/h** inst. | Inst.; low. Raschke 1993 VTE start 18 units/kg/h (PMID 8214998, doi:10.7326/0003-4819-119-9-199311010-00002 [record V, nomogram R]); ACS start 12 units/kg/h, max 1,000 units/h initial [R] |
| Heparin (units/h, flat) | as above | 2,000 | **2,500 units/h** inst. | Inst.; low. Keep as a separate, visually distinct entry, per S4S note 6 |
| Insulin regular (units/h) | No max in Humulin R, Novolin R or Myxredlin labels | 20 | **30 units/h** inst.; the high-dose 16 units/mL CCB/BB entry is separate | Inst.; low. DKA 0.1 units/kg/h (ADA 2024 [V2]) gives 15 units/h at 150 kg |
| Labetalol (mg/min) | 2 mg/min; "total dose of up to 300 mg may be required" (Hospira) | 2 | **8 mg/min** | Hard max from AHA/ASA acute ischaemic stroke BP regimen (labetalol infusion 2–8 mg/min) [R]; moderate-low. Cumulative counter with alert at 300 mg |
| Nitroglycerin (mcg/min) | Start 5; no max; some patients need "one or even two orders of magnitude higher" (Baxter) | 200 | **400 mcg/min** inst. | Inst.; low-moderate |
| Norepinephrine (mcg/kg/min) | No max (Levophed) | 1 | **3 mcg/kg/min** inst. | Inst.; low |
| Propofol (mcg/kg/min) | ICU 5–50; "should not exceed 4 mg/kg/hour [66.7 mcg/kg/min] unless the benefits outweigh the risks" (Diprivan) | 50 | **80 mcg/kg/min** inst. | Soft from the label maintenance range; hard inst.; moderate. Show the label's 66.7 mcg/kg/min statement in the alert text |
| Vasopressin (units/min) | Septic 0.01–0.07; post-cardiotomy 0.03–0.1; "limited data above 0.1 … and 0.07" (Vasostrict) | 0.04 (septic) / 0.07 | **0.1 units/min** | Label; moderate-high |
| Dobutamine (mcg/kg/min) | 2.5–15 usual; "on rare occasions… up to 40" | 20 | **40** | Label; high |
| Epinephrine (mcg/kg/min) | Septic shock 0.05–2 (Adrenalin) | 0.5 | **2** | Label; moderate-high |
| Phenylephrine (mcg/kg/min) | Current 10 mg/mL and RTU labels are anaesthesia-only: 10–35 mcg/min or 0.5–1.4 mcg/kg/min, "not to exceed 200 mcg/min". The 0.5–6 mcg/kg/min shock range was **not found in current labels** [R] | 1.4 (anaesthesia) / 3 (shock) inst. | **6 mcg/kg/min** inst. | Conflicting; low. Needs sign-off. 200 mcg/min ≈ 2.9 mcg/kg/min at 70 kg |
| Milrinone (mcg/kg/min) | "Maximum 0.75 mcg/kg/min, 1.13 mg/kg" per 24 h (Hospira) | renal table value | **0.75** | Label; high. Apply the renal table as the soft max |
| Nicardipine (mg/h) | "up to a maximum of 15 mg/hr" (Cardene IV premix) | 15 | **15** | Label; high |
| Diltiazem (mg/h) | "up to a maximum of 15 mg/hour"; >24 h not studied | 15 | **15** | Label; high. 24-h duration alert |

Related checks from the same pass:
- Isoproterenol: label shock 0.5–5 mcg/min, "rates over 30 mcg per minute have been used". The prior file's hard max of 20 mcg/min stays institutional.
- Lidocaine and nitroprusside were covered in the prior file.

**Recommended default:** adopt the hard and soft columns above. Every "inst." cell is listed for P&T sign-off. **Confidence: high** for the label-anchored rows; **low** for heparin, insulin, nitroglycerin, norepinephrine, propofol hard max and phenylephrine.

---

## Q7. Procainamide loading

**Evidence**
- **Label** (Hospira, setid 17e47845-daad-434c-a784-6d3875b0d704, rev 02/2026) [V]:
  - Bolus rate "not to exceed 50 mg per minute": 100 mg q5 min up to 500 mg, then wait at least 10 min.
  - Alternatively, a loading infusion of 20 mg/mL at 1 mL/min (20 mg/min) for 25–30 min, giving 500–600 mg.
  - "The maximum advisable dosage … is 1 g."
  - Maintenance 2–6 mg/min.
- **AHA ACLS adult tachycardia algorithm, 2025** [V2: search-summary text; PDF returned HTTP 403]:
  - "20–50 mg/min until arrhythmia suppressed, hypotension ensues, QRS duration increases >50%, or maximum dose 17 mg/kg."
  - Maintenance 1–4 mg/min. Avoid in prolonged QT or CHF.
  - The same numbers appear in 2020-era ACLS [V2].
- **Conflict:** 17 mg/kg is about 1.19 g at 70 kg and 1.7 g at 100 kg, which exceeds the label's 1 g.

**Recommended default**
- Loading target **17 mg/kg, computed on TBW and capped at 100 kg [inst.]**.
- **Soft alert at > 1 g**, citing the label.
- **Hard stop at 17 mg/kg.**
- Rate: **default 20 mg/min, hard max 50 mg/min.**
- Stop-criteria checklist: hypotension, QRS widening > 50%, arrhythmia suppressed.
- Maintenance soft 1–4 mg/min, hard 6 mg/min (label).
- Alternative: a label-strict profile with a 1 g hard stop.
- **Confidence: moderate.** The weight cap is institutional.

---

## Q8. Labetalol continuous-infusion units

- **S4S Sept 2026** [V, PDF text extracted]: labetalol at **1 mg/mL or 5 mg/mL**, dosing unit **mg/min**. The references are the Hikma premix and Hospira labels.
- **Label** [V]: 2 mg/min.
- mg/h protocols exist (e.g. 0.5–10 mg/h is not label) [R].

**Recommended default: mg/min.**
- If a mg/h protocol is ever needed, build it as a separately named entry with no shared library name.
- **Confidence: high.**

---

## Q9. Argatroban aPTT titration

**Evidence**
- **US label** (Sagent setid 629aee90-3bf3-4947-a978-21cbba2e1c41, rev 9/2025) [V]:
  - Start 2 mcg/kg/min. Moderate or severe hepatic impairment: start 0.5.
  - Target aPTT 1.5–3× baseline, not over 100 s. Check 2 h after a start or change.
  - Maximum 10 mcg/kg/min.
  - **There is no numeric titration table.**
- **ASH 2018**, Cuker A et al. Blood Adv 2:3360-92. PMID 30482768, PMC6258919, doi:10.1182/bloodadvances.2018024489 [V, full-text PDF copy]. Table 2:
  - 2 mcg/kg/min in normal organ function.
  - **0.5–1.2** with liver dysfunction (bilirubin > 1.5 mg/dL), heart failure, anasarca or after cardiac surgery.
  - aPTT 1.5–3× baseline.
  - Avoid, or reduce the dose, in Child-Pugh B/C.
- **CHEST 2012**, Linkins LA et al. Chest 141(2 Suppl):e495S. PMID 22315270, doi:10.1378/chest.11-2303 [V abstract; dose text R]. Same 0.5–1.2 reduced-start populations.
- **Novastan EU SmPC** (Sweden MPA, rev 2023-07-19) [V]. https://docetp.mpa.se/LMF/Novastan%20solution%20for%20infusion%20ENG%20SmPC_09001bee807a5b9d.pdf
  - **Standard track** (start 2 mcg/kg/min; next aPTT in 2 h after each change):

    | aPTT | Action |
    |---|---|
    | < 1.5× baseline | increase by 0.5 mcg/kg/min |
    | 1.5–3.0× (≤ 100 s) | no change; after 2 consecutive in-range values, check at least daily |
    | > 3.0× or > 100 s | stop until 1.5–3.0×, then resume at half the previous rate |

  - **Critically ill / hepatic track** (start 0.5 mcg/kg/min; next aPTT in 4 h):

    | aPTT | Action |
    |---|---|
    | < 1.5× baseline | increase by 0.1 mcg/kg/min |
    | 1.5–3.0× | no change |
    | > 3.0× or > 100 s | stop, then resume at half the previous rate |

  - The UK Exembol SmPC is reproduced identically by Galway University Hospitals [V2].
- **ICU evidence for lower doses** [V abstracts]:
  - Beiderlinden 2007, Ann Pharmacother. PMID 17440009. Maintenance about 0.2 mcg/kg/min in multiorgan dysfunction.
  - Keegan 2009, Ann Pharmacother. PMID 19116377. 0.6 mcg/kg/min in critically ill vs 1.4 in non-critically ill. 0.40 when SOFA ≥ 10.
  - Saugel 2010, Crit Care. PMID 20487559. Final dose 0.24 mcg/kg/min.
  - Fixed-increment nomograms reached target faster than percentage adjustments: Arpino 2015, PMID 23965335; Kiser 2011, PMID 21328434.
- **Institutional example:** King's College Hospital 2019 [V2]. Start 0.5 (critical), 0.2 (severe hepatic), 1.0 (others). Steps of 0.1 / 0.05 / 0.2.

**Recommended default: the SmPC two-track table** (above), with US-label targets and the 10 mcg/kg/min maximum.
- Track selection: Child-Pugh ≥ 7, bilirubin > 1.5 mg/dL, ICU with multiorgan failure, heart failure, anasarca or post-cardiac surgery → reduced track starting at 0.5 (ASH range 0.5–1.2).
- Option: an ICU start of 0.2 (Beiderlinden/Keegan) as an institutional choice.
- Drop the site's fixed 40–83 s table, or keep it only as "institution-defined".
- **Confidence: moderate-high.** It is regulator-issued, though outside the US, and consistent with the US targets.

---

## Q10. US market availability

Checked via openFDA Drugs@FDA marketing status and DailyMed SPL counts this session [V, subagent]:
- **Fenoldopam:** Corlopam NDA019922 and all listed ANDAs (Hikma, Sandoz, Teva, Luitpold) are **Discontinued**. DailyMed has 0 SPLs. **Remove.**
- **Nesiritide:** Natrecor NDA020920 is **Discontinued**. 0 SPLs. **Remove.**
- **Abciximab:** 0 SPLs. Discontinued in the US with the last lot expiring about 2019 [V2]. openFDA still shows a stale "Prescription" status. **Remove.**
- **Isoproterenol:** multiple active ANDAs (Isuprel NDA discontinued). **Keep.**
- **Procainamide injection:** active ANDAs (Hospira, Gland, Caplin, IMS). **Keep.** The ASHP shortage list was not checked.

**Recommended default:** remove the three discontinued drugs. Put an availability-check step in the release checklist. **Confidence: high.**

---

## Q11. lb → kg conversion constant

- The international avoirdupois pound is defined as **exactly 0.45359237 kg** (1959 international yard and pound agreement; NIST SP 811) [R, standard metrology].
- 1/0.45359237 = 2.20462262. Dividing by 2.2 overstates kg by 0.21%: 220 lb gives 100.0 kg instead of 99.79 kg.
- ISMP recommends weighing and recording in **kg only**, without lb conversion in clinical systems [R].

**Recommended default:**
- Store and compute in kg. Convert with **kg = lb × 0.45359237**.
- Round only for display (0.1 kg).
- Show the kg value prominently whenever lb is entered.
- Never use 2.2 internally.
- **Confidence: high.**

---

## Sources read this session (beyond the prior file)

- ASHP S4S *Adult Continuous Infusion Standards*, updated Sept 2026. https://www.ashp.org/-/media/assets/pharmacy-practice/s4s/docs/Adult-Infusion-Standards.pdf [V, text extracted]
- DailyMed SPL setids [V]:
  - Nexterone e9108958-b8d7-4fba-87c3-9a32990de551
  - dopamine 1f306ad2-3606-4525-5a8a-ce78f426c1a2
  - Brevibloc 220a07b8-5c68-41a3-8705-fd91f14c50b4
  - heparin c8c4edd2-ee9e-4558-6b8c-b83adc242a0a
  - Humulin R b519bd83-038c-4ec5-a231-a51ec5cc291f
  - Novolin R aee7f1f3-612c-4027-8ce9-4fd1f41eed71
  - Myxredlin afca6e80-a802-49fb-a978-5fe28a173001
  - labetalol abfc6b75-1ed5-41f1-0484-4597488237bc
  - NTG 457a026c-ebce-4701-9deb-2d7652759a99
  - Levophed 2c7dd2b0-cc10-4db6-bf56-6eb154ebeb10
  - Diprivan e3105799-a4b6-f3f4-e6e2-b2b29bbdb538
  - Vasostrict b1147beb-743e-4c62-8927-91192447f8b8
  - dobutamine 89becb0c-da60-4f43-0a98-29ff7a9eca58
  - Adrenalin 3b7a4364-668d-4eb2-a20c-04adc35aabe4
  - phenylephrine 4cea0781-2513-4030-8568-62dec253f866, 2f715e4e-b269-b935-d2c9-003cb29770be, 71b8fb8a-e13a-246f-f7b4-aa912b9ccd54
  - milrinone 813e8ca2-de54-4a7c-a2d2-8bd44396c341
  - Cardene IV 5499cfac-9147-4d5d-a8cb-f8d64f1481af
  - diltiazem 8bae87a5-2137-467e-a1ad-79b2bc075e07
  - isoproterenol 86b2455a-0489-405e-bd0b-9f79d3c5350d
  - procainamide 17e47845-daad-434c-a784-6d3875b0d704
  - argatroban 629aee90-3bf3-4947-a978-21cbba2e1c41
  - acyclovir 23a7cf9e-f21b-06c2-e063-6394a90aa623
  - URL pattern: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=SETID
- Tunkel AR et al. IDSA encephalitis 2008. https://academic.oup.com/cid/article/47/3/303/360722 [V]
- Novastan SmPC (MPA Sweden) [V]; ASH 2018 HIT guideline [V]; Li 2020 [V full text]
- PubMed abstracts [V]: PMIDs 19574603, 27067742, 25203631, 38364888, 7048911, 16163635, 19397464, 11076113, 7075109, 7102703, 22315270, 30482768, 17440009, 19116377, 20487559, 23965335, 21328434, 22120595 (record), 8214998 (record)
- Secondary [V2]:
  - UC Davis ESRD antimicrobial table (Heintz adaptation)
  - UBC CRRT guide
  - King's College HIT guideline
  - Vanderbilt 2013 Alaris library PDF
  - AHA 2025 tachycardia algorithm (summary only)
  - FDA 2024 renal guidance (via reviews; see `renal-body.md`)
  - NCT02879630 snippet

## Still unverified [R]: verify before release

- Blum coefficients (full text)
- Trotman 2005 table values
- UCSF and LHSC CRRT rows
- ABN 2012 duration and VZV wording
- Michigan (Polso) acyclovir weight choice
- Lexicomp / Johns Hopkins choices
- AHA/ASA stroke labetalol 2–8 mg/min
- ACS heparin caps
- Phenylephrine shock range in any current label
- NIST / ISMP wording for lb–kg
- All "inst." limits

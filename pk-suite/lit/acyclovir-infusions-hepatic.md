# Literature cross-check: acyclovir IV, adult infusion library, Child-Pugh

Prepared 2026-10-23 to review `specs/acyclovir.md`, `specs/infusion-rate.md` and `specs/hepatic-score.md`. The specs were not edited.

**Evidence tags used below**
- **[V]**: verified this session from the primary source (label text on DailyMed, the S4S PDF, or a PubMed record or abstract).
- **[V2]**: verified only through a secondary reproduction of the label or guideline (medlibrary, drugs.com, Pfizer medical-info pages, summary articles).
- **[R]**: recalled but not verified this session. Confirm before release.

Verdicts are: agrees / minor difference / site outdated / site wrong / unverifiable.

Key sources: the acyclovir label is DailyMed setid ae921e4e (Eugia, updated 7/2023). The S4S source is the ASHP *Adult Continuous Infusion Standards*, "Updated: September 2026" (PDF downloaded this session). The argatroban (Fresenius, rev 3/2025), bivalirudin (Fresenius, rev 4/2025) and eptifibatide (Baxter, rev 5/2024) labels were read on DailyMed. Full links are in section 4.

---

## 1. Item-by-item cross-check

### 1a. Acyclovir

| # | Item | Site / spec value | Current reference value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|---|
| A1 | Indication doses | 5 mg/kg q8h for mucocutaneous HSV (7 d) and genital (5 d); 10 mg/kg q8h for HSE (10 d) and VZV in immunocompromised (7 d) | Label gives identical doses and durations [V] | DailyMed acyclovir label §2 | agrees | Keep. |
| A2 | HSV encephalitis duration | 10 days | IDSA 2008: 10 mg/kg q8h for **14–21 days** [V2: secondary summaries; guideline record PMID 18582201 verified, text not read]. Relapse has been reported after 10-day courses [V2] | Tunkel CID 2008;47:303 (PMID 18582201, doi:10.1086/589747) | site outdated | Default HSE duration to 14–21 d (IDSA) and show the label's 10 d as a footnote. |
| A3 | VZV encephalitis | not on site | IDSA: 10–15 mg/kg q8h for 10–14 d [R]. One secondary table shows 10 mg/kg for 10–14 d [V2] | PMID 18582201 | unverifiable | Add as a custom indication: 10 mg/kg q8h with clinician-entered 10–15. Needs sign-off. |
| A4 | Renal table (CrCl mL/min/1.73 m²) | >50: 100% q8h; 25–50: 100% q12h; 10–25: 100% q24h; 0–10: 50% q24h | Identical [V] (label Table 5) | DailyMed label §2.4 | agrees | Keep. Note that the bands are per 1.73 m². If `renal` returns mL/min, normalise or label which is used. |
| A5 | Hemodialysis | "0–10 regimen; give dose **after** HD on HD days" | Label: HD t½ about 5 h, a 6-h HD lowers levels about 60%, and the schedule should be "adjusted so that an **additional dose** is administered after each dialysis" [V] | label §2.4 | minor difference | Implement as 50% q24h plus a post-HD dose on HD days (timing the daily dose after HD satisfies this). Show the label wording. |
| A6 | PD | 50% q24h, no supplement | "No supplemental dose appears to be necessary after adjustment of the dosing interval" [V] | label §2.4 | agrees | Keep. |
| A7 | HD half-life | spec: "≈ 5.7 h" | label: "approximately 5 hours" [V] | label §12.3/2.4 | minor difference | Use 5 h. |
| A8 | t½ / CL by CrCl | >80: 2.5 h; 50–80: 3.0; 15–50: 3.5; anuric: 19.5 | Same t½. Label CL: 327 / 248 / 190 / 29 mL/min/1.73 m² [V] | label Table 2 | agrees | Add the label CL column as a test oracle for Blum (A11). |
| A9 | Max concentration | ≤7 mg/mL | "approximately 7 mg/mL or lower" [V] | label §2.6 | agrees | Hard max 7 mg/mL. Soft warning above 5 mg/mL is a site and suite preference, not label. |
| A10 | Infusion time | ≥1 h (site recommends 2 h) | constant rate over 1 h, "at least 1 hour", bolus/rapid injection must be avoided [V] | label §2.6 | agrees | Default 1 h (label). Offer 2 h as an option; the 2 h preference is site expert opinion. |
| A11 | Blum CL equation | CL (L/h/1.73 m²) = 0.2022·CrCl + 1.722, n=70, R² 0.34 | The Blum 1982 overview pooled 10 studies and proposed renal dose adjustments from the CL–CrCl relationship [V, abstract]. Exact coefficients, n and R² not visible in the abstract. **Consistency check**: the intercept 1.722 L/h = 28.7 mL/min matches the label's anuric CL of 29 mL/min/1.73 m². At CrCl ≈ 88 the equation gives the label's 327 mL/min/1.73 m² band value | Blum MR, Am J Med 1982;73(1A):186 (PMID 7048911, doi:10.1016/0002-9343(82)90088-2) | unverifiable (coefficients) but consistent | Keep, marked "consistent with label Table 2; coefficients unverified (full text not accessed)". Note that the site's "pooled 7 studies" differs from the abstract's "10 studies". |
| A12 | Spector regression | CL = 0.091·CrCl + 7.52 (n=16, R² 0.45) | Abstract (n=16) confirms rates of 7.2–43.2 mg/kg/day and mean plateau 4.1 µM → 36.6 µM, i.e. 0.92 → 8.24 mg/L, matching the site's 0.9 / 8.2 mg/L [V]. Regression not in abstract | Spector SA, Am J Med 1982;73(1A):275 (PMID 6285719, doi:10.1016/0002-9343(82)90105-x) | unverifiable (equation); data agree | Keep as an optional display only. Not for dosing. |
| A13 | Fletcher regression and targets | CL = 0.178·CrCl + 2.92 (n=13, ages 4–57); targets HSV 4.5–9, EBV 6.8–13.5, CMV 9–18 mg/L | Abstract: n=13 (MeSH includes children), Css maintained at 20–98 µmol/L = 4.5–22 mg/L [V]. Full text (PMC172658) not retrievable as text | Fletcher CV, AAC 1989;33:1375 (PMID 2552909, doi:10.1128/AAC.33.8.1375) | unverifiable (equation and per-virus targets) | Optional display only. The spec's "0.45–9.7 mg/kg/h" inconsistency cannot be resolved without the full text. |
| A14 | Urine solubility 1.3 mg/mL (attributed to Spector) | 1.3 mg/mL | "solubility of acyclovir in bladder urine (1,300 micrograms/ml)" [V] in Hintz, Connor, **Spector** et al. 1982 (neonatal PK) | PMID 6285713, doi:10.1016/0002-9343(82)90093-6 | agrees (citation should be Hintz 1982) | Fix the attribution. |
| A15 | MW / conversion | 225 Da; "1 uM = 0.225 mcg" | 225.2 g/mol. 1 µmol/L = 0.225 mg/L [R, standard chemistry] | – | site wrong (units) | Use 0.225 mg/L per µmol/L. |
| A16 | Obesity dosing weight (label) | spec default `site_default` = AdjBW (0.4) if TBW > IBW | Label: "Obese patients should be dosed … using **Ideal Body Weight**" [V] | label §2 | site differs from label | Default needs sign-off (section 3). Whatever the default, display the label statement. |
| A17 | Turner 2016 | obese (>190% IBW) dosed on IBW vs normal-weight on TBW: CL 19.4 vs 14.3 L/h; AUC 15.2 vs 24.0; Cmax 5.8 vs 8.2 | Identical to abstract (n=7+7). Authors conclude AdjBW "appears to more closely approximate" normal exposure, but this was **not directly studied** [V] | AAC 2016;60:1830 (PMID 26824940, doi:10.1128/AAC.02010-15) | agrees | Cite with the n=14 single-dose caveat. |
| A18 | Newer obesity / AKI data | not on site | Saad 2025 (n=339 obese): AKI 17.3% TBW, 11.6% AdjBW, 7% IBW. IBW aOR 0.27 vs TBW; AdjBW aOR 0.48 (NS) [V]. Zelnicek 2023 (n=94, BMI≥30): AKI 0/33 AdjBW vs 8/61 IBW [V]. Aboelezz 2025 (HSE, n=237): supratherapeutic dosing linked to AKI (aOR 12.9); authors favour TBW for non-obese and AdjBW for obese patients [V] | PMIDs 39956984, 37257520, 40188662 | new evidence | Evidence is conflicting: both AdjBW and IBW are defensible, and TBW in obesity is not. Keep "never TBW if BMI>30". |
| A19 | Nephrotoxicity risk factors | obesity OR 3.2, vancomycin OR 4.3–4.7 | Barber 2019: 21% nephrotoxicity (RIFLE); obesity OR 3.2 (1.19–8.67); vancomycin OR 4.73 [V] | OFID 2019;6:ofz121 (PMID 31024972, doi:10.1093/ofid/ofz121) | agrees | Keep. |
| A20 | Neurotoxicity | warning with symptoms [EXT] | Label: about 1% of IV patients have encephalopathic changes. Use with caution in underlying neurologic abnormalities, and in renal impairment [V] | label §5 | agrees | Add the "~1%" label figure and renal-dose-error trigger. |
| A21 | Max dose | spec [EXT] "commonly 15 mg/kg/dose" | Label: "A maximum dose equivalent to **20 mg/kg every 8 hours** should not be exceeded for any patient" [V] | label §2 | site/spec wrong (source) | Hard max 20 mg/kg q8h (label). Soft warning above 15 mg/kg (adult usual max) and above 1000 mg/dose as spec. |
| A22 | Hydration | IV fluids >2 L/d; urine 100–150 mL/h | Label: "must be accompanied by adequate hydration" (no number) [V]. Kim 2015 numbers are cited by the site (PMID 25504951, not re-read) | label §2.6 | minor difference (site adds numbers) | Show the label requirement; present numeric targets as site/literature guidance. |
| A23 | TTP/HUS | not in spec | Label warning, fatal in immunocompromised patients [V] | label §5 | missing | Add to warnings. |

### 1b. Infusion library (site charts vs S4S Sept 2026 and current labels)

S4S column shows the standard concentration(s) and dosing unit [V, S4S PDF]. "Not in S4S" means the drug is absent from the adult list.

| # | Drug | Site conc / unit / range / max | S4S standard | Label / guideline | Verdict | Recommendation |
|---|---|---|---|---|---|---|
| L1 | Amiodarone | 1.8 mg/mL (450/250, 900/500 glass); mg/min; 0.5–1; conc max 1.8 | 1.8 mg/mL; mg/min | Label: 1 mg/min × 6 h then 0.5 mg/min; >2 mg/mL needs a central line; non-PVC container for >2 h [R]. Premix 1.8 mg/mL in non-glass (Nexterone) container [R] | agrees (conc/unit); "glass bottle" minor | Keep 1.8 mg/mL mg/min. Replace "glass bottle" with "glass or non-PVC (polyolefin) container or commercial premix". Verify the filter statement against the product label. |
| L2 | Argatroban | 1 mg/mL (normal); 0.5 mg/mL (hepatic); mcg/kg/min; start 2; max 10; CrCl<60 consider 1 | 1 mg/mL; mcg/kg/min | Label [V]: HIT start 2, max 10 mcg/kg/min; aPTT 1.5–3× baseline, not >100 s; moderate/severe hepatic impairment (Child-Pugh) start **0.5**; PK studied in Child-Pugh **>6**; "No dosage adjustment … renal dysfunction"; PCI 350 mcg/kg bolus + 25 mcg/kg/min, ACT 300–450 s; 50 mg/50 mL = 1 mg/mL undiluted | 1 mg/mL agrees. Hepatic start 0.5 agrees. CrCl<60 → 1 is **not label** (institutional). 0.5 mg/mL second bag is non-standard. aPTT 40–83 s table is institutional | Single 1 mg/mL concentration. Hepatic (Child-Pugh >6, i.e. B/C) start 0.5 mcg/kg/min at the same concentration (0.5 × 70 kg → 2.1 mL/h, within pump range). Label aPTT target 1.5–3× baseline, ≤100 s. Keep the site's rate-change table only as institution-defined. Drop the renal reduction or mark it institutional. Add the PCI regimen if a cath-lab profile is needed. |
| L3 | Bivalirudin | 5 mg/mL (250/50, 500/100); mg/kg/h; 0.75 mg/kg load, 1.75 PCI; renal CrCl 30–59 → 1.4, 10–29 → 0.7, dialysis 0.175 | not in S4S | Label [V]: 0.75 mg/kg bolus, 1.75 mg/kg/h for the procedure; ACT 5 min post-bolus, extra 0.3 mg/kg if needed; STEMI may continue 1.75 up to 4 h post-PCI; **no adjustment for CrCl ≥30; CrCl <30 → 1 mg/kg/h; hemodialysis → 0.25 mg/kg/h**; no bolus reduction; final conc 5 mg/mL; 0.5–5 mg/mL stable 24 h | site outdated (renal tiers) | Use the label renal tiers (≥30: 1.75; <30: 1.0; HD: 0.25). Remove the 1.4 / 0.7 / 0.175 rows and the "ACT >300 if CrCl<60" note. Keep 5 mg/mL. |
| L4 | Diltiazem | 1 mg/mL; mg/h; 5–15; bolus 0.25 mg/kg | 1 mg/mL; mg/hour | Label: 10 mg/h, some need 5; up to 15 mg/h; >24 h not studied [R] | agrees | Keep; soft max 15 mg/h. |
| L5 | Dobutamine | 2000 and 4000 mcg/mL; mcg/kg/min; 2–20; typical max 40 | 2000 / 4000 mcg/mL; mcg/kg/min | Label 2–20, rarely up to 40 [R] | agrees | Keep; soft max 20, hard max 40. |
| L6 | Dopamine | 3200 mcg/mL; mcg/kg/min; 1–20; max 20 (grid to 30) | 1600 / 3200 mcg/mL; mcg/kg/min | Label up to 20–50 mcg/kg/min [R] | agrees (conc); max minor | Keep 3200. Optionally add 1600. Soft max 20, hard max 50 (or institutional). |
| L7 | Epinephrine | **8 mcg/mL**; **mcg/min**; 1–10 | **20 / 40 mcg/mL; mcg/kg/min** | Label (septic shock) 0.05–2 mcg/kg/min, titrate in 0.05–0.2 steps [V2]; label dilution 1 mcg/mL in dextrose [V2] | site outdated | Adopt S4S 20 and 40 mcg/mL in mcg/kg/min, range 0.01–0.5 soft, hard max 2 mcg/kg/min. If the institution keeps mcg/min, build a separate entry with a distinct name. |
| L8 | Esmolol | 10 mg/mL (10,000 mcg/mL); mcg/kg/min; 50–200; load 0.5 mg/kg | 10 / 20 mg/mL; mcg/kg/min | Label: load 500 mcg/kg over 1 min; maintenance 50–200 (up to 300 for HTN in some labels) [R] | agrees | Keep 10 mg/mL; optionally add 20 mg/mL. Max 200 (300 with sign-off). |
| L9 | Fenoldopam | 40 mcg/mL; mcg/kg/min; 0.025–0.3; max 1.6 | not in S4S | Label: 0.01–1.6 mcg/kg/min, titrate 0.05–0.1 q15 min [R] | agrees | Keep. Check US availability before including (not verified). |
| L10 | Heparin (U/h) | 100 U/mL; units/h; 500–2000 | 100 U/mL; units/hour **or units/kg/hour** | Weight-based nomogram (80 U/kg bolus, 18 U/kg/h for VTE; ACS 60 U/kg max 4000, 12 U/kg/h max 1000 U/h) [R] | agrees (conc) | Keep 100 U/mL. Prefer **one** dosing unit per S4S note 6. Make units/h vs units/kg/h visually distinct. |
| L11 | Heparin (U/kg/h) | 100 U/mL; units/kg/h; start 15; grid 5–25 | as L10 | 18 U/kg/h (VTE) or 12 U/kg/h (ACS) are the common nomogram starts [R] | minor difference | "Start 15" is institutional. Replace with protocol-selectable starts. Soft max 25 U/kg/h; dose-cap rules per protocol. |
| L12 | Insulin regular | 1 U/mL; units/h; "5–100" | 1 unit/mL (16 units/mL for CCB/BB overdose); units/hour or units/kg/hour | ADA/EASD 2024 hyperglycaemic crises consensus: DKA fixed-rate 0.1 U/kg/h; HHS 0.05 U/kg/h; reduce to 0.05 U/kg/h once glucose <250 mg/dL [V2] | site wrong (range) | 1 U/mL. Range 0.5–20 U/h soft (institutional). Hard max per protocol. Add a units/kg/h DKA entry (0.05–0.14). Keep a separate HDIET 16 U/mL entry only if the institution uses it. |
| L13 | Eptifibatide | 0.75 mg/mL (75/100); mcg/kg/min; 2 (CrCl ≥50 or **SCr ≤2**) / 1 (CrCl <50 or **SCr >2**); load 180 mcg/kg from 2 mg/mL vial; wt cap 121 kg | not in S4S | Label [V]: ACS/PCI 180 mcg/kg bolus (PCI second bolus at 10 min), 2 mcg/kg/min; **CrCl <50 (Cockcroft-Gault) → 1**; bolus unchanged; **dialysis-dependent = contraindicated**. Dosing table ">121 kg": bolus 11.3 mL, 20 mL/h (2) / 10 mL/h (1), i.e. 22.6 mg, 15 mg/h, 7.5 mg/h. Vial 2 mg/mL; premix 0.75 mg/mL | minor difference | Keep the 121-kg cap. Applying cap values to the 121-kg row itself is a site convention; the label row is ">121". Remove the SCr >2 criterion (older label) and use CrCl (CG) only. Add the dialysis contraindication as a hard stop. |
| L14 | Isoproterenol | **8 mcg/mL**; mcg/min; 0.5–5; grid to 28 | **4 mcg/mL**; mcg/min or mcg/kg/min | Label: heart block 5 mcg/min (2–20) at 2 mg/500 mL = 4 mcg/mL; shock 0.5–5 mcg/min at 2 mcg/mL [V2] | site differs | Adopt 4 mcg/mL, mcg/min. Soft range 1–10; hard max 20 mcg/min (label heart-block upper bound). The 0.5–5 range is the shock indication only. |
| L15 | Labetalol | **2 mg/mL** (500/250 NS); mg/min; "2 mg/min" | **1 mg/mL or 5 mg/mL**; mg/min | Label infusion 2 mg/min (titrate), cumulative course usually up to 300 mg [R]. Many institutions use 0.5–2 mg/min or mg/h | site differs | Adopt 1 mg/mL (S4S; 5 mg/mL for fluid restriction). Soft 0.5–2 mg/min, hard 3 mg/min. Display a cumulative-dose counter (300 mg). Needs sign-off on the units (some EHRs use mg/h). |
| L16 | Lidocaine | 8 mg/mL; mg/min; usual 0.5–**5**; max 4 | 8 mg/mL; mg/min | Label premix: 1–4 mg/min after bolus. Reduce rate about 50% after 24 h. Lower rate in hepatic impairment. Constant ECG monitoring [V2] | site wrong (range exceeds max) | Range 1–4 mg/min with a hard max of 4. Add the >24 h and hepatic warnings. |
| L17 | Milrinone | 200 mcg/mL; mcg/kg/min; 0.375–0.75; load 50 mcg/kg | 200 mcg/mL; mcg/kg/min | Label: 50 mcg/kg over 10 min, 0.375–0.75. **Renal table** (CrCl mL/min/1.73 m² → rate): 50 → 0.43; 40 → 0.38; 30 → 0.33; 20 → 0.28; 10 → 0.23; 5 → 0.20. Total ≤1.13 mg/kg/day [V2] | site incomplete | Keep. Add the label renal table (interpolate or step down) and the 1.13 mg/kg/day cap. Many ICUs omit the bolus [R]; make the bolus optional. |
| L18 | Nesiritide (Natrecor) | 6 mcg/mL; mcg/kg/min; 0.01; max 0.03 | not in S4S | Label regimen matches site [R]. **No longer marketed in the US** per Davis Drug Guide and secondary sources (date about 2021, not confirmed by FDA source) [V2] | site outdated (availability) | Exclude, or hide behind a "not available" flag. Verify on the FDA discontinued list. |
| L19 | Nitroglycerin | 200 mcg/mL (50/250 premix); mcg/min; 1–20; max 200 | 100 / 200 / 400 mcg/mL; mcg/min | Label: start 5 mcg/min, titrate by 5 q3–5 min to 20, then by 10–20; no fixed labeled max [R] | agrees | Keep 200 (optionally 400 for fluid restriction). Soft max 200, hard max 400 mcg/min (institutional). |
| L20 | Nitroprusside | **400 mcg/mL**; mcg/kg/min; 0.5–3; max 10 | **200 / 500 mcg/mL**; mcg/kg/min | Nipride RTU label: start 0.3, titrate to effect, max 10 mcg/kg/min. eGFR <30: mean rate <3. Anuric: 1. Cyanide buffering exceeded in under 1 h at max rate; keep max-rate duration as short as possible. The older "≤10 min at max" wording comes from older labeling [V2] | site differs (conc); range OK | Adopt 200 mcg/mL (RTU premix, S4S) plus 500 for fluid restriction. Range 0.3–3 soft, 10 hard. Add renal limits and a cyanide/thiocyanate warning. |
| L21 | Norepinephrine | 32 mcg/mL; **mcg/min**; 2–16; **max 20** | 16 / 32 / 64 mcg/mL; **mcg/kg/min** | Premixes 16, 32 and 64 mcg/mL (Baxter) [V2]. No fixed labeled max; septic shock commonly >20 mcg/min [R] | site outdated (unit and max) | Adopt S4S mcg/kg/min, 16 and 32 (64 central/fluid restriction). Soft 0.01–1, hard max per institution (e.g. 3 mcg/kg/min). If mcg/min is kept, build a distinct entry and raise the max. |
| L22 | Phenylephrine | 40 mcg/mL; mcg/min; initial 100–180, maintenance 40–60 | **80 / 400 mcg/mL; mcg/kg/min** | Current 10 mg/mL labels: anaesthesia hypotension 0.5–1.4 mcg/kg/min; septic/vasodilatory shock 0.5–6 mcg/kg/min, no added benefit above 6 [V2] | site outdated | Adopt S4S 80 mcg/mL (400 central), mcg/kg/min. Soft 0.5–6, hard max 6 (or 10 with sign-off). |
| L23 | Procainamide | label "**4 g per 250 mL**" vs value/chart 4 g/500 mL = 8 mg/mL; mg/min 1–4; max 4; load 17 mg/kg (max 1–1.5 g) at 20–30 mg/min | not in S4S | Label: load 20 mg/min (500–600 mg over 25–30 min, max 1 g; IV push ≤50 mg/min); maintenance **2–6 mg/min** using 2 mg/mL or 4 mg/mL (1 g/250 mL) [V2]. ACLS: 20–50 mg/min to max 17 mg/kg; maintenance 1–4 mg/min [R] | site wrong (label bug); range minor | Fix the display to 4 g/500 mL (8 mg/mL), or adopt the label's 4 mg/mL. Soft 1–4, hard max 6 mg/min. Loading-dose max 17 mg/kg (ACLS) or 1 g (label) needs sign-off. |
| L24 | Propofol | 10 mg/mL; mcg/kg/min; 5–50; "CI: sulfite allergy" | 10 mg/mL; mcg/kg/min | Diprivan label: ICU sedation 5–50 mcg/kg/min [R]. Contraindicated with hypersensitivity to propofol/components and egg/soy allergy (wording varies by label). Sulfite warning applies only to **metabisulfite-containing generics** [V2] | site wrong / outdated (contraindication text) | Keep conc/unit/range. Hard max 80 mcg/kg/min (institutional) [R]. Replace the sulfite CI with product-specific text: egg/soy (per label) plus sulfite warning if the product contains metabisulfite. Add PRIS warning for >4 mg/kg/h prolonged use [R]. |
| L25 | Abciximab (ReoPro) | 12-h bag, 0.125 mcg/kg/min, max 10 mcg/min | not in S4S | Janssen worldwide indefinite stockout in 2018. Health Canada discontinuation 2018-06-14; Ireland withdrawn 11/2018. US described as discontinued about 2019 (secondary) [V2] | site outdated (discontinued) | Remove from the build. |
| L26 | Weight conversion | lb = kg × 2.2 | – | 1 kg = 2.20462 lb (exact) [R] | minor difference | Compute with 2.20462. Display rounding only. |
| L27 | Vasopressor dosing units | mcg/min (epi, norepi, phenylephrine) | S4S expert panel recommends **weight-based (per kg per min)** vasopressor dosing, with weight-based vs non-weight-based entries clearly distinct [V] | S4S PDF p.5 | site differs | Default to mcg/kg/min. Any non-weight-based variant needs a distinct name and colour. |

S4S items absent from the site that a modern ICU library usually needs: dexmedetomidine 4 mcg/mL (mcg/kg/h), nicardipine 0.1/0.2/0.5 mg/mL (mg/h), vasopressin 0.2/0.4/1 unit/mL (units/min), fentanyl, hydromorphone, midazolam, ketamine, cisatracurium/rocuronium/vecuronium, furosemide/bumetanide, alteplase. All [V] from the S4S PDF. Add these only if scope expands.

### 1c. Child-Pugh / hepatic score

| # | Item | Site value | Reference | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|---|
| H1 | Bilirubin points | <2 / 2–3 / >3 mg/dL | Pugh 1973: <34 / 34–50 / >50 µmol/L (≈ <2 / 2–3 / >3 mg/dL) [V2: Wikipedia, MSD Manual]. Pugh paper record verified; table not read | Pugh RNH, Br J Surg 1973;60:646 (PMID 4541913, doi:10.1002/bjs.1800600817) | agrees | Keep. Boundaries: 2.0–3.0 → 2 points. |
| H2 | PBC/PSC variant | <4 / 4–10 / >10 mg/dL | Modified scale for PBC: 1–4 / 4–10 / >10 mg/dL (68 and 170 µmol/L) [V2]. It is in the Pugh 1973 table [R]. Extension to PSC is a later convention [R] | MSD Manual; Wikipedia | agrees | Add an explicit "cholestatic (PBC/PSC)" toggle instead of free choice. Label PSC use as convention. |
| H3 | Albumin | >3.5 / 2.8–3.5 / <2.8 g/dL | >35 / 28–35 / <28 g/L [V2] | as H1 | agrees | Keep. 3.5 → 2 points; 2.8 → 2 points. |
| H4 | PT / INR | <4 s / 4–6 s / >6 s prolonged; INR <1.7 / 1.7–2.3 / >2.3 | PT seconds over control: 1–4 / 4–6 / >6 (Pugh) [V2]. INR cutoffs are a later convention, not in Pugh 1973 [V2/R]. Use PT or INR, not both | Wikipedia, MSD | minor difference | Offer INR (default, modern) or PT seconds. Label the INR cutoffs as convention. Warn on warfarin/DOAC/argatroban (argatroban raises INR). |
| H5 | Ascites | Absent / Slight / Moderate | Pugh 1973 used none / slight / moderate [R]. Modern tables use none / mild (diuretic-responsive) / moderate–severe (refractory) [V2] | – | agrees with original (spec §7 calls it non-standard) | Use the modern labels and map Moderate to moderate–severe. |
| H6 | Encephalopathy | none / grade I–II / III–IV | Same [V2] | – | agrees | Keep. Cite West Haven grading for the stage text. |
| H7 | Class bands | A 5–6, B 7–9, C 10–15 | Same [V2] | MSD Manual | agrees | Compute and display the class. |
| H8 | Argatroban use | Hepatic score >6 → 0.5 mg/mL bag, start 0.5 | Label: moderate/severe hepatic impairment "based on Child-Pugh classification" → start 0.5 mcg/kg/min. PK section: Child-Pugh score >6 [V] | argatroban label §2, §12.3 | agrees (threshold); concentration differs | Child-Pugh ≥7 (B/C) → start 0.5 at the standard 1 mg/mL concentration (L2). |
| H9 | Theophylline | spec: cirrhosis factor in theophylline module | Label: CL decreased ≥50% in hepatic insufficiency (cirrhosis, acute hepatitis, cholestasis). Requires dose reduction and level monitoring. **No Child-Pugh mapping** [V2] | theophylline ER label (drugs.com / medlibrary reproductions) | – | Do not auto-map Child-Pugh class to a theophylline factor. Use a "hepatic insufficiency" flag (≥50% CL reduction) with level monitoring. |
| H10 | Phenytoin | – | Label: in hepatic disease or hypoalbuminaemia, monitor **unbound** phenytoin (1–2 mcg/mL). No Child-Pugh dose rule [V2] | Dilantin label (Pfizer) | – | Child-Pugh is informational only for phenytoin. Route to free-level / Winter-Tozer logic. |
| H11 | FDA framework | – | FDA 2003 guidance *Pharmacokinetics in Patients with Impaired Hepatic Function* uses Child-Pugh A/B/C for study design and labeling. A Sept 2026 draft revision is reported (not read) [V2] | FDA guidance | – | Cite in the help text. Note the score is not validated for acute liver failure. |

---

## 2. Recommended drug library for our build (adult, S4S-aligned where possible)

"Soft" = alert with override; "hard" = no override. Ranges marked *inst.* are proposals needing P&T sign-off. Rate math is unchanged from `infusion-rate.md` §4.

| Drug | Concentration (standard) | Dose unit | Usual / soft range | Hard max | Notes |
|---|---|---|---|---|---|
| Amiodarone | 1.8 mg/mL (360 mg/200 mL premix or 450/250, 900/500) | mg/min | 0.5–1 | 1 mg/min (maintenance) *inst.* | Non-PVC container for >2 h. Central line if >2 mg/mL (not standard). |
| Argatroban | 1 mg/mL | mcg/kg/min | 0.5–10 | 10 | Start 2. Child-Pugh ≥7 (B/C): start 0.5. aPTT 1.5–3× baseline, ≤100 s. No renal adjustment. Score Child-Pugh INR before argatroban. |
| Bivalirudin | 5 mg/mL | mg/kg/h | 1.75 (CrCl ≥30); 1.0 (CrCl <30); 0.25 (HD) | 1.75 | Bolus 0.75 mg/kg (+0.3 if ACT low). Post-PCI STEMI up to 4 h. |
| Diltiazem | 1 mg/mL | mg/h | 5–15 | 15 | Bolus 0.25 mg/kg over 2 min. |
| Dobutamine | 2000 mcg/mL; 4000 mcg/mL | mcg/kg/min | 2–20 | 40 | |
| Dopamine | 1600 mcg/mL; 3200 mcg/mL | mcg/kg/min | 2–20 | 50 *inst.* (or 20) | |
| Epinephrine | 20 mcg/mL; 40 mcg/mL | mcg/kg/min | 0.01–0.5 | 2 | S4S/label units. Differs from the site (8 mcg/mL, mcg/min). |
| Esmolol | 10 mg/mL; 20 mg/mL | mcg/kg/min | 50–200 | 300 *inst.* | Load 500 mcg/kg over 1 min. |
| Fenoldopam | 40 mcg/mL | mcg/kg/min | 0.05–0.3 | 1.6 | Confirm availability. |
| Heparin | 100 units/mL | units/kg/h (preferred) *or* units/h (separate entry) | protocol (e.g. 12–18 units/kg/h) | 25 units/kg/h; 2000 units/h *inst.* | One unit per protocol. Bolus per nomogram. |
| Insulin regular | 1 unit/mL | units/h; units/kg/h (DKA) | 0.5–20 units/h; DKA 0.05–0.14 units/kg/h | 30 units/h *inst.* | ADA/EASD 2024: DKA 0.1 units/kg/h, HHS 0.05. |
| Eptifibatide | 0.75 mg/mL (bolus from 2 mg/mL vial) | mcg/kg/min | 2 (CrCl ≥50); 1 (CrCl <50, CG) | 2; weight cap 121 kg (15 / 7.5 mg/h) | Dialysis = contraindicated (hard stop). Bolus 180 mcg/kg (max 22.6 mg); second bolus for PCI. |
| Isoproterenol | 4 mcg/mL | mcg/min | 1–10 | 20 | Shock indication 0.5–5. |
| Labetalol | 1 mg/mL (5 mg/mL fluid-restricted) | mg/min | 0.5–2 | 3 *inst.* | Cumulative 300 mg display. Units need sign-off (mg/min vs mg/h). |
| Lidocaine | 8 mg/mL | mg/min | 1–4 | 4 | Halve rate after 24 h. Hepatic impairment: lower rate. |
| Milrinone | 200 mcg/mL | mcg/kg/min | 0.375–0.75 (renal table) | 0.75 | Optional 50 mcg/kg bolus. ≤1.13 mg/kg/day. |
| Nitroglycerin | 200 mcg/mL (400 for fluid restriction) | mcg/min | 5–200 | 400 *inst.* | Start 5 mcg/min. |
| Nitroprusside | 200 mcg/mL (500 for fluid restriction) | mcg/kg/min | 0.3–3 | 10 | eGFR <30: mean <3. Anuric: 1. Cyanide warning. |
| Norepinephrine | 16 mcg/mL; 32 mcg/mL (64 central) | mcg/kg/min | 0.01–1 | 3 *inst.* | S4S weight-based. Distinct from any legacy mcg/min entry. |
| Phenylephrine | 80 mcg/mL (400 central) | mcg/kg/min | 0.5–6 | 6 (10 *inst.*) | Current label ranges. |
| Procainamide | 8 mg/mL (4 g/500 mL) **or** label 4 mg/mL (1 g/250 mL) | mg/min | 1–4 | 6 | Load 20 mg/min to max 17 mg/kg (ACLS) or 1 g (label): sign-off. |
| Propofol | 10 mg/mL | mcg/kg/min | 5–50 | 80 *inst.* | Egg/soy per label. Sulfite warning only for metabisulfite generics. PRIS. |
| **Removed** | Abciximab (discontinued), nesiritide (not marketed in US) | | | | Keep historical charts out of the build. |

---

## 3. Items needing clinician sign-off

1. **Acyclovir obesity dosing weight.** The label says IBW. The site and spec default to AdjBW for everyone above IBW. Turner PK data favour AdjBW for exposure; Saad 2025 shows the lowest AKI with IBW; Zelnicek 2023 shows the opposite trend. Choose the default: IBW (label) vs AdjBW (PK).
2. **HSV encephalitis duration**: 14–21 d (IDSA) vs 10 d (label). VZV encephalitis mg/kg (10 vs 10–15).
3. **Acyclovir HD regimen** wording (50% q24h dosed after HD vs an additional post-HD dose) and **CRRT** dosing (not in label).
4. **Vasopressor units**: switch epinephrine, norepinephrine and phenylephrine to S4S mcg/kg/min, or keep legacy mcg/min. This is a nursing workflow and EHR change, and it affects hard maxes.
5. **Concentration changes vs site**: isoproterenol 8 → 4 mcg/mL; labetalol 2 → 1 (or 5) mg/mL; nitroprusside 400 → 200/500 mcg/mL; epinephrine 8 → 20/40 mcg/mL; phenylephrine 40 → 80 mcg/mL; procainamide 8 vs 4 mg/mL.
6. **Argatroban**: drop the 0.5 mg/mL hepatic bag (use dose reduction only); drop "CrCl <60 → 1" (not in label); aPTT protocol (label 1.5–3× baseline vs site fixed 40–83 s table).
7. **Bivalirudin renal tiers**: replace with label tiers (1.75 / 1.0 / 0.25).
8. **Eptifibatide**: remove the SCr >2 criterion; behaviour at exactly 121 kg (site uses cap values; label row is ">121").
9. **All hard maxima marked *inst.*** (dopamine, esmolol, heparin, insulin, labetalol, nitroglycerin, norepinephrine, phenylephrine, propofol).
10. **Insulin protocol** (DKA units/kg/h vs units/h; HDIET 16 units/mL entry yes/no).
11. **Child-Pugh INR vs PT-seconds** default, and whether a cholestatic toggle covers PSC.
12. **Abciximab/nesiritide removal**, and fenoldopam availability check.

---

## 4. References

Labels and standards:
1. Acyclovir sodium injection (Eugia US) — DailyMed setid ae921e4e-b8ae-4a45-acc1-32e5e719812b. https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ae921e4e-b8ae-4a45-acc1-32e5e719812b [V]
2. Argatroban injection (Fresenius Kabi), rev 3/2025 — https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dfa5d325-f609-4c9a-aaae-1a17df47da1e [V]
3. Bivalirudin for injection (Fresenius Kabi), rev 4/2025 — https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=50975be1-6d1f-497c-b989-1825a0fae1a7 [V]
4. Eptifibatide injection (Baxter), rev 5/2024 — https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5f46b76b-5c83-49b9-ada8-4ad5cf81a38c [V]
5. ASHP Standardize 4 Safety, *Adult Continuous Infusion Standards*, updated September 2026 — https://www.ashp.org/-/media/assets/pharmacy-practice/s4s/docs/Adult-Infusion-Standards.pdf [V]
6. Milrinone lactate injection label, renal table (reproduction) — https://medlibrary.org/lib/rx/meds/milrinone-lactate-4/page/3/ ; Pfizer: https://pfizermedicalinformation.com/milrinone-lactate/dosage-admin [V2]
7. Nipride RTU (sodium nitroprusside) label — https://www.drugs.com/pro/nipride-rtu.html ; https://medlibrary.org/lib/rx/meds/nipride-rtu/ [V2]
8. Isoproterenol labels — https://www.drugs.com/dosage/isuprel.html ; https://labeling.pfizer.com/ShowLabeling.aspx?id=14091 [V2]
9. Procainamide HCl injection (Pfizer) — https://pfizermedicalinformation.com/procainamide/dosage-admin [V2]
10. Lidocaine HCl and 5% dextrose (Baxter/B. Braun) — https://drugcentral.org/label/f21512ea-c7c3-4766-b976-b2c0b5616bf0/view [V2]
11. Phenylephrine HCl injection 10 mg/mL labels — https://medlibrary.org/lib/rx/meds/phenylephrine-hydrochloride-24/ ; https://ndclist.com/ndc/70756-623/label [V2]
12. Epinephrine injection label (septic shock) — https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/211363s000lbl.pdf [V2, via search summary]
13. Norepinephrine in dextrose premix (Baxter) — https://pro.baxter.com/products/pharmaceuticals/premixed-medications/norepinephrine [V2]
14. Propofol: APSF on sulfite-containing propofol — https://www.apsf.org/article/sulfite-allergic-anesthesia-chair-questions-new-propofol-brand/ [V2]. Diprivan label wording [R] (verify on DailyMed).
15. Theophylline ER label (hepatic insufficiency) — https://www.drugs.com/pro/theophylline.html [V2]
16. Dilantin (phenytoin sodium injection) label — https://labeling.pfizer.com/ShowLabeling.aspx?id=769 ; FDA 2011: https://www.accessdata.fda.gov/drugsatfda_docs/label/2011/010151s036lbl.pdf [V2]
17. FDA Guidance, *Pharmacokinetics in Patients with Impaired Hepatic Function* (2003) — https://www.fda.gov/downloads/Drugs/GuidanceComplianceRegulatoryInformation/Guidances/ucm072123.pdf [V2]
18. Abciximab supply/discontinuation: TCTMD "Abciximab in short supply worldwide" — https://www.tctmd.com/news/abciximab-short-supply-worldwide ; HPRA withdrawn — https://www.hpra.ie/find-a-medicine/for-human-use/withdrawn-medicines/details/17821 ; Health Canada — https://dev02.healthproductshortages.ca/shortage/52434 [V2]
19. Nesiritide off-market: Davis's Drug Guide — https://www.unboundmedicine.com/harrietlane/view/Davis-Drug-Guide/51536/all/nesiritide [V2]
20. ADA/EASD/JBDS/AACE/DTS consensus, Hyperglycemic crises in adults with diabetes, Diabetes Care 2024;47(8):1257-1275 (Dhatariya, Umpierrez et al.) — summary: https://consultqd.clevelandclinic.org/hyperglycemic-crises-in-adults-the-2024-consensus-report [V2; PMID not looked up]

Peer-reviewed literature (PubMed records verified):
21. Tunkel AR et al. The management of encephalitis: IDSA guidelines. Clin Infect Dis 2008;47:303-27. PMID 18582201. https://doi.org/10.1086/589747 [record V; dosing V2]
22. Blum MR, Liao SH, de Miranda P. Overview of acyclovir pharmacokinetic disposition in adults and children. Am J Med 1982;73(1A):186-92. PMID 7048911. https://doi.org/10.1016/0002-9343(82)90088-2
23. Whitley RJ, Blum MR, et al. Pharmacokinetics of acyclovir in humans following IV administration. Am J Med 1982;73(1A):165-71. PMID 7102700. https://doi.org/10.1016/0002-9343(82)90084-5
24. Spector SA et al. Treatment of herpes virus infections in immunocompromised patients with acyclovir by continuous IV infusion. Am J Med 1982;73(1A):275-80. PMID 6285719. https://doi.org/10.1016/0002-9343(82)90105-x
25. Hintz M, Connor JD, Spector SA, et al. Neonatal acyclovir pharmacokinetics. Am J Med 1982;73(1A):210-4. PMID 6285713. https://doi.org/10.1016/0002-9343(82)90093-6
26. Spector SA et al. Single-dose pharmacokinetics of acyclovir. AAC 1981;19:608-12. PMID 7247383. https://doi.org/10.1128/AAC.19.4.608
27. Fletcher CV et al. Continuous infusion of high-dose acyclovir for serious herpesvirus infections. AAC 1989;33:1375-8. PMID 2552909. https://doi.org/10.1128/AAC.33.8.1375
28. Turner RB et al. Prospective, controlled study of acyclovir pharmacokinetics in obese patients. AAC 2016;60:1830-3. PMID 26824940. https://doi.org/10.1128/AAC.02010-15
29. Barber KE et al. Impact of obesity on acyclovir-induced nephrotoxicity. OFID 2019;6:ofz121. PMID 31024972. https://doi.org/10.1093/ofid/ofz121
30. Zelnicek TD et al. Comparison of dosing strategies in obese patients prescribed IV acyclovir… Int J Antimicrob Agents 2023;62:106871. PMID 37257520. https://doi.org/10.1016/j.ijantimicag.2023.106871
31. Saad MO et al. Safety of different weight-based dosing strategies of IV acyclovir in obese patients. Ann Pharmacother 2025;59:801-8. PMID 39956984. https://doi.org/10.1177/10600280251318017
32. Aboelezz A et al. Acyclovir dosing strategies in herpes encephalitis. J Clin Neurosci 2025;136:111230. PMID 40188662. https://doi.org/10.1016/j.jocn.2025.111230
33. Takahashi Y et al. VZV encephalitis in a sarcopenic obese patient after acyclovir-induced AKI. Intern Med 2026;65:2242-5. PMID 41535035. https://doi.org/10.2169/internalmedicine.6635-25
34. Pugh RNH et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg 1973;60:646-9. PMID 4541913. https://doi.org/10.1002/bjs.1800600817 [record V; scoring table V2 via MSD Manual https://www.msdmanuals.com/iframe/manual/medical-calculators/childturpuscore.htm and Wikipedia]

Recalled, not verified this session [R]: amiodarone container/filter wording; diltiazem, dobutamine, dopamine, esmolol, fenoldopam, nitroglycerin and labetalol label ranges; heparin nomograms (Raschke 1993; ACC/AHA ACS); propofol hard max and PRIS threshold; ACLS procainamide 17 mg/kg; Pugh 1973 original ascites wording; IDSA VZV 10–15 mg/kg.

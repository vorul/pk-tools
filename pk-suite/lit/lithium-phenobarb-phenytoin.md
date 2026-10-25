# Literature cross-check: lithium, phenobarbital, phenytoin

Scope: we compared the site values captured in `specs/lithium.md`, `specs/phenobarbital.md`, `specs/phenytoin.md` and the reference list in `specs/core-equations.md` §5 against primary literature, guidelines and Winter's *Basic Clinical Pharmacokinetics* 6th ed. (the local PDF; chapters 12 Lithium, 13 Phenobarbital and 14 Phenytoin were read). Prepared 2026-10-23.

**How sources were checked**
- **[V-PM]**: confirmed in PubMed metadata or abstract (PMID and DOI resolved this session).
- **[V-W6]**: read in the Winter 6e local PDF. Its text extraction drops the digit "1"; values were reconstructed from context and worked examples.
- **[V-2nd]**: confirmed only in a secondary source that reproduces the primary (lecture notes, ClinCalc, hospital pages). The primary text was not read.
- **[RECALLED]**: from memory and not verified this session. Do not ship these without checking.

Verdict scale: agrees / minor difference / site outdated / site wrong / unverifiable.

---

## 1. Cross-check table

### 1a. Lithium

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| Li CL as a fraction of CrCl | CL = 0.25·CrCl (0.015·CrCl L/h) | "approximately 25% of creatinine clearance" in patients with normal sodium balance. About 100% is filtered and 70–80% reabsorbed. | Winter 6e ch. 12, Eq 12.2 [V-W6] | agrees | Keep 0.25. Label it a population estimate; individual variability is large. |
| Weight in Cockcroft-Gault for Li | min(FFM, TBW) (Janmahasatian FFM) | Winter's worked example uses TBW (74 kg man → CrCl 111 mL/min). No FFM rule is given. | Winter 6e Q1 [V-W6] | minor difference (site-specific choice) | Keep min(FFM, TBW) as the site's method. Add a "Winter (TBW)" option for parity with the textbook. Example: patient A gives CrCl 107.8 with FFM vs 152.8 with TBW, a 42% CL difference. |
| Vd | 0.7 L/kg dosing weight. Prose also gives initial 0.25–0.3; 0.85 adult; 0.93 child; 0.53 elderly. | 0.7 L/kg final volume; initial 0.25–0.3 L/kg | Winter 6e Key Parameters [V-W6] | agrees (0.7). Prose values 0.85/0.93/0.53 unverifiable | Keep 0.7. Do not use the 0.85/0.53 prose values without a source (possibly Jermain & Crismon 1991, not checked). |
| t½ | 18–30 h (prose) | Elimination t½ 18–24 h; ≥48 h in significant renal impairment; about 2× longer on long-term therapy (Goodnick) | Winter 6e [V-W6] | minor difference | Display t½ = 0.693·V/CL. No hard-coded value is needed. |
| mEq per mg, carbonate | 300 mg = 8.12 mEq | Li2CO3 MW 73.89, 2 Li per molecule: 300/73.89×2 = 8.120. Winter Table 12.1: 300 mg = 8.12 mEq; 450 mg CR = 12.18 mEq. | Winter 6e Table 12.1 [V-W6]; arithmetic | agrees | Keep 0.027067 mEq/mg. |
| Citrate | "~300 mg = 8 mEq" | US oral solution: 8 mEq Li+ per 5 mL, "equivalent to the amount of lithium in 300 mg of lithium carbonate". Winter: citrate ~300 mg = 8 mEq/5 mL. | FDA/DailyMed label text via mirrors [V-2nd]; Winter 6e Table 12.1 [V-W6] | agrees | Take citrate input as **mL or mEq** (1.6 mEq/mL), never "mg citrate". Do not convert mg of lithium citrate salt (the salt MW is not on the label). |
| Target range (maintenance) | Calculator: chronic 0.6–0.8; acute 0.8–1.2. Prose: prophylaxis 0.6–1.0, acute 0.5–1.2, depression 0.4–0.8. **Default dose target is Cavg 0.8.** | ISBD/IGSLi consensus: standard **0.60–0.80 mmol/L** (12-h). Lower to 0.40–0.60 for good response with poor tolerance; raise to 0.80–1.00 for insufficient response with good tolerance. Elderly usually 0.40–0.60, max 0.70–0.80 at 65–79 y and max 0.70 at ≥80 y. NICE CG185: 0.6–0.8 at 12 h post-dose. CANMAT/ISBD 2018: lithium is first-line maintenance. | Nolen 2019 Bipolar Disord, PMID 31112628 [V-PM]; NICE CG185 via NHS lab pages [V-2nd]; Yatham 2018, PMID 29536616 [V-PM] | site partly outdated (no elderly bands). Default "Cavg 0.8" is not the same quantity as a 12-h level. | Make the default target a **12-h post-dose level of 0.6–0.8 (aim 0.7)**, solved on the 12-h value, not Cavg. Add elderly presets (0.4–0.6; cap 0.8 at 65–79 y and 0.7 at ≥80 y) and a 0.8–1.0 option. Acute mania 0.8–1.2 as a separate preset. **Note: the task brief cites an "IGSLi 2023" consensus. The consensus we could locate is Nolen et al. 2019.** No 2023 IGSLi level paper was found in PubMed. |
| Sampling time | 12 h after evening dose | Trough before morning dose, ideally 12 h after the last dose. Steady state in about 4–5 days with normal renal function. | Winter 6e [V-W6]; NICE CG185 [V-2nd] | agrees | Keep. |
| Thiazide factor | 0.5 (CL decreased 50%) | Winter Table 12.2: "moderate" (case reports 25–50% level rise); "avoid or lower lithium dose by 50% and monitor". Population study: thiazides not independently associated with toxicity admission. | Winter 6e [V-W6]; Juurlink 2004, PMID 15086664 [V-PM]; Finley 2016, PMID 26936045 (abstract only) | minor difference (factor 0.5 is conservative; typical is 0.65–0.8) | Keep 0.5 as the "conservative" default. Show the range "levels ↑25–50%" and mandate a level within 5–7 days. |
| ACEi / ARB | ACEi 0.5; ARB not on site | Winter: ACEi "moderate to severe", ARBs listed in the same row, "avoid coadministration". Severe means case increases of 50–350%. ACEi start → RR 7.6 (95% CI 2.6–22) for toxicity admission within 1 month; loop diuretic RR 5.5. | Winter 6e Table 12.2 [V-W6]; Juurlink 2004 [V-PM] | site incomplete (ARB missing, loop diuretic not quantified) | Add an ARB checkbox (same 0.5 factor, flagged) and a **loop diuretic** warning (no factor; RR 5.5). |
| NSAIDs | indomethacin ≥150 mg/d 0.7 | Winter: NSAIDs/COX-2 "low, moderate or severe" (one-time dose low; routine dosing severe). Reimann 1983: indomethacin, not aspirin, raises Li. | Winter 6e [V-W6]; Reimann 1983 (Winter ref) [RECALLED magnitude] | minor difference | Generalize to "regular NSAID/COX-2" with factor 0.7–0.8 and an aspirin exemption note. Clinician sign-off needed. |
| Theophylline / caffeine | theophylline 1.21; caffeine 1.2 / "+26% for 4 h" | IV theophylline raised Li CL by 51 ± 52% in normal subjects. Steady-state theophylline raised renal Li CL (group mean; large individual variability). | Holstad 1988 Psychiatry Res, PMID 2845461 [V-PM]; Cook 1985, PMID 4008452 [V-PM] | minor difference / unverifiable for the 1.21 point estimate | Keep as text and warning only; no numeric factor. |
| **Acute mania CL factor** | **0.6 (CL 60% of usual)** | Winter: "up to a **50% increase** in lithium clearance during acute manic episodes" (Kukopulos 1985), so levels may rise once euthymic. | Winter 6e ch. 12 [V-W6] | **site wrong (direction reversed)** | Do **not** apply 0.6. If used at all, apply a CL × up to 1.5 note and a "recheck 2–4 weeks after stabilization" warning. |
| Pregnancy | CL +50–100% | Levels fall about 24% in T1 and 36% at the T2 nadir, then about 21% in T3, and rise 9% postpartum. Monitor levels until 34 wk, then weekly, then twice weekly for 2 wk postpartum. | Wesseloo 2017 Br J Psychiatry 211:31, PMID 28673946 [V-PM]; Winter "up to 50% higher" [V-W6] | agrees (magnitude) | Keep as monitoring text. |
| Cooper 1973 nomogram | not on the site (spec §4d lists a "standard" table) | Paper exists (24-h level after 600 mg carbonate test dose → daily dose). One cell corroborated: 0.08 mmol/L → 2700 mg/day (AJP letter, 1999), and that letter warns the nomogram **over-predicted** dose (1200–2000 mg/d sufficed). The full table could not be retrieved (paywalled). | Cooper, Bergner, Simpson. Am J Psychiatry 1973;130:601–603, PMID 4699934, doi:10.1176/ajp.130.5.601 [V-PM existence]; letter AJP 1999;156:157a [V-2nd] | **unverifiable (table)** | Do **not** ship the table until checked against the 1973 PDF. If shipped, cap at 1800–2400 mg/d with a warning. |
| Perry methods | not on site | (1) Perry 1982: protocol from **12- and 36-h** levels after a test dose (two-point). (2) Perry 1983: single 24-h level after a **1200 mg** test dose, separate regressions for 0.41–0.89 and 0.9–1.27 mEq/L. (3) Perry 1984: prospective, 83–85% in range. (4) Perry 1986: single-point is acceptable but two-point is more accurate. | PMIDs 7076875, 6833518, 6490961, 3089352 [V-PM abstracts] | unverifiable (equation coefficients not in the abstracts) | Implement Winter-style single-point K from a test dose (already in the spec) rather than Perry regressions. |
| Site ref "Lobeck F. Pharmacotherpy **2018**;8(4):248-55" | as cited | Lobeck F. A review of lithium dosing methods. *Pharmacotherapy* **1988**;8(4):248–255. | PMID 3057477, doi:10.1002/j.1875-9114.1988.tb04080.x [V-PM] | site wrong (year typo) | Cite 1988. |
| Site ref Wesseloo "Br H Psychiatry 2017;211(1):31-36" | as cited | *Br J Psychiatry* 2017;211(1):31–36 | PMID 28673946 [V-PM] | minor typo | Fix the journal abbreviation. |
| Site ref Molenaar "Bipolar Disorders 2021;23:49-54" | as cited | Bipolar Disord 2021;23(1):49–54 (epub 2020) | PMID 32526071 [V-PM] | agrees | It concludes routine discontinuation before delivery is not supported; the site prose says "reduce the dose or stop before delivery". Align the prose. |
| QD vs divided: 12-h level ~40% higher | prose | not verified | none | unverifiable | Keep as a caution only. |

### 1b. Phenobarbital

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| Vd neonate | 0.96 L/kg | 0.9 L/kg (range 0.7–1.0) | Winter 6e Key Parameters; Touw 2000, PMID 11102738 (Vd scales with TBW) [V-W6/V-PM] | minor difference | Use 0.9 (accept 0.96 as within range). |
| Vd children/adults | 0.63 / 0.61 L/kg | 0.7 L/kg (0.6–0.7) | Winter 6e [V-W6] | minor difference | Use 0.7. The site's values sit at the low end. |
| CL adults | 0.0056 L/h/kg (primary list); 0.004167 (table back-calculation) | 0.004 L/kg/h (0.1 L/kg/day): "every 1 mg/kg/day → ~10 mg/L" | Winter 6e Eq 13.1 [V-W6] | **site primary list outdated/high (+40%)**; table-derived 0.0042 agrees | Default adult CL to **0.004**. The site's 0.0056 under-predicts levels by about 30%. |
| CL children | 0.0082 (1–19 y) | 0.008 L/kg/h (≈2× adult; 4–5 mg/kg/day for 20 mg/L) | Winter 6e [V-W6] | agrees | Keep. The site's 1–19 y band is too wide: CL falls toward adult values in adolescence (site table 15–19 y: 0.0052). Use the table's age bands. |
| CL neonates | 0.0047 (<1 y) | 0.004 L/kg/h (neonates ≈ adults); CL rises over the first weeks of life | Winter 6e [V-W6]; Touw 2000 [V-PM] | minor difference | Neonate <2 wk 0.004; infant 2 wk–1 y about 0.010 (site table 0.0104). |
| CL elderly | 0.0024 | 0.003 L/kg/h (0.07 L/kg/day; ~1.5 mg/kg/day for 20 mg/L) | Winter 6e [V-W6] | minor difference (site lower) | Use 0.003. |
| t½ | not given | Adults ~5 days; children ~2.5 days | Winter 6e [V-W6] | n/a | Derive from CL/V. |
| Salt factor Na phenobarbital | 0.91 | 232.24/254.22 = 0.9135. Winter: Na salt ≈91% acid, "S 0.91", "correction seldom made". | arithmetic; Winter 6e [V-W6] | agrees | Keep 0.91. |
| F | IV/IM/PO 1; rectal 0.9 | Oral ≥0.9 (assume 1); IM 100%; rectal (injectable solution) 90% | Winter 6e [V-W6] | agrees | Keep. |
| Loading dose | table 15–25 mg/kg neonate/infant; 10–20 mg/kg others; no LD equation | Winter: 15–20 mg/kg (often 3 × 5 mg/kg q2–3h, or all at once); LD = V·C/(S·F). AES 2016 SE algorithm: IV phenobarbital **15 mg/kg single dose** as a first-phase option (Level A efficacy in adults). ILAE 2023: phenobarbital first-line for neonatal seizures. | Winter 6e [V-W6]; Glauser 2016 Epilepsy Curr, PMID 26900382 [V-PM abstract; 15 mg/kg V-2nd]; Pressler 2023 Epilepsia, PMID 37655702 [V-PM] | agrees | LD = V·(Ctarget−Ccurrent)/(S·F). SE preset 15–20 mg/kg; neonatal preset 20 mg/kg (+10–20 mg/kg if needed [RECALLED]). Infusion ≤50 mg/min adult (Winter: propylene glycol). |
| ESETT context | n/a | ESETT compared levetiracetam, fosphenytoin and valproate (no phenobarbital arm) | Kapur 2019 NEJM, PMID 31774955 [V-PM] | n/a | Use only for the phenytoin/fosphenytoin SE preset. |
| Target range | 10–40 mg/L (page) | Winter: 10–30 usually needed; "overall therapeutic range now 15–40 mg/L"; >100 potentially lethal. ILAE TDM paper lists 10–40 [RECALLED]. | Winter 6e [V-W6]; Patsalos 2008 Epilepsia, PMID 18397299 [V-PM existence; range RECALLED] | minor difference | Default 15–40 with a "10–40 (ILAE)" note. Keep the indication-specific presets. |
| Valproate interaction | "0.5–0.7, 2000 mg daily and 1000 mg daily" | VPA ↓ phenobarbital CL **25% at 1000 mg/day** (×0.75) and **50% at 2000 mg/day** (×0.5). Mechanism: metabolic inhibition. | Winter 6e Q7 [V-W6]; Kapetanović 1981 CPT, PMID 6781810 [V-PM] | minor difference (0.7 vs 0.75) and the mapping is now resolved | 1000 mg/d → 0.75; 2000 mg/d → 0.5; interpolate linearly between. |
| Obesity | TBW | Single case report (190 kg; LD 19.5 mg/kg TBW) | Wilkes 1992 Clin Pharmacokinet 22:481, PMID 1587059 [V-PM] | agrees (citation exists and says what the site claims) | Keep TBW with a BMI ≥30 warning. |
| Site Cp / time-to-SS formula typos | `1*Exp`, missing minus | n/a | n/a | site wrong (already in spec §10) | Use the corrected forms. |

### 1c. Phenytoin

| Item | Site value | Literature value | Citation | Verdict | Recommendation |
|---|---|---|---|---|---|
| Pediatric Vmax/Km ("Murphy 2005") | 0.5–<1 and 1–<4: 14 / 6.6; 4–<7: 10.9 / 6.8; 7–<10: 10.1 / 6.5; 10–<18: 8.3 / 5.7 | Bauer & Blouin 1983 (n = 135): 0.5–3 y **13.95 / 6.59**; 4–6 y **10.93 / 6.82**; 7–9 y **10.05 / 6.51**; 10–16 y **8.25 / 5.69** (Vmax mg/kg/day, Km mg/L). Km did not differ by age group. | Bauer LA, Blouin RA. Clin Pharmacokinet 1983;8:545–549, PMID 6653035 [V-PM] | **agrees** (rounded; Murphy's text reproduces the primary) | Keep, and cite Bauer & Blouin 1983 as the primary. Band edges: the paper's 0.5–3 y group maps to the site's 0.5–<4 (two rows); 10–16 y is extended to <18. SDs (4.2/3/2.6/2.8) are unverifiable from the abstract. |
| Adult 18–59 | Vmax 7, Km 4.3 (SD 3.5) | Winter: Vmax 7 mg/kg/day, Km 4 mg/L. Bauer & Blouin 1982 (n = 92): Vmax 7.5 (20–39 y), 6.6 (40–59 y); Km 5.4–5.8, not age-related. | Winter 6e [V-W6]; Bauer LA, Blouin RA. Clin Pharmacol Ther 1982;31:301, PMID 7060313 [V-PM] | minor difference (Km 4.3 source unverifiable) | Keep 7 / 4.3 (site) with a "Winter 7/4" option. |
| Elderly >59 | Vmax 7, Km 5.8 | Bauer & Blouin 1982, 60–79 y: **Vmax 6.0 ± 1.9**, Km about 5.8. They estimate a 21% lower daily dose need. | PMID 7060313 [V-PM] | **minor difference: site Vmax 7 is about 17% high** | Use Vmax **6.0** for ≥60 y (Km 5.8). This is a clinician sign-off item. |
| Infant Vd | 1 L/kg <1 y; 0.65 otherwise | Winter 0.65 L/kg (adult) | Winter 6e [V-W6] | unverifiable for 1 L/kg | Keep as the site's value. |
| Albumin correction (Winter) | Cnb = C / (0.9·Alb/4.4 + 0.1) | Winter Eq 14.2. Numerically 0.2045·Alb + 0.1, about the same as Sheiner-Tozer 0.2·Alb + 0.1. | Winter 6e [V-W6]; Kiang & Ensom 2016, PMID 26825643 [V-PM] | agrees (with Winter) but **outdated** relative to later validation | Keep as the "Winter-Tozer (legacy)" option. |
| Updated coefficients | not on site | Anderson 1997 revised WT (room-temperature free assay): **0.25** (elderly and head trauma). Kane 2013 (neuro-ICU): **0.29**; traditional WT under-predicts free levels there. Cheng 2016: **0.275** (n = 133, single centre). Kiang 2016 review: ST is biased and imprecise; derivatives improve bias, not precision. Montgomery 2019: Anderson most accurate (P20 82–92%) with normal renal function. Barra 2020: no equation is accurate in ICU. | Anderson 1997, PMID 9066931 (0.25 V-2nd ClinCalc); Kane 2013, PMID 23606554 (0.29 V-2nd); Cheng 2016, PMID 27621486 (0.275 V-PM); Montgomery 2019, PMID 31067355; Barra 2020, PMID 32049893 [V-PM] | **site outdated** | Default to **0.25 (Anderson)** for the non-ESRD correction, `Cnb = C/(0.25·Alb + 0.1)`. Offer 0.29 (ICU) and 0.2/Winter (legacy). Always recommend a measured free level in ICU, hypoalbuminemia with renal dysfunction, or interacting drugs. |
| ESRD | 0.9·0.48·Alb/4.4 + 0.1 (= 0.098·Alb + 0.1) | Winter Eq 14.3: the 0.48 factor was derived in ESRD on HD (Liponi, Winter, Tozer 1984). The classic form is 0.1·Alb + 0.1, so **0.48 and 0.1 are the same equation**. Soriano 2017 (n = 21 HD): the ESRD WT form had 75% error; a revised equation was more accurate (ClinCalc lists coefficient **0.2**). | Liponi 1984 Neurology 34:395, PMID 6538287 [V-PM]; Soriano 2017 Ann Pharmacother 51:669, PMID 28470115 [V-PM; 0.2 V-2nd] | site outdated | Default ESRD to **0.2·Alb + 0.1** (Soriano), keeping 0.1 (Winter/Liponi) as legacy. Montgomery 2019: with severe renal dysfunction plus hypoalbuminemia **no coefficient reached P20 >45%**, so require a free level. |
| Graves-Cloyd | not on site, workbooks or Winter | Dnew = (Dold/Css,old) · Css,new^**0.199** · Css,old^**0.804**, with doses in mg/day of phenytoin acid (S applied). Worked example: 368 mg/d acid, 6.2 → 10 mg/L gives **407 mg/d** acid (442 mg Na salt). We recomputed 406.95. The "population-clearance method of Graves et al." exists in the comparison literature. | Equation [V-2nd: lecture reproducing Bauer *Applied Clinical Pharmacokinetics*]; Toscano & Jameson 1986 Clin Pharm 5:396, PMID 3720209 [V-PM]; **primary Graves/Cloyd paper NOT located in PubMed** | unverifiable (primary) / secondary-verified | Implement only as an optional "empiric one-level" method labelled "Graves-Cloyd (per Bauer); primary not verified". Test case: 368, 6.2, 10 → 407 ± 1. |
| Ludden two-level | Km = (R1−R2)/(R2/Css2 − R1/Css1) | Ludden 1977: Km/Vmax from two steady-state levels on different doses. Prospectively, observed vs predicted r = 0.824. | Ludden TM et al. Clin Pharmacol Ther 1977;21:287, PMID 837647 [V-PM] | agrees | Keep, and reject invalid pairs (no ABS()). |
| Single-level method comparisons | n/a | Bayesian or individualized methods beat algorithms. In simulation, Graves and Bayesian methods had the lowest error. | Pryka 1991 Clin Pharmacokinet 20:209, PMID 1902764; Toscano 1986 [V-PM] | n/a | Make the Bayesian/MAP one-level the primary method. |
| Salt factor | 0.92 (caps, injection, fosphenytoin PE); 1 (suspension, chewable) | Winter: S = 0.92 for capsules and injectables (phenytoin and fosphenytoin); 1 for suspension and chewable | Winter 6e Key Parameters [V-W6] | agrees | Keep. |
| Fosphenytoin PE | doses in mg PE, S = 0.92 | 1 mg PE = 1 mg phenytoin sodium (1.5 mg fosphenytoin sodium) [RECALLED, label]. SE: fosphenytoin 20 mg PE/kg (max 1500 mg PE); phenytoin 20 mg/kg (max 1500 mg); fosphenytoin preferred over phenytoin (Level A). | Glauser 2016 [V-PM abstract; doses V-2nd]; Kapur 2019 ESETT [V-PM] | agrees | SE preset 20 mg/kg (PE), max 1500; rates 150 mg PE/min and 50 mg/min. Pediatric max varies (1000 mg PE in some protocols), so it needs sign-off. |
| Targets | total 10–20; free 1–2 | Winter: 10–20 mg/L; 5–10 may suffice in some; fu 0.1. | Winter 6e [V-W6]; Patsalos 2008 [RECALLED ranges] | agrees | Keep. |
| VPA displacement equation | 0.1/(0.095 + 0.001·VPA) | Winter Eq 14.8 (in the spec) | Winter 6e [V-W6 per spec] | agrees | Keep. |

---

## 2. Recommended defaults for our build

**Lithium**

```text
mEq = mg_carbonate × 8.12/300 ; citrate: mL × 1.6 mEq/mL (never mg salt)
CL (L/h) = 0.25 × CrCl(mL/min) × 0.06 × Π(interaction factors)
V = 0.7 L/kg × dosing weight [site: min(FFM,TBW); option: TBW per Winter]
Target = 12-h post-dose level; default 0.6–0.8 (solve for 0.7)
  elderly 65–79 y: 0.4–0.6 (max 0.8); ≥80 y: 0.4–0.6 (max 0.7)
  acute mania preset: 0.8–1.2
Factors: thiazide 0.5 (conservative); ACEi 0.5; ARB 0.5 [flag]; regular NSAID 0.7 [flag];
  loop diuretic: warning only; acute mania: NO 0.6 factor (Winter says CL ↑ up to 50%)
```

Rationale:
- The 0.25·CrCl, 0.7 L/kg and 8.12 mEq values match Winter 6e.
- The ISBD/IGSLi 2019 consensus and NICE use 0.6–0.8 at 12 h.
- The site's "Cavg 0.8" overshoots the 12-h target.

**Cooper nomogram.** Do **not** ship the spec §4d table as written. Only one cell (0.05–0.09 → 2700 mg/d) is independently corroborated, and a later letter reports that the nomogram over-predicts. If it is kept, it needs a "verify" badge pending the 1973 PDF:

| 24-h level after 600 mg (mEq/L) | <0.05 | 0.05–0.09 | 0.10–0.14 | 0.15–0.19 | 0.20–0.23 | 0.24–0.30 | >0.30 |
|---|---|---|---|---|---|---|---|
| Daily dose (mg carbonate) [RECALLED, unverified except the 2700 cell] | 3600 | 2700 [V-2nd] | 1800 | 1200 | 900 | 600 | 600 with caution |

Prefer the Winter single-point K method (spec §4d), which uses the patient's own V and CL.

**Phenobarbital**

```text
V: neonate (<2 wk) 0.9 L/kg; infants/children/adults 0.7 L/kg
CL (L/kg/h): neonate 0.004; infant 2 wk–1 y 0.010; 1–<5 y 0.0094; 5–<10 0.0075;
  10–<15 0.0060; 15–<19 0.0052; adult 0.004; >65 y 0.003
S: 0.91 (sodium injection); 1 (oral)   F: 1 (rectal 0.9)
LD = V·(Ctarget − Ccurrent)/(S·F); SE preset 15–20 mg/kg; neonatal 20 mg/kg
Target default 15–40 mg/L (show 10–40 ILAE alt)
VPA: 1000 mg/d ×0.75; 2000 mg/d ×0.5
```

Rationale:
- The site's own table-derived CL values (2 mg/kg/day gives 20 mg/L in adults) match Winter's 0.004 L/kg/h. The site's primary list (0.0056) does not.
- The pediatric bands come from the site table, which is consistent with Winter's "children ≈2× adult".

**Phenytoin**

```text
Pop Vmax/Km (mg/kg/day, mg/L): 0.5–<4 y 14/6.6; 4–<7 10.9/6.8; 7–<10 10.1/6.5; 10–<18 8.3/5.7
  (Bauer & Blouin 1983); 18–59 y 7/4.3 (option Winter 7/4); ≥60 y 6.0/5.8 (Bauer & Blouin 1982)
Binding: non-ESRD, free assay 37 °C or unknown (default)  Cnb = C/(0.9·Alb/4.4 + 0.1)  [Winter-Tozer; signed off 2026-10-25]
         non-ESRD, free assay 25 °C   Cnb = C/(0.25·Alb + 0.1)   [Anderson 1997]
         option ICU (25 °C)  Cnb = C/(0.29·Alb + 0.1)   [Kane 2013]
         legacy             Cnb = C/(0.9·Alb/4.4 + 0.1) ≈ C/(0.2·Alb + 0.1) [Winter/Sheiner-Tozer]
         ESRD/HD default    Cnb = C/(0.2·Alb + 0.1)    [Soriano 2017]; legacy 0.1·Alb+0.1 (= Winter 0.48)
         → always prefer measured free level; force it for ICU + low Alb, CrCl<25 + low Alb, displacing drugs
S = 0.92 caps/IV/fosphenytoin-PE; 1 suspension/chewable
Graves-Cloyd (optional, "per Bauer"): Dnew = (Dold/Cold)·Cnew^0.199·Cold^0.804  (doses as acid mg/day)
Ludden (two SS): Km = (R1−R2)/(R2/C2 − R1/C1); reject Km ≤ 0 or Vm ≤ max(R)
SE: fosphenytoin 20 mg PE/kg (max 1500); phenytoin 20 mg/kg (max 1500)
Targets: total 10–20 mg/L, free 1–2 mg/L
```

---

## 3. Items needing clinician sign-off

1. **Lithium acute-mania factor.** The site's 0.6 CL factor contradicts Winter (CL rises up to 50%). Remove it, or replace it with a warning?
2. **Lithium dosing weight**: min(FFM, TBW) (site) vs TBW (Winter). This changes CL by up to about 40% in heavier patients.
3. **Lithium default target**: the 12-h level of 0.6–0.8 vs the site's Cavg 0.8. Also the elderly bands.
4. **Interaction factors**: thiazide 0.5, ACEi 0.5, ARB 0.5 (new), NSAID 0.7 (generalized). These are conservative point estimates on weak evidence.
5. **Cooper nomogram**: ship with a verify badge, or drop it.
6. **Phenobarbital CL set**: Winter/table-derived (0.004 adult) vs the site's primary list (0.0056). Also the neonatal 0.9 vs 0.96 L/kg.
7. **Phenobarbital target**: 15–40 (Winter) vs 10–40 (site/ILAE).
8. **Phenytoin elderly Vmax**: 6.0 (Bauer & Blouin 1982) vs 7 (site/Murphy).
9. **Phenytoin albumin default coefficient**: 0.25 vs 0.29 vs 0.275 vs legacy 0.2. ESRD 0.2 (Soriano, n = 21) vs 0.1.
10. **Graves-Cloyd**: include it although the primary paper is unverified?
11. **Pediatric fosphenytoin maximum** (1000 vs 1500 mg PE) and the neonatal phenobarbital re-load (10–20 mg/kg).

---

## 4. References

Verified this session via PubMed (PMID and DOI):

- Cooper TB, Bergner PE, Simpson GM. The 24-hour serum lithium level as a prognosticator of dosage requirements. Am J Psychiatry 1973;130(5):601–3. PMID 4699934. https://doi.org/10.1176/ajp.130.5.601 (full table not read)
- Perry PJ, Alexander B, Dunner FJ, et al. Pharmacokinetic protocol for predicting serum lithium levels. J Clin Psychopharmacol 1982;2(2):114–8. PMID 7076875. https://pubmed.ncbi.nlm.nih.gov/7076875/
- Perry PJ, Prince RA, Alexander B, Dunner FJ. Prediction of lithium maintenance doses using a single point prediction protocol. J Clin Psychopharmacol 1983;3(1):13–7. PMID 6833518. https://pubmed.ncbi.nlm.nih.gov/6833518/
- Perry PJ, Alexander B, Prince RA, Dunner FJ. Prospective evaluation of two lithium maintenance dose schedules. J Clin Psychopharmacol 1984;4(5):242–6. PMID 6490961. https://pubmed.ncbi.nlm.nih.gov/6490961/
- Perry PJ, Alexander B, Prince RA, Dunner FJ. The utility of a single-point dosing protocol for predicting steady-state lithium levels. Br J Psychiatry 1986;148:401–5. PMID 3089352. https://doi.org/10.1192/bjp.148.4.401
- Lobeck F. A review of lithium dosing methods. Pharmacotherapy 1988;8(4):248–55. PMID 3057477. https://doi.org/10.1002/j.1875-9114.1988.tb04080.x
- Nolen WA, et al. What is the optimal serum level for lithium in the maintenance treatment of bipolar disorder? ISBD/IGSLI Task Force. Bipolar Disord 2019;21(5):394–409. PMID 31112628. https://doi.org/10.1111/bdi.12805
- Yatham LN, et al. CANMAT and ISBD 2018 guidelines for the management of patients with bipolar disorder. Bipolar Disord 2018;20(2):97–170. PMID 29536616. https://doi.org/10.1111/bdi.12609
- Tondo L, et al. Clinical use of lithium salts: guide for users and prescribers. Int J Bipolar Disord 2019;7:16. PMID 31328245. https://doi.org/10.1186/s40345-019-0151-2
- Finley PR. Drug interactions with lithium: an update. Clin Pharmacokinet 2016;55(8):925–41. PMID 26936045. https://doi.org/10.1007/s40262-016-0370-y (abstract only)
- Juurlink DN, et al. Drug-induced lithium toxicity in the elderly: a population-based study. J Am Geriatr Soc 2004;52(5):794–8. PMID 15086664. https://doi.org/10.1111/j.1532-5415.2004.52221.x
- Holstad SG, Perry PJ, et al. Effects of IV theophylline vs IV sodium bicarbonate on lithium clearance. Psychiatry Res 1988;25(2):203–11. PMID 2845461. https://doi.org/10.1016/0165-1781(88)90052-2
- Cook BL, Smith RE, Perry PJ, Calloway RA. Theophylline-lithium interaction. J Clin Psychiatry 1985;46(7):278–9. PMID 4008452.
- Wesseloo R, et al. Lithium dosing strategies during pregnancy and the postpartum period. Br J Psychiatry 2017;211(1):31–6. PMID 28673946. https://doi.org/10.1192/bjp.bp.116.192799
- Molenaar NM, et al. Management of lithium dosing around delivery: an observational study. Bipolar Disord 2021;23(1):49–54. PMID 32526071. https://doi.org/10.1111/bdi.12955
- Wilkes L, Danziger LH, Rodvold KA. Phenobarbital pharmacokinetics in obesity. A case report. Clin Pharmacokinet 1992;22(6):481–4. PMID 1587059. https://doi.org/10.2165/00003088-199222060-00006
- Touw DJ, et al. Clinical pharmacokinetics of phenobarbital in neonates. Eur J Pharm Sci 2000;12(2):111–6. PMID 11102738. https://doi.org/10.1016/s0928-0987(00)00145-7
- Kapetanović IM, et al. Mechanism of valproate-phenobarbital interaction in epileptic patients. Clin Pharmacol Ther 1981;29(4):480–6. PMID 6781810. https://doi.org/10.1038/clpt.1981.66
- Glauser T, et al. Evidence-based guideline: treatment of convulsive status epilepticus in children and adults (AES). Epilepsy Curr 2016;16(1):48–61. PMID 26900382. https://doi.org/10.5698/1535-7597-16.1.48 (doses via secondary reproductions)
- Kapur J, et al. Randomized trial of three anticonvulsant medications for status epilepticus (ESETT). N Engl J Med 2019;381:2103–13. PMID 31774955. https://doi.org/10.1056/NEJMoa1905795
- Pressler RM, et al. Treatment of seizures in the neonate: ILAE Task Force guidelines. Epilepsia 2023;64(10):2550–70. PMID 37655702. https://doi.org/10.1111/epi.17745
- Patsalos PN, et al. Antiepileptic drugs: best practice guidelines for TDM (ILAE). Epilepsia 2008;49(7):1239–76. PMID 18397299. https://doi.org/10.1111/j.1528-1167.2008.01561.x (range table not read)
- Bauer LA, Blouin RA. Phenytoin Michaelis-Menten pharmacokinetics in Caucasian paediatric patients. Clin Pharmacokinet 1983;8(6):545–9. PMID 6653035. https://doi.org/10.2165/00003088-198308060-00006
- Bauer LA, Blouin RA. Age and phenytoin kinetics in adult epileptics. Clin Pharmacol Ther 1982;31(3):301–4. PMID 7060313. https://doi.org/10.1038/clpt.1982.37
- Ludden TM, Allen JP, Valutsky WA, et al. Individualization of phenytoin dosage regimens. Clin Pharmacol Ther 1977;21(3):287–93. PMID 837647. https://doi.org/10.1002/cpt1977213287
- Liponi DF, Winter ME, Tozer TN. Renal function and therapeutic concentrations of phenytoin. Neurology 1984;34(3):395–7. PMID 6538287. https://doi.org/10.1212/wnl.34.3.395
- Anderson GD, Pak C, Doane KW, et al. Revised Winter-Tozer equation for normalized phenytoin concentrations in trauma and elderly patients with hypoalbuminemia. Ann Pharmacother 1997;31(3):279–84. PMID 9066931. https://doi.org/10.1177/106002809703100301 (0.25 coefficient per ClinCalc)
- Kane SP, Bress AP, Tesoro EP. Characterization of unbound phenytoin concentrations in neurointensive care unit patients using a revised Winter-Tozer equation. Ann Pharmacother 2013;47(5):628–36. PMID 23606554. https://doi.org/10.1345/aph.1R651 (0.29 per ClinCalc)
- Kiang TK, Ensom MH. A comprehensive review on the predictive performance of the Sheiner-Tozer and derivative equations. Ann Pharmacother 2016;50(4):311–25. PMID 26825643. https://doi.org/10.1177/1060028016628166
- Cheng W, Kiang TK, Bring P, Ensom MH. Predictive performance of the Winter-Tozer and derivative equations for estimating free phenytoin concentration. Can J Hosp Pharm 2016;69(4):269–79. PMID 27621486. https://doi.org/10.4212/cjhp.v69i4.1573
- Soriano VV, Tesoro EP, Kane SP. Characterization of free phenytoin concentrations in ESRD using the Winter-Tozer equation. Ann Pharmacother 2017;51(8):669–74. PMID 28470115. https://doi.org/10.1177/1060028017707541 (0.2 per ClinCalc)
- Montgomery MC, et al. Predicting unbound phenytoin concentrations: effects of albumin concentration and kidney dysfunction. Pharmacotherapy 2019;39(7):756–66. PMID 31067355. https://doi.org/10.1002/phar.2273
- Barra ME, et al. A novel correction equation avoids high-magnitude errors in interpreting TDM of phenytoin among critically ill patients. Ther Drug Monit 2020;42(4):617–25. PMID 32049893. https://doi.org/10.1097/FTD.0000000000000739
- Pryka RD, Rodvold KA, Erdman SM. An updated comparison of drug dosing methods. Part I: Phenytoin. Clin Pharmacokinet 1991;20(3):209–17. PMID 1902764. https://doi.org/10.2165/00003088-199120030-00003
- Toscano JP, Jameson JP. Comparison of four single-point phenytoin dosage prediction techniques using computer-simulated pharmacokinetic values. Clin Pharm 1986;5(5):396–402. PMID 3720209.

Textbook, local copy:
- Beringer PM (ed). *Winter's Basic Clinical Pharmacokinetics*, 6th ed. Wolters Kluwer; 2018. Ch. 12 Lithium, ch. 13 Phenobarbital, ch. 14 Phenytoin.

Secondary sources used for specific numbers:
- ClinCalc Phenytoin Correction Calculator (coefficients 0.25 / 0.29 / ESRD 0.2 with citations): https://clincalc.com/phenytoin/correction.aspx
- Graves-Cloyd equation and worked example (lecture reproducing Bauer, *Applied Clinical Pharmacokinetics*): http://uomus.edu.iq/img/lectures21/MUCLecture_2024_52442836.pdf
- Cooper nomogram cell 0.08 → 2700 mg/day: letter, Am J Psychiatry 1999;156:157a, https://doi.org/10.1176/ajp.156.1.157a
- NICE CG185 lithium 0.6–0.8 mmol/L at 12 h (via NHS lab pages): https://www.gloshospitals.nhs.uk/our-services/services-we-offer/pathology/tests-and-investigations/lithium/
- Lithium oral solution 8 mEq/5 mL label text: https://medlibrary.org/lib/rx/meds/lithium/page/8/

**Recalled, not verified (do not cite until checked):**
- Graves NM / Cloyd JC primary paper for the 0.199/0.804 equation (not found in PubMed under Graves NM + Cloyd JC).
- Full Cooper table except the 2700 cell.
- Perry regression coefficients.
- Patsalos range values (phenobarbital 10–40, phenytoin free 1–2).
- Neonatal phenobarbital re-load 10–20 mg/kg.
- Fosphenytoin 1.5 mg = 1 mg PE.
- Jermain & Crismon 1991 Li Vd values.
- The "IGSLi 2023" consensus named in the brief (not located; the 2019 Nolen paper is the consensus found).

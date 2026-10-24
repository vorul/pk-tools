# PK tool inventory: pkineticdrugdosing.com

Source: https://pkineticdrugdosing.com/index.html (crawled 2026-10-23). Author: Marshall Pierce, PharmD.
One spec per tool goes in `specs/<slug>.md`.

| # | Tool (slug) | Type on site | Primary sources |
|---|---|---|---|
| 1 | Creatinine clearance (`crcl`) | Web calc | calculators/creatinineclearance.htm, creatinine-clearance-overview.html |
| 2 | Hepatic disease score (`hepatic-score`) | Web calc | calculators/hepatic-disease-score-calculator.htm |
| 3 | Adult infusion rate (`infusion-rate`) | Web calc + charts | InfusionRateCalculatorasp.html, drip_rate_charts/InfusionRateCalculator.asp, adult-standard-drip-rate-charts.htm |
| 4 | Acyclovir IV dosing (`acyclovir`) | Info/dosing page | acyclovir.html |
| 5 | Aminoglycoside once-daily + graphic nomograms (`ag-once-daily`) | Web calc + PDFs | PulseDosingVanco.asp, aminoglycosides.html, amikacin 15 mg/kg + gent/tobra 3/5/7 mg/kg graphic tool PDFs, Aminoglycoside-Once-Daily-Dosing.pdf |
| 6 | Aminoglycoside traditional peak/trough (`ag-traditional`) | Web calc | TradDosingAV.asp, aminoglycosides.html |
| 7 | Vancomycin non-Bayesian AUC (`vanco-auc`) | Web calc | PulseDosingVanco.asp (troughs), TradDosingAV.asp (peak+trough), vancomycin.html |
| 8 | Vancomycin Bayesian AUC (`vanco-bayesian`) | Excel (.xlsm) + PDF | VancomycinAUCCalculatorOneCompartmentModel.xlsm, Gentamicin_Vancomycin_..._V2.xlsm, Excel Pharmacokinetic Dosing Program3.pdf, Vancomycin-PK-Analysis PDF |
| 9 | Vancomycin dosing charts + high-flux HD (`vanco-charts-hd`) | PDFs + protocol | Vanchart.pdf, Chart I/II PDFs, vancomycin.html#High_Flux, HD protocol evaluation page |
| 10 | Two-compartment / AUC / Monte Carlo (`two-comp-auc`) | Info + Excel | Twocompartmentopenmodel.html, AUCCalculationforOneorTwoCompartmentModel.html, two Monte Carlo pages |
| 11 | Bayesian engine + nonlinear fitting (`bayesian-engine`) | Methods | bayesian 1-comp and 2-comp pages, nonlineardatafittingalgorithms.html, commentary.html |
| 12 | Digoxin (`digoxin`) | Web calc + Excel | digoxin.html, DigoxinDosing.asp, digoxinweb.xlsm, Digoxin_..._Fitting.xlsm |
| 13 | Lithium (`lithium`) | Web calc + Excel | lithium.html, LithiumDosing.asp, lithiumdosingwintersmethod.xlsx |
| 14 | Phenobarbital (`phenobarbital`) | Excel | phenobarbital.html, phenobarbital.xlsm |
| 15 | Phenytoin (`phenytoin`) | Excel | phenytoin.html, PhenytoinexplicitequationSolving.xlsm, Phenytoin_Dosing.xlsx (both already local) |
| 16 | Theophylline (`theophylline`) | Web calc | TheophyllineDosing.asp |
| 17 | Shared references (`core-equations`) | Info/PDF | basic one-compartment equations page, simplified hand calculations PDF, DialyzabilityofDrugs.html, references.html |

Not included: the biography page, the PayPal links, and the login-gated vancomycin Bayesian web tool (register2.php / DrugDosingSteadyStateLevels.php).

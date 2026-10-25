// Tests for pk-suite/aminoglycosides.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js, then the page's CALC-START/CALC-END block with new Function.
// Covers: every live-server regression row in specs/ag-traditional.md and specs/ag-once-daily.md (site mode, exact
// displayed values), the spec worked examples (stated tolerances), the nomogram curves vs the PDF-extracted table
// (±0.5% or ±0.005 mg/L, the table's print precision), and literature-mode cases.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "aminoglycosides.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function("PK", `${block}; return { vbRound, bisect, DRUGS, CLS, KSETS, patient, siteTrad, siteOnce, siteTradTau,
  fitKOneLevel, nomoCurve, nomoClassify, SITE_NOMO, eidBracket, eidInitial, eidLevel,
  tradInitial, tradFit, tradTargets, tradMgKgFor, bayesFit, regimenForTarget, breakpoint, regimenLevels, levelFlags, TRAD_PRESETS,
  WB, wbPatient, wbRegimen, wbLBW, wbChiou, wbFitOptions, wbTargets, fitBounded };`)(PK);

const near = (a, e, tol, msg) => assert.ok(Math.abs(a - e) <= tol, `${msg || ""} expected ${e} ± ${tol}, got ${a}`);
const rel = (a, e, r, msg) => near(a, e, Math.abs(e) * r, msg);
const eq = (a, e, msg) => assert.ok(Math.abs(a - e) < 1e-9, `${msg || ""} expected ${e}, got ${a}`);

// ---------------- helpers ----------------
test("vbRound is banker's rounding", () => {
  eq(M.vbRound(91.25, 1), 91.2); eq(M.vbRound(18.25, 1), 18.2); eq(M.vbRound(362.5, 0), 362);
  eq(M.vbRound(4152.5, 0), 4152); eq(M.vbRound(363.5, 0), 364); eq(M.vbRound(1.2834, 1), 1.3);
});

// ======================= ag-traditional live-server table (site mode) =======================
// [id, drug, sex, age, ht, htUnit, wt, wtUnit, scrPrev, scr, hours, tinf, dose, tau, levels, applyFit, expected]
const T = [
  ["s01", "gent", "M", 50, 70, "in", 80, "kg", 1, 1, 24, 0.5, 120, 8, null, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 91.2, CrT12: 6.1, K: 0.2511, t12: 2.8, Vd: 19, VdPerKg: 0.25, LD: 162, Dosecalc: 114, Tau: 8, Cmax: 6.9, Cmin: 1.05, AUC: 75 }],
  ["s02", "gent", "M", 50, 70, "in", 70, "kg", 1, 1, 24, 0.5, 120, 8, null, false, { LBW: 70, DW: 70, BSA: 1.87, Wcl: 70, CrCl: 87.5, CrT12: 5.5, K: 0.2415, t12: 2.9, Vd: 17.5, VdPerKg: 0.25, LD: 149, Dosecalc: 105, Tau: 8, Cmax: 7.6, Cmin: 1.24, AUC: 85 }],
  ["s03", "gent", "M", 50, 70, "in", 120, "kg", 1, 1, 24, 0.5, 120, 8, null, false, { LBW: 73, DW: 91.8, BSA: 2.35, Wcl: 73, CrCl: 91.2, CrT12: 9.1, K: 0.2511, t12: 2.8, Vd: 23, VdPerKg: 0.25, LD: 196, Dosecalc: 138, Tau: 8, Cmax: 5.7, Cmin: 0.87, AUC: 62 }],
  ["s04", "gent", "M", 50, 70, "in", 80, "kg", 0.5, 0.5, 24, 0.5, 120, 8, null, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 182.5, CrT12: 3, K: 0.4885, t12: 1.4, Vd: 19, VdPerKg: 0.25, LD: 171, Dosecalc: 114, Tau: 8, Cmax: 5.7, Cmin: 0.15, AUC: 39 }],
  ["s05", "gent", "M", 80, 70, "in", 80, "kg", 4, 4, 24, 0.5, 120, 24, null, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 15.2, CrT12: 36.5, K: 0.0535, t12: 13, Vd: 19, VdPerKg: 0.25, LD: 154, Dosecalc: 114, Tau: 36, Cmax: 8.6, Cmin: 2.45, AUC: 118 }],
  ["s06", "gent", "F", 50, 70, "in", 80, "kg", 1, 1, 24, 0.5, 120, 8, null, false, { LBW: 68.5, DW: 73.1, BSA: 1.98, Wcl: 68.5, CrCl: 72.8, CrT12: 7.6, K: 0.2033, t12: 3.4, Vd: 18.3, VdPerKg: 0.25, LD: 154, Dosecalc: 110, Tau: 12, Cmax: 7.8, Cmin: 1.7, AUC: 97 }],
  ["s07", "gent", "M", 50, 180, "cm", 176, "lb", 1.5, 1.5, 24, 0.5, 120, 12, null, false, { LBW: 75.1, DW: 77.06, BSA: 2, Wcl: 75.1, CrCl: 62.6, CrT12: 8.9, K: 0.1768, t12: 3.9, Vd: 19.3, VdPerKg: 0.25, LD: 161, Dosecalc: 116, Tau: 12, Cmax: 6.8, Cmin: 0.89, AUC: 70, mgkg: 1.6 }],
  ["s08", "amik", "F", 70, 64, "in", 60, "kg", 1.4, 1.4, 24, 0.5, 400, 12, null, false, { LBW: 54.7, DW: 56.82, BSA: 1.64, Wcl: 54.7, CrCl: 32.3, CrT12: 12.9, K: 0.098, t12: 7.1, Vd: 14.2, VdPerKg: 0.25, LD: 437, Dosecalc: 426, Tau: 24, Cmax: 39.8, Cmin: 12.9, AUC: 575, mgkg: 7 }],
  ["s09", "gent", "M", 60, 70, "in", 73, "kg", 1, 2, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 73, BSA: 1.9, Wcl: 73, CrCl: 32, CrT12: 15.8, K: 0.0972, t12: 7.1, Vd: 18.2, VdPerKg: 0.25, LD: 149, Dosecalc: 110, Tau: 24 }],
  ["s10", "gent", "M", 60, 70, "in", 73, "kg", 2, 1.5, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 73, BSA: 1.9, Wcl: 73, CrCl: 57.5, CrT12: 8.8, K: 0.1635, t12: 4.2, Vd: 18.2, VdPerKg: 0.25, LD: 152, Dosecalc: 110, Tau: 12 }],
  ["s11", "gent", "M", 60, 70, "in", 73, "kg", 1, 3, 12, 0.5, 0, 0, null, false, { LBW: 73, DW: 73, BSA: 1.9, Wcl: 73, CrCl: 5, CrT12: 101.2, K: 0.027, t12: 25.7, Vd: 18.2, VdPerKg: 0.25, LD: 147, Dosecalc: 110, Tau: 72 }],
  ["s12", "gent", "M", 50, 70, "in", 80, "kg", 1.2, 1.2, 24, 1, 0, 0, null, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 76, CrT12: 7.3, K: 0.2116, t12: 3.3, Vd: 19, VdPerKg: 0.25, LD: 169, Dosecalc: 114, Tau: 12 }],
  ["s13", "gent", "M", 50, 70, "in", 80, "kg", 1.1, 1.1, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 83, CrT12: 6.7, K: 0.2298, t12: 3, Vd: 19, VdPerKg: 0.25, LD: 161, Dosecalc: 114, Tau: 12 }],
  ["s14", "gent", "M", 60, 70, "in", 100, "kg", 1, 2, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 83.8, BSA: 2.18, Wcl: 73, CrCl: 25.4, CrT12: 27.2, K: 0.08, t12: 8.7, Vd: 21, VdPerKg: 0.25, LD: 171, Dosecalc: 126, Tau: 24 }],
  ["s15", "gent", "M", 80, 70, "in", 80, "kg", 20, 20, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 5, CrT12: 110.9, K: 0.027, t12: 25.7, Vd: 19, VdPerKg: 0.25, LD: 153, Dosecalc: 114, Tau: 72 }],
  ["s16", "gent", "M", 50, 70, "in", 80, "kg", 1, 1, 24, 0.5, 120, 8, { peak: 7, tPeak: 0.5, trough: 1.2, tTrough: 0.5 }, false, { LBW: 73, DW: 75.8, BSA: 1.98, Wcl: 73, CrCl: 91.2, CrT12: 6.1, K: 0.2511, t12: 2.8, Vd: 19, VdPerKg: 0.25, Dosecalc: 114, Tau: 8, Cmax: 6.9, Cmin: 1.05, AUC: 75, mgkg: 1.6, KFit: 0.2713, VdFit: 15.8 }],
  ["s19", "gent", "M", 50, 70, "in", 102, "kg", 1, 1, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 84.6, BSA: 2.19, Wcl: 73, CrCl: 91.2, CrT12: 7.8, K: 0.2511, t12: 2.8, Vd: 21.2, VdPerKg: 0.25, LD: 180, Dosecalc: 127, Tau: 8 }],
  ["s20", "gent", "M", 50, 70, "in", 80, "kg", 1, 1, 24, 0.5, 120, 8, { peak: 7, tPeak: 0.5, trough: 1.2, tTrough: 0.5 }, true, { LBW: 73, DW: 75.8, CrCl: 91.2, CrT12: 6.1, K: 0.2713, t12: 2.6, Vd: 15.8, VdPerKg: 0.21, Dosecalc: 114, Tau: 8, Cmax: 8, Cmin: 1.05, AUC: 84, mgkg: 1.6, KFit: 0.2713, VdFit: 15.8 }],
  // s21: dose changed to 160 q12 after the fit; levels still belong to 120 q8 (separate drawn-on regimen).
  ["s21", "gent", "M", 50, 70, "in", 80, "kg", 1, 1, 24, 0.5, 160, 12, { dose: 120, tau: 8, peak: 7, tPeak: 0.5, trough: 1.2, tTrough: 0.5 }, true, { K: 0.2713, t12: 2.6, Vd: 15.8, VdPerKg: 0.21, Dosecalc: 114, Tau: 8, Cmax: 9.8, Cmin: 0.43, AUC: 75, mgkg: 2.1, KFit: 0.2713, VdFit: 15.8 }],
  ["s26", "gent", "M", 50, 70, "in", 80, "kg", 1.855, 1.855, 24, 0.5, 0, 0, null, false, { LBW: 73, DW: 75.8, CrCl: 48, CrT12: 11.5, K: 0.1388, t12: 5, Vd: 19, LD: 157, Dosecalc: 114, Tau: 12 }],
  ["s27", "gent", "M", 80, 70, "in", 80, "kg", 20, 20, 24, 3, 0, 0, null, false, { CrCl: 5, CrT12: 110.9, K: 0.027, t12: 25.7, Vd: 19, LD: 158, Dosecalc: 114, Tau: 72 }],
  ["s28", "amik", "M", 50, 70, "in", 80, "kg", 1.855, 1.855, 24, 0.5, 0, 0, null, false, { CrCl: 48, CrT12: 11.5, K: 0.1388, t12: 5, Vd: 19, LD: 590, Dosecalc: 568, Tau: 16 }],
  ["s29", "gent", "M", 80, 70, "in", 80, "kg", 7.157, 7.157, 24, 0.5, 0, 0, null, false, { CrCl: 8.4, CrT12: 66, K: 0.0358, t12: 19.4, Vd: 19, LD: 153, Dosecalc: 114, Tau: 48 }],
  ["s30", "gent", "M", 50, 70, "in", 80, "kg", 1.9, 1.9, 24, 2, 0, 0, null, false, { CrCl: 48, CrT12: 11.5, K: 0.1388, t12: 5, Vd: 19, LD: 174, Dosecalc: 114, Tau: 16 }],
  ["s32", "gent", "M", 50, 70, "in", 70, "kg", 1, 1, 24, 0.75, 0, 0, null, false, { CrCl: 87.5, K: 0.2415, Vd: 17.5, LD: 153, Dosecalc: 105, Tau: 12 }],
  ["s33", "gent", "M", 50, 70, "in", 70, "kg", 1, 1, 24, 0.625, 0, 0, null, false, { CrCl: 87.5, K: 0.2415, Vd: 17.5, LD: 151, Dosecalc: 105, Tau: 12 }],
  ["s34", "gent", "M", 50, 70, "in", 80, "kg", 0.5, 0.5, 24, 5, 0, 0, null, false, { CrCl: 182.5, CrT12: 3, K: 0.4885, t12: 1.4, Vd: 19, LD: 407, Dosecalc: 114, Tau: 12 }],
  ["s35", "gent", "M", 50, 70, "in", 80, "kg", 0.5, 0.5, 24, 4.8, 0, 0, null, false, { CrCl: 182.5, K: 0.4885, LD: 394, Tau: 12 }],
  ["s36", "gent", "M", 50, 70, "in", 80, "kg", 0.5, 0.5, 24, 3.5, 0, 0, null, false, { CrCl: 182.5, K: 0.4885, LD: 317, Tau: 8 }],
];
for (const [id, drug, sex, age, ht, htUnit, wt, wtUnit, scrPrev, scr, hours, tinf, dose, tau, levels, applyFit, exp] of T) {
  test(`ag-traditional live server ${id} (site mode, exact display)`, () => {
    const o = M.siteTrad({ drug, sex, age, ht, htUnit, wt, wtUnit, scr, scrPrev, changing: scrPrev !== scr, scrHours: hours, tinf, dose, tau, levels, applyFit });
    for (const k of Object.keys(exp)) eq(o[k], exp[k], `${id} ${k}`);
    if (levels) assert.equal(o.LD, undefined, `${id}: LD not shown once fit results exist`);
  });
}

// ======================= ag-once-daily live-server table (site mode) =======================
const B = { sex: "M", htUnit: "in", wtUnit: "kg", tinf: 0.5 };
const O = [
  ["s01", { drug: "gent", age: 45, ht: 70, wt: 80, scr: 1 }, { LBW: 73, DW: 75.8, BSA: 1.98, CrCl: 96.3, CrT12: 5.8, K: 0.2644, t12: 2.6, Vd: 19, Dosecalc: 379, Tau: 24 }],
  ["s02", { drug: "gent", age: 45, ht: 70, wt: 80, scr: 1, dose: 360, tau: 24, level: 1.5, tLevel: 14.5 }, { LBW: 73, DW: 75.8, CrCl: 96.3, K: 0.2644, t12: 2.6, Vd: 19, Dosecalc: 379, Tau: 24, mgkg: 4.7, Cmax: 17.8, Cmin: 0.04, SS: 7.9, AUC: 72, KFit: 0.179 }],
  ["s03", { drug: "gent", age: 45, ht: 70, wt: 80, scr: 1, dose: 360, tau: 24, level: 1.5, tLevel: 14.5, applyFit: true }, { K: 0.179, t12: 3.9, Vd: 19, Dosecalc: 379, Tau: 24, mgkg: 4.7, Cmax: 18.4, Cmin: 0.27, SS: 11.6, AUC: 106, KFit: 0.179 }],
  ["s04", { drug: "gent", sex: "F", age: 70, ht: 64, wt: 60, scr: 1.2, dose: 280, tau: 24, level: 4, tLevel: 12 }, { LBW: 54.7, DW: 56.82, BSA: 1.64, CrCl: 37.7, CrT12: 11, K: 0.112, t12: 6.2, Vd: 14.2, Dosecalc: 284, Tau: 48, mgkg: 4.9, Cmax: 20.6, Cmin: 1.48, SS: 18.6, AUC: 176, KFit: 0.1389 }],
  ["s05", { drug: "amik", age: 60, ht: 72, wt: 100, scr: 1, tinf: 2, dose: 1500, tau: 24, level: 5, tLevel: 14 }, { LBW: 77.6, DW: 86.56, BSA: 2.22, CrCl: 86.2, CrT12: 8, K: 0.2381, t12: 2.9, Vd: 21.6, Dosecalc: 1298, Tau: 24, mgkg: 17.3, Cmax: 55.4, Cmin: 0.29, SS: 8.7, AUC: 292, KFit: 0.2035 }],
  ["s06", { drug: "gent", age: 60, ht: 70, wt: 80, scr: 1.5, dose: 380, tau: 36 }, { LBW: 73, DW: 75.8, CrCl: 54.1, CrT12: 10.2, K: 0.1547, t12: 4.5, Vd: 19, Dosecalc: 379, Tau: 36, mgkg: 5, Cmax: 19.3, Cmin: 0.08, SS: 13.4, AUC: 86 }],
  ["s07", { drug: "gent", age: 80, ht: 70, wt: 73, scr: 2.4, dose: 360, tau: 48 }, { LBW: 73, DW: 73, BSA: 1.9, CrCl: 25.3, CrT12: 20, K: 0.0798, t12: 8.7, Vd: 18.2, LD: 149, Dosecalc: 110, Tau: 24, mgkg: 4.9, Cmax: 19.8, Cmin: 0.45, SS: 26.1, AUC: 124, traditional: true }],
  ["s08", { drug: "gent", age: 60, ht: 70, wt: 73, scr: 1.3 }, { CrCl: 62.4, CrT12: 8.1, K: 0.1762, t12: 3.9, Vd: 18.2, Dosecalc: 365, Tau: 36 }],
  ["s09", { drug: "gent", age: 60, ht: 70, wt: 73, scr: 1.3, dose: 300, tau: 24 }, { CrCl: 62.4, K: 0.1762, Dosecalc: 365, Tau: 36, mgkg: 4.1, Cmax: 16, Cmin: 0.25, SS: 11.8, AUC: 94, troughHigh: false }],
  ["s10", { drug: "gent", age: 60, ht: 70, wt: 73, scr: 1.2834 }, { CrCl: 62.4, CrT12: 8.1, K: 0.1762, Dosecalc: 365, Tau: 36 }],
  ["s11", { drug: "gent", age: 60, ht: 70, wt: 73, scr: 1.2773 }, { CrCl: 62.4, K: 0.1762, Tau: 36 }],
  ["s12", { drug: "gent", age: 59, ht: 70, wt: 73, scr: 1.3 }, { CrCl: 63.2, CrT12: 8, K: 0.1783, Vd: 18.2, Dosecalc: 365, Tau: 36 }],
  ["s13", { drug: "gent", age: 58, ht: 70, wt: 72.5, scr: 1.3 }, { LBW: 72.5, DW: 72.5, CrCl: 63.5, CrT12: 7.9, K: 0.1791, Vd: 18.1, Dosecalc: 362, Tau: 24 }],
  ["s14", { drug: "gent", age: 61, ht: 71, wt: 73.1, scr: 2 }, { LBW: 73.1, DW: 73.1, BSA: 1.92, CrCl: 40.1, CrT12: 12.6, K: 0.1183, t12: 5.9, Vd: 18.3, Dosecalc: 366, Tau: 48 }],
  ["s15", { drug: "gent", age: 61, ht: 71, wt: 73.3, scr: 2 }, { LBW: 73.3, DW: 73.3, BSA: 1.93, CrCl: 40.2, K: 0.1185, t12: 5.8, Vd: 18.3, Dosecalc: 366, Tau: 36 }],
  ["s16", { drug: "gent", age: 82, ht: 70, wt: 73, scr: 2 }, { CrCl: 29.4, CrT12: 17.2, K: 0.0904, t12: 7.7, Dosecalc: 365, Tau: 48 }],
  ["s17", { drug: "amik", age: 63, ht: 70, wt: 73, scr: 1.3 }, { CrCl: 60.1, CrT12: 8.4, K: 0.1703, t12: 4.1, Dosecalc: 1095, Tau: 36 }],
  ["s18", { drug: "amik", age: 60, ht: 70, wt: 73, scr: 1.3 }, { CrCl: 62.4, K: 0.1762, Dosecalc: 1095, Tau: 36 }],
  ["s19", { drug: "amik", age: 58, ht: 70, wt: 72.5, scr: 1.3 }, { LBW: 72.5, CrCl: 63.5, K: 0.1791, Vd: 18.1, Dosecalc: 1088, Tau: 24 }],
  ["s20", { drug: "gent", age: 80, ht: 180, htUnit: "cm", wt: 220, wtUnit: "lb", scr: 0.5 }, { LBW: 75.1, DW: 85.06, BSA: 2.2, CrCl: 125.2, CrT12: 5.5, K: 0.3395, t12: 2, Vd: 21.3, Dosecalc: 425, Tau: 24 }],
  ["s21", { drug: "gent", age: 60, ht: 70, wt: 73, scrPrev: 1, scr: 2, scrHours: 24, changing: true }, { CrCl: 32, CrT12: 15.8, K: 0.0972, t12: 7.1, Vd: 18.2, Dosecalc: 365, Tau: 48 }],
  ["s22", { drug: "gent", sex: "F", age: 70, ht: 64, wt: 60, scrPrev: 1.6, scr: 1, scrHours: 48, changing: true }, { LBW: 54.7, DW: 56.82, BSA: 1.64, CrCl: 45.9, CrT12: 9.1, K: 0.1333, t12: 5.2, Vd: 14.2, Dosecalc: 284, Tau: 36 }],
];
for (const [id, inp, exp] of O) {
  test(`ag-once-daily live server ${id} (site mode, exact display)`, () => {
    const o = M.siteOnce({ ...B, ...inp });
    for (const k of Object.keys(exp)) {
      if (typeof exp[k] === "boolean") assert.equal(o[k], exp[k], `${id} ${k}`);
      else eq(o[k], exp[k], `${id} ${k}`);
    }
  });
}
test("once-daily server trough warnings: s04 and s07 warn, s09 (0.25) does not", () => {
  assert.ok(M.siteOnce({ ...B, drug: "gent", sex: "F", age: 70, ht: 64, wt: 60, scr: 1.2, dose: 280, tau: 24 }).alerts.some((a) => /higher than recommended for PULSE/.test(a.text)));
  const s07 = M.siteOnce({ ...B, drug: "gent", age: 80, ht: 70, wt: 73, scr: 2.4, dose: 360, tau: 48 });
  assert.ok(s07.alerts.some((a) => /TRADITIONAL/.test(a.text)));
  assert.ok(!M.siteOnce({ ...B, drug: "gent", age: 60, ht: 70, wt: 73, scr: 1.3, dose: 300, tau: 24 }).alerts.length);
});

// ======================= ag-traditional worked examples (equations, unrounded) =======================
// Spec arithmetic uses the site's min(IBW, TBW) CrCl weight without rounding: literature model + crclPolicy minIbwTbw.
const lit = (o) => M.patient({ model: "literature", htUnit: "in", wtUnit: "kg", crclPolicy: "minIbwTbw", ...o });
test("Trad Ex 1: gent stable, population values, LD, MD, predictions (±0.5%)", () => {
  const pt = lit({ drug: "gent", sex: "M", age: 50, ht: 70, wt: 80, scr: 1 });
  near(pt.ibw, 73, 1e-9); near(pt.dw, 75.8, 1e-9); rel(pt.bsa, 1.979, 0.002); near(pt.crcl, 91.25, 1e-9);
  near(pt.K, 0.25125, 1e-9); rel(pt.t12, 2.76, 0.005); near(pt.Vd, 18.95, 1e-9);
  rel(PK.one.loadingDoseInfusion({ cTarget: 8, tinf: 0.5 }, { V: pt.Vd, k: pt.K }), 161.3, 0.005);
  rel(1.5 * pt.dw, 113.7, 0.001);
  rel(PK.one.intervalForTargets({ cmax: 8, cmin: 1, k: pt.K, tinf: 0.5 }), 8.78, 0.005);
  rel(PK.one.doseForPeak({ cmax: 8, tau: 8, tinf: 0.5 }, { V: pt.Vd, k: pt.K }), 139.7, 0.005);
  const l = M.regimenLevels(120, 8, 0.5, pt.K, pt.Vd);
  rel(l.cmax, 6.87, 0.005); rel(l.cmin, 1.04, 0.01); rel(l.auc24, 75.6, 0.005);
  rel(PK.one.auc24TrapLog(l.cmax, l.cmin, pt.K, 0.5, 8), 75.5, 0.005);
});
test("Trad Ex 2: amikacin, 400 q12 exceeds max peak 30 and trough 5 (both flagged)", () => {
  const pt = lit({ drug: "amik", sex: "F", age: 70, ht: 64, wt: 60, scr: 1.4 });
  near(pt.dw, 56.82, 1e-9); rel(pt.crcl, 32.29, 0.001); rel(pt.K, 0.09795, 0.001); rel(pt.Vd, 14.21, 0.001);
  rel(PK.one.loadingDoseInfusion({ cTarget: 30, tinf: 0.5 }, { V: pt.Vd, k: pt.K }), 436.7, 0.005);
  rel(PK.one.intervalForTargets({ cmax: 25, cmin: 4, k: pt.K, tinf: 0.5 }), 19.21, 0.005);
  rel(PK.one.doseForPeak({ cmax: 25, tau: 12, tinf: 0.5 }, { V: pt.Vd, k: pt.K }), 251.6, 0.005);
  const o = M.tradInitial(pt, { tinf: 0.5, peak: 25, trough: 5, tau: 12, dose: 400 });
  rel(o.pred.cmax, 39.75, 0.005); rel(o.pred.cmin, 12.89, 0.005); rel(o.pred.auc24, 574.9, 0.005);
  assert.ok(o.flags.some((f) => f.code === "peakHigh")); assert.ok(o.flags.some((f) => f.code === "troughHigh"));
  rel(pt.crT12, 11.74, 0.005, "lit creatinine t½ uses the CrCl weight (site uses TBW: 12.88)");
});
test("Trad Ex 3: Chow non-steady-state CrCl", () => {
  const a = lit({ drug: "gent", sex: "M", age: 60, ht: 70, wt: 73, scrPrev: 1, scr: 2, scrHours: 24, changing: true });
  rel(a.crcl, 31.96, 0.001); rel(a.crT12, 15.83, 0.005); rel(a.K, 0.09711, 0.001);
  const b = lit({ drug: "gent", sex: "M", age: 60, ht: 70, wt: 73, scrPrev: 2, scr: 1.5, scrHours: 24, changing: true });
  rel(b.crcl, 57.48, 0.001); rel(b.crT12, 8.8, 0.005); rel(b.K, 0.16346, 0.001);
  const c = lit({ drug: "gent", sex: "M", age: 60, ht: 70, wt: 73, scrPrev: 1, scr: 3, scrHours: 12, changing: true });
  assert.equal(c.crcl, 0); assert.ok(c.flags.some((f) => f.code === "chowNoRoot"));
  const s = M.patient({ model: "site", drug: "gent", sex: "M", age: 60, ht: 70, htUnit: "in", wt: 73, wtUnit: "kg", scrPrev: 1, scr: 3, scrHours: 12, changing: true });
  eq(s.crcl, 5); eq(s.K, 0.027); eq(s.crT12, 101.2);
});
test("Trad Ex 4: Sawchuk-Zaske fit with separate drawn-on and new regimens", () => {
  const pt = lit({ drug: "gent", sex: "M", age: 50, ht: 70, wt: 80, scr: 1 });
  const base = { drawn: { dose: 120, tau: 8, tinf: 0.5 }, peak: 7, tPeak: 0.5, trough: 1.2, tTrough: 0.5, target: { peak: 8, trough: 1 } };
  const o = M.tradFit(pt, { ...base, newTau: 12 });
  near(o.dt, 6.5, 1e-9); rel(o.K, 0.27132, 1e-4); rel(o.t12, 2.55, 0.005); rel(o.cmaxTrue, 8.017, 0.001); rel(o.cminTrue, 1.048, 0.002);
  rel(o.V, 15.8, 0.002); rel(o.vkg, 0.208, 0.005);
  rel(o.current.cmax, 8.017, 0.001, "self-consistency"); rel(o.current.cmin, 1.048, 0.002); rel(o.current.auc24, 83.9, 0.005);
  rel(o.tauRaw, 8.16, 0.005); rel(o.doseExact, 130, 0.01);
  const p160 = M.tradFit(pt, { ...base, newTau: 12, newDose: 160 }).pred;
  rel(p160.cmax, 9.85, 0.005); rel(p160.cmin, 0.43, 0.02); rel(p160.auc24, 74.6, 0.005);
  const f180 = M.tradFit(pt, { ...base, newTau: 12, newDose: 180 });
  rel(f180.pred.cmax, 11.08, 0.005); rel(f180.pred.cmin, 0.49, 0.02); assert.ok(f180.flags.some((f) => f.code === "peakHigh"));
  // The new regimen does not alter the fit (the site's single-pair flaw).
  near(M.tradFit(pt, { ...base, newTau: 12, newDose: 160 }).K, o.K, 1e-12);
  assert.ok(M.tradFit(pt, { ...base, tPeak: 4, tTrough: 4 }).error, "dt <= 0 rejected");
});
test("Pop K / t½ table (CrCl 0-120)", () => {
  const K = [0.326, 0.3, 0.274, 0.248, 0.222, 0.196, 0.17, 0.144, 0.118, 0.092, 0.066, 0.04, 0.014];
  const H = [2.1, 2.3, 2.5, 2.8, 3.1, 3.5, 4.1, 4.8, 5.9, 7.5, 10.5, 17.3, 49.5];
  K.forEach((k, i) => { const cr = 120 - 10 * i, kk = M.KSETS.site.a * cr + M.KSETS.site.b; near(kk, k, 5e-4, `K@${cr}`); near(+PK.one.halfLife(kk).toFixed(1), H[i], 1e-9, `t½@${cr}`); });
});
test("Site traditional Tau rule reproduces every observation incl. once-daily s07 traditional mode", () => {
  const obs = [[0.4885, 0.5, 8], [0.2511, 0.5, 8], [0.2415, 0.5, 8], [0.2298, 0.5, 12], [0.2116, 1, 12], [0.2033, 0.5, 12], [0.1768, 0.5, 12], [0.1635, 0.5, 12], [0.1388, 0.5, 12], [0.1388, 2, 16], [0.0972, 0.5, 24], [0.08, 0.5, 24], [0.0535, 0.5, 36], [0.0358, 0.5, 48], [0.027, 0.5, 72], [0.027, 3, 72], [0.2713, 0.5, 8], [0.2415, 0.75, 12], [0.2415, 0.625, 12], [0.4885, 5, 12], [0.4885, 4.8, 12], [0.4885, 3.5, 8], [0.0798, 0.5, 24]];
  for (const [K, Tp, tau] of obs) assert.equal(M.siteTradTau(Math.log(6) / K + Tp), tau, `gent K ${K} T' ${Tp}`);
  assert.equal(M.siteTradTau(Math.log(7.5) / 0.098 + 0.5), 24); assert.equal(M.siteTradTau(Math.log(7.5) / 0.1388 + 0.5), 16);
});

// ======================= ag-once-daily worked examples =======================
test("EID Ex 1: gent 360 mg, q24/q36/q48 predictions and one-level K fits", () => {
  const pt = lit({ drug: "gent", sex: "M", age: 45, ht: 70, wt: 80, scr: 1 });
  rel(pt.crcl, 96.32, 0.001); rel(pt.K, 0.2644, 0.001); near(pt.Vd, 18.95, 1e-9); rel(5 * pt.dw, 379, 1e-9);
  rel(3 * PK.one.halfLife(pt.K), 7.86, 0.005);
  const e = M.eidInitial(pt, { mgPerKg: 5, tinf: 0.5, dose: 360, troughMax: 0.5 });
  const [q24, q36, q48] = e.rows;
  rel(q24.cmax, 17.83, 0.005); rel(q24.cmin, 0.036, 0.02); rel(q24.auc24, 71.8, 0.005);
  rel(q36.cmax, 17.8, 0.005); rel(q36.cmin, 0.0015, 0.05); rel(q36.auc24, 47.9, 0.005); rel(q48.auc24, 35.9, 0.005);
  assert.equal(e.modelTau, 24); assert.equal(e.bracketTau, 24);
  const f = (form) => M.fitKOneLevel({ level: 1.5, t: 14.5, dose: 360, tau: 24, tinf: 0.5, V: pt.Vd, form }).K;
  rel(f("first"), 0.17819, 5e-4); rel(f("ss"), 0.17915, 5e-4);
  const l = M.regimenLevels(360, 24, 0.5, 0.17819, 18.95);
  rel(l.cmax, 18.43, 0.005); rel(l.cmin, 0.28, 0.01);
  near(M.fitKOneLevel({ level: 1.5, t: 14.5, dose: 360, tau: 24, tinf: 0.5, V: 19, form: "ss" }).K, 0.17897, 5e-5, "server Vd 19");
  // Nomogram cross-check: 1.5 at 14 h after end, normalised 1.58 -> q24.
  assert.equal(M.nomoClassify((1.5 * 379) / 360, 14, 5), 24);
});
test("EID Ex 2: gent female 280 mg; bracket q48 and equation q48", () => {
  const pt = lit({ drug: "gent", sex: "F", age: 70, ht: 64, wt: 60, scr: 1.2 });
  rel(pt.crcl, 37.67, 0.001); rel(pt.K, 0.1119, 0.001); rel(pt.Vd, 14.21, 0.001); rel(5 * pt.dw, 284.1, 0.001);
  rel(3 * PK.one.halfLife(pt.K), 18.6, 0.005);
  const e = M.eidInitial(pt, { mgPerKg: 5, tinf: 0.5, dose: 280, troughMax: 0.3 });
  const [q24, q36, q48] = e.rows;
  rel(q24.cmax, 20.57, 0.005); rel(q24.cmin, 1.48, 0.005); rel(q24.auc24, 176.1, 0.005);
  rel(q36.cmax, 19.52, 0.005); rel(q36.cmin, 0.367, 0.01); rel(q36.auc24, 117.4, 0.005);
  rel(q48.cmax, 19.26, 0.005); rel(q48.cmin, 0.095, 0.02); rel(q48.auc24, 88, 0.005);
  assert.equal(e.modelTau, 48); assert.equal(M.eidBracket(pt.crcl), 48);
  near(M.fitKOneLevel({ level: 4, t: 12, dose: 280, tau: 24, tinf: 0.5, V: 14.21, form: "first" }).K, 0.1358, 5e-4);
});
test("EID Ex 3: amikacin 1200 mg q24, T' 1 h", () => {
  const pt = lit({ drug: "amik", sex: "M", age: 60, ht: 72, wt: 100, scr: 1 });
  near(pt.ibw, 77.6, 1e-9); near(pt.dw, 86.56, 1e-9); rel(pt.crcl, 86.22, 0.001); rel(pt.K, 0.2382, 0.001); rel(pt.Vd, 21.64, 0.001);
  rel(15 * pt.dw, 1298.4, 1e-4);
  const l = M.regimenLevels(1200, 24, 1, pt.K, pt.Vd);
  rel(l.cmax, 49.51, 0.005); rel(l.cmin, 0.207, 0.01); rel(l.auc24, 232.8, 0.005);
});

// ======================= nomogram curves vs the PDF-extracted table =======================
const PDF = {
  3: [[11.81, 8.62, 4.59, 2.45, 1.79, 1.31, 0.95, 0.51, 0.27, 0.04, 0.006], [11.96, 9.68, 6.35, 4.17, 3.38, 2.73, 2.21, 1.45, 0.95, 0.27, 0.08], [12.03, 10.27, 7.47, 5.44, 4.64, 3.96, 3.38, 2.46, 1.79, 0.69, 0.27]],
  5: [[19.68, 14.37, 7.66, 4.08, 2.98, 2.18, 1.59, 0.85, 0.45, 0.07, 0.01], [19.93, 16.14, 10.59, 6.95, 5.63, 4.56, 3.69, 2.42, 1.59, 0.45, 0.13], [20.05, 17.11, 12.45, 9.07, 7.74, 6.6, 5.63, 4.1, 2.98, 1.15, 0.44]],
  7: [[27.56, 20.12, 10.71, 5.72, 4.17, 3.04, 2.22, 1.18, 0.63, 0.09, 0.01], [27.9, 22.6, 14.83, 9.73, 7.88, 6.38, 5.16, 3.39, 2.22, 0.62, 0.18], [28.07, 23.95, 17.43, 12.69, 10.83, 9.24, 7.88, 5.74, 4.18, 1.61, 0.62]],
  15: [[59.05, 43.1, 22.97, 12.24, 8.93, 6.53, 4.77, 2.53, 1.34, 0.2, 0.03], [59.79, 48.43, 31.76, 20.84, 16.89, 13.67, 11.07, 7.27, 4.77, 1.34, 0.38], [60.15, 51.32, 37.36, 27.19, 23.19, 19.79, 16.89, 12.3, 8.95, 3.45, 1.33]],
};
const TIMES = [0, 2, 6, 10, 12, 14, 16, 20, 24, 36, 48];
const CURVES = [[24, 55], [36, 35], [48, 25]];
// The model (K = 0.0026·CrCl + 0.014 at CrCl 55/35/25) matches the PDF within ±0.5% (or the table's ±0.005 print
// precision) over t <= 10 h after the end of infusion. Later points drift: the PDF curves decay with K about 0.0004 h^-1
// faster than the stated equation (spec §5 fitted K 0.15737 / 0.10540 / 0.07939 vs 0.157 / 0.105 / 0.079), reaching
// 2.8% at 48 h. The full table is therefore checked at ±3% or ±0.01 mg/L.
for (const mgkg of [3, 5, 7, 15]) {
  test(`site nomogram ${mgkg} mg/kg: curve points vs PDF (±0.5% to 10 h, ±3% to 48 h)`, () => {
    CURVES.forEach(([tau, crcl], ci) => TIMES.forEach((t, ti) => {
      const e = PDF[mgkg][ci][ti], a = M.nomoCurve(t, mgkg, crcl, tau);
      near(a, e, t <= 10 ? Math.max(0.005 * e, 0.005) : Math.max(0.03 * e, 0.01), `${mgkg} mg/kg q${tau} t${t}`);
    }));
  });
}
test("EID Ex 4: 5 mg/kg curve points and classification at 14 h", () => {
  [[24, 55, 0, 19.69], [24, 55, 10, 4.1], [24, 55, 14, 2.19], [24, 55, 24, 0.455], [36, 35, 0, 19.94], [36, 35, 10, 6.98], [36, 35, 14, 4.59], [36, 35, 36, 0.455], [48, 25, 0, 20.06], [48, 25, 10, 9.11], [48, 25, 14, 6.64], [48, 25, 48, 0.452]]
    .forEach(([tau, cr, t, e]) => rel(M.nomoCurve(t, 5, cr, tau), e, 0.005, `q${tau} t${t}`));
  assert.equal(M.nomoClassify(2.0, 14, 5), 24);
  assert.equal(M.nomoClassify(2.19, 14, 5), 36, "on the line -> next longer interval");
  assert.equal(M.nomoClassify(5.0, 14, 5), 48);
  assert.equal(M.nomoClassify(7.0, 14, 5), "traditional");
});
test("Hartford nomogram is not shipped as numeric lines (decision 10)", () => {
  assert.ok(!/hartfordLine|hartfordClassify|const HARTFORD/.test(html), "no numeric Hartford lines in the page");
  assert.ok(html.includes("pubmed.ncbi.nlm.nih.gov/7793867"), "note links Nicolau 1995");
});

// ======================= literature-mode cases =======================
const L0 = { model: "literature", htUnit: "in", wtUnit: "kg" };
test("literature CrCl weight: AdjBW above 1.2×IBW, IBW otherwise; SCr floor off; Reichley 0.8 alternative", () => {
  const ob = M.patient({ ...L0, drug: "amik", sex: "M", age: 60, ht: 72, wt: 100, scr: 1 });
  assert.equal(ob.wclBasis, "AdjBW"); near(ob.wcl, 86.56, 1e-9); rel(ob.crcl, (80 * 86.56) / 72, 1e-9);
  const site = M.patient({ ...L0, model: "site", drug: "amik", sex: "M", age: 60, ht: 72, wt: 100, scr: 1 });
  eq(site.crcl, 86.2, "site keeps min(IBW, TBW)");
  const lo = M.patient({ ...L0, drug: "gent", sex: "F", age: 80, ht: 62, wt: 50, scr: 0.5 });
  rel(lo.crcl, (60 * 50 * 0.85) / (72 * 0.5), 1e-9, "TBW < IBW, unfloored SCr");
  rel(lo.crclAlt08, (60 * 50 * 0.85) / (72 * 0.8), 1e-9);
  const nf = M.patient({ ...L0, drug: "gent", sex: "M", age: 50, ht: 70, wt: 80, scr: 1 });
  rel(nf.crclAlt08, nf.crcl, 1e-12, "0.8-floor reference always shown (equal when SCr >= 0.8)"); assert.ok(lo.flags.some((f) => f.code === "lowScrElderly"));
  const fl = M.patient({ ...L0, drug: "gent", sex: "F", age: 80, ht: 62, wt: 50, scr: 0.5, scrFloor: 0.7 });
  rel(fl.crcl, (60 * 50 * 0.85) / (72 * 0.7), 1e-9);
  const t13 = M.patient({ ...L0, drug: "gent", sex: "M", age: 50, ht: 70, wt: 90, scr: 1, obesityRatio: 1.3 });
  assert.equal(t13.wclBasis, "IBW", "90 kg is under 1.3 × 73");
});
test("literature EID default 7 mg/kg gent with model interval; amikacin 15 mg/kg; trough thresholds 0.5 / 1", () => {
  const pt = M.patient({ ...L0, drug: "gent", sex: "M", age: 45, ht: 70, wt: 80, scr: 1 });
  const e = M.eidInitial(pt, { mgPerKg: M.CLS.gt.eidMgKg.literature, tinf: 0.5 });
  assert.equal(e.dose, 530, "7 × 75.8 = 530.6 -> nearest 10 mg"); assert.equal(e.modelTau, 24); assert.equal(e.troughMax, 0.5);
  const f = M.patient({ ...L0, drug: "gent", sex: "F", age: 70, ht: 64, wt: 60, scr: 1.2 });
  const ef = M.eidInitial(f, { mgPerKg: 7, tinf: 0.5 });
  assert.equal(ef.modelTau, 48, "q36 trough above 0.5"); assert.equal(ef.bracketTau, 48);
  const sev = M.patient({ ...L0, drug: "gent", sex: "M", age: 80, ht: 70, wt: 73, scr: 3 });
  assert.equal(M.eidInitial(sev, { mgPerKg: 7, tinf: 0.5 }).modelTau, "traditional");
  const a = M.patient({ ...L0, drug: "amik", sex: "M", age: 45, ht: 70, wt: 80, scr: 1 });
  const ea = M.eidInitial(a, { mgPerKg: 15, tinf: 0.5 });
  assert.equal(ea.dose, 1125, "15 × 75.8 = 1137 -> nearest 25 mg"); assert.equal(ea.troughMax, 2.5, "Abdul-Aziz 2020: amikacin EID trough < 2.5");
  assert.equal(M.eidInitial(a, { mgPerKg: 15, tinf: 0.5, troughMax: M.CLS.amik.eidTroughStrict }).troughMax, 1, "strict option");
  const icu = M.eidInitial(a, { mgPerKg: 25, tinf: 0.5 });
  assert.equal(icu.dose, 1900, "25 × 75.8 = 1895 -> nearest 25 mg"); assert.ok(M.CLS.amik.eidChoices.includes(25) && M.CLS.amik.eidChoices.includes(30));
  assert.equal(M.CLS.amik.eidTroughMax.site, 1, "site unchanged"); assert.equal(M.CLS.gt.eidTroughMax.site, 0.3);
  assert.equal(M.eidBracket(60), 24); assert.equal(M.eidBracket(59.9), 36); assert.equal(M.eidBracket(40), 36); assert.equal(M.eidBracket(30), 48); assert.equal(M.eidBracket(29.9), "traditional"); assert.equal(M.eidBracket(25, 20), 48);
});
test("literature EID level fit gives both forms and an interval", () => {
  const pt = M.patient({ ...L0, drug: "gent", sex: "M", age: 45, ht: 70, wt: 80, scr: 1 });
  const o = M.eidLevel(pt, { dose: 360, tau: 24, tinf: 0.5, level: 1.5, tLevel: 14.5, form: "first", mgPerKg: 5 });
  rel(o.Kfirst, 0.17819, 5e-4); rel(o.Kss, 0.17915, 5e-4); near(o.K, o.Kfirst, 1e-12); assert.equal(o.tau, 24);
  assert.equal(o.siteChart, 24); assert.equal(o.hartford, undefined);
  assert.ok(M.eidLevel(pt, { dose: 360, tau: 24, tinf: 0.5, level: 1.5, tLevel: 0.3 }).error, "level during infusion rejected");
});
test("literature traditional: amikacin MD by interval (7.5 mg/kg q12h, 5 mg/kg q8h), gent 1.5 mg/kg, snapping", () => {
  assert.equal(M.tradMgKgFor("amik", 12, "literature"), 7.5); assert.equal(M.tradMgKgFor("amik", 8, "literature"), 5);
  assert.equal(M.tradMgKgFor("amik", 8, "site"), 7.5); assert.equal(M.tradMgKgFor("gent", 8, "literature"), 1.5);
  const pt = M.patient({ ...L0, drug: "amik", sex: "M", age: 30, ht: 70, wt: 73, scr: 0.8 });
  const q8 = M.tradInitial(pt, { tinf: 0.5, peak: 25, trough: 5, tau: 8 });
  assert.equal(q8.labelDose, 375, "5 × 73 = 365 -> nearest 25"); near(q8.daily, (375 * 3) / 73, 1e-9);
  const q12 = M.tradInitial(pt, { tinf: 0.5, peak: 25, trough: 5, tau: 12 });
  assert.equal(q12.labelDose, 550, "7.5 × 73 = 547.5 -> 550");
  const g = M.patient({ ...L0, drug: "gent", sex: "M", age: 50, ht: 70, wt: 80, scr: 1 });
  const t = M.tradInitial(g, { tinf: 0.5, peak: 8, trough: 1, snap: "up" });
  rel(t.tauRaw, 8.78, 0.005); assert.equal(t.tau, 12);
  assert.equal(M.tradInitial(g, { tinf: 0.5, peak: 8, trough: 1, snap: "nearest" }).tau, 8);
  assert.equal(t.labelDose, 110); assert.equal(t.ldLabel, 150, "2 mg/kg × 75.8 -> 150");
  const tg = M.tradTargets("gent", "pneumonia", "literature", 2);
  assert.equal(tg.peak, 10); assert.equal(tg.trough, 1); assert.ok(tg.flags.length, "10 × MIC 2 above max peak 10");
  assert.equal(M.tradTargets("gent", "sepsis", "site").trough, 1.5);
  // Approved bands (decisions §9): synergy 3-4, moderate 6-8, UTI 4-6; amikacin serious 25-30, moderate 20-25; troughs < 1 / < 5.
  near(M.tradTargets("gent", "synergy", "literature").peak, 3.5, 1e-9); near(M.tradTargets("gent", "systemic", "literature").peak, 7, 1e-9);
  near(M.tradTargets("gent", "uti", "literature").peak, 5, 1e-9); near(M.tradTargets("amik", "systemic", "literature").peak, 27.5, 1e-9);
  near(M.tradTargets("amik", "moderate", "literature").peak, 22.5, 1e-9); assert.equal(M.tradTargets("amik", "systemic", "literature").trough, 5);
  // Alert levels: traditional > 2 (gent) / > 10 (amik) and EID >= 1 / >= 5 are critical.
  assert.equal(M.levelFlags("gent", { cmax: 8, cmin: 1.5 }, "trad", "literature")[0].lvl, "warn");
  assert.equal(M.levelFlags("gent", { cmax: 8, cmin: 2.5 }, "trad", "literature")[0].lvl, "crit");
  assert.equal(M.levelFlags("amik", { cmax: 25, cmin: 11 }, "trad", "literature")[0].lvl, "crit");
  assert.equal(M.levelFlags("amik", { cmax: 60, cmin: 2 }, "eid", "literature").length, 0, "amikacin EID 2 < 2.5");
  assert.equal(M.levelFlags("amik", { cmax: 60, cmin: 2 }, "eid", "site").length, 1, "site < 1");
  assert.equal(M.levelFlags("gent", { cmax: 25, cmin: 1.2 }, "eid", "literature")[0].lvl, "crit");
});
test("Bayesian MAP: exact data at the prior returns the prior; LS recovers truth; MAP shrinks toward prior", () => {
  const pt = M.patient({ ...L0, drug: "gent", sex: "M", age: 50, ht: 70, wt: 80, scr: 1 });
  const doses = [0, 8, 16, 24].map((t) => ({ t, dose: 120, tinf: 0.5 }));
  const sim = (K, V, t) => PK.one.superpose(t, doses, { V, k: K });
  const a = M.bayesFit(pt, { doses, levels: [{ t: 25, c: sim(pt.K, pt.Vd, 25) }, { t: 31.5, c: sim(pt.K, pt.Vd, 31.5) }] });
  rel(a.K, pt.K, 1e-3); rel(a.V, pt.Vd, 1e-3);
  const Kt = 0.18, Vt = 22;
  const lv = [{ t: 25, c: sim(Kt, Vt, 25) }, { t: 31.5, c: sim(Kt, Vt, 31.5) }];
  const b = M.bayesFit(pt, { doses, levels: lv, mic: 1, target: { mode: "trad", peak: 8, trough: 1, tinf: 0.5 } });
  rel(b.ls.params.K, Kt, 1e-3); rel(b.ls.params.V, Vt, 1e-3);
  assert.ok(b.K < pt.K && b.K >= Kt - 1e-6, "MAP K between truth and prior");
  rel(b.cur.auc24, (120 / (b.K * b.V)) * 3, 1e-9, "AUC24 = Dose/CL·24/τ"); rel(b.cmaxMic, b.cur.cmax, 1e-12);
  assert.equal(b.tau, 8); assert.ok(b.plan.dose > 0 && b.plan.tau >= 8);
  const e = M.bayesFit(pt, { doses: [{ t: 0, dose: 530, tinf: 0.5 }], levels: [{ t: 1.5, c: 22 }, { t: 10, c: 4 }], target: { mode: "eid", peak: 25, trough: 0.5, tinf: 0.5 } });
  assert.ok(e.plan.tau === 24 || e.plan.tau === 36 || e.plan.tau === 48 || e.plan.tau === "traditional");
  const auc = M.regimenForTarget("gent", 0.2, 20, { mode: "auc", auc: 100, tau: 24, tinf: 0.5 });
  rel(auc.exact, 100 * 0.2 * 20, 1e-9);
  assert.ok(M.bayesFit(pt, { doses, levels: [] }).error);
});
test("CLSI 2023 breakpoints", () => {
  assert.equal(M.breakpoint("gent", "entero", 2).cat, "S"); assert.equal(M.breakpoint("gent", "entero", 4).cat, "I"); assert.equal(M.breakpoint("tobra", "entero", 8).cat, "R");
  assert.equal(M.breakpoint("amik", "entero", 4).cat, "S"); assert.equal(M.breakpoint("amik", "entero", 16).cat, "R");
  assert.equal(M.breakpoint("tobra", "pseudo", 1).cat, "S"); assert.equal(M.breakpoint("tobra", "pseudo", 4).cat, "R");
  const g = M.breakpoint("gent", "pseudo", 1); assert.equal(g.cat, null); assert.ok(g.notes.some((n) => /removed gentamicin/.test(n.text)));
  assert.ok(M.breakpoint("amik", "pseudo", 8).notes.some((n) => /urinary isolates only/.test(n.text)));
});

// ======================= Workbook model (Excel K_VD fitting workbook) =======================
// Source: workbook-checks/vancomycin-aminoglycosides.md §1, §4.2, §4.6, W5. The workbook was saved as a blank template, so
// patient rows are values from the check's independent re-implementation of the cell formulas (wbref.js), hard-coded here.
// The Pediatric Info sheet values ARE cached workbook values. Nothing here reads site-mirror.
const WB0 = { model: "workbook", htUnit: "in", wtUnit: "kg", scrHours: 24 };
const wbPt = (drug, sex, age, ht, wt, scr, scrPrev, hours, lowFloor) =>
  M.patient({ ...WB0, drug, sex, age, ht, wt, scr, scrPrev: scrPrev ?? scr, changing: scrPrev != null, scrHours: hours ?? 24, lowFloor });

// Cached Pediatric Info sheet: Lener/Peck/Brown/Perlin LBW (kg) by height (cm), females and males (32 values).
const PECK_F = [[86, 12.492228958451628], [94.5, 14.435519583994061], [101, 16.056094406887606], [107.5, 17.880239616709005], [115, 20.341032713657576], [121.5, 22.871574698620403], [127.5, 25.607175630495128], [133, 28.506410377183144], [138, 31.508594770367242], [144, 35.62411642507553], [151, 41.211159912437395], [157, 46.74437917856098], [160.5, 50.315648656535664], [162, 51.927636820076216], [162.5, 52.47608873891907], [163, 53.030161768136146]];
const PECK_M = [[87.5, 12.811110586457943], [96, 14.91729232710076], [102, 16.53265045681488], [109, 18.6217640599705], [115, 20.640746305522683], [122, 23.327682396198718], [127.5, 25.73474804719025], [133.5, 28.7032686292565], [138.5, 31.482603422625406], [143.5, 34.56833846283211], [149, 38.34855285785734], [156, 43.79920481390356], [163.5, 50.51174637398578], [170, 57.127767989211684], [173.5, 61.01925667712381], [175, 62.760625542417905]];
test("workbook: Peck LBW reproduces the 32 cached Pediatric Info values (÷ 2.2)", () => {
  for (const [sex, rows] of [["F", PECK_F], ["M", PECK_M]]) for (const [cm, kg] of rows) {
    const r = M.wbLBW(sex, 10, cm / 2.54, 200);
    assert.equal(r.basis, "Peck LBW"); rel(r.lbw, kg, 1e-9, `${sex} ${cm} cm`);
  }
  assert.equal(M.wbLBW("M", 1, 20, 9).lbw, 9, "under 22 in: TBW");
  eq(M.wbLBW("M", 18, 70, 80).lbw, 73, "adult: Devine");
  assert.equal(M.wbLBW("M", 30, 46, 30).basis, "Peck LBW", "adult under 48 in: Peck");
});
test("workbook: pediatric K table (cached Pediatric Info rows) gives the K equations used", () => {
  // Cached rows: Children Cl 0.1 L/h/kg, Vd 0.35 → slope 0.002278809523809524, int 0.012257142857142859;
  // Adolescents Cl 0.09, Vd 0.3 → slope 0.00239275, int 0.01287; Adult Cl 0.0815, Vd 0.25 → 0.0026001216666666663, 0.0139854.
  const rows = [["child", 0.002278809523809524, 0.012257142857142859], ["adol", 0.00239275, 0.01287], ["adult", 0.0026001216666666663, 0.0139854]];
  for (const [g, slope, int] of rows) { near(M.WB.kEq[g].a, slope, 6e-7, g); near(M.WB.kEq[g].b, int, 2e-5, g); }
  eq(M.WB.kEq.child.a, 0.002279); eq(M.WB.kEq.child.b, 0.012257); eq(M.WB.kEq.adol.a, 0.002393); eq(M.WB.kEq.adol.b, 0.01287);
  eq(M.WB.vdPerKg.child, 0.35); eq(M.WB.vdPerKg.adol, 0.3); eq(M.WB.vdPerKg.adult, 0.25);
  assert.equal(wbPt("gent", "M", 13, 60, 40, 0.6).ageGroup, "child"); assert.equal(wbPt("gent", "M", 14, 60, 40, 0.6).ageGroup, "adol");
  assert.equal(wbPt("gent", "M", 18, 70, 70, 1).ageGroup, "adol"); assert.equal(wbPt("gent", "M", 19, 70, 70, 1).ageGroup, "adult");
});

// [id, drug, kind, sex, age, ht in, wt kg, scr, scrPrev, hours, lowFloor, re-implemented workbook values]
// tau: traditional = unrounded ln(ratio)/K + 0.5; pulse = snapped 24/36/48; "trad" = workbook falls back to traditional.
const WBROWS = [
  ["s01", "gent", "trad", "M", 50, 70, 80, 1, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 91.25, K: 0.25125, LD: 161.3216973, tau: 7.631380972, md: 113.7 }],
  ["s04", "gent", "trad", "M", 50, 70, 80, 0.5, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 130.3571429, K: 0.3529285714, LD: 165.3691863, tau: 5.576833145, md: 113.7 }],
  ["s04low", "gent", "trad", "M", 50, 70, 80, 0.5, null, null, true, { lbw: 73, dw: 75.8, V: 18.95, crcl: 182.5, K: 0.4885, LD: 170.8670819, tau: 4.167880183, md: 113.7 }],
  ["s05", "gent", "trad", "M", 80, 70, 80, 4, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 15.20833333, K: 0.05354166667, LD: 153.6382831, tau: 33.9647683, md: 113.7 }],
  ["s06", "gent", "trad", "F", 50, 70, 80, 1, null, null, false, { lbw: 68.5, dw: 73.1, V: 18.275, crcl: 72.78125, K: 0.20323125, LD: 153.7538824, tau: 9.316358061, md: 109.65 }],
  ["s08", "amik", "trad", "F", 70, 64, 60, 1.4, null, null, false, { lbw: 54.7, dw: 56.82, V: 14.205, crcl: 32.28819444, K: 0.09794930556, LD: 436.6704481, tau: 28.14746708, md: 426.15 }],
  ["s15", "gent", "trad", "M", 80, 70, 80, 20, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 5, K: 0.027, LD: 152.6256024, tau: 66.86146182, md: 113.7 }],
  ["F80", "gent", "trad", "F", 80, 64, 60, 0.5, null, null, false, { lbw: 54.7, dw: 56.82, V: 14.205, crcl: 55.35119048, K: 0.1579130952, LD: 118.1853422, tau: 11.84649072, md: 85.23 }],
  ["chiou", "gent", "trad", "M", 60, 70, 73, 2, 1, 24, false, { lbw: 73, dw: 73, V: 18.25, crcl: 31.96368582, K: 0.09710558314, LD: 149.573034, tau: 18.95166273, md: 109.5 }],
  ["p45", "gent", "pulse", "M", 45, 70, 80, 1, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 96.31944444, K: 0.2644305556, LD: null, tau: 24, md: 379 }],
  ["p60", "gent", "pulse", "M", 60, 70, 80, 1.5, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 54.07407407, K: 0.1545925926, LD: null, tau: 36, md: 379 }],
  ["p80", "gent", "pulse", "M", 80, 70, 80, 2.4, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 25.34722222, K: 0.07990277778, LD: null, tau: "trad", md: 113.7 }],
  ["p70", "gent", "pulse", "M", 70, 70, 80, 1.9, null, null, false, { lbw: 73, dw: 75.8, V: 18.95, crcl: 37.35380117, K: 0.111119883, LD: null, tau: 48, md: 379 }],
  ["pa", "amik", "pulse", "F", 40, 65, 70, 0.8, null, null, false, { lbw: 57, dw: 62.2, V: 15.55, crcl: 84.11458333, K: 0.2326979167, LD: null, tau: 24, md: 933 }],
  ["child10", "gent", "pulse", "M", 10, 54, 32, 0.5, null, null, false, { lbw: 30.70879956, dw: 31.22527974, V: 10.92884791, crcl: 150.876, K: 0.356103404, LD: null, tau: 24, md: 234.189598 }],
  ["child8t", "gent", "trad", "F", 8, 50, 25, 0.4, null, null, false, { lbw: 25, dw: 25, V: 8.75, crcl: 174.625, K: 0.410227375, LD: 77.42422496, tau: 4.867722825, md: 37.5 }],
  ["adol15", "amik", "pulse", "F", 15, 63, 55, 0.6, null, null, false, { lbw: 49.81027045, dw: 51.88616227, V: 15.56584868, crcl: 146.685, K: 0.363887205, LD: null, tau: 24, md: 1037.723245 }],
  ["adol16t", "tobra", "trad", "M", 16, 68, 60, 0.7, null, null, false, { lbw: 60, dw: 60, V: 18, crcl: 172.72, K: 0.42618896, LD: 159.8873017, tau: 4.70414332, md: 90 }],
];
for (const [id, drug, kind, sex, age, ht, wt, scr, scrPrev, hours, lowFloor, e] of WBROWS) {
  test(`workbook population ${id} (${drug} ${kind}) matches the re-implemented workbook (1e-8)`, () => {
    const pt = wbPt(drug, sex, age, ht, wt, scr, scrPrev, hours, lowFloor);
    const r = M.wbRegimen(pt, { kind, tinf: 0.5 });
    const R = 1e-8;
    rel(pt.lbwSite, e.lbw, R, "LBW"); rel(pt.dw, e.dw, R, "DW"); rel(pt.Vd, e.V, R, "Vd"); rel(pt.crcl, e.crcl, R, "CrCl"); rel(pt.K, e.K, R, "K"); rel(r.mdExact, e.md, R, "MD");
    if (kind === "trad") { rel(r.tauRaw, e.tau, R, "tau raw"); rel(r.LD, e.LD, R, "LD"); }
    else if (e.tau === "trad") { assert.equal(r.kind, "trad"); assert.ok(r.fellBack); rel(r.LD, PK.one.loadingDoseInfusion({ cTarget: 8, tinf: 0.5 }, { V: e.V, k: e.K }), R, "fallback LD"); }
    else { assert.equal(r.kind, "pulse"); assert.equal(r.tauCalc, e.tau); assert.equal(r.LD, undefined); }
  });
}
test("workbook: SCr floor (0.7, 0.5 low floor, none under 18); Site model unchanged", () => {
  const s04 = wbPt("gent", "M", 50, 70, 80, 0.5);
  eq(s04.scr, 0.7); assert.ok(s04.flags.some((x) => x.code === "wbFloor"));
  const site = M.patient({ model: "site", drug: "gent", sex: "M", age: 50, ht: 70, htUnit: "in", wt: 80, wtUnit: "kg", scr: 0.5 });
  assert.equal(site.crcl, 182.5, "Site model: no floor");
  eq(wbPt("gent", "M", 50, 70, 80, 0.5, null, null, true).scr, 0.5);
  eq(wbPt("gent", "M", 10, 54, 32, 0.3).scr, 0.3, "no floor under 18");
  const ch = wbPt("gent", "M", 60, 70, 73, 1, 0.5, 24); eq(ch.scrPrev, 0.7); eq(ch.scr, 1);
});
test("workbook: Chiou CrCl bounds 5–244 mL/min; equal SCrs give Cockcroft-Gault", () => {
  const lo = wbPt("gent", "M", 80, 70, 80, 20); rel(lo.crcl, 5, 1e-12); assert.equal(lo.clBound, "low");
  const mid = wbPt("gent", "M", 20, 70, 80, 0.7); assert.equal(mid.clBound, null);
  rel(mid.crcl, PK.renal.cgRaw(20, 73, 0.7, "M"), 1e-9);
  const big = wbPt("gent", "M", 10, 60, 40, 0.1); rel(big.crcl, 244, 1e-12); assert.equal(big.clBound, "high");
  rel(M.wbChiou(5, 1, 1, 24, 40).clLh, 0.5, 1e-9);
});
test("workbook: pulse snap is strict '<'; traditional at K ≤ ln(20/0.3)/47.5; pediatric pulse mg/kg", () => {
  const pt = wbPt("gent", "M", 45, 70, 80, 1);
  eq(M.wbRegimen(pt, { kind: "pulse", tinf: 0.5 }).kBreak, Math.log(20 / 0.3) / 47.5);
  near(Math.log(20 / 0.3) / 47.5, 0.08843, 3e-5); // the check report rounds 0.088415 to 0.08843
  // Calculated interval just at 24 h: strict "<" gives 36 (the Site rule "≤ 24" would give 24).
  assert.equal(M.wbRegimen({ ...pt, K: Math.log(20 / 0.3) / 23.5 }, { kind: "pulse", tinf: 0.5 }).tauCalc, 36);
  assert.equal(M.wbRegimen({ ...wbPt("amik", "F", 40, 65, 70, 0.8), K: Math.log(60 / 0.9) / 35.5 }, { kind: "pulse", tinf: 0.5 }).tauCalc, 48);
  assert.equal(M.wbRegimen(wbPt("gent", "M", 18, 70, 70, 1), { kind: "pulse", tinf: 0.5 }).mgkg, 7.5);
  assert.equal(M.wbRegimen(wbPt("amik", "F", 15, 63, 55, 0.6), { kind: "pulse", tinf: 0.5 }).mgkg, 20);
  assert.equal(M.wbRegimen(wbPt("tobra", "M", 19, 70, 70, 1), { kind: "pulse", tinf: 0.5 }).mgkg, 5);
});
test("workbook: steady-state prediction and trapezoid-log AUC24 (C37–C39)", () => {
  const pt = wbPt("gent", "M", 50, 70, 80, 1);
  const r = M.wbRegimen(pt, { kind: "trad", tinf: 0.5, dose: 120, tau: 8 });
  const K = pt.K, V = pt.Vd, T = 0.5;
  const peak = (120 * (1 - Math.exp(-K * T))) / (V * K * T * (1 - Math.exp(-K * 8))), trough = peak * Math.exp(-K * 7.5);
  rel(r.pred.cmax, peak, 1e-12); rel(r.pred.cmin, trough, 1e-12);
  rel(r.pred.aucTrap, ((peak + trough) * (T / 2) + (peak - trough) / K) * (24 / 8), 1e-12);
  assert.equal(r.dose, 120); assert.equal(r.tau, 8);
});
test("workbook: Bayesian K & Vd and K-only fits match the re-implemented workbook Solver (F60; F53 least squares)", () => {
  // Gentamicin 120 mg q8h × 3, T′ 0.5 h, M 50 y 70 in 80 kg SCr 1 (workbook-checks §4.6). Values from wbref.js wbFit.
  const pt = wbPt("gent", "M", 50, 70, 80, 1);
  const doses = [0, 8, 16].map((t) => ({ t, dose: 120, tinf: 0.5 }));
  const A = [{ t: 17, c: 7.0 }, { t: 23.5, c: 1.4 }], B = [{ t: 7.5, c: 0.9 }, ...A], C1 = [{ t: 23.5, c: 1.4 }];
  const cases = [
    [A, true, 0.245273, 16.78160, 0.247606, 16.48304], [A, false, 0.229334, 18.95, 0.206170, 18.95],
    [B, true, 0.267456, 16.69791, 0.264855, 15.96977], [B, false, 0.249669, 18.95, 0.215063, 18.95],
    [C1, true, 0.235257, 18.37405], [C1, false, 0.231757, 18.95],
  ];
  for (const [levels, fitV, K, V, lsK, lsV] of cases) {
    const o = M.bayesFit(pt, { doses, levels, ...M.wbFitOptions(pt, fitV) });
    rel(o.K, K, 2e-5, `MAP K fitV ${fitV}`); rel(o.V, V, 2e-5, `MAP V fitV ${fitV}`);
    if (lsK) { rel(o.ls.params.K, lsK, 2e-5, "LS K"); rel(o.ls.params.V, lsV, 2e-5, "LS V"); }
  }
});
test("workbook: Solver bounds K 0.1–10× and Vd 0.5–2× population; other models unbounded", () => {
  const pt = wbPt("gent", "M", 50, 70, 80, 1);
  const doses = [0, 8, 16].map((t) => ({ t, dose: 120, tinf: 0.5 }));
  const lv = [{ t: 23.5, c: 0.01 }, { t: 17, c: 0.05 }];
  const o = M.bayesFit(pt, { doses, levels: lv, ...M.wbFitOptions(pt, true) });
  rel(o.ls.params.K, 10 * pt.K, 1e-9); rel(o.ls.params.V, 2 * pt.Vd, 1e-9); assert.deepEqual(Object.keys(o.ls.atBound).sort(), ["K", "V"]);
  assert.ok(o.K <= 10 * pt.K + 1e-9 && o.V <= 2 * pt.Vd + 1e-9 && o.K >= 0.1 * pt.K - 1e-9 && o.V >= 0.5 * pt.Vd - 1e-9);
  assert.equal(M.bayesFit(pt, { doses, levels: lv }).map.atBound, undefined);
});
test("workbook: a level during an infusion uses the infusion equation (post-infusion bug not copied)", () => {
  const pt = wbPt("gent", "M", 50, 70, 80, 1);
  const o = M.bayesFit(pt, { doses: [{ t: 0, dose: 120, tinf: 1 }], levels: [{ t: 0.5, c: 3 }, { t: 6, c: 2 }], ...M.wbFitOptions(pt, true) });
  rel(o.predictions.find((x) => x.t === 0.5).pred, PK.one.infusion(0.5, 120, 1, { V: o.V, k: o.K }), 1e-12);
  assert.ok(o.flags.some((x) => /during an infusion/.test(x.text)));
});
test("workbook: pediatric flags and targets; adult-only flag kept in Literature", () => {
  const c = wbPt("gent", "M", 10, 54, 32, 0.5);
  assert.ok(c.flags.some((x) => x.code === "wbPeds")); assert.ok(!c.flags.some((x) => x.code === "age"));
  assert.ok(wbPt("gent", "M", 0.5, 26, 7, 0.3).flags.some((x) => x.code === "wbInfant"));
  assert.ok(M.patient({ model: "literature", drug: "gent", sex: "M", age: 10, ht: 54, htUnit: "in", wt: 32, wtUnit: "kg", scr: 0.5 }).flags.some((x) => x.code === "age"));
  assert.deepEqual(M.wbTargets("amik", "eid"), { peak: 60, trough: 0.9 }); assert.deepEqual(M.wbTargets("gent", "trad"), { peak: 6, trough: 1 });
});

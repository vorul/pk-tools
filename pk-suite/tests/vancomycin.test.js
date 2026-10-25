// Tests for pk-suite/vancomycin.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js, then the page's CALC-START/CALC-END block via new Function (same pattern as ../../phenytoin/tests/calc.test.js).
// Sources: specs/vanco-auc.md (live-server regression rows: exact display values; §8 worked examples ±0.5%),
// specs/vanco-bayesian.md §9.2 (±3 mg·h/L) and §9.3, specs/bayesian-engine.md TC-1/TC-2 (tolerances as tests/pkcore.test.js),
// specs/two-comp-auc.md TC1/TC2 (±0.5%), lit/vancomycin.md (literature mode).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "vancomycin.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function("PK", `${block}; return { R, SITE, LIT, GOTI, siteCalc, solveKSS, popChartRow, covariates, popModel, predictSS,
  doseForAuc, aucRegimen, litLoadingDose, initialCalc, twoLevelCalc, troughOnlyCalc, bayesCalc, mapPred, levelKinds, clinicalFlags, orderText, regimenEvents, profile,
  WB, CARRENO, MODELS, wbRenal, wbPop, wbSS, wbInitialCalc, wbBayesCalc, aucWbCalc, boxMin };`)(PK);

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
const rel = (actual, expected, r, msg) => near(actual, expected, Math.abs(expected) * r, msg);
const P5 = 0.005; // ±0.5% (vanco-auc §8, two-comp-auc §9)

// ======================= site: live-server regression (exact display values) =======================
const B = { sex: "M", age: 60, htIn: 70, wtKg: 80, scr: 1, scrPrev: 1, dtScr: 24, tinf: 2 };
// [id, overrides, dose, tau, level, levelTime, expected {field: value}]
const COLS = ["ibw", "bsa", "crcl", "crT", "K", "tHalf", "Vd", "ld", "doseCalc", "tau", "mgkg", "cmax", "cmin", "ss", "auc", "kFitOut"];
const ROWS = [
  ["v01", {}, 1250, 12, 15, 12, [73, 1.98, 81.1, 6.8, 0.081, 8.6, 52, 2253, 1200, 12, 15.6, 35.7, 15.88, 25.7, 594, 0.0842]],
  ["v02", { age: 20, scr: 0.7, scrPrev: 0.7 }, , , , , [73, 1.98, 173.8, 3.2, 0.1677, 4.1, 52, 2448, 1200, 8]],
  ["v03", { age: 40, scr: 0.8, scrPrev: 0.8 }, , , , , [73, 1.98, 126.7, 4.4, 0.1237, 5.6, 52, 2348, 1200, 8]],
  ["v04", { age: 70, scr: 1.5, scrPrev: 1.5 }, , , , , [73, 1.98, 47.3, 11.7, 0.0494, 14, 52, 2184, 1200, 24]],
  ["v05", { age: 80, scr: 2.5, scrPrev: 2.5 }, , , , , [73, 1.98, 24.3, 22.8, 0.0279, 24.8, 52, 2139, 1200, 36]],
  ["v06", { age: 85, scr: 4, scrPrev: 4 }, , , , , [73, 1.98, 13.9, 39.9, 0.0182, 38.1, 52, 2118, 1200, 48]],
  ["v07", { scr: 1.2, scrPrev: 1.2 }, , , , , [73, 1.98, 67.6, 8.2, 0.0684, 10.1, 52, 2226, 1200, 16]],
  ["v08", { scr: 1.2, scrPrev: 1.2, tinf: 1 }, , , , , [73, 1.98, 67.6, 8.2, 0.0684, 10.1, 52, 2152, 1200, 12]],
  ["v09", { age: 18, scr: 0.6, scrPrev: 0.6 }, , , , , [73, 1.98, 206.2, 2.7, 0.198, 3.5, 52, 2519, 1200, 8]],
  ["v10", { age: 85, scr: 8, scrPrev: 8 }, , , , , [73, 1.98, 7, 79.2, 0.0118, 58.7, 52, 2105, 1200, 72]],
  ["v11", { age: 40, wtKg: 150 }, 2000, 12, , , [73, 2.58, 101.4, 10.3, 0.078, 8.9, 97.5, 4212, 2250, 12, 13.3, 31.2, 14.3, 26.7, 526]],
  ["v12", { sex: "F", age: 70, htIn: 64, wtKg: 60, scr: 1.0, scrPrev: 1.6, dtScr: 48 }, 1000, 24, 12, 20, [54.7, 1.64, 45.9, 9.1, 0.057, 12.2, 39, 1651, 900, 16, 16.7, 32.5, 9.27, 36.5, 450, 0.0559]],
  ["v13", { age: 28, scr: 2.5, scrPrev: 2.5 }, , , , , [73, 1.98, 45.4, 12.2, 0.0477, 14.5, 52, 2181, 1200, 24]],
  ["v15", { kFit: 0.0842 }, 1000, 12, , , [73, 1.98, 81.1, 6.8, 0.0842, 8.2, 52, 2260, 1200, 12, 12.5, 27.8, 11.98, 24.7, 457]],
  ["s17", {}, 1000, 12, , , [73, 1.98, 81.1, 6.8, 0.081, 8.6, 52, 2253, 1200, 12, 12.5, 28.6, 12.72, 25.7, 475]],
  ["s18", {}, 1250, 12, , , [73, 1.98, 81.1, 6.8, 0.081, 8.6, 52, 2253, 1200, 12, 15.6, 35.7, 15.88, 25.7, 594]],
  ["s23", {}, 1250, 12, 15, 12, [73, 1.98, 81.1, 6.8, 0.081, 8.6, 52, 2253, 1200, 12, 15.6, 35.7, 15.88, 25.7, 594, 0.0842]],
  ["s24", { wtKg: 150 }, , , , , [73, 2.58, 81.1, 12.8, 0.0634, 10.9, 97.5, 4152, 2250, 16]],
  ["s25", { age: 80, scr: 2, scrPrev: 2 }, , , , , [73, 1.98, 30.4, 18.2, 0.0336, 20.6, 52, 2151, 1200, 24]],
  ["s31", { scr: 1.7, scrPrev: 1.7 }, , , , , [73, 1.98, 47.7, 11.6, 0.0498, 13.9, 52, 2185, 1200, 24]],
];
for (const [id, o, dose, tau, level, levelTime, exp] of ROWS) {
  test(`site live-server ${id}: every displayed field exact`, () => {
    const r = M.siteCalc({ ...B, ...o, dose, tau, level, levelTime });
    exp.forEach((v, j) => assert.equal(r[COLS[j]], v, `${id} ${COLS[j]}`));
    assert.equal(r.lbw, Math.min(r.ibw, r.kg), "lblDosingWeightCreatinineCLearance = LBW");
  });
}
test("site: v12 Chow uses creatinine Vd 0.6 × TBW (Kc 0.07654); v14 level during infusion flagged; vdPerKg 0.65", () => {
  const r = M.siteCalc({ ...B, sex: "F", age: 70, htIn: 64, wtKg: 60, scr: 1.0, scrPrev: 1.6, dtScr: 48 });
  near(r.kc, 0.07654, 5e-5);
  const v14 = M.siteCalc({ ...B, dose: 1250, tau: 12, level: 20, levelTime: 1 });
  assert.ok(v14.flags.some((f) => f.code === "levelDuringInfusion")); assert.equal(v14.kFitOut, undefined);
  assert.equal(M.siteCalc({ ...B, wtKg: 150 }).vdPerKg, 0.65);
  assert.ok(M.siteCalc({ ...B, age: 40, wtKg: 150 }).flags.some((f) => f.code === "ldOver3g"), "uncapped LD warned");
});
test("site: units cm ÷ 2.54 → 0.1 in, lb ÷ 2.2; SCr rounded to 0.1; banker's rounding", () => {
  const a = M.siteCalc({ ...B, htIn: undefined, htCm: 177.8, wtKg: undefined, wtLb: 176 });
  assert.equal(a.htIn, 70); near(a.kg, 80, 1e-12); assert.equal(a.K, 0.081);
  assert.equal(M.siteCalc({ ...B, scr: 1.04, scrPrev: 1.04 }).crcl, 81.1);
  assert.equal(M.R(4152.5), 4152); assert.equal(M.R(2.5), 2); assert.equal(M.R(3.5), 4); assert.equal(M.R(0.08125, 4), 0.0812); assert.equal(M.R(14.3049, 2), 14.3);
});
test("site interval rule 0.7/K + T′ snapped up (s31 excludes exact ln 2; no 6 h)", () => {
  assert.equal(M.siteCalc({ ...B, scr: 1.7, scrPrev: 1.7 }).tau, 24);
  assert.ok(Math.LN2 / 0.0498 + 2 < 16, "ln 2 would give 16");
  assert.equal(M.siteCalc({ ...B, age: 18, scr: 0.6, scrPrev: 0.6 }).tau, 8);
});
test("site initial regimen tab wraps the server calculator (v01) and adds a closed-form target dose", () => {
  const r = M.initialCalc({ ...B, mode: "site", model: "reg1c", tau: "auto", dose: 1250 });
  assert.equal(r.ld.dose, 2253); assert.equal(r.tau, 12); assert.equal(r.pred.auc, 594); assert.equal(r.pred.peak, 35.7); assert.equal(r.pred.trough, 15.88);
  const t = M.initialCalc({ ...B, mode: "site", model: "reg1c", tau: "auto" });
  near(t.md.exact, (500 * 0.081 * 52 * 12) / 24, 1e-9); assert.equal(t.md.dose, 1000);
});

// ======================= vanco-auc §8 worked examples (equations; ±0.5%) =======================
test("§8 Ex 1 (literature, non-obese): K 0.08108, t½ 8.549, Vd 52, LD 25 mg/kg 2000, predictions table", () => {
  const r = M.initialCalc({ ...B, mode: "literature", model: "reg1c", tau: 12, dose: 1250 });
  rel(r.cov.crclReg, 81.11, P5); near(r.cov.bsa, 1.9787, 1e-4); rel(r.cov.crclNorm, 70.92, P5);
  rel(r.pm.p.k, 0.08108, P5); rel(PK.one.halfLife(r.pm.p.k), 8.549, P5); assert.equal(r.pm.p.V, 52);
  assert.equal(r.ld.dose, 2000);
  rel(PK.one.loadingDoseInfusion({ cTarget: 40, tinf: 2 }, r.pm.p), 2254, P5, "40 mg/L equation form");
  rel(3 * PK.one.halfLife(r.pm.p.k), 25.65, P5, "87.5% SS");
  rel(PK.one.intervalForTargets({ cmax: 30, cmin: 15, k: r.pm.p.k, tinf: 2 }), 10.55, P5);
  rel(PK.one.intervalForTargets({ cmax: 40, cmin: 15, k: r.pm.p.k, tinf: 2 }), 14.1, P5);
  for (const [dose, cmax, cmin, auc, trap] of [[1000, 28.54, 12.69, 474.4, 473.5], [1200, 34.25, 15.22, 569.2, 568.2], [1250, 35.67, 15.86, 593.0, 591.9], [1500, 42.81, 19.03, 711.5, 710.3]]) {
    const s = M.predictSS(r.pm, { dose, tau: 12, tinf: 2 });
    rel(s.peak, cmax, P5); rel(s.trough, cmin, P5); rel(s.auc, auc, P5); rel(s.aucTrap, trap, P5);
  }
});
test("§8 Ex 2 trough-only fit: K 0.08416, Cmax 34.80, Cmin 15.00, AUC 571.3; at 11.5 h K 0.08661", () => {
  const r = M.troughOnlyCalc({ dose: 1250, tau: 12, tinf: 2, level: 15, t: 12, V: 52, newTau: 12, newDose: 1250 });
  rel(r.k, 0.08416, P5); rel(r.current.peak, 34.8, P5); rel(r.current.trough, 15, P5); rel(r.current.auc, 571.3, P5); rel(r.current.aucTrap, 570.2, P5);
  assert.ok(r.flags.some((f) => f.code === "troughOnly"), "labelled less reliable");
  const b = M.troughOnlyCalc({ dose: 1250, tau: 12, tinf: 2, level: 15, t: 11.5, V: 52 });
  rel(b.k, 0.08661, P5); rel(b.current.peak, 34.15, P5); rel(b.current.trough, 14.36, P5); rel(b.current.auc, 555.1, P5);
  assert.ok(M.troughOnlyCalc({ dose: 1250, tau: 12, tinf: 2, level: 20, t: 1, V: 52 }).error, "t < T′ rejected");
  const s = M.troughOnlyCalc({ dose: 1250, tau: 12, tinf: 2, level: 15, t: 12, V: 52, mode: "site", newTau: 12, newDose: 1250 });
  assert.equal(s.site.kFit, 0.0842); assert.equal(s.site.cmax, 34.8); assert.equal(s.site.cmin, 14.99); assert.equal(s.site.auc, 571);
});
test("§8 Ex 3 peak & trough (Sawchuk-Zaske): K 0.12217, Vd 37.64, CL 4.599, AUC 543.6 / 541.4; new regimens", () => {
  const base = { dose: 1250, tau: 12, tinf: 2, peak: 30, tPeak: 2, trough: 12, tTrough: 0.5, tbw: 80, aucTarget: 500, newTau: 12 };
  const r = M.twoLevelCalc(base);
  near(r.dt, 7.5, 1e-12); rel(r.sz.k, 0.12217, P5); rel(r.sz.V, 37.64, P5); rel(r.vkg, 0.4705, P5); rel(r.sz.CL, 4.599, P5);
  rel(r.current.cmax, 38.3, P5); rel(r.current.cmin, 11.29, P5); rel(r.current.auc, 543.6, P5); rel(r.current.aucTrap, 541.4, P5);
  rel(r.md.exact, 1149.7, P5); assert.equal(r.md.dose, 1250);
  for (const [dose, tau, cmax, cmin, auc] of [[1000, 12, 30.64, 9.03, 434.9], [2000, 24, 49.79, 3.39, 434.9], [1750, 24, 43.57, 2.96, 380.5], [1500, 24, 37.34, 2.54, 326.2]]) {
    const s = M.twoLevelCalc({ ...base, newTau: tau, newDose: dose }).pred;
    rel(s.peak, cmax, P5); rel(s.trough, cmin, P5); rel(s.auc, auc, P5);
  }
  const site = M.twoLevelCalc({ ...base, mode: "site", newDose: 1250 }).site;
  assert.equal(site.K, 0.1222); assert.equal(site.Vd, 37.6);
  assert.ok(M.twoLevelCalc({ ...base, tPeak: 0.5 }).flags.some((f) => f.code === "earlyPeak"), "literature: peak < 1 h warned");
  assert.ok(!M.twoLevelCalc({ ...base, tPeak: 1.5 }).flags.some((f) => f.code === "earlyPeak"));
  assert.ok(M.twoLevelCalc({ ...base, tPeak: 1.5, mode: "site" }).flags.some((f) => f.code === "earlyPeak"), "site: < 2 h warned");
  assert.ok(M.twoLevelCalc({ ...base, peak: 10 }).error, "peak ≤ trough rejected");
  assert.ok(M.twoLevelCalc({ ...base, tPeak: 6, tTrough: 4 }).error, "Δt ≤ 0 rejected");
});
test("§8 Ex 4 changing SCr (literature Chow, equations): CrCl 45.71, CrCl_norm 48.19, K 0.05677", () => {
  // Spec Ex 4 equations use creatinine Vd 0.6 × W_crcl (the suite Chow); the site uses 0.6 × TBW (tested in v12).
  const c = M.covariates({ sex: "F", age: 70, htIn: 64, wtKg: 60, scr: 1.0, scrPrev: 1.6, dtScr: 48 });
  assert.equal(c.changing, true); rel(c.crclReg, 45.71, P5); rel(c.crclNorm, 48.19, P5);
  const pm = M.popModel(c, "reg1c", "literature");
  rel(pm.p.k, 0.05677, P5); assert.equal(pm.p.V, 39);
  const s = M.predictSS(pm, { dose: 1000, tau: 24, tinf: 2 });
  rel(s.peak, 32.58, P5); rel(s.trough, 9.35, P5); rel(s.auc, 451.7, P5);
});

// ======================= vanco-bayesian §9 =======================
const P70 = { sex: "M", age: 70, htIn: 70, wtKg: 70, scr: 1.5 };
test("vanco-bayesian §3.1 reference patient: site prior CL 2.2806, Vd 45.5; AUC 1500 q24 = 658", () => {
  const pm = M.popModel(M.covariates(P70), "reg1c", "site");
  near(pm.p.V, 45.5, 1e-9); near(pm.p.CL, 2.2806, 1e-4); near(pm.p.k, 0.05012, 1e-5);
  near(M.predictSS(pm, { dose: 1500, tau: 24, tinf: 2 }).auc, 658, 0.5);
  const s1 = M.popModel(M.covariates({ ...P70, scr: 1.0 }), "reg1c", "site");
  near(s1.p.k, 0.07258, 1e-5); near(s1.p.CL, 3.3026, 1e-4);
});
test("vanco-bayesian §9.2: 5 serial non-SS troughs, cumulative site MAP (AUC ±3 of spec, Vd ±0.05)", () => {
  const doses = PK.one.regimen({ dose: 1500, tau: 24, n: 5, tinf: 2 });
  const tr = [1, 2, 3, 4, 5].map((i) => PK.one.superpose(24 * i - 1e-9, doses, { V: 45.5, CL: (0.63 * 1500) / 658 }));
  assert.deepEqual(tr.map((x) => PK.round.truncate(x, 1)), [15.9, 23.4, 26.9, 28.5, 29.3]);
  const expected = { "0.3/both": [804, 911, 963, 988, 1002], "0.3/CL": [804, 910, 963, 990, 1005], "0.2/both": [894, 977, 1007, 1019, 1025],
    "0.1/CL": [997, 1026, 1035, 1038, 1040], "0.1/both": [985, 1024, 1035, 1038, 1039] };
  const vds = { "0.3/both": [45.1, 45.3, 45.8, 46.2, 46.5], "0.1/both": [43.0, 44.6, 45.4, 45.7, 45.9] };
  for (const [key, aucs] of Object.entries(expected)) {
    const [cv, mask] = key.split("/");
    for (let n = 1; n <= 5; n++) {
      const r = M.bayesCalc({ ...P70, mode: "site", model: "reg1c", doses, cvAssay: +cv, fitMask: mask, levels: tr.slice(0, n).map((c, j) => ({ t: 24 * (j + 1) - 1e-9, c })) });
      near(1500 / r.params.CL, aucs[n - 1], 3, `${key} n=${n}`);
      near(r.current.auc, 1500 / r.params.CL, 1e-6, "current-regimen SS AUC");
      if (vds[key]) near(r.params.V, vds[key][n - 1], 0.051, `${key} n=${n} Vd`);
    }
  }
  const auto = M.bayesCalc({ ...P70, mode: "site", model: "reg1c", doses, levels: tr.map((c, j) => ({ t: 24 * (j + 1) - 1e-9, c })) });
  assert.equal(auto.mask, "CL", "troughs only → CL fitted, Vd held");
  assert.ok(auto.kinds.every((k) => k.kind === "trough"));
});
test("vanco-bayesian §9.3 population chart (CrCl 120 … 0, T′ 2): K, t½, LD, τ, MD, AUC", () => {
  const SITE_V = M.SITE.vdPerKg;
  const crcl = [120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
  const K = [0.1336, 0.1229, 0.1122, 0.1015, 0.0908, 0.0801, 0.0694, 0.0587, 0.048, 0.0373, 0.0266, 0.0159, 0.0052];
  const th = [5.2, 5.6, 6.2, 6.8, 7.6, 8.7, 10.0, 11.8, 14.4, 18.6, 26.1, 43.6, 133.3];
  const ld40 = [29.6, 29.3, 29.0, 28.7, 28.4, 28.1, 27.8, 27.6, 27.3, 27.0, 26.7, 26.4, 26.1];
  const ld30 = [22.2, 22.0, 21.8, 21.5, 21.3, 21.1, 20.9, 20.7, 20.5, 20.2, 20.0, 19.8, 19.6];
  const rows = {
    "40/15": { tau: [9, 10, 11, 12, 13, 14, 16, 19, 22, 28, 39, 64, 191], md: [21.1, 20.7, 20.3, 19.9, 19.5, 19.1, 18.8, 18.4, 18.0, 17.6, 17.2, 16.8, 16.4], auc: [622, 621, 621, 620, 619, 619, 618, 617, 616, 615, 614, 613, 612] },
    "30/20": { tau: [5, 5, 6, 6, 7, 7, 8, 9, 10, 13, 17, 28, 80], md: [10.9, 10.5, 10.2, 9.8, 9.5, 9.1, 8.8, 8.4, 8.1, 7.7, 7.4, 7.0, 6.7], auc: [595, 595, 595, 595, 594, 594, 594, 594, 593, 593, 593, 593, 592] },
    "30/15": { tau: [7, 8, 8, 9, 10, 11, 12, 14, 16, 21, 28, 46, 135], md: [11.6, 11.3, 11.1, 10.8, 10.5, 10.3, 10.0, 9.7, 9.4, 9.2, 8.9, 8.6, 8.4], auc: [525, 525, 524, 524, 524, 523, 523, 522, 522, 521, 520, 520, 520] },
    "30/10": { tau: [10, 11, 12, 13, 14, 16, 18, 21, 25, 31, 43, 71, 213], md: [16.6, 16.3, 16.0, 15.7, 15.4, 15.1, 14.8, 14.5, 14.3, 14.0, 13.7, 13.4, 13.1], auc: [445, 445, 444, 444, 443, 442, 442, 441, 440, 440, 439, 438, 437] },
  };
  crcl.forEach((c, j) => {
    const q = M.popChartRow(c, 2, 30, 15);
    near(q.k, K[j], 5e-5, `K ${c}`); near(q.tHalf, th[j], 0.051, `t½ ${c}`);
    near(q.ldPerKg(40), ld40[j], 0.051, `LD40 ${c}`); near(q.ldPerKg(30), ld30[j], 0.051, `LD30 ${c}`);
    for (const [pair, e] of Object.entries(rows)) {
      const [a, b] = pair.split("/").map(Number), r = M.popChartRow(c, 2, a, b);
      near(r.tau, e.tau[j], 0.55, /* chart integers; 30/20 @80 shows 7 for 6.47 */ `τ ${pair} ${c}`); near(r.auc, e.auc[j], 0.9, `AUC ${pair} ${c}`);
      // The chart's MD 30/15 row is inconsistent with its own AUC row (11.6 mg/kg at K 0.1336, τ 7.19 gives AUC 446, not 525):
      // it is ~0.846 × the AUC-consistent value at every CrCl. Check MD = AUC·CL·τ/24 there instead (chart transcription discrepancy).
      if (pair === "30/15") near(r.mdPerKg, (e.auc[j] * SITE_V * r.k * r.tau) / 24, 0.1, `MD 30/15 consistent with AUC ${c}`);
      else near(r.mdPerKg, e.md[j], 0.051, `MD ${pair} ${c}`);
    }
  });
});

// ======================= bayesian-engine TC-1 / TC-2 (site MAP, steady state by long history) =======================
const TCD = PK.one.regimen({ dose: 1500, tau: 24, n: 40, tinf: 2 }), T0 = 39 * 24;
const tc = (pk, tr) => M.bayesCalc({ sex: "M", age: 73, htIn: 70, wtKg: 83, scr: 1.3, mode: "site", model: "reg1c", doses: TCD,
  levels: [{ t: T0 + 2, c: pk }, { t: T0 + 24 - 1e-9, c: tr }], priorOverride: { V: 53.95, CL: 2.875535 } });
test("bayesian-engine TC-1 (peak 46 / trough 20): Vd within 1%, CL within 3.5% of site; never the run-4 local minimum", () => {
  const cov = M.covariates({ sex: "M", age: 73, htIn: 70, wtKg: 83, scr: 1.3 });
  near(M.popModel(cov, "reg1c", "site").p.k, 0.0533, 5e-5, "site K 0.0533 from demographics");
  const r = tc(46, 20);
  assert.equal(r.mask, "both"); assert.equal(r.fit.converged, true);
  rel(r.params.V, 53.19, 0.01); rel(r.params.CL, 2.081, 0.035);
  near(r.params.V, 53.6394, 0.01); near(r.params.CL, 2.01715, 1e-4);
  assert.ok(Math.abs(r.params.V - 43.2031) > 5);
  near(r.current.auc, (1500 / r.params.CL) * 1, 1e-6);
});
test("bayesian-engine TC-2 (peak 46 / trough 5): within 1.5% of site Vd 32.80 / CL 3.345", () => {
  const r = tc(46, 5);
  rel(r.params.V, 32.8, 0.015); rel(r.params.CL, 3.345, 0.015);
  near(r.params.V, 33.1253, 0.01); near(r.params.CL, 3.30031, 1e-4);
  assert.ok(Math.abs(r.params.V - 83.87) > 20);
  near(r.fit.predictions[1].pred, 5.048, 0.01, "our minimum of objective (c); site point gives 4.8 (pkcore test)");
});

// ======================= two-comp-auc TC1 / TC2 =======================
test("two-comp TC1 modified-Goti baseline (CL 3.84): peak 29.68, trough 16.35, AUC 520.83, exact LD 2057", () => {
  const pm = { struct: "2c", p: { CL: 3.84, Vc: 58.4, Vp: 38.4, Q: 6.5 } };
  const s = M.predictSS(pm, { dose: 1000, tau: 12, tinf: 2 });
  rel(s.peak, 29.68, P5); rel(s.trough, 16.35, P5); rel(s.auc, 520.83, P5); rel(s.aucTrap, 520.83, P5); rel(s.post2, 24.99, P5);
  rel(s.tHalf, 19.336, P5);
  rel(PK.two.loadingDoseExact(30, 2, PK.two.micro(pm.p)), 2057, P5);
});
test("two-comp TC2: site legacy modified Goti 6.04 (CrCl 68, 70 kg) → CL 3.8344, peak 29.71, trough 16.38, AUC 521.59", () => {
  const pm = M.popModel({ crclSiteGoti: 68, tbw: 70 }, "gotiSite2022", "site");
  near(pm.p.CL, 3.8344, 1e-4); near(pm.p.Vc, 58.4, 1e-9); near(pm.p.Vp, 38.4, 1e-9); near(pm.p.Q, 6.5, 0);
  const s = M.predictSS(pm, { dose: 1000, tau: 12, tinf: 2 });
  rel(s.peak, 29.71, P5); rel(s.trough, 16.38, P5); rel(s.auc, 521.59, P5);
  assert.equal(pm.error.onObs, true); assert.equal(pm.cv.CL, 0.3);
});

// ======================= literature mode =======================
test("literature Goti 2018 published: CL 4.5·(CrCl/120)^0.8, Vp 38.4 fixed, CrCl cap 150, elderly SCr floor option, IIV and residual", () => {
  const pm = M.popModel({ crclGoti: 120, tbw: 100 }, "goti", "literature");
  near(pm.p.CL, 4.5, 1e-12); near(pm.p.Vc, (58.4 * 100) / 70, 1e-9); near(pm.p.Vp, 38.4, 1e-12, "not weight-scaled"); near(pm.p.Q, 6.5, 0);
  near(M.popModel({ crclGoti: 200, tbw: 70 }, "goti", "literature").p.CL, 4.5 * Math.pow(150 / 120, 0.8), 1e-12, "cap 150");
  const hd = M.popModel({ crclGoti: 120, tbw: 70 }, "goti", "literature", { dial: true });
  near(hd.p.CL, 4.5 * 0.7, 1e-12); near(hd.p.Vc, 58.4 * 0.5, 1e-12);
  assert.deepEqual(pm.cv, { CL: 0.398, Vc: 0.816, Vp: 0.571 });
  assert.deepEqual(pm.error, { onObs: false, prop: 0.197, add: 1.42 }, "decision: InsightRX MAP-stable residual by default");
  assert.deepEqual(M.popModel({ crclGoti: 120, tbw: 100 }, "goti", "literature", { gotiResid: "published" }).error, { onObs: false, prop: 0.227, add: 3.4 });
  const old = { sex: "M", age: 80, htIn: 70, wtKg: 70, scr: 0.7 };
  const off = M.covariates(old), on = M.covariates({ ...old, elderlyFloor: true });
  near(off.crclGoti, (60 * 70) / (72 * 0.7), 1e-9); near(on.crclGoti, (60 * 70) / 72, 1e-9, "SCr floored at 1.0 when age > 65");
});
test("literature obesity: Vd 0.5 L/kg TBW at BMI ≥ 30, LD ≤ 25 mg/kg capped 3000 mg, empiric > 4500 mg/day flagged", () => {
  const r = M.initialCalc({ sex: "M", age: 40, htIn: 70, wtKg: 150, scr: 1, tinf: 2, mode: "literature", model: "reg1c", tau: "auto", ldPerKg: 30 });
  assert.equal(r.cov.obese, true); near(r.pm.p.V, 75, 1e-9); assert.equal(r.pm.vdPerKg, 0.5);
  assert.equal(r.ld.perKg, 25, "clamped to 25 mg/kg"); assert.equal(r.ld.dose, 3000); assert.equal(r.ld.capped, true);
  assert.ok(r.flags.some((f) => f.code === "obese")); assert.ok(r.flags.some((f) => f.code === "ldCap"));
  const big = M.initialCalc({ sex: "M", age: 25, htIn: 70, wtKg: 150, scr: 0.6, tinf: 2, mode: "literature", model: "reg1c", tau: 8, aucTarget: 600 });
  assert.ok((big.md.dose * 24) / 8 > 4500); assert.ok(big.flags.some((f) => f.code === "daily>4500"));
  // Site mode keeps 0.65 L/kg (site outdated per lit).
  assert.equal(M.siteCalc({ ...B, wtKg: 150 }).Vd, 97.5);
});
test("literature initial: LD 20–35 mg/kg rounded to 250 mg; dose for target AUC rounded to 250; auto interval ln2/K + T′ nearest", () => {
  const r = M.initialCalc({ ...B, mode: "literature", model: "reg1c", tau: "auto", ldPerKg: 30 });
  assert.equal(r.ld.dose, 2500); assert.equal(r.tau, 12);
  rel(r.md.exact, 1054.05, 1e-4); assert.equal(r.md.dose, 1000); rel(r.pred.auc, 474.4, P5);
  assert.equal(M.litLoadingDose(80, 15, false).perKg, 20, "below range clamped to 20");
  assert.equal(M.doseForAuc(4, 12, 500).dose, 1000); assert.equal(M.doseForAuc(0.1, 24, 400).dose, 250, "never below one step");
  const g = M.initialCalc({ ...B, mode: "literature", model: "goti", tau: "auto" });
  assert.equal(g.pm.struct, "2c"); assert.equal(g.tau, PK.round.snapInterval((Math.LN2 * (g.pm.p.Vc + g.pm.p.Vp)) / g.pm.p.CL + 2, M.LIT.tauAuto, "nearest"), "Goti interval from CL/Vss"); assert.equal(g.tau, 24); assert.ok(g.tau > 12, "longer than the 1-comp q12h");
  rel(g.pred.auc, ((g.md.dose / g.pm.p.CL) * 24) / g.tau, 1e-9);
  const mz = M.initialCalc({ ...B, mode: "literature", model: "matzke", tau: 12 });
  near(mz.pm.p.CL, ((3.66 + 0.689 * 81.111) * 60) / 1000, 1e-3); near(mz.pm.p.V, 56, 1e-9);
});
test("literature Bayesian 1-comp: log-normal priors CV 35/30, combined error on PREDICTED; recovers truth with rich data", () => {
  const pm = M.popModel(M.covariates({ ...B }), "reg1c", "literature");
  assert.deepEqual(pm.cv, { CL: 0.3, V: 0.3 }, "decision: ω 0.30 on CL and V"); assert.equal(pm.prior, "lognormal"); assert.deepEqual(pm.error, { onObs: false, prop: 0.15, add: 1.5 });
  const doses = PK.one.regimen({ dose: 1000, tau: 12, n: 6, tinf: 1 }), truth = { V: 60, CL: 3 };
  const times = [3, 11.5, 27, 35.5, 51, 59.5];
  const r = M.bayesCalc({ ...B, mode: "literature", model: "reg1c", doses, levels: times.map((t) => ({ t, c: PK.one.superpose(t, doses, truth) })) });
  assert.equal(r.mask, "both"); assert.equal(r.fit.converged, true);
  rel(r.params.CL, 3, 0.06); rel(r.params.V, 60, 0.1); // prior and ln σ² term shrink slightly
  assert.ok(r.aucRange[0] < r.pred.auc && r.pred.auc < r.aucRange[1]);
  // Regression lock (objective includes ln σ²).
  near(r.params.CL, 3.1717, 0.002); // ω 0.30 (decision)
  // Combined error on the predicted level differs from the site's observed-level weighting.
  const lv = [{ t: 59.5, c: 25 }];
  const lit = M.bayesCalc({ ...B, mode: "literature", model: "reg1c", doses, levels: lv }), site = M.bayesCalc({ ...B, mode: "site", model: "reg1c", doses, levels: lv });
  assert.equal(lit.mask, "CL"); assert.equal(site.mask, "CL");
  assert.ok(Math.abs(lit.params.CL - pm.p.CL) < Math.abs(site.params.CL - pm.p.CL), "larger residual error → more shrinkage to the prior");
});
test("literature Bayesian mapPred: σ = √((a·pred)² + b²) on predicted, plus ln σ², prior ω used directly; matches brute-force minimum", () => {
  const spec = { predict: (th) => 10 * 3 / th.CL, obs: [{ t: 0, c: 12 }], params: [{ name: "CL", mean: 3, cv: 0.3 }], error: { prop: 0.15, add: 1.5 } };
  const f = M.mapPred(spec);
  const obj = (cl) => { const p = 30 / cl, s = Math.hypot(0.15 * p, 1.5); return ((12 - p) / s) ** 2 + Math.log(s * s) + (Math.log(cl / 3) / 0.3) ** 2; }; // ω used directly (√ω²)
  let best = 3, bo = Infinity; for (let cl = 1.5; cl <= 4; cl += 1e-5) { const o = obj(cl); if (o < bo) { bo = o; best = cl; } }
  near(f.params.CL, best, 1e-3); near(f.objective, bo, 1e-6);
});
test("literature Bayesian 2-comp Goti: fits CL and Vc, holds Vp/Q (< 4 levels); Vp fitted with ≥ 4 levels", () => {
  const doses = PK.one.regimen({ dose: 1000, tau: 12, n: 6, tinf: 1 });
  const cov = M.covariates({ ...B }), pm = M.popModel(cov, "goti", "literature");
  const truth = { ...pm.p, CL: pm.p.CL * 1.3 }, m = PK.two.micro(truth);
  const obs = (ts) => ts.map((t) => ({ t, c: PK.two.superpose(t, doses, m) }));
  const r2 = M.bayesCalc({ ...B, mode: "literature", model: "goti", doses, levels: obs([62, 71.5]) });
  assert.equal(r2.pm.struct, "2c"); assert.equal(r2.params.Vp, pm.p.Vp); assert.equal(r2.params.Q, 6.5); assert.notEqual(r2.params.Vc, pm.p.Vc);
  rel(r2.params.CL, truth.CL, 0.08);
  const r4 = M.bayesCalc({ ...B, mode: "literature", model: "goti", doses, levels: obs([39, 47.5, 51, 59.5]) });
  assert.notEqual(r4.params.Vp, pm.p.Vp);
  const s = M.bayesCalc({ ...B, mode: "site", model: "gotiSite", doses, levels: obs([62, 71.5]) });
  assert.equal(s.pm.model, "gotiSite"); assert.equal(s.params.Vp, s.pm.p.Vp);
});
test("Bayesian non-steady-state history: irregular doses, starting level, AUC over the last 24 h, level classification", () => {
  const doses = [{ t: 0, dose: 2000, tinf: 2 }, { t: 12, dose: 1000, tinf: 1 }, { t: 26, dose: 1250, tinf: 1.5 }];
  const truth = { V: 50, CL: 4 }, init = { c0: 5, t0: 0 };
  const levels = [{ t: 4, c: PK.one.superpose(4, doses, truth, init) }, { t: 25.5, c: PK.one.superpose(25.5, doses, truth, init) }];
  const r = M.bayesCalc({ ...B, mode: "literature", model: "reg1c", doses, levels, c0: 5 });
  assert.deepEqual(r.kinds.map((k) => k.kind), ["peak", "trough"]);
  assert.ok(r.auc24Last > 0 && isFinite(r.auc24Last)); near(r.curTau, 14, 1e-12);
  rel(r.params.CL, 4, 0.2);
  assert.ok(M.bayesCalc({ ...B, doses, levels: [] }).error);
  assert.ok(M.bayesCalc({ ...B, doses, levels: [{ t: 1, c: 20 }] }).flags.some((f) => f.code === "during"), "level during infusion flagged");
});
test("warnings: AUC > 600, trough > 20, infusion rate, nephrotoxins, age < 18", () => {
  const f = M.clinicalFlags({ auc: 650, trough: 22, dose: 2500, tau: 12, tinf: 2, nephrotoxins: ["piperacillin-tazobactam"] });
  for (const c of ["auc>600", "trough>20", "rate", "nephrotoxins"]) assert.ok(f.some((x) => x.code === c), c);
  assert.equal(f.find((x) => x.code === "auc>600").lvl, "crit");
  assert.ok(M.clinicalFlags({ auc: 350 }).some((x) => x.code === "auc<400"));
  assert.ok(M.initialCalc({ ...B, age: 16, mode: "literature", tau: "auto" }).flags.some((x) => x.code === "peds"));
  assert.ok(M.initialCalc({ ...B, age: 16, mode: "site", model: "reg1c", tau: "auto" }).flags.some((x) => x.code === "peds"));
});
test("order text and plot helpers", () => {
  const t = M.orderText({ ld: 2000, dose: 1000, tau: 12, tinf: 1, auc: 474.4, peak: 28.5, trough: 12.7, basis: "test" });
  assert.match(t, /Vancomycin 2000 mg IV x1/); assert.match(t, /1000 mg IV every 12 h, infuse over 1 h/); assert.match(t, /AUC24 474/);
  const ev = M.regimenEvents({ dose: 1000, tau: 12, tinf: 1 }, 3, 2000);
  assert.deepEqual(ev.map((e) => e.t), [0, 12, 24, 36]); assert.equal(ev[0].tinf, 2, "LD infused at ≤ 1000 mg/h");
  const pm = { struct: "1c", p: { V: 52, CL: 4.2, k: 4.2 / 52 } };
  const pts = M.profile(pm, ev, 0, 48, undefined, 48);
  assert.equal(pts.length, 49); assert.equal(pts[0][1], 0);
});

// ======================= approved decisions (DECISIONS.md, decisions/vancomycin-aminoglycosides.md) =======================
test("decision: Goti CrCl is Cockcroft-Gault on TBW (capped 150 in the model); elderly SCr rounding default off", () => {
  const c = M.covariates({ sex: "M", age: 60, htIn: 70, wtKg: 120, scr: 1 });
  near(c.crclGoti, (80 * 120) / 72, 1e-9, "TBW, not AdjBW or IBW");
  near(c.crclLit, (80 * PK.body.adjustedBW(73, 120)) / 72, 1e-9, "Matzke keeps the suite rule");
  const pm = M.popModel(M.covariates({ sex: "M", age: 30, htIn: 70, wtKg: 120, scr: 0.6 }), "goti", "literature");
  near(pm.p.CL, 4.5 * Math.pow(150 / 120, 0.8), 1e-12, "CrCl 244 capped at 150");
  const old = { sex: "M", age: 70, htIn: 70, wtKg: 70, scr: 0.8 };
  near(M.covariates(old).crclGoti, (70 * 70) / (72 * 0.8), 1e-9, "default off");
  near(M.covariates({ ...old, elderlyFloor: true }).crclGoti, (70 * 70) / 72, 1e-9, "original: age > 65 → SCr 1.0");
});
test("decision: obesity Vd 0.5 L/kg TBW with no TBW cap, warning > 200 kg, fixed 75 L option at BMI ≥ 40", () => {
  const big = { sex: "M", age: 40, htIn: 70, wtKg: 220, scr: 1, tinf: 2, mode: "literature", model: "reg1c", tau: "auto" };
  const r = M.initialCalc(big);
  near(r.pm.p.V, 110, 1e-9, "0.5 × 220, uncapped"); assert.ok(r.flags.some((f) => f.code === "heavy"));
  assert.ok(!M.initialCalc({ ...big, wtKg: 150 }).flags.some((f) => f.code === "heavy"));
  const f = M.initialCalc({ ...big, wtKg: 150, fixed75: true });
  assert.equal(f.pm.fixed75, true); near(f.pm.p.V, 75, 1e-12); near(f.pm.p.CL, f.pm.p.k * 75, 1e-12, "K regression kept, CL = K·75");
  const bmi35 = M.initialCalc({ ...big, wtKg: 110, fixed75: true });
  assert.equal(bmi35.pm.fixed75, false, "BMI 34.8 < 40: option ignored"); near(bmi35.pm.p.V, 55, 1e-9);
  const site = M.bayesCalc({ ...big, wtKg: 150, mode: "site", fixed75: true, doses: [{ t: 0, dose: 1000, tinf: 1 }], levels: [{ t: 11, c: 10 }] });
  near(site.pm.p.V, 0.65 * 150, 1e-9, "site mode unchanged");
});
test("decision: loading-dose cap 3000 mg by default, 4000 mg option", () => {
  const p = { sex: "M", age: 40, htIn: 70, wtKg: 180, scr: 1, tinf: 2, mode: "literature", model: "reg1c", tau: "auto", ldPerKg: 25 };
  assert.equal(M.initialCalc(p).ld.dose, 3000);
  const r = M.initialCalc({ ...p, ldCap: 4000 });
  assert.equal(r.ld.dose, 4000); assert.equal(r.ld.cap, 4000); assert.ok(r.flags.find((x) => x.code === "ldCap").text.includes("4000"));
  assert.equal(M.initialCalc({ ...p, wtKg: 140, ldCap: 4000 }).ld.dose, 3500, "under the 4 g cap: 25 × 140 rounded");
});

// ======================= Workbook model (site Excel workbooks; workbook-checks/vancomycin-aminoglycosides.md) =======================
// The workbooks were saved blank, so these are the report's RE-IMPLEMENTED cases (cell formulas run on the spec patients,
// scratch wbref.js), hard-coded here. Rounded report values are checked at their printed precision; extra digits come
// from the same re-implementation.
const WBP = {
  P1: { sex: "M", age: 70, htIn: 70, wtKg: 70, scr: 1.0 }, P2: { sex: "M", age: 70, htIn: 70, wtKg: 70, scr: 1.5 },
  P3: { sex: "M", age: 60, htIn: 70, wtKg: 80, scr: 1.0 }, P4: { sex: "F", age: 80, htIn: 64, wtKg: 60, scr: 0.5 },
  P5: { sex: "M", age: 50, htIn: 70, wtKg: 120, scr: 1.2 },
};
test("workbook FIT population block (§4.3): CrCl, K (intercept 0.005216005), Vd, LD 30 mg/L, τ ln2/K + 2, MD 12.5 mg/kg", () => {
  // [patient, CrCl, K, V, LD (T′ 2 h), τ, MD]   report: 68.06/0.07258, 45.37/0.05013, 81.11/0.0811, 55.35/0.0677, 76.04/0.0651
  const rows = [["P1", 68.05556, 0.0726005, 45.5, 1466.50, 11.5474, 875], ["P2", 45.37037, 0.0501390, 45.5, 1434.58, 15.8245, 875],
    ["P3", 81.11111, 0.0810965, 52, 1689.93, 10.5472, 1000], ["P4", 55.35119, 0.0676601, 39, 1250.95, 12.2445, 750],
    ["P5", 76.04167, 0.0650934, 78, 2495.62, 12.6485, 1500]];
  for (const [id, crcl, k, V, ld, tau, md] of rows) {
    const r = M.wbPop({ ...WBP[id], tinf: 2 });
    near(r.crcl, crcl, 1e-4, `${id} CrCl`); near(r.k, k, 1e-7, `${id} K`); near(r.V, V, 1e-9, `${id} V`);
    near(r.ld, ld, 0.01, `${id} LD`); near(r.tauCalc, tau, 1e-4, `${id} tau`); near(r.mdPop, md, 1e-9, `${id} MD`);
  }
  const p4 = M.wbPop({ ...WBP.P4 });
  assert.equal(p4.S2, 0.7, "SCr 0.5 floored to 0.7"); assert.ok(p4.flags.some((f) => f.code === "wbFloor"));
  near(M.wbPop({ ...WBP.P4, lowFloor: true }).crcl, 77.49167, 1e-4, "paralysis/malnutrition floor 0.5");
  near(M.wbPop({ sex: "F", age: 70, htIn: 64, wtKg: 60, scr: 1.0, scrPrev: 1.6, dtScr: 48 }).crcl, 45.92105, 1e-4, "Chiou two-SCr fit");
  const lo = M.wbRenal({ ...WBP.P1, scr: 20 }); near(lo.crcl, 5, 1e-9, "Solver lower bound 0.3 L/h (CG would give 3.4)"); assert.ok(lo.flags.some((x) => x.code === "wbClClamp"));
  near(M.covariates({ ...WBP.P4 }).crclReg, 77.49, 0.01, "Literature/Site models do not floor (mismatch cause 2)");
});
test("workbook FIT steady-state prediction: AUC24 = [(Cmax + Cmin)·T′/2 + (Cmax − Cmin)/K]·24/τ; initial tab uses it", () => {
  const s = M.wbSS(1000, 12, 2, 0.0726005, 45.5);
  near(s.aucTrap, ((s.peak + s.trough) + (s.peak - s.trough) / 0.0726005) * 2, 1e-9);
  near(s.aucDose, (1000 * 2) / (0.0726005 * 45.5), 1e-9);
  const r = M.initialCalc({ ...WBP.P1, mode: "workbook", tinf: 2, tau: "auto" });
  assert.equal(r.model, "wbFit"); near(r.ld.exact, 1466.497, 0.01); assert.equal(r.ld.dose, 1500); assert.equal(r.ld.capped, false);
  near(r.tauRaw, 11.5474, 1e-4); assert.equal(r.tau, 12); near(r.md.exact, 875, 1e-9); assert.equal(r.md.dose, 1000);
  near(r.wb.aucTrap, 604.57, 0.01); near(r.wb.peak, 35.176, 0.001);
  assert.ok(M.initialCalc({ ...WBP.P1, wtKg: 150, mode: "workbook", tau: 12 }).flags.some((f) => f.code === "wbLd3g"), "LD > 3 g warned, not capped");
  assert.ok(M.initialCalc({ ...WBP.P1, mode: "workbook", tau: 12, dose: 1500 }).flags.some((f) => f.code === "wbDoseMax"), "> 20 mg/kg warned");
});
test("workbook FIT Bayesian serial troughs (§4.4, vanco-bayesian §9.2): priors on K and V reproduce 978…1048 (K&V) and 993…1038 (K only)", () => {
  // P2, 1500 mg q24h over 2 h, troughs before doses 2..6. [n, K-only AUC, K&V AUC, K&V V]
  const tr = [15.9, 23.4, 26.9, 28.5, 29.3];
  const exp = [[1, 992.92, 977.96, 37.049], [2, 1023.78, 1019.02, 38.725], [3, 1032.65, 1036.86, 40.477], [4, 1035.97, 1044.30, 41.554], [5, 1037.95, 1047.87, 42.230]];
  for (const [n, aK, aKV, vKV] of exp) {
    const doses = Array.from({ length: n }, (_, j) => ({ t: 24 * j, dose: 1500, tinf: 2 }));
    const levels = tr.slice(0, n).map((c, j) => ({ t: 24 * (j + 1) - 1e-9, c }));
    const k = M.bayesCalc({ ...WBP.P2, mode: "workbook", doses, levels, fitMask: "CL", newTau: 24, newDose: 1500 });
    const kv = M.bayesCalc({ ...WBP.P2, mode: "workbook", doses, levels, fitMask: "both", newTau: 24, newDose: 1500 });
    near(k.pred.auc, aK, 0.05, `n=${n} K-only`); near(k.params.V, 45.5, 1e-9, "V held at population");
    near(kv.pred.auc, aKV, 0.05, `n=${n} K&V`); near(kv.params.V, vKV, 0.005, `n=${n} V`);
  }
});
test("workbook FIT peak & trough over a 7-dose history (§4.4 9.4 data): Bayesian and least-squares fits", () => {
  // P1, 1000 mg q12h over 1 h ×7; peak 28 at 3 h and trough 12 at 11.5 h after dose 7. Report: K-only CL 4.0673.
  const doses = Array.from({ length: 7 }, (_, j) => ({ t: 12 * j, dose: 1000, tinf: 1 })), levels = [{ t: 75, c: 28 }, { t: 83.5, c: 12 }];
  const f = (fitMask, wbObjective) => M.bayesCalc({ ...WBP.P1, mode: "workbook", doses, levels, fitMask, wbObjective });
  const a = f("CL", "bayes"); near(a.params.CL, 4.0673, 1e-4); near(a.params.k, 0.089391, 1e-6); near(a.fit.objective, 0.97574, 1e-4);
  const b = f("both", "bayes"); near(b.params.k, 0.089585, 1e-5); near(b.params.V, 45.3629, 0.002);
  const c = f("CL", "ls"); near(c.params.k, 0.087505, 1e-6);
  const d = f("both", "ls"); near(d.params.k, 0.099682, 1e-5); near(d.params.V, 39.9073, 0.005); assert.ok(d.fit.objective < 1e-12, "exact fit");
  assert.equal(a.pm.model, "wbFit"); assert.ok(isFinite(a.pred.wb.aucTrap));
});
test("workbook FIT: Solver box (K 0.1–10 ×), 7-dose / 2-level limits flagged, during-infusion level NOT mispredicted", () => {
  const doses = [{ t: 0, dose: 1000, tinf: 2 }];
  const r = M.bayesCalc({ ...WBP.P1, mode: "workbook", doses, levels: [{ t: 11, c: 0.0001 }], fitMask: "CL", wbObjective: "ls" });
  near(r.params.k, 10 * r.pm.p.k, 1e-3 * r.pm.p.k, "upper K bound"); assert.ok(r.flags.some((f) => f.code === "wbBound"));
  const many = Array.from({ length: 8 }, (_, j) => ({ t: 12 * j, dose: 1000, tinf: 1 }));
  const m = M.bayesCalc({ ...WBP.P1, mode: "workbook", doses: many, levels: [{ t: 87, c: 28 }, { t: 90, c: 22 }, { t: 95.5, c: 12 }] });
  assert.ok(m.flags.some((f) => f.code === "wbMaxDoses")); assert.ok(m.flags.some((f) => f.code === "wbMaxLevels"));
  // 1 h into a 2 h infusion, population K/V of P1: true 10.6 mg/L; the workbook's post-infusion equation gives 22.0 (§1.3).
  const pop = M.wbPop({ ...WBP.P1, tinf: 2 });
  const dur = M.bayesCalc({ ...WBP.P1, mode: "workbook", doses, levels: [{ t: 1, c: 10 }], fitMask: "CL" });
  assert.ok(dur.flags.some((f) => f.code === "during"));
  near(PK.one.superpose(1, doses, { V: pop.V, k: pop.k }), 10.6, 0.05);
  const wbBug = (1000 * (1 - Math.exp(-pop.k * 2)) * Math.exp(-pop.k * (1 - 2))) / (pop.V * 2 * pop.k);
  near(wbBug, 22.0, 0.05, "documented workbook value (not used)");
});
test("AUC workbook (§4.5, W4): population, Bayesian (prior SD on fitted value), relative least squares, Vd drop-down", () => {
  const base = { ...WBP.P1, dose: 1000, tau: 12, tinf: 1, peak: 28, tPeak: 2, trough: 12, tTrough: 0.5 };
  const a = M.aucWbCalc({ ...base, vdPerKg: 0.65 });
  near(a.pop.CL, 3.3026, 1e-4); near(a.pop.V, 45.5, 1e-9); near(a.pop.auc, 605.6, 0.05); near(a.pop.dose30, 822.86, 0.01); near(a.pop.ld, 1719.77, 0.01);
  near(a.pop.tauSug, 10.5495, 1e-4); near(a.pop.bsa, 1.86953, 1e-5);
  near(a.fit.CL, 3.9965, 1e-4); near(a.fit.V, 41.43, 0.005); near(a.fit.auc, 500.4, 0.05);
  const n = M.aucWbCalc({ ...base, wbObjective: "ls" });
  near(n.fit.CL, 3.97896, 1e-4); near(n.fit.V, 39.9165, 0.002);
  const sz = M.twoLevelCalc({ dose: 1000, tau: 12, tinf: 1, peak: 28, tPeak: 2, trough: 12, tTrough: 0.5, tbw: 70 });
  rel(n.fit.CL, sz.sz.CL, 1e-3, "non-Bayesian = Sawchuk-Zaske when the fit is exact");
  for (const [vk, k, cl, V] of [[0.5, 0.094360, 3.91123, 37.9882], [1, 0.047180, 4.22682, 52.6724]]) {
    const q = M.aucWbCalc({ ...base, vdPerKg: vk });
    near(q.pop.CL, 3.30259, 1e-5, "CL tied to 0.65 L/kg"); near(q.pop.k, k, 1e-6); near(q.fit.CL, cl, 2e-4); near(q.fit.V, V, 0.005);
  }
  // Helper AUC bug not ported: the correct log-trapezoid AUC at T′ 1 h is 502.3, the workbook's 2/T′ form gives 639.0.
  near(sz.sz.auc24TrapLog, 502.3, 0.1);
  assert.ok(!("szAuc" in a.fit) && !("sz" in a));
});

// ======================= Goti coefficient versions and Carreno (two-comp-auc Workbook verification) =======================
test("Goti versions: literature published 4.5; site current 6.4 (3/2023, FractionSS D78 4.158277); legacy 6.04 (4/2022)", () => {
  assert.equal(M.GOTI.published.clRef, 4.5); assert.equal(M.GOTI.siteModified.clRef, 6.4); assert.equal(M.GOTI.siteModified2022.clRef, 6.04);
  const cur = M.popModel({ crclSiteGoti: 70, tbw: 70 }, "gotiSite", "site");
  near(cur.p.CL, 4.158277, 1e-6); near(cur.p.Vc, 58.4, 1e-12); near(cur.p.Vp, 38.4, 1e-12); assert.equal(cur.p.Q, 6.5);
  near(M.popModel({ crclSiteGoti: 70, tbw: 70 }, "gotiSite2022", "site").p.CL, 6.04 * Math.pow(70 / 120, 0.8), 1e-12);
  near(M.popModel({ crclGoti: 70, tbw: 70 }, "goti", "literature").p.CL, 4.5 * Math.pow(70 / 120, 0.8), 1e-12, "literature unchanged");
  const m = PK.two.micro(cur.p); near(m.alpha, 0.3133063, 1e-6); near(m.beta, 0.0384692, 1e-6);
  const s = M.predictSS(cur, { dose: 1000, tau: 8, tinf: 2 }); near(s.peak, 36.870018, 1e-4); near(s.trough, 24.614883, 1e-4);
});
test("Carreno (site MUE 3/2023): Vc 25.76, Q 58.99, Vp 40.97, CL 0.043292·CrCl + 0.331123; CrCl on TBW or AdjBW ≥ 1.2·IBW", () => {
  const cov = M.covariates({ sex: "M", age: 60, htIn: 70, wtKg: 70, scr: 1 });
  near(cov.crclCarreno, (80 * 70) / 72, 1e-9, "TBW < 1.2·IBW → TBW");
  const pm = M.popModel(cov, "carrenoSite", "site");
  near(pm.p.Vc, 25.76, 1e-12); near(pm.p.Q, 58.9904, 1e-9); near(pm.p.Vp, 40.9656, 1e-4); near(pm.p.CL, 0.043292 * cov.crclCarreno + 0.331123, 1e-12);
  near(M.popModel(cov, "carrenoSite", "site", { carrenoVersion: "2022" }).p.CL, 0.038151 * cov.crclCarreno + 0.4339, 1e-12, "4/2022 recorded");
  const ob = M.covariates({ sex: "M", age: 60, htIn: 70, wtKg: 120, scr: 1 });
  near(ob.crclCarreno, (80 * PK.body.adjustedBW(73, 120)) / 72, 1e-9, "AdjBW when TBW ≥ 1.2·IBW");
  const doses = PK.one.regimen({ dose: 1000, tau: 12, n: 6, tinf: 1 });
  const b = M.bayesCalc({ ...B, mode: "site", model: "carrenoSite", doses, levels: [{ t: 62, c: 30 }, { t: 71.5, c: 14 }] });
  assert.equal(b.pm.struct, "2c"); assert.equal(b.params.Vp, b.pm.p.Vp); assert.equal(b.params.Q, b.pm.p.Q); assert.ok(isFinite(b.pred.auc));
});

// ---------- Review 2026-10-25: 250 mg rounding keeps AUC24 in 400–600 when a regimen exists ----------
test("aucRegimen: auto interval moves to a neighbour when no 250 mg step fits (88 F, 45 kg, SCr 5: q48h 344 → q36h 459)", () => {
  const p = { sex: "F", age: 88, htIn: 62, wtKg: 45, scr: 5, tinf: 2, mode: "literature", model: "reg1c", tau: "auto" };
  const r = M.initialCalc(p);
  assert.equal(r.tau, 36); assert.equal(r.md.dose, 250);
  near(r.pred.auc, 459, 1); assert.ok(r.flags.some((f) => f.code === "aucRoundTau"));
  assert.ok(!r.flags.some((f) => f.code === "auc<400"));
  // A chosen interval is kept; the neighbour is only suggested.
  const fixed = M.initialCalc({ ...p, tau: 48 });
  assert.equal(fixed.tau, 48); assert.equal(fixed.md.dose, 250);
  const alt = fixed.flags.find((f) => f.code === "aucAltTau");
  assert.ok(alt && /q36h/.test(alt.text));
});

test("aucRegimen: unchanged when the nearest step is in range; rounds the other way when only that fits", () => {
  const ok = M.aucRegimen(4, 12, 500);
  assert.equal(ok.change, null); assert.equal(ok.md.dose, 1000); assert.deepEqual(ok.flags, []);
  // CL 3.85 L/h q12h, target 400: exact 770 mg → nearest 750 (AUC 390, out); 1000 (AUC 519) is in range.
  const dn = M.aucRegimen(3.85, 12, 400);
  assert.equal(dn.change, "dose"); assert.equal(dn.md.dose, 1000); near(dn.auc, 519.5, 0.1);
  assert.ok(dn.flags.some((f) => f.code === "aucRoundDose"));
  // No fit anywhere: keep the nearest step and warn.
  const none = M.aucRegimen(0.05, 72, 500, { auto: true });
  assert.ok(none.noFit); assert.ok(none.flags.some((f) => f.code === "aucNoFit"));
});

test("site mode keeps the site's own rounding; order text notes an out-of-range AUC", () => {
  const s = M.initialCalc({ sex: "F", age: 88, htIn: 62, wtKg: 45, scr: 5, tinf: 2, mode: "site", model: "reg1c", tau: "auto" });
  assert.ok(!s.flags.some((f) => /^auc(Round|Alt|NoFit)/.test(f.code)));
  assert.match(M.orderText({ dose: 250, tau: 48, tinf: 2, auc: 344, basis: "t" }), /outside 400–600/);
  assert.doesNotMatch(M.orderText({ dose: 1000, tau: 12, tinf: 1, auc: 500, basis: "t" }), /outside/);
});

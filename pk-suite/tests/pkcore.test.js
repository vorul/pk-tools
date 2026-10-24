// Tests for pk-suite/lib/pkcore.js. Run from the project folder:  node --test pk-suite/tests/
// Every worked example in specs/core-equations.md §6, crcl.md §8, two-comp-auc.md §9 (TC1–TC7),
// bayesian-engine.md §7 (TC-1/TC-2) and vanco-bayesian.md §9.1/§9.2/§9.4 is checked here. Tolerances are stated per test.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));
const { body, renal, one, two, fit, round, binding } = PK;

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
const rel = (actual, expected, r, msg) => near(actual, expected, Math.abs(expected) * r, msg);
const R3 = 1e-3; // core-equations §6: relative tolerance 1e-3
const arr = (actual, expected, tol, msg) => expected.forEach((e, i) => near(actual[i], e, tol, `${msg} [${i}]`));

test("module shape: globalThis.PK and module.exports", () => {
  assert.equal(globalThis.PK, PK);
  assert.match(PK.version, /^\d+\.\d+\.\d+$/);
  for (const ns of ["body", "renal", "one", "two", "fit", "round", "sources", "policies"]) assert.ok(PK[ns], ns);
  assert.equal(PK.policies.obesityRatio, 1.2); assert.equal(PK.policies.scrFloor, null);
});

// ======================= core-equations §6 =======================
test("TC-K1: elimination, K 0.4, Cp0 10", () => {
  const cp = [10, 6.7032, 4.49329, 3.011942, 2.018965, 1.353353, 0.90718, 0.608101, 0.407622, 0.273237, 0.183156];
  const fr = [0, 0.32968, 0.550671, 0.698806, 0.798103, 0.864665, 0.909282, 0.93919, 0.959238, 0.972676, 0.981684];
  cp.forEach((c, h) => rel(one.bolus(h, 10, { V: 1, k: 0.4 }), c, R3, `Cp h${h}`));
  fr.forEach((f, h) => near(1 - one.fracRemaining(0.4, h), f, 1e-5, `removed h${h}`));
  near(one.halfLife(0.4), 1.7325, 1e-9, "t½ uses 0.693");
});

test("TC-ACC: accumulation factor, K 0.1", () => {
  const taus = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24];
  const exp = [5.516656, 3.033245, 2.216369, 1.815966, 1.581977, 1.431013, 1.327311, 1.25297, 1.198034, 1.156518, 1.099769];
  taus.forEach((t, i) => rel(one.accumulation(0.1, t), exp[i], R3, `tau ${t}`));
  near(one.halfLife(0.1), 6.93, 1e-9);
});

test("TC-FSS-INF: fraction of SS during infusion, K 0.4", () => {
  const exp = [0.039211, 0.076884, 0.11308, 0.147856, 0.181269, 0.213372, 0.244216, 0.273851, 0.302324, 0.32968, 0.355964, 0.381217];
  exp.forEach((f, i) => near(one.fracSS(0.4, (i + 1) / 10), f, 1e-6, `t ${(i + 1) / 10}`));
  near(one.fracSS(0.4, 4.5), 0.834701, 1e-6);
  near(one.timeToFracSS(0.4, 0.834701), 4.5, 1e-4);
});

test("TC-INF: during and after a 50 mg/h infusion, CL 0.5, K 0.1, T' 4", () => {
  const p = { CL: 0.5, k: 0.1 };
  arr([1, 2, 3, 4].map((t) => one.infusionDuring(t, 50, p)), [9.516258, 18.12692, 25.91818, 32.968], 1e-4, "during");
  const after = [29.83068, 26.99191, 24.42329, 22.09911, 19.9961, 18.09322, 16.37142, 14.81348];
  arr([1, 2, 3, 4, 5, 6, 7, 8].map((t) => one.infusionAfter(t, 50, 4, p)), after, 1e-4, "after");
  near(one.infusion(6, 200, 4, p), 29.83068 * Math.exp(-0.1), 1e-4, "single-dose wrapper, t from start");
});

const SS8 = { dose: 1000, tau: 8, tinf: 2 };
const P8 = { CL: 4, V: 40 };
test("TC-SS8 (master): CL 4, Vd 40, T' 2, tau 8, 1000 mg → CmaxSS 41.14735, CminSS 22.58215", () => {
  const s = one.ss(SS8, P8);
  near(PK._omexp(0.1 * 2), 0.181269, 1e-6);
  near(PK._omexp(0.1 * 8), 0.550671, 1e-6);
  near(s.cmax1, 22.65866, 1e-5, "first-dose Cmax");
  near(s.cmax, 41.14735, 1e-5, "CmaxSS");
  near(s.cmin, 22.58215, 1e-5, "CminSS");
  const cmaxN = [22.65866, 32.83985, 37.41455, 39.4701, 40.39371, 40.80872, 40.9952, 41.07898, 41.11663, 41.13355, 41.14115, 41.14457];
  const cminN = [12.43533, 18.02289, 20.53354, 21.66165, 22.16854, 22.3963, 22.49864, 22.54462, 22.56529, 22.57457, 22.57874, 22.58062];
  const fss = [0.550671, 0.798103, 0.909282, 0.959238, 0.981684, 0.99177, 0.996302, 0.998338, 0.999253, 0.999665, 0.999849, 0.999932];
  cmaxN.forEach((v, i) => near(s.cmaxN(i + 1), v, 1e-4, `Cmax N${i + 1}`));
  cminN.forEach((v, i) => near(s.cminN(i + 1), v, 1e-4, `Cmin N${i + 1}`));
  fss.forEach((v, i) => near(one.fracSSDoses(i + 1, 0.1, 8), v, 1e-6, `fSS N${i + 1}`));
  near(one.auc24TrapLog(s.cmax, s.cmin, 0.1, 2, 8), 748.1447, 1e-3, "AUC24 trapezoid/log");
  near(s.auc24, 750, 1e-9, "AUC24 Dose/CL");
  // Superposition of 12 explicit doses agrees with the closed form.
  const ev = one.regimen({ dose: 1000, tau: 8, n: 12, tinf: 2 });
  near(one.superpose(11 * 8 + 2, ev, P8), s.cmaxN(12), 1e-9, "superposition = closed form");
});

test("TC-SS12: same as TC-SS8, tau 12", () => {
  const s = one.ss({ ...SS8, tau: 12 }, P8);
  near(PK._omexp(1.2), 0.698806, 1e-6);
  near(s.cmax, 32.42483, 1e-4);
  near(s.cmin, 11.92843, 1e-4);
  const curve = [32.42483, 29.3392, 26.5472, 24.0209, 21.73501, 19.66665, 17.79512, 16.10169, 14.56941, 13.18295, 11.92843];
  curve.forEach((c, h) => near(s.at(2 + h), c, 1e-4, `SS h${h} post-infusion`));
  const first = [11.89532, 22.65866, 20.5024, 18.55134, 16.78595, 15.18855, 13.74317, 12.43533, 11.25196, 10.18119, 9.212322, 8.335654];
  first.forEach((c, i) => near(one.infusion(i + 1, 1000, 2, P8), c, 1e-4, `first dose h${i + 1}`));
});

test("TC-SUP: superposition, doses at 0/8/16 h, level at 24 h = 20.53354", () => {
  const ev = [0, 8, 16].map((t) => ({ t, dose: 1000, tinf: 2 }));
  const parts = ev.map((e) => one.superpose(24, [e], P8));
  arr(parts, [2.510650634, 5.587555743, 12.435334], 1e-6, "Cp1..3");
  near(one.superpose(24, ev, P8), 20.53354037, 1e-7);
  near(one.ss(SS8, P8).cminN(3), 20.53354037, 1e-7, "equals Cmin after dose 3");
  // Pre-existing level decays from t0.
  near(one.superpose(10, [], { V: 40, k: 0.1 }, { c0: 10, t0: 0 }), 10 * Math.exp(-1), 1e-12);
});

test("TC-CL/VD: effect of CL and Vd on levels (1 dp)", () => {
  const rows = [
    [{ CL: 4, V: 40 }, [22.7, 32.8, 37.4, 39.5, 40.4], [12.4, 18.0, 20.5, 21.7, 22.2]],
    [{ CL: 2, V: 40 }, [23.8, 39.7, 50.4, 57.6, 62.4], [17.6, 29.4, 37.4, 42.7, 46.2]],
    [{ CL: 8, V: 40 }, [20.6, 24.8, 25.6, 25.8, 25.8], null],
    [{ CL: 4, V: 20 }, [41.2, 49.5, 51.2, 51.5, 51.6], [12.4, 14.9, 15.4, 15.5, 15.5]],
    [{ CL: 4, V: 80 }, [11.9, 19.9, 25.2, 28.8, 31.2], null],
  ];
  for (const [p, mx, mn] of rows) {
    const s = one.ss(SS8, p);
    mx.forEach((v, i) => near(s.cmaxN(i + 1), v, 0.051, `Cmax ${JSON.stringify(p)} N${i + 1}`));
    if (mn) mn.forEach((v, i) => near(s.cminN(i + 1), v, 0.051, `Cmin ${JSON.stringify(p)} N${i + 1}`));
  }
});

test("TC-PB: albumin correction, alpha 0.1, normal 4.4", () => {
  near(binding.albuminCorrect(10, 2), 19.6429, 1e-4);
  const tbl = { 2.0: [4.9, 9.8, 14.7, 19.6, 24.6, 29.5, 34.4, 39.3, 44.2, 49.1], 3.0: [3.5, 7.0, 10.5, 14.0, 17.5, 21.0, 24.5, 28.0, 31.5, 35.0], 4.0: [2.7, 5.4, 8.2, 10.9, 13.6, 16.3, 19.1, 21.8, 24.5, 27.2] };
  for (const [alb, vals] of Object.entries(tbl)) vals.forEach((v, i) => near(binding.albuminCorrect(2.5 * (i + 1), +alb), v, 0.051, `alb ${alb}`));
  near(binding.albuminCorrect(12.5, 4.4), 12.5, 1e-12, "normal albumin: unchanged");
});

test("TC-KWT: K independent of weight (age 70, SCr 1, Vd 0.25 L/kg) = 0.233333", () => {
  const prod = [29.16667, 35, 40.83333], crcl = [48.61111, 58.33333, 68.05556];
  [50, 60, 70].forEach((w, i) => {
    const R = renal.creatinineProduction(70, w, "M");
    near(R, prod[i], 1e-5);
    const c = renal.crclFromProduction(R, 1);
    near(c, crcl[i], 1e-5);
    near(one.k((c * 60) / 1000, 0.25 * w), 0.233333, 1e-6);
  });
});

test("DERIVED: body size", () => {
  near(body.bsa(70, body.inToCm(70)), 1.86953, 1e-5, "DuBois 70 kg 70 in");
  near(body.bsa(70, 177.8, "mosteller"), Math.sqrt((70 * 177.8) / 3600), 1e-12);
  near(body.ffm("M", 100, 30.9), 69.4153, 1e-4, "FFM male corrected");
  near(body.ffm("F", 80, 30), 46.0621, 1e-4, "FFM female corrected");
  near(body.ibw("M", 70), 73, 1e-9);
  near(body.ibw("F", 65), 57, 1e-9);
  near(body.adjustedBW(73, 150), 103.8, 1e-9);
  near(body.lbToKg(154.32358), 70, 1e-5);
  near(body.cmToIn(177.8), 70, 1e-12);
  near(body.scrUmolToMgdl(88.4), 1, 1e-12);
  near(body.bmi(70, 175), 22.857, 1e-3);
  const dw = body.dosingWeight({ policy: "adjIfOver", tbw: 90, ibw: 73 });
  assert.equal(dw.basis, "AdjBW"); near(dw.weight, 79.8, 1e-9);
  assert.equal(body.dosingWeight({ policy: "minIbwTbw", tbw: 60, ibw: 73 }).weight, 60);
  assert.equal(body.dosingWeight({ policy: "minFfmTbw", tbw: 60, ffm: 50 }).basis, "FFM");
  assert.throws(() => body.dosingWeight({ policy: "nope", tbw: 1, ibw: 1 }));
});

test("DERIVED: CG, aminoglycoside and vancomycin hand calculations", () => {
  near(renal.cgRaw(60, 70, 1, "M"), 77.7778, 1e-4);
  near(renal.cgRaw(60, 70, 1, "F"), 66.1111, 1e-4);
  // Aminoglycoside: K 0.216222, tau for 8/1 with T' 0.5, bolus-form MD and predictions.
  const K = 0.0026 * 77.7778 + 0.014;
  near(K, 0.216222, 1e-6); near(one.halfLife(K), 3.20504, 1e-4);
  near(one.intervalForTargets({ cmax: 8, cmin: 1, k: K, tinf: 0.5 }), 10.1171, 1e-3);
  near(one.doseForPeak({ cmax: 8, tau: 8 }, { V: 17.5, k: K }), 115.175, 1e-2);
  const ag = one.ss({ dose: 140, tau: 8, tinf: 0 }, { V: 17.5, k: K });
  near(ag.cmax, 9.72436, 1e-4); near(ag.cmin, 1.72436, 1e-4);
  // Vancomycin.
  const norm = renal.normalizeTo173(renal.cgRaw(60, 70, 1, "M"), body.bsa(70, 177.8));
  near(norm, 71.9728, 1e-3);
  const Kv = 0.00107 * norm + 0.0052;
  near(Kv, 0.0822108, 1e-6); near(one.halfLife(Kv), 8.42954, 1e-3);
  near(one.intervalForTargets({ cmax: 30, cmin: 15, k: Kv, tinf: 1.5 }), 9.93133, 1e-3);
  near(one.doseForPeak({ cmax: 30, tau: 12 }, { V: 45.5, k: Kv }), 856.035, 0.01);
  const v = one.ss({ dose: 1000, tau: 12, tinf: 0 }, { V: 45.5, k: Kv });
  near(v.cmax, 35.0453, 1e-3); near(v.cmin, 13.0673, 1e-3);
});

test("DERIVED: retrospective (bolus form) K 0.137327, Vd 35.9807", () => {
  const sz = one.sawchukZaske({ peak: 30, trough: 10, dt: 8, tPeakAfterEnd: 1, dose: 1000, tau: 12, tinf: 0 });
  near(sz.k, 0.137327, 1e-6); near(sz.halfLife, 5.04637, 1e-4); near(sz.V, 35.9807, 1e-3);
});

test("DERIVED: lithium, digoxin, theophylline, SR, dialysis, LD", () => {
  const Li = { CL: 0.25 * 97.2222 * 0.06, V: 49 }, S = 8.12 / 300;
  near(renal.cgRaw(40, 70, 1, "M"), 97.2222, 1e-4);
  near(Li.CL, 1.45833, 1e-5); near(one.k(Li.CL, 49), 0.0297619, 1e-7); near(one.halfLife(Li.CL / 49), 23.2848, 1e-3);
  near(one.doseForAvg({ cavg: 0.8, tau: 12, S }, Li), 517.241, 1e-3);
  const li = one.ss({ dose: 600, tau: 12, tinf: 0, S }, Li);
  near(li.cavg, 0.928, 1e-3); near(li.cmax, 1.10356, 1e-4); near(li.cmin, 0.772129, 1e-5);
  // Digoxin (ng/mL → mg/L at the edge).
  near(renal.cgRaw(70, 73, 1, "M"), 70.9722, 1e-4);
  const dig = { CL: (0.8 * 73 + 70.9722) * 0.06, V: 3.8 * 73 + 3.12 * 70.9722 };
  near(dig.CL, 7.76233, 1e-4); near(dig.V, 498.833, 1e-3); near(dig.CL / dig.V, 0.015561, 1e-6); near(one.halfLife(dig.CL / dig.V), 44.5345, 1e-2);
  near(one.loadingDose({ cTarget: 0.001, V: dig.V, F: 0.7 }), 0.712619, 1e-6);
  near(one.doseForAvg({ cavg: 0.001, tau: 24, F: 0.7 }, dig), 0.266137, 1e-6);
  // Theophylline / aminophylline.
  const th = { CL: 0.04 * 70, V: 35 };
  near(th.CL / th.V, 0.08, 1e-12); near(one.halfLife(0.08), 8.6625, 1e-9);
  near(one.loadingDose({ cTarget: 10, V: 35, S: 0.84 }), 416.667, 1e-3);
  near(one.doseForAvg({ cavg: 10, tau: 12, S: 0.84 }, th), 400, 1e-9);
  near(one.tmaxOralSS(1.8, 0.08, 12), 1.52954, 1e-5);
  near(one.tmaxOral(1.8, 0.08), 1.81018, 1e-5);
  // Oral SS level at tmax is the max of the SS curve.
  const at = (t) => one.oralSS(t, 300, 1.8, 12, th);
  assert.ok(at(1.52954) > at(1.4) && at(1.52954) > at(1.65));
  near(one.dialysisFractionRemoved(6, 0.5, 50, 4), 0.405479, 1e-6);
  near(one.loadingDose({ cTarget: 15, cInitial: 5, V: 40 }), 400, 1e-12);
  near(one.equivalentDose(100, { S: 0.84 }, { S: 1 }), 84, 1e-12);
});

// ======================= crcl.md §8 =======================
test("CrCl: site-parity mode reproduces all 8 calculator cases", () => {
  const cases = [
    [65, 70, 80, "M", 1.2, 73, 63.37], [60, 64, 50, "F", 0.8, 50, 59.03], [50, 70, 150, "M", 1.0, 73, 91.25],
    [80, 67, 60, "M", 0.5, 60, 100], [40, 72, 90, "F", 1.0, 73.1, 86.3], [30, 58, 40, "M", 0.9, 40, 67.9],
    [70, 63, 95, "F", 1.5, 52.4, 28.87], [45, 69, 70, "M", 1, 70, 92.36],
  ];
  for (const [age, ht, wt, sex, scr, w, c] of cases) {
    const r = renal.cockcroftGault({ age, sex, scr, tbw: wt, heightIn: ht, preset: "site" });
    near(r.weight, w, 1e-9, `weight ${age}`);
    near(Math.round(r.crcl * 100) / 100, c, 1e-9, `CrCl ${age}`);
  }
});

test("CrCl: suite default policy (65 y, 70 in, 80 kg, M, SCr 1.2 → 63.37, unrounded)", () => {
  const r = renal.cockcroftGault({ age: 65, sex: "M", scr: 1.2, tbw: 80, heightIn: 70 });
  near(r.crcl, 63.368056, 1e-6);
  assert.equal(r.weightBasis, "IBW"); assert.equal(r.policy, "adjIfObese"); assert.equal(r.obese, false); assert.equal(r.scrFloored, false);
  // cm input gives the same answer.
  near(renal.cockcroftGault({ age: 65, sex: "M", scr: 1.2, tbw: 80, heightCm: 177.8 }).crcl, 63.368056, 1e-6);
});

test("CrCl: literature defaults — AdjBW when TBW > 1.2×IBW (129.75); SCr floor off unless set (71.43, SCI 100)", () => {
  const ob = renal.cockcroftGault({ age: 50, sex: "M", scr: 1.0, tbw: 150, heightIn: 70 });
  assert.equal(ob.weightBasis, "AdjBW"); near(ob.weight, 103.8, 1e-9); near(ob.crcl, 129.75, 1e-9);
  assert.ok(ob.flags.some((f) => f.code === "obese"));
  // Default threshold 1.2 × IBW: 88 kg (> 87.6) is obese, 87 kg is not. Threshold is configurable.
  assert.equal(renal.cockcroftGault({ age: 50, sex: "M", scr: 1, tbw: 88, heightIn: 70 }).weightBasis, "AdjBW");
  assert.equal(renal.cockcroftGault({ age: 50, sex: "M", scr: 1, tbw: 87, heightIn: 70 }).weightBasis, "IBW");
  assert.equal(renal.cockcroftGault({ age: 50, sex: "M", scr: 1, tbw: 90, heightIn: 70, obesityRatio: 1.3 }).weightBasis, "IBW");
  assert.equal(renal.cockcroftGault({ age: 50, sex: "M", scr: 1, tbw: 150, heightIn: 70, obesityRatio: 2.1 }).weightBasis, "IBW");
  near(renal.cockcroftGault({ age: 80, sex: "M", scr: 0.5, tbw: 60, heightIn: 67 }).crcl, 100, 1e-9, "floor OFF by default");
  const fl = renal.cockcroftGault({ age: 80, sex: "M", scr: 0.5, tbw: 60, heightIn: 67, scrFloor: 0.7 });
  near(fl.crcl, 71.43, 0.005); assert.equal(fl.scrUsed, 0.7); assert.equal(fl.scrFloored, true);
  near(renal.cockcroftGault({ age: 80, sex: "M", scr: 0.5, tbw: 60, heightIn: 67, roundScr: true, sci: true }).crcl, 100, 1e-9);
  near(renal.cockcroftGault({ age: 80, sex: "M", scr: 0.5, tbw: 60, heightIn: 67, roundScr: true }).crcl, 71.43, 0.005);
  near(renal.cockcroftGault({ age: 80, sex: "M", scr: 0.5, tbw: 60, heightIn: 67, scrFloor: 0.8 }).crcl, 62.5, 1e-9);
  assert.ok(renal.cockcroftGault({ age: 16, sex: "M", scr: 1, tbw: 60, heightIn: 67 }).flags.some((f) => f.code === "age<18"));
  // Amputation reduces IBW before weight selection.
  near(renal.cockcroftGault({ age: 60, sex: "M", scr: 1, tbw: 90, heightIn: 70, amputationPct: renal.AMPUTATION_PCT.belowKnee }).ibw, 73 * 0.941, 1e-9);
});

test("CrCl: non-steady-state (M, 60 y, 70 kg, SCr 1.0 → 2.0 over 48 h)", () => {
  const a = { age: 60, sex: "M", weight: 70, scr1: 1, scr2: 2, hours: 48 };
  const ch = renal.chowNonSteadyState(a);
  near(ch.prodMgH, 46.6667, 1e-4); near(ch.vd, 42, 1e-12);
  near(ch.k, 0.05332, 1e-5); near(ch.crcl, 37.32, 0.005); assert.equal(ch.converged, true);
  near(renal.jelliffeASHP({ age: 60, sex: "M", scr1: 1, scr2: 2, days: 2 }), 48.01, 0.005);
  near(renal.winterMassBalance(a), 31.6, 0.005);
  near(renal.cgRaw(60, 70, 2, "M"), 38.89, 0.005);
  // Sanity: unchanged SCr reduces exactly to CG; improving 2 → 1 over 48 h gives 78.15.
  const same = renal.chowNonSteadyState({ ...a, scr2: 1 });
  near(same.k, 0.111111, 1e-6); near(same.crcl, 77.78, 0.005);
  const imp = renal.chowNonSteadyState({ ...a, scr1: 2, scr2: 1 });
  near(imp.k, 0.111639, 1e-6); near(imp.crcl, 78.15, 0.005);
  near(renal.jelliffeASHP({ age: 60, sex: "M", scr1: 1, scr2: 1, days: 2 }), 85.71, 0.005);
  // Impossible data → unable to fit.
  const bad = renal.chowNonSteadyState({ ...a, scr1: 20, scr2: 0.1, hours: 0.5 });
  assert.equal(bad.converged, false); assert.ok(Number.isNaN(bad.crcl));
  // estimate(): CG plus Chow (selected).
  const est = renal.estimate({ age: 60, sex: "M", scr: 1, scr2: 2, hours: 48, tbw: 70, heightIn: 70 });
  assert.equal(est.selected, "chow"); near(est.crcl, 37.32, 0.005); near(est.crclCG, 77.78, 0.005);
});

test("Schwartz pediatric CrCl", () => {
  assert.equal(renal.schwartzK(1, "M"), 0.45);
  assert.equal(renal.schwartzK(8, "F"), 0.55);
  assert.equal(renal.schwartzK(15, "M"), 0.7);
  assert.equal(renal.schwartzK(15, "F"), 0.55);
  near(renal.schwartz(0.55, 120, 0.5), 132, 1e-9);
});

// ======================= two-comp-auc.md §9 =======================
const GOTI = { CL: 3.84, Vc: 58.4, Vp: 38.4, Q: 6.5 };
const RG = { dose: 1000, tau: 12, tinf: 2 };
test("2-comp TC1: modified Goti baseline (alpha 0.3105, beta 0.03585, peak 29.68, trough 16.35, AUC 520.8)", () => {
  const m = two.micro(GOTI);
  near(m.k10, 0.065753, 1e-6); near(m.k12, 0.111301, 1e-6); near(m.k21, 0.169271, 1e-6);
  near(m.alpha, 0.310477, 1e-6); near(m.beta, 0.0358485, 1e-7);
  near(m.thalfAlpha, 2.2325, 1e-3); near(m.thalfBeta, 19.336, 1e-3);
  near(m.Vss, 96.8, 1e-9); near(m.Vbeta, 107.12, 0.01); near(m.Vextrap, 120.21, 0.01); assert.equal(m.valid, true);
  const c = two.bolusCoefs(1000, m);
  near(c.A, 8.8043, 1e-3); near(c.B, 8.319, 1e-3);
  const back = two.fromMacro({ ...c, alpha: m.alpha, beta: m.beta, dose: 1000 });
  near(back.CL, 3.84, 1e-9); near(back.Vp, 38.4, 1e-9); near(back.Q, 6.5, 1e-9);
  const s = two.ss(RG, m);
  near(s.peak, 29.683, 0.001); near(s.trough, 16.346, 0.001); near(s.at(4), 24.985, 0.001);
  const tbl = { 0: 16.346, 1: 23.57, 2: 29.683, 3: 27.08, 4: 24.985, 8: 19.561, 9: 18.631, 10: 17.798 };
  for (const [t, v] of Object.entries(tbl)) near(s.at(+t), v, 0.001, `SS t=${t}`);
  near(s.at(0), s.at(12), 1e-9, "SS curve is periodic (carry-over at t=0 included)");
  near(s.auc24, 520.83, 0.005);
  near(two.auc24Site(RG, m), 519.35, 0.01);
  near(two.auc24Trapezoid(RG, m), 520.83, 0.01);
  near(two.single(2, 1000, 2, m), 14.586, 0.001); near(two.single(12, 1000, 2, m), 5.903, 0.001);
  near(two.loadingDoseExact(30, 2, m), 2057, 0.5); near(two.loadingDoseVss(30, m), 2904, 1e-9);
  // Superposition of many doses converges on the steady-state curve.
  const ev = one.regimen({ dose: 1000, tau: 12, n: 40, tinf: 2 });
  near(two.superpose(39 * 12 + 2, ev, m), s.peak, 1e-3);
  // 1-comp derived from the 2-comp levels (TC1 / TC6).
  const sz = one.sawchukZaske({ peak: s.at(4), trough: s.trough, dt: 8, tPeakAfterEnd: 2, dose: 1000, tau: 12, tinf: 2 });
  near(sz.k, 0.05304, 1e-5); near(sz.V, 72.53, 0.01); near(sz.CL, 3.847, 1e-3);
  near(sz.auc24, 519.87, 0.05); near(sz.cmax, 27.78, 0.01);
  near(sz.auc24TrapLog, 519.46, 0.05, "Method One");
});

test("2-comp TC2–TC5: Goti covariates and other regimens", () => {
  const g = two.gotiStructure({ crcl: 68, wt: 70 }, { clRef: 6.04, vcRef: 58.4, vpRef: 38.4, q: 6.5, vpScaled: true });
  near(g.CL, 3.8344, 1e-4);
  const s2 = two.ss(RG, two.micro(g));
  near(s2.peak, 29.71, 0.01); near(s2.trough, 16.38, 0.01); near(s2.auc24, 521.59, 0.01);
  // TC3: MC #2 true profile, published Goti CL 4.5 at CrCl 120.
  const g3 = two.gotiStructure({ crcl: 120, wt: 70 }, { clRef: 4.5, vcRef: 58.4, vpRef: 38.4, q: 6.5 });
  const m3 = two.micro(g3), r3 = { dose: 1012, tau: 12, tinf: 2 }, s3 = two.ss(r3, m3);
  near(m3.alpha, 0.316404, 1e-6); near(m3.beta, 0.041223, 1e-6);
  near(s3.auc24, 449.78, 0.01); near(s3.peak, 26.86, 0.01); near(s3.trough, 13.43, 0.01); near(s3.at(4), 21.99, 0.01);
  const sz3 = one.sawchukZaske({ peak: s3.at(4), trough: s3.trough, dt: 8, tPeakAfterEnd: 2, dose: 1012, tau: 12, tinf: 2 });
  near(sz3.CL, 4.513, 1e-3); near(sz3.V, 73.19, 0.01); near(sz3.auc24, 448.52, 0.01);
  // TC4: low CrCl, q36h.
  const m4 = two.micro({ ...GOTI, CL: 1.14 }), r4 = { dose: 1000, tau: 36, tinf: 2 }, s4 = two.ss(r4, m4);
  near(m4.alpha, 0.288645, 1e-6); near(m4.beta, 0.0114475, 1e-7); near(m4.thalfBeta, 60.55, 0.01);
  near(s4.peak, 34.14, 0.01); near(s4.trough, 19.34, 0.01); near(s4.at(4), 31.04, 0.01); near(s4.auc24, 584.8, 0.05);
  const ev4 = one.regimen({ dose: 1000, tau: 36, n: 5, tinf: 2 });
  const pk = [1, 2, 3, 5].map((n) => two.superpose((n - 1) * 36 + 2, ev4, m4));
  const tr = [1, 2, 3, 5].map((n) => two.superpose(n * 36 - 1e-9, ev4, m4));
  arr(pk, [15.24, 21.62, 25.85, 30.5], 0.006, "non-SS peaks"); arr(tr, [6.53, 10.86, 13.72, 16.87], 0.006, "non-SS troughs");
  const sz4 = one.sawchukZaske({ peak: s4.at(4), trough: s4.trough, dt: 32, tPeakAfterEnd: 2, dose: 1000, tau: 36, tinf: 2 });
  near(sz4.CL, 1.104, 1e-3); near(sz4.auc24, 603.8, 0.1);
  // TC5.
  for (const [dose, tau, peak, trough, cl1, auc1] of [[2000, 24, 40.95, 12.66, 3.685, 542.7], [3000, 36, 52.9, 9.82, 3.546, 564.0]]) {
    const m = two.micro(GOTI), r = { dose, tau, tinf: 2 }, s = two.ss(r, m);
    near(s.peak, peak, 0.01); near(s.trough, trough, 0.01); near(s.auc24, 520.83, 0.01);
    const sz = one.sawchukZaske({ peak: s.at(4), trough: s.trough, dt: tau - 4, tPeakAfterEnd: 2, dose, tau, tinf: 2 });
    near(sz.CL, cl1, 1e-3); near(sz.auc24, auc1, 0.1);
  }
});

test("2-comp TC7 / 1-comp MC #1 population mean (CL 7.87, Vd 45.5, 1000 mg q8h over 1 h)", () => {
  const s = one.ss({ dose: 1000, tau: 8, tinf: 1 }, { CL: 7.87, V: 45.5 });
  near(s.k, 0.17297, 1e-5); near(s.cmax, 27.0, 0.1, "spec value is hand-rounded"); near(s.cmax, 26.9327, 1e-4); near(s.cmin, 8.0, 0.05); near(s.auc24, 381.2, 0.05);
});

// ======================= bayesian-engine.md §7 =======================
const TC = { dose: 1500, tau: 24, tinf: 2 };
const ssPredict = (th, t) => one.ss(TC, th).at(t);
const tcSpec = (peak, trough) => ({ predict: ssPredict, obs: [{ t: 2, c: peak }, { t: 24, c: trough }],
  params: [{ name: "V", mean: 53.95, cv: 0.3 }, { name: "CL", mean: 2.875535, cv: 0.3 }], error: { cv: 0.1 } });

test("Bayes TC-1/TC-2: site MAP parameters reproduce the site's predicted levels", () => {
  const pop = one.ss(TC, { V: 53.95, CL: 2.875535 });
  near(pop.cmax, 36.54, 0.005); near(pop.cmin, 11.31, 0.005); near(pop.auc24, 521.6, 0.05);
  const a = one.ss(TC, { V: 53.19, CL: 2.0811 });
  near(a.cmax, 44.54, 0.02); near(a.cmin, 18.84, 0.02); near(a.auc24, 720.8, 0.2);
  const b = one.ss(TC, { V: 32.8, CL: 3.3448 });
  near(b.cmax, 45.29, 0.02); near(b.cmin, 4.8, 0.01); near(b.auc24, 448.4, 0.2);
});

test("Bayes TC-1 (peak 46 / trough 20): MAP fit near site Vd 53.19 / CL 2.081, never the local minimum", () => {
  const f = fit.map(tcSpec(46, 20));
  assert.equal(f.converged, true);
  // Site's unpublished SS() is not the published objective (bayesian-engine §9.1); with objective (c) at
  // nominal SS times the true minimum is V 53.64 / CL 2.017 (V +0.8%, CL −3.1% vs site). Regression-locked.
  rel(f.params.V, 53.19, 0.01, "Vd within 1% of site");
  rel(f.params.CL, 2.081, 0.035, "CL within 3.5% of site");
  near(f.params.V, 53.6394, 0.01); near(f.params.CL, 2.01715, 1e-4);
  assert.ok(f.objective <= fit.objective(tcSpec(46, 20), { V: 53.19, CL: 2.0811 }), "our point is a better minimum of (c)");
  assert.ok(Math.abs(f.params.V - 43.2031) > 5, "not the site's run-4 local minimum");
  near(f.priorPart + f.residualPart, f.objective, 1e-12);
  assert.ok(f.se.CL > 0 && f.se.V > 0);
});

test("Bayes TC-2 (peak 46 / trough 5): MAP fit within 1.5% of site Vd 32.80 / CL 3.345", () => {
  const f = fit.map(tcSpec(46, 5));
  assert.equal(f.converged, true);
  rel(f.params.V, 32.8, 0.015); rel(f.params.CL, 3.345, 0.015);
  near(f.params.V, 33.1253, 0.01); near(f.params.CL, 3.30031, 1e-4);
  assert.ok(Math.abs(f.params.V - 83.87) > 20 && Math.abs(f.params.CL - 4.473) > 0.5, "not the site's local minima");
  // Nelder-Mead fallback reaches the same minimum.
  const sp = tcSpec(46, 5);
  const nm = fit.nelderMead((phi) => fit.objective(sp, { V: Math.exp(phi[0]), CL: Math.exp(phi[1]) }), [Math.log(80), Math.log(1)]);
  rel(Math.exp(nm.x[0]), f.params.V, 1e-4); rel(Math.exp(nm.x[1]), f.params.CL, 1e-4);
});

// ======================= vanco-bayesian.md §9 =======================
test("Vanco §9.1: proportional-weighting identity (each term 1.234567901)", () => {
  for (const [pred, act] of [[60, 54], [30, 27], [3, 2.7]]) {
    const o = fit.objectiveParts({ predict: () => pred, obs: [{ t: 0, c: act }], params: [], error: { cv: 0.1 } }, {});
    near(o.res[0] ** 2, 1.234567901, 1e-9);
  }
  const pr = fit.objectiveParts({ predict: () => 0, obs: [], params: [{ name: "CL", mean: 4, cv: 0.1 }] }, { CL: 4.44444444444 });
  near(pr.pri[0] ** 2, 1.234567901, 1e-6);
});

test("Vanco §9.2: serial non-SS troughs, cumulative MAP fits (AUC ±3 mg·h/L of spec)", () => {
  const V = 45.5, CLpop = 1500 / 658, ev = one.regimen({ dose: 1500, tau: 24, n: 5, tinf: 2 });
  const troughs = [1, 2, 3, 4, 5].map((i) => one.superpose(24 * i - 1e-9, ev, { V, CL: 0.63 * CLpop }));
  arr(troughs, [15.95, 23.43, 26.94, 28.58, 29.35], 0.006, "true troughs");
  assert.deepEqual(troughs.map((x) => round.truncate(x, 1)), [15.9, 23.4, 26.9, 28.5, 29.3], "site truncates");
  near(one.ss({ dose: 1500, tau: 24, tinf: 2 }, { V, CL: 0.63 * CLpop }).auc24, 1044.4, 0.1);
  const expected = {
    "0.3/both": [804, 911, 963, 988, 1002], "0.3/CL": [804, 910, 963, 990, 1005],
    "0.2/both": [894, 977, 1007, 1019, 1025], "0.1/CL": [997, 1026, 1035, 1038, 1040], "0.1/both": [985, 1024, 1035, 1038, 1039],
  };
  const vds = { "0.3/both": [45.1, 45.3, 45.8, 46.2, 46.5], "0.1/both": [43.0, 44.6, 45.4, 45.7, 45.9] };
  for (const [key, aucs] of Object.entries(expected)) {
    const [cv, mode] = key.split("/");
    for (let n = 1; n <= 5; n++) {
      const f = fit.map({ predict: fit.oneCompPredictor(ev), error: { cv: +cv },
        obs: troughs.slice(0, n).map((c, i) => ({ t: 24 * (i + 1) - 1e-9, c })),
        params: [{ name: "V", mean: V, cv: 0.3, fit: mode === "both" }, { name: "CL", mean: CLpop, cv: 0.3 }] });
      near(1500 / f.params.CL, aucs[n - 1], 3, `${key} n=${n} AUC`);
      if (vds[key]) near(f.params.V, vds[key][n - 1], 0.051, `${key} n=${n} Vd`);
      if (mode === "CL") assert.equal(f.params.V, V, "Vd held at population");
    }
  }
});

test("Vanco §9.4: reference patient SS peak/trough, CL-only and CL+Vd MAP", () => {
  const r = { dose: 1000, tau: 12, tinf: 1 }, pop = { V: 45.5, CL: 3.3026 };
  const s = one.ss(r, pop);
  near(s.cmax, 36.458, 0.01); near(s.cmin, 16.407, 0.01); near(s.at(3), 31.53, 0.01); near(s.at(11.5), 17.01, 0.01);
  near(s.auc24, 605.6, 0.1); near(one.auc24TrapLog(s.cmax, s.cmin, s.k, 1, 12), 605.3, 0.1);
  const spec = (fitV) => ({ predict: (th, t) => one.ss(r, th).at(t), obs: [{ t: 3, c: 28 }, { t: 11.5, c: 12 }],
    params: [{ name: "V", mean: 45.5, fit: fitV }, { name: "CL", mean: 3.3026 }] });
  const a = fit.map(spec(false));
  near(a.params.CL, 4.0688, 1e-3); near(a.params.CL / a.params.V, 0.08943, 1e-5); near(a.objective, 0.977, 1e-3);
  near(one.doseForAUC({ auc24: 500, tau: 12 }, a.params), 1017, 0.5);
  const b = fit.map(spec(true));
  near(b.params.CL, 3.9639, 1e-3); near(b.params.V, 40.63, 0.01); near(b.objective, 0.6018, 1e-3);
  near(one.ss(r, b.params).auc24, 504.6, 0.1); near(one.doseForAUC({ auc24: 500, tau: 12 }, b.params), 991, 0.5);
});

test("fit: least squares recovers exact parameters from noiseless data; lognormal prior option runs", () => {
  const ev = one.regimen({ dose: 1000, tau: 12, n: 3, tinf: 1 });
  const truth = { V: 50, CL: 4 };
  const obs = [3, 11.5, 15, 23.5, 27, 35.5].map((t) => ({ t, c: one.superpose(t, ev, truth) }));
  const f = fit.leastSquares({ predict: fit.oneCompPredictor(ev), obs, params: [{ name: "V", mean: 30 }, { name: "CL", mean: 8 }] });
  rel(f.params.V, 50, 1e-6); rel(f.params.CL, 4, 1e-6); assert.ok(f.objective < 1e-12);
  const g = fit.map({ predict: fit.oneCompPredictor(ev), obs, priorType: "lognormal", params: [{ name: "V", mean: 45 }, { name: "CL", mean: 3.5 }] });
  assert.equal(g.converged, true); rel(g.params.CL, 4, 0.02);
  // Two-compartment MAP: fit Vc and CL only, hold Vp and Q (two-comp §6 C).
  const ev2 = one.regimen({ dose: 1000, tau: 12, n: 4, tinf: 2 });
  const m = two.micro(GOTI);
  const obs2 = [38, 46].map((t) => ({ t, c: two.superpose(t, ev2, m) }));
  const h = fit.map({ predict: fit.twoCompPredictor(ev2), obs: obs2,
    params: [{ name: "CL", mean: 3.84 }, { name: "Vc", mean: 58.4 }, { name: "Vp", mean: 38.4, fit: false }, { name: "Q", mean: 6.5, fit: false }] });
  rel(h.params.CL, 3.84, 1e-4); rel(h.params.Vc, 58.4, 1e-3); assert.equal(h.params.Vp, 38.4);
});

// ======================= PK.round =======================
test("round: increments, strengths, intervals, display", () => {
  assert.equal(round.roundTo(1017, 250), 1000);
  assert.equal(round.roundTo(1126, 250), 1250);
  assert.equal(round.roundTo(115.175, 10), 120);
  assert.equal(round.roundTo(1001, 250, "up"), 1250);
  assert.equal(round.roundTo(1000, 250, "up"), 1000);
  assert.equal(round.roundTo(1249, 250, "down"), 1000);
  assert.equal(round.roundToStrengths(1147, [300]).total, 1200);
  const c = round.roundToStrengths(330, [100, 30]);
  assert.equal(c.total, 330); assert.deepEqual(c.units, [{ strength: 100, count: 3 }, { strength: 30, count: 1 }]);
  assert.equal(round.snapInterval(10.1171), 12, "nearest of the usual list");
  assert.equal(round.snapInterval(10.1171, [8, 12, 24], "down"), 8);
  assert.equal(round.snapInterval(9.34, undefined, "up"), 12);
  assert.equal(round.truncate(28.58, 1), 28.5);
  assert.equal(round.fmt(41.147353, 2), "41.15");
  assert.equal(round.fmt(NaN), "—");
  assert.equal(round.sig(0.0822108, 3), "0.0822");
});

// Peck LBW vs the 32 cached values on the hidden "Pediatric Info" sheet of the site's
// Gentamicin_Vancomycin K_VD_Fitting_V2 workbook ([sex, height cm, LBW kg]; workbook uses lb / 2.2).
const PECK_WORKBOOK = [["F",86,12.49222896],["F",94.5,14.43551958],["F",101,16.05609441],["F",107.5,17.88023962],["F",115,20.34103271],["F",121.5,22.8715747],["F",127.5,25.60717563],["F",133,28.50641038],["F",138,31.50859477],["F",144,35.62411643],["F",151,41.21115991],["F",157,46.74437918],["F",160.5,50.31564866],["F",162,51.92763682],["F",162.5,52.47608874],["F",163,53.03016177],["M",87.5,12.81111059],["M",96,14.91729233],["M",102,16.53265046],["M",109,18.62176406],["M",115,20.64074631],["M",122,23.3276824],["M",127.5,25.73474805],["M",133.5,28.70326863],["M",138.5,31.48260342],["M",143.5,34.56833846],["M",149,38.34855286],["M",156,43.79920481],["M",163.5,50.51174637],["M",170,57.12776799],["M",173.5,61.01925668],["M",175,62.76062554]];

test("peckLBW returns kg and matches the site workbook's 32 cached values", () => {
  for (const [sex, cm, kg] of PECK_WORKBOOK) {
    const v = body.peckLBW(sex, cm / 2.54, 99);
    // exact pound vs the workbook's 2.2 differ by a fixed ratio 2.2 × 0.45359237 = 0.99790
    assert.ok(Math.abs(v / (kg * 2.2 * 0.45359237) - 1) < 1e-9, `${sex} ${cm} cm: ${v} vs ${kg}`);
    assert.ok(Math.abs(v / kg - 1) < 0.0025, `${sex} ${cm} cm within 0.25%`);
  }
});

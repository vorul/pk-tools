// Tests for pk-suite/phenytoin.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js (sets globalThis.PK), then the page's CALC-START…CALC-END block, so the tests exercise the published code.
// Sections: (1) every case from ../../phenytoin/tests/calc.test.js (Winter ch. 14 Q1–Q17 and the original checks), ported;
// (2) workbook cases T1–T10 from specs/phenytoin.md §8; (3) new features (Model setting, binding defaults, fits, Lambert W).
// Where the literature default changes a number (Q10, Q13/14, Q16, two binding checks), the original value is tested in
// the "site" model and the new value in the "literature" model, with the reason stated in the test name.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));
const html = fs.readFileSync(path.join(__dirname, "..", "phenytoin.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function(`${block}; return {
  SALT, POP, POP_SITE, POP_LIT, MODELS, SRC, popFor, albuminFactor, patientModel, adjustCalc, startCalc, twoCalc, stopCalc, loadCalc, interpCalc, historyCalc,
  predictCss, timeBetween, levelAfterHold, declineDays, simulate, bayesFit, bayesTimeFit, bayesTimeSpec, mapSS, gravesCloyd, gcImplied,
  chooseDose, giveAs, holdOptions, unitsFor, amounts, dailyCandidates, loadDose, t90, timeToFraction, FRACTIONS,
  lambertW, lambertWlog, lambertWo, mmDecline, mmLevel, ssMinMax, ssMinMaxZ, historyEvents };`)();

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
// Winter's examples: 70 kg adult male, 70 in tall (IBW 73 kg), normal albumin, Km 4. Default model = literature.
const base = { age: 45, sex: "M", wt: 70, ht: 70, htu: "in", cyp: "normal", alb: 4.4, renal: "normal", bind: "alb",
  free: NaN, freeTot: NaN, vpa: NaN, kmMode: "winter", km: 4, inc: "auto", model: "literature", albEq: "auto", icu: false, scr: NaN, a_method: "km" };
const site = { ...base, model: "site" };
const run = (fn, p, primary) => fn(p, M.patientModel(p, primary));
const MW = 252.27;

// =====================================================================
// (1) Ported from tests/calc.test.js: Winter's Basic Clinical Pharmacokinetics 6e, chapter 14
// =====================================================================

test("Q1: IV loading dose for 20 mg/L in a 70 kg adult is 989 mg", () => {
  const p = { ...base, s_load: "iv", s_loadTarget: 20, s_slow: false, s_form: "cap", s_tau: 12, s_target: 15 };
  const o = run(M.startCalc, p, NaN);
  near(o.load.exact, 989, 1);
  assert.equal(o.load.total, 1000, "rounded to 50 mg");
  near(o.load.minutes, 20, 0.01, "1000 mg at 50 mg/min");
});

test("Q2: one level of 8 mg/L on 300 mg/day capsules gives Vmax 414 and 355 mg/day for 15 mg/L", () => {
  const p = { ...base, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 30, a_level: 8, a_target: 15, a_trough: false };
  const o = run(M.adjustCalc, p, 8);
  near(o.Vm, 414, 0.5);
  near(o.plan.exact, 355, 0.5);
});

test("Q3: incremental load from 8 to 15 mg/L (V 45.5 L) is 346 mg", () => {
  const p = { ...base, l_mode: "load", l_level: 8, l_desired: 15, l_route: "iv", l_slow: false };
  const o = run(M.loadCalc, p, 8);
  near(o.load.exact, 346, 0.5);
  near(o.load.expected, 15, 0.1, "level after a 350 mg load");
});

test("Q4: steady-state time estimate (Eq 14.24) is 35 days at 14 mg/L on 300 mg/day, 80 kg", () => {
  const p = { ...base, wt: 80, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 0, a_level: 14, a_target: 15, a_trough: false };
  near(run(M.adjustCalc, p, 14).plan.ssTotal, 35, 0.2);
});

test("Q5: after a 1000 mg IV load in 60 kg, C0 = 23.5 mg/L; mass balance gives 337 mg/day eliminated", () => {
  const p = { ...base, wt: 60, s_load: "iv", s_loadTarget: 23.6, s_slow: false, s_form: "cap", s_tau: 24, s_target: 15 };
  const pm = M.patientModel(p, NaN);
  near(pm.V, 39, 0.01, "Vd");
  const ld = M.loadDose({ route: "iv", form: "cap", V: pm.V, Cfrom: 0, Cto: 23.6, p, slow: false });
  near((0.92 * 1000) / pm.V, 23.6, 0.05);
  assert.ok(ld.total >= 1000 && ld.total <= 1050);
  const q = { ...p, t_mode: "nss", t_form: "cap", t_dose: 300, t_tau: 24, t_c1: 23.5, t_c2: 11, t_days: 8, t_method: "mb", t_target: 15 };
  const o = run(M.twoCalc, q, 11);
  near(o.mb.elim, 337, 1);
  assert.ok(o.alerts.some((a) => /fell by more than half/.test(a.text)), "Winter's C2 ≥ ½ C1 rule flagged");
});

test("Q6: 20 → 26 mg/L over 10 days on 300 mg/day: 248.7 mg/day eliminated, Vmax 292, dose ≈ 250 mg/day", () => {
  const p = { ...base, t_mode: "nss", t_form: "cap", t_dose: 300, t_tau: 24, t_c1: 20, t_c2: 26, t_days: 10, t_method: "mb", t_target: 15 };
  const o = run(M.twoCalc, p, 26);
  near(o.mb.elim, 248.7, 0.1);
  near(o.mb.Vm, 292, 0.5);
  near(o.plan.exact, 250, 2);
});

test("Q7: decline from 26 to 15 mg/L with Km 4, Vmax 292, V 45.5 takes about 2 days", () => {
  near(M.declineDays(26, 15, 292, 4, 45.5), 2, 0.1);
});

test("Q8: 300 mg/day → 8 mg/L and 350 mg/day → 20 mg/L (acid) give Km 2.5, Vmax 393.75", () => {
  const p = { ...base, t_mode: "ss", t_form1: "susp", t_dose1: 300, t_tau1: 24, t_lvl1: 8, t_form2: "susp", t_dose2: 350, t_tau2: 24, t_lvl2: 20, t_target: 15 };
  const o = run(M.twoCalc, p, 20);
  near(o.Km, 2.5, 1e-9);
  near(o.Vm, 393.75, 1e-9);
  near(o.plan.exact, 337.5, 0.01, "acid dose for 15 mg/L");
  near(M.predictCss(322, 390, 2.5), 11.8, 0.05, "350 mg/day as capsules");
});

test("Q8 conversion: 334 mg acid is 363 mg as phenytoin sodium", () => {
  const p = { ...base, l_mode: "switch", l_from: "susp", l_fromDose: 334, l_fromTau: 24, l_curLevel: NaN, l_to: "cap", l_toTau: 24 };
  near(run(M.loadCalc, p, NaN).equiv, 363, 0.5);
});

test("Q9: decline 20 → 15 mg/L with Km 2.5, Vmax 390, V 52 takes 0.76 day", () => {
  near(M.declineDays(20, 15, 390, 2.5, 52), 0.76, 0.01);
});

test("Q10 [changed by literature default]: HD, albumin 3.3, level 5 → 11.9 mg/L (site/Winter 0.48); 6.58 mg/L (literature, Soriano 0.2·Alb + 0.1)", () => {
  const q = { alb: 3.3, renal: "hd", i_level: 5, i_route: "maint", i_hours: 10, i_eff: NaN, i_form: "inj" };
  near(run(M.interpCalc, { ...site, ...q }, 5).Cnb, 11.9, 0.15, "site");
  near(run(M.interpCalc, { ...base, ...q }, 5).Cnb, 5 / 0.76, 1e-9, "literature");
  near(run(M.interpCalc, { ...base, ...q, albEq: "winter" }, 5).Cnb, 11.9, 0.15, "Winter selectable in literature model");
});

test("Q12: CRRT at 2 L/h with a free level of 1.5 mg/L removes 72 mg/day", () => {
  const p = { ...base, bind: "free", free: 1.5, freeTot: 15, i_level: 15, i_route: "maint", i_hours: 10, i_eff: 2, i_form: "inj" };
  near(run(M.interpCalc, p, 15).crrt.removed, 72, 1e-9);
});

test("Q13/Q14 [changed by literature default]: HD, albumin 2.7, level 3 → 8.2 mg/L, range 3.65–7.3 (site); 4.69, range 6.4–12.8 (literature)", () => {
  const q = { alb: 2.7, renal: "hd", i_level: 3, i_route: "maint", i_hours: 10, i_eff: NaN, i_form: "inj" };
  const ps = { ...site, ...q }, pm = M.patientModel(ps, 3);
  near(pm.factor, 0.365, 0.001);
  const o = M.interpCalc(ps, pm);
  near(o.Cnb, 8.2, 0.05);
  near(o.range[0], 3.65, 0.01);
  near(o.range[1], 7.3, 0.01);
  near(15 * pm.factor, 5.5, 0.05);
  const ol = run(M.interpCalc, { ...base, ...q }, 3);
  near(ol.Cnb, 3 / 0.64, 1e-9);
  near(ol.range[0], 6.4, 1e-9);
  near(ol.range[1], 12.8, 1e-9);
});

test("Q16 [changed by literature default]: albumin 2.0, level 6 → 11.8 mg/L (site/Winter); 10.0 mg/L (literature, Anderson 0.25)", () => {
  const q = { alb: 2.0, i_level: 6, i_route: "maint", i_hours: 10, i_eff: NaN, i_form: "inj" };
  near(run(M.interpCalc, { ...site, ...q }, 6).Cnb, 11.8, 0.05);
  near(run(M.interpCalc, { ...base, ...q }, 6).Cnb, 10, 1e-9);
});

test("Q17: steady-state time estimate is 35.7 days at 18 mg/L on 350 mg/day, 60 kg", () => {
  const p = { ...base, wt: 60, a_form: "cap", a_dose: 350, a_tau: 24, a_days: 0, a_level: 18, a_target: 15, a_trough: false };
  near(run(M.adjustCalc, p, 18).plan.ssTotal, 35.7, 0.2);
});

test("Eq 14.8: valproate 70 mg/L lowers the total phenytoin level by about 40% (both models)", () => {
  for (const b of [base, site]) near(1 - M.patientModel({ ...b, bind: "vpa", vpa: 70 }, 10).factor, 0.39, 0.02);
});

// ---------- Binding, weights and population values ----------

test("albumin at or above normal is not corrected; HD at normal albumin: corrected with Winter 0.48 (site), not with Soriano (literature, factor capped at 1)", () => {
  assert.equal(M.patientModel({ ...base, alb: 4.8 }, 10).factor, 1);
  assert.equal(M.patientModel({ ...site, alb: 4.8 }, 10).factor, 1);
  near(M.patientModel({ ...site, alb: 4.8, renal: "hd" }, 10).factor, 0.9 * 0.48 + 0.1, 1e-9);
  assert.equal(M.patientModel({ ...base, alb: 4.8, renal: "hd" }, 10).factor, 1, "0.2 × 4.8 + 0.1 = 1.06, capped");
});
test("valproate at or below 20 mg/L falls back to the albumin correction (Winter in site, Anderson in literature)", () => {
  const pm = M.patientModel({ ...site, bind: "vpa", vpa: 15, alb: 3 }, 10);
  near(pm.factor, 0.9 * (3 / 4.4) + 0.1, 1e-9);
  assert.ok(pm.alerts.some((a) => /needs no valproate correction/.test(a.text)));
  near(M.patientModel({ ...base, bind: "vpa", vpa: 15, alb: 3 }, 10).factor, 0.85, 1e-9);
});
test("free level uses the paired total, or the tab's level when the pair is blank", () => {
  near(M.patientModel({ ...base, bind: "free", free: 2, freeTot: 10 }, 99).factor, 0.5, 1e-9);
  near(M.patientModel({ ...base, bind: "free", free: 2, freeTot: NaN }, 10).factor, 0.5, 1e-9);
  assert.ok(M.patientModel({ ...base, bind: "free", free: NaN }, 10).alerts.some((a) => a.lvl === "crit"));
});
test("CrCl 10–25 without dialysis asks for a free level", () => {
  assert.ok(M.patientModel({ ...base, renal: "mid" }, 10).alerts.some((a) => /free level/.test(a.text)));
});
test("obese patient: Vd uses IBW + 1.33 × excess, Vmax per kg uses IBW", () => {
  const pm = M.patientModel({ ...base, wt: 100 }, 10);
  near(pm.ibw, 73, 1e-9);
  near(pm.vdWt, 73 + 1.33 * 27, 1e-9);
  near(pm.V, 0.65 * (73 + 1.33 * 27), 1e-9);
  assert.equal(pm.dosingWt, 73);
});
test("female IBW is 45.5 + 2.3 per inch over 60; under 60 in uses actual weight", () => {
  near(M.patientModel({ ...base, sex: "F", ht: 64 }, 10).ibw, 45.5 + 2.3 * 4, 1e-9);
  assert.equal(M.patientModel({ ...base, ht: 50, wt: 25, age: 8 }, 10).ibw, 25);
});
test("age-based Km and Vmax follow the population table; under 6 months is flagged", () => {
  for (const b of [base, site]) {
    const km = (age) => M.patientModel({ ...b, age, kmMode: "age" }, 10).Km;
    assert.deepEqual([km(0.7), km(2), km(5), km(8), km(15), km(30), km(75)], [6.6, 6.6, 6.8, 6.5, 5.7, 4.3, 5.8]);
  }
  near(M.patientModel({ ...base, age: 0.7, wt: 8, ht: 28 }, 10).V, 8, 1e-9, "Vd 1 L/kg under 1 year");
  assert.ok(M.patientModel({ ...base, age: 0.2, wt: 5, ht: 24 }, 10).alerts.some((a) => /under 6 months/.test(a.text)));
});
test("CYP2C9 poor metabolizer halves population Vmax", () => {
  near(M.patientModel({ ...base, cyp: "pm" }, 10).VmPop, M.patientModel(base, 10).VmPop / 2, 1e-9);
});

// ---------- Model equations agree with each other ----------

test("simulation converges to the analytic steady state", () => {
  near(M.simulate(0, 400, 276, 414, 4, 45.5), M.predictCss(276, 414, 4), 0.01);
});
test("timeBetween matches simulation, rising and falling", () => {
  for (const [C1, R] of [[5, 276], [25, 250]]) {
    const css = M.predictCss(R, 414, 4), C2 = C1 + 0.9 * (css - C1);
    const t = M.timeBetween(C1, C2, R, 414, 4, 45.5);
    near(M.simulate(C1, t, R, 414, 4, 45.5), C2, 0.02);
  }
});
test("levelAfterHold inverts declineDays", () => {
  near(M.levelAfterHold(30, M.declineDays(30, 12, 350, 4, 45.5), 350, 4, 45.5), 12, 1e-6);
});
test("no steady state at or above Vmax", () => {
  assert.equal(M.predictCss(414, 414, 4), Infinity);
  assert.equal(M.predictCss(500, 414, 4), Infinity);
});
test("Bayesian fit recovers known Km and Vmax from simulated data when priors are close (now via PK.fit.map)", () => {
  const V = 45.5, Km = 5, Vm = 420, R = 320, C1 = 10;
  const C2 = M.simulate(C1, 7, R, Vm, Km, V);
  const fit = M.bayesFit({ C1, C2, t: 7, R, V, Km0: 5, KmSd: 3.5, Vm0: 430, VmSd: 210 });
  near(fit.pred, C2, 0.05 * C2, "fits the observed level");
  near(fit.Vm, Vm, 25);
});

// ---------- Deliverable doses ----------

test("capsule doses use 100 + 30 mg, at most two 30s per dose, doses within 30 mg", () => {
  for (let total = 30; total <= 800; total += 10) {
    for (const n of [1, 2, 3]) {
      const g = M.giveAs("cap", null, total, n);
      if (!g) continue;
      assert.equal(g.parts.reduce((a, b) => a + b, 0), total, `split of ${total} sums back`);
      for (const d of g.parts) assert.ok([0, 1, 2].some((b) => d - 30 * b >= 0 && (d - 30 * b) % 100 === 0), `${d} mg is not 100s plus up to two 30s`);
      assert.ok(Math.max(...g.parts) - Math.min(...g.parts) <= 30, `uneven split for ${total}`);
    }
  }
});
test("270 mg/day is not offered with capsules; 260 is, as 130 mg twice daily", () => {
  assert.equal(M.giveAs("cap", null, 270, 3), null);
  assert.deepEqual(M.giveAs("cap", null, 260, 3).parts, [130, 130]);
});
test("chewables are whole 50 mg tablets and aren't silently collapsed to once daily", () => {
  assert.ok(M.giveAs("chew", null, 250, 2).parts.every((d) => d % 50 === 0));
  assert.equal(M.giveAs("chew", null, 50, 2), null);
  const p = { ...base, a_form: "chew", a_dose: 300, a_tau: 24, a_days: 30, a_level: 12, a_target: 15, a_trough: false };
  assert.ok(run(M.adjustCalc, p, 12).alerts.some((a) => /prompt release/.test(a.text)));
});
test("capsule counts read correctly", () => {
  assert.equal(M.unitsFor("cap", 130), "1 × 100 + 1 × 30 mg");
  assert.equal(M.unitsFor("cap", 260), "2 × 100 + 2 × 30 mg");
  assert.equal(M.unitsFor("chew", 150), "3 × 50 mg");
});
test("the user's patient: 109 µmol/L on 100 mg q8h, 41.5 kg → 260 mg/day, hold 4 doses (both models)", () => {
  for (const b of [base, site]) {
    const p = { ...b, sex: "F", wt: 41.5, ht: 165 / 2.54, alb: 4.8, a_form: "cap", a_dose: 100, a_tau: 8, a_days: 30,
      a_level: (109 * MW) / 1000, a_target: (60 * MW) / 1000, a_trough: false };
    const o = run(M.adjustCalc, p, p.a_level);
    assert.equal(o.plan.rounded, 260);
    assert.deepEqual(o.plan.give.parts, [130, 130]);
    assert.equal(o.plan.holdDoses, 4);
    near((o.plan.CnbNew * 1000) / MW, 49, 1);
  }
});

// ---------- Invalid input and safety checks ----------

test("blank or zero inputs return invalid instead of numbers", () => {
  assert.ok(run(M.adjustCalc, { ...base, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 0, a_level: 0, a_target: 15 }, 0).invalid);
  assert.ok(run(M.adjustCalc, { ...base, a_form: "cap", a_dose: NaN, a_tau: 24, a_days: 0, a_level: 8, a_target: 15 }, 8).invalid);
  assert.ok(run(M.interpCalc, { ...base, i_level: NaN }, NaN).invalid);
  assert.ok(run(M.stopCalc, { ...base, x_c1: NaN, x_form: "cap", x_tau: 12, x_target: 15 }, NaN).invalid);
});
test("two steady-state levels that don't rise more than proportionally are rejected (no ABS(), spec §10)", () => {
  const p = { ...base, t_mode: "ss", t_form1: "cap", t_dose1: 300, t_tau1: 24, t_lvl1: 10, t_form2: "cap", t_dose2: 400, t_tau2: 24, t_lvl2: 12, t_target: 15 };
  const o = run(M.twoCalc, p, 12);
  assert.ok(o.invalid);
  assert.ok(o.alerts.some((a) => a.lvl === "crit"));
});
test("same dose twice can't solve Km", () => {
  const p = { ...base, t_mode: "ss", t_form1: "cap", t_dose1: 300, t_tau1: 24, t_lvl1: 10, t_form2: "cap", t_dose2: 300, t_tau2: 24, t_lvl2: 12, t_target: 15 };
  assert.ok(run(M.twoCalc, p, 12).invalid);
});
test("after stopping, a rising second level is rejected (absorption still going)", () => {
  assert.ok(run(M.stopCalc, { ...base, x_c1: 20, x_c2: 25, x_hours: 24, x_since: 0, x_target: 15, x_form: "cap", x_tau: 12 }, 25).invalid);
});
test("after stopping with one level, population Vmax is used and flagged", () => {
  const o = run(M.stopCalc, { ...base, x_c1: 30, x_c2: NaN, x_hours: 24, x_since: 0, x_target: 15, x_form: "cap", x_tau: 12 }, 30);
  assert.equal(o.source, "population");
  assert.ok(o.daysToTarget > 0);
});
test("toxic level is flagged critical above 30 mg/L", () => {
  const p = { ...base, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 60, a_level: 35, a_target: 15, a_trough: false };
  assert.ok(run(M.adjustCalc, p, 35).alerts.some((a) => a.lvl === "crit"));
});
test("load not needed when already at goal", () => {
  assert.ok(run(M.loadCalc, { ...base, l_mode: "load", l_level: 18, l_desired: 15, l_route: "iv", l_slow: false }, 18).load.none);
});
test("IV rates: 50 mg/min adult, 25 if slow, 1 mg/kg/min child; fosphenytoin 150 mg PE/min", () => {
  const ld = (route, p, slow) => M.loadDose({ route, form: "cap", V: 45.5, Cfrom: 0, Cto: 20, p, slow });
  assert.equal(ld("iv", base, false).rate, 50);
  assert.equal(ld("iv", base, true).rate, 25);
  assert.equal(ld("iv", { ...base, age: 8, wt: 25 }, false).rate, 25);
  assert.equal(ld("fos", base, false).rate, 150);
});
test("oral load is split into doses of no more than 400 mg", () => {
  const o = M.loadDose({ route: "oral", form: "cap", V: 45.5, Cfrom: 0, Cto: 20, p: base, slow: false });
  assert.ok(o.parts.every((d) => d <= 400));
  assert.equal(o.parts.reduce((a, b) => a + b, 0), o.total);
});

test("2,000 random patients and regimens never give impossible results (both models)", () => {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  for (let i = 0; i < 2000; i++) {
    const form = pick(["cap", "chew", "susp", "inj", "fos"]);
    const p = { ...base, model: pick(["literature", "site"]), icu: rnd() < 0.2, age: 1 + rnd() * 90, sex: pick(["M", "F"]), wt: 10 + rnd() * 140, ht: 40 + rnd() * 40,
      alb: 1.5 + rnd() * 3.5, renal: pick(["normal", "mid", "hd"]), kmMode: pick(["age", "winter"]), inc: pick(["auto", "10", "25"]),
      a_form: form, a_dose: 50 + rnd() * 300, a_tau: pick([24, 12, 8, 6]), a_days: rnd() * 60, a_level: 1 + rnd() * 40, a_target: 10 + rnd() * 10, a_trough: false };
    const o = run(M.adjustCalc, p, p.a_level);
    if (o.invalid) continue;
    const pl = o.plan;
    const ctx = JSON.stringify({ form, dose: p.a_dose, tau: p.a_tau, level: p.a_level, wt: p.wt, rounded: pl.rounded });
    assert.ok(isFinite(o.Vm) && o.Vm > o.R, `Vmax must exceed the current dose ${ctx}`);
    if (!pl.rounded) continue;
    assert.ok(pl.S * pl.rounded < o.Vm, `recommended dose below Vmax ${ctx}`);
    assert.ok(isFinite(pl.CnbNew) && pl.CnbNew > 0, `finite predicted level ${ctx}`);
    assert.ok(pl.give && pl.give.parts.reduce((a, b) => a + b, 0) === pl.rounded, `split sums to daily dose ${ctx}`);
    if (pl.rows.some((r) => r.Cnb >= 10 && r.Cnb <= 20)) assert.ok(pl.CnbNew >= 10 && pl.CnbNew <= 20 + 1e-9, `chosen dose in range ${ctx}`);
    if (pl.hold) {
      const starts = pl.hold.map((h) => h.start);
      for (let k = 1; k < starts.length; k++) assert.ok(starts[k] <= starts[k - 1] + 1e-9, `hold levels fall ${ctx}`);
      if (pl.holdDoses) assert.ok(pl.hold[pl.holdDoses].start >= 10 - 1e-9, `suggested hold stays ≥ 10 mg/L ${ctx}`);
    }
    for (const r of pl.recheck) assert.ok(r.day === null || (isFinite(r.day) && r.day >= 0), `recheck day valid ${ctx}`);
  }
});

// =====================================================================
// (2) Workbook cases, specs/phenytoin.md §8 (site model unless stated)
// =====================================================================
const wb = { ...site, age: 65, wt: 100, kmMode: "age" }; // > 59 y, male 70 in, 100 kg, Km 5.8

test("T1 Population Dosing (site): V 70.7915, Vmax 511, LD 1538.95, Css 24.7546, t90 35.028, fractions of SS, decline 1.9423 d", () => {
  const pm = M.patientModel(wb, 10), R = 0.92 * 450;
  near(pm.V, 70.7915, 1e-4); assert.equal(pm.VmPop, 511); assert.equal(pm.Km, 5.8);
  near(M.loadDose({ route: "iv", form: "cap", V: pm.V, Cfrom: 0, Cto: 20, p: wb, slow: false }).exact, 1538.95, 0.01);
  near(M.predictCss(R, pm.VmPop, pm.Km), 24.7546, 1e-4);
  near(M.t90(pm.Km, pm.V, pm.VmPop, R), 35.028, 1e-3);
  const exp = { 0.1: 0.5428, 0.15: 0.9141, 0.2: 1.3627, 0.5: 6.4234, 0.8: 21.436, 0.9: 35.086, 0.99: 84.805 };
  for (const [f, d] of Object.entries(exp)) near(M.timeToFraction(+f, R, pm.VmPop, pm.Km, pm.V), d, 1e-3, `f ${f}`);
  near(M.declineDays(20, 10, pm.VmPop, pm.Km, pm.V), 1.9423, 1e-4);
});
test("T1 [changed by literature default]: ≥ 60 y Vmax 6.0 → 438 mg/day, so 450 mg/day capsules predict Css 100 mg/L instead of 24.75", () => {
  const pm = M.patientModel({ ...wb, model: "literature" }, 10);
  assert.equal(pm.VmPop, 438);
  near(M.predictCss(0.92 * 450, pm.VmPop, pm.Km), 100.05, 0.01);
});
test("T2 One SS level placeholder: R 22.08, Vm 40.885, LD to 20 from 6.81 = 933.74 / 1014.93 mg", () => {
  const p = { ...wb, kmMode: "custom", km: 5.8, a_form: "cap", a_dose: 1000, a_tau: 1000, a_days: 0, a_level: 6.81, a_target: 15, a_trough: false };
  const o = run(M.adjustCalc, p, 6.81);
  near(o.R, 22.08, 1e-9); near(o.Vm, 40.885, 1e-3); near(o.VmPerKg, 0.5601, 1e-4);
  const pm = M.patientModel(p, 6.81);
  near((20 - 6.81) * pm.V, 933.74, 0.01); near(((20 - 6.81) * pm.V) / 0.92, 1014.93, 0.01);
});
test("T3 Two SS levels: Km 5.74757, Vm 508.941; load 15 from 9.9 = 361.04/392.43; Css at 50 mg 0.5711, t90 2.1437; decline 20→15 0.92547 d", () => {
  const p = { ...wb, t_mode: "ss", t_form1: "cap", t_dose1: 300, t_tau1: 24, t_lvl1: 6.81, t_form2: "cap", t_dose2: 350, t_tau2: 24, t_lvl2: 9.9, t_target: 15 };
  for (const m of ["site", "literature"]) {
    const o = run(M.twoCalc, { ...p, model: m }, 9.9);
    near(o.Km, 5.74757, 1e-4); near(o.Vm, 508.941, 1e-3); near(o.VmPerKg, 6.9718, 1e-4);
  }
  const o = run(M.twoCalc, p, 9.9), pm = M.patientModel(p, 9.9);
  near((15 - 9.9) * pm.V, 361.04, 0.01); near(((15 - 9.9) * pm.V) / 0.92, 392.43, 0.01);
  near(M.predictCss(0.92 * 50, o.Vm, o.Km), 0.5711, 1e-4);
  near(M.t90(o.Km, pm.V, o.Vm, 0.92 * 50), 2.1437, 1e-4);
  near(M.declineDays(20, 15, o.Vm, o.Km, pm.V), 0.92547, 1e-5);
});
test("T4 Two non-SS levels: eliminated 339.744, maintain 369.29 mg product, Vm 516.710; decline 40→20 3.2909 d", () => {
  const p = { ...wb, kmMode: "custom", km: 5.8, t_mode: "nss", t_form: "cap", t_dose: 450, t_tau: 24, t_c1: 7.42, t_c2: 14.85, t_days: 170 / 24, t_method: "mb", t_target: 15 };
  const o = run(M.twoCalc, p, 14.85), pm = M.patientModel(p, 14.85);
  near(o.mb.elim, 339.744, 1e-3); near(o.mb.elim / 0.92, 369.29, 0.01); near(o.mb.Vm, 516.71, 1e-3);
  near(M.declineDays(40, 20, o.mb.Vm, 5.8, pm.V), 3.2909, 1e-4);
});
test("T5 Two levels after stopping: 20 → 10 over 47 h → Vm 506.816 (6.9427 mg/kg/day); decline 40→20 3.3551 d", () => {
  const p = { ...wb, kmMode: "custom", km: 5.8, x_c1: 20, x_c2: 10, x_hours: 47, x_since: 0, x_target: 15, x_form: "cap", x_tau: 24 };
  const o = run(M.stopCalc, p, 10);
  near(o.Vm, 506.816, 1e-3); near(o.VmPerKg, 6.9427, 1e-4);
  near(M.declineDays(40, 20, o.Vm, 5.8, M.patientModel(p, 10).V), 3.3551, 1e-4);
});
const T6 = { ...site, sex: "F", wt: 70, ht: 70, kmMode: "winter", t_mode: "nss", t_form: "cap", t_dose: 300, t_tau: 24, t_c1: 20, t_c2: 26, t_days: 10, t_method: "bayesTime", t_target: 15 };
test("T6 Bayesian 2NonSteadyStateLevels (time-based): V 45.82, mass balance 248.507/291.726, prior Vm 479.5; saved fit OBJ 0.9596; true minimum Km ≈ 4.14, Vm ≈ 293.1, OBJ 0.9518", () => {
  const pm = M.patientModel(T6, 26);
  near(pm.V, 45.82175, 1e-5);
  const o = M.twoCalc(T6, pm);
  near(o.mb.elim, 248.507, 1e-3); near(o.mb.Vm, 291.726, 1e-3);
  assert.equal(o.bayesTimeVm0, 479.5);
  near(o.bayesTime.objective(4, 291.7), 0.95957, 0.001, "workbook objective at the saved Solver fit");
  near(o.bayesTime.f, 0.9519, 0.002, "true minimum (spec grid 0.9519)");
  assert.ok(o.bayesTime.f < 0.95957, "below the saved Solver value");
  near(o.bayesTime.Km, 4.15, 0.05); near(o.bayesTime.Vm, 293.25, 0.5); near(o.bayesTime.tPred, 10.012, 0.01);
  near(o.Km, o.bayesTime.Km, 1e-12, "selected method drives the plan");
  near(M.predictCss(276, 291.7, 4), 70.32, 0.05, "Css with saved fit");
  near(M.declineDays(26, 15, 291.7, 4, pm.V), 2.0736, 0.001);
});
test("T7 Lambert W: 1000 mg bolus, V 45.5, Km 4, Vmax 490 mg/day, 24 h → 13.2123 (Wo) / 13.2369 (exact W)", () => {
  const VmL = 490 / 24 / 45.5, C0 = 1000 / 45.5, x = (C0 / 4) * Math.exp((C0 - VmL * 24) / 4);
  near(x, 90.554, 1e-3); near(M.lambertWo(x), 3.30308, 1e-5); near(M.lambertW(x), 3.30923, 1e-5);
  near(M.mmDecline(C0, 24, VmL, 4, M.lambertWo), 13.2123, 1e-4);
  near(M.mmDecline(C0, 24, VmL, 4), 13.2369, 1e-4);
});
const ev8 = Array.from({ length: 30 }, (_, i) => ({ t: i * 6, dose: 100, S: 0.92 }));
test("T8 explicit Peak Trough sheet, population: trough before dose 8 = 6.148 (Wo); SS at 100 mg q6h Z 18.5255, min 16.4747, max 18.4967, avg 17.4857", () => {
  const pm = M.patientModel({ ...wb, wt: 70 }, 4), prm = { Km: pm.Km, VmL: pm.VmPop / 24 / pm.V, V: pm.V };
  near(pm.V, 45.5, 1e-9); near(prm.VmL, 0.448718, 1e-6);
  near(M.mmLevel(42, ev8, prm, null, M.lambertWo), 6.148, 0.001);
  near(M.mmLevel(42, ev8, prm), 6.1415, 0.001, "exact W");
  const z = M.ssMinMaxZ(92, 6, 45.5, prm.VmL, 5.8, M.lambertWo);
  near(z.Z, 18.5255, 1e-4); near(z.min, 16.4747, 1e-4); near(z.max, 18.4967, 1e-4); near(z.avg, 17.4857, 1e-4);
  near(M.predictCss((92 * 24) / 6, 490, 5.8), 17.4951, 1e-4, "MM Cssavg");
  near(M.t90(5.8, 45.5, 490, 368), 14.11, 0.01);
  const ex = M.ssMinMax(92, 6, 45.5, prm.VmL, 5.8);
  near(ex.max, z.Z, 1e-6, "exact SS peak equals the workbook Z");
});
test("T8 saved fit (Km 4.53025, Vmax/V 0.563621): trough 4.0556, peaks 2.0220/3.1829 (Wo), OBJ 0.72871; our MAP fit reaches a lower objective", () => {
  const sv = { Km: 4.53025, VmL: 0.563621, V: 45.5 }, pop = 0.448718;
  near(M.mmLevel(42, ev8, sv, null, M.lambertWo), 4.0556, 1e-4);
  near(92 / 45.5, 2.022, 1e-3, "peak after dose 1 = S·D/V");
  near(M.mmLevel(6, ev8, sv, null, M.lambertWo) + 92 / 45.5, 3.1829, 1e-3);
  const obj = ((4 - 4.0556) / 0.4) ** 2 + ((4.53025 - 5.8) / (0.4 * 5.8)) ** 2 + ((0.563621 - pop) / (0.4 * pop)) ** 2;
  near(obj, 0.72871, 1e-4);
  const z = M.ssMinMaxZ(92, 6, 45.5, 0.563621, 4.53025, M.lambertWo);
  near(z.min, 5.7733, 1e-4); near(z.max, 7.7952, 1e-4); near(z.avg, 6.7843, 1e-4);
  const p = { ...wb, wt: 70, h_form: "cap", h_dose: 100, h_tau: 6, h_n: 30, h_load: NaN, h_pre: NaN, h_preH: NaN, h_c1: 4, h_t1: 42, h_fit: "kmvm", h_target: 15 };
  const o = run(M.historyCalc, p, 4);
  assert.ok(o.fit.objective < 0.72871, `MAP objective ${o.fit.objective}`);
  near(o.Km, 4.53, 0.05); near(o.VmL, 0.5636, 0.002); near(o.V, 45.5, 1e-9, "Vd fixed");
  near(o.predictions[0].pred, 4.0556, 0.01);
});
test("T9 Vm Km effect: Vm 600, Km 4, V 50, 400 mg/day → Css 8.0, t90 5.1 d, 10% SS 0.11608 d; reference series", () => {
  near(M.predictCss(400, 600, 4), 8, 1e-9); near(M.t90(4, 50, 600, 400), 5.1, 1e-9);
  near(M.timeToFraction(0.1, 400, 600, 4, 50), 0.11608, 1e-5);
  near(M.timeToFraction(0.1, 400, 500, 4, 50), 0.2536, 1e-4); near(M.timeToFraction(0.15, 400, 500, 4, 50), 0.4252, 1e-4);
  near(M.timeToFraction(0.1, 400, 500, 8, 50), 0.5072, 1e-4); near(M.timeToFraction(0.15, 400, 500, 8, 50), 0.8504, 1e-4);
  near(M.timeToFraction(0.15, 400, 600, 4, 50), 0.1876, 1e-4);
});
test("T10 albumin multipliers (Winter): Alb 2.0 → ×1.9643, HD ×3.3742; table at Alb 4.0 / 3.6", () => {
  const mult = (alb, renal) => 1 / M.albuminFactor({ alb, renal, eq: "winter" }).factor;
  near(mult(2, "normal"), 1.9643, 1e-4); near(mult(2, "hd"), 3.3742, 1e-4);
  near(mult(4, "normal"), 1.0891, 1e-4); near(mult(3.6, "normal"), 1.1957, 1e-4); near(mult(4.4, "hd"), 1.8797, 1e-4);
});

// =====================================================================
// (3) New features
// =====================================================================

test("Model setting: literature is the default; site reproduces the workbook; the active model is reported", () => {
  assert.equal(M.patientModel({ ...base, model: undefined }, 10).model, "literature");
  assert.equal(M.patientModel(site, 10).model, "site");
  assert.ok(M.MODELS.literature && M.MODELS.site);
  assert.equal(M.popFor(70, "site").vm, 7); assert.equal(M.popFor(70, "literature").vm, 6);
  assert.equal(M.popFor(70, "literature").vmSd, 1.9); assert.equal(M.popFor(30, "literature").vm, 7);
  assert.ok(M.patientModel({ ...base, age: 85 }, 10).alerts.some((a) => /No population Vmax.Km data at 80/.test(a.text)), "≥ 80 y flagged");
  const p80 = M.patientModel({ ...base, age: 85 }, 10);
  assert.equal(p80.pop.vm, 6); near(p80.VmPopSd / p80.VmPop, 0.35, 1e-12, "prior CV ≥ 0.35 at ≥ 80 y"); assert.equal(p80.popSrc, "elderly80");
});
test("binding defaults: Anderson 0.25 (non-ESRD), Kane 0.29 (ICU), Soriano 0.2 (ESRD); Winter and Sheiner-Tozer selectable; capped at 1", () => {
  const f = (o) => M.albuminFactor({ model: "literature", renal: "normal", icu: false, eq: "auto", ...o });
  assert.equal(f({ alb: 3 }).use, "anderson"); near(f({ alb: 3 }).factor, 0.85, 1e-12);
  assert.equal(f({ alb: 3, icu: true }).use, "kane"); near(f({ alb: 3, icu: true }).factor, 0.97, 1e-12);
  assert.equal(f({ alb: 3, renal: "hd" }).use, "soriano"); near(f({ alb: 3, renal: "hd" }).factor, 0.7, 1e-12);
  near(f({ alb: 3, eq: "st" }).factor, 0.7, 1e-12); near(f({ alb: 3, renal: "hd", eq: "st" }).factor, 0.4, 1e-12);
  near(f({ alb: 3, eq: "winter" }).factor, 0.9 * 3 / 4.4 + 0.1, 1e-12);
  assert.equal(f({ alb: 4.4 }).factor, 1); assert.ok(f({ alb: 4.4 }).clamped);
  assert.equal(f({ alb: 3, model: "site" }).use, "winter", "site model default is Winter");
  for (const k of ["anderson", "kane", "soriano", "albClamp", "elderly80"]) assert.equal(M.SRC[k].verify, true, `${k} carries a verify badge`);
  for (const k of ["gravesCloyd", "elderlyLit", "mapSS"]) assert.equal(M.SRC[k].verify, false, `${k} approved, primary verified`);
  assert.match(M.SRC.kane.ref, /2013/); assert.doesNotMatch(M.SRC.kane.label + M.SRC.kane.ref, /2016/);
  assert.match(M.SRC.gravesCloyd.ref, /3824428/);
});
test("ICU and dialysis patients are prompted for a measured free level; not when one is used", () => {
  const msg = (p) => M.patientModel(p, 10).alerts.some((a) => /Send a free phenytoin level|obtain a free phenytoin level/.test(a.text));
  assert.ok(msg({ ...base, icu: true })); assert.ok(msg({ ...base, renal: "hd" })); assert.ok(msg({ ...base, renal: "lt10" }));
  assert.ok(!msg(base)); assert.ok(!msg({ ...base, icu: true, bind: "free", free: 1.5, freeTot: 10 }));
  assert.ok(!msg({ ...base, renal: "hd", bind: "free", free: 1.5, freeTot: 10 }));
});
test("decision Q1: dialysis or CrCl < 10 → Soriano capped at 1 with a mandatory (critical) free-level banner", () => {
  for (const renal of ["hd", "lt10"]) {
    const pm = M.patientModel({ ...base, renal, alb: 3 }, 10);
    assert.equal(pm.albEq, "soriano"); near(pm.factor, 0.7, 1e-12);
    assert.ok(pm.alerts.some((a) => a.lvl === "crit" && /Equation unreliable in ESRD: obtain a free phenytoin level .target 1–2 mg.L./.test(a.text)));
  }
  assert.equal(M.patientModel({ ...base, renal: "hd", alb: 4.8 }, 10).factor, 1, "capped at 1");
});
test("decision Q1: CrCl 10–25 not on dialysis → standard (Anderson) correction, no ESRD equation; free level required if Alb < 3.5", () => {
  const pm = M.patientModel({ ...base, renal: "mid", alb: 3 }, 10);
  assert.equal(pm.albEq, "anderson"); near(pm.factor, 0.85, 1e-12);
  assert.ok(pm.alerts.some((a) => a.lvl === "crit" && /required with albumin below/.test(a.text)));
  const hi = M.patientModel({ ...base, renal: "mid", alb: 3.8 }, 10);
  assert.ok(hi.alerts.some((a) => a.lvl === "warn" && /free level is recommended/.test(a.text)));
});
test("decision Q1: legacy ESRD forms are options only and carry the 75–200% over-prediction note (Palumbo 2026)", () => {
  const st = M.patientModel({ ...base, renal: "hd", alb: 3, albEq: "st" }, 10);
  near(st.factor, 0.4, 1e-12, "legacy 0.1·Alb + 0.1");
  assert.ok(st.alerts.some((a) => /75–200%/.test(a.text) && /42557917/.test(a.text) && /factor 0.700/.test(a.text)));
  assert.ok(M.patientModel({ ...base, renal: "hd", alb: 3, albEq: "winter" }, 10).alerts.some((a) => /75–200%/.test(a.text)));
  assert.ok(!M.patientModel({ ...base, renal: "hd", alb: 3 }, 10).alerts.some((a) => /75–200%/.test(a.text)), "not shown on the default");
});
test("site model unchanged for renal binding: HD uses Winter 0.48; CrCl < 10 without dialysis is non-ESRD", () => {
  near(M.patientModel({ ...site, renal: "hd", alb: 3.3 }, 5).factor, 0.9 * 0.48 * 0.75 + 0.1, 1e-12);
  near(M.patientModel({ ...site, renal: "lt10", alb: 3.3 }, 5).factor, 0.9 * 0.75 + 0.1, 1e-12);
  near(M.patientModel({ ...site, renal: "mid", alb: 3.3 }, 5).factor, 0.9 * 0.75 + 0.1, 1e-12);
});
test("decision: one-level Bayesian is the literature default in Adjust, Km 4 (Winter) shown as cross-check; site default stays Km assumed", () => {
  const q = { a_form: "cap", a_dose: 300, a_tau: 24, a_days: 30, a_level: 8, a_target: 15, a_trough: false, a_method: "default" };
  const lit = run(M.adjustCalc, { ...base, ...q }, 8);
  assert.equal(lit.method, "map"); near(lit.Km, lit.methods.map.Km, 1e-12);
  near(lit.methods.winter4.Vm, 414, 0.5, "Winter Q2 cross-check"); near(lit.methods.winter4.exact, 355, 0.5);
  assert.ok(lit.methods.winter4.rounded > 0 && isFinite(lit.methods.winter4.CnbAtChosen));
  assert.equal(run(M.adjustCalc, { ...base, ...q, a_method: undefined }, 8).method, "map");
  const s = run(M.adjustCalc, { ...site, ...q }, 8);
  assert.equal(s.method, "km"); near(s.Vm, 414, 0.5); near(s.plan.exact, 355, 0.5);
});
test("parameters are fitted on binding-corrected levels (spec §10): two SS levels at albumin 3.0", () => {
  const p = { ...base, alb: 3, t_mode: "ss", t_form1: "susp", t_dose1: 300, t_tau1: 24, t_lvl1: 8 * 0.85, t_form2: "susp", t_dose2: 350, t_tau2: 24, t_lvl2: 20 * 0.85, t_target: 15 };
  const o = run(M.twoCalc, p, p.t_lvl2);
  near(o.C1, 8, 1e-9); near(o.Km, 2.5, 1e-9); near(o.Vm, 393.75, 1e-9);
});
test("CrCl from PK.renal checks the renal status but does not change doses", () => {
  const p = { ...base, age: 70, scr: 3, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 30, a_level: 8, a_target: 15, a_trough: false };
  const pm = M.patientModel(p, 8);
  near(pm.crcl, PK.renal.cockcroftGault({ age: 70, sex: "M", scr: 3, tbw: 70, heightIn: 70, preset: "literature" }).crcl, 1e-9);
  assert.ok(pm.alerts.some((a) => /Cockcroft-Gault CrCl/.test(a.text)));
  assert.equal(run(M.adjustCalc, p, 8).plan.rounded, run(M.adjustCalc, { ...p, scr: NaN }, 8).plan.rounded);
});
test("Graves 1986 (PMID 3824428): Dnew = Dold·(Cnew/Cold)^0.2 → 368, 6.2 → 10 gives 404.9 (Bauer exponents 406.9); rounded up; implied curve passes both points", () => {
  near(M.gravesCloyd(368, 6.2, 10), 404.9, 0.05);
  near(368 * Math.pow(10, 0.199) * Math.pow(6.2, -0.196), 406.95, 0.05, "Bauer form, reference");
  assert.equal(M.gravesCloyd(300, 12, 12), 300, "no change at the same level");
  const g = M.gcImplied(368, 6.2, 10);
  near(M.predictCss(368, g.Vm, g.Km), 6.2, 1e-9); near(M.predictCss(g.Rnew, g.Vm, g.Km), 10, 1e-9);
  assert.equal(M.gcImplied(368, 6.2, 6.3), null, "target too close to the current level");
  const p = { ...base, a_method: "gc", a_form: "susp", a_dose: 368, a_tau: 24, a_days: 30, a_level: 6.2, a_target: 10, a_trough: false };
  const o = run(M.adjustCalc, p, 6.2);
  assert.equal(o.method, "gc"); near(o.plan.exact, 404.9, 0.05, "exact dose = Graves dose (S 1)");
  assert.ok(o.plan.rounded >= o.plan.exact && o.plan.rounded - o.plan.exact < 25, `rounded up to the next 25 mg step: ${o.plan.rounded}`);
  assert.ok(o.alerts.some((a) => /Graves 1986. is an empiric/.test(a.text)));
});
test("one-level Bayesian (MAP): balances the level against population priors; weak priors reproduce Km-assumed", () => {
  const m = M.mapSS({ R: 276, C: 8, Km0: 4, KmSd: 3.5, Vm0: 490, VmSd: 210 });
  near(m.pred, 8, 0.8, "close to the observed level");
  const weak = M.mapSS({ R: 276, C: 8, Km0: 4, KmSd: 400, Vm0: 490, VmSd: 49000 });
  near(weak.pred, 8, 0.01);
  const o = run(M.adjustCalc, { ...base, a_method: "map", a_form: "cap", a_dose: 300, a_tau: 24, a_days: 30, a_level: 8, a_target: 15, a_trough: false }, 8);
  assert.equal(o.method, "map"); near(o.Km, o.methods.map.Km, 1e-12); assert.ok(o.Vm > o.R);
});
test("Lambert W: exact identity w·e^w = x across 12 decades; mmDecline agrees with the integrated decline (Eq 14.25)", () => {
  for (let e = -6; e <= 6; e++) { const x = 10 ** e, w = M.lambertW(x); near(w * Math.exp(w), x, 1e-12 * Math.max(1, x)); }
  assert.ok(isFinite(M.lambertWlog(5000)), "no overflow for huge x");
  const V = 45.5, Vm = 400, Km = 4, VmL = Vm / 24 / V;
  const c = M.mmDecline(30, 36, VmL, Km);
  near(M.declineDays(30, c, Vm, Km, V), 1.5, 1e-9);
  near(c, M.levelAfterHold(30, 1.5, Vm, Km, V), 1e-6);
});
test("multi-dose Lambert W simulation converges to the exact bolus steady state, and its average to the MM Css", () => {
  const V = 45.5, VmL = 490 / 24 / V, Km = 5.8, ev = Array.from({ length: 600 }, (_, i) => ({ t: i * 8, dose: 100, S: 1 }));
  const ss = M.ssMinMax(100, 8, V, VmL, Km);
  near(M.mmLevel(600 * 8, ev, { Km, VmL, V }), ss.min, 1e-6);
  near(ss.avg, M.predictCss(300, 490, Km), 1e-9);
  assert.ok(ss.min < ss.avg && ss.avg < ss.max);
  assert.equal(M.ssMinMax(200, 8, V, VmL, Km).min, Infinity, "600 mg/day ≥ Vmax 490: no steady state");
});
test("dose history: load + maintenance events, pre-dose residual, level at a dose time excludes that dose", () => {
  const ev = M.historyEvents({ h_form: "cap", h_load: 1000, h_dose: 100, h_tau: 8, h_n: 4 });
  assert.deepEqual(ev.map((e) => [e.t, e.dose, e.S]), [[0, 1000, 0.92], [8, 100, 0.92], [16, 100, 0.92], [24, 100, 0.92]]);
  const prm = { Km: 4, VmL: 0.4, V: 45.5 };
  near(M.mmLevel(8, ev, prm), M.mmDecline(920 / 45.5, 8, 0.4, 4), 1e-12);
  near(M.mmLevel(0, ev, prm, { c0: 10, t0: -12 }), M.mmDecline(10, 12, 0.4, 4), 1e-12);
  assert.equal(M.mmLevel(5, [], prm), 0);
});
test("dose history fit: recovers simulated Km/Vmax from several troughs; optional Vd fit warns without a peak; recommends a deliverable dose", () => {
  const truth = { Km: 5, VmL: 0.5, V: 45.5 };
  const p = { ...base, h_form: "susp", h_dose: 100, h_tau: 8, h_n: 21, h_load: NaN, h_pre: NaN, h_preH: NaN, h_fit: "kmvm", h_target: 15 };
  const ev = M.historyEvents(p);
  const lv = [56, 104, 160].map((t) => ({ t, c: M.mmLevel(t, ev, truth) }));
  const o = run(M.historyCalc, { ...p, h_levels: lv }, lv[2].c);
  for (const q of o.predictions) near(q.pred, q.c, 0.03 * q.c, `fits level at ${q.t} h`);
  near(o.VmL, 0.5, 0.05);
  assert.ok(o.plan.rounded > 0 && o.plan.S * o.plan.rounded < o.Vm);
  assert.ok(isFinite(o.Cnb) && o.curve.length > 10);
  const ov = run(M.historyCalc, { ...p, h_levels: lv, h_fit: "kmvmvd" }, lv[2].c);
  assert.ok(ov.alerts.some((a) => /Fitting Vd without a peak/.test(a.text)));
  const peak = run(M.historyCalc, { ...p, h_levels: [...lv, { t: 161, c: M.mmLevel(161, ev, truth) }], h_fit: "kmvmvd" }, 10);
  assert.ok(!peak.alerts.some((a) => /Fitting Vd without a peak/.test(a.text)));
  assert.ok(peak.V !== 45.5 || peak.fit.converged);
});
test("dose history: no levels gives a population prediction; levels are binding-corrected before fitting", () => {
  const p = { ...base, h_form: "cap", h_dose: 100, h_tau: 8, h_n: 9, h_load: NaN, h_pre: NaN, h_preH: NaN, h_fit: "kmvm", h_target: 15 };
  const o = run(M.historyCalc, p, NaN);
  assert.equal(o.fit, null); near(o.Km, 4, 1e-12);
  assert.ok(o.alerts.some((a) => /population prediction/.test(a.text)));
  const q = { ...p, alb: 2.0, h_levels: [{ t: 64, c: 6 }] };
  near(run(M.historyCalc, q, 6).obs[0].c, 10, 1e-9, "6 ÷ (0.25·2 + 0.1)");
  assert.ok(run(M.historyCalc, { ...p, h_dose: NaN }, NaN).invalid);
});
test("time-based Bayesian rejects level pairs no Km/Vmax can connect (no silent result)", () => {
  const p = { ...T6, t_c1: 20, t_c2: 60, t_days: 0.5 };
  const o = run(M.twoCalc, p, 60);
  assert.ok(o.invalid || o.alerts.some((a) => a.lvl === "crit"));
});
test("Start tab reports time to fractions of steady state", () => {
  const o = run(M.startCalc, { ...base, s_load: "none", s_loadTarget: 20, s_slow: false, s_form: "cap", s_tau: 12, s_target: 15 }, NaN);
  assert.deepEqual(o.plan.fractions.map((x) => x.f), M.FRACTIONS);
  assert.ok(o.plan.fractions.every((x, i, a) => i === 0 || x.days > a[i - 1].days));
});

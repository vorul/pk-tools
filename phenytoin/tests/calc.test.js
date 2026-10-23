// Calculation tests for the phenytoin calculator (../index.html).
// Run from the project folder:  node --test tests/
// Loads the pure calculation block (between CALC-START and CALC-END) from the page itself,
// so these tests always exercise the code that is published.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function(`${block}; return {
  SALT, POP, patientModel, adjustCalc, startCalc, twoCalc, stopCalc, loadCalc, interpCalc,
  predictCss, timeBetween, levelAfterHold, declineDays, simulate, bayesFit, chooseDose, giveAs,
  holdOptions, unitsFor, amounts, dailyCandidates, loadDose };`)();

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
// Winter's examples: 70 kg adult male, 70 in tall (IBW 73 kg), normal albumin, Km 4.
const base = { age: 45, sex: "M", wt: 70, ht: 70, htu: "in", cyp: "normal", alb: 4.4, renal: "normal", bind: "alb",
  free: NaN, freeTot: NaN, vpa: NaN, kmMode: "winter", km: 4, inc: "auto" };
const run = (fn, p, primary) => fn(p, M.patientModel(p, primary));
const MW = 252.27;

// ---------- Winter's Basic Clinical Pharmacokinetics 6e, chapter 14 worked examples ----------

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
  // Winter rounds Vmax to 390 before predicting 350 mg/day of capsules (322 mg acid): 11.8 mg/L.
  near(M.predictCss(322, 390, 2.5), 11.8, 0.05, "350 mg/day as capsules");
});

test("Q8 conversion: 334 mg acid is 363 mg as phenytoin sodium", () => {
  const p = { ...base, l_mode: "switch", l_from: "susp", l_fromDose: 334, l_fromTau: 24, l_curLevel: NaN, l_to: "cap", l_toTau: 24 };
  near(run(M.loadCalc, p, NaN).equiv, 363, 0.5);
});

test("Q9: decline 20 → 15 mg/L with Km 2.5, Vmax 390, V 52 takes 0.76 day", () => {
  near(M.declineDays(20, 15, 390, 2.5, 52), 0.76, 0.01);
});

test("Q10: hemodialysis, albumin 3.3, level 5 → about 11.9 mg/L normal binding", () => {
  const p = { ...base, alb: 3.3, renal: "hd", i_level: 5, i_route: "maint", i_hours: 10, i_eff: NaN, i_form: "inj" };
  near(run(M.interpCalc, p, 5).Cnb, 11.9, 0.15);
});

test("Q12: CRRT at 2 L/h with a free level of 1.5 mg/L removes 72 mg/day", () => {
  const p = { ...base, bind: "free", free: 1.5, freeTot: 15, i_level: 15, i_route: "maint", i_hours: 10, i_eff: 2, i_form: "inj" };
  near(run(M.interpCalc, p, 15).crrt.removed, 72, 1e-9);
});

test("Q13/Q14: hemodialysis, albumin 2.7, level 3 → 8.2 mg/L; range 3.65–7.3; target 15 reads as 5.5", () => {
  const p = { ...base, alb: 2.7, renal: "hd", i_level: 3, i_route: "maint", i_hours: 10, i_eff: NaN, i_form: "inj" };
  const pm = M.patientModel(p, 3);
  near(pm.factor, 0.365, 0.001);
  const o = M.interpCalc(p, pm);
  near(o.Cnb, 8.2, 0.05);
  near(o.range[0], 3.65, 0.01);
  near(o.range[1], 7.3, 0.01);
  near(15 * pm.factor, 5.5, 0.05);
});

test("Q16: albumin 2.0, level 6 → 11.8 mg/L normal binding", () => {
  const p = { ...base, alb: 2.0, i_level: 6, i_route: "maint", i_hours: 10, i_eff: NaN, i_form: "inj" };
  near(run(M.interpCalc, p, 6).Cnb, 11.8, 0.05);
});

test("Q17: steady-state time estimate is 35.7 days at 18 mg/L on 350 mg/day, 60 kg", () => {
  const p = { ...base, wt: 60, a_form: "cap", a_dose: 350, a_tau: 24, a_days: 0, a_level: 18, a_target: 15, a_trough: false };
  near(run(M.adjustCalc, p, 18).plan.ssTotal, 35.7, 0.2);
});

test("Eq 14.8: valproate 70 mg/L lowers the total phenytoin level by about 40%", () => {
  const pm = M.patientModel({ ...base, bind: "vpa", vpa: 70 }, 10);
  near(1 - pm.factor, 0.39, 0.02);
});

// ---------- Binding, weights and population values ----------

test("albumin at or above normal is not corrected; hemodialysis still is", () => {
  assert.equal(M.patientModel({ ...base, alb: 4.8 }, 10).factor, 1);
  near(M.patientModel({ ...base, alb: 4.8, renal: "hd" }, 10).factor, 0.9 * 0.48 + 0.1, 1e-9);
});
test("valproate at or below 20 mg/L falls back to the albumin correction", () => {
  const pm = M.patientModel({ ...base, bind: "vpa", vpa: 15, alb: 3 }, 10);
  near(pm.factor, 0.9 * (3 / 4.4) + 0.1, 1e-9);
  assert.ok(pm.alerts.some((a) => /needs no valproate correction/.test(a.text)));
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
  const pm = M.patientModel({ ...base, wt: 100 }, 10); // IBW 73
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
  const km = (age) => M.patientModel({ ...base, age, kmMode: "age" }, 10).Km;
  assert.deepEqual([km(0.7), km(2), km(5), km(8), km(15), km(30), km(75)], [6.6, 6.6, 6.8, 6.5, 5.7, 4.3, 5.8]);
  near(M.patientModel({ ...base, age: 0.7, wt: 8, ht: 28 }, 10).V, 8, 1e-9, "Vd 1 L/kg under 1 year");
  assert.ok(M.patientModel({ ...base, age: 0.2, wt: 5, ht: 24 }, 10).alerts.some((a) => /under 6 months/.test(a.text)));
});
test("CYP2C9 poor metabolizer halves population Vmax", () => {
  near(M.patientModel({ ...base, cyp: "pm" }, 10).VmPop, M.patientModel(base, 10).VmPop / 2, 1e-9);
});

// ---------- Model equations agree with each other ----------

test("simulation converges to the analytic steady state", () => {
  const css = M.predictCss(276, 414, 4);
  near(M.simulate(0, 400, 276, 414, 4, 45.5), css, 0.01);
});
test("timeBetween matches simulation, rising and falling", () => {
  for (const [C1, R] of [[5, 276], [25, 250]]) {
    const css = M.predictCss(R, 414, 4), C2 = C1 + 0.9 * (css - C1);
    const t = M.timeBetween(C1, C2, R, 414, 4, 45.5);
    near(M.simulate(C1, t, R, 414, 4, 45.5), C2, 0.02);
  }
});
test("levelAfterHold inverts declineDays", () => {
  const t = M.declineDays(30, 12, 350, 4, 45.5);
  near(M.levelAfterHold(30, t, 350, 4, 45.5), 12, 1e-6);
});
test("no steady state at or above Vmax", () => {
  assert.equal(M.predictCss(414, 414, 4), Infinity);
  assert.equal(M.predictCss(500, 414, 4), Infinity);
});
test("Bayesian fit recovers known Km and Vmax from simulated data when priors are close", () => {
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
      for (const d of g.parts) {
        const ok = [0, 1, 2].some((b) => d - 30 * b >= 0 && (d - 30 * b) % 100 === 0);
        assert.ok(ok, `${d} mg is not 100s plus up to two 30s`);
      }
      assert.ok(Math.max(...g.parts) - Math.min(...g.parts) <= 30, `uneven split for ${total}`);
    }
  }
});
test("270 mg/day is not offered with capsules; 260 is, as 130 mg twice daily", () => {
  assert.equal(M.giveAs("cap", null, 270, 3), null);
  assert.deepEqual(M.giveAs("cap", null, 260, 3).parts, [130, 130]);
});
test("chewables are whole 50 mg tablets and aren't silently collapsed to once daily", () => {
  const g = M.giveAs("chew", null, 250, 2);
  assert.ok(g.parts.every((d) => d % 50 === 0));
  assert.equal(M.giveAs("chew", null, 50, 2), null, "50 mg/day can't be split into two doses");
  const p = { ...base, a_form: "chew", a_dose: 300, a_tau: 24, a_days: 30, a_level: 12, a_target: 15, a_trough: false };
  assert.ok(run(M.adjustCalc, p, 12).alerts.some((a) => /prompt release/.test(a.text)), "once-daily chewables are flagged");
});
test("capsule counts read correctly", () => {
  assert.equal(M.unitsFor("cap", 130), "1 × 100 + 1 × 30 mg");
  assert.equal(M.unitsFor("cap", 260), "2 × 100 + 2 × 30 mg");
  assert.equal(M.unitsFor("chew", 150), "3 × 50 mg");
});
test("the user's patient: 109 µmol/L on 100 mg q8h, 41.5 kg → 260 mg/day, hold 4 doses", () => {
  const p = { ...base, sex: "F", wt: 41.5, ht: 165 / 2.54, alb: 4.8, a_form: "cap", a_dose: 100, a_tau: 8, a_days: 30,
    a_level: (109 * MW) / 1000, a_target: (60 * MW) / 1000, a_trough: false };
  const o = run(M.adjustCalc, p, p.a_level);
  assert.equal(o.plan.rounded, 260);
  assert.deepEqual(o.plan.give.parts, [130, 130]);
  assert.equal(o.plan.holdDoses, 4);
  near((o.plan.CnbNew * 1000) / MW, 49, 1, "predicted µmol/L");
});

// ---------- Invalid input and safety checks ----------

test("blank or zero inputs return invalid instead of numbers", () => {
  assert.ok(run(M.adjustCalc, { ...base, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 0, a_level: 0, a_target: 15 }, 0).invalid);
  assert.ok(run(M.adjustCalc, { ...base, a_form: "cap", a_dose: NaN, a_tau: 24, a_days: 0, a_level: 8, a_target: 15 }, 8).invalid);
  assert.ok(run(M.interpCalc, { ...base, i_level: NaN }, NaN).invalid);
  assert.ok(run(M.stopCalc, { ...base, x_c1: NaN, x_form: "cap", x_tau: 12, x_target: 15 }, NaN).invalid);
});
test("two steady-state levels that don't rise more than proportionally are rejected", () => {
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
  const p = { ...base, x_c1: 20, x_c2: 25, x_hours: 24, x_since: 0, x_target: 15, x_form: "cap", x_tau: 12 };
  assert.ok(run(M.stopCalc, p, 25).invalid);
});
test("after stopping with one level, population Vmax is used and flagged", () => {
  const p = { ...base, x_c1: 30, x_c2: NaN, x_hours: 24, x_since: 0, x_target: 15, x_form: "cap", x_tau: 12 };
  const o = run(M.stopCalc, p, 30);
  assert.equal(o.source, "population");
  assert.ok(o.daysToTarget > 0);
});
test("toxic level is flagged critical above 30 mg/L", () => {
  const p = { ...base, a_form: "cap", a_dose: 300, a_tau: 24, a_days: 60, a_level: 35, a_target: 15, a_trough: false };
  assert.ok(run(M.adjustCalc, p, 35).alerts.some((a) => a.lvl === "crit"));
});
test("load not needed when already at goal", () => {
  const p = { ...base, l_mode: "load", l_level: 18, l_desired: 15, l_route: "iv", l_slow: false };
  assert.ok(run(M.loadCalc, p, 18).load.none);
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

// ---------- Randomized stress test ----------

test("2,000 random patients and regimens never give impossible results", () => {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  for (let i = 0; i < 2000; i++) {
    const form = pick(["cap", "chew", "susp", "inj", "fos"]);
    const p = { ...base, age: 1 + rnd() * 90, sex: pick(["M", "F"]), wt: 10 + rnd() * 140, ht: 40 + rnd() * 40,
      alb: 1.5 + rnd() * 3.5, renal: pick(["normal", "mid", "hd"]), kmMode: pick(["age", "winter"]), inc: pick(["auto", "10", "25"]),
      a_form: form, a_dose: 50 + rnd() * 300, a_tau: pick([24, 12, 8, 6]), a_days: rnd() * 60, a_level: 1 + rnd() * 40,
      a_target: 10 + rnd() * 10, a_trough: false };
    const o = run(M.adjustCalc, p, p.a_level);
    if (o.invalid) continue;
    const pl = o.plan;
    const ctx = JSON.stringify({ form, dose: p.a_dose, tau: p.a_tau, level: p.a_level, wt: p.wt, rounded: pl.rounded });
    assert.ok(isFinite(o.Vm) && o.Vm > o.R, `Vmax must exceed the current dose ${ctx}`);
    if (!pl.rounded) continue;
    assert.ok(pl.S * pl.rounded < o.Vm, `recommended dose below Vmax ${ctx}`);
    assert.ok(isFinite(pl.CnbNew) && pl.CnbNew > 0, `finite predicted level ${ctx}`);
    assert.ok(pl.give && pl.give.parts.reduce((a, b) => a + b, 0) === pl.rounded, `split sums to daily dose ${ctx}`);
    // When any option lands in range, the chosen one does too.
    const anyInRange = pl.rows.some((r) => r.Cnb >= 10 && r.Cnb <= 20);
    if (anyInRange) assert.ok(pl.CnbNew >= 10 && pl.CnbNew <= 20 + 1e-9, `chosen dose in range ${ctx}`);
    if (pl.hold) {
      const starts = pl.hold.map((h) => h.start);
      for (let k = 1; k < starts.length; k++) assert.ok(starts[k] <= starts[k - 1] + 1e-9, `hold levels fall ${ctx}`);
      if (pl.holdDoses) assert.ok(pl.hold[pl.holdDoses].start >= 10 - 1e-9, `suggested hold stays ≥ 10 mg/L ${ctx}`);
    }
    for (const r of pl.recheck) assert.ok(r.day === null || (isFinite(r.day) && r.day >= 0), `recheck day valid ${ctx}`);
  }
});

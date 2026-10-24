// Tests for pk-suite/digoxin.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js via require, then the page's CALC block (CALC-START … CALC-END) via new Function.
// Expected values: specs/digoxin.md §12 (live-server regression, site model) and §8 (worked examples),
// lit/digoxin-theophylline.md (literature model). Tolerances are stated per test.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "digoxin.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function("PK", `${block}; return { DIG, NG, siteRound, setup, patient, multipliers, popParams, popDoses, schedule, weekConc, weekLevels, phiOf,
  deliverable, roundDose, unitsText, describeSchedule, regimenOptions, loadingPlan, hoursOf, dowOf, parseEdits, buildHistory, weekHour,
  fitLevels, ssPredictor, historyPredictor, samplingCheck, levelFlags, targetFor, WB };`)(PK);

const near = (a, e, tol, msg) => assert.ok(Math.abs(a - e) <= tol, `${msg || ""} expected ${e} ± ${tol}, got ${a}`);
const rel = (a, e, r, msg) => near(a, e, Math.abs(e) * r, msg);
const SITE = { model: "site" }, LIT = { model: "literature" };

// ---------- §12.2 population regression (site model, exact to displayed precision) ----------
const base = { htUnit: "in", wtUnit: "kg", thyroid: "normal", inter: [], scrHours: 24 };
const P = (o) => ({ ...base, ...o });
const RUNS = [
  ["r01", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: true, form: "tablet" }), [73, 76, 7.3, 0.0107, 64.8, 514.5, 5.5, 0.735, 0.189]],
  ["r02", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: false, form: "tablet" }), [73, 76, 7.3, 0.0157, 44.1, 514.5, 8.1, 0.735, 0.278]],
  ["r03", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 2, chf: false, form: "tablet" }), [73, 38, 14.6, 0.0146, 47.5, 396, 5.8, 0.566, 0.199]],
  ["r04", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 2, chf: true, form: "tablet" }), [73, 38, 14.6, 0.0088, 78.7, 396, 3.5, 0.566, 0.12]],
  ["r05", P({ sex: "M", age: 40, ht: 70, wt: 80, scr: 1, chf: true, form: "iv" }), [73, 101.4, 5.5, 0.0116, 59.7, 593.8, 6.9, 0.594, 0.166]],
  ["r06", P({ sex: "M", age: 20, ht: 70, wt: 80, scr: 0.6, chf: true, form: "iv" }), [73, 202.8, 2.7, 0.0136, 51, 910.1, 12.4, 0.91, 0.298]],
  ["r07", P({ sex: "M", age: 100, ht: 70, wt: 80, scr: 5, chf: true, form: "iv" }), [73, 8.1, 68.4, 0.0063, 110, 302.7, 1.9, 0.303, 0.046]],
  ["r08", P({ sex: "M", age: 100, ht: 70, wt: 80, scr: 5, chf: false, form: "iv" }), [73, 8.1, 68.4, 0.0132, 52.5, 302.7, 4, 0.303, 0.096]],
  ["r09", P({ sex: "F", age: 30, ht: 64, wt: 50, scr: 0.8, chf: false, form: "elixir" }), [50, 81.2, 4.3, 0.0165, 42, 443.3, 7.3, 0.554, 0.219]],
  ["r10", P({ sex: "M", age: 50, ht: 72, wt: 150, scr: 1.2, chf: false, form: "capsule" }), [77.6, 80.8, 12.9, 0.0157, 44.1, 547, 8.6, 0.547, 0.206]],
  ["r11", P({ sex: "M", age: 65, ht: 70, wt: 80, scrOld: 1, scr: 2, scrHours: 24, chf: false, form: "tablet" }), [73, 27.2, 20.3, 0.0141, 49.1, 362.3, 5.1, 0.518, 0.175]],
  ["r12", P({ sex: "M", age: 65, ht: 70, wt: 80, scrOld: 2, scr: 1, scrHours: 48, chf: false, form: "tablet" }), [73, 76.8, 7.2, 0.0157, 44.1, 517, 8.1, 0.739, 0.278]],
  ["r13", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: false, form: "iv", inter: ["quinidine"] }), [73, 76, 7.3, 0.0111, 62.4, 360.2, 4, 0.36, 0.096]],
  ["r14", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: false, form: "iv", inter: ["amiodarone", "verapamil"] }), [73, 76, 7.3, 0.0058, 119.5, 514.5, 3, 0.514, 0.072]],
  ["r15", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: false, form: "iv", thyroid: "hyper" }), [73, 76, 7.3, 0.0157, 44.1, 668.9, 10.5, 0.669, 0.252]],
  ["r16", P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: false, form: "iv", inter: ["quinidine"], thyroid: "hypo" }), [73, 76, 7.3, 0.0111, 62.4, 252.1, 2.8, 0.252, 0.067]],
  ["r17", P({ sex: "M", age: 65, ht: 180, htUnit: "cm", wt: 132, wtUnit: "lb", scr: 1, chf: false, form: "tablet" }), [60, 62.5, 6.7, 0.0156, 44.4, 423, 6.6, 0.604, 0.226]],
  ["r18", P({ sex: "F", age: 55, ht: 175, htUnit: "cm", wt: 90, scr: 0.9, chf: false, form: "tablet" }), [66, 73.6, 8.5, 0.0158, 43.9, 480.4, 7.6, 0.686, 0.261]],
  ["r20", P({ sex: "M", age: 20, ht: 70, wt: 80, scr: 0.6, chf: false, form: "iv", thyroid: "hyper" }), [73, 202.8, 2.7, 0.0172, 40.3, 1183.2, 20.4, 1.183, 0.49]],
  ["r33", P({ sex: "F", age: 80, ht: 62, wt: 60, scr: 1.4, chf: false, form: "tablet" }), [50.1, 25.3, 16.4, 0.0145, 47.8, 269.3, 3.9, 0.385, 0.134]],
  ["r34", P({ sex: "M", age: 70, ht: 68, wt: 75, scr: 1.2, chf: true, form: "tablet", inter: ["amiodarone"] }), [68.4, 55.4, 9.4, 0.0051, 135.9, 432.8, 2.2, 0.618, 0.075]],
  ["r35", P({ sex: "M", age: 16, ht: 66, wt: 55, scr: 0.7, chf: false, form: "tablet" }), [55, 135.3, 2.8, 0.0171, 40.5, 631.1, 10.8, 0.902, 0.37]],
];
const site = (p) => {
  const pt = M.patient(p, SITE), par = M.popParams(pt, p, SITE), d = M.popDoses(par, p.form, 1 / M.NG, SITE);
  return { pt, par, d };
};
const NAMES = ["LBW", "CrCl", "CrT½", "K", "t½", "Vd", "CL", "LD", "MD"];
for (const [run, p, exp] of RUNS) {
  test(`site ${run}: all 9 population outputs match the live server exactly`, () => {
    const { pt, par, d } = site(p);
    const got = [pt.lbw, pt.crcl, pt.crT, par.k, par.thalf, par.V, par.CL, d.LD, d.MD];
    got.forEach((g, i) => near(g, exp[i], 1e-9, `${run} ${NAMES[i]}`));
  });
}

// ---------- §12.3 peak/trough regression (site model) ----------
// CmaxssExact is 0.1–0.7 % below the exact steady-state superposition (unexplained Φ(K), spec §4).
// Without Φ: within 0.75 %. With the empirical Φ (site default): within 0.05 %.
const R01 = RUNS[0][1];
const PEAKS = [
  ["r19", R01, "tablet", M.schedule(0.125, 7), 0.744767033596444, 0.582291663882935],
  ["r22", R01, "iv", M.schedule(0.125, 7), 1.06822581514529, 0.828510437264947],
  ["r23", R01, "iv", M.schedule(0.25, 7), 2.13645163029057, 1.65702087452989],
  ["r24", R01, "iv", M.schedule(0.25, 5), 1.85078974798375, 0.858891597431214],
  ["r27", R01, "iv", M.schedule(0.25, 6), 2.01186005716526, 1.20699608161398],
  ["r20", RUNS.find((r) => r[0] === "r20")[1], "iv", M.schedule(0.25, 7), 0.619594583232385, 0.411811354120245],
  ["r21", RUNS.find((r) => r[0] === "r07")[1], "iv", M.schedule(0.25, 7), 5.87308615780974, 5.05690808727176],
  ["r33", RUNS.find((r) => r[0] === "r33")[1], "tablet", M.schedule(0.125, 7), 1.09246442893341, 0.782654515728809],
  ["r34", RUNS.find((r) => r[0] === "r34")[1], "tablet", M.schedule(0.125, 7), 1.74862892246235, 1.55508780143342],
  ["r35", RUNS.find((r) => r[0] === "r35")[1], "tablet", M.schedule(0.125, 7), 0.405913189382426, 0.27392088326486],
];
for (const [run, p, form, sched, cmax, cmin] of PEAKS) {
  test(`site ${run}: CmaxssExact/CminssExact (Φ applied ±0.05 %, raw ±0.75 %)`, () => {
    const { par } = site({ ...p, form });
    const lv = M.weekLevels(sched, par, form, SITE);
    rel(lv.peak * M.NG, cmax, 5e-4, `${run} peak`);
    rel(lv.trough * M.NG, cmin, 5e-4, `${run} trough`);
    const raw = M.weekLevels(sched, par, form, { model: "site", phi: "off" });
    rel(raw.peak * M.NG, cmax, 7.5e-3, `${run} raw peak`);
    assert.ok(raw.peak * M.NG > cmax, "site value is below the exact superposition");
    // Trough/peak ratio is exact: Cmin = Cmax·e^(−K(gap − tin)).
    rel(lv.trough / lv.peak, cmin / cmax, 1e-9, `${run} ratio`);
  });
}
test("site r23 = 2 × r22 (linear in dose)", () => {
  const { par } = site({ ...R01, form: "iv" });
  rel(M.weekLevels(M.schedule(0.25, 7), par, "iv", SITE).peak, 2 * M.weekLevels(M.schedule(0.125, 7), par, "iv", SITE).peak, 1e-12);
});

// ---------- K fit (site model, QD steady state) ----------
test("site r25/r26: 0.125 mg tablet QD, 0.9 ng/mL at 24 h → KFit 0.0072, t½ 96.2, CL 3.7044, MD 0.127, Cmax 1.066090", () => {
  const { par } = site(R01);
  const sched = M.schedule(0.125, 7);
  const f = M.fitLevels({ obs: [{ t: 24, c: 0.9 / M.NG }], predict: M.ssPredictor(sched, "tablet", SITE), par0: par, method: "cl", cfg: SITE });
  near(f.k, 0.0072, 1e-12, "KFit");
  near(f.thalf, 96.2, 1e-9, "t½ (banker's 96.25 → 96.2)");
  near(f.CL, 3.7044, 1e-9, "CL unrounded");
  near(f.V, 514.5, 1e-9, "Vd unchanged");
  near(M.popDoses(f, "tablet", 1 / M.NG, SITE).MD, 0.127, 1e-12, "MD");
  const lv = M.weekLevels(sched, f, "tablet", SITE);
  rel(lv.peak * M.NG, 1.06609040937869, 5e-4, "Cmax");
  rel(lv.trough * M.NG, 0.903389149968149, 5e-4, "Cmin");
});
test("site r32: 0.25 mg IV QD, 1.2 ng/mL at 12 h → KFit 0.0168", () => {
  const { par } = site({ ...R01, form: "iv" });
  const f = M.fitLevels({ obs: [{ t: 12, c: 1.2 / M.NG }], predict: M.ssPredictor(M.schedule(0.25, 7), "iv", SITE), par0: par, method: "cl", cfg: SITE });
  near(f.k, 0.0168, 1e-12);
});

// ---------- §8 worked examples, server values ----------
test("Ex 1 (server): IV F = 1 gives LD 0.514 mg; LD split 0.735 → 0.3675/0.18375/0.18375 exact", () => {
  const { par } = site({ ...R01, form: "iv" });
  near(M.popDoses(par, "iv", 1 / M.NG, SITE).LD, 0.514, 1e-12);
  const parts = [0.5, 0.25, 0.25].map((f) => 0.735 * f);
  near(parts[0], 0.3675, 1e-12); near(parts[1], 0.18375, 1e-12);
  const lp = M.loadingPlan(0.735, "tablet");
  assert.deepEqual(lp.parts, [0.375, 0.1875, 0.1875], "rounded to 62.5 mcg tablet steps");
});
test("Ex 3 (server r34): predicted trough 1.555 is flagged above the HF target", () => {
  const p = RUNS.find((r) => r[0] === "r34")[1];
  const { par } = site(p);
  const lv = M.weekLevels(M.schedule(0.125, 7), par, "tablet", SITE);
  const fl = M.levelFlags(lv.trough * M.NG, M.targetFor("lit", "hf"), "Trough");
  assert.equal(fl[0].lvl, "crit");
});
test("site rounding emulates VBScript ties: 0.5145 → 0.514, 96.25 → 96.2, 65.97 → 66.0", () => {
  assert.equal(M.siteRound(514.5 / 1000, 3), 0.514);
  assert.equal(M.siteRound(0.693 / 0.0072, 1), 96.2);
  assert.equal(M.siteRound(65.97, 1), 66);
});

// ---------- Literature model ----------
const EX1 = P({ sex: "M", age: 65, ht: 70, wt: 80, scr: 1, chf: true, form: "tablet" });
const lit = (p, cfg = LIT) => { const pt = M.patient(p, cfg); return { pt, par: M.popParams(pt, p, cfg) }; };
// Approved literature model (decisions/digoxin-theophylline.md): Reuning 3.8·Wt + 3.1·CrCl, Sheiner CL, ka 1.6 h⁻¹.
test("literature Ex 1: Reuning Vd 513.1 (3.8·73 + 3.1·76.04), Sheiner-CHF CL 5.552, LD 733 mcg, MD 190.3 mcg (spec §8; ±0.1 %)", () => {
  const { pt, par } = lit(EX1);
  near(pt.ibw, 73, 1e-9); near(pt.lbw, 73, 1e-9); rel(pt.crcl, 76.04, 1e-3);
  assert.equal(par.vdEq, "reuning");
  rel(par.V, 513.1, 1e-3, "Reuning Vd (spec §8 Reuning 513.1)");
  rel(par.V, 3.8 * 73 + 3.1 * pt.crcl, 1e-12, "3.1, not the site's 3.12");
  rel(par.CL, 5.552, 1e-3, "Sheiner CHF");
  const d = M.popDoses(par, "tablet", 1 / M.NG, LIT);
  rel(d.LD * 1000, 513.1 / 0.7, 1e-3); rel(d.MD * 1000, 190.3, 1e-3);
  const lv = M.weekLevels(M.schedule(0.125, 7), par, "tablet", LIT);
  near(lv.phi, 1, 0, "no Φ in literature mode");
  rel(lv.cavg * M.NG, (0.7 * 125) / (par.CL * 24), 1e-9, "Cavg");
  assert.ok(lv.peak > lv.cavg && lv.trough < lv.cavg);
});
test("literature alternatives: Jusko (Bauer, absolute CrCl × Wt/70), Koup 1.303·CrCl + 40 (20 in CHF); site Koup uses 41", () => {
  const { pt, par } = lit(EX1, { ...LIT, vdEq: "jusko" });
  rel(par.V, (226 + (298 * pt.crcl) / (29.1 + pt.crcl)) * (73 / 70), 1e-12);
  rel(lit(EX1, { ...LIT, clEq: "koup" }).par.CL, (1.303 * 76.04 + 20) * 0.06, 1e-3);
  rel(lit({ ...EX1, chf: false }, { ...LIT, clEq: "koup" }).par.CL, (1.303 * 76.04 + 40) * 0.06, 1e-3);
  near(lit({ ...EX1, chf: false }, { ...SITE, clEq: "koup" }).par.CL, M.siteRound((1.303 * 76 + 41) * 0.06, 1), 1e-9);
  // Site Jusko keeps the info-page BSA/1.73 form (spec §3.5).
  const s = lit(EX1, { ...SITE, vdEq: "jusko" });
  near(s.par.V, M.siteRound((226 + (298 * s.pt.crclN) / (29.1 + s.pt.crclN)) * (s.pt.bsa / 1.73), 1), 1e-9);
});
test("Paulson-Welling is a selectable Vd option (verified against the workbooks); Reuning stays the literature default", () => {
  const sel = html.split('id="vdEq"')[1].split("</select>")[0];
  assert.match(sel, /value="paulson"/);
  assert.match(sel, /value="reuning"/); assert.match(sel, /value="jusko"/);
  assert.equal(M.setup(LIT).vdEq, "reuning"); assert.equal(M.setup(SITE).vdEq, "reuning");
  const { pt, par } = lit(EX1, { ...LIT, vdEq: "paulson" });
  rel(par.V, (4.5 + 0.028 * pt.crclN) * 73, 1e-12);
});
test("CHF input Yes / No / Unknown: Unknown uses the CHF Sheiner equation; no flat ×0.4", () => {
  const y = lit({ ...EX1, chf: "yes" }).par, n = lit({ ...EX1, chf: "no" }).par, u = lit({ ...EX1, chf: "unknown" }).par;
  near(u.CL, y.CL, 1e-12); assert.ok(u.chfAssumed); assert.ok(!y.chfAssumed);
  rel(y.CL, (0.33 * 73 + 0.9 * 76.04) * 0.06, 1e-3); rel(n.CL, (0.8 * 73 + 76.04) * 0.06, 1e-3);
  assert.ok(Math.abs(y.CL / n.CL - 0.4) > 0.1, "CHF is not a flat ×0.4");
  assert.match(html, /<select id="chf"><option value="unknown">/);
});
test("literature Ex 1 K-fit (V fixed): 0.125 mg QD tablet, 0.9 at 24 h, first-order ka 1.6 — matches an independent bisection on PK.one.oralSS", () => {
  const { par } = lit(EX1);
  const f = M.fitLevels({ obs: [{ t: 24, c: 0.9 / M.NG }], predict: M.ssPredictor(M.schedule(0.125, 7), "tablet", LIT), par0: par, method: "cl", cfg: LIT });
  near(f.V, par.V, 1e-9);
  let lo = 1e-4, hi = 0.1;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; PK.one.oralSS(24, 0.125, 1.6, 24, { V: par.V, k: m }, { F: 0.7 }) > 0.0009 ? (lo = m) : (hi = m); }
  rel(f.k, (lo + hi) / 2, 1e-5);
  rel(f.preds[0].pred, 0.0009, 1e-6, "fit reproduces the level");
  rel(f.k, 0.00746 * (495.6 / par.V), 0.05, "consistent with spec §8 CL 3.699 L/h (±5 %)");
});
test("literature Ex 1 NSS: 3 × 125 mcg q24, level 12 h after dose 3 → 0.362 ng/mL (spec bolus); zero-order ±1 %, first-order ±2 %", () => {
  const par = { V: 495.6, k: 0.0112 };
  const zo = [0, 24, 48].map((t) => ({ t, dose: 0.125, tinf: 1, F: 0.7 }));
  rel(M.historyPredictor(zo)(par)(60) * M.NG, 0.362, 0.01);
  const fo = [0, 24, 48].map((t) => ({ t, dose: 0.125, route: "oral", ka: 1.6, F: 0.7 }));
  rel(M.historyPredictor(fo)(par)(60) * M.NG, 0.362, 0.02);
});
test("literature Ex 2: F 80 y, 62 in, 60 kg, SCr 1.4, no CHF → Reuning 269.0, Sheiner 3.926, MD 134.6 (spec §8)", () => {
  const { pt, par } = lit(P({ sex: "F", age: 80, ht: 62, wt: 60, scr: 1.4, chf: false, form: "tablet" }));
  rel(pt.crcl, 25.35, 2e-3); rel(par.V, 269.0, 1e-3); rel(par.CL, 3.926, 1e-3);
  rel(M.popDoses(par, "tablet", 1 / M.NG, LIT).MD * 1000, 134.6, 2e-3);
});
test("literature Ex 3: amiodarone ×0.5 → Sheiner-CHF CL 2.173, Reuning 431.7, MD 74.5 mcg; 125 mcg daily flagged above the HF target", () => {
  const { par } = lit(P({ sex: "M", age: 70, ht: 68, wt: 75, scr: 1.2, chf: true, form: "tablet", inter: ["amiodarone"] }));
  rel(par.CL, 2.173, 1e-3); rel(par.V, 3.8 * 68.4 + 3.1 * 55.42, 1e-3);
  rel(M.popDoses(par, "tablet", 1 / M.NG, LIT).MD * 1000, 74.5, 2e-3);
  const lv = M.weekLevels(M.schedule(0.125, 7), par, "tablet", LIT);
  assert.ok(lv.trough * M.NG > 1.4 && lv.trough * M.NG < 1.7, `trough ${lv.trough * M.NG}`);
  assert.equal(M.levelFlags(lv.trough * M.NG, M.targetFor("lit", "hf"), "x")[0].lvl, "crit");
});
test("first-order oral absorption: weekly steady state equals PK.one.oralSS for daily dosing; peak later than the 1 h input", () => {
  const par = { V: 500, k: 0.01 };
  const sched = M.schedule(0.25, 7);
  rel(M.weekConc(30, sched, par, 0.7, 1, 1.6), PK.one.oralSS(6, 0.25, 1.6, 24, par, { F: 0.7 }), 1e-9);
  const lv = M.weekLevels(sched, par, "tablet", LIT);
  rel(lv.peak, PK.one.oralSS(PK.one.tmaxOralSS(1.6, 0.01, 24), 0.25, 1.6, 24, par, { F: 0.7 }), 1e-4);
  rel(lv.trough, PK.one.oralSS(0, 0.25, 1.6, 24, par, { F: 0.7 }), 1e-9);
  const ev = M.buildHistory({ start: 0, sched, form: "tablet" }, 48, LIT);
  assert.equal(ev[0].route, "oral"); assert.equal(ev[0].ka, 1.6);
  assert.equal(M.buildHistory({ start: 0, sched, form: "tablet" }, 48, SITE)[0].tinf, 1, "site keeps the 1 h zero-order input");
  assert.equal(M.buildHistory({ start: 0, sched, form: "iv" }, 48, LIT)[0].tinf, 0.25);
});
test("MAP priors: log-normal CV 35 % on CL and V, residual 0.15 ng/mL + 10 % (literature); identical to a direct PK.fit.map call", () => {
  const { par } = lit(EX1);
  assert.equal(M.setup(LIT).priorType, "lognormal"); assert.equal(M.setup(SITE).priorType, "normal");
  const pred = M.ssPredictor(M.schedule(0.125, 7), "tablet", LIT);
  const obs = [{ t: 24, c: 0.0009 }];
  const f = M.fitLevels({ obs, predict: pred, par0: par, method: "map", cv: {}, cfg: LIT });
  const d = PK.fit.map({ predict: (th, t) => pred({ V: th.V, k: th.CL / th.V })(t), obs, priorType: "lognormal",
    params: [{ name: "CL", mean: par.CL, cv: 0.35 }, { name: "V", mean: par.V, cv: 0.35 }], error: { type: "combined", cv: 0.1, sd: 0.00015 } });
  rel(f.CL, d.params.CL, 1e-6); rel(f.V, d.params.V, 1e-6);
  assert.ok(f.CL < par.CL, "a level above prediction lowers CL");
});
test("literature interaction factors per Lanoxin label differ from the site where lit says so", () => {
  const m = (ids, cfg) => M.multipliers({ inter: ids, thyroid: "normal" }, cfg).cl;
  near(m(["verapamil"], LIT), 0.6, 1e-12); near(m(["verapamil"], SITE), 0.75, 1e-12);
  near(m(["propafenone"], LIT), 0.6, 1e-12); near(m(["dronedarone"], LIT), 0.4, 1e-12);
  near(m(["amiodarone"], LIT), 0.5, 1e-12); near(m(["azole"], LIT), 0.55, 1e-12);
  const q = M.multipliers({ inter: ["quinidine"], thyroid: "hyper" }, LIT);
  near(q.cl, 0.65, 1e-12); near(q.vd, 0.91, 1e-12);
  near(M.multipliers({ inter: [], otherMult: 0.7, thyroid: "normal" }, LIT).cl, 0.7, 1e-12);
});
test("literature F: capsule 0.95 (site 1.0); elixir 0.8; IV 1", () => {
  assert.equal(M.setup(LIT).F.capsule, 0.95); assert.equal(M.setup(SITE).F.capsule, 1);
  assert.equal(M.setup(LIT).F.elixir, 0.8); assert.equal(M.setup(LIT).F.iv, 1);
});
test("literature targets: HF aim 0.7 (0.5–0.9); AF aim 0.9, < 1.2; site calculator aim 1", () => {
  assert.equal(M.targetFor("lit", "af").text, "<1.2 ng/mL"); assert.equal(M.targetFor("lit", "hf").text, "0.5–0.9 ng/mL");
  assert.deepEqual([M.targetFor("lit", "hf").aim, M.targetFor("lit", "hf").lo, M.targetFor("lit", "hf").hi], [0.7, 0.5, 0.9]);
  assert.deepEqual([M.targetFor("lit", "af").aim, M.targetFor("lit", "af").hi], [0.9, 1.2]);
  assert.equal(M.targetFor("siteCalc", "af").aim, 1);
  assert.equal(M.levelFlags(1.3, M.targetFor("lit", "af"), "x")[0].lvl, "crit");
  assert.equal(M.levelFlags(2.4, M.targetFor("lit", "hf"), "x")[0].lvl, "crit");
  assert.equal(M.levelFlags(0.95, M.targetFor("lit", "hf"), "x")[0].lvl, "warn");
});
test("literature: no rounding; obese patient uses AdjBW for CrCl but min(IBW, TBW) for Sheiner/Paulson", () => {
  const { pt } = lit(P({ sex: "M", age: 50, ht: 72, wt: 150, scr: 1.2, chf: false, form: "tablet" }));
  near(pt.lbw, 77.6, 1e-9); assert.equal(pt.weightBasis, "AdjBW");
  rel(pt.crcl, ((140 - 50) * (77.6 + 0.4 * (150 - 77.6))) / (72 * 1.2), 1e-9);
});
test("literature: changing SCr uses Chow and flags renal decline", () => {
  const { pt } = lit(P({ sex: "M", age: 65, ht: 70, wt: 80, scrOld: 1, scr: 2, scrHours: 24, chf: false, form: "tablet" }));
  assert.match(pt.crclMethod, /Chow/);
  assert.ok(pt.crcl < 38 && pt.crcl > 15);
  assert.ok(pt.flags.some((f) => /declining/.test(f.text)));
});

// ---------- Schedules, products, history ----------
test("schedules: 5/week = Mon–Fri, 6/week = Mon–Sat; mixed 125 Mon–Fri + 62.5 Sat/Sun", () => {
  assert.deepEqual(M.schedule(0.25, 5), [0.25, 0.25, 0.25, 0.25, 0.25, 0, 0]);
  assert.deepEqual(M.schedule(0.25, 6), [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0]);
  assert.equal(M.describeSchedule(M.schedule(0.125, 5)), "125 mcg Mon–Fri (5 days/week; none Sat/Sun)");
  assert.equal(M.describeSchedule(M.schedule(0.125, 5, 0.0625)), "125 mcg Mon–Fri, 62.5 mcg Sat/Sun");
  assert.equal(M.describeSchedule(M.schedule(0.125, 7)), "125 mcg once daily");
});
test("products: tablets 62.5/125/250, elixir 0.25 mL of 50 mcg/mL, IV 250 or 100 mcg/mL", () => {
  assert.equal(M.roundDose(0.19, "tablet"), 0.1875);
  assert.equal(M.unitsText(0.1875, "tablet"), "1 × 125 mcg tablet + 1 × 62.5 mcg tablet");
  assert.equal(M.unitsText(0.1, "elixir"), "2 mL of 50 mcg/mL");
  assert.equal(M.unitsText(0.25, "iv"), "1 mL of 250 mcg/mL");
  assert.equal(M.unitsText(0.05, "iv"), "0.5 mL of 100 mcg/mL");
  assert.deepEqual(M.deliverable("tablet"), [0.0625, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5]);
});
test("regimen options pick a weekly schedule for a fractional need (e.g. 125 mcg 5 days/week style) and a daily one when exact", () => {
  // Need ≈ 0.107 mg/day: 125 daily is 17 % high; a weekly schedule gets closer.
  const par = { V: 500, CL: 3.0, k: 3.0 / 500 };
  const tgt = M.targetFor("custom", "hf", { aim: 0.7 * (0.107 / 0.1), lo: 0.5, hi: 1.0 });
  const target = { aim: 1000 * (0.7 * 0.107 * 7) / (3.0 * 168) / 0.7 * 0.7, lo: 0.3, hi: 1.2 };
  const opts = M.regimenOptions({ par, form: "tablet", target, cfg: LIT });
  assert.notEqual(opts[0].kind, "daily");
  rel(opts[0].weekly / 7, 0.107, 0.06);
  const daily = M.regimenOptions({ par, form: "tablet", target: { aim: (0.7 * 0.125) / (3 * 24) * 1000, lo: 0.3, hi: 2 }, cfg: LIT });
  assert.equal(daily[0].text, "125 mcg once daily");
  const only = M.regimenOptions({ par, form: "tablet", target, cfg: LIT, weekly: false });
  assert.ok(only.every((o) => o.kind === "daily"));
  void tgt;
});
test("dose history: days-per-week schedule with LD split and edits; superposition = steady state for a long history", () => {
  const start = M.hoursOf("2026-10-05T09:00"); // a Monday
  assert.equal(M.dowOf(start), 0);
  const until = M.hoursOf("2026-10-16T08:00");
  const sched = M.schedule(0.125, 5);
  const ev = M.buildHistory({ start, sched, form: "tablet", ld: 0.5, ldStart: start - 24, edits: M.parseEdits("2026-10-07 09:00 0\n2026-10-11 09:00 62.5") }, until, LIT);
  const ld = ev.filter((e) => e.t < start);
  assert.deepEqual(ld.map((e) => e.dose), [0.25, 0.125, 0.125]);
  const m = ev.filter((e) => e.t >= start);
  // Mon 5 – Fri 16 minus Wed 7, plus Sun 11 (62.5): weekdays 5,6,8,9,12,13,14,15 + 11
  assert.equal(m.length, 9);
  assert.ok(m.some((e) => Math.abs(e.dose - 0.0625) < 1e-12));
  assert.equal(M.weekHour(M.hoursOf("2026-10-14T09:00"), start), 48);
  // Long history converges to the weekly steady state.
  const par = { V: 500, k: 0.012 };
  const long = M.buildHistory({ start: M.hoursOf("2026-01-05T09:00"), sched, form: "tablet" }, until, LIT);
  rel(M.historyPredictor(long)(par)(until), M.weekConc(M.weekHour(until, start), sched, par, 0.7, 1, 1.6), 1e-6);
  const longSite = M.buildHistory({ start: M.hoursOf("2026-01-05T09:00"), sched, form: "tablet" }, until, SITE);
  rel(M.historyPredictor(longSite)(par)(until), M.weekConc(M.weekHour(until, start), sched, par, 0.7, 1), 1e-6, "site zero-order");
});
test("non-steady-state fit over a days-per-week history recovers the true CL (MAP and V-fixed)", () => {
  const start = M.hoursOf("2026-10-05T09:00");
  const sched = M.schedule(0.25, 5);
  const truth = { V: 450, CL: 4, k: 4 / 450 };
  const t1 = M.hoursOf("2026-10-12T08:00"), t2 = M.hoursOf("2026-10-14T21:00");
  const ev = M.buildHistory({ start, sched, form: "iv" }, t2, LIT);
  const pred = M.historyPredictor(ev);
  const obs = [{ t: t1, c: pred(truth)(t1) }, { t: t2, c: pred(truth)(t2) }];
  const f = M.fitLevels({ obs: [obs[0]], predict: pred, par0: { V: 450, CL: 6 }, method: "cl", cfg: LIT });
  rel(f.CL, 4, 1e-4, "V-fixed single level");
  const g = M.fitLevels({ obs, predict: pred, par0: { V: 500, CL: 5 }, method: "map", cv: { cl: 0.3, v: 0.3, assay: 0.1 }, cfg: LIT });
  assert.ok(Math.abs(g.CL - 4) < Math.abs(5 - 4), "MAP moves CL from the prior toward the truth");
  assert.ok(g.fit.converged);
});
test("sampling checks: site < 6 h excluded, oral 6–8 h warn; literature excludes oral < 6 h and IV < 4 h", () => {
  assert.equal(M.samplingCheck(4, "iv", SITE).lvl, "crit");
  assert.equal(M.samplingCheck(5.9, "tablet", SITE).lvl, "crit");
  assert.equal(M.samplingCheck(7, "tablet", SITE).lvl, "warn");
  assert.equal(M.samplingCheck(7, "iv", SITE), null);
  assert.equal(M.samplingCheck(10, "tablet", SITE).lvl, "info");
  assert.equal(M.samplingCheck(24, "tablet", SITE), null);
  assert.equal(M.samplingCheck(3.9, "iv", LIT).lvl, "crit");
  assert.equal(M.samplingCheck(4.5, "iv", LIT).lvl, "info", "IV 4–6 h usable");
  assert.equal(M.samplingCheck(6.5, "iv", LIT), null);
  assert.equal(M.samplingCheck(5.9, "tablet", LIT).lvl, "crit");
  assert.equal(M.samplingCheck(7, "tablet", LIT).lvl, "warn");
});
test("fit with an impossible level is flagged (level far above any CL)", () => {
  const f = M.fitLevels({ obs: [{ t: 24, c: 50 / M.NG }], predict: M.ssPredictor(M.schedule(0.0625, 1), "tablet", LIT), par0: { V: 500, CL: 5 }, method: "cl", cfg: LIT });
  assert.ok(f.flags.length);
});
test("age < 18 is flagged (site computes it anyway, r35)", () => {
  assert.ok(M.patient(RUNS.find((r) => r[0] === "r35")[1], SITE).flags.some((f) => f.lvl === "crit"));
});

// ---------- Workbook model (spec §13; workbook-checks/digoxin.md) ----------
// Cached values are hard-coded from the workbook dumps (hidden comparison sheets and the Parameter sheet of digoxinweb.xlsm).
// Patient-level rows marked "re-implemented" come from the dumped cell formulas, not from cached cells (the files were blank).
const WBK = { model: "workbook" };
const sheetPt = (crcl) => { const bsa = PK.body.bsa(70, 70 * 2.54); return { lbw: 70, crcl, bsa, crclN: (crcl * 1.73) / bsa }; };
const P0 = { inter: [], thyroid: "normal", chf: false };
test("workbook cached: BSA DuBois 70 kg / 70 in = 1.8695346 (sheet E3)", () => {
  near(PK.body.bsa(70, 70 * 2.54), 1.8695346303527745, 1e-12);
});
test("workbook cached: Reuning 3.1 row E8:N8, LBW 70, CrCl 150…60 (literature and workbook models)", () => {
  const crcls = [150, 140, 130, 120, 110, 100, 90, 80, 70, 60], cached = [731, 700, 669, 638, 607, 576, 545, 514, 483, 452];
  crcls.forEach((c, i) => {
    near(M.popParams(sheetPt(c), P0, { ...WBK, vdEq: "reuning" }).vRaw, cached[i], 1e-9, `workbook CrCl ${c}`);
    near(M.popParams(sheetPt(c), P0, { ...LIT, vdEq: "reuning" }).vRaw, cached[i], 1e-9, `literature CrCl ${c}`);
  });
});
test("workbook cached: Paulson 587.05700913 (E12, model default), Jusko BSA form 510.45083392 (E10)", () => {
  near(M.popParams(sheetPt(150), P0, WBK).vRaw, 587.05700913067608, 1e-8, "Paulson (workbook default)");
  near(M.popParams(sheetPt(150), P0, { ...LIT, vdEq: "paulson" }).vRaw, 587.05700913067608, 1e-8, "Paulson (literature option)");
  near(M.popParams(sheetPt(150), P0, { ...WBK, vdEq: "jusko" }).vRaw, 510.45083392337989, 1e-8, "Jusko");
  assert.equal(M.setup(WBK).vdEq, "paulson");
});
test("workbook cached: Koup 20/41 (D6:E7) and Sheiner LBW form (D15:E16), LBW 70", () => {
  const cl = (eq, chf, c) => M.popParams(sheetPt(c), { ...P0, chf }, { ...WBK, clEq: eq }).clRaw;
  near(cl("koup", true, 150), 12.927, 1e-9); near(cl("koup", true, 140), 12.1452, 1e-9);
  near(cl("koup", false, 150), 14.187, 1e-9); near(cl("koup", false, 140), 13.4052, 1e-9);
  near(cl("sheiner", true, 150), 9.486, 1e-9); near(cl("sheiner", true, 140), 8.946, 1e-9);
  near(cl("sheiner", false, 150), 12.36, 1e-9); near(cl("sheiner", false, 140), 11.76, 1e-9);
});
test("workbook cached Parameter sheet: F tablet 0.7, elixir 0.8, injection 1, capsule 1; CL factors; quinidine Vd 0.7; thyroid ±30 %", () => {
  assert.deepEqual(M.setup(WBK).F, { tablet: 0.7, elixir: 0.8, iv: 1, capsule: 1 });
  const PAR = { amiodarone: 0.5, canagliflozin: 0.8, carvedilol: 0.75, dronedarone: 0.5, azole: 0.5, propafenone: 0.75, quinidine: 0.5, ranolazine: 0.67, verapamil: 0.75 };
  for (const [id, v] of Object.entries(PAR)) near(M.multipliers({ inter: [id], thyroid: "normal" }, WBK).cl, v, 1e-12, id);
  near(M.multipliers({ inter: ["quinidine"], thyroid: "normal" }, WBK).vd, 0.7, 1e-12);
  const hy = M.multipliers({ inter: [], thyroid: "hyper" }, WBK), ho = M.multipliers({ inter: [], thyroid: "hypo" }, WBK);
  assert.deepEqual([hy.cl, hy.vd, ho.cl, ho.vd], [1.3, 1.3, 0.7, 0.7]);
});
test("workbook: one interaction only (the strongest), as the workbook's single drop-down", () => {
  const m = M.multipliers({ inter: ["verapamil", "amiodarone"], thyroid: "normal" }, WBK);
  near(m.cl, 0.5, 1e-12); assert.equal(m.count, 1); assert.ok(m.notes.some((n) => /one interaction/.test(n)));
  near(M.multipliers({ inter: ["verapamil", "amiodarone"], thyroid: "normal" }, SITE).cl, 0.375, 1e-12, "site still multiplies");
});
const wb = (p, cfg = WBK) => { const pt = M.patient(p, cfg); return { pt, par: M.popParams(pt, p, cfg) }; };
test("workbook re-implemented (KVD formulas): r01 V 464.39, CL 5.5517; r33 V 263.81; no rounding", () => {
  const a = wb(RUNS[0][1]);
  near(a.pt.lbw, 73, 1e-12); rel(a.pt.crcl, (75 * 73) / 72, 1e-12, "unrounded CG on LBW");
  near(a.par.V, 464.39, 0.01); near(a.par.CL, 5.5517, 1e-4);
  rel(a.par.V, (4.5 + (0.028 * a.pt.crcl * 1.73) / PK.body.bsa(80, 70 * 2.54)) * 73, 1e-12);
  near(wb(RUNS.find((r) => r[0] === "r33")[1]).par.V, 263.81, 0.01);
  // Literature Paulson equals the workbook when no SCr floor applies (check D1).
  rel(lit(RUNS[0][1], { ...LIT, vdEq: "paulson" }).par.V, a.par.V, 1e-12);
});
test("workbook: SCr floor 0.7 in adults (r06 SCr 0.6 → CrCl 173.8, V 639.11, CL 10.83); 0.5 with paralysis/malnutrition", () => {
  const r06 = RUNS.find((r) => r[0] === "r06")[1];
  const a = wb(r06);
  near(a.pt.scr, 0.7, 1e-12); assert.ok(a.pt.scrFloored); near(a.pt.crcl, (120 * 73) / (72 * 0.7), 1e-9);
  near(a.par.V, 639.11, 0.01); near(a.par.CL, 10.83, 0.005);
  const lo = { ...r06, scr: 0.4 };
  near(wb(lo).pt.scr, 0.7, 1e-12); near(wb({ ...lo, paraMal: true }).pt.scr, 0.5, 1e-12);
  near(wb({ ...lo, age: 15, paraMal: false }).pt.scr, 0.4, 1e-12, "no floor under 18");
});
test("workbook: interaction factor applied ONCE in CHF (r34 amiodarone CL 2.173, not digoxinweb's 1.087)", () => {
  const a = wb(RUNS.find((r) => r[0] === "r34")[1]);
  rel(a.par.CL, (0.33 * 68.4 + 0.9 * a.pt.crcl) * 0.06 * 0.5, 1e-12);
  near(a.par.CL, 2.173, 0.001); near(a.par.V, 405.20, 0.01);
});
test("workbook: Peck LBW under 18 y or < 48 in; lb ÷ 2.2", () => {
  const c = wb(P({ sex: "M", age: 10, ht: 50, wt: 30, scr: 0.5, chf: false, form: "elixir" }));
  near(c.pt.lbw, Math.min(PK.body.peckLBW("M", 50, 30), 30), 1e-12);
  near(wb(P({ sex: "M", age: 65, ht: 70, wt: 132, wtUnit: "lb", scr: 1, chf: false, form: "tablet" })).pt.abw, 60, 1e-12);
});
test("workbook: Chow for changing SCr reproduces the KVD Solver fit (r11 27.25/20.35 h, r12 76.81/7.22 h), unrounded", () => {
  const a = wb(RUNS.find((r) => r[0] === "r11")[1]).pt, b = wb(RUNS.find((r) => r[0] === "r12")[1]).pt;
  assert.match(a.crclMethod, /Chow/);
  near(a.crcl, 27.25, 0.05); near(a.crT, 20.35, 0.05);
  near(b.crcl, 76.81, 0.05); near(b.crT, 7.22, 0.05);
});
test("workbook: steady-state peak/trough = KVD C37/C38 closed form, tin 0.25 h for every form, no Φ", () => {
  const { par } = wb(RUNS[0][1]);
  for (const [form, F] of [["iv", 1], ["tablet", 0.7], ["elixir", 0.8]]) {
    const lv = M.weekLevels(M.schedule(0.125, 7), par, form, WBK);
    const k = par.k, pk = (0.125 * F * (1 - Math.exp(-k * 0.25))) / (par.V * k * 0.25 * (1 - Math.exp(-k * 24)));
    rel(lv.peak, pk, 1e-9, `${form} peak`); rel(lv.trough, pk * Math.exp(-k * 23.75), 1e-9, `${form} trough`);
    assert.equal(lv.phi, 1); assert.equal(lv.tin, 0.25);
  }
  assert.equal(M.buildHistory({ start: 0, sched: M.schedule(0.125, 7), form: "tablet" }, 48, WBK)[0].tinf, 0.25);
  assert.equal(M.weekLevels(M.schedule(0.125, 7), par, "tablet", { ...WBK, wbTin: 1 }).tin, 1, "input time is editable");
});
// Workbook Bayes objective (KVD F60): ((Kpop−K)/(0.3·Kpop))² + ((Vpop−V)/(0.3·Vpop))² + Σ((obs−pred)/(0.1·obs))².
const wbPred = (K, V, F = 0.7, D = 0.125) => (D * F * (1 - Math.exp(-K * 0.25)) * Math.exp(-K * 23.75)) / (V * K * 0.25 * (1 - Math.exp(-K * 24)));
test("workbook MAP, K only: equals a golden-section minimum of the KVD objective (r01, tablet 125 QD, 0.9 at 24 h)", () => {
  const { par } = wb(RUNS[0][1]);
  const kp = par.k, obs = 0.0009;
  const F60 = (K) => ((kp - K) / (0.3 * kp)) ** 2 + ((obs - wbPred(K, par.V)) / (0.1 * obs)) ** 2;
  let lo = 0.1 * kp, hi = 10 * kp;
  for (let i = 0; i < 300; i++) { const a = lo + (hi - lo) * 0.382, b = lo + (hi - lo) * 0.618; F60(a) < F60(b) ? (hi = b) : (lo = a); }
  const f = M.fitLevels({ obs: [{ t: 24, c: obs }], predict: M.ssPredictor(M.schedule(0.125, 7), "tablet", WBK), par0: par, method: "mapK", cfg: WBK });
  rel(f.k, (lo + hi) / 2, 1e-5); near(f.V, par.V, 1e-9);
  assert.ok(f.k < kp && f.k > 0.0072 * (514.5 / par.V) * 0.9, "pulled between the LS solution and the prior");
});
test("workbook MAP, K and V: a stationary minimum of the KVD objective (normal priors 30 %/30 %, 10 % residual)", () => {
  const { par } = wb(RUNS[0][1]);
  const kp = par.k, vp = par.V, obs = [[24, 0.0009], [24 * 3 + 12, 0.001]];
  const sched = M.schedule(0.125, 7);
  const predict = M.ssPredictor(sched, "tablet", WBK);
  const F60 = (K, V) => ((kp - K) / (0.3 * kp)) ** 2 + ((vp - V) / (0.3 * vp)) ** 2 + obs.reduce((s, [t, c]) => s + ((c - predict({ V, k: K })(t)) / (0.1 * c)) ** 2, 0);
  const f = M.fitLevels({ obs: obs.map(([t, c]) => ({ t, c })), predict, par0: par, method: "map", cfg: WBK });
  const f0 = F60(f.k, f.V);
  for (const [dk, dv] of [[1.001, 1], [0.999, 1], [1, 1.001], [1, 0.999]]) assert.ok(F60(f.k * dk, f.V * dv) >= f0 - 1e-9, `perturb ${dk}/${dv}`);
  near(f.fit.objective, f0, 1e-6, "PK.fit objective equals the workbook formula");
  assert.ok(f.V !== vp, "V is fitted");
});
test("workbook LS K (unweighted Σ(obs−pred)²) and Solver bounds: K 0.1–10 × Kpop, flagged at the bound", () => {
  const { par } = wb(RUNS[0][1]);
  const pr = M.ssPredictor(M.schedule(0.125, 7), "tablet", WBK);
  const ls = M.fitLevels({ obs: [{ t: 24, c: 0.0009 }], predict: pr, par0: par, method: "cl", cfg: WBK });
  rel(wbPred(ls.k, par.V), 0.0009, 1e-6, "LS reproduces a single level");
  const hiLvl = M.fitLevels({ obs: [{ t: 24, c: 0.05 }], predict: M.ssPredictor(M.schedule(0.0625, 1), "tablet", WBK), par0: par, method: "cl", cfg: WBK });
  near(hiLvl.k, 0.1 * par.k, 1e-12, "lower K bound"); assert.ok(hiLvl.flags.some((x) => /bound/.test(x.text)));
  const kv = M.fitLevels({ obs: [{ t: 24, c: 0.0001 }, { t: 12, c: 0.00015 }], predict: pr, par0: par, method: "lsKV", cfg: WBK });
  assert.ok(kv.V >= 0.5 * par.V - 1e-9 && kv.V <= 2 * par.V + 1e-9 && kv.k <= 10 * par.k + 1e-12, "within bounds");
});
test("workbook UI: third Model button, Paulson option, paralysis/malnutrition and input-time fields; no MRN/name fields", () => {
  assert.match(html, /data-value="workbook"/);
  assert.match(html, /id="paraMal"/); assert.match(html, /id="wbTin"[^>]*value="0.25"/);
  assert.ok(!/<input[^>]*id="[^"]*(mrn|name)[^"]*"/i.test(html), "no patient name/MRN inputs (no PHI)");
  assert.ok(!/[-+]\s*0\.014\b/.test(block), "no 0.014 h⁻¹ per-interval K intercept in the math");
});

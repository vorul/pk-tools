// Tests for pk-suite/lithium.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js (sets globalThis.PK), then the page's CALC-START…CALC-END block with new Function,
// so the tests always exercise the published code.
// Sources: specs/lithium.md §8 (workbook worked examples, screenshot values), §11b (live-server regression rows,
// displayed rounding, exact), lit/lithium-phenobarb-phenytoin.md (literature defaults).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "lithium.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function(`${block}; return { LI, MODELS, LI_SOURCES, INTERACTIONS, SCHEDULES, parseTimes, scheduleOf, toMEq, fromMEq,
  doseStep, defaultF, targetFor, siteTwoScrCrCl, patientModel, ssAt, predict, siteDailyDose, splitUnits, recommend, proportional,
  fitK, adjustCalc, parseHistory, parseDateTime, buildHistory, nssCalc, siteKFit, workbookGrid, siteDisplay, safetyFlags, siteRound,
  workbookTarget, logLinearK, multiLevelCalc };`)();

const near = (a, e, tol, msg) => assert.ok(Math.abs(a - e) <= tol, `${msg || ""} expected ${e} ± ${tol}, got ${a}`);
const rel = (a, e, r, msg) => near(a, e, Math.abs(e) * r, msg);

// Patient A (spec §8): male 30 y, 72 in, 100 kg, SCr 1.0.
const A = { age: 30, sex: "M", ht: 72, htUnit: "in", wt: 100, wtUnit: "kg", scr: 1, scrPrev: NaN, scrHours: 24, scrFloor: null, dwPolicy: "minFfmTbw", inter: {}, form: "IR" };

test("CALC block uses the shared PK library", () => {
  assert.ok(globalThis.PK === PK);
  assert.match(block, /PK\.body\.ffm/); assert.match(block, /PK\.renal\.cockcroftGault/); assert.match(block, /PK\.fit\.leastSquares/);
  assert.equal(M.LI.MEQ_PER_300MG_CARB, 8.12);
});

test("salt conversions: 300 mg carbonate = 8.12 mEq; citrate 5 mL = 8 mEq; round trips", () => {
  near(M.toMEq(300, "mg"), 8.12, 1e-12);
  near(M.toMEq(450, "mg"), 12.18, 1e-12);
  near(M.toMEq(5, "mL"), 8, 1e-12);
  near(M.fromMEq(M.toMEq(1234, "mg"), "mg"), 1234, 1e-9);
  near(M.fromMEq(16, "mL"), 10, 1e-12);
  assert.equal(M.toMEq(8, "mEq"), 8);
});

// ===================== Workbook mode: spec §8 example A matches the workbook screenshot =====================
test("Workbook ex A: FFM 70.56, CrCl 107.8, CL 1.616927, Vd 49.39, K 0.032738, t½ 21.2 (image)", () => {
  const pm = M.patientModel(A, "workbook");
  near(pm.bmi, 29.9, 0.001, "BMI");
  near(pm.ffm, 70.557, 0.001, "FFM");
  assert.equal(pm.dwBasis, "FFM");
  near(pm.dw, 70.557, 0.001, "dosing weight");
  near(pm.crcl, 107.80, 0.005, "CrCl (image 107.8)");
  near(pm.CL, 1.616927245, 1e-6, "CL (image 1.616927245)");
  near(pm.V, 49.390, 0.001, "Vd");
  near(pm.K, 0.032738, 1e-6, "K (image 0.032738)");
  assert.equal(pm.t12.toFixed(1), "21.2", "t½ (image 21.2)");
  assert.equal(Math.round(pm.tss), 106, "time to SS 106 h");
});

test("Workbook ex A: 300 mg level table P/T/C12/Cavg for tau 6–120 (spec §8 and screenshot, 2 dp)", () => {
  const pm = M.patientModel(A, "workbook");
  const exp = { 6: [0.922, 0.757, 0.622, 0.837, "0.92/0.76/0.62"], 8: [0.714, 0.549, 0.482, 0.628, "0.71/0.55/0.48"], 12: [0.506, 0.342, 0.342, 0.418, "0.51/0.34/0.34"],
    24: [0.302, 0.138, 0.204, 0.209, "0.30/0.14/0.20"], 48: [0.208, 0.043, 0.140, 0.105, "0.21/0.04/0.14"], 72: [0.182, 0.017, 0.123, 0.070, "0.18/0.02/0.12"],
    96: [0.172, 0.007, 0.116, 0.052, "0.17/0.01/0.12"], 120: [0.168, 0.003, 0.113, 0.042, "0.17/0.00/0.11"] };
  const g = M.workbookGrid(pm, M.toMEq(300, "mg"));
  for (const row of g.rows) {
    const c = row.cells[0], e = exp[row.tau];
    near(c.peak, e[0], 0.0006, `peak tau ${row.tau}`); near(c.trough, e[1], 0.0006, `trough tau ${row.tau}`);
    near(c.c12, e[2], 0.0006, `C12 tau ${row.tau}`); near(c.cavg, e[3], 0.0006, `Cavg tau ${row.tau}`);
    assert.equal([c.peak, c.trough, c.c12].map((x) => x.toFixed(2)).join("/"), e[4], `image tau ${row.tau}`);
  }
  // Same via predict() for the uniform schedules q6h / q8h / q12h / QD.
  for (const [k, tau] of [["q6h", 6], ["q8h", 8], ["q12h", 12], ["qd", 24]]) {
    const pr = M.predict(pm, M.scheduleOf(k), 300, "mg", "workbook");
    near(pr.peak, exp[tau][0], 0.0006, `${k} peak`); near(pr.c12, exp[tau][2], 0.0006, `${k} C12 (sheet)`);
    assert.equal(pr.c12Flaw, tau < 12, `${k} flaw label`);
  }
});

test("Workbook ex A (L1): dose for a 12-h level of 0.8 (SSNonSS C31) = 1405 mg/day q12h; site web keeps Cavg 0.8 = 1147", () => {
  const pm = M.patientModel(A, "workbook");
  assert.equal(M.MODELS.workbook.targetKind, "c12"); assert.equal(M.MODELS["site-web"].targetKind, "cavg");
  const T = M.workbookTarget("auto");
  assert.equal(T.aim, 0.8); assert.equal(T.src, "wbTarget");
  const q12 = M.scheduleOf("q12h");
  const rec = M.recommend(pm, q12, T, "mg", "IR", "workbook");
  const c31 = (0.8 * pm.V * (1 - Math.exp(-pm.K * 12))) / (pm.F * Math.exp(-pm.K * 12));   // mEq per dose
  near(rec.exactDailyAmt, (2 * c31 * 300) / 8.12, 1e-9, "C31 formula");
  near(rec.exactDailyAmt, 1404.93, 0.005, "workbook-checks L1: about 1405 mg/day");
  assert.equal(rec.kind, "c12");
  assert.equal(rec.chosen.dailyAmt, 1350); assert.deepEqual(rec.chosen.perDose, [600, 750]);
  near(rec.chosen.pred.c12, 0.7687, 0.0001);
  // QD: the workbook 12-h level is Cmax·e^(−12K) → exact 1177 mg/day.
  near(M.recommend(pm, M.scheduleOf("qd"), T, "mg", "IR", "workbook").exactDailyAmt, 1176.71, 0.005);
  // Custom desired level (the SSNonSS input cell): dose scales linearly.
  const T1 = M.workbookTarget("custom", { low: 1, high: 1 });
  near(M.recommend(pm, q12, T1, "mg", "IR", "workbook").exactDailyAmt, (rec.exactDailyAmt * 1) / 0.8, 1e-9);
  // Literature presets do not apply to the workbook target.
  assert.equal(M.workbookTarget("elderly").aim, 0.8);
  // The Cavg 0.8 daily dose (site web calculator formula) is unchanged.
  near(M.siteDailyDose(pm), 1147, 0.5);
  near(M.toMEq(M.siteDailyDose(pm), "mg"), 31.05, 0.005);
});

test("Workbook ex A grid columns: CL and K at CrCl 120…5 with Vd 49.39 (image), CrCl 10 levels", () => {
  const pm = M.patientModel(A, "workbook");
  const g = M.workbookGrid(pm, M.toMEq(300, "mg"));
  const exp = { 120: [1.8, 0.036445], 110: [1.65, 0.033408], 100: [1.5, 0.030371], 90: [1.35, 0.027334], 80: [1.2, 0.024297], 70: [1.05, 0.021259], 60: [0.9, 0.018222],
    50: [0.75, 0.015185], 40: [0.6, 0.012148], 30: [0.45, 0.009111], 20: [0.3, 0.006074], 10: [0.15, 0.003037], 5: [0.075, 0.001519] };
  for (const c of g.cols.slice(1)) { near(c.CL, exp[c.crcl][0], 1e-9, `CL ${c.crcl}`); near(c.K, exp[c.crcl][1], 1e-6, `K ${c.crcl}`); }
  assert.equal(g.cols[1].t12.toFixed(1), "19.0"); assert.equal(g.cols[13].t12.toFixed(1), "456.4");
  assert.equal(Math.round(g.cols[1].tss), 95); assert.equal(Math.round(g.cols[13].tss), 2282);
  const col10 = 12, txt = (tau) => { const c = g.rows.find((r) => r.tau === tau).cells[col10]; return [c.peak, c.trough, c.c12].map((x) => x.toFixed(2)).join("/"); };
  assert.equal(txt(6), "9.10/8.94/8.78"); assert.equal(txt(12), "4.59/4.43/4.43"); assert.equal(txt(24), "2.34/2.17/2.26"); assert.equal(txt(120), "0.54/0.37/0.52");
});

test("Workbook ex B (L2): HCTZ ticked → no factor (workbook has none); the halved-CL screenshot values still follow from the equations", () => {
  const base = M.patientModel(A, "workbook");
  const pm = M.patientModel({ ...A, inter: { thiazide: true } }, "workbook");
  assert.equal(pm.CL, base.CL); assert.equal(pm.factor, 1); assert.deepEqual(pm.applied, []);
  assert.ok(pm.flags.some((f) => /not applied: the workbook has no interaction factors/.test(f.text)));
  near(M.patientModel({ ...A, inter: { acei: true } }, "workbook").CL, base.CL, 1e-12);
  // Spec §8 ex B (CL × 0.5 entered by hand): CL 0.80846, K 0.016369, t½ 42.34, q12h 300 mg levels.
  const half = { ...base, CL: base.CL * 0.5, K: base.K * 0.5, t12: base.t12 * 2 };
  near(half.CL, 0.80846, 1e-5); near(half.K, 0.016369, 1e-6); near(half.t12, 42.34, 0.005);
  const pr = M.predict(half, M.scheduleOf("q12h"), 300, "mg", "workbook");
  near(pr.peak, 0.922, 0.0006); near(pr.trough, 0.757, 0.0006); near(pr.c12, 0.757, 0.0006); near(pr.cavg, 0.837, 0.0006);
  near(M.siteDailyDose(half), 573, 0.5);
});

test("Workbook ex C: F 65 y, 64 in, 60 kg, SCr 0.9 → FFM 38.841, CrCl 38.21, K 0.021081, 407 mg/day", () => {
  const pm = M.patientModel({ ...A, age: 65, sex: "F", ht: 64, wt: 60, scr: 0.9 }, "workbook");
  near(pm.bmi, 22.705, 0.001); near(pm.ffm, 38.841, 0.001); near(pm.crcl, 38.21, 0.005); near(pm.CL, 0.57317, 1e-5);
  near(pm.V, 27.188, 0.001); near(pm.K, 0.021081, 1e-6); near(pm.t12, 32.88, 0.01, "t½ (spec uses ln 2; model uses the site 0.693)");
  const pr = M.predict(pm, M.scheduleOf("q12h"), 300, "mg", "workbook");
  near(pr.peak, 1.336, 0.0006); near(pr.trough, 1.038, 0.0006); near(pr.c12, 1.038, 0.0006);
  near(M.siteDailyDose(pm), 407, 0.5);
});

test("Workbook ex D: SR (F 0.85 default), 450 mg q12h → P 0.645 / T 0.436 / Cavg 0.534; 1349 mg/day", () => {
  const pm = M.patientModel({ ...A, form: "SR" }, "workbook");
  assert.equal(pm.F, 0.85);
  const pr = M.predict(pm, M.scheduleOf("q12h"), 450, "mg", "workbook");
  near(pr.peak, 0.645, 0.0006); near(pr.trough, 0.436, 0.0006); near(pr.c12, 0.436, 0.0006); near(pr.cavg, 0.534, 0.0006);
  near(M.siteDailyDose(pm), 1349, 0.5);
});

test("Workbook ex E: proportional 900 mg/day at 0.5 → 0.8 gives 1440 mg/day", () => {
  near(M.proportional(900, 0.5, 0.8), 1440, 1e-9);
});

test("Workbook ex F: single 600 mg test dose, level 0.20 at 24 h, Vd 49.39 → K 0.02071, CL 1.023 (NSS fit)", () => {
  const pm = M.patientModel(A, "workbook");
  const h = { events: [{ ms: M.parseDateTime("2026-10-20T08:00"), amount: 600 }], unit: "mg", levelMs: M.parseDateTime("2026-10-21T08:00"), level: 0.2 };
  const o = M.nssCalc(pm, M.scheduleOf("q12h"), h, M.targetFor(30, "auto"), "IR", NaN, "workbook");
  assert.ok(o.fit.ok, o.fit.reason);
  near(o.fit.K, 0.02071, 1e-5); near(o.fit.CL, 1.023, 0.0005);
  near(o.fit.K, -Math.log((0.2 * pm.V) / 16.24) / 24, 1e-9, "closed form");
});

// ===================== Site-web mode: every live-server regression row (§11b), displayed rounding =====================
const SITE_BASE = { age: 30, sex: "M", ht: 72, htUnit: "in", wt: 100, wtUnit: "kg", scr: 1, scrPrev: 1, scrHours: 24, inter: {}, form: "IR" };
const COLS = ["lbw", "dw", "crcl", "crHalf", "K", "t12", "V", "CL", "dosecalc", "peak", "trough", "cavg", "c12"];
const BASE_ROW = [77.6, 100, 118.6, 5.8, 0.02571429, 26.9, 70, 1.8, 1277];
const ROWS = [
  ["p01", { dose: 300 }, [...BASE_ROW, 0.25, 0.13, 0.19, 0.18]],
  ["p02", { age: 60 }, [77.6, 100, 86.2, 8, 0.01857143, 37.3, 70, 1.3, 922, 3.23, 2.07, 2.6, 2.58]],
  ["p03", {}, [...BASE_ROW, 2.52, 1.36, 1.88, 1.85]],
  ["p04", { wt: 60 }, [60, 60, 91.7, 4.5, 0.03333333, 20.8, 42, 1.4, 993, 3.51, 1.58, 2.42, 2.35]],
  ["p05", { wt: 150 }, [77.6, 150, 118.6, 8.8, 0.01714286, 40.4, 105, 1.8, 1277, 2.29, 1.52, 1.88, 1.86]],
  ["p06", { sex: "F", age: 65, ht: 64, wt: 60, scr: 0.9, scrPrev: 0.9 }, [54.7, 60, 53.8, 7.7, 0.01904762, 36.4, 42, 0.8, 567, 5.27, 3.34, 4.23, 4.19]],
  ["p07", { scr: 0.5, scrPrev: 0.5 }, [77.6, 100, 237.1, 2.9, 0.05142857, 13.5, 70, 3.6, 2554, 1.64, 0.48, 0.94, 0.88]],
  ["p08", { scrPrev: 1.0, scr: 1.5, scrHours: 24 }, [77.6, 100, 74, 9.4, 0.01571429, 44.1, 70, 1.1, 780, 3.69, 2.53, 3.08, 3.06]],
  ["p09", { scrPrev: 1.0, scr: 1.5, scrHours: 72 }, [77.6, 100, 78.9, 8.8, 0.01714286, 40.4, 70, 1.2, 851, 3.44, 2.28, 2.82, 2.8]],
  ["p10", { scrPrev: 1.5, scr: 1.0, scrHours: 24 }, [77.6, 100, 122, 5.7, 0.02571429, 26.9, 70, 1.8, 1277, 2.52, 1.36, 1.88, 1.85]],
  ["p11", { inter: { thiazide: true } }, [77.6, 100, 118.6, 5.8, 0.01285714, 53.9, 70, 0.9, 638, 4.37, 3.21, 3.76, 3.75]],
  ["p12", { inter: { nsaid: true } }, [77.6, 100, 118.6, 5.8, 0.01714286, 40.4, 70, 1.2, 851, 3.44, 2.28, 2.82, 2.8]],
  ["p13", { inter: { acei: true } }, [77.6, 100, 118.6, 5.8, 0.01285714, 53.9, 70, 0.9, 638, 4.37, 3.21, 3.76, 3.75]],
  ["p14", { inter: { thiazide: true, nsaid: true, acei: true } }, [77.6, 100, 118.6, 5.8, 0.00428571, 161.7, 70, 0.3, 213, 11.87, 10.71, 11.28, 11.27]],
  ["p15", { form: "elixir" }, [...BASE_ROW, 2.52, 1.36, 1.88, 1.85]],
  ["p16", { form: "SR" }, [77.6, 100, 118.6, 5.8, 0.02571429, 26.9, 70, 1.8, 1419, 2.27, 1.22, 1.69, 1.67]],
  ["s2", { sched: "q12h" }, [...BASE_ROW, 4.37, 3.21, 3.76, 3.21]],
  ["s22", { sched: "bid8_18" }, [...BASE_ROW, 4.47, 3.12, 3.76, 3.28]],
  ["s21", { sched: "bid10_18" }, [...BASE_ROW, 4.57, 3.03, 3.76, 3.36]],
  ["s3", { sched: "q8h" }, [...BASE_ROW, 6.24, 5.08, 5.64, 4.58]],
  ["s31", { sched: "tid8_14_20" }, [...BASE_ROW, 6.53, 4.8, 5.64, 4.8]],
  ["s32", { sched: "tid10_14_18" }, [...BASE_ROW, 6.84, 4.53, 5.64, 5.02]],
  ["s4", { sched: "q6h" }, [...BASE_ROW, 8.11, 6.95, 7.52, 5.96]],
  ["s41", { sched: "qid6_18" }, [...BASE_ROW, 8.69, 6.38, 7.52, 6.38]],
  ["u1", { ht: 182.88, htUnit: "cm", wt: 220.46, wtUnit: "lb" }, [77.6, 100.2, 118.6, 5.9, 0.0256776, 27, 70.1, 1.8, 1277, 2.52, 1.36, 1.88, 1.85]],
];
for (const [tag, chg, expRow] of ROWS) {
  test(`Site web ${tag}: all 13 displayed outputs match the live server exactly`, () => {
    const { dose = 3000, sched = "qd", ...pc } = chg;
    const pm = M.patientModel({ ...SITE_BASE, ...pc }, "site-web");
    const d = M.siteDisplay(pm, M.scheduleOf(sched), dose);
    COLS.forEach((c, i) => assert.equal(d[c], expRow[i], `${tag} ${c}: got ${d[c]}, server ${expRow[i]}`));
  });
}

test("Site web clock codes: hidden uniform values 4.37/3.21 (BID), 6.24/5.08 (TID), 8.11/6.95 (QID)", () => {
  const pm = M.patientModel(SITE_BASE, "site-web");
  for (const [k, pk, tr] of [["bid8_18", 4.37, 3.21], ["tid8_14_20", 6.24, 5.08], ["qid6_18", 8.11, 6.95]]) {
    const pr = M.predict(pm, M.scheduleOf(k), 3000, "mg", "site-web");
    assert.equal(M.siteRound(pr.uniformPeak, 2), pk); assert.equal(M.siteRound(pr.uniformTrough, 2), tr);
  }
});

test("Site web q8h/q6h flaw is reproduced and labelled; literature fixes it by superposition", () => {
  const pmS = M.patientModel(SITE_BASE, "site-web");
  const s3 = M.predict(pmS, M.scheduleOf("q8h"), 3000, "mg", "site-web");
  assert.ok(s3.c12 < s3.trough, "site C12 4.58 below trough 5.08");
  assert.equal(s3.c12Flaw, true);
  assert.ok(M.safetyFlags(s3, null, "site-web", M.scheduleOf("q8h")).some((f) => /ignores doses/.test(f.text)));
  const s4true = M.predict(pmS, M.scheduleOf("q6h"), 3000, "mg", "site-web").true;
  near(s4true.c12, s4true.trough, 1e-12, "q6h: true 12-h level = trough");
});

// K-fit probes (§11b): exact root ±1e-6 relative to the spec's exact value, and within 0.5% of the server's KFit.
const KPROBES = [
  ["k1", 600, "q12h", 0.8, 12, 0.02116406, 0.02122018],
  ["k3", 900, "qd", 0.6, 24, 0.01909987, 0.01905937],
  ["k4", 600, "q12h", 1.0, 12, 0.01734009, 0.01738657],
  ["k5", 600, "bid8_18", 0.8, 12, 0.02162219, 0.02157933],
  ["k6", 900, "qd", 0.7, 12, null, 0.02050669],
  ["k7", 600, "q12h", 0.8, 10, 0.02212647, 0.02206101],
  ["k8", 900, "qd", 0.4, 12, 0.0351662, 0.03519439],
];
for (const [tag, dose, sched, level, hrs, server, exact] of KPROBES) {
  test(`Site web K fit ${tag}: ${dose} mg ${sched}, ${level} @ ${hrs} h → exact root ${exact}${server ? `, server ${server} (±0.5%)` : " (server crashed; must not)"}`, () => {
    const pm = M.patientModel(SITE_BASE, "site-web");
    const f = M.siteKFit(pm, M.scheduleOf(sched), dose, level, hrs);
    assert.ok(f.ok, f.reason);
    rel(f.K, exact, 2e-6, `${tag} exact`);
    if (server) rel(f.K, server, 0.005, `${tag} vs server`);
  });
}

test("Site web k2: K = posted KFit 0.02116406 → CL 1.4814842, t½ 32.7, Dosecalc 1051, 1.03/0.8/0.91/0.8", () => {
  const pm = M.patientModel({ ...SITE_BASE, kOverride: 0.02116406 }, "site-web");
  const d = M.siteDisplay(pm, M.scheduleOf("q12h"), 600);
  assert.equal(d.K, 0.02116406); assert.equal(d.CL, 1.4814842); assert.equal(d.t12, 32.7); assert.equal(d.dosecalc, 1051);
  assert.equal(d.peak, 1.03); assert.equal(d.trough, 0.8); assert.equal(d.cavg, 0.91); assert.equal(d.c12, 0.8);
});

test("Site web k1/k3/k5 first-response outputs (population K): Peak/Trough/Avg/C12", () => {
  const pm = M.patientModel(SITE_BASE, "site-web");
  const chk = (sched, dose, e) => { const d = M.siteDisplay(pm, M.scheduleOf(sched), dose); assert.deepEqual([d.peak, d.trough, d.cavg, d.c12], e, sched); };
  chk("q12h", 600, [0.87, 0.64, 0.75, 0.64]);
  chk("qd", 900, [0.76, 0.41, 0.56, 0.56]);
  chk("bid8_18", 600, [0.89, 0.62, 0.75, 0.65]);
});

test("Site web: spec §8 notes for patients A–D (Dosecalc 1277 / 638 / 567 / 1419)", () => {
  assert.equal(M.siteDisplay(M.patientModel(SITE_BASE, "site-web"), M.scheduleOf("qd"), 300).dosecalc, 1277);
  assert.equal(M.siteDisplay(M.patientModel({ ...SITE_BASE, inter: { acei: true } }, "site-web"), M.scheduleOf("qd"), 300).dosecalc, 638);
  assert.equal(M.siteDisplay(M.patientModel({ ...SITE_BASE, sex: "F", age: 65, ht: 64, wt: 60, scr: 0.9, scrPrev: 0.9 }, "site-web"), M.scheduleOf("qd"), 300).dosecalc, 567);
  const sr = M.patientModel({ ...SITE_BASE, form: "SR" }, "site-web");
  assert.equal(sr.F, 0.9); assert.equal(M.siteDisplay(sr, M.scheduleOf("qd"), 300).dosecalc, 1419);
});

test("Site web: ARB ignored (no site input), no SCr floor applied", () => {
  const pm = M.patientModel({ ...SITE_BASE, inter: { arb: true }, scrFloor: 0.8, scr: 0.5, scrPrev: 0.5 }, "site-web");
  assert.equal(pm.CL, 3.6); assert.equal(pm.factor, 1);
  assert.ok(pm.flags.some((f) => /no ARB input/.test(f.text)));
});

// ===================== Literature mode =====================
test("Literature default (approved, Reiss 1994): obese patient A — CrCl on AdjBW, Vd 0.7 × IBW", () => {
  const pm = M.patientModel({ ...A, dwPolicy: undefined }, "literature");
  assert.equal(pm.policy, "reiss"); assert.equal(pm.obese, true);
  near(pm.ibw, 77.6, 1e-9);
  assert.equal(pm.crclWeightBasis, "AdjBW"); near(pm.crclWeight, 77.6 + 0.4 * 22.4, 1e-9);
  near(pm.crcl, (110 * 86.56) / 72, 1e-9); near(pm.CL, 0.015 * 132.2444, 1e-4);
  assert.equal(pm.dwBasis, "IBW"); near(pm.V, 0.7 * 77.6, 1e-9);
  assert.ok(pm.flags.some((f) => /Reiss/.test(f.text) && /1\.5/.test(f.text)));
  const ffmOpt = M.patientModel({ ...A, dwPolicy: "reissFfm" }, "literature");
  assert.equal(ffmOpt.dwBasis, "FFM"); near(ffmOpt.V, 0.7 * 70.557, 0.001); near(ffmOpt.CL, pm.CL, 1e-12);
  const rec = M.recommend(pm, M.scheduleOf("q12h"), M.targetFor(30, "auto"), "mg", "IR");
  assert.ok(rec.chosen.pred.c12 >= 0.6 && rec.chosen.pred.c12 <= 0.8);
  near(M.predict(pm, M.scheduleOf("q12h"), rec.exactDailyAmt / 2, "mg").c12, 0.7, 1e-9, "exact dose hits the 0.7 aim");
});

test("Literature default: non-obese patient — CrCl weight lower of IBW/TBW, Vd 0.7 × TBW", () => {
  const pm = M.patientModel({ ...A, wt: 70, dwPolicy: undefined }, "literature");
  assert.equal(pm.obese, false);
  assert.equal(pm.crclWeightBasis, "TBW"); near(pm.crcl, (110 * 70) / 72, 1e-9);
  assert.equal(pm.dwBasis, "TBW"); near(pm.V, 49, 1e-9);
  const heavy = M.patientModel({ ...A, wt: 90, dwPolicy: undefined }, "literature"); // 90 < 1.2 × 77.6: not obese
  assert.equal(heavy.crclWeightBasis, "IBW"); assert.equal(heavy.dwBasis, "TBW"); near(heavy.V, 63, 1e-9);
});

test("Literature option 'lower of FFM or TBW' (site prose): patient A gives the workbook population values", () => {
  const pm = M.patientModel(A, "literature");
  assert.equal(pm.dwBasis, "FFM");
  near(pm.crcl, 107.80, 0.005); near(pm.CL, 1.616927, 1e-6); near(pm.V, 49.39, 0.001); near(pm.K, 0.032738, 1e-6);
  assert.equal(pm.F, 1);
});

test("Literature: TBW option gives CrCl 152.8 (lit §1a: 42% higher CL than FFM)", () => {
  const pm = M.patientModel({ ...A, dwPolicy: "tbw" }, "literature");
  near(pm.crcl, 152.78, 0.01); near(pm.V, 70, 1e-9);
  near(pm.CL / M.patientModel(A, "literature").CL, 1.417, 0.001);
});

test("Literature: 12-h level by true superposition — q12h = trough, q6h = trough, q8h = 4 h after the next dose", () => {
  const pm = M.patientModel(A, "literature");
  const q12 = M.predict(pm, M.scheduleOf("q12h"), 300, "mg");
  near(q12.c12, 0.342, 0.0006); near(q12.c12, q12.trough, 1e-12);
  const q6 = M.predict(pm, M.scheduleOf("q6h"), 300, "mg");
  near(q6.c12, 0.757, 0.0006, "q6h C12 = trough (workbook shows 0.62)"); near(q6.c12, q6.trough, 1e-12);
  assert.ok(q6.c12 > q6.c12Sheet);
  const q8 = M.predict(pm, M.scheduleOf("q8h"), 300, "mg");
  near(q8.c12, q8.peak * Math.exp(-pm.K * 4), 1e-12, "q8h");
  near(q8.c12, 0.6264, 0.0005);
  assert.ok(q8.c12 > q8.trough && q8.c12 < q8.peak);
  near(q8.cavg, 0.628, 0.0006, "Cavg unchanged by schedule");
  // Uniform peak/trough equal the closed-form one-compartment SS values.
  near(q8.peak, 0.714, 0.0006); near(q8.trough, 0.549, 0.0006);
});

test("Literature: clock schedules agree with the site's superposition (unrounded) and unequal splits work", () => {
  const pmS = M.patientModel(SITE_BASE, "site-web");
  for (const k of ["bid8_18", "tid8_14_20", "qid6_18"]) {
    const lit = M.predict(pmS, M.scheduleOf(k), 3000, "mg", "literature"), site = M.predict(pmS, M.scheduleOf(k), 3000, "mg", "site-web");
    near(lit.c12, site.c12, 0.006, k); near(lit.peakAfterEvening, site.peak, 0.005, k);
  }
  const pm = M.patientModel(A, "literature");
  const eq = M.predict(pm, M.scheduleOf("q12h"), [450, 450], "mg"), uneq = M.predict(pm, M.scheduleOf("q12h"), [300, 600], "mg");
  near(eq.cavg, uneq.cavg, 1e-12); assert.ok(uneq.c12 > eq.c12, "larger evening dose raises the level 12 h after it");
});

test("Literature: initial dose for patient A, q12h, target 0.6–0.8 (aim 0.7) → 600 mg BID; exact ≈ 1229 mg/day", () => {
  const pm = M.patientModel(A, "literature");
  const t = M.targetFor(30, "auto");
  assert.deepEqual([t.low, t.high, t.aim], [0.6, 0.8, 0.7]);
  const rec = M.recommend(pm, M.scheduleOf("q12h"), t, "mg", "IR");
  near(rec.exactDailyAmt, 1229.3, 0.5);
  assert.deepEqual(rec.chosen.perDose, [600, 600]);
  near(rec.chosen.pred.c12, 0.684, 0.001);
  assert.ok(rec.chosen.pred.c12 >= t.low && rec.chosen.pred.c12 <= t.high);
});

test("Literature: recommendation never exceeds the target high when a lower step is in range; odd totals put more in the evening", () => {
  const pm = M.patientModel({ ...A, age: 70 }, "literature");
  const t = M.targetFor(70, "auto");
  assert.deepEqual([t.low, t.high, t.max], [0.4, 0.6, 0.8]);
  assert.equal(M.targetFor(82, "auto").max, 0.7);
  const rec = M.recommend(pm, M.scheduleOf("q12h"), t, "mg", "IR");
  assert.ok(rec.chosen.pred.c12 <= 0.6 + 1e-9);
  assert.deepEqual(M.splitUnits(5, 2), [2, 3]);
  assert.deepEqual(M.splitUnits(7, 3), [2, 2, 3]);
});

test("Literature: citrate solution dosing in mL (5 mL = 8 mEq steps)", () => {
  const pm = M.patientModel({ ...A, form: "elixir" }, "literature");
  const rec = M.recommend(pm, M.scheduleOf("q12h"), M.targetFor(30, "auto"), "mL", "elixir");
  assert.equal(rec.step.inc, 5);
  near(rec.exactDailyMEq, M.toMEq(1229.3, "mg"), 0.1);
  assert.ok(rec.chosen.perDose.every((x) => x % 5 === 0));
  near(rec.chosen.pred.c12, 0.7, 0.06);
});

test("Literature (approved): thiazide 0.75 (0.5 option), ACEi 0.75, ARB 0.75 (verify), NSAID 0.8 (verify), indomethacin 0.7; floor 0.4; loop/mania warn only", () => {
  const base = M.patientModel(A, "literature").CL;
  near(M.patientModel({ ...A, inter: { thiazide: true } }, "literature").CL, base * 0.75, 1e-12);
  near(M.patientModel({ ...A, inter: { thiazide: true }, thiazideConservative: true }, "literature").CL, base * 0.5, 1e-12, "conservative option");
  near(M.patientModel({ ...A, inter: { acei: true } }, "literature").CL, base * 0.75, 1e-12);
  near(M.patientModel({ ...A, inter: { arb: true } }, "literature").CL, base * 0.75, 1e-12);
  near(M.patientModel({ ...A, inter: { nsaid: true } }, "literature").CL, base * 0.8, 1e-12);
  near(M.patientModel({ ...A, inter: { indo: true } }, "literature").CL, base * 0.7, 1e-12);
  near(M.patientModel({ ...A, inter: { nsaid: true, acei: true } }, "literature").CL, base * 0.6, 1e-12);
  const all = M.patientModel({ ...A, inter: { thiazide: true, acei: true, arb: true, indo: true } }, "literature");
  near(all.CL, base * 0.4, 1e-12, "product 0.295 floored at 0.4");
  assert.ok(all.flags.some((f) => /floored at 0\.4/.test(f.text)));
  // Workbook (L2): no interaction factors at all; site web keeps its own (0.5 / 0.5 / 0.7, CL rounded to 0.1).
  const wb = M.patientModel(A, "workbook").CL;
  near(M.patientModel({ ...A, inter: { thiazide: true } }, "workbook").CL, wb, 1e-12);
  near(M.patientModel({ ...A, inter: { acei: true, nsaid: true, indo: true, mania: true } }, "workbook").CL, wb, 1e-12);
  for (const it of M.INTERACTIONS) assert.equal(it.f.workbook, null, `${it.key}: no workbook factor`);
  const sw = M.patientModel(A, "site-web"), swT = M.patientModel({ ...A, inter: { thiazide: true } }, "site-web");
  assert.equal(swT.CL, M.siteRound(0.015 * sw.crcl * 0.5, 1), "site web thiazide 0.5 unchanged");
  assert.ok(M.patientModel({ ...A, inter: { thiazide: true } }, "literature").flags.some((f) => /5–7 days/.test(f.text)));
  const loop = M.patientModel({ ...A, inter: { loop: true, mania: true, theo: true } }, "literature");
  near(loop.CL, base, 1e-12, "no factor for loop/mania/theophylline");
  assert.ok(loop.flags.some((f) => /RR 5\.5/.test(f.text)));
  assert.ok(loop.flags.some((f) => /no factor applied/.test(f.text) && /mania/i.test(f.text)));
  assert.equal(M.LI_SOURCES.arb.verify, true); assert.equal(M.LI_SOURCES.nsaid.verify, true);
  // The site-prose acute-mania 0.6 factor is applied by no model (not a workbook cell).
  near(M.patientModel({ ...A, inter: { mania: true } }, "workbook").CL, wb, 1e-12);
});

test("Literature: steady-state K fit from a 12-h level reproduces the level and gives the proportional answer at 12 h", () => {
  const pm = M.patientModel(A, "literature");
  const s = M.scheduleOf("q12h"), t = M.targetFor(30, "auto");
  const o = M.adjustCalc(pm, s, { perDose: 450, unit: "mg", level: 0.45, hours: 12, days: 10 }, t, "IR");
  assert.ok(o.fit.ok);
  near(o.current.c12, 0.45, 1e-6, "fitted model reproduces the level");
  assert.equal(o.propValid, true);
  near(o.propDailyAmt, (900 * 0.7) / 0.45, 1e-9, "proportional 1400 mg/day");
  // Linear kinetics: K-fit exact dose for the aim equals the proportional dose when sampled at 12 h on the same schedule.
  near(o.rec.exactDailyAmt, o.propDailyAmt, 0.01);
  assert.equal(o.rec.chosen.dailyAmt, 1350);
});

test("Literature: K fit recovers a known K from a synthetic level drawn 10 h post-dose (timing handled)", () => {
  const pm = M.patientModel(A, "literature");
  const s = M.scheduleOf("tid8_14_20"), Ktrue = 0.025;
  const doses = s.times.map((t) => ({ t, mEq: M.toMEq(300, "mg") }));
  const level = M.ssAt(20 + 10, doses, Ktrue, pm.V, "left");
  const o = M.adjustCalc(pm, s, { perDose: 300, unit: "mg", level, hours: 10, days: 14 }, M.targetFor(30, "auto"), "IR");
  rel(o.fit.K, Ktrue, 1e-6);
  assert.equal(o.propValid, false, "proportional flagged invalid off 12 h");
  assert.ok(o.flags.some((f) => /12-h levels/.test(f.text)));
});

test("Literature: non-steady-state superposition fit over an actual dose history (missed dose) recovers K", () => {
  const pm = M.patientModel(A, "literature");
  const s = M.scheduleOf("q12h");
  const start = M.parseDateTime("2026-10-20T20:00"), levelMs = M.parseDateTime("2026-10-23T08:00");
  let text = M.buildHistory(s, 600, start, levelMs);
  const lines = text.split("\n");
  assert.equal(lines.length, 5); assert.equal(lines[0], "2026-10-20 20:00 600"); assert.equal(lines[4], "2026-10-22 20:00 600");
  lines.splice(2, 1); // missed the 2026-10-21 20:00 dose
  text = lines.join("\n");
  const parsed = M.parseHistory(text);
  assert.equal(parsed.errors.length, 0); assert.equal(parsed.events.length, 4);
  const Ktrue = 0.028, t0 = parsed.events[0].ms;
  const ev = parsed.events.map((e) => ({ t: (e.ms - t0) / 3600e3, dose: M.toMEq(e.amount, "mg") }));
  const level = PK.one.superpose((levelMs - t0) / 3600e3, ev, { V: pm.V, k: Ktrue });
  const o = M.nssCalc(pm, s, { events: parsed.events, unit: "mg", levelMs, level }, M.targetFor(30, "auto"), "IR", 600);
  assert.ok(o.fit.ok, o.fit.reason);
  rel(o.fit.K, Ktrue, 1e-6);
  assert.equal(o.nDoses, 4); near(o.sinceLast, 12, 1e-9);
  assert.ok(o.fracSS > 0.8 && o.fracSS < 0.9);
  assert.ok(o.rec.chosen.dailyAmt > 0 && o.current.c12 > 0);
});

test("Literature: impossible NSS level (above total dose/V) is reported, not fitted", () => {
  const pm = M.patientModel(A, "literature");
  const ev = [{ ms: M.parseDateTime("2026-10-20T08:00"), amount: 300 }];
  const o = M.nssCalc(pm, M.scheduleOf("q12h"), { events: ev, unit: "mg", levelMs: M.parseDateTime("2026-10-20T20:00"), level: 0.5 }, M.targetFor(30, "auto"), "IR", NaN);
  assert.equal(o.fit.ok, false);
  assert.ok(o.flags.some((f) => f.lvl === "crit" && /higher than the doses/.test(f.text)));
});

test("Literature: two changing creatinines use the suite Chow non-steady-state CrCl", () => {
  const pm = M.patientModel({ ...A, scrPrev: 1.0, scr: 1.5, scrHours: 24 }, "literature");
  assert.equal(pm.crclSrc, "chow");
  const chow = PK.renal.chowNonSteadyState({ age: 30, sex: "M", weight: pm.dw, scr1: 1.0, scr2: 1.5, hours: 24 });
  near(pm.crcl, chow.crcl, 1e-9);
  const wb = M.patientModel({ ...A, scrPrev: 1.0, scr: 1.5, scrHours: 24 }, "workbook");
  assert.equal(wb.crclSrc, "cockcroftGault"); near(wb.crcl, 107.80 / 1.5, 0.01, "workbook uses the most recent SCr");
});

test("Literature: optional SCr floor rounds up low creatinine", () => {
  const pm = M.patientModel({ ...A, scr: 0.5, scrFloor: 0.8 }, "literature");
  near(pm.crcl, 107.80 / 0.8, 0.01);
  assert.ok(pm.flags.some((f) => /rounded up/.test(f.text)));
});

test("Schedules: parse custom clock times; uniform detection; site-only codes", () => {
  assert.deepEqual(M.parseTimes("8, 20"), [8, 20]);
  assert.deepEqual(M.parseTimes("20:30 08:30"), [8.5, 20.5]);
  assert.equal(M.parseTimes("25"), null);
  const c = M.scheduleOf("custom", "6 14 22");
  assert.equal(c.uniform, true); assert.equal(c.code, null);
  assert.equal(M.scheduleOf("bid8_18").uniform, false);
  assert.deepEqual(M.scheduleOf("bid8_18").gaps, [10, 14]);
});

test("Safety: validation, toxicity and timing warnings", () => {
  assert.ok(M.patientModel({ ...A, age: 140 }, "literature").error);
  assert.ok(M.patientModel({ ...A, scr: 0 }, "literature").error);
  assert.ok(M.patientModel({ ...A, age: 16 }, "literature").flags.some((f) => f.lvl === "crit" && /adults/.test(f.text)));
  assert.ok(M.patientModel({ ...A, scr: 4 }, "literature").flags.some((f) => /CrCl/.test(f.text)));
  const pm = M.patientModel(A, "literature");
  const o = M.adjustCalc(pm, M.scheduleOf("q12h"), { perDose: 600, unit: "mg", level: 1.8, hours: 4, days: 2 }, M.targetFor(30, "auto"), "IR");
  const txt = o.flags.map((f) => f.text).join(" | ");
  assert.match(txt, /distribution phase/); assert.match(txt, /toxic range/); assert.match(txt, /steady state/);
  const hi = M.predict(pm, M.scheduleOf("q12h"), 1500, "mg");
  assert.ok(M.safetyFlags(hi, M.targetFor(30, "auto"), "literature", M.scheduleOf("q12h")).some((f) => f.lvl === "crit"));
  assert.ok(M.safetyFlags(M.predict(pm, M.scheduleOf("qd"), 300, "mg"), null, "literature", M.scheduleOf("qd")).some((f) => /40% higher/.test(f.text)));
});

test("Defaults and provenance: literature F 1 (verify badge), workbook SR 0.85, site SR 0.9; no Cooper nomogram shipped", () => {
  assert.equal(M.defaultF("SR", "literature"), 1); assert.equal(M.LI_SOURCES.fLit.verify, false, "SR F 1 approved");
  assert.equal(M.defaultF("SR", "literature"), M.defaultF("IR", "literature"));
  assert.equal(M.defaultF("SR", "workbook"), 0.85); assert.equal(M.defaultF("SR", "site-web"), 0.9);
  assert.equal(M.defaultF("elixir", "site-web"), 1);
  assert.doesNotMatch(html, /3600 mg|Cooper nomogram table/i);
  assert.equal(M.doseStep("SR", "mg").min, 300);
});

// ===================== Workbook cached values (lithiumdosingwintersmethod.xlsx text dump, 2026-10-23) =====================
// Hard-coded from the main sheet "Lithium Dosing Steady State" (inputs M, 70 y, 70 in, 70 kg, SCr 1, F 0.85, 600 mg
// citrate = 16 mEq, superposition tau 8 h) and the hidden "Comparison of Methods" single-test-dose table.
// The tests do not read site-mirror.
const WB = {
  CL: [0.8255461081919495,1.8,1.65,1.5,1.35,1.2,1.05,0.9,0.75,0.6,0.45,0.3,0.15,0.075],
  t12: [33.264,15.256092079387228,16.643009541149702,18.307310495264673,20.341456105849634,22.88413811908084,26.15330070752096,30.512184158774456,36.614620990529346,45.76827623816168,61.02436831754891,91.53655247632337,183.07310495264673,366.14620990529346],
  // tau: [peak[14], trough[14], c12[14]] for columns D (patient) and CrCl 120…5
  grid: {
    6: [
      [2.920834984248434,1.4386482074715488,1.5524789495235007,1.6892049477050641,1.8564581093707893,2.0656862791060595,2.334878908111397,2.6940183929790678,3.197073021011256,3.951979333527611,5.2105892158041955,7.728458256853652,15.283364267935527,30.394150592150886],
      [2.5776278265599686,1.0954410497830835,1.2092717918350353,1.3459977900165987,1.5132509516823238,1.722479121417594,1.9916717504229315,2.3508112352906028,2.8538658633227905,3.6087721758391456,4.86738205811573,7.3852510991651865,14.940157110247062,30.050943434462422],
      [2.2747485729550347,0.8341101648879615,0.9419375811676867,1.0725223444265528,1.233493193952858,1.4362947334885183,1.698913098941528,2.0513272954523094,2.5475021409623477,3.2953706277320065,4.546781010448627,7.057285164133793,14.604657100737725,29.711611731451704],
    ],
    8: [
      [2.2356110856764193,1.126418556881699,1.2114162615111788,1.313584817290427,1.4386482074715488,1.5951923685098854,1.7967094420750718,2.0656862791060595,2.4425991487720764,3.00840051092542,3.951979333527611,5.8400023624562944,11.50580301035968,22.838703299566006],
      [1.8924039279879539,0.7832113991932336,0.8682091038227134,0.9703776596019617,1.0954410497830833,1.25198521082142,1.4535022843866063,1.722479121417594,2.099391991083611,2.6651933532369547,3.6087721758391456,5.496795204767829,11.162595852671215,22.495496141877542],
      [1.741095664167909,0.6530833342952846,0.7350041709134094,0.834030867454835,0.9558862456692268,1.109155064332103,1.3073282710846397,1.5728915063144122,1.9463198119389358,2.508564403677777,3.448512988294642,5.332831033216714,10.994850655197892,22.325831505940098],
    ],
    12: [
      [1.5515749217107553,0.8167465526069788,0.8727039890384869,0.9401063460733262,1.0227698146650894,1.126418556881699,1.2600475403633171,1.4386482074715488,1.6892049477050641,2.0656862791060595,2.6940183929790678,3.951979333527611,7.728458256853652,15.283364267935527],
      [1.2083677640222898,0.47353939491851355,0.5294968313500215,0.5968991883848609,0.6795626569766241,0.7832113991932336,0.9168403826748517,1.0954410497830835,1.3459977900165987,1.722479121417594,2.3508112352906028,3.6087721758391456,7.3852510991651865,14.940157110247062],
      [1.2083677640222898,0.47353939491851343,0.5294968313500216,0.5968991883848609,0.6795626569766241,0.7832113991932336,0.9168403826748517,1.0954410497830833,1.3459977900165987,1.722479121417594,2.3508112352906023,3.6087721758391456,7.3852510991651865,14.940157110247062],
    ],
    24: [
      [0.8722589603495088,0.5169977495877557,0.5431549043543329,0.5750141571473851,0.6144851908870966,0.6644317456641645,0.7293530306143402,0.8167465526069788,0.9401063460733262,1.126418556881699,1.4386482074715488,2.0656862791060595,3.951979333527611,7.728458256853652],
      [0.5290518026610433,0.17379059189929033,0.1999477466658675,0.23180699945891975,0.2712780331986313,0.32122458797569914,0.3861458729258749,0.47353939491851355,0.5968991883848609,0.7832113991932336,1.0954410497830835,1.722479121417594,3.6087721758391456,7.3852510991651865],
      [0.679315961361247,0.29974880301922324,0.32954908468415395,0.36509218892594114,0.40828462377799274,0.46198681121753443,0.5306945097489767,0.6219016548645698,0.7490986016317381,0.9392677222243604,1.2553701855075197,1.886293054421551,3.7764789233260356,7.554906011081852],
    ],
    48: [
      [0.5429457290939801,0.3869299132979302,0.3970073982633992,0.40980740057769316,0.42629005083079247,0.44789398655417345,0.476877065121333,0.5169977495877557,0.5750141571473851,0.6644317456641645,0.8167465526069788,1.126418556881699,2.0656862791060595,3.951979333527611],
      [0.1997385714055147,0.043722755609464876,0.053800240574933884,0.06660024288922782,0.08308289314232715,0.1046868288657081,0.13366990743286764,0.17379059189929033,0.23180699945891975,0.32122458797569914,0.47353939491851355,0.7832113991932336,1.722479121417594,3.6087721758391456],
      [0.4228465589836665,0.22433710486335406,0.2408768173898141,0.2601979082692579,0.2832414443910178,0.31142568963924794,0.3469870277661403,0.39366160163592523,0.458184654147587,0.554038539680307,0.7126963116722386,1.0285954463215967,1.9739528061459974,3.863232669473468],
    ],
    72: [
      [0.4417820593396173,0.35675865706543974,0.36122733385147376,0.3672689656318441,0.3755173570225735,0.38692991329793025,0.40301562953091613,0.4262900508307926,0.4612751107213902,0.5169977495877557,0.6144851908870966,0.8167465526069791,1.4386482074715494,2.6940183929790704],
      [0.09857490165115193,0.013551499376974415,0.018020176163008415,0.02406180794337874,0.03231019933410812,0.04372275560946486,0.059808471842450764,0.08308289314232718,0.11806795303292487,0.1737905918992903,0.2712780331986313,0.47353939491851366,1.095441049783084,2.3508112352906045],
      [0.3440602137605918,0.20684418937486956,0.2191679321669018,0.2331890944255962,0.2495063593196304,0.26903668883325743,0.2932437008658665,0.32459333586136796,0.3675547366020729,0.43110022973583806,0.5362022376765195,0.7458167123383356,1.3747603858918636,2.6335208232551963],
    ],
    96: [
      [0.39692513298467674,0.3476461859265466,0.3496277806694321,0.35251765556508496,0.35675865706543974,0.3630401519440306,0.3724721363982324,0.3869299132979302,0.40980740057769316,0.44789398655417345,0.5169977495877557,0.6644317456641645,1.126418556881699,2.0656862791060595],
      [0.05371797529621139,0.004439028238081274,0.006420622980966756,0.009310497876619651,0.01355149937697441,0.019832994255565218,0.02926497870976704,0.043722755609464876,0.06660024288922782,0.1046868288657081,0.17379059189929033,0.32122458797569914,0.7832113991932336,1.722479121417594],
      [0.3091256043891878,0.20156089303826374,0.21213012011136848,0.22382308488503816,0.23704244827971435,0.2524258710319441,0.27101953309841703,0.29462304141781964,0.32654406811880327,0.3734778355510612,0.45113430610504995,0.6067295889315197,1.076396301675484,2.0192986968892668],
    ],
    120: [
      [0.3738986258792405,0.34468664931191867,0.34554312250745944,0.3469007183788989,0.3490606757310694,0.35251765556508496,0.3581033908534391,0.3672689656318441,0.3826959534931915,0.40980740057769316,0.4612751107213902,0.5750141571473851,0.9401063460733262,1.6892049477050641],
      [0.030691468190775107,0.0014794916234533051,0.0023359648189940946,0.003693560690433612,0.0058535180426040915,0.009310497876619651,0.014896233164973759,0.02406180794337874,0.03948879580472616,0.06660024288922782,0.11806795303292487,0.23180699945891975,0.5968991883848609,1.3459977900165987],
      [0.29119254262407473,0.19984499087344068,0.20965183012865,0.2202567380970954,0.2319276506254111,0.24510946181477486,0.2605644941083426,0.27965245372361186,0.3049410365213238,0.34171921382126313,0.4025105083431352,0.5250774146065214,0.8983578865180734,1.6512717270678086],
    ],
  },
  supPeakD: [0.3432071576884654,0.6337257445234026,0.8796444190202239,1.0878100827911066,1.2640185129228831,1.4131757288010967,1.5394345861775685,1.6463104015523224,1.736778826099835,1.8133586941589497,1.8781821529655247,1.93305402618949,1.9795020640840912,2.018819479318898,2.0521009527850977,2.0802731118516675,2.1041203296522304,2.124306563709893,2.1413938419340686,2.1558579106789546,2.1681014805390624],
  sup12D: [0.267290003163488,0.493546106087335,0.6850677623573415,0.8471873443106835,0.9844186076810941,1.1005823642077974,1.1989128612022943,1.2821478299075477,1.3526047097883866,1.41224517100033,1.4627297314802878,1.5054639893157067,1.5416377576001525,1.5722581913733638,1.5981778289706101,1.620118328512467,1.6386905604096196,1.6544116153009898,1.6677192009625368,1.6789838290274526],
  supPeakQ21: 6.220722785168998,
  com: {"dose":600,"wt":56.6,"crcl":[129,110,100,90,80,70,60,50,40,30,20,10,5],"lvl24":[0.12694618890205833,0.15086771119138506,0.16521812464345248,0.1809335377009294,0.1981437880112809,0.216991063272941,0.23763107596207256,0.26023434979837706,0.2849876285784815,0.3120954190164063,0.3417816803377578,0.3742916745867408,0.39168853572435164],"q12":[933.2072369326416,759.1877324017232,673.4568396663083,591.533687776214,513.2491557776918,438.4416342305544,366.956691584016,298.6467553704645,233.37080755902053,170.99409343998366,111.38784343918438,54.42900728796318,26.90541732246252]},
};

const WBP = { age: 70, sex: "M", ht: 70, htUnit: "in", wt: 70, wtUnit: "kg", scr: 1, scrPrev: NaN, scrHours: 24, scrFloor: null, inter: {}, form: "elixir", F: 0.85 };
const R9 = 1e-9;

test("Workbook cached case: FFM, DW, CrCl, CL, K, t½, time to SS (D11–D21)", () => {
  const pm = M.patientModel(WBP, "workbook");
  rel(pm.ffm, 56.608875990305116, R9, "FFM D12"); rel(pm.dw, 56.608875990305116, R9, "DW D13"); assert.equal(pm.dwBasis, "FFM");
  rel(pm.crcl, 55.036407212796639, R9, "CrCl D11"); rel(pm.CL, 0.82554610819194951, R9, "CL D18");
  rel(pm.K, 0.020833333333333332, R9, "K D19"); rel(pm.t12, 33.264, R9, "t½ D20"); rel(pm.tss, 166.32, R9, "5 t½ D21");
  assert.equal(pm.F, 0.85);
});

test("Workbook cached case (L3): 600 mg citrate-equivalent = 16 mEq (D16, 8 per 300 mg); same as 10 mL; carbonate 600 mg = 16.24", () => {
  near(M.toMEq(600, "mgCit"), 16, 1e-12); near(M.toMEq(10, "mL"), 16, 1e-12); near(M.toMEq(600, "mg"), 16.24, 1e-12);
  near(M.fromMEq(16, "mgCit"), 600, 1e-12);
  assert.equal(M.LI.CITRATE_MEQ_PER_300MG_EQ, 8);
  assert.deepEqual([M.doseStep("elixir", "mgCit").inc, M.doseStep("elixir", "mgCit").min], [300, 300]);
});

test("Workbook cached case: full grid, 14 columns × 8 taus × Peak/Trough/C12 (336 cells) and CL/t½ rows", () => {
  const pm = M.patientModel(WBP, "workbook");
  const g = M.workbookGrid(pm, M.toMEq(600, "mgCit"));
  assert.equal(g.cols.length, 14);
  g.cols.forEach((c, j) => { rel(c.CL, WB.CL[j], R9, `CL col ${j}`); rel(c.t12, WB.t12[j], R9, `t½ col ${j}`); });
  let n = 0;
  for (const row of g.rows) {
    const [pk, tr, c12] = WB.grid[row.tau];
    row.cells.forEach((c, j) => { rel(c.peak, pk[j], R9, `peak tau ${row.tau} col ${j}`); rel(c.trough, tr[j], R9, `trough tau ${row.tau} col ${j}`); rel(c.c12, c12[j], R9, `C12 tau ${row.tau} col ${j}`); n += 3; });
  }
  assert.equal(n, 336);
  for (const [k, tau] of [["q6h", 6], ["q8h", 8], ["q12h", 12], ["qd", 24]]) {
    const pr = M.predict(pm, M.scheduleOf(k), 600, "mgCit", "workbook");
    rel(pr.peak, WB.grid[tau][0][0], R9, `${k} peak`); rel(pr.trough, WB.grid[tau][1][0], R9, `${k} trough`); rel(pr.c12, WB.grid[tau][2][0], R9, `${k} C12`);
  }
});

test("Workbook cached case: superposition tau 8 h, doses 1–21 (peak) and 12-h rows, column D; column Q dose 21", () => {
  const pm = M.patientModel(WBP, "workbook");
  const ev = Array.from({ length: 21 }, (_, i) => ({ t: i * 8, dose: 16, F: pm.F }));
  for (let n = 1; n <= 21; n++) {
    const peak = PK.fit.oneCompPredictor(ev.slice(0, n))({ CL: pm.CL, V: pm.V }, (n - 1) * 8 + 1e-12);
    rel(peak, WB.supPeakD[n - 1], R9, `peak dose ${n}`);
    if (n <= 20) rel(peak * Math.exp(-pm.K * 12), WB.sup12D[n - 1], R9, `12-h row dose ${n}`);
  }
  const g = M.workbookGrid(pm, 16), Kq = g.cols[13].K;
  rel(PK.fit.oneCompPredictor(ev)({ CL: Kq * pm.V, V: pm.V }, 160 + 1e-12), WB.supPeakQ21, R9, "col Q dose 21");
});

test("Workbook cached hidden test-dose table: 600 mg carbonate, 56.6 kg, CrCl 129…5 → 24-h level and q12h dose for 0.8 (F 1)", () => {
  const V = 0.7 * WB.com.wt;
  WB.com.crcl.forEach((crcl, j) => {
    const CL = 0.015 * crcl, K = CL / V;
    const pm = { model: "workbook", CL, V, K, F: 1, t12: PK.one.halfLife(K), tss: 5 * PK.one.halfLife(K), crcl, factor: 1 };
    // q12h dose for a 12-h level of 0.8 (the L1 target logic) reproduces row 63.
    const rec = M.recommend(pm, M.scheduleOf("q12h"), M.workbookTarget("auto"), "mg", "IR", "workbook");
    rel(rec.exactDailyAmt / 2, WB.com.q12[j], R9, `q12h dose CrCl ${crcl}`);
    // The single-point fit recovers K from the cached 24-h level (row 62).
    const h = { events: [{ ms: 0, amount: 600 }], unit: "mg", levelMs: 24 * 3600e3, level: WB.com.lvl24[j] };
    const o = M.nssCalc(pm, M.scheduleOf("q12h"), h, M.workbookTarget("auto"), "IR", NaN, "workbook");
    assert.ok(o.fit.ok); rel(o.fit.K, K, 1e-7, `K from 24-h level CrCl ${crcl}`);
  });
});

test("Workbook cached case: q12h dose for a 12-h level of 0.8 = 783 mg/day carbonate, 794 mg/day citrate-equivalent", () => {
  const pm = M.patientModel(WBP, "workbook");
  near(M.recommend(pm, M.scheduleOf("q12h"), M.workbookTarget("auto"), "mg", "SR", "workbook").exactDailyAmt, 782.72, 0.005);
  const rc = M.recommend(pm, M.scheduleOf("q12h"), M.workbookTarget("auto"), "mgCit", "elixir", "workbook");
  near(rc.exactDailyAmt, (782.7193310200939 * 8.12) / 8, 1e-6);
  assert.deepEqual(rc.chosen.perDose, [300, 600]);
});

test("Workbook multiple-level method (L4): K = −slope ln C vs t (Excel SLOPE), Vd fixed, CL = K·V", () => {
  const pm = M.patientModel(A, "workbook");
  const Ktrue = 0.025, F = pm.F, D = M.toMEq(600, "mg");
  const lv = [12, 24, 36].map((t) => ({ t, c: ((F * D) / (0.8 * pm.V)) * Math.exp(-Ktrue * t) }));   // V differs: slope still exact
  const o = M.multiLevelCalc(pm, M.scheduleOf("q12h"), { levels: lv, testDose: 600, unit: "mg" }, M.workbookTarget("auto"), "IR");
  assert.ok(!o.error); near(o.pmFit.K, Ktrue, 1e-12); near(o.pmFit.CL, Ktrue * pm.V, 1e-12, "V fixed at population");
  assert.equal(o.pmFit.V, pm.V); near(o.fit.r2, 1, 1e-12); near(o.apparentV, 0.8 * pm.V, 1e-9, "apparent V (info only)");
  assert.equal(o.rec.kind, "c12"); near(o.rec.exactDailyAmt, (2 * 300 * 0.8 * pm.V * (1 - Math.exp(-Ktrue * 12))) / (F * Math.exp(-Ktrue * 12) * 8.12), 1e-9);
  // Hand-computed SLOPE for noisy levels: x 12/24/36, y ln(0.40/0.31/0.22).
  const r = M.logLinearK([{ t: 12, c: 0.4 }, { t: 24, c: 0.31 }, { t: 36, c: 0.22 }]);
  const ys = [0.4, 0.31, 0.22].map(Math.log), slope = ((-12) * (ys[0] - (ys[0] + ys[1] + ys[2]) / 3) + 12 * (ys[2] - (ys[0] + ys[1] + ys[2]) / 3)) / 288;
  near(r.K, -slope, 1e-12); near(r.K, 0.02491, 1e-5);
  // Two levels: slope between them.
  near(M.logLinearK([{ t: 12, c: 0.4 }, { t: 36, c: 0.22 }]).K, Math.log(0.4 / 0.22) / 24, 1e-12);
  // Errors and warnings.
  assert.ok(M.multiLevelCalc(pm, M.scheduleOf("q12h"), { levels: [{ t: 12, c: 0.4 }], unit: "mg" }, M.workbookTarget("auto"), "IR").error);
  assert.ok(/do not fall/.test(M.multiLevelCalc(pm, M.scheduleOf("q12h"), { levels: [{ t: 12, c: 0.3 }, { t: 24, c: 0.35 }], unit: "mg" }, M.workbookTarget("auto"), "IR").error));
  assert.ok(/different times/.test(M.logLinearK([{ t: 12, c: 0.3 }, { t: 12, c: 0.25 }]).reason));
  const early = M.multiLevelCalc(pm, M.scheduleOf("q12h"), { levels: [{ t: 4, c: 0.6 }, { t: 24, c: 0.3 }], unit: "mg" }, M.workbookTarget("auto"), "IR");
  assert.ok(early.flags.some((f) => f.lvl === "crit" && /distribution/.test(f.text)));
  const two = M.multiLevelCalc(pm, M.scheduleOf("q12h"), { levels: [{ t: 12, c: 0.4 }, { t: 36, c: 0.22 }], unit: "mg" }, M.workbookTarget("auto"), "IR");
  assert.ok(two.flags.some((f) => /Two levels/.test(f.text)));
});

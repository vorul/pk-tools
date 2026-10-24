// Tests for pk-suite/phenobarbital.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js, then the page's CALC block (between CALC-START and CALC-END) with new Function,
// so the tests exercise the published code. Covers specs/phenobarbital.md §8 (A–G, tolerance ±0.5%)
// and the literature-mode defaults in lit/lithium-phenobarb-phenytoin.md §1b/§2, plus regression tests against the
// cached values of the site workbook phenobarbital.xlsm (hard-coded from its text dump; see the workbook section at the end).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "phenobarbital.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function("PK", `${block}; return {
  PB_SRC, PB_BANDS, PB_TABLE, PB_MODELS, PB_ROUTES, PB_DEFAULT_SETTINGS, PB_UMOL_PER_MGL,
  pbAge, pbBand, pbTargets, pbSF, pbVpaFactor, pbInteractions, pbPatient, pbParseStrengths, pbRoundTablets, pbRoundDose,
  pbSS, pbCp, pbDaysToLevel, pbDaysToFss, pbDaysFromLevelToFss, pbHistory, pbEvents, pbLevelAt, pbStatus,
  pbInitial, pbSteady, pbNonSteady, pbDialysisSupplement, pbCalc, pbDaysToHold };`)(PK);

const near = (a, e, tol, msg) => assert.ok(Math.abs(a - e) <= tol, `${msg || ""} expected ${e} ± ${tol}, got ${a}`);
const rel = (a, e, r = 0.005, msg) => near(a, e, Math.abs(e) * r, msg); // spec §8: ±0.5%

const pt = (o = {}) => ({ model: "site", ageValue: 45, ageUnit: "y", sex: "M", wt: 70, htCm: 175, inter: {}, ...o });
const base = (o = {}) => ({ route: "iv", form: "inj", tau: 24, target: 20, range: [10, 40], fss: 0.9, load: true, ldRoute: "iv", settings: {}, ...o });
const sfIV = { S: 0.91, F: 1 }, sfPO = { S: 1, F: 1 };
// The spec §8 hand calculations used the page's primary CL list. Since the workbook check (2026-10-23) the Site model
// uses the workbook's dosing-table set, so §8 now runs the same equations with the page list injected (pageCl).
const pagePm = (o = {}) => {
  const pm = M.pbPatient(pt(o)), clPerKg = M.PB_MODELS.site.pageCl[pm.band.key];
  const CLpop = clPerKg * pm.wt, CL = CLpop * pm.factor, k = CL / pm.V;
  return { ...pm, clPerKg, CLpop, CL, k, thalf: Math.LN2 / k };
};

// ======================= Bands and models =======================
test("age bands: neonate < 14 days, ≥ 19 y adult, > 65 y older adult", () => {
  const b = (v, u) => M.pbBand(M.pbAge(v, u)).key;
  assert.equal(b(13, "d"), "neonate");
  assert.equal(b(14, "d"), "infant");
  assert.equal(b(2, "wk"), "infant");
  assert.equal(b(11, "mo"), "infant");
  assert.equal(b(1, "y"), "child1");
  assert.equal(b(4.99, "y"), "child1");
  assert.equal(b(5, "y"), "child5");
  assert.equal(b(10, "y"), "child10");
  assert.equal(b(15, "y"), "child15");
  assert.equal(b(18.9, "y"), "child15");
  assert.equal(b(19, "y"), "adult", "19 is adult (spec §7 edge case)");
  assert.equal(b(65, "y"), "adult");
  assert.equal(b(65.1, "y"), "elderly");
  for (const k of Object.keys(M.PB_TABLE)) {
    assert.ok(M.PB_MODELS.site.cl[k] > 0, k);
    const lit = M.PB_MODELS.literature;
    assert.ok(lit.cl[lit.clBand({ years: 10, days: 3652 }, { key: k })] > 0, k);
    assert.ok(M.PB_MODELS.site.vd[k] > 0 && M.PB_MODELS.literature.vd[k] > 0, k);
  }
});

test("site parameter set: V §3a; CL = workbook dosing-table set (MD ÷ 480); page list kept as pageCl", () => {
  const s = M.PB_MODELS.site;
  assert.deepEqual([s.vd.neonate, s.vd.infant, s.vd.child10, s.vd.adult, s.vd.elderly], [0.96, 0.63, 0.63, 0.61, 0.61]);
  for (const [k, row] of Object.entries(M.PB_TABLE)) near(s.cl[k], row.mdMid / 480, 1e-15, k);
  assert.deepEqual([s.pageCl.neonate, s.pageCl.infant, s.pageCl.child1, s.pageCl.child15, s.pageCl.adult, s.pageCl.elderly], [0.0047, 0.0047, 0.0082, 0.0082, 0.0056, 0.0024]);
  assert.deepEqual(s.range, [10, 40]);
});

test("literature parameter set matches the signed-off decisions (Q11–Q13)", () => {
  const l = M.PB_MODELS.literature;
  assert.equal(l.vd.neonate, 0.96, "Grasela 1985");
  for (const k of ["infant", "child1", "child5", "child10", "child15", "adult", "elderly"]) assert.equal(l.vd[k], 0.7, k);
  assert.deepEqual(l.cl, { neonate: 0.0047, infant: 0.006, child: 0.008, teen12: 0.006, teen15: 0.005, adult: 0.004, elderly: 0.0032 });
  assert.deepEqual(l.range, [10, 40], "Patsalos 2018");
  assert.deepEqual(l.overlay, [15, 40], "Winter overlay");
  assert.equal(l.target, 20);
  assert.deepEqual(M.pbTargets("literature", "general").range, [10, 40]);
  assert.deepEqual(M.pbTargets("site", "general").range, [10, 40]);
  assert.deepEqual(M.pbTargets("literature", "febrile").range, [16, 30]);
  assert.equal(M.PB_MODELS.literature.key, "literature");
});

test("routes: S 0.91 for injection, rectal S 0.91 × F 0.9 (Graves 1989), oral S = F = 1", () => {
  const r = M.pbSF("rectal"); rel(r.S * r.F, 0.819, 1e-9);
  assert.deepEqual(M.pbSF("iv"), sfIV);
  assert.deepEqual(M.pbSF("im"), sfIV);
  assert.deepEqual(M.pbSF("po"), sfPO);
  assert.deepEqual(M.pbSF("rectal"), { S: 0.91, F: 0.9 });
});

// ======================= Spec §8 A: adult 70 kg IV, site model =======================
test("§8 A: adult 70 kg IV, target 20 (site)", () => {
  const pm = pagePm();
  rel(pm.CL, 0.392); rel(pm.V, 42.7); rel(pm.k, 0.009180); rel(pm.thalf, 75.50);
  const r = M.pbInitial(base(), pm);
  rel(r.md.exact, 206.77, 0.005, "MD");
  rel(r.ld.exact, 938.46, 0.005, "LD");
  assert.deepEqual(r.ld.table, [700, 1400], "table LD 10–20 mg/kg");
  const ss = M.pbSS(200, 24, sfIV, pm);
  rel(ss.cavg, 19.345); rel(ss.cmax, 21.555); rel(ss.cmin, 17.292);
  rel(M.pbDaysToFss(pm.k, 0.9), 10.45); rel(M.pbDaysToFss(pm.k, 0.95), 13.60);
  rel(r.times.t90, 10.45);
});

test("§8 A: non-steady-state Cp (corrected 1 − Exp) and superposition agree", () => {
  const pm = pagePm();
  rel(M.pbCp(1, 24, 200, 24, sfIV, pm), 3.419, 0.005, "N=1 T=24");
  rel(M.pbCp(7, 0, 200, 24, sfIV, pm), 16.944, 0.005, "N=7 T=0");
  rel(M.pbCp(7, 24, 200, 24, sfIV, pm), 13.594, 0.005, "N=7 T=24");
  const hist = M.pbHistory({ dose: 200, route: "iv", tau: 24, n: 7 });
  rel(M.pbLevelAt(24, hist, pm), 3.419, 0.005, "superposed trough before dose 2");
  rel(M.pbLevelAt(144 + 1e-9, hist, pm), 16.944, 0.005, "just after dose 7");
  rel(M.pbLevelAt(168, hist, pm), 13.594, 0.005, "trough before dose 8");
});

test("§8 A: time to 15 mg/L 6.778 d; from 15 mg/L to 90% SS 3.673 d (corrected sign)", () => {
  const pm = pagePm();
  const cavg = M.pbSS(200, 24, sfIV, pm).cavg;
  rel(M.pbDaysToLevel(15, cavg, pm.k), 6.778);
  rel(M.pbDaysFromLevelToFss(15, cavg, 0.9, pm.k), 3.673);
  assert.ok(M.pbDaysToFss(pm.k, 0.9) > 0, "positive, not the site's negative");
  assert.ok(Number.isNaN(M.pbDaysToLevel(25, cavg, pm.k)), "level ≥ Css is unreachable");
  assert.ok(Number.isNaN(M.pbDaysToFss(pm.k, 1)), "fss must be < 1");
  assert.equal(M.pbDaysFromLevelToFss(19, cavg, 0.9, pm.k), 0, "already within 90%");
});

// ======================= §8 B–E =======================
test("§8 B: adult 70 kg PO (site)", () => {
  const pm = pagePm();
  const r = M.pbInitial(base({ route: "po", form: "tab", ldRoute: "po" }), pm);
  rel(r.md.exact, 188.16); rel(r.ld.exact, 854.0);
  const ss = M.pbSS(200, 24, sfPO, pm);
  rel(ss.cavg, 21.259); rel(ss.cmax, 23.686); rel(ss.cmin, 19.003);
});

test("§8 C: neonate 3.5 kg IV (site)", () => {
  const pm = pagePm({ ageValue: 5, ageUnit: "d", wt: 3.5, htCm: NaN });
  assert.equal(pm.band.key, "neonate");
  rel(pm.CL, 0.01645); rel(pm.V, 3.36); rel(pm.k, 0.004896); rel(pm.thalf, 141.58);
  const r = M.pbInitial(base(), pm);
  rel(r.md.exact, 8.68); rel(r.ld.exact, 73.85);
  near(r.ld.table[0], 52.5, 1e-9); near(r.ld.table[1], 87.5, 1e-9);
  const ss = M.pbSS(10, 24, sfIV, pm);
  rel(ss.cavg, 23.05); rel(ss.cmax, 24.43); rel(ss.cmin, 21.72);
  rel(r.times.t90, 19.6, 0.005);
  assert.ok(pm.flags.some((f) => /first 10 postnatal days/.test(f.text)));
  assert.equal(r.md.rounded.total, 9, "IV rounded to 1 mg under 10 kg");
});

test("§8 D: child 20 kg PO (site)", () => {
  const pm = pagePm({ ageValue: 6, wt: 20, htCm: 115 });
  rel(pm.CL, 0.164); rel(pm.V, 12.6); rel(pm.thalf, 53.25);
  const r = M.pbInitial(base({ route: "po", form: "tab", ldRoute: "po" }), pm);
  rel(r.md.exact, 78.72); rel(r.ld.exact, 252);
  const ss = M.pbSS(100, 24, sfPO, pm);
  rel(ss.cavg, 25.41); rel(ss.cmax, 29.58); rel(ss.cmin, 21.65);
});

test("§8 E: geriatric 70 kg PO (site)", () => {
  const pm = pagePm({ ageValue: 75 });
  assert.equal(pm.band.key, "elderly");
  rel(pm.CL, 0.168); rel(pm.thalf, 176.17);
  const r = M.pbInitial(base({ route: "po", form: "tab" }), pm);
  rel(r.md.exact, 80.64);
  rel(M.pbSS(100, 24, sfPO, pm).cavg, 24.80);
  rel(r.times.t90, 24.39);
});

// ======================= §8 F: steady-state adjustment =======================
test("§8 F: 200 mg IV q24h, SS level 12 → target 25", () => {
  const pm = pagePm();
  const r = M.pbSteady(base({ target: 25, route: "iv", tau: 24, ss: { dose: 200, route: "iv", tau: 24, level: 12, days: 28, sample: "trough", ldRoute: "iv" } }), pm);
  assert.ok(r.valid);
  rel(r.proportional, 416.67); rel(r.newExact, 416.67, 0.005, "MD equals proportional");
  rel(r.CLpt, 0.63194); rel(r.k, 0.014800); rel(r.thalf, 46.8);
  assert.equal(r.rounded.total, 420, "IV rounded to 10 mg ≥ 40 kg");
  rel(r.topUp.exact, (42.7 * 13) / 0.91, 1e-9, "top-up LD = V(Ctarget − Cmeasured)/(S·F)");
});

test("§8 F: steady-state check warns when days on regimen < 90% SS", () => {
  const pm = pagePm();
  const r = M.pbSteady(base({ ss: { dose: 200, route: "iv", tau: 24, level: 12, days: 5, sample: "trough" } }), pm);
  assert.ok(r.fracPop < 0.9);
  assert.ok(r.flags.some((f) => f.lvl === "warn" && /not at steady state/i.test(f.text)));
  const ok = M.pbSteady(base({ ss: { dose: 200, route: "iv", tau: 24, level: 12, days: 28, sample: "trough" } }), pm);
  assert.ok(!ok.flags.some((f) => /not at steady state/i.test(f.text)));
});

test("SS route change: IV 200 mg → PO uses S ratio", () => {
  const pm = pagePm();
  const r = M.pbSteady(base({ route: "po", form: "tab", target: 20, ss: { dose: 200, route: "iv", tau: 24, level: 20, days: 30 } }), pm);
  rel(r.newExact, 182, 1e-9, "200 × 0.91 / 1");
});

// ======================= §8 G: table cross-check =======================
test("§8 G: dosing-table CL = MD/(20 × 24); site (workbook), page list and literature on 2 mg/kg/day", () => {
  for (const [k, row] of Object.entries(M.PB_TABLE)) rel(row.mdMid / 480, row.clCalc, 0.001, k);
  rel(5 / 480, 0.010417, 0.0005); rel(2 / 480, 0.0041667, 0.0005);
  const site = M.pbInitial(base({ route: "po", form: "tab" }), M.pbPatient(pt()));
  near(site.md.tableMidDaily, 140, 1e-9);
  rel(site.md.tableCss, 20.0, 1e-9, "site workbook CL is the table set");
  const page = M.pbInitial(base({ route: "po", form: "tab" }), pagePm());
  rel(page.md.tableCss, 14.88, 0.005, "page primary CL under-predicts");
  const lit = M.pbInitial(base({ route: "po", form: "tab" }), M.pbPatient(pt({ model: "literature" })));
  rel(lit.md.tableCss, 20.83, 0.005, "literature CL 0.004 ≈ table 0.004167");
  const tbl = M.PB_TABLE.adult.clCalc;
  rel((1 * 140) / (tbl * 70 * 24), 20.0, 0.001, "table predicts 20 by construction");
});

// ======================= Literature-mode cases =======================
test("literature: adult 70 kg PO target 20", () => {
  const pm = M.pbPatient(pt({ model: "literature" }));
  rel(pm.CL, 0.28, 1e-9); rel(pm.V, 49, 1e-9); rel(pm.k, 0.0057143, 1e-4); rel(pm.thalf, 121.28, 0.001);
  const r = M.pbInitial(base({ route: "po", form: "tab", ldRoute: "iv", range: [15, 40] }), pm);
  rel(r.md.exact, 134.4, 1e-9); rel(r.ld.exact, 980 / 0.91, 1e-9);
  assert.deepEqual(r.ld.guide, [15, 20]);
  rel(r.times.t90, 16.79, 0.005, "≈ 2.4 weeks");
  // Rule of thumb (Winter): each 1 mg/kg/day gives about 10 mg/L in adults.
  rel(M.pbSS(70, 24, sfPO, pm).cavg, 10.42, 0.005);
});

test("literature: neonate 3.5 kg IV, CL 0.0047 and V 0.96 (Grasela 1985); neonatal 20 mg/kg guide", () => {
  const pm = M.pbPatient(pt({ model: "literature", ageValue: 3, ageUnit: "d", wt: 3.5, htCm: NaN }));
  rel(pm.V, 3.36, 1e-9); rel(pm.CL, 0.01645, 1e-9); rel(pm.thalf, 141.58, 0.005);
  assert.equal(pm.src.cl, "litClNeo"); assert.equal(pm.src.vd, "litClNeo");
  const r = M.pbInitial(base({ range: [10, 40] }), pm);
  rel(r.ld.exact, 73.846, 1e-4);
  assert.deepEqual(r.ld.guide, [20, 20]);
  rel(r.md.exact, (20 * 24 * 0.01645) / 0.91, 1e-9);
});

test("literature: infant, child, adolescent bands and elderly (Messina 2005)", () => {
  const cl = (age, wt, unit = "y") => M.pbPatient(pt({ model: "literature", ageValue: age, ageUnit: unit, wt }));
  const inf = cl(6, 7, "mo");
  assert.equal(inf.band.key, "infant"); assert.equal(inf.clKey, "infant"); rel(inf.CL, 0.042, 1e-9); rel(inf.V, 4.9, 1e-9);
  assert.equal(inf.src.cl, "litClLow");
  for (const [age, key, v] of [[1, "child", 0.008], [3, "child", 0.008], [11.9, "child", 0.008], [12, "teen12", 0.006], [14.9, "teen12", 0.006], [15, "teen15", 0.005], [18.9, "teen15", 0.005], [19, "adult", 0.004], [65, "adult", 0.004], [66, "elderly", 0.0032]]) {
    const pm = cl(age, 40);
    assert.equal(pm.clKey, key, `age ${age}`); rel(pm.CL, v * 40, 1e-9, `age ${age}`);
  }
  assert.equal(cl(8, 25).src.cl, "litClChild");
  assert.equal(cl(13, 45).src.cl, "litClLow");
  const old = cl(80, 70);
  rel(old.CL, 0.224, 1e-9); assert.equal(old.src.cl, "litClOld");
  rel(M.pbInitial(base({ route: "po", form: "tab" }), old).md.exact, 107.52, 1e-9, "≈ 1.5 mg/kg/day");
});

test("literature vs page list: adult CL ratio 0.004/0.0056 → page list predicts ~30% lower levels; workbook 0.004/0.004167", () => {
  const lit = M.pbPatient(pt({ model: "literature" })), site = pagePm();
  rel(M.pbSS(100, 24, sfPO, M.pbPatient(pt())).cavg / M.pbSS(100, 24, sfPO, lit).cavg, 0.004 / (2 / 480), 1e-9);
  const cl = M.pbSS(100, 24, sfPO, lit).cavg, cs = M.pbSS(100, 24, sfPO, site).cavg;
  rel(cs / cl, 0.004 / 0.0056, 1e-9);
});

// ======================= Interactions =======================
test("valproate: literature max(0.5, 1 − 0.25 per g/day); site workbook 0.75/0.5 anchors", () => {
  near(M.pbVpaFactor(0, "literature"), 1, 0);
  near(M.pbVpaFactor(500, "literature"), 0.875, 1e-12);
  near(M.pbVpaFactor(1000, "literature"), 0.75, 1e-12);
  near(M.pbVpaFactor(1500, "literature"), 0.625, 1e-12);
  near(M.pbVpaFactor(2000, "literature"), 0.5, 1e-12);
  near(M.pbVpaFactor(3000, "literature"), 0.5, 1e-12, "floor");
  near(M.pbVpaFactor(500, "site"), 0.75, 1e-12);
  near(M.pbVpaFactor(1500, "site"), 0.625, 1e-12);
  near(M.pbVpaFactor(1000, "site"), 0.75, 1e-12, "workbook R5");
  near(M.pbVpaFactor(2000, "site"), 0.5, 1e-12);
  const pm = M.pbPatient(pt({ model: "literature", inter: { vpa: 1000 } }));
  rel(pm.CL, 0.21, 1e-9);
  assert.equal(pm.interactions[0].src, "vpaLit");
  assert.ok(pm.flags.some((f) => /2–3 weeks/.test(f.text)), "recheck warning");
  const low = M.pbPatient(pt({ model: "literature", inter: { vpa: 500 } }));
  assert.equal(low.interactions[0].src, "vpaLit");
  assert.equal(M.pbPatient(pt({ inter: { vpa: 500 } })).interactions[0].src, "vpaLow", "site mode keeps the low-dose flag");
  assert.ok(M.pbPatient(pt({ model: "literature", ageValue: 8, wt: 25, inter: { vpa: 500 } })).flags.some((f) => /0.62/.test(f.text)));
  assert.ok(M.PB_SRC.vpaLow.verify);
});

test("chloramphenicol ×0.6, pyridoxine ×1.4, phenothiazines ×1.3 multiply", () => {
  const one = (inter) => M.pbPatient(pt({ model: "literature", inter })).factor;
  near(one({ chloramphenicol: true }), 0.6, 1e-12);
  near(one({ pyridoxine: true }), 1.4, 1e-12);
  near(one({ phenothiazine: true }), 1.3, 1e-12);
  near(one({ chloramphenicol: true, pyridoxine: true, vpa: 2000 }), 0.6 * 1.4 * 0.5, 1e-12);
  const pm = M.pbPatient(pt({ model: "literature", inter: { chloramphenicol: true } }));
  rel(pm.CL, 0.28 * 0.6, 1e-9);
  rel(pm.thalf, 0.693 / ((0.28 * 0.6) / 49), 1e-9);
});

test("carbamazepine/phenytoin factors apply only over 65 y; warn-only items add no factor", () => {
  near(M.pbPatient(pt({ ageValue: 70, inter: { carbamazepine: true, phenytoin: true } })).factor, 0.91 * 0.8, 1e-12);
  const young = M.pbPatient(pt({ ageValue: 40, inter: { carbamazepine: true } }));
  near(young.factor, 1, 0);
  assert.ok(young.flags.some((f) => /only for patients over 65/.test(f.text)));
  const w = M.pbPatient(pt({ inter: { rifampin: true, liver: true, renalFail: true, pregnancy: true, dialysis: "crrt", benzo: true } }));
  near(w.factor, 1, 0);
  assert.ok(w.flags.filter((f) => f.lvl === "warn").length >= 6);
});

// ======================= Rounding =======================
test("strength list is configurable and parsed by product line", () => {
  assert.deepEqual(M.pbParseStrengths(M.PB_DEFAULT_SETTINGS.strengths), [[15, 30, 60, 100], [16.2, 32.4, 64.8, 97.2]]);
  assert.deepEqual(M.pbParseStrengths("30, 60 ; 100"), [[30, 60], [100]]);
});

test("tablet rounding: one product line, fewest tablets within tolerance", () => {
  const fam = M.pbParseStrengths(M.PB_DEFAULT_SETTINGS.strengths);
  const a = M.pbRoundTablets(206.77, fam, { maxUnits: 4, tol: 0.05 });
  near(a.total, 200, 1e-9); assert.equal(a.count, 2);
  const b = M.pbRoundTablets(64.8, fam, { maxUnits: 4, tol: 0.05 });
  near(b.total, 64.8, 1e-9); assert.equal(b.count, 1);
  const c = M.pbRoundTablets(134.4, fam, { maxUnits: 4, tol: 0.05 });
  assert.ok(Math.abs(c.total - 134.4) <= 0.05 * 134.4 && c.count <= 2, JSON.stringify(c));
  for (const u of c.units) assert.ok(fam[c.family].includes(u.strength), "no mixing of product lines");
  const d = M.pbRoundTablets(100, [[30, 60]], { maxUnits: 4, tol: 0 });
  near(d.total, 90, 1e-9, "custom list, exact-closest when tol 0");
});

test("pbRoundDose: tablets, elixir 20 mg/5 mL to 0.1 mL, injection increments", () => {
  const t = M.pbRoundDose(206.77, "po", "tab", {}, 70);
  assert.equal(t.kind, "tab"); near(t.total, 200, 1e-9);
  const e = M.pbRoundDose(8.68, "po", "elixir", {}, 3.5);
  assert.equal(e.kind, "elixir"); near(e.mL, 2.2, 1e-9); near(e.total, 8.8, 1e-9);
  const e2 = M.pbRoundDose(8.68, "po", "elixir", { elixirMgPer5: 20, elixirStepMl: 0.5 }, 3.5);
  near(e2.mL, 2, 1e-9);
  near(M.pbRoundDose(938.46, "iv", "inj", {}, 70).total, 940, 1e-9);
  near(M.pbRoundDose(252, "iv", "inj", {}, 20).total, 250, 1e-9);
  near(M.pbRoundDose(73.85, "iv", "inj", {}, 3.5).total, 74, 1e-9);
  near(M.pbRoundDose(938.46, "iv", "inj", { injInc: "5" }, 70).total, 940, 1e-9);
  near(M.pbRoundDose(73.85, "iv", "inj", {}, 3.5).conc, 65, 0);
  const small = M.pbRoundDose(5, "po", "tab", {}, 3.5);
  assert.ok(small.flags.some((f) => /elixir/.test(f.text)), "tablets cannot match small doses");
});

// ======================= Initial-dose flow, warnings, IV rate =======================
test("initial: load warnings (sedation / respiratory depression), sampling, IV rate", () => {
  const pm = M.pbPatient(pt({ model: "literature" }));
  const r = M.pbInitial(base({ range: [15, 40] }), pm);
  assert.ok(r.flags.some((f) => /respiratory depression/.test(f.text)));
  assert.ok(r.flags.some((f) => /2–3 h after the load/.test(f.text)));
  near(r.ld.rate.mgMin, 50, 0);
  near(r.ld.minutes, r.ld.rounded.total / 50, 1e-9);
  const kid = M.pbInitial(base(), M.pbPatient(pt({ model: "literature", ageValue: 6, wt: 20 })));
  near(kid.ld.rate.mgMin, 20, 1e-9, "1 mg/kg/min under 40 kg");
  const noLoad = M.pbInitial(base({ load: false }), pm);
  assert.equal(noLoad.ld, undefined);
  assert.ok(noLoad.flags.some((f) => /25%/.test(f.text)));
});

test("initial: re-load from a current level uses (Ctarget − Ccurrent)", () => {
  const pm = M.pbPatient(pt());
  const r = M.pbInitial(base({ cCurrent: 8 }), pm);
  rel(r.ld.exact, (42.7 * 12) / 0.91, 1e-9);
  const none = M.pbInitial(base({ cCurrent: 25 }), pm);
  assert.equal(none.ld, undefined);
});

test("initial: projection with load starts near target; without load rises toward SS", () => {
  const pm = M.pbPatient(pt({ model: "literature" }));
  const r = M.pbInitial(base({ range: [15, 40] }), pm);
  const d1 = r.projection.find((x) => x.day === 1), d42 = r.projection.find((x) => x.day === 42);
  assert.ok(d1.load > 15 && d1.load < 25, `day 1 with load ${d1.load}`);
  assert.ok(d1.noLoad < 5);
  assert.ok(d42.noLoad > 0.9 * r.md.ss.cmin);
  rel(d1.load, r.ld.c0 * Math.exp(-pm.k * 24), 1e-9, "trough before first MD = C0·e^(−k·24)");
});

test("BMI ≥ 30 obesity warning; site-model workbook info", () => {
  const pm = M.pbPatient(pt({ wt: 120, htCm: 175 }));
  assert.ok(pm.flags.some((f) => /Wilkes/.test(f.text)));
  assert.ok(pm.flags.some((f) => /workbook's clearance set/.test(f.text)));
  const bad = M.pbPatient(pt({ wt: 0 }));
  assert.equal(bad.valid, false);
});

test("dialysis supplement: HD 30%, high-flux 50% of amount in body", () => {
  const d = M.pbDialysisSupplement("hd", 20, 49, sfPO);
  rel(d.exact, 0.3 * 20 * 49, 1e-9);
  rel(M.pbDialysisSupplement("hfhd", 20, 49, sfIV).exact, (0.5 * 20 * 49) / 0.91, 1e-9);
  assert.equal(M.pbDialysisSupplement("none", 20, 49, sfPO), null);
});

// ======================= Non-steady state: superposition + PK.fit =======================
const truth = { CL: 0.32, V: 45 };
const synth = (hist, times) => times.map((t) => ({ t, c: M.pbLevelAt(t, hist, truth) }));

test("NSS least squares, one level: recovers CL with V fixed at population", () => {
  const pm = pagePm(); // pop V 42.7
  const hist = M.pbHistory({ dose: 200, route: "iv", tau: 24, n: 7 });
  const lv = [{ t: 168, c: M.pbLevelAt(168, hist, { CL: 0.30, V: pm.V }) }];
  const r = M.pbNonSteady(base({ nss: { doses: hist, levels: lv, method: "ls", fitV: "auto" } }), pm);
  assert.ok(r.valid); assert.equal(r.fitV, false);
  rel(r.V, pm.V, 1e-9); rel(r.CL, 0.30, 1e-4);
  rel(r.cNow, lv[0].c, 1e-6);
});

test("NSS least squares, two levels with a load: recovers CL and V", () => {
  const pm = pagePm();
  const hist = M.pbHistory({ ld: 900, ldRoute: "iv", dose: 150, route: "po", tau: 24, n: 10 });
  const lv = synth(hist, [3, 192]);
  const r = M.pbNonSteady(base({ route: "po", form: "tab", nss: { doses: hist, levels: lv, method: "ls", fitV: "auto" } }), pm);
  assert.equal(r.fitV, true);
  rel(r.CL, truth.CL, 1e-3); rel(r.V, truth.V, 1e-3);
  for (const x of r.fit.predictions) rel(x.pred, x.obs, 1e-4);
});

test("NSS Bayesian MAP: prior equal to truth returns truth; shrinks toward prior otherwise", () => {
  const hist = M.pbHistory({ dose: 200, route: "iv", tau: 24, n: 10 });
  const pmT = pagePm({ wt: 70 });
  const lvT = [{ t: 240, c: M.pbLevelAt(240, hist, pmT) }];
  const rt = M.pbNonSteady(base({ nss: { doses: hist, levels: lvT, method: "map", fitV: "auto", cvCL: 0.3 } }), pmT);
  rel(rt.CL, pmT.CL, 1e-4); rel(rt.V, pmT.V, 1e-4);
  const lv = synth(hist, [240]);
  const r = M.pbNonSteady(base({ nss: { doses: hist, levels: lv, method: "map", fitV: "auto", cvCL: 0.3 } }), pmT);
  assert.ok(r.CL < pmT.CL && r.CL > truth.CL * 0.95, `MAP CL ${r.CL} between truth ${truth.CL} and prior ${pmT.CL}`);
  assert.ok(r.fit.priorPart > 0);
  assert.equal(r.fit.source, "map");
});

test("NSS outputs: predicted Css, new dose, time from now to fss, projection", () => {
  const pm = pagePm();
  const hist = M.pbHistory({ dose: 200, route: "iv", tau: 24, n: 7 });
  const lv = synth(hist, [168]);
  const r = M.pbNonSteady(base({ target: 25, nss: { doses: hist, levels: lv, method: "ls", fitV: "yes" } }), pm);
  const ssc = M.pbSS(200, 24, sfIV, r.par);
  rel(r.ssCont.cavg, ssc.cavg, 1e-9);
  rel(r.newExact, (25 * 24 * r.CL) / 0.91, 1e-9);
  rel(r.tFromNowCont, M.pbDaysFromLevelToFss(r.cNow, ssc.cavg, 0.9, r.k), 1e-9);
  assert.equal(r.projection[0].day, 0);
  rel(r.projection[0].cont, r.cNow, 1e-9);
  const last = r.projection[r.projection.length - 1];
  assert.ok(last.cont > r.cNow && last.cont < ssc.cmax);
});

test("NSS validation and sampling warnings", () => {
  const pm = pagePm();
  const hist = M.pbHistory({ ld: 900, ldRoute: "iv", dose: 150, route: "po", tau: 24, n: 3 });
  assert.equal(M.pbNonSteady(base({ nss: { doses: hist, levels: [] } }), pm).valid, false);
  assert.equal(M.pbNonSteady(base({ nss: { doses: [], levels: [{ t: 5, c: 10 }] } }), pm).valid, false);
  assert.equal(M.pbNonSteady(base({ nss: { doses: hist, levels: [{ t: 0, c: 10 }] } }), pm).valid, false);
  const early = M.pbNonSteady(base({ nss: { doses: hist, levels: [{ t: 1, c: 22 }], method: "map" } }), pm);
  assert.ok(early.flags.some((f) => /before distribution/.test(f.text)));
});

test("pbCalc dispatcher, level status and µmol/L factor", () => {
  const out = M.pbCalc({ ...pt({ model: "literature" }), ...base({ range: [15, 40] }), mode: "initial" });
  assert.ok(out.pm.valid && out.res.md);
  assert.equal(M.pbStatus(20, [15, 40]).lvl, "ok");
  assert.equal(M.pbStatus(10, [15, 40]).lvl, "warn");
  assert.equal(M.pbStatus(60, [15, 40]).lvl, "crit");
  rel(M.PB_UMOL_PER_MGL, 4.3059, 1e-4);
});

test("provenance: every source key has label/ref; proposals carry verify", () => {
  for (const [k, s] of Object.entries(M.PB_SRC)) assert.ok(s.label && s.ref && typeof s.verify === "boolean", k);
  for (const k of ["strengths", "ivRatePed", "reloadNeo", "litClLow"]) assert.equal(M.PB_SRC[k].verify, true, k);
  for (const k of ["vpaSite", "siteCl", "fitSite", "hold", "baseline", "rectalS", "fRectal", "litClAdult", "litClOld", "litClChild", "litClNeo", "targetLit", "vpaLit"]) assert.equal(M.PB_SRC[k].verify, false, k);
  assert.match(M.PB_SRC.rectalS.ref, /2763578/, "Graves 1989");
  assert.match(M.PB_SRC.targetLit.ref, /29957667/, "Patsalos 2018");
  assert.match(M.PB_SRC.litClOld.ref, /15730534/, "Messina 2005");
  assert.match(M.PB_SRC.litClNeo.ref, /4075936/, "Grasela 1985");
});

// ======================= Site workbook (phenobarbital.xlsm) regression: cached values =======================
// Hard-coded from site-mirror/_dumps/phenobarbital.txt (read 2026-10-23); the tests do not read that file.
// The workbook uses 0.693 for ln 2; the tool uses ln 2, so half-life-based values match to 0.03%.
const WB = {
  cl: { neonate: 6.2500000000000003e-3, infant: 1.0416666666666666e-2, child1: 9.3749999999999997e-3, child5: 7.5000000000000006e-3,
    child10: 6.0416666666666665e-3, child15: 5.208333333333333e-3, adult: 4.1666666666666666e-3, elderly: 3.2291666666666666e-3 }, // ParameterSelection H8:H15
  vd: { neonate: 0.96, infant: 0.63, child1: 0.63, child5: 0.63, child10: 0.63, child15: 0.63, adult: 0.61, elderly: 0.61 }, // I8:I15
  ss: { V: 48.8, CL: 0.33333333333333331, K: 6.8306010928961746e-3, thalfD: 4.2272999999999996, d875: 12.681899999999999, LD: 1072.5274725274726,
    LDkg: 13.406593406593407, MD: 160, Css200: 25, hold: 2.6291837253162496, CLpt: 0.28735632183908044, Kpt: 5.8884492180139442e-3,
    thalfPtD: 4.9036679999999997, newDose: 137.93103448275861, d875pt: 14.714128348926517,
    troughs: [25.178061721678439, 21.859820415884453, 18.978893367446389], trough29: 0.48139611409804689 }, // SteadyStateDosing C7…C31, F45, D45:D47, D73
};
const wbCase = () => base({ route: "po", form: "tab", target: 20, fss: 0.875, ldRoute: "iv" });
const wbPt = (o = {}) => M.pbPatient({ model: "site", ageValue: 40, ageUnit: "y", wt: 80, inter: {}, ...o });

test("workbook: Site constants equal ParameterSelection (CL H8:H15, V I8:I15, interactions R2:R6, F/S)", () => {
  const ages = { neonate: [5, "d"], infant: [3, "mo"], child1: [3, "y"], child5: [7, "y"], child10: [12, "y"], child15: [17, "y"], adult: [40, "y"], elderly: [80, "y"] };
  for (const [k, [v, u]] of Object.entries(ages)) {
    const pm = M.pbPatient({ model: "site", ageValue: v, ageUnit: u, wt: 1, inter: {} });
    assert.equal(pm.band.key, k);
    near(pm.clPerKg, WB.cl[k], 1e-15, `CL ${k}`); near(pm.vdPerKg, WB.vd[k], 0, `V ${k}`);
  }
  near(M.pbVpaFactor(1000, "site"), 0.75, 0); near(M.pbVpaFactor(2000, "site"), 0.5, 0);
  near(M.pbInteractions({ chloramphenicol: true }, "site", 40).factor, 0.6, 0);
  near(M.pbInteractions({ phenothiazine: true }, "site", 40).factor, 1.3, 0);
  assert.deepEqual([M.pbSF("iv"), M.pbSF("im"), M.pbSF("po"), M.pbSF("rectal")], [{ S: 0.91, F: 1 }, { S: 0.91, F: 1 }, { S: 1, F: 1 }, { S: 0.91, F: 0.9 }]);
});

test("workbook SteadyStateDosing cached case: adult 80 kg oral, target 20, 200 mg/day, SS level 29 (Site model)", () => {
  const pm = wbPt();
  near(pm.V, WB.ss.V, 1e-12); near(pm.CL, WB.ss.CL, 1e-15); near(pm.k, WB.ss.K, 1e-15);
  rel(pm.thalf / 24, WB.ss.thalfD, 3e-4, "t½ days (0.693 vs ln 2)");
  const r = M.pbInitial(wbCase(), pm);
  near(r.ld.exact, WB.ss.LD, 1e-9, "LD, IV salt"); near(r.ld.exact / pm.wt, WB.ss.LDkg, 1e-12);
  near(r.md.dailyExact, WB.ss.MD, 1e-9, "MD mg/day");
  near(M.pbSS(200, 24, sfPO, pm).cavg, WB.ss.Css200, 1e-12, "Css at the rounded 200 mg/day");
  rel(r.times.tFss, WB.ss.d875, 3e-4, "days to 87.5% (3 × 0.693 half-lives)");
  const st = M.pbSteady({ ...wbCase(), ss: { dose: 200, tau: 24, route: "po", level: 29, days: 60, sample: "trough" } }, pm);
  near(st.CLpt, WB.ss.CLpt, 1e-15); near(st.k, WB.ss.Kpt, 1e-15);
  rel(st.thalf / 24, WB.ss.thalfPtD, 3e-4);
  near(st.newExact, WB.ss.newDose, 1e-9);
  near(M.pbDaysToFss(st.k, 0.875), WB.ss.d875pt, 1e-9, "F45 uses −ln 0.125");
  near(st.daysToHold, WB.ss.hold, 1e-12, "days to hold (C27)");
  assert.equal(st.topUp, null, "level above target: no re-load (C32 blank)");
  // Superposition table: 29 mg/L on board, dose 0 → troughs decay with K_pt.
  const parPt = { CL: st.CLpt, V: pm.V }, on = { c0: 29, t0: 0 };
  WB.ss.troughs.forEach((c, i) => near(M.pbLevelAt(24 * (i + 1), [], parPt, on), c, 1e-9, `trough ${i + 1}`));
  near(M.pbLevelAt(24 * 29, [], parPt, on), WB.ss.trough29, 1e-9, "trough 29 (D73)");
});

test("workbook case, Literature model: same equations, literature constants (days to hold 3.02 d)", () => {
  const pm = wbPt({ model: "literature" });
  near(pm.V, 56, 1e-12); near(pm.CL, 0.32, 1e-12);
  const st = M.pbSteady({ ...wbCase(), ss: { dose: 200, tau: 24, route: "po", level: 29, days: 60 } }, pm);
  near(st.CLpt, WB.ss.CLpt, 1e-15, "CL from the level is model-independent");
  rel(st.daysToHold, Math.log(29 / 20) / (24 * (WB.ss.CLpt / 56)), 1e-12); rel(st.daysToHold, 3.017, 0.001);
  assert.ok(Number.isNaN(M.pbSteady({ ...wbCase(), ss: { dose: 200, tau: 24, route: "po", level: 15, days: 60 } }, pm).daysToHold), "no hold when below target");
});

// Synthetic non-SS case with the workbook's adult 80 kg constants: 100 mg/day oral × 7, trough 12 mg/L before dose 8.
// The workbook Solver objectives (K only, V fixed) were minimised independently (workbook check, 2026-10-23); values hard-coded.
const nssWb = (o = {}) => ({ ...wbCase(), nss: { doses: M.pbHistory({ dose: 100, route: "po", tau: 24, n: 7 }), levels: [{ t: 168, c: 12 }], ...o } });

test("workbook BayesianFit parity: Site defaults (MAP, V fixed, normal CL prior CV 0.1) give K 0.006021943", () => {
  const pm = wbPt();
  const r = M.pbNonSteady(nssWb(), pm); // no method / fitV / CV given → Site model defaults
  assert.ok(r.valid); assert.equal(r.method, "map"); assert.equal(r.fitV, false); near(r.cvCL, 0.1, 0);
  near(r.V, 48.8, 1e-12, "V fixed");
  rel(r.k, 0.006021943, 1e-6); rel(r.CL, 0.2939, 2e-4);
  const ls = M.pbNonSteady(nssWb({ method: "ls" }), pm);
  rel(ls.k, 0.0019022, 1e-4, "workbook least-squares macro (K only)");
  // Literature keeps its own defaults (V fitted, CV 0.3).
  const lit = M.pbNonSteady(nssWb(), wbPt({ model: "literature" }));
  assert.equal(lit.fitV, true); near(lit.cvCL, 0.3, 0);
});

test("workbook non-SS: K is held within 0.1–10 × population (Site); Literature unbounded", () => {
  const pm = wbPt();
  const r = M.pbNonSteady(nssWb({ method: "ls", levels: [{ t: 168, c: 200 }] }), pm);
  near(r.k, 0.1 * pm.k, 1e-12, "clamped at the lower bound");
  assert.ok(r.flags.some((f) => /workbook limit/.test(f.text)));
  const pl = wbPt({ model: "literature" });
  const lit = M.pbNonSteady(nssWb({ method: "ls", levels: [{ t: 168, c: 200 }] }), pl);
  assert.ok(lit.k < 0.1 * pl.k, "literature fit is not bounded");
  assert.ok(!lit.flags.some((f) => /workbook limit/.test(f.text)));
});

test("level drawn before the regimen started: workbook trough formula with C0 (both models)", () => {
  for (const model of ["site", "literature"]) {
    const pm = wbPt({ model });
    const N = 7, tau = 24, D = 100, C0 = 10;
    // Workbook SSNonSteadyStateDosing C28: F·S·D·(1 − e^(−KNτ))·e^(−Kτ)/(V(1 − e^(−Kτ))) + C0·e^(−KNτ)
    const wb = (K) => (D * (1 - Math.exp(-K * N * tau)) * Math.exp(-K * tau)) / (pm.V * (1 - Math.exp(-K * tau))) + C0 * Math.exp(-K * N * tau);
    const hist = M.pbHistory({ dose: D, route: "po", tau, n: N });
    near(M.pbLevelAt(N * tau, hist, pm, { c0: C0, t0: 0 }), wb(pm.k), 1e-9, model);
    // Fit: the level at 0 h is the starting level; a trough generated at K_true is recovered (LS, V fixed).
    const Kt = 0.8 * pm.k, Ct = wb(Kt);
    const r = M.pbNonSteady(nssWb({ levels: [{ t: 0, c: C0 }, { t: 168, c: Ct }], method: "ls", fitV: "no" }), pm);
    assert.ok(r.valid, model); assert.deepEqual(r.baseline, { c0: C0, t0: 0 }); assert.equal(r.nFit, 1);
    rel(r.k, Kt, 1e-5, `${model} K recovered with C0`);
    rel(r.cNow, Ct, 1e-5);
    // Ignoring the starting level attributes it to the doses: a lower fitted K.
    const no = M.pbNonSteady(nssWb({ levels: [{ t: 168, c: Ct }], method: "ls", fitV: "no" }), pm);
    assert.ok(no.k < r.k, model);
  }
  const bad = M.pbNonSteady(nssWb({ levels: [{ t: 0, c: 10 }] }), wbPt());
  assert.equal(bad.valid, false, "a starting level alone cannot be fitted");
});

test("non-SS days to hold: ln(Cnow/Ctarget)/(24·k), both models", () => {
  for (const model of ["site", "literature"]) {
    const pm = wbPt({ model });
    const doses = M.pbHistory({ dose: 400, route: "po", tau: 24, n: 7 });
    const r = M.pbNonSteady(nssWb({ doses, levels: [{ t: 168, c: 30 }], method: "ls", fitV: "no" }), pm);
    rel(r.cNow, 30, 1e-6, "one level, K only: fits exactly");
    near(r.daysToHold, Math.log(r.cNow / 20) / (24 * r.k), 1e-12, model);
    near(M.pbDaysToHold(r.cNow, 20, r.k), r.daysToHold, 0);
    assert.ok(Number.isNaN(M.pbNonSteady(nssWb({ levels: [{ t: 168, c: 5 }], method: "ls", fitV: "no" }), pm).daysToHold));
  }
});

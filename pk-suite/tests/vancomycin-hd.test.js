// Tests for pk-suite/vancomycin-hd.html (trough charts + high-flux HD). Run: node --test pk-suite/tests/
// Loads lib/pkcore.js, then the page's CALC-START…CALC-END block via new Function (same pattern as ../../tests/calc.test.js).
// Sources: specs/vanco-charts-hd.md §3c/§3d chart tables (parsed from the spec itself) and §8 TC1–TC9; lit/vancomycin.md §1e/§2.8.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "vancomycin-hd.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function("PK", `${block}; return {
  CHART, HD, ADJUST_RULES, ADJUST_RULES_LIT, chartK, chartTrough, chartTable, nearestCol, chooseTau, patientRenal, chartLoading, chartRecommend,
  fitK, retroAdjust, hdLoading, residualAddOn, hdMaintenance, hdReplacement, hdWeekly, hdSimulate, hdAucFromTrough, hdAdjust, infusionMinutes };`)(PK);

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);

// ---------- Parse the spec's chart tables (§3c) and the source-vs-regenerated list (§3d) ----------
const spec = fs.readFileSync(path.join(__dirname, "..", "specs", "vanco-charts-hd.md"), "utf8");
const tables = {}; // mgkg → { tau → [25 values] }
for (const sec of spec.split(/^#### /m).slice(1)) {
  const m = sec.match(/^(\d+) mg\/kg maintenance dose/);
  if (!m) continue;
  const rows = {};
  for (const line of sec.split("\n")) {
    const c = line.split("|").map((s) => s.trim()).filter((s) => s !== "");
    if (c.length === 26 && /^\d+$/.test(c[0])) rows[+c[0]] = c.slice(1).map(Number);
  }
  tables[+m[1]] = rows;
}
const sourceDiffs = []; // { mgkg, tau, crcl, source, regen }
for (const line of spec.split("### 3d.")[1].split("**Recommendation")[0].split("\n")) {
  const m = line.match(/^- (\d+) mg\/kg: (.*)$/);
  if (!m) continue;
  let tau = null;
  for (const x of m[2].matchAll(/(?:τ(\d+) )?CrCl (\d+(?:\.\d+)?): (\d+(?:\.\d+)?)→(\d+(?:\.\d+)?)/g)) {
    if (x[1]) tau = +x[1];
    sourceDiffs.push({ mgkg: +m[1], tau, crcl: +x[2], source: +x[3], regen: +x[4] });
  }
}
const SRC_TAUS = [8, 12, 24];
const key = (d, t, c) => `${d}|${t}|${c}`;
const diffKeys = new Set(sourceDiffs.map((d) => key(d.mgkg, d.tau, d.crcl)));
const cell = (mgkg, tau, crcl) => M.chartTable(mgkg).rows.find((r) => r.tau === tau).cells[M.CHART.CRCL.indexOf(crcl)];

test("spec parse: 8 charts × 13 rows × 25 columns; 33 listed source differences, 31 in the τ 8/12/24 rows", () => {
  assert.deepEqual(Object.keys(tables).map(Number).sort((a, b) => b - a), M.CHART.DOSES);
  for (const d of M.CHART.DOSES) { assert.deepEqual(Object.keys(tables[d]).map(Number).sort((a, b) => a - b), M.CHART.TAUS); }
  assert.equal(sourceDiffs.length, 33);
  assert.equal(sourceDiffs.filter((d) => SRC_TAUS.includes(d.tau)).length, 31);
});

test("chart regeneration: 569 published cells (τ 8/12/24 × 25 CrCl × 8 doses) match exactly to 0.1", () => {
  let n = 0;
  const bad = [];
  for (const d of M.CHART.DOSES) for (const t of SRC_TAUS) M.CHART.CRCL.forEach((c, j) => {
    if (diffKeys.has(key(d, t, c))) return;
    n++;
    const got = cell(d, t, c), want = tables[d][t][j];
    if (Math.abs(got - want) > 1e-9) bad.push(`${d} mg/kg τ${t} CrCl ${c}: ${got} vs ${want}`);
  });
  assert.equal(n, 569);
  assert.deepEqual(bad, []);
});

test("chart regeneration: the 31 differing published cells are within ±0.3 (and equal the spec's regenerated value)", () => {
  const inSrc = sourceDiffs.filter((d) => SRC_TAUS.includes(d.tau));
  assert.equal(inSrc.length, 31);
  for (const d of inSrc) {
    const got = cell(d.mgkg, d.tau, d.crcl);
    near(got, d.source, 0.3 + 1e-9, `${d.mgkg} mg/kg τ${d.tau} CrCl ${d.crcl} vs source`);
    near(got, d.regen, 1e-9, `${d.mgkg} mg/kg τ${d.tau} CrCl ${d.crcl} vs regenerated`);
  }
  for (const d of sourceDiffs.filter((x) => !SRC_TAUS.includes(x.tau))) near(cell(d.mgkg, d.tau, d.crcl), d.source, 0.3 + 1e-9, `extra ${d.tau}`);
});

test("chart regeneration: every regenerated cell in all 13 rows equals the spec tables (2600 cells, ±0.1 rounding edge)", () => {
  const bad = [];
  for (const d of M.CHART.DOSES) for (const t of M.CHART.TAUS) M.CHART.CRCL.forEach((c, j) => {
    if (Math.abs(cell(d, t, c) - tables[d][t][j]) > 0.1 + 1e-9) bad.push(`${d}/${t}/${c}`);
  });
  assert.deepEqual(bad, []);
});

test("chart axes, Kel/T½ rows, peak-to-trough swing and the computed 12.5 mg/kg set", () => {
  assert.equal(M.CHART.CRCL.length, 25); assert.ok(!M.CHART.CRCL.includes(110));
  assert.equal(M.CHART.TAUS.length, 13);
  const printedK = [0.155, 0.144, 0.134, 0.112, 0.107, 0.102, 0.096, 0.091, 0.085, 0.080, 0.075, 0.069, 0.064, 0.059, 0.053, 0.048, 0.043, 0.037, 0.032, 0.027, 0.021, 0.016, 0.013, 0.011, 0.008];
  const t = M.chartTable(15);
  t.k.forEach((k, j) => near(k, printedK[j], 0.0005, `Kel col ${j}`));
  near(t.t12[0], 4.471, 0.002); near(t.t12[24], 87.822, 0.1);
  near(M.chartTable(8).swing, 12.3, 0.05); near(M.chartTable(15).swing, 23.1, 0.05);
  const h = M.chartTable(12.5);
  assert.equal(h.published, false);
  assert.ok(h.rows[0].cells[0] > cell(12, 8, 140) && h.rows[0].cells[0] < cell(13, 8, 140));
});

// ---------- §8 worked examples ----------
test("TC1: chart cells via the equation", () => {
  const rows = [[15, 8, 140, 10.6], [15, 8, 20, 99.2], [15, 12, 50, 23.6], [15, 24, 20, 26.3], [15, 168, 2.5, 8.4], [12, 24, 60, 4.5],
    [10, 12, 2.5, 155.9], [8, 8, 2.5, 190.1], [8, 12, 2.5, 124.7], [8, 24, 2.5, 59.4], [9, 18, 40, 10.5], [11, 36, 20, 10.7]];
  for (const [d, t, c, e] of rows) near(M.chartTrough(d, t, M.chartK(c)), e, 0.3, `${d}/${t}/${c}`);
  near(M.chartK(140), 0.155, 0.0005); near(M.chartK(2.5), 0.008, 0.0005);
});

test("TC2: male 60 y, 70 in, 80 kg, SCr 1.0 → 1250 mg q12h, trough 15.5, LD 1600–2000", () => {
  for (const model of ["site", "literature"]) {
    const pr = M.patientRenal({ age: 60, sex: "M", heightIn: 70, tbw: 80, scr: 1 }, model);
    near(pr.crcl, 81.11, 0.01, model); near(pr.bsa, 1.979, 0.001); near(pr.crclNorm, 70.92, 0.01); near(pr.k, 0.0811, 0.0001); near(pr.t12, 8.55, 0.01);
    const r = M.chartRecommend({ mgkg: 15, tbw: 80, crclNorm: pr.crclNorm, goal: [15, 20] });
    assert.equal(r.colCrcl, 70);
    assert.deepEqual(r.chartList.slice(0, 3).map((x) => x.trough), [27.3, 15.2, 9.4]);
    assert.equal(r.chartPick.tau, 12);
    assert.equal(r.calcList[1].trough, 14.9);
    assert.equal(r.dose, 1250); near(r.actualMgkg, 15.63, 0.0051); assert.equal(r.tau, 12); near(r.trough, 15.5, 0.05);
  }
  const ld = M.chartLoading(80, "site");
  assert.deepEqual(ld.range, [1600, 2000]); assert.equal(ld.order, 1500, "1600 rounded to 250 mg");
  assert.equal(M.chartLoading(80, "literature").order, 2000);
  assert.equal(M.chartLoading(150, "literature").order, 3000, "3 g cap");
});

test("TC3: female 75 y, 62 in, 55 kg, SCr 1.2", () => {
  const pr = M.patientRenal({ age: 75, sex: "F", heightIn: 62, tbw: 55, scr: 1.2 }, "site");
  near(pr.crcl, 32.04, 0.01); near(pr.bsa, 1.545, 0.001); near(pr.crclNorm, 35.87, 0.01);
  const r = M.chartRecommend({ mgkg: 10, tbw: 55, crclNorm: pr.crclNorm, goal: [15, 20] });
  assert.deepEqual(r.calcList.slice(1, 5).map((x) => x.trough), [23.1, 15.8, 13.3, 8.6]);
  assert.equal(r.calcPick.tau, 16);
  assert.equal(r.colCrcl, 35);
  assert.deepEqual(r.chartList.slice(2, 4).map((x) => x.trough), [16.2, 13.8]);
  const r15 = M.chartRecommend({ mgkg: 15, tbw: 55, crclNorm: pr.crclNorm, goal: [15, 20] });
  assert.deepEqual(r15.calcList.slice(3, 5).map((x) => x.trough), [20.0, 12.9]);
});

test("TC4: retrospective fit K: 15 mg/kg q12h, SS trough 28 → column 45, q16h", () => {
  const r = M.retroAdjust({ mgkg: 15, tau: 12, trough: 28, goal: [15, 20] });
  assert.equal(r.chart.crcl, 45); near(r.chart.k, 0.053, 0.0005);
  assert.deepEqual(r.chart.list.slice(2, 5).map((x) => x.trough), [17.8, 14.9, 9.2]);
  assert.equal(r.chart.pick.tau, 16);
  near(r.calc.k, 0.0516, 0.0001);
  assert.deepEqual(r.calc.list.slice(2, 5).map((x) => x.trough), [18.7, 15.7, 9.8]);
  assert.ok([16, 18].includes(r.calc.pick.tau));
  near(M.chartTrough(15, 12, r.calc.k), 28, 1e-6, "bisection solves the trough");
  assert.equal(M.fitK({ mgkg: 15, tau: 12, trough: 5000 }).ok, false);
});

test("TC5: HD loading doses and caps", () => {
  const ld = (tbw, o) => M.hdLoading({ tbw, ...o }).dose;
  assert.deepEqual([60, 80, 130].map((w) => ld(w, { timing: "post" })), [1500, 2000, 3000]);
  assert.deepEqual([60, 80, 130].map((w) => ld(w, { timing: "during" })), [2100, 2800, 3000]);
  assert.deepEqual([60, 80, 130].map((w) => ld(w, { protocol: "legacy", cap: 2000 })), [1200, 1600, 2000]);
  assert.equal(M.hdLoading({ tbw: 130 }).capped, true);
  assert.equal(M.hdLoading({ tbw: 130, cap: 0 }).dose, 3250, "no cap (2016 MUE)");
  assert.equal(M.hdLoading({ tbw: 84, timing: "during" }).order, 3000, "2940 rounded to 250 mg");
  assert.equal(M.hdLoading({ tbw: 60, timing: "during" }).order, 2000);
  assert.equal(M.hdLoading({ tbw: 60, timing: "during", membrane: "low" }).mgkg, 30, "Rybak low-flux intradialytic");
});

test("TC6: post-HD replacement dose (80 kg, 48 h → 787 mg) and AUC", () => {
  const rows = [
    [80, 4, 48, 20, 25.60, 16.04, 787, 545], [80, 4, 72, 20, 29.29, 16.04, 1091, 583], [50, 4, 48, 20, 29.68, 14.05, 805, 584],
    [120, 4, 48, 20, 23.58, 17.27, 780, 526], [80, 3.3, 48, 15, 19.27, 12.51, 558, 412],
  ];
  for (const [tbw, tHD, gap, target, peak, cpost, dose, auc] of rows) {
    const r = M.hdReplacement({ tbw, tHD, gap, target });
    near(r.peakReq, peak, 0.01, `peak ${tbw}/${gap}`); near(r.cPost, cpost, 0.01, `cpost ${tbw}`);
    near(r.dose, dose, 1, `dose ${tbw}/${tHD}/${gap}`); near(r.aucFull, auc, 1, `auc ${tbw}/${gap}`);
  }
  const r = M.hdReplacement({ tbw: 80 });
  near(r.V, 82.4, 1e-9); near(r.kr, 0.005608, 1e-6); near(r.khd, 0.04951, 1e-5); near(r.aucAbbrev, 510, 1);
});

test("TC7 (Site model): adjustment by pre-HD level (goal 15–20, 750 mg post-HD)", () => {
  const a = (level, o = {}) => M.hdAdjust({ level, dose: 750, model: "site", ...o });
  let x = a(12); assert.equal(x.status, "site"); assert.equal(x.newDose, 1000);
  x = a(17); assert.equal(x.status, "site"); assert.equal(x.newDose, 750);
  x = a(27); assert.equal(x.hold, true); assert.deepEqual(x.range, [250, 500]); assert.equal(x.status, "proposed", "overlap > 25 hold vs 25–30 decrease");
  x = a(22); assert.equal(x.status, "proposed"); assert.deepEqual(x.range, [500, 750]);
  assert.equal(a(8).status, "proposed"); assert.deepEqual(a(8).range, [1000, 1250]);
  assert.equal(a(31).status, "proposed"); assert.equal(a(31).hold, true); assert.equal(a(31).newDose, 250);
  assert.equal(a(25).status, "site"); assert.equal(a(25).hold, false);
  assert.equal(a(15).band, "15 to 20"); assert.equal(a(20).band, "15 to 20"); assert.equal(a(10).band, "10 to < 15");
  assert.equal(a(17, { goal: [20, 25] }).status, "proposed", "rules are written for goal 15–20");
  assert.equal(a(12, { hoursPostHD: 3 }).status, "invalid", "< 6 h post-HD is falsely low");
  assert.equal(a(12, { hoursPostHD: 7 }).status, "site");
  assert.equal(M.ADJUST_RULES.filter((r) => r.status === "proposed").length, 4);
});

// Approved decision §2 (decisions/vancomycin-aminoglycosides.md): published-protocol band table, Literature model.
test("Literature adjustment table (Stanford/UNMC/Panais/Lewis): bands, supplemental dose, proportional estimate", () => {
  const a = (level, o = {}) => M.hdAdjust({ level, dose: 750, tbw: 80, ...o });
  let x = a(8);
  assert.equal(x.status, "protocol"); assert.equal(x.band, "< 10");
  assert.deepEqual(x.supplemental, [750, 1250], "10–15 mg/kg × 80 kg, rounded to 250");
  assert.deepEqual(x.range, [1000, 1250]); assert.equal(x.newDose, 1000, "+250 at 7.5–10");
  assert.equal(a(7).newDose, 1250, "+500 below 7.5");
  assert.equal(a(12).newDose, 1000, "10–15: +250");
  assert.equal(a(17).newDose, 750, "15–20: no change");
  assert.equal(a(22).newDose, 500, "20–25: −250");
  assert.equal(a(22, { goal: [15, 25] }).newDose, 750, "no change with the 15–25 goal");
  x = a(27); assert.equal(x.hold, true); assert.deepEqual(x.range, [250, 500]); assert.equal(x.newDose, 500);
  x = a(33); assert.equal(x.hold, true); assert.equal(x.newDose, 250); assert.ok(x.flags.some((f) => f.lvl === "crit"));
  assert.equal(a(15).band, "15 to 20"); assert.equal(a(20).band, "15 to 20"); assert.equal(a(25).band, "> 20 to 25"); assert.equal(a(30).band, "> 25 to 30");
  assert.equal(a(12, { hoursPostHD: 3 }).status, "invalid");
  // Proportional estimate: dose × 17.5 ÷ level, rounded to 250, bounded ±50%.
  let p = a(12).proportional; near(p.raw, 1093.75, 1e-9); assert.equal(p.dose, 1000); assert.equal(p.target, 17.5);
  p = a(25).proportional; near(p.raw, 525, 1e-9); assert.equal(p.dose, 500);
  p = a(5).proportional; assert.equal(p.limited, true); assert.equal(p.dose, 1250, "1125 bounded at +50%, rounded");
  p = a(40).proportional; assert.equal(p.limited, true); assert.equal(p.bounded, 375);
  assert.ok(M.ADJUST_RULES_LIT.length === 6);
});

test("TC8: three-times-weekly superposition (during-HD parameters, 750 mg, 4 h)", () => {
  const params = M.HD.params.during;
  assert.deepEqual([params.vdPerKg, params.clr, params.clhd], [1.17, 0.3348, 6.9]);
  const exp = { 50: [24.0, 22.7, 23.6, 16.3, 18.3], 75: [21.3, 20.3, 20.9, 16.4, 17.7], 100: [19.9, 19.2, 19.6, 16.4, 17.3] };
  for (const [w, [hi, lo, mid, tLo, tHi]] of Object.entries(exp)) {
    const r = M.hdWeekly({ doses: 750, tbw: +w, params, tHD: 4 });
    near(r.peaks[2], hi, 0.05, `${w} highest peak (Fri)`); near(r.peaks[0], lo, 0.05, `${w} lowest peak (Mon)`); near(r.peaks[1], mid, 0.05, `${w} middle (Wed)`);
    near(r.troughs[0], tLo, 0.05, `${w} lowest trough (before Mon)`); near(r.troughs[2], tHi, 0.05, `${w} highest trough (before Fri)`);
  }
  const r50 = M.hdWeekly({ doses: 750, tbw: 50, params, tHD: 4 });
  near(r50.kr, 0.005723077, 1e-8); near(r50.khd, 0.117948718, 1e-8);
  // The non-steady-state course converges to the weekly steady state (50 kg, LD 23.4 mg/kg ≈ Cp 20).
  const sim = M.hdSimulate({ ld: 1170, doses: 750, tbw: 50, params, tHD: 4, nSessions: 30 });
  near(sim[0].peak, 20, 0.01);
  near(sim[30].preHD, r50.troughs[0], 0.05, "session 30 is a Monday");
});

test("TC9: AUC quick estimate from the 2020 regression", () => {
  near(M.hdAucFromTrough(15), 424.7, 0.05); near(M.hdAucFromTrough(20), 548.3, 0.05);
});

// ---------- Maintenance rules, residual add-ons, 72 h gap, low-flux (lit/vancomycin.md §1e; decisions §1, §4) ----------
test("residual CrCl add-on: Site stepped +200/+400; Literature linear 40 mg per mL/min per 48 h, ×1.5 for 72 h", () => {
  const site = (c) => M.residualAddOn(c, { model: "site" });
  assert.equal(site(NaN), 0); assert.equal(site(0), 0); assert.equal(site(4.9), 0);
  assert.equal(site(5), 200); assert.equal(site(7.5), 200); assert.equal(site(10), 400); assert.equal(site(14), 400);
  let m = M.hdMaintenance({ tbw: 80, residualCrcl: 5, model: "site" });
  assert.equal(m.regularExact, 950); assert.equal(m.regular, 1000);
  m = M.hdMaintenance({ tbw: 80, residualCrcl: 10, model: "site" });
  assert.equal(m.regularExact, 1150); assert.equal(m.regular, 1250);
  // Literature (decision §4): linear.
  assert.equal(M.residualAddOn(NaN), 0); assert.equal(M.residualAddOn(0), 0);
  assert.equal(M.residualAddOn(5), 200); assert.equal(M.residualAddOn(10), 400); assert.equal(M.residualAddOn(7.5), 300); assert.equal(M.residualAddOn(2.5), 100);
  assert.equal(M.residualAddOn(5, { gap: 72 }), 300); assert.equal(M.residualAddOn(10, { gap: 72 }), 600);
  m = M.hdMaintenance({ tbw: 80, residualCrcl: 7.5 });
  assert.equal(m.regularExact, 1100); assert.equal(m.regular, 1000, "rounded only at the end");
  assert.equal(m.addOn72, 450); assert.equal(m.longGapExact, 1450); assert.equal(m.longGap, 1500);
  assert.ok(M.hdMaintenance({ tbw: 80, residualCrcl: 20 }).flags.some((f) => /not ESRD-like/.test(f.text)));
});

test("maintenance rules: Literature default 10 mg/kg (floor 500 / cap 1500); Site default flat 750; tiers; intradialytic", () => {
  assert.equal(M.hdMaintenance({ tbw: 80 }).rule, "mgkg10");
  assert.equal(M.hdMaintenance({ tbw: 80 }).regular, 750);
  assert.equal(M.hdMaintenance({ tbw: 90 }).regular, 1000, "900 → 1000");
  assert.equal(M.hdMaintenance({ tbw: 120 }).regular, 1250);
  let m = M.hdMaintenance({ tbw: 40 }); assert.equal(m.base, 500); assert.equal(m.clamped, true); assert.equal(m.regular, 500, "floor 500");
  m = M.hdMaintenance({ tbw: 180 }); assert.equal(m.base, 1500); assert.equal(m.clamped, true); assert.equal(m.regular, 1500, "cap 1500");
  assert.equal(M.hdMaintenance({ tbw: 48, model: "literature" }).regular, 500);
  // Site model keeps the old behaviour: flat 750 default, unclamped 10 mg/kg when selected.
  assert.equal(M.hdMaintenance({ tbw: 80, model: "site" }).rule, "flat750");
  assert.equal(M.hdMaintenance({ tbw: 80, model: "site" }).regular, 750);
  assert.equal(M.hdMaintenance({ tbw: 180, rule: "mgkg10", model: "site" }).regular, 1750);
  assert.equal(M.hdMaintenance({ tbw: 120, rule: "flat750" }).regular, 750, "flat 750 option in Literature");
  assert.deepEqual([70, 75, 99, 100].map((w) => M.hdMaintenance({ tbw: w, rule: "tiers" }).regular), [500, 750, 750, 1000]);
  let d = M.hdMaintenance({ tbw: 80, timing: "during" });
  assert.equal(d.base, 1000, "12.5 mg/kg intradialytic"); assert.deepEqual(d.range, [800, 1200]);
  d = M.hdMaintenance({ tbw: 80, timing: "during", model: "site" });
  assert.equal(d.regular, 1000); assert.deepEqual(d.range, [1000, 1250]);
});

test("72 h interdialytic gap: +25% in the literature model, none in the site model", () => {
  let m = M.hdMaintenance({ tbw: 80, model: "literature" });
  assert.equal(m.longGapFactor, 1.25); assert.equal(m.longGapExact, 1000); assert.equal(m.longGap, 1000);
  m = M.hdMaintenance({ tbw: 80, rule: "flat750", model: "literature" });
  assert.equal(m.longGapExact, 937.5); assert.equal(m.longGap, 1000);
  m = M.hdMaintenance({ tbw: 120, residualCrcl: 10, model: "literature" });
  assert.equal(m.longGapExact, 1200 * 1.25 + 600); assert.equal(m.longGap, 2000);
  m = M.hdMaintenance({ tbw: 80, model: "site" });
  assert.equal(m.longGapFactor, 1); assert.equal(m.longGap, 750);
  // The longer gap lowers the Monday pre-HD trough; the +25% Friday dose raises it.
  const p = M.HD.params.post;
  const flat = M.hdWeekly({ doses: [750, 750, 750], tbw: 80, params: p, tHD: 4 });
  const boosted = M.hdWeekly({ doses: [750, 750, 1000], tbw: 80, params: p, tHD: 4 });
  assert.ok(flat.troughs[0] < flat.troughs[1]);
  assert.ok(boosted.troughs[0] > flat.troughs[0]);
});

test("obese Vd (Literature calculator only): 0.5 L/kg at BMI ≥ 30, warn > 200 kg; LD cap 3 g / 4 g", () => {
  // 70 in, 120 kg → BMI 38.
  const lit = M.patientRenal({ age: 50, sex: "M", heightIn: 70, tbw: 120, scr: 1 }, "literature");
  assert.equal(lit.vdPerKg, 0.5);
  const site = M.patientRenal({ age: 50, sex: "M", heightIn: 70, tbw: 120, scr: 1 }, "site");
  assert.equal(site.vdPerKg, 0.65);
  assert.equal(M.patientRenal({ age: 60, sex: "M", heightIn: 70, tbw: 80, scr: 1 }, "literature").vdPerKg, 0.65, "BMI 25");
  assert.ok(M.patientRenal({ age: 50, sex: "M", heightIn: 70, tbw: 210, scr: 1 }, "literature").flags.some((f) => /200 kg/.test(f.text)));
  // Calculator troughs scale with 0.65/0.5; chart-mode cells (published grid) stay at 0.65.
  const r65 = M.chartRecommend({ mgkg: 15, tbw: 120, crclNorm: lit.crclNorm });
  const r50 = M.chartRecommend({ mgkg: 15, tbw: 120, crclNorm: lit.crclNorm, vdPerKg: 0.5 });
  assert.deepEqual(r50.chartList, r65.chartList);
  near(M.chartTrough(15, 12, 0.08, 0.5), M.chartTrough(15, 12, 0.08) * 1.3, 1e-9);
  near(r50.V, 60, 1e-9);
  assert.equal(M.chartLoading(150, "literature").order, 3000);
  assert.equal(M.chartLoading(150, "literature", { cap: 4000 }).order, 3750);
  assert.equal(M.chartLoading(170, "literature", { cap: 4000 }).order, 4000);
  assert.equal(M.hdLoading({ tbw: 150, cap: 4000 }).dose, 3750);
});

test("low-flux: Rybak row in the literature model; site 'no supplemental dose' flagged", () => {
  const lit = M.hdMaintenance({ tbw: 80, membrane: "low", model: "literature" });
  assert.equal(lit.base, 600); assert.equal(lit.regular, 500); assert.equal(lit.none, false);
  const site = M.hdMaintenance({ tbw: 80, membrane: "low", model: "site" });
  assert.equal(site.none, true); assert.equal(site.flags[0].lvl, "crit");
});

test("helpers: interval choice, nearest column, infusion time, SCr floor and height clamp", () => {
  assert.equal(M.chooseTau([{ tau: 8, trough: 30 }, { tau: 12, trough: 18.7 }, { tau: 16, trough: 15.7 }], [15, 20]).tau, 12);
  const out = M.chooseTau([{ tau: 8, trough: 30 }, { tau: 12, trough: 22 }], [15, 20]);
  assert.equal(out.tau, 12); assert.equal(out.inRange, false);
  assert.equal(M.CHART.CRCL[M.nearestCol(70.92)], 70); assert.equal(M.CHART.CRCL[M.nearestCol(200)], 140); assert.equal(M.CHART.CRCL[M.nearestCol(3.75)], 2.5);
  assert.deepEqual([750, 1000, 1500, 2000, 3000].map(M.infusionMinutes), [60, 90, 120, 150, 210]);
  const f = M.patientRenal({ age: 60, sex: "M", heightIn: 70, tbw: 80, scr: 0.5, scrFloor07: true }, "site");
  assert.equal(f.scrUsed, 0.7);
  const s = M.patientRenal({ age: 60, sex: "F", heightIn: 58, tbw: 50, scr: 1 }, "site");
  near(s.weightUsed, 45.5, 1e-9, "LBW height term clamped at 0");
  assert.ok(s.flags.some((x) => /clamped/.test(x.text)));
});

// ---------- Pierce HD workbook (vancomycinHDClearnacnevrsweight.xlsx), cached values hard-coded ----------
// Source: workbook dump Sheet1 rows 17/32/37/29/30/23 (workbook-checks/vancomycin-aminoglycosides.md §3, §4.1).
// [TBW kg, dose mg, AUC24 mg·h/L, C_post mg/L, Peak_req mg/L, fraction lost during HD]
const HD_WORKBOOK = [
  [40, 713.1000317171811, 494.69214634602184, 9.52424069811811, 27.351741491047637, 0.3650506201254594],
  [50, 691.2659703735195, 465.612608499146, 10.429957571780085, 24.255276979250475, 0.304669495214661],
  [60, 678.4280907189425, 447.66162366096904, 11.081128590004003, 22.38826343531971, 0.2612580939997331],
  [70, 670.0633702378996, 435.49976752523423, 11.57099608645054, 21.14332994699196, 0.22860026090329733],
  [80, 664.2173831619696, 426.72414120875055, 11.952556650013069, 20.255273939537688, 0.2031628899991288],
  [90, 659.9185937284499, 420.09713612293893, 12.258003737802586, 19.590432557007585, 0.1827997508131609],
  [100, 656.6334138160936, 414.9175660683046, 12.50797200095608, 19.074306139117017, 0.16613519993626125],
  [110, 654.0460214499793, 410.7588800333145, 12.71627829685556, 18.6621512191281, 0.15224811354296275],
  [120, 651.9582701594912, 407.3468763389913, 12.89251445025601, 18.325500034918438, 0.14049903664959928],
  [130, 650.239899208049, 404.4973441775034, 13.04354373014129, 18.045389108664743, 0.13043041799058064],
  [150, 647.5816288161374, 400.0087227618275, 13.288879191395282, 17.60609005016953, 0.11407472057364798],
];
const rel = (a, b, msg) => assert.ok(Math.abs(a / b - 1) <= 1e-9, `${msg}: expected ${b}, got ${a}`);

test("Pierce HD workbook preset: settings match the workbook (Vd 1.0, flat clearances, 15 / 4 h / 56 h / T′ 2 h)", () => {
  const W = M.HD.workbook;
  assert.deepEqual([W.params.vdPerKg, W.params.clr, W.params.clhd], [1, 0.4621, 4.08]);
  assert.deepEqual([W.target, W.tHD, W.gap, W.tinf], [15, 4, 56, 2]);
  assert.deepEqual(W.vdOptions, [0.65, 1, 1.3]);
  assert.deepEqual(W.multipliers, [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  // Existing Site/Literature defaults unchanged.
  assert.deepEqual([M.HD.params.post.vdPerKg, M.HD.params.post.clr, M.HD.params.post.clhd], [1.03, 0.4621, 4.08]);
});

test("Pierce HD workbook: 11 weights × dose, AUC, C_post, Peak_req, fraction lost reproduce exactly (1e-9)", () => {
  const W = M.HD.workbook;
  for (const [tbw, dose, auc, cPost, peak, frac] of HD_WORKBOOK) {
    const r = M.hdReplacement({ tbw, tHD: W.tHD, gap: W.gap, target: W.target, params: W.params, tinf: W.tinf });
    rel(r.dose, dose, `${tbw} kg dose`);
    rel(r.aucFull, auc, `${tbw} kg AUC`);
    rel(r.cPost, cPost, `${tbw} kg C_post`);
    rel(r.peakReq, peak, `${tbw} kg Peak_req`);
    rel(r.fracRemovedHD, frac, `${tbw} kg fraction lost`);
    // Same result with the literal workbook inputs (independent of HD.workbook).
    const r2 = M.hdReplacement({ tbw, tHD: 4, gap: 56, target: 15, tinf: 2, params: { vdPerKg: 1, clr: 0.4621, clhd: 4.08 } });
    rel(r2.dose, dose, `${tbw} kg dose (literal inputs)`);
  }
});

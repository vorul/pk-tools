// Tests for pk-suite/infusion-rate.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js, then the page's CALC-START…CALC-END block with new Function (same pattern as ../../tests/calc.test.js).
// Sources: specs/infusion-rate.md §8 (chart worked examples), §11 (live-server regression, 39 POSTs / 732 rows)
// and lit/acyclovir-infusions-hepatic.md §1b/§2 (literature library). Display-rounded rates are compared exactly;
// unrounded values use the tolerance stated in each test.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require(path.join(__dirname, "..", "lib", "pkcore.js")); // sets globalThis.PK

const html = fs.readFileSync(path.join(__dirname, "..", "infusion-rate.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function(`${block}; return {
  UNITS, LIB, LIT, SITE, rateFromDose, doseFromRate, vbRound, halfUp, displayRate, displayDose, toKg, getDrug, getConc, findOption,
  drugCount, capWeight, doseRows, titration, loading, recommend, compute, chartGrid, argatrobanNewRate, abciximabBag, needsVerify, effectiveMax, argatrobanNovastan, argatrobanTrack, procainamideLoad };`)();

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
const site = (opt, weight, weightUnit = "kg", extra = {}) => {
  const o = M.findOption(opt);
  assert.ok(o, `site option ${opt}`);
  return M.compute({ model: "site", drugId: o.drug.id, concId: o.conc.id, weight, weightUnit, direction: "dose", dose: NaN, ...extra });
};
const lit = (drugId, extra = {}) => M.compute({ model: "literature", drugId, weight: 70, weightUnit: "kg", direction: "dose", ...extra });

// =====================================================================
// §11.1 live-server regression: every row of all 39 responses (inputs → server dose→mL/h, loading line).
// [#, Drug option value, weight (null = blank), unit, loading mL shown (null = none), flat [dose, mL/h, ...] | "HTTP500"]
// =====================================================================
const LIVE = [
  [1, "Amiodarone450mgper250ml", 70, "kg", null, [0.25,8,0.5,17,0.75,25,1,33]],
  [2, "Amiodarone900mgper500ml", 70, "kg", null, [0.25,8,0.5,17,0.75,25,1,33]],
  [3, "Bivalirudin250mgper50ml", 70, "kg", 10, [1.75,24,1.4,20,0.7,10,0.175,2.4]],
  [4, "Bivalirudin500mgper100ml", 70, "kg", 10, [1.75,24,1.4,20,0.7,10,0.175,2.4]],
  [5, "Diltiazem125mgper125ml", 70, "kg", null, [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20]],
  [6, "Dobutamine500mgper250ml", 70, "kg", null, [2,4.2,4,8,6,13,8,17,10,21,12,25,14,29,16,34,18,38,20,42,22,46,24,50,26,55,28,59,30,63,32,67,34,71,36,76,38,80,40,84]],
  [7, "Dobutamine1000mgper250ml", 70, "kg", null, [2,2.1,4,4.2,6,6,8,8,10,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,32,32,34,34,36,36,38,38,40,40,42]],
  [8, "Dopamine800mgper250ml", 70, "kg", null, [5,7,7.5,10,10,13,12.5,16,15,20,17.5,23,20,26,22.5,30,25,33,27.5,36,30,39,32.5,43,35,46,37.5,49,40,52,42.5,56,45,59,47.5,62,50,66]],
  [9, "Epinephrine2mgper250ml", 70, "kg", null, [0.5,3.8,1,8,1.5,11,2,15,2.5,19,3,22,3.5,26,4,30,4.5,34,5,38,5.5,41,6,45,6.5,49,7,52,7.5,56,8,60,8.5,64,9,68,9.5,71,10,75]],
  [10, "Esmolol2.5gmper250ml", 70, "kg", 3.5, [50,21,75,32,100,42,125,52,150,63,175,74,200,84]],
  [11, "Fenoldopam10mgper250ml", 70, "kg", null, [0.1,10,0.15,16,0.2,21,0.25,26,0.3,32,0.35,37,0.4,42,0.45,47,0.5,52,0.55,58,0.6,63,0.65,68,0.7,74,0.75,79,0.8,84,0.85,89,0.9,95,0.95,100,1,105,1.05,110,1.1,116,1.15,121,1.2,126,1.25,131,1.3,137,1.35,142,1.4,147,1.45,152,1.5,158,1.55,163,1.6,168,1.65,173,1.7,179]],
  [12, "Heparin25000per250mlUnits/Hour", 70, "kg", null, [100,1,200,2,300,3,400,4,500,5,600,6,700,7,800,8,900,9,1000,10,1100,11,1200,12,1300,13,1400,14,1500,15,1600,16,1700,17,1800,18,1900,19,2000,20]],
  [13, "Heparin25000per250mlUnits/kg/hour", 70, "kg", null, [5,3.5,6,4.2,7,4.9,8,6,9,6,10,7,11,8,12,8,13,9,14,10,15,10,16,11,17,12,18,13,19,13,20,14,21,15,22,15,23,16,24,17,25,18]],
  [14, "Insulin100Unitsper100ml", 70, "kg", null, Array.from({ length: 100 }, (_, i) => [i + 1, i + 1]).flat()],
  [15, "Integrilin75mgper100ml", 70, "kg", 6, [1,6,2,11]],
  [16, "Isoproterenol2mgper250ml", 70, "kg", null, [0.5,3.8,1,8,1.5,11,2,15,2.5,19,3,22,3.5,26,4,30,4.5,34,5,38,5.5,41,6,45,6.5,49,7,52,7.5,56,8,60,8.5,64,9,68,9.5,71,10,75,10.5,79,11,82,11.5,86,12,90,12.5,94,13,98,13.5,101,14,105,14.5,109,15,112,15.5,116,16,120,16.5,124,17,128,17.5,131,18,135,18.5,139,19,142,19.5,146,20,150,20.5,154,21,158,21.5,161,22,165,22.5,169,23,172,23.5,176,24,180,24.5,184,25,188,25.5,191,26,195,26.5,199,27,202,27.5,206,28,210,28.5,214,29,218,29.5,221,30,225]],
  [17, "Labetalol500mgper250ml", 70, "kg", null, [0.25,8,0.5,15,0.75,22,1,30,1.25,38,1.5,45,1.75,52,2,60,2.25,68,2.5,75,2.75,82,3,90,3.25,98,3.5,105,3.75,112,4,120,4.25,128,4.5,135,4.75,142,5,150,5.25,158,5.5,165,5.75,172,6,180,6.25,188,6.5,195,6.75,202,7,210,7.25,218,7.5,225,7.75,232,8,240]],
  [18, "Lidocaine2gmper250ml", 70, "kg", null, [0.5,3.8,0.75,6,1,8,1.25,9,1.5,11,1.75,13,2,15,2.25,17,2.5,19,2.75,21,3,22,3.25,24,3.5,26,3.75,28,4,30]],
  [19, "Milrinone20mgper100ml", 70, "kg", 18, [0.2,4.2,0.25,5,0.3,6,0.35,7,0.4,8,0.45,9,0.5,10,0.55,12,0.6,13,0.65,14,0.7,15,0.75,16]],
  [20, "Natrecor1.5mgper250ml", 70, "kg", 23, [0.005,3.5,0.01,7,0.015,10,0.02,14,0.025,18,0.03,21]],
  [21, "Nitroglycerine50mgper250ml", 70, "kg", null, [5,1.5,10,3,15,4.5,20,6,25,8,30,9,35,10,40,12,45,14,50,15,55,16,60,18,65,20,70,21,75,22,80,24,85,26,90,27,95,28,100,30,105,32,110,33,115,34,120,36,125,38,130,39,135,40,140,42,145,44,150,45,155,46,160,48,165,50,170,51,175,52,180,54,185,56,190,57,195,58,200,60]],
  [22, "Nitroprusside100mgper250ml", 70, "kg", null, [0.25,2.6,0.5,5,0.75,8,1,10,1.25,13,1.5,16,1.75,18,2,21,2.25,24,2.5,26,2.75,29,3,32,3.25,34,3.5,37,3.75,39,4,42,4.25,45,4.5,47,4.75,50,5,52,5.25,55,5.5,58,5.75,60,6,63,6.25,66,6.5,68,6.75,71,7,74,7.25,76,7.5,79,7.75,81,8,84,8.25,87,8.5,89,8.75,92,9,94,9.25,97,9.5,100,9.75,102,10,105]],
  [23, "Norepinephrine8mgper250ml", 70, "kg", null, [1,1.9,2,3.8,3,6,4,8,5,9,6,11,7,13,8,15,9,17,10,19,11,21,12,22,13,24,14,26,15,28,16,30,17,32,18,34,19,36,20,38,21,39,22,41,23,43,24,45,25,47,26,49,27,51,28,52,29,54,30,56]],
  [24, "Phenylephrine10mgper250ml", 70, "kg", null, [5,8,10,15,15,22,20,30,25,38,30,45,35,52,40,60,45,68,50,75,55,82,60,90,65,98,70,105,75,112,80,120,85,128,90,135,95,142,100,150,105,158,110,165,115,172,120,180,125,188,130,195,135,202,140,210,145,218,150,225,155,232,160,240,165,248,170,255,175,262,180,270]],
  [25, "Procainamide4gmper500ml", 70, "kg", null, [1,8,1.25,9,1.5,11,1.75,13,2,15,2.25,17,2.5,19,2.75,21,3,22,3.25,24,3.5,26,3.75,28,4,30,4.25,32,4.5,34,4.75,36,5,38,5.25,39,5.5,41,5.75,43,6,45]],
  [26, "Propofol10mgperml", 70, "kg", null, [5,2.1,10,4.2,15,6,20,8,25,10,30,13,35,15,40,17,45,19,50,21]],
  [27, "Integrilin75mgper100ml", 121, "kg", 11, [1,10,2,19]],
  [28, "Integrilin75mgper100ml", 150, "kg", 11, [1,10,2,19]],
  [29, "Integrilin75mgper100ml", 100, "lb", 4.1, [1,3.6,2,7]],
  [30, "Fenoldopam10mgper250ml", 220, "lb", null, [0.1,15,0.15,23,0.2,30,0.25,38,0.3,45,0.35,52,0.4,60,0.45,67,0.5,75,0.55,82,0.6,90,0.65,98,0.7,105,0.75,113,0.8,120,0.85,128,0.9,135,0.95,143,1,150,1.05,158,1.1,165,1.15,173,1.2,180,1.25,188,1.3,195,1.35,203,1.4,210,1.45,218,1.5,225,1.55,233,1.6,240,1.65,248,1.7,255]],
  [31, "Bivalirudin250mgper50ml", 120, "kg", 18, [1.75,42,1.4,34,0.7,17,0.175,4.2]],
  [32, "Bivalirudin500mgper100ml", 120, "kg", 18, [1.75,42,1.4,34,0.7,17,0.175,4.2]],
  [33, "Amiodarone450mgper250ml", null, "kg", null, [0.25,8,0.5,17,0.75,25,1,33]],
  [34, "Diltiazem125mgper125ml", null, "kg", null, [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20]],
  [35, "Dopamine800mgper250ml", null, "kg", null, "HTTP500"],
  [36, "Heparin25000per250mlUnits/kg/hour", 85, "kg", null, [5,4.2,6,5,7,6,8,7,9,8,10,8,11,9,12,10,13,11,14,12,15,13,16,14,17,14,18,15,19,16,20,17,21,18,22,19,23,20,24,20,25,21]],
  [37, "Heparin25000per250mlUnits/kg/hour", 99, "kg", null, [5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25]],
  [38, "Esmolol2.5gmper250ml", 150, "kg", 8, [50,45,75,68,100,90,125,112,150,135,175,158,200,180]],
  [39, "Milrinone20mgper100ml", 150, "kg", 38, [0.2,9,0.25,11,0.3,14,0.35,16,0.4,18,0.45,20,0.5,22,0.55,25,0.6,27,0.65,29,0.7,32,0.75,34]],
];

test("live server: option list is the 26 calculator options", () => {
  const opts = M.SITE.flatMap((d) => d.concs.map((c) => c.opt)).filter(Boolean);
  assert.equal(opts.length, 26);
  assert.equal(new Set(LIVE.map((r) => r[1])).size, 26);
  for (const r of LIVE) assert.ok(opts.includes(r[1]), r[1]);
  const total = LIVE.reduce((s, r) => s + (Array.isArray(r[5]) ? r[5].length / 2 : 0), 0);
  assert.equal(total, 732, "all 732 live rows are in the fixture");
});

for (const [n, opt, wt, unit, load, rows] of LIVE) {
  test(`live server #${n}: ${opt} @ ${wt == null ? "blank" : `${wt} ${unit}`} (site mode, exact)`, () => {
    const r = site(opt, wt == null ? NaN : wt, unit);
    if (rows === "HTTP500") {
      assert.equal(r.status, "blocked", "server errors on a blank weight for a weight-based drug; we block instead");
      assert.ok(r.alerts.some((a) => a.code === "weight"));
      return;
    }
    const exp = [];
    for (let i = 0; i < rows.length; i += 2) exp.push([rows[i], rows[i + 1]]);
    assert.equal(r.table.length, exp.length, "row count");
    exp.forEach(([d, mlh], i) => {
      assert.equal(+r.table[i].dose.toPrecision(10), d, `row ${i} dose`);
      assert.equal(r.table[i].rate, mlh, `${opt} ${d} → ${mlh} mL/h (raw ${r.table[i].raw})`);
    });
    const L = r.load.find((l) => Number.isFinite(l.ml));
    if (load == null) assert.equal(L, undefined, "no loading volume line on the server");
    else assert.equal(L.mlDisplay, load, `loading mL (raw ${L && L.ml})`);
  });
}

test("live server: rounding is half-to-even (§4 addendum examples)", () => {
  const pairs = [[52.5, 52], [22.5, 22], [10.5, 10], [24.5, 24], [37.5, 38], [31.5, 32], [4.25, 4.2], [2.45, 2.4], [4.95, 5], [4.9, 4.9]];
  for (const [x, e] of pairs) assert.equal(M.displayRate(x, "half-even"), e, `half-even ${x}`);
  assert.equal(M.displayRate(22.5, "half-up"), 23); assert.equal(M.displayRate(4.25, "half-up"), 4.3);
});

test("live server: weight ignored for non-weight drugs, lb ÷ 2.2, no bag logic for bivalirudin", () => {
  const a = site("Amiodarone450mgper250ml", NaN), b = site("Amiodarone450mgper250ml", 70);
  assert.deepEqual(a.table.map((t) => t.rate), b.table.map((t) => t.rate));
  assert.equal(a.status, "ok");
  assert.equal(M.toKg(220, "lb", "site"), 100);
  assert.equal(M.toKg(100, "lb", "site"), 45.5, "site echoes 45.5 kg for 100 lb");
  near(M.toKg(220, "lb", "literature"), 220 * 0.45359237, 1e-9, "literature uses PK.body.lbToKg (exact pound)");
  assert.equal(M.toKg(220, "lb", "literature"), PK.body.lbToKg(220));
  const b250 = site("Bivalirudin250mgper50ml", 120), b500 = site("Bivalirudin500mgper100ml", 120);
  assert.deepEqual(b250.table.map((t) => t.rate), b500.table.map((t) => t.rate));
  assert.deepEqual(b250.table.map((t) => t.band), [">59", "30-59", "10-29", "Dialysis patient off dialysis"]);
});

test("live server: eptifibatide cap at 121 kg (121, 150, 200 kg identical: load 11, 1 → 10, 2 → 19)", () => {
  for (const w of [121, 150, 200]) {
    const r = site("Integrilin75mgper100ml", w);
    assert.deepEqual(r.table.map((t) => t.rate), [10, 19]);
    assert.equal(r.load[0].mlDisplay, 11);
    assert.equal(r.wtUsed, 121);
    assert.equal(r.capped, w > 121);
  }
});

test("live server: no weight cap for esmolol or milrinone at 150 kg", () => {
  assert.equal(site("Esmolol2.5gmper250ml", 150).wtUsed, 150);
  assert.equal(site("Milrinone20mgper100ml", 150).table.at(-1).rate, 34);
});

// =====================================================================
// §8 chart-derived worked examples (PDF charts: half-up, 1-dp exceptions, chart cap convention).
// =====================================================================
const pdfRate = (drugId, concId, wt, dose) => {
  const d = M.getDrug("site", drugId), c = M.getConc(d, concId);
  const cw = M.capWeight(d, wt, "pdf");
  return M.displayRate(M.rateFromDose(dose, d.unit, c.conc, cw.infusionKg), "pdf", !!(d.pdf && d.pdf.dp1));
};
const CHART = [
  // [#, drugId, concId, wt, dose, raw mL/h (null = capped row), expected]
  [1, "amiodarone", "450", null, 0.25, 8.333, 8], [2, "amiodarone", "450", null, 1, 33.33, 33], [3, "diltiazem", "125", null, 15, 15, 15],
  [4, "epinephrine", "2", null, 0.5, 3.75, 3.8], [5, "epinephrine", "2", null, 1, 7.5, 8], [6, "epinephrine", "2", null, 10, 75, 75],
  [7, "heparin-h", "25000", null, 1300, 13, 13], [8, "insulin", "100", null, 75, 75, 75], [9, "isoproterenol", "2", null, 4.5, 33.75, 34],
  [10, "isoproterenol", "2", null, 28, 210, 210], [11, "labetalol", "500", null, 0.75, 22.5, 23], [12, "labetalol", "500", null, 3.5, 105, 105],
  [13, "lidocaine", "2", null, 3, 22.5, 23], [14, "nitroglycerin", "50", null, 1, 0.3, 0.3], [15, "nitroglycerin", "50", null, 15, 4.5, 4.5],
  [16, "nitroglycerin", "50", null, 200, 60, 60], [17, "norepinephrine", "8", null, 2, 3.75, 3.8], [18, "norepinephrine", "8", null, 5, 9.375, 9],
  [19, "norepinephrine", "8", null, 20, 37.5, 38], [20, "phenylephrine", "10", null, 7, 10.5, 11], [21, "phenylephrine", "10", null, 180, 270, 270],
  [22, "procainamide", "4", null, 1.3, 9.75, 10], [23, "procainamide", "4", null, 4, 30, 30],
  [24, "dopamine", "800", 40, 5, 3.75, 3.8], [25, "dopamine", "800", 40, 7, 5.25, 5], [26, "dopamine", "800", 120, 30, 67.5, 68], [27, "dopamine", "800", 100, 2, 3.75, 3.8],
  [28, "dobutamine", "500", 45, 4, 5.4, 5], [29, "dobutamine", "500", 135, 30, 121.5, 122], [30, "dobutamine", "1000", 40, 9, 5.4, 5], [31, "dobutamine", "1000", 135, 30, 60.75, 61],
  [32, "esmolol", "2.5", 45, 50, 13.5, 14], [33, "esmolol", "2.5", 135, 200, 162, 162],
  [35, "fenoldopam", "10", 40, 0.08, 4.8, 4.8], [36, "fenoldopam", "10", 45, 0.03, 2.025, 2], [37, "fenoldopam", "10", 120, 1, 180, 180],
  [38, "heparin-kg", "25000", 45, 5, 2.25, 2.3], [39, "heparin-kg", "25000", 55, 9, 4.95, 5], [40, "heparin-kg", "25000", 135, 25, 33.75, 34],
  [41, "milrinone", "20", 40, 0.375, 4.5, 4.5], [42, "milrinone", "20", 45, 0.375, 5.0625, 5], [43, "milrinone", "20", 136, 0.75, 30.6, 31],
  [45, "nesiritide", "1.5", 40, 0.005, 2, 2], [46, "nesiritide", "1.5", 135, 0.03, 40.5, 41],
  [49, "nitroprusside", "100", 40, 0.9, 5.4, 5], [50, "nitroprusside", "100", 135, 5, 101.25, 101],
  [51, "propofol", "10", 45, 5, 1.35, 1.4], [52, "propofol", "10", 75, 25, 11.25, 11.3], [53, "propofol", "10", 170, 50, 51, 51],
  [54, "bivalirudin", "250", 45, 1.75, 15.75, 15.8], [55, "bivalirudin", "250", 170, 1.75, 59.5, 59.5], [56, "bivalirudin", "250", 55, 0.175, 1.925, 1.9],
  [57, "bivalirudin", "250", 170, 0.175, 5.95, 6], [58, "bivalirudin", "250", 40, 1.4, 11.2, 11.2], [58.1, "bivalirudin", "250", 40, 0.7, 5.6, 5.6],
  [59, "eptifibatide", "75", 40, 2, 6.4, 6.4], [59.1, "eptifibatide", "75", 40, 1, 3.2, 3.2], [60, "eptifibatide", "75", 120, 2, 19.2, 19.2], [60.1, "eptifibatide", "75", 120, 1, 9.6, 9.6],
  [61, "eptifibatide", "75", 121, 2, null, 20], [61.1, "eptifibatide", "75", 121, 1, null, 10], [61.2, "eptifibatide", "75", 150, 2, null, 20],
  [62, "argatroban", "1000", 40, 0.5, 1.2, 1.2], [63, "argatroban", "1000", 80, 2, 9.6, 10], [64, "argatroban", "1000", 170, 10, 102, 102],
  [65, "argatroban", "500", 85, 0.4, 4.08, 4.1], [66, "argatroban", "500", 105, 0.4, 5.04, 5], [67, "argatroban", "500", 170, 10, 204, 204],
];
for (const [n, id, c, wt, dose, raw, exp] of CHART) {
  test(`chart example ${n}: ${id} ${dose}${wt ? ` @ ${wt} kg` : ""} → ${exp} mL/h`, () => {
    const d = M.getDrug("site", id);
    if (raw != null) near(M.rateFromDose(dose, d.unit, M.getConc(d, c).conc, wt), raw, 0.01, "unrounded (±0.01 mL/h)");
    assert.equal(pdfRate(id, c, wt, dose), exp);
  });
}

test("chart loading volumes: esmolol 6.8 / 2.3, milrinone 22.5, nesiritide 13 / 8, bivalirudin 25.5, eptifibatide 3.6 / 10.8 / 11.3", () => {
  const ld = (id, wt, perKg) => M.loading(M.getDrug("site", id), wt, "site", { rule: "pdf", capMode: "pdf", perKg })[0].mlDisplay;
  assert.equal(ld("esmolol", 135), 6.8); assert.equal(ld("esmolol", 45), 2.3);
  assert.equal(ld("milrinone", 90), 22.5);
  assert.equal(ld("nesiritide", 40), 13); assert.equal(ld("nesiritide", 45, 0.001), 8, "follow-up 1 mcg/kg load");
  assert.equal(ld("bivalirudin", 170), 25.5);
  assert.equal(ld("eptifibatide", 40), 3.6); assert.equal(ld("eptifibatide", 120), 10.8);
  assert.equal(ld("eptifibatide", 121), 11.3); assert.equal(ld("eptifibatide", 160), 11.3);
});

test("chart grid regenerates PDF rows (dopamine 40 kg row; eptifibatide 121 and >121 rows; amiodarone one row)", () => {
  const dop = M.getDrug("site", "dopamine");
  const g = M.chartGrid(dop, dop.concs[0], "site");
  assert.equal(g.rows[0].label, "40");
  assert.deepEqual(g.rows[0].cells.slice(0, 7), [0.8, 1.5, 2.3, 3, 3.8, 4.5, 5.3].map((x) => (x < 5 ? x : Math.round(x))));
  assert.equal(g.rows.at(-1).kg, 120);
  const ep = M.getDrug("site", "eptifibatide"), ge = M.chartGrid(ep, ep.concs[0], "site");
  const r121 = ge.rows.find((r) => r.label === "121"), rOver = ge.rows.find((r) => r.label === ">121");
  assert.deepEqual(r121.cells, [10, 20]); assert.deepEqual(rOver.cells, [10, 20]);
  assert.equal(r121.loadMl, 11.3);
  const amio = M.getDrug("site", "amiodarone"), ga = M.chartGrid(amio, amio.concs[0], "site");
  assert.equal(ga.rows.length, 1); assert.deepEqual(ga.rows[0].cells, [8, 17, 25, 33]);
  const litDob = M.getDrug("literature", "dobutamine"), gl = M.chartGrid(litDob, litDob.concs[0], "literature");
  assert.equal(gl.rows.length, 23); assert.equal(gl.rows[0].kg, 40); assert.equal(gl.rows.at(-1).kg, 150);
});

test("chart: argatroban aPTT rate changes (§8 #68–71)", () => {
  const nr = (rate, a) => M.argatrobanNewRate(rate, a).newRate;
  assert.deepEqual([30, 36, 90, 98].map((a) => nr(0.2, a)), [0.3, 0.3, 0.2, 0.1]);
  assert.equal(nr(3.3, 30), 5);
  assert.deepEqual([90, 98].map((a) => nr(7, a)), [5, 3.5]);
  assert.deepEqual([30, 36, 90, 98].map((a) => nr(100, a)), [150, 125, 75, 50]);
  assert.equal(M.argatrobanNewRate(10, 60).factor, 1);
  const stop = M.argatrobanNewRate(10, 101);
  assert.equal(stop.newRate, null); assert.match(stop.action, /Stop/);
  assert.equal(M.argatrobanNewRate(10, 100.4).factor, 0.5, "aPTT rounded to a whole second first");
});

test("chart: abciximab 12-h bag (§8 #72–73), historical reference only, not orderable", () => {
  const a = M.abciximabBag(45);
  assert.equal(a.bolusMl, 5.6); assert.equal(a.bolusMg, 11.2); assert.equal(a.vialMl, 2); assert.equal(a.vialMg, 4); assert.equal(a.rate, 21);
  const b = M.abciximabBag(80);
  assert.equal(b.mcgPerMin, 10); near(b.bagMg, 7.2, 1e-9); assert.equal(b.vialMl, 3.6);
  const r = M.compute({ model: "site", drugId: "abciximab", weight: 80, weightUnit: "kg", direction: "dose", dose: 0.125 });
  assert.equal(r.status, "blocked"); assert.ok(r.alerts.some((x) => x.code === "discontinued"));
});

// =====================================================================
// Reverse conversions (mL/h → dose), §8 reverse tests and round trips
// =====================================================================
test("reverse: dopamine 70 kg 13 mL/h = 9.905; norepinephrine 15 mL/h = 8; heparin 10.5 mL/h = 15 units/kg/h; propofol 21 mL/h = 50", () => {
  const rv = (opt, wt, rate) => site(opt, wt, "kg", { direction: "rate", rate });
  const d = rv("Dopamine800mgper250ml", 70, 13);
  near(d.dose.raw, 9.905, 0.001); assert.equal(d.dose.display, 9.9);
  assert.equal(rv("Norepinephrine8mgper250ml", 70, 15).dose.raw, 8);
  near(rv("Heparin25000per250mlUnits/kg/hour", 70, 10.5).dose.raw, 15, 1e-9);
  near(rv("Propofol10mgperml", 70, 21).dose.raw, 50, 1e-9);
  near(rv("Heparin25000per250mlUnits/Hour", 70, 13).dose.raw, 1300, 1e-9);
  near(rv("Diltiazem125mgper125ml", NaN, 7.5).dose.raw, 7.5, 1e-12);
  near(rv("Bivalirudin250mgper50ml", 70, 24.5).dose.raw, 1.75, 1e-9);
  near(rv("Amiodarone450mgper250ml", NaN, 33.3333333).dose.raw, 1, 1e-6);
});

test("reverse: round trip dose → raw rate → dose for every unit type (±1e-12 relative)", () => {
  for (const unit of Object.keys(M.UNITS)) for (const dose of [0.03, 1.75, 50, 1300]) {
    const r = M.rateFromDose(dose, unit, 37, 83.4);
    near(M.doseFromRate(r, unit, 37, 83.4), dose, dose * 1e-12, unit);
  }
});

test("reverse: dose display decimals (mcg/kg/min 3 dp < 0.1 else 2; units/h whole; units/kg/h 1 dp)", () => {
  assert.equal(M.displayDose(0.04762, "mcg/kg/min"), 0.048);
  assert.equal(M.displayDose(9.90476, "mcg/kg/min"), 9.9);
  assert.equal(M.displayDose(1349.6, "units/h"), 1350);
  assert.equal(M.displayDose(14.96, "units/kg/h"), 15);
  assert.equal(M.displayDose(2.345, "mg/min"), 2.35, "half-up on the decimal value");
});

test("reverse: literature epinephrine 20 mcg/mL, 80 kg, 12 mL/h = 0.05; eptifibatide > 121 kg uses the label row", () => {
  const e = lit("epinephrine", { concId: "20", weight: 80, direction: "rate", rate: 12 });
  near(e.dose.raw, 0.05, 1e-12); assert.equal(e.dose.display, 0.05);
  const p = lit("eptifibatide", { weight: 150, direction: "rate", rate: 20, crcl: 90 });
  near(p.dose.raw, 2, 1e-12, "20 mL/h = label 2 mcg/kg/min row above 121 kg");
});

test("reverse: a rate that delivers more than the maximum is a hard stop", () => {
  const r = lit("norepinephrine", { concId: "32", direction: "rate", rate: 400 }); // 400·32/(60·70) = 3.05
  assert.equal(r.status, "hardStop");
  near(r.dose.raw, 3.0476, 1e-4);
});

// =====================================================================
// Caps, hard stops, soft warnings, blocks
// =====================================================================
test("hard stop above the maximum: no rate offered (dose direction)", () => {
  const r = lit("lidocaine", { dose: 4.5 });
  assert.equal(r.status, "hardStop"); assert.ok(Number.isNaN(r.rate.display)); assert.ok(r.alerts.some((a) => a.code === "max" && a.lvl === "crit"));
  const ok = lit("lidocaine", { dose: 4 });
  assert.equal(ok.status, "ok"); assert.equal(ok.rate.display, 30);
  assert.equal(site("Dopamine800mgper250ml", 70, "kg", { dose: 51 }).status, "hardStop", "site max 50");
  assert.equal(site("Norepinephrine8mgper250ml", 70, "kg", { dose: 30 }).status, "ok", "site max 30 is allowed");
  assert.equal(site("Epinephrine2mgper250ml", 70, "kg", { dose: 25 }).status, "ok", "site max is blank: no hard stop");
});

test("soft warning outside the usual range, no hard stop", () => {
  const r = lit("dopamine", { concId: "3200", dose: 25 });
  assert.equal(r.status, "ok"); assert.ok(r.alerts.some((a) => a.code === "usual" && a.lvl === "warn"));
  assert.equal(r.rate.display, 33); // 25·70·60/3200 = 32.8
  assert.ok(lit("propofol", { dose: 2 }).alerts.some((a) => a.code === "usual"));
  assert.ok(!lit("propofol", { dose: 25 }).alerts.some((a) => a.code === "usual"));
});

test("blocks: weight missing for weight-based drug, weight ≤ 0; warnings outside chart range", () => {
  assert.equal(lit("propofol", { weight: NaN, dose: 25 }).status, "blocked");
  assert.equal(lit("propofol", { weight: 0, dose: 25 }).status, "blocked");
  assert.equal(lit("diltiazem", { weight: NaN, dose: 10 }).rate.display, 10, "non-weight drug needs no weight");
  assert.ok(lit("propofol", { weight: 30, dose: 25 }).alerts.some((a) => a.code === "weightRange"));
  assert.ok(lit("propofol", { weight: 400, dose: 25 }).alerts.some((a) => a.code === "weightRange" && a.lvl === "crit"));
});

test("eptifibatide cap (literature): ≤ 121 kg actual weight; > 121 kg label row 20 / 10 mL/h, bolus 22.6 mg = 11.3 mL", () => {
  const at = (weight, dose) => lit("eptifibatide", { weight, dose, crcl: 90 });
  assert.equal(at(121, 2).rate.display, 19); // 19.36, actual weight
  assert.equal(at(121, 2).capped, false);
  const big = at(150, 2);
  assert.equal(big.capped, true); assert.equal(big.rate.display, 20); assert.equal(at(150, 1).rate.display, 10);
  assert.equal(big.load[0].mass, 22.6); assert.equal(big.load[0].mlDisplay, 11.3);
  const small = at(70, 2);
  near(small.load[0].mass, 12.6, 1e-9); assert.equal(small.load[0].mlDisplay, 6.3, "literature load to 0.1 mL");
});

test("weight cap helper modes: server min(wt,121); label > 121; pdf ≥ 121", () => {
  const ep = M.getDrug("literature", "eptifibatide");
  assert.equal(M.capWeight(ep, 121, "server").infusionKg, 121);
  assert.equal(M.capWeight(ep, 140, "server").infusionKg, 121);
  assert.equal(M.capWeight(ep, 121, "label").capped, false);
  assert.equal(M.capWeight(ep, 121.5, "label").infusionKg, 125);
  assert.equal(M.capWeight(ep, 121, "pdf").capped, true);
  assert.equal(M.capWeight(M.getDrug("literature", "propofol"), 300).infusionKg, 300, "no cap for other drugs");
});

test("discontinued: nesiritide in site mode only, flagged not orderable", () => {
  const r = site("Natrecor1.5mgper250ml", 70, "kg", { dose: 0.01 });
  assert.ok(r.alerts.some((a) => a.code === "discontinued" && a.lvl === "crit"));
  assert.equal(r.load[0].mlDisplay, 23);
});

// =====================================================================
// Literature library (lit/acyclovir-infusions-hepatic.md §2)
// =====================================================================
test("literature library: fenoldopam, abciximab and nesiritide removed; nicardipine and vasopressin added; counts per mode", () => {
  const ids = M.LIT.map((d) => d.id);
  for (const gone of ["abciximab", "nesiritide", "fenoldopam"]) assert.ok(!ids.includes(gone), gone);
  assert.ok(ids.includes("nicardipine") && ids.includes("vasopressin"));
  assert.ok(M.SITE.some((d) => d.id === "nesiritide" && d.status === "discontinued"));
  assert.ok(M.SITE.some((d) => d.id === "abciximab" && d.status === "discontinued"));
  assert.ok(M.SITE.some((d) => d.id === "fenoldopam"), "site mode unchanged");
  assert.deepEqual(M.drugCount("literature"), { entries: 25, orderable: 25 });
  assert.deepEqual(M.drugCount("site"), { entries: 25, orderable: 23 });
  for (const model of ["literature", "site"]) for (const d of M.LIB[model]) {
    assert.ok(M.UNITS[d.unit], `${model} ${d.id} unit`);
    assert.ok(d.concs.length >= 1 && d.prov, `${model} ${d.id} concs/prov`);
    if (Number.isFinite(d.max) && d.usual) assert.ok(d.usual[1] <= d.max, `${model} ${d.id} usual ≤ max`);
    if (model === "literature" && Number.isFinite(d.max)) assert.ok(M.doseRows(d, model).every((r) => r.dose <= d.max + 1e-9), `${d.id} rows ≤ max`);
  }
});

test("literature: bivalirudin renal tiers 1.75 / 1 / 0.25", () => {
  const b = M.getDrug("literature", "bivalirudin");
  assert.equal(M.recommend(b, { crcl: 30 }).dose, 1.75);
  assert.equal(M.recommend(b, { crcl: 45 }).dose, 1.75);
  assert.equal(M.recommend(b, { crcl: 29 }).dose, 1);
  assert.equal(M.recommend(b, { crcl: 8, dialysis: "hd" }).dose, 0.25);
  const r = lit("bivalirudin", { weight: 80, dose: 1, crcl: 20 });
  assert.equal(r.rate.display, 16); // 1·80/5
  assert.equal(r.load[0].mlDisplay, 12); // 0.75·80/5
  assert.ok(lit("bivalirudin", { dose: 1.75, crcl: 20 }).alerts.some((a) => a.code === "recExceeded"));
  assert.equal(lit("bivalirudin", { dose: 2 }).status, "hardStop");
  assert.ok(!M.doseRows(b, "literature").some((x) => [1.4, 0.7, 0.175].includes(x.dose)));
});

test("literature: lidocaine 1–4 mg/min, 8 mg/mL, max 4", () => {
  const d = M.getDrug("literature", "lidocaine");
  assert.deepEqual(d.usual, [1, 4]); assert.equal(d.max, 4); assert.equal(d.concs[0].conc, 8);
  assert.equal(lit("lidocaine", { dose: 1 }).rate.display, 8); // 7.5 → 8
  assert.equal(lit("lidocaine", { dose: 3 }).rate.display, 23); // 22.5 → 23 (site server shows 22)
  assert.equal(site("Lidocaine2gmper250ml", 70, "kg", { dose: 3 }).rate.display, 22);
  assert.ok(lit("lidocaine", { dose: 2, childPugh: 8 }).alerts.some((a) => a.code === "rec" && a.lvl === "warn"));
});

test("literature: procainamide 4 g / 500 mL = 8 mg/mL (and label 4 mg/mL option), max 6", () => {
  const d = M.getDrug("literature", "procainamide");
  assert.equal(M.getConc(d, "8").conc, 8); assert.match(M.getConc(d, "8").label, /4 g\/500 mL/);
  assert.equal(M.getConc(d, "4").conc, 4);
  assert.equal(lit("procainamide", { concId: "8", dose: 4 }).rate.display, 30);
  assert.equal(lit("procainamide", { concId: "4", dose: 2 }).rate.display, 30);
  assert.equal(lit("procainamide", { dose: 6.5 }).status, "hardStop");
  assert.equal(M.findOption("Procainamide4gmper500ml").conc.conc, 8, "site math uses 500 mL despite its label");
});

test("literature: eptifibatide CrCl-based dose, dialysis hard stop, no SCr criterion", () => {
  const e = M.getDrug("literature", "eptifibatide");
  assert.equal(M.recommend(e, { crcl: 50 }).dose, 2);
  assert.equal(M.recommend(e, { crcl: 49 }).dose, 1);
  assert.equal(M.recommend(e, { scr: 3 }).dose, 2, "SCr alone does not lower the dose in the literature model");
  const hd = lit("eptifibatide", { dose: 1, crcl: 10, dialysis: "hd" });
  assert.equal(hd.status, "hardStop"); assert.ok(Number.isNaN(hd.rate.display));
  assert.equal(lit("eptifibatide", { dose: 1, dialysis: "pd" }).status, "hardStop");
  const s = M.getDrug("site", "eptifibatide");
  assert.equal(M.recommend(s, { scr: 2.5 }).dose, 1, "site keeps SCr > 2 → 1");
  assert.equal(M.recommend(s, { scr: 2 }).dose, 2);
});

test("literature: propofol egg/soy note replaces the sulfite contraindication", () => {
  const p = M.getDrug("literature", "propofol");
  assert.ok(p.notes.some((n) => /egg/i.test(n) && /soy/i.test(n)));
  assert.ok(p.notes.some((n) => /metabisulfite/i.test(n)));
  assert.equal(p.max, 80);
  assert.equal(lit("propofol", { dose: 25, weight: 75 }).rate.display, 11); // 11.25
  assert.ok(M.getDrug("site", "propofol").notes.some((n) => /sulfite allergy/.test(n)), "site keeps its printed text");
});

test("literature: S4S concentrations and units for vasopressors, isoproterenol, labetalol, nitroprusside", () => {
  const cs = (id) => M.getDrug("literature", id).concs.map((c) => c.conc);
  const u = (id) => M.getDrug("literature", id).unit;
  assert.deepEqual(cs("epinephrine"), [20, 40]); assert.equal(u("epinephrine"), "mcg/kg/min");
  assert.deepEqual(cs("norepinephrine"), [16, 32, 64]); assert.equal(u("norepinephrine"), "mcg/kg/min");
  assert.deepEqual(cs("phenylephrine"), [80, 400]); assert.equal(u("phenylephrine"), "mcg/kg/min");
  assert.deepEqual(cs("isoproterenol"), [4]); assert.equal(u("isoproterenol"), "mcg/min");
  assert.deepEqual(cs("labetalol"), [1, 5]); assert.equal(u("labetalol"), "mg/min");
  assert.deepEqual(cs("nitroprusside"), [200, 500]); assert.equal(u("nitroprusside"), "mcg/kg/min");
  assert.equal(lit("norepinephrine", { concId: "16", weight: 80, dose: 0.1 }).rate.display, 30); // 0.1·80·60/16
  assert.equal(lit("epinephrine", { concId: "20", weight: 70, dose: 0.05 }).rate.display, 11); // 10.5 → 11
  assert.equal(lit("phenylephrine", { concId: "80", weight: 70, dose: 1 }).rate.display, 53); // 52.5 → 53
  assert.equal(lit("isoproterenol", { dose: 2 }).rate.display, 30);
  assert.equal(lit("isoproterenol", { dose: 25 }).status, "hardStop");
  assert.equal(lit("labetalol", { concId: "1", dose: 2 }).rate.display, 120);
  assert.equal(lit("nitroprusside", { concId: "200", dose: 0.3 }).rate.display, 6); // 6.3
  assert.equal(lit("phenylephrine", { concId: "80", dose: 7 }).status, "hardStop");
});

test("literature: nitroprusside renal limits (eGFR < 30 mean < 3; anuric 1)", () => {
  assert.ok(lit("nitroprusside", { dose: 3.5, crcl: 20 }).alerts.some((a) => a.code === "recExceeded"));
  assert.ok(lit("nitroprusside", { dose: 1.5, dialysis: "hd" }).alerts.some((a) => a.code === "recExceeded"));
  assert.ok(!lit("nitroprusside", { dose: 3.5, crcl: 60 }).alerts.some((a) => a.code === "recExceeded"));
});

test("literature: argatroban 1 mg/mL, start 2; Child-Pugh ≥ 7 start 0.5; no renal reduction", () => {
  const a = M.getDrug("literature", "argatroban");
  assert.deepEqual(a.concs.map((c) => c.conc), [1000]);
  assert.equal(M.recommend(a, { childPugh: 6 }).dose, 2);
  assert.equal(M.recommend(a, { childPugh: 7 }).dose, 0.5);
  assert.equal(M.recommend(a, { crcl: 20 }).dose, 2, "CrCl < 60 does not change the literature start");
  assert.equal(lit("argatroban", { dose: 0.5, childPugh: 9 }).rate.display, 2.1); // 0.5·70·60/1000
  assert.equal(lit("argatroban", { dose: 11 }).status, "hardStop");
  const s = M.getDrug("site", "argatroban");
  assert.equal(M.recommend(s, { childPugh: 7 }).concId, "500", "site: hepatic score > 6 → 500 mcg/mL bag");
  assert.equal(M.recommend(s, { crcl: 50 }).dose, 1, "site: CrCl < 60 consider 1");
});

test("literature: milrinone renal table steps down (50 → 0.43 … 5 → 0.2)", () => {
  const m = M.getDrug("literature", "milrinone");
  const cap = (crcl, dialysis) => M.recommend(m, { crcl, dialysis })?.dose;
  assert.equal(cap(60), undefined);
  assert.deepEqual([50, 45, 40, 30, 20, 10, 5].map((c) => cap(c)), [0.43, 0.38, 0.38, 0.33, 0.28, 0.23, 0.2]);
  assert.equal(cap(3), 0.2); assert.equal(cap(NaN, "hd"), 0.2);
  const r = lit("milrinone", { dose: 0.5, crcl: 25 });
  assert.ok(r.alerts.some((a) => a.code === "recExceeded"));
  assert.equal(r.rate.display, 11); // 10.5 → 11 (site server shows 10)
  assert.equal(r.load[0].mlDisplay, 17.5, "50 mcg/kg from the bag, to 0.1 mL");
});

test("literature: half-up rounding vs site half-even on the same numbers", () => {
  assert.equal(lit("heparin-kg", { weight: 85, dose: 5 }).rate.display, 4.3);
  assert.equal(site("Heparin25000per250mlUnits/kg/hour", 85, "kg", { dose: 5 }).rate.display, 4.2);
  assert.equal(M.displayRate(4.95, "half-up"), 5); assert.equal(M.displayRate(4.94, "half-up"), 4.9);
  assert.equal(M.displayRate(5.95, "half-up"), 6); assert.equal(M.displayRate(1.925, "half-up"), 1.9);
});

test("literature: lb → kg via PK.body.lbToKg; titration table follows the weight", () => {
  const r = M.compute({ model: "literature", drugId: "dobutamine", concId: "2000", weight: 220, weightUnit: "lb", direction: "dose", dose: 5 });
  near(r.wtKg, 99.79, 0.01);
  assert.equal(r.rate.display, 15); // 14.97
  assert.equal(r.table.find((t) => t.dose === 5).rate, 15);
});

test("literature: renal / hepatic inputs never affect non-renal drugs", () => {
  const a = lit("dobutamine", { concId: "4000", dose: 10 }), b = lit("dobutamine", { concId: "4000", dose: 10, crcl: 5, dialysis: "hd", childPugh: 12 });
  assert.equal(a.rate.display, b.rate.display); assert.equal(b.rec, null);
});

test("provenance: [R] and inst. tags get a verify badge", () => {
  assert.equal(M.needsVerify("label [R]"), true); assert.equal(M.needsVerify("inst."), true);
  assert.equal(M.needsVerify("S4S Sept 2026 [V]"), false); assert.equal(M.needsVerify("label [V2]"), false);
  assert.ok(M.needsVerify(M.getDrug("literature", "propofol").prov.max));
  assert.ok(!M.needsVerify(M.getDrug("literature", "eptifibatide").prov.range));
});

// =====================================================================
// Approved sign-off decisions (DECISIONS.md "Acyclovir and infusions"; decisions/acyclovir-infusions.md Q6–Q10)
// =====================================================================
test("sign-off Q6: label hard maxima (dopamine 50, esmolol 300, dobutamine 40, epinephrine 2, milrinone 0.75, nicardipine 15, diltiazem 15, vasopressin 0.1, amiodarone 1)", () => {
  const MAX = { dopamine: 50, esmolol: 300, dobutamine: 40, epinephrine: 2, milrinone: 0.75, nicardipine: 15, diltiazem: 15, vasopressin: 0.1, amiodarone: 1, labetalol: 8 };
  for (const [id, mx] of Object.entries(MAX)) {
    const d = M.getDrug("literature", id);
    assert.equal(d.max, mx, id);
    assert.ok(!d.inst, `${id} is label-based, not institutional`);
    assert.equal(lit(id, { weight: 70, dose: mx }).status, "ok", `${id} at max`);
    assert.equal(lit(id, { weight: 70, dose: mx * 1.01 }).status, "hardStop", `${id} above max`);
  }
  assert.ok(M.needsVerify(M.getDrug("literature", "labetalol").prov.max), "labetalol 8 mg/min carries a verify badge");
  assert.ok(!M.needsVerify(M.getDrug("literature", "dopamine").prov.max));
});

test("sign-off Q6: nicardipine (mg/h) and vasopressin (units/min) rates", () => {
  assert.equal(lit("nicardipine", { concId: "0.1", dose: 5 }).rate.display, 50);
  assert.equal(lit("nicardipine", { concId: "0.2", dose: 15 }).rate.display, 75);
  assert.equal(lit("vasopressin", { concId: "0.2", dose: 0.04 }).rate.display, 12); // 0.04·60/0.2
  assert.equal(lit("vasopressin", { concId: "0.4", dose: 0.03 }).rate.display, 4.5);
  near(lit("vasopressin", { concId: "0.2", direction: "rate", rate: 12 }).dose.raw, 0.04, 1e-12);
  assert.ok(lit("vasopressin", { concId: "0.2", dose: 0.09 }).alerts.some((a) => a.code === "usual"), "soft alert above 0.07");
});

test("sign-off Q6: institutional maxima carry the Institutional — P&T flag and can be changed for the session", () => {
  const INST = { "heparin-kg": 35, "heparin-h": 2500, "insulin-h": 30, nitroglycerin: 400, norepinephrine: 3, propofol: 80 };
  for (const [id, mx] of Object.entries(INST)) {
    const d = M.getDrug("literature", id);
    assert.equal(d.max, mx, id); assert.equal(d.inst, true, id);
    assert.match(d.prov.max, /inst\./, `${id} provenance`);
    assert.equal(M.effectiveMax(d, {}), mx);
    assert.equal(M.effectiveMax(d, { instMax: { [id]: mx * 2 } }), mx * 2, `${id} override`);
  }
  assert.equal(M.effectiveMax(M.getDrug("literature", "dopamine"), { instMax: { dopamine: 99 } }), 50, "label maxima cannot be overridden");
  assert.equal(lit("norepinephrine", { concId: "32", dose: 3.5 }).status, "hardStop");
  assert.equal(lit("norepinephrine", { concId: "32", dose: 3.5, instMax: { norepinephrine: 4 } }).status, "ok");
});

test("sign-off Q6: heparin 35 units/kg/h and 2,500 units/h absolute", () => {
  assert.equal(lit("heparin-kg", { weight: 70, dose: 35 }).status, "ok"); // 2,450 units/h
  const big = lit("heparin-kg", { weight: 100, dose: 30 }); // 3,000 units/h
  assert.equal(big.status, "hardStop"); assert.ok(big.alerts.some((a) => a.code === "limit" && /2,500/.test(a.text)));
  assert.ok(big.table.find((t) => t.dose === 26).over, "titration rows above 2,500 units/h are flagged");
  assert.ok(!big.table.find((t) => t.dose === 25).over);
  assert.equal(lit("heparin-kg", { weight: 70, dose: 36 }).status, "hardStop");
  assert.equal(lit("heparin-h", { dose: 2500 }).status, "ok");
  assert.equal(lit("heparin-h", { dose: 2600 }).status, "hardStop");
  assert.ok(lit("heparin-h", { dose: 2200 }).alerts.some((a) => a.code === "usual"), "soft alert above 2,000 units/h");
});

test("sign-off Q6: propofol label 4 mg/kg/h note; phenylephrine 200 mcg/min verify note", () => {
  const p = lit("propofol", { dose: 70 });
  assert.equal(p.status, "ok"); assert.ok(p.alerts.some((a) => a.code === "limit" && /66\.7/.test(a.text)));
  assert.ok(!lit("propofol", { dose: 60 }).alerts.some((a) => a.code === "limit"));
  assert.equal(lit("propofol", { dose: 85 }).status, "hardStop");
  const ph = lit("phenylephrine", { concId: "80", weight: 70, dose: 3 }); // 210 mcg/min
  assert.equal(ph.status, "ok"); assert.ok(ph.alerts.some((a) => a.code === "limit" && /200 mcg\/min/.test(a.text) && /verify/.test(a.text)));
  assert.ok(!lit("phenylephrine", { concId: "80", weight: 70, dose: 2.8 }).alerts.some((a) => a.code === "limit")); // 196 mcg/min
  assert.ok(M.needsVerify(M.getDrug("literature", "phenylephrine").prov.max), "phenylephrine max unresolved → verify");
});

test("sign-off Q7: procainamide load 17 mg/kg hard stop (weight capped 100 kg), > 1 g soft alert, 20 mg/min default, 50 mg/min max", () => {
  const d = M.getDrug("literature", "procainamide");
  const a = M.procainamideLoad(d, 70, { conc: 8 });
  assert.equal(a.status, "ok"); assert.equal(a.targetMg, 1190); assert.equal(a.rate, 20);
  near(a.minutes, 59.5, 1e-9); assert.equal(a.mlh, 150); assert.equal(a.ml, 148.8);
  assert.ok(a.alerts.some((x) => x.code === "procSoft"), "1190 mg > 1 g → soft alert");
  const b = M.procainamideLoad(d, 50, { conc: 8 });
  assert.equal(b.targetMg, 850); assert.ok(!b.alerts.some((x) => x.code === "procSoft"));
  const c = M.procainamideLoad(d, 130, { conc: 8 });
  assert.equal(c.targetMg, 1700, "capped at 100 kg"); assert.ok(c.alerts.some((x) => x.code === "cap"));
  assert.equal(M.procainamideLoad(d, 70, { totalMg: 1300, conc: 8 }).status, "hardStop", "> 17 mg/kg");
  assert.equal(M.procainamideLoad(d, 70, { rateMgMin: 50, conc: 8 }).status, "ok");
  const fast = M.procainamideLoad(d, 70, { rateMgMin: 55, conc: 8 });
  assert.equal(fast.status, "hardStop"); assert.ok(Number.isNaN(fast.mlh));
  assert.equal(M.procainamideLoad(d, NaN, {}).status, "blocked");
  assert.equal(lit("procainamide", { dose: 6 }).status, "ok"); assert.equal(lit("procainamide", { dose: 6.5 }).status, "hardStop");
});

test("sign-off Q8: labetalol mg/min at 1 or 5 mg/mL", () => {
  const d = M.getDrug("literature", "labetalol");
  assert.equal(d.unit, "mg/min"); assert.deepEqual(d.concs.map((c) => c.conc), [1, 5]);
  assert.equal(lit("labetalol", { concId: "5", dose: 2 }).rate.display, 24);
  assert.equal(lit("labetalol", { concId: "1", dose: 8 }).rate.display, 480);
  assert.ok(lit("labetalol", { concId: "1", dose: 4 }).alerts.some((a) => a.code === "usual"));
});

test("sign-off Q9: argatroban Novastan two-track table, 1.5–3 × baseline, ≤ 100 s, max 10", () => {
  assert.equal(M.argatrobanTrack("auto", 6), "standard"); assert.equal(M.argatrobanTrack("auto", 7), "reduced");
  assert.equal(M.argatrobanTrack("reduced", 5), "reduced"); assert.equal(M.argatrobanTrack("standard", 12), "standard");
  const s = (dose, aptt, baseline, track = "standard") => M.argatrobanNovastan({ track, dose, aptt, baseline });
  // standard: < 1.5× → +0.5, next aPTT 2 h
  assert.equal(s(2, 40, 30).newDose, 2.5); assert.equal(s(2, 40, 30).recheckH, 2);
  assert.equal(s(2, 60, 30).band, "in"); assert.equal(s(2, 60, 30).newDose, 2);
  assert.equal(s(2, 45, 30).band, "in", "exactly 1.5× is in range"); assert.equal(s(2, 90, 30).band, "in", "exactly 3× is in range");
  // > 3× or > 100 s → stop, resume at half
  const hi = s(2, 95, 30); assert.equal(hi.stop, true); assert.equal(hi.resumeDose, 1);
  const over100 = s(3, 101, 40); assert.equal(over100.stop, true, "> 100 s even if < 3×"); assert.equal(over100.resumeDose, 1.5);
  // reduced track: +0.1, next aPTT 4 h
  const r = s(0.5, 40, 30, "reduced"); assert.equal(r.newDose, 0.6); assert.equal(r.recheckH, 4);
  assert.equal(s(0.5, 110, 30, "reduced").resumeDose, 0.25);
  // never above 10
  const cap = s(9.8, 35, 30); assert.equal(cap.newDose, 10); assert.equal(cap.capped, true);
  assert.equal(s(2, 40, NaN), null);
  assert.equal(M.getDrug("literature", "argatroban").aptt, "novastan");
  assert.match(M.getDrug("literature", "argatroban").prov.aptt, /Novastan/);
  assert.equal(M.getDrug("site", "argatroban").aptt, true, "site keeps its fixed 40–83 s table");
});

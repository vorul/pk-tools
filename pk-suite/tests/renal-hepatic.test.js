// Tests for pk-suite/renal-hepatic.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js (sets globalThis.PK), then the page's CALC-START..CALC-END block, so the published code is tested.
// Sources: specs/crcl.md §8 (site cases, overview variants, non-steady state), specs/hepatic-score.md §8–9,
// lit/aminoglycosides-renal.md R4/R9, lit/acyclovir-infusions-hepatic.md H1–H8, and the approved decisions in
// DECISIONS.md / decisions/renal-body.md (SCI no floor + optional × 0.8, U25 pediatric, LBW comparison at BMI ≥ 40, Chen KeGFR).
// Tolerances: site-mode display values exact to 0.01 (as the site rounds); spec values given to 2 dp are checked ± 0.005.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "renal-hepatic.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const M = new Function(`${block}; return { crclCalc, roundDisplay, crclDp, childPugh, childPughFromPoints, cpPoints, cpClass, CP_RULES, biliToMgdl, albToGdl, u25K, kineticEGFR, SCI_CG_FACTOR };`)();

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
const lit = (o) => M.crclCalc({ model: "literature", ...o });
const site = (o) => M.crclCalc({ model: "site", ...o });
const row = (r, key) => r.rows.find((x) => x.key === key);

test("page loads PK and the CALC block uses it", () => {
  assert.ok(globalThis.PK === PK);
  assert.match(html, /src="lib\/pkcore\.js"/);
  assert.match(html, /src="lib\/pk-ui\.js"/);
  assert.match(html, /href="lib\/pk\.css"/);
  assert.ok(!/fetch\(|XMLHttpRequest/.test(html), "no network calls");
});

// ======================= crcl.md §8: site calculator, all 8 cases =======================
const SITE_CASES = [
  // age, ht in, wt kg, sex, SCr, lbwcalc (weight used), CrCl site display
  [65, 70, 80, "M", 1.2, 73, 63.37],
  [60, 64, 50, "F", 0.8, 50, 59.03],
  [50, 70, 150, "M", 1.0, 73, 91.25],
  [80, 67, 60, "M", 0.5, 60, 100],
  [40, 72, 90, "F", 1.0, 73.1, 86.3],
  [30, 58, 40, "M", 0.9, 40, 67.9],
  [70, 63, 95, "F", 1.5, 52.4, 28.87],
  [45, 69, 70, "M", 1, 70, 92.36],
];
for (const [age, ht, wt, sex, scr, w, c] of SITE_CASES) {
  test(`CrCl site mode: ${age} y, ${ht} in, ${wt} kg, ${sex}, SCr ${scr} → ${c}`, () => {
    const r = site({ age, sex, heightIn: ht, tbw: wt, scr });
    near(r.weight, w, 1e-9, "weight used");
    assert.equal(r.selectedBasis, "minIbwTbw");
    assert.equal(r.display, c);
    assert.equal(M.crclDp("site"), 2);
    assert.equal(r.scrFloor, null);
  });
}

test("CrCl site mode ignores obesity, floor, SCI and amputation (with a flag)", () => {
  const r = site({ age: 50, sex: "M", heightIn: 70, tbw: 150, scr: 1, scrFloor: 0.7, sci: true, amputationPct: 16, obesityRule: "1.2", basis: "tbw" });
  assert.equal(r.display, 91.25);
  near(r.ibw, 73, 1e-9);
  assert.ok(r.flags.some((f) => f.code === "siteIgnores"));
});

test("CrCl literature mode, 65 y, 70 in, 80 kg, M, SCr 1.2 → 63.37 (not obese at 1.2×IBW); cm and unrounded", () => {
  const r = lit({ age: 65, sex: "M", heightIn: 70, tbw: 80, scr: 1.2 });
  near(r.crcl, 63.368056, 1e-6);
  assert.equal(r.selectedBasis, "minIbwTbw"); assert.equal(r.weightBasis, "IBW");
  assert.equal(r.display, 63.4);
  const cm = lit({ age: 65, sex: "M", heightIn: PK.body.cmToIn(177.8), tbw: 80, scr: 1.2 });
  near(cm.crcl, 63.368056, 1e-6);
  const umol = lit({ age: 65, sex: "M", heightIn: 70, tbw: 80, scr: PK.body.scrUmolToMgdl(106.08) });
  near(umol.crcl, 63.368056, 1e-6, "SCr 106.08 µmol/L");
  near(PK.body.lbToKg(176.36980), 80, 1e-5, "lb → kg is exact × 0.45359237");
  near(lit({ age: 65, sex: "M", heightIn: 70, tbw: PK.body.lbToKg(176.3698), scr: 1.2 }).crcl, 63.368056, 1e-5);
  assert.match(html, /PK\.body\.lbToKg\(/, "page converts lb with PK.body.lbToKg");
});

// ======================= crcl.md §8 overview variants =======================
test("CrCl obese (ex 3): AdjBW 103.8 → 129.75; every weight basis side by side", () => {
  const r = lit({ age: 50, sex: "M", heightIn: 70, tbw: 150, scr: 1.0 });
  assert.equal(r.obese, true); assert.equal(r.selectedBasis, "adjbw");
  near(r.weight, 103.8, 1e-9); near(r.crcl, 129.75, 1e-9);
  near(row(r, "tbw").crcl, 187.5, 1e-9);
  near(row(r, "ibw").crcl, 91.25, 1e-9);
  near(row(r, "adjbw").crcl, 129.75, 1e-9);
  near(row(r, "minIbwTbw").crcl, 91.25, 1e-9);
  assert.equal(r.rows.filter((x) => x.selected).length, 1);
  assert.ok(row(r, "lbw"), "Janmahasatian LBW comparison row at BMI ≥ 40");
  near(row(r, "lbw").weight, PK.body.ffm("M", 150, r.bmi), 1e-9);
  assert.equal(row(r, "lbw").selected, false, "LBW is comparison only; AdjBW stays reported");
  assert.ok(r.flags.some((f) => f.code === "bmi40"));
  near(r.normalized, (129.75 * 1.73) / PK.body.bsa(150, 177.8), 1e-9);
});

test("CrCl obesity threshold boundaries: 1.2 (default), 1.3, BMI ≥ 30", () => {
  const b = { age: 50, sex: "M", heightIn: 70, scr: 1 };
  assert.equal(lit({ ...b, tbw: 88 }).selectedBasis, "adjbw", "88 > 87.6");
  assert.equal(lit({ ...b, tbw: 87.6 }).selectedBasis, "minIbwTbw", "exactly 1.2×IBW is not obese");
  assert.equal(lit({ ...b, tbw: 90, obesityRule: "1.3" }).selectedBasis, "minIbwTbw");
  assert.equal(lit({ ...b, tbw: 95, obesityRule: "1.3" }).selectedBasis, "adjbw");
  // 70 in = 177.8 cm: BMI 30 at 94.84 kg
  assert.equal(lit({ ...b, tbw: 94, obesityRule: "bmi30" }).selectedBasis, "minIbwTbw");
  const r = lit({ ...b, tbw: 95, obesityRule: "bmi30" });
  assert.equal(r.selectedBasis, "adjbw"); near(r.weight, 73 + 0.4 * 22, 1e-9);
});

test("CrCl explicit weight basis override highlights that row", () => {
  const r = lit({ age: 50, sex: "M", heightIn: 70, tbw: 150, scr: 1, basis: "tbw" });
  assert.equal(r.selectedBasis, "tbw"); near(r.crcl, 187.5, 1e-9);
  assert.ok(row(r, "tbw").selected && !row(r, "adjbw").selected);
});

test("CrCl SCr floor (ex 4): off → 100; 0.7 → 71.43; 0.8 → 62.5; SCI → 0.5 → 100", () => {
  const b = { age: 80, sex: "M", heightIn: 67, tbw: 60, scr: 0.5 };
  const off = lit(b);
  near(off.crcl, 100, 1e-9); assert.equal(off.scrFloored, false);
  assert.ok(off.flags.some((f) => f.code === "lowScrElderly"), "warn SCr < 0.7 at age ≥ 65 when floor off");
  const f7 = lit({ ...b, scrFloor: 0.7 });
  near(f7.crcl, 71.43, 0.005); assert.equal(f7.scrUsed, 0.7); assert.equal(f7.scrFloored, true);
  assert.ok(!f7.flags.some((f) => f.code === "lowScrElderly"));
  near(lit({ ...b, scrFloor: 0.8 }).crcl, 62.5, 1e-9);
  // SCI (decision 2b): no floor at all, even when one is selected; strong warning.
  const sci = lit({ ...b, scrFloor: 0.7, sci: true });
  near(sci.crcl, 100, 1e-9); assert.equal(sci.scrFloor, null); assert.equal(sci.scrFloored, false);
  assert.ok(sci.flags.some((f) => f.code === "sci" && f.lvl === "crit")); assert.ok(sci.flags.some((f) => f.code === "sciNoFloor"));
  near(lit({ ...b, scrFloor: 0.8, sci: true, scr: 0.4 }).crcl, 125, 1e-9, "SCI: actual SCr 0.4 used, no 0.5 floor");
  // the floor applies to every basis row
  near(row(f7, "tbw").crcl, 71.43, 0.005);
});

test("CrCl amputation reduces IBW (literature only); female factor", () => {
  const r = lit({ age: 60, sex: "M", heightIn: 70, tbw: 90, scr: 1, amputationPct: PK.renal.AMPUTATION_PCT.belowKnee });
  near(r.ibw, 73 * 0.941, 1e-9);
  near(row(r, "ibw").crcl, (80 * 73 * 0.941) / 72, 1e-9);
  const f = lit({ age: 60, sex: "F", heightIn: 65, tbw: 57, scr: 1 });
  near(f.crcl, (80 * 57 * 0.85) / 72, 1e-9);
});

// ======================= crcl.md §8 non-steady state =======================
// M, 60 y, 70 kg (70 in: IBW 73, so min(IBW, TBW) = 70 kg), SCr 1.0 → 2.0 over 48 h.
const NSS = { age: 60, sex: "M", heightIn: 70, tbw: 70, scrPrev: 1.0, scr: 2.0, hours: 48 };
test("NSS: Chow 37.32 (K 0.05332), ASHP 48.01 (2 days, per 1.73 m²), Winter 31.60; Chow selected by default", () => {
  const r = lit(NSS);
  near(r.weight, 70, 1e-9);
  near(r.nss.kCreat, 0.05332, 1e-5);
  near(r.nss.crclChow, 37.32, 0.005);
  near(r.nss.ashp, 48.01, 0.005);
  near(r.nss.winter, 31.6, 0.005);
  near(r.crclCG, 38.89, 0.005, "steady-state CG at the latest SCr");
  assert.equal(r.method, "chow"); near(r.crcl, 37.32, 0.005);
  near(r.nss.ashpScaled, (r.nss.ashp * PK.body.bsa(70, 177.8)) / 1.73, 1e-9);
  near(r.normalized, (r.crcl * 1.73) / r.bsa, 1e-9);
  assert.ok(r.flags.some((f) => f.code === "unstable" && f.lvl === "crit"), "renal function unstable banner");
});

test("NSS: Chen kinetic eGFR cross-check anchored to CG (1.0 → 2.0 over 48 h → 42.13)", () => {
  const r = lit(NSS);
  // anchor CG(SCr 1.0, 70 kg) = 77.78; max rise = 46.667·24/42/10 = 2.6667 mg/dL/day; mean 1.5
  near(r.nss.kegfr.crclSS, 77.777778, 1e-6);
  near(r.nss.kegfr.maxRisePerDay, 2.666667, 1e-6);
  near(r.nss.kegfr.kegfr, (77.777778 / 1.5) * (1 - 24 / (48 * 2.666667)), 1e-4);
  near(r.nss.kegfr.kegfr, 42.13, 0.005);
  assert.equal(r.method, "chow", "Chow stays the reported value");
  const stable = lit({ ...NSS, scrPrev: 1, scr: 1 });
  near(stable.nss.kegfr.kegfr, 77.78, 0.005, "KeGFR = CG when SCr is stable");
  near(M.kineticEGFR({ scr1: 1, scr2: 2, hours: 24, crclSS: 100, prodMgH: 50, vdL: 40 }).kegfr, (100 / 1.5) * (1 - 1 / 3), 1e-9);
  const fall = lit({ ...NSS, scrPrev: 2, scr: 1 });
  assert.ok(fall.flags.some((f) => f.code === "falling"));
  assert.equal(site(NSS).nss.kegfr, null, "site model unchanged: no KeGFR");
  assert.ok(!site(NSS).flags.some((f) => f.code === "unstable"));
});

test("NSS: method choice ASHP (BSA-scaled) and Winter; same in site mode", () => {
  near(lit({ ...NSS, nssMethod: "winter" }).crcl, 31.6, 0.005);
  const a = lit({ ...NSS, nssMethod: "ashp" });
  assert.equal(a.method, "ashp"); near(a.crcl, a.nss.ashpScaled, 1e-12);
  const s = site(NSS);
  near(s.nss.crclChow, 37.32, 0.005); assert.equal(s.display, Math.round(s.nss.crclChow * 100) / 100);
});

test("NSS: Chow sanity — stable 1.0/1.0 → 77.78 (= CG); improving 2.0 → 1.0 → 78.15; ASHP stable 85.71", () => {
  const same = lit({ ...NSS, scrPrev: 1, scr: 1 });
  near(same.nss.kCreat, 0.111111, 1e-6); near(same.nss.crclChow, 77.78, 0.005); near(same.crclCG, 77.78, 0.005);
  near(same.nss.ashp, 85.71, 0.005);
  const imp = lit({ ...NSS, scrPrev: 2, scr: 1 });
  near(imp.nss.kCreat, 0.111639, 1e-6); near(imp.nss.crclChow, 78.15, 0.005);
});

test("NSS: zero interval and impossible fits are flagged, CG retained", () => {
  const z = lit({ ...NSS, hours: 0 });
  assert.ok(z.flags.some((f) => f.code === "badInterval")); assert.equal(z.nss, undefined); assert.equal(z.method, "cockcroftGault");
  const bad = lit({ ...NSS, scrPrev: 1, scr: 3, hours: 6 }); // rise > R·T/Vd (0.67 mg/dL in 6 h) even with K → 0
  assert.ok(bad.flags.some((f) => f.code === "noRoot"));
  assert.equal(bad.method === "chow", false);
  assert.ok(lit({ ...NSS, hours: 6 }).flags.some((f) => f.code === "shortInterval"));
});

// ======================= Pediatric and validation =======================
test("SCI: optional CG × 0.8 applies to every CG row and the reported value", () => {
  const b = { age: 40, sex: "M", heightIn: 70, tbw: 73, scr: 1 };
  const plain = lit({ ...b, sci: true });
  near(plain.crcl, 101.388889, 1e-6); assert.equal(plain.sciFactor, 1);
  const c = lit({ ...b, sci: true, sciCorrection: true });
  assert.equal(M.SCI_CG_FACTOR, 0.8);
  near(c.crcl, 101.388889 * 0.8, 1e-6); near(c.crclCGUncorrected, 101.388889, 1e-6);
  near(row(c, "tbw").crcl, 0.8 * 101.388889, 1e-6);
  near(lit({ ...b, sciCorrection: true }).crcl, 101.388889, 1e-6, "toggle ignored without SCI");
});

test("BMI ≥ 40: reported CrCl stays AdjBW; LBW row compared, > 20% difference warned", () => {
  const r = lit({ age: 40, sex: "F", heightIn: 64, tbw: 140, scr: 0.9 });
  assert.ok(r.bmi >= 40); assert.equal(r.selectedBasis, "adjbw");
  near(r.crcl, PK.renal.cgRaw(40, r.adjbw, 0.9, "F"), 1e-9);
  const lb = row(r, "lbw");
  near(lb.crcl, PK.renal.cgRaw(40, PK.body.ffm("F", 140, r.bmi), 0.9, "F"), 1e-9);
  const diff = Math.abs(lb.crcl - r.crcl) / r.crcl;
  assert.equal(r.flags.some((f) => f.code === "bmi40Diff"), diff > 0.2);
  assert.equal(lit({ age: 40, sex: "M", heightIn: 70, tbw: 100, scr: 1 }).rows.some((x) => x.key === "lbw"), false, "no LBW row below BMI 40");
});

// ======================= Pediatric (decision Q3) =======================
test("CKiD U25 K anchors (reconstructed formula): M 35.7 at 1 y, 39.0 at 12, 50.8 at ≥ 18; F 33.1, 36.1, 41.4", () => {
  near(M.u25K(1, "M"), 35.7, 0.05); near(M.u25K(12, "M"), 39.0, 1e-9); near(M.u25K(17, "M"), 39 * Math.pow(1.045, 5), 1e-9);
  assert.equal(M.u25K(18, "M"), 50.8); near(M.u25K(17.6, "M"), 50.8, 1e-9, "nearest integer age");
  near(M.u25K(1, "F"), 33.1, 0.1); near(M.u25K(12, "F"), 36.1, 1e-9); assert.equal(M.u25K(18, "F"), 41.4);
  near(39 * Math.pow(1.045, 6), 50.8, 0.05, "male curve meets the adult value at 18");
  near(36.1 * Math.pow(1.023, 6), 41.4, 0.05, "female curve meets the adult value at 18");
});

test("Age < 18 (literature): U25 by default, bedside and original as options, de-indexed", () => {
  const b = { age: 10, sex: "M", heightIn: PK.body.cmToIn(140), tbw: 32, scr: 0.5 };
  const r = lit(b);
  assert.ok(r.flags.some((f) => f.code === "age<18" && f.lvl === "crit"));
  const k = 39 * Math.pow(1.008, -2);
  assert.equal(r.pediatric.method, "u25"); assert.equal(r.method, "u25");
  near(r.pediatric.u25.per173, (k * 1.4) / 0.5, 1e-9);
  near(r.crcl, ((k * 1.4) / 0.5) * PK.body.bsa(32, 140) / 1.73, 1e-9);
  near(r.normalized, (k * 1.4) / 0.5, 1e-9);
  near(r.pediatric.bedside.per173, (0.413 * 140) / 0.5, 1e-9);
  near(r.pediatric.original.per173, 154, 1e-9);
  const bs = lit({ ...b, pedMethod: "bedside" });
  assert.equal(bs.method, "bedside"); near(bs.normalized, 115.64, 1e-9);
  const og = lit({ ...b, pedMethod: "original" });
  assert.equal(og.method, "schwartz"); assert.ok(og.flags.some((f) => f.code === "jaffe"));
  assert.ok(lit({ ...b, age: 0.5 }).flags.some((f) => f.code === "infant"));
  assert.equal(lit({ age: 30, sex: "M", heightIn: 68, tbw: 60, scr: 0.8 }).pediatric, undefined);
});

test("Age < 18 (site model unchanged): original Schwartz k 0.55 → 154 per 1.73 m²; 0.7 adolescent male", () => {
  const r = site({ age: 10, sex: "M", heightIn: PK.body.cmToIn(140), tbw: 32, scr: 0.5, pedMethod: "u25" });
  assert.equal(r.schwartz.k, 0.55); near(r.schwartz.per173, 154, 1e-9);
  assert.equal(r.method, "schwartz"); near(r.crcl, (154 * PK.body.bsa(32, 140)) / 1.73, 1e-9);
  assert.equal(site({ age: 15, sex: "M", heightIn: 68, tbw: 60, scr: 0.8 }).schwartz.k, 0.7);
});

test("Validation: missing inputs return an error; out-of-range inputs warn", () => {
  assert.ok(lit({ age: 60, sex: "M", heightIn: 70, tbw: 70, scr: NaN }).error);
  assert.ok(lit({ age: 60, sex: "M", heightIn: 70, tbw: 70, scr: 25 }).flags.some((f) => f.code === "scrRange"));
  assert.ok(lit({ age: 60, sex: "M", heightIn: 40, tbw: 70, scr: 1 }).flags.some((f) => f.code === "heightRange"));
  assert.ok(lit({ age: 60, sex: "M", heightIn: 70, tbw: 400, scr: 1 }).flags.some((f) => f.code === "weightRange"));
  assert.ok(lit({ age: 60, sex: "M", heightIn: 58, tbw: 40, scr: 1 }).flags.some((f) => f.code === "short"));
});

// ======================= hepatic-score.md §8 =======================
const CP_CASES = [
  [1, 1, 1, 1, 1, 5, "A"], [2, 1, 1, 1, 1, 6, "A"], [2, 2, 1, 1, 1, 7, "B"],
  [2, 2, 2, 2, 1, 9, "B"], [2, 2, 2, 2, 2, 10, "C"], [3, 3, 3, 3, 3, 15, "C"],
];
for (const [bili, alb, coag, ascites, enceph, score, cls] of CP_CASES) {
  test(`Child-Pugh points ${bili}/${alb}/${coag}/${ascites}/${enceph} → ${score} ${cls}`, () => {
    const r = M.childPughFromPoints({ bili, alb, coag, ascites, enceph });
    assert.equal(r.score, score); assert.equal(r.cls, cls);
  });
}

test("Child-Pugh numeric example: bili 2.5, alb 3.0, INR 1.5, mild ascites, no HE → 8, class B", () => {
  const r = M.childPugh({ bili: 2.5, alb: 3.0, coagMode: "inr", coag: 1.5, ascites: 2, enceph: 1 });
  assert.deepEqual(r.points, { bili: 2, alb: 2, coag: 1, ascites: 2, enceph: 1 });
  assert.equal(r.score, 8); assert.equal(r.cls, "B"); assert.equal(r.complete, true); assert.equal(r.argatrobanReduce, true);
});

test("Child-Pugh PBC/PSC: bilirubin 5 scores 2 (cholestatic) vs 3 (standard)", () => {
  assert.equal(M.cpPoints.bili(5, true), 2);
  assert.equal(M.cpPoints.bili(5, false), 3);
});

test("Child-Pugh boundaries: on-edge values score the middle band (lit H1–H4)", () => {
  const B = M.cpPoints;
  [[1.99, 1], [2, 2], [3, 2], [3.01, 3]].forEach(([x, p]) => assert.equal(B.bili(x, false), p, `bili ${x}`));
  [[3.99, 1], [4, 2], [10, 2], [10.01, 3]].forEach(([x, p]) => assert.equal(B.bili(x, true), p, `cholestatic bili ${x}`));
  [[3.51, 1], [3.5, 2], [2.8, 2], [2.79, 3]].forEach(([x, p]) => assert.equal(B.alb(x), p, `alb ${x}`));
  [[1.69, 1], [1.7, 2], [2.3, 2], [2.31, 3]].forEach(([x, p]) => assert.equal(B.inr(x), p, `INR ${x}`));
  [[3.9, 1], [4, 2], [6, 2], [6.1, 3]].forEach(([x, p]) => assert.equal(B.pt(x), p, `PT ${x}`));
  [[5, "A"], [6, "A"], [7, "B"], [9, "B"], [10, "C"], [15, "C"]].forEach(([s, c]) => assert.equal(M.cpClass(s), c, `class ${s}`));
});

test("Child-Pugh unit conversion keeps boundaries exact (34.2 / 51.3 µmol/L, 35 / 28 g/L)", () => {
  assert.equal(M.biliToMgdl(34.2, "µmol/L"), 2); assert.equal(M.cpPoints.bili(M.biliToMgdl(34.2, "µmol/L")), 2);
  assert.equal(M.biliToMgdl(51.3, "µmol/L"), 3); assert.equal(M.cpPoints.bili(M.biliToMgdl(51.3, "µmol/L")), 2);
  assert.equal(M.cpPoints.bili(M.biliToMgdl(171, "µmol/L"), true), 2, "171 µmol/L = 10 mg/dL cholestatic");
  assert.equal(M.cpPoints.alb(M.albToGdl(35, "g/L")), 2); assert.equal(M.cpPoints.alb(M.albToGdl(28, "g/L")), 2);
  assert.equal(M.cpPoints.alb(M.albToGdl(36, "g/L")), 1); assert.equal(M.biliToMgdl(1.5, "mg/dL"), 1.5);
});

test("Child-Pugh: PT-seconds mode, argatroban threshold (> 6), incomplete inputs", () => {
  const a = M.childPugh({ bili: 1, alb: 4, coagMode: "pt", coag: 5, ascites: 1, enceph: 2 });
  assert.equal(a.coagMode, "pt"); assert.equal(a.points.coag, 2); assert.equal(a.score, 7); assert.equal(a.argatrobanReduce, true);
  const six = M.childPugh({ bili: 2, alb: 4, coag: 1, ascites: 1, enceph: 1 });
  assert.equal(six.score, 6); assert.equal(six.cls, "A"); assert.equal(six.argatrobanReduce, false);
  const inc = M.childPugh({ bili: NaN, alb: 4, coag: 1, ascites: 1, enceph: 1 });
  assert.equal(inc.complete, false); assert.deepEqual(inc.missing, ["bilirubin"]); assert.ok(Number.isNaN(inc.score));
  assert.ok(M.childPugh({ bili: 1, alb: 40, coag: 1, ascites: 1, enceph: 1 }).flags.some((f) => f.code === "albRange"));
});

test("Child-Pugh UI copy: pre-anticoagulant INR note; only argatroban uses the class", () => {
  assert.match(html, /before<\/b> anticoagulation/);
  assert.match(html, /only suite drug that uses the class/);
  assert.match(html, /Theophylline<\/b>[^\n]*<b>not<\/b> auto-adjusted by Child-Pugh/);
  assert.match(html, /Phenytoin<\/b>[^\n]*<b>not<\/b> auto-adjusted/);
});

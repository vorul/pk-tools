// Tests for pk-suite/theophylline.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js (sets globalThis.PK), then the page's CALC block via new Function, so the tests exercise the
// published code. Sources: specs/theophylline.md (§8 worked examples, "Live-server verification" table) and
// lit/digoxin-theophylline.md, as amended by the approved decisions/digoxin-theophylline.md Q7–Q11 (literature defaults).
// Tolerances: site-table rows must match the site's DISPLAYED strings exactly (1 dp levels and t½, integer LD and daily
// dose, unrounded K/V/CL). KFit: |ΔK|/K ≤ 0.5% vs the server (the server's solver is approximate, spec §4d).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "theophylline.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const T = new Function(`${block}; return { MODELS, SCHEDULES, FORMS, patient, ssProfile, solveDecreasing, siteRound, startCalc, levelCalc, adjustCalc, roundDose };`)();

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
const rel = (actual, expected, r, msg) => near(actual, expected, Math.abs(expected) * r, msg);

// Baseline B: male, 40 y, 70 in, 70 kg, no factors, S 1, IR (spec live-server section).
const B = { model: "site", age: 40, sex: "M", heightCm: 70 * 2.54, weightKg: 70, salt: "theo", s_ldRoute: "iv", s_form: "ir", s_code: "2" };
const L = { ...B, model: "literature" };

test("PK is loaded and the CALC block uses it", () => {
  assert.equal(globalThis.PK, PK);
  assert.ok(T.MODELS.site && T.MODELS.literature);
});

// ---------------- Live-server regression table, rows 1–29 (site mode, displayed values) ----------------
// [#, diff, DW, K, t½, Vd, CL, LD, Daily, Hourly]
const ROWS = [
  [1, {}, "70", "0.08", "8.7", "35", "2.8", "350", "672", "28"],
  [2, { weightKg: 100 }, "73", "0.08", "8.7", "36.5", "2.92", "365", "701", "29.2"],
  [3, { weightKg: 85 }, "73", "0.08", "8.7", "36.5", "2.92", "365", "701", "29.2"],
  [4, { sex: "F", heightCm: 64 * 2.54, weightKg: 60 }, "54.7", "0.08", "8.7", "27.35", "2.188", "274", "525", "21.9"],
  [5, { weightKg: 73.3 }, "73", "0.08", "8.7", "36.5", "2.92", "365", "701", "29.2"],
  [6, { age: 1 }, "70", "0.16", "4.3", "35", "5.6", "350", "1344", "56"],
  [7, { age: 8 }, "70", "0.16", "4.3", "35", "5.6", "350", "1344", "56"],
  [8, { age: 9 }, "70", "0.16", "4.3", "35", "5.6", "350", "1344", "56"],
  [9, { age: 9.5 }, "70", "0.14", "4.9", "35", "4.9", "350", "1176", "49"],
  [10, { age: 10 }, "70", "0.14", "4.9", "35", "4.9", "350", "1176", "49"],
  [11, { age: 12 }, "70", "0.14", "4.9", "35", "4.9", "350", "1176", "49"],
  [12, { age: 12.5 }, "70", "0.1", "6.9", "35", "3.5", "350", "840", "35"],
  [13, { age: 13 }, "70", "0.1", "6.9", "35", "3.5", "350", "840", "35"],
  [14, { age: 15 }, "70", "0.1", "6.9", "35", "3.5", "350", "840", "35"],
  [15, { age: 16 }, "70", "0.1", "6.9", "35", "3.5", "350", "840", "35"],
  [16, { age: 16.5 }, "70", "0.08", "8.7", "35", "2.8", "350", "672", "28"],
  [17, { age: 17 }, "70", "0.08", "8.7", "35", "2.8", "350", "672", "28"],
  [18, { age: 65 }, "70", "0.08", "8.7", "35", "2.8", "350", "672", "28"],
  [19, { age: 90 }, "70", "0.08", "8.7", "35", "2.8", "350", "672", "28"],
  [20, { cirrhosis: true }, "70", "0.04", "17.3", "35", "1.4", "350", "336", "14"],
  [21, { smoker: true }, "70", "0.14", "4.9", "35", "4.9", "350", "1176", "49"],
  [22, { chf: "yes" }, "70", "0.032", "21.7", "35", "1.12", "350", "269", "11.2"],
  [23, { smoker: true, chf: "yes" }, "70", "0.056", "12.4", "35", "1.96", "350", "470", "19.6"],
  [24, { drugs: ["erythromycin"] }, "70", "0.06", "11.5", "35", "2.1", "350", "504", "21"],
  [25, { sopd: true, drugs: ["ciprofloxacin", "phenytoin"] }, "70", "0.07168", "9.7", "35", "2.5088", "350", "602", "25.1"],
  [26, { smoker: true, age: 5 }, "70", "0.16", "4.3", "35", "5.6", "350", "1344", "56"],
  [27, { smoker: true, age: 14 }, "70", "0.14", "4.9", "35", "4.9", "350", "1176", "49"],
  [28, { salt: "aminoSite" }, "70", "0.08", "8.7", "35", "2.8", "417", "800", "33.3"],
  [29, { salt: "oxtri" }, "70", "0.08", "8.7", "35", "2.8", "547", "1050", "43.8"],
];
for (const [n, diff, dw, K, th, V, CL, LD, daily, hourly] of ROWS) {
  test(`site row ${n}: ${JSON.stringify(diff)} → DW ${dw}, K ${K}, t½ ${th}, Vd ${V}, CL ${CL}, LD ${LD}, daily ${daily}, hourly ${hourly}`, () => {
    const o = T.startCalc({ ...B, ...diff });
    assert.ok(o.valid, JSON.stringify(o.alerts));
    const d = o.display;
    assert.deepEqual([d.dw, d.K, d.thalf, d.V, d.CL, d.LD, d.daily, d.hourly], [dw, K, th, V, CL, LD, daily, hourly]);
  });
}

// ---------------- Live-server rows 30–37: predicted peak / trough / avg and KFit ----------------
const PRED = [
  [30, { s_form: "ir", s_code: "2", s_dose: 300 }, ["13.9", "5.3", "8.9"]],
  [31, { s_form: "sr", s_code: "2", s_dose: 300 }, ["9.7", "7.6", "8.9"]],
  [32, { s_form: "sr", s_code: "2", s_dose: 3000 }, ["96.8", "75.6", "89.3"]],
  [33, { s_form: "sr", s_code: "1", s_dose: 3000 }, ["59", "24.4", "44.6"]],
  [34, { s_form: "elixir", s_code: "3", s_dose: 3000 }, ["181.3", "95.6", "133.9"]],
  [35, { s_form: "inj", s_code: "99", s_dose: 28 }, ["10", "10", "10"]],
  [36, { s_form: "ir", s_code: "2", s_dose: 300 }, ["13.9", "5.3", "8.9"]],
  [37, { s_form: "ir", s_code: "31", s_dose: 2000 }, ["134", "51.3", "89.3"]],
];
for (const [n, diff, exp] of PRED) {
  test(`site row ${n}: predicted peak/trough/avg ${exp.join(" / ")}`, () => {
    const d = T.startCalc({ ...B, ...diff }).display;
    assert.deepEqual([d.peak, d.trough, d.avg], exp);
  });
}
const KFIT = [
  [35, { l_form: "inj", l_code: "99", l_dose: 28, l_level: 15, l_time: 5 }, 0.0531666, 0.0533333],
  [36, { l_form: "ir", l_code: "2", l_dose: 300, l_level: 8, l_time: 12 }, 0.06079254, 0.0606865],
  [37, { l_form: "ir", l_code: "31", l_dose: 2000, l_level: 40, l_time: 12 }, 0.09277707, 0.0927878],
];
for (const [n, diff, server, exact] of KFIT) {
  test(`site row ${n}: KFit ${server} (server, ≤ 0.5%); exact root ${exact}`, () => {
    const o = T.levelCalc({ ...B, l_state: "ss", ...diff });
    assert.ok(o.valid, JSON.stringify(o.alerts));
    rel(o.K, server, 0.005, "vs server");
    rel(o.K, exact, 1e-5, "vs exact root");
  });
}

// ---------------- Spec §8 worked examples ----------------
test("E1: V 35, CL 2.8, K 0.08, t½ 8.66, LD 350, hourly 28, daily 672 (both models for a 40-y-old)", () => {
  for (const base of [B, L]) {
    const o = T.startCalc(base);
    near(o.pt.V, 35, 1e-9); near(o.pt.CL, 2.8, 1e-9); near(o.pt.K, 0.08, 1e-12); near(o.pt.thalf, 8.6625, 1e-9);
    near(o.ldExact, 350, 1e-9); near(o.hourly, 28, 1e-9); near(o.daily, 672, 1e-9);
  }
});
test("E2: aminophylline S 0.84 (site) → LD 416.7, hourly 33.33, daily 800", () => {
  const o = T.startCalc({ ...B, salt: "aminoSite" });
  near(o.ldExact, 416.67, 0.01); near(o.hourly, 33.333, 0.001); near(o.daily, 800, 1e-6);
});
test("E3: smoker (site) CL 4.9, K 0.14; smoker + CHF CL 1.96, K 0.056, hourly 19.6", () => {
  const a = T.startCalc({ ...B, smoker: true });
  near(a.pt.CL, 4.9, 1e-9); near(a.pt.K, 0.14, 1e-12); near(a.pt.thalf, 4.95, 1e-9); near(a.hourly, 49, 1e-9);
  const b = T.startCalc({ ...B, smoker: true, chf: "yes" });
  near(b.pt.CL, 1.96, 1e-9); near(b.pt.K, 0.056, 1e-12); near(b.hourly, 19.6, 1e-9); near(b.daily, 470.4, 1e-9);
});
test("E4: IR 336 mg Q12H → Cmax 15.556, Cmin 5.956, Cavg 10.00; 300 mg → 13.889 / 5.318 / 8.93", () => {
  const pt = T.patient(B);
  const a = T.ssProfile(pt, { form: "ir", code: "2", dose: 336, S: 1 });
  near(a.peak, 15.556, 1e-3); near(a.trough, 5.956, 1e-3); near(a.avg, 10, 1e-9);
  const b = T.ssProfile(pt, { form: "ir", code: "2", dose: 300, S: 1 });
  near(b.peak, 13.889, 1e-3); near(b.trough, 5.318, 1e-3); near(b.avg, 8.929, 1e-3);
});
test("E4b: SR 300 mg Q12H, ka 0.18 → peak 9.685 at 4.51 h, trough 7.562", () => {
  const pr = T.ssProfile(T.patient(B), { form: "sr", code: "2", dose: 300, S: 1 });
  near(pr.peak, 9.685, 1e-3); near(pr.tPeak, 4.51, 0.01); near(pr.trough, 7.562, 1e-3);
  near(pr.tPeak, PK.one.tmaxOralSS(0.18, 0.08, 12), 1e-6, "agrees with the closed-form tmax");
});
test("E5: trough 8 on 300 mg Q12H → K 0.060686, t½ 11.42, CL 2.124, Q12H dose for Cavg 10 = 254.9 mg", () => {
  const o = T.levelCalc({ ...B, l_state: "ss", l_form: "ir", l_code: "2", l_dose: 300, l_level: 8, l_time: 12 });
  near(o.K, 0.060686, 1e-6); near(o.thalf, 11.42, 0.01); near(o.CL, 2.124, 1e-3);
  const a = T.adjustCalc({ ...B, l_state: "ss", l_form: "ir", l_code: "2", l_dose: 300, l_level: 8, l_time: 12, a_src: "fit", a_form: "ir", a_code: "2", a_target: 10 });
  near(a.exact, 254.9, 0.1);
});
test("E6: infusion 28 mg/h, Css 15 → CL 1.867, K 0.0533, new rate 18.67 mg/h", () => {
  const p = { ...B, l_state: "ss", l_form: "inj", l_code: "99", l_dose: 28, l_level: 15, l_time: 5, a_src: "fit", a_form: "inj", a_code: "99", a_target: 10 };
  const o = T.levelCalc(p);
  near(o.CL, 1.8667, 1e-4); near(o.K, 0.05333, 1e-5);
  near(T.adjustCalc(p).exact, 18.667, 1e-3);
});
test("E7: TID 8A-2P-8P 200 mg → trough 5.132, Cavg 8.93, peak 13.40", () => {
  const pr = T.ssProfile(T.patient(B), { form: "ir", code: "31", dose: 200, S: 1 });
  near(pr.trough, 5.132, 1e-3); near(pr.avg, 8.929, 1e-3); near(pr.peak, 13.40, 0.005);
});
test("E8: partial load, V 35, current 4 → 10, S 0.84 → 250 mg", () => {
  const o = T.startCalc({ ...B, salt: "aminoSite", s_curLevel: 4, s_ldTarget: 10 });
  near(o.ldExact, 250, 1e-9); assert.equal(o.ld, 250);
  const none = T.startCalc({ ...B, s_curLevel: 12 });
  assert.equal(none.ld, 0, "no load when the current level is above target");
});
test("E9: pediatric (site) age 5 CL 5.6, hourly 56; age 14 CL 3.5; age 14 smoker CL 4.9", () => {
  near(T.patient({ ...B, age: 5 }).CL, 5.6, 1e-9);
  near(T.startCalc({ ...B, age: 5 }).hourly, 56, 1e-9);
  near(T.patient({ ...B, age: 14 }).CL, 3.5, 1e-9);
  near(T.patient({ ...B, age: 14, smoker: true }).CL, 4.9, 1e-9);
  near(T.patient({ ...B, age: 5, smoker: true }).CL, 5.6, 1e-9, "smoking does not change age ≤ 9");
});

// ---------------- Literature-mode sanity ----------------
test("literature: cirrhosis DEcreases clearance (×0.5), in both models", () => {
  for (const m of ["literature", "site"]) {
    const a = T.patient({ ...B, model: m }), b = T.patient({ ...B, model: m, cirrhosis: true });
    assert.ok(b.CL < a.CL, m); near(b.CL / a.CL, 0.5, 1e-12, m);
  }
});
test("decision Q7/Q8: age bands 0.08 / 0.07 / 0.05 / 0.04 (label Table V, site cut-points), > 60 y 0.028", () => {
  const cl = (age) => T.patient({ ...L, age }).base;
  assert.deepEqual([1, 9, 9.5, 12, 12.5, 16, 16.5, 60, 60.5, 85].map(cl), [0.08, 0.08, 0.07, 0.07, 0.05, 0.05, 0.04, 0.04, 0.028, 0.028]);
  near(T.patient({ ...L, age: 70 }).CL, 0.028 * 70, 1e-12, "elderly 70 kg");
  near(T.patient({ ...L, age: 70, elderlyCL: "0.025" }).base, 0.025, 0, "option 0.025");
  near(T.patient({ ...L, age: 70, elderlyCL: "0.03" }).base, 0.03, 0, "option 0.03");
  near(T.patient({ ...L, age: 70, elderlyCL: "0.5" }).base, 0.028, 0, "invalid option falls back");
  for (const age of [1, 5, 9, 10, 14, 16, 17, 40]) near(T.patient({ ...L, age }).CL, T.patient({ ...B, age }).CL, 1e-12, `non-smoker parity with site at ${age} y`);
});
test("decision Q10: smoker ×1.4 (12–16 y), ×1.5 (16–60 y), ×1.8 (> 60 y), none ≤ 12 y; CHF 0.5, severe 0.4", () => {
  near(T.patient({ ...L, smoker: true }).CL, 2.8 * 1.5, 1e-9);
  near(T.patient({ ...L, age: 14, smoker: true }).CL, 0.05 * 70 * 1.4, 1e-9);
  near(T.patient({ ...L, age: 70, smoker: true }).CL, 0.028 * 70 * 1.8, 1e-9);
  near(T.patient({ ...L, age: 5, smoker: true }).CL, 0.08 * 70, 1e-9);
  near(T.patient({ ...L, age: 12, smoker: true }).CL, 0.07 * 70, 1e-9);
  near(T.patient({ ...L, chf: "yes" }).CL, 1.4, 1e-9);
  near(T.patient({ ...L, chf: "severe" }).CL, 1.12, 1e-9);
});
test("decision Q10: influenza vaccine 1.0; propranolol 0.5, rifampin 1.4, fluvoxamine 0.33, viral 0.6, CF 1.5, APE 0.5", () => {
  near(T.patient({ ...L, drugs: ["fluvoxamine"] }).mult, 0.33, 1e-12);
  near(T.patient({ ...L, viral: true }).mult, 0.6, 1e-12);
  near(T.patient({ ...B, viral: true }).mult, 0.5, 1e-12, "site keeps 0.5");
  near(T.patient({ ...L, cf: true }).mult, 1.5, 1e-12);
  near(T.patient({ ...L, ape: true }).mult, 0.5, 1e-12);
  near(T.patient({ ...L, drugs: ["influenzaVaccine"] }).CL, 2.8, 1e-12);
  near(T.patient({ ...B, drugs: ["influenzaVaccine"] }).CL, 1.4, 1e-12, "site keeps ×0.5");
  near(T.patient({ ...L, drugs: ["propranolol"] }).mult, 0.5, 1e-12);
  near(T.patient({ ...L, drugs: ["rifampin"] }).mult, 1.4, 1e-12);
  near(T.patient({ ...L, drugs: ["phenytoin"] }).mult, 1.67, 1e-12);
  near(T.patient({ ...L, drugs: ["phenobarbital"] }).mult, 1.33, 1e-12);
});
test("decision Q9: aminophylline S 0.79 (injection) default, 0.86 bulk anhydrous; no 0.84 in literature; site keeps 0.84", () => {
  assert.deepEqual(Object.values(T.MODELS.literature.salts).map((x) => x.value).sort(), [0.64, 0.79, 0.86, 1]);
  assert.match(T.MODELS.literature.salts.aminoAnhydrous.label, /bulk anhydrous powder/);
  assert.equal(T.MODELS.site.salts.aminoSite.value, 0.84);
  assert.equal(T.patient({ ...L, salt: "aminoDihydrate" }).S, 0.79);
  assert.equal(T.patient({ ...L, salt: "aminoAnhydrous" }).S, 0.86);
  assert.equal(T.patient({ ...L, salt: "aminoSite" }).S, 0.79, "site key maps to the literature default");
  assert.equal(T.patient({ ...B, salt: "aminoDihydrate" }).S, 0.84, "literature key maps to the site salt");
  near(T.startCalc({ ...L, salt: "aminoDihydrate" }).ldExact, 350 / 0.79, 1e-9);
  near(T.startCalc({ ...L, salt: "aminoDihydrate" }).hourly, 28 / 0.79, 1e-9);
});
test("literature: SR modelled as zero-order over tau → peak ≈ trough ≈ Cavg for even schedules", () => {
  const pr = T.ssProfile(T.patient(L), { form: "sr", code: "2", dose: 300, S: 1 });
  near(pr.peak, 8.9286, 1e-3); near(pr.trough, 8.9286, 1e-3); near(pr.avg, 8.9286, 1e-3);
});
test("literature: SR K fit returns CL = S·D/(C·tau) at steady state", () => {
  const o = T.levelCalc({ ...L, l_state: "ss", l_form: "sr", l_code: "2", l_dose: 300, l_level: 10, l_time: 6 });
  near(o.CL, 300 / (10 * 12), 1e-6);
});
test("literature: target Cavg 10 and 5–15 range, toxic alert > 20, warn > 15", () => {
  const M = T.MODELS.literature;
  assert.equal(M.target.value, 10); assert.equal(M.target.low, 5); assert.equal(M.target.high, 15); assert.equal(M.target.toxic, 20);
  const hi = T.levelCalc({ ...L, l_state: "ss", l_form: "ir", l_code: "2", l_dose: 300, l_level: 24, l_time: 12 });
  assert.ok(hi.alerts.some((a) => a.lvl === "crit" && /toxicity/.test(a.text)));
  const mid = T.levelCalc({ ...L, l_state: "ss", l_form: "ir", l_code: "2", l_dose: 300, l_level: 17, l_time: 12 });
  assert.ok(mid.alerts.some((a) => a.lvl === "warn" && /above the 5–15/.test(a.text)));
});
test("literature: non-steady-state superposition fit recovers a known K", () => {
  const pt = T.patient(L), Ktrue = 0.065;
  const events = [{ t: 0, dose: 400, tinf: 0.5, S: 0.79, F: 1 }, ...PK.one.regimen({ dose: 200, tau: 8, n: 3, t0: 0, S: 0.79, F: 1, tinf: 0 })];
  const c = PK.one.superpose(20, events, { V: pt.V, k: Ktrue }, { c0: 3, t0: 0 });
  const o = T.levelCalc({ ...L, salt: "aminoDihydrate", l_state: "nss", l_form: "ir", l_code: "3", l_dose: 200, l_level: c,
    n_time: 20, n_start: 0, n_ld: 400, n_ldRoute: "iv", n_c0: 3 });
  assert.ok(o.valid, JSON.stringify(o.alerts));
  near(o.K, Ktrue, 1e-8);
});
test("NSS fit: infusion after a load, both models", () => {
  for (const base of [B, L]) {
    const pt = T.patient(base), Ktrue = 0.05;
    const tinf = base.model === "site" ? 0 : 0.5;
    const c = PK.one.superpose(18, [{ t: 0, dose: 350, tinf }, { t: 0, dose: 30 * 1e5, tinf: 1e5 }], { V: pt.V, k: Ktrue });
    const o = T.levelCalc({ ...base, l_state: "nss", l_form: "inj", l_code: "99", l_dose: 30, l_level: c, n_time: 18, n_ld: 350, n_ldRoute: "iv" });
    near(o.K, Ktrue, 1e-8, base.model);
  }
});
test("literature: pediatric oral dose capped at the label empiric 12–14 mg/kg/day (max 300)", () => {
  const o = T.startCalc({ ...L, age: 6, heightCm: 115, weightKg: 20, s_form: "ir", s_code: "3" });
  assert.ok(o.capNote, "cap applied");
  assert.ok(o.dose * 3 <= 14 * 20 + 1e-9);
  assert.ok(o.alerts.some((a) => /empiric/.test(a.text) && /16 mg\/kg\/day/.test(a.text)), "titration ladder shown");
  assert.equal(o.pt.dwBasis, "TBW", "TBW used under 60 in");
});
test("decision Q8: > 60 y or impaired clearance: 400 mg/day oral and 17 mg/h IV caps flagged; IR once daily is flagged", () => {
  const o = T.startCalc({ ...L, age: 50, s_form: "sr", s_code: "2", s_dose: 300, chf: "yes" });
  assert.ok(o.alerts.some((a) => /400 mg\/day/.test(a.text)));
  const e = T.startCalc({ ...L, age: 75, s_form: "sr", s_code: "2", s_dose: 300 });
  assert.ok(e.alerts.some((a) => /400 mg\/day/.test(a.text)), "elderly oral");
  const iv = T.startCalc({ ...L, age: 75, s_form: "inj", s_code: "99", s_dose: 25 });
  assert.ok(iv.alerts.some((a) => /17 mg\/h/.test(a.text)), "elderly infusion");
  assert.ok(!T.startCalc({ ...L, age: 75, s_form: "inj", s_code: "99", s_dose: 15 }).alerts.some((a) => /17 mg\/h/.test(a.text)));
  assert.ok(!T.startCalc({ ...B, age: 75, s_form: "inj", s_code: "99", s_dose: 25 }).alerts.some((a) => /17 mg\/h/.test(a.text)), "site mode unchanged");
  const q = T.startCalc({ ...L, s_form: "ir", s_code: "1" });
  assert.ok(q.alerts.some((a) => /once daily/.test(a.text)));
});
test("dose adjustment: > 25% increase warns in literature mode", () => {
  const p = { ...L, l_state: "ss", l_form: "ir", l_code: "2", l_dose: 200, l_level: 5, l_time: 12, a_src: "fit", a_form: "ir", a_code: "2", a_target: 10 };
  const o = T.adjustCalc(p);
  assert.ok(o.change > 0.25);
  assert.ok(o.alerts.some((a) => a.lvl === "warn" && /25%/.test(a.text)));
});
test("dose adjustment: toxic level gives a hold time = ln(C/target)/K", () => {
  const p = { ...L, l_state: "ss", l_form: "ir", l_code: "2", l_dose: 400, l_level: 25, l_time: 12, a_src: "fit", a_form: "ir", a_code: "2", a_target: 10 };
  const o = T.adjustCalc(p);
  near(o.hold, Math.log(25 / 10) / o.q.K, 1e-9);
  assert.ok(o.lines.some((l) => l.tag === "Hold"));
});
test("input guards: age < 1 blocked; infusion with an oral form blocked; infusion level at 0 h blocked", () => {
  assert.equal(T.startCalc({ ...L, age: 0.5 }).valid, false);
  assert.ok(T.startCalc({ ...L, s_form: "ir", s_code: "99" }).alerts.some((a) => a.lvl === "crit"));
  assert.equal(T.levelCalc({ ...L, l_state: "ss", l_form: "inj", l_code: "99", l_dose: 28, l_level: 10, l_time: 0 }).valid, false);
});
test("order text names the salt and the model", () => {
  const o = T.startCalc({ ...L, salt: "aminoDihydrate", s_form: "inj", s_code: "99" });
  assert.match(o.orderText, /aminophylline/);
  assert.match(o.orderText, /Literature model/);
  assert.match(o.orderText, /mg\/h continuous IV infusion/);
});
test("every literature parameter carries a source; approved decisions cite the decisions file and drop the verify badge", () => {
  const pt = T.patient({ ...L, age: 70, smoker: true, cf: true, viral: true, drugs: ["propranolol", "rifampin", "fluvoxamine", "influenzaVaccine"], salt: "aminoDihydrate" });
  for (const r of pt.params) assert.ok(r.src && r.ref, r.name);
  const v = (re) => pt.params.find((r) => re.test(r.name));
  for (const re of [/Base CL/, /Smoker/, /Salt/, /Propranolol/, /Rifampin/, /Fluvoxamine/, /Influenza/, /Cystic/, /viral/, /Sustained-release/]) {
    assert.equal(v(re).verify, false, String(re));
    assert.match(v(re).ref, /decisions\/digoxin-theophylline\.md Q\d+/, String(re));
  }
  const other = T.patient({ ...L, otherMult: 0.8 }).params.find((r) => /Other/.test(r.name));
  assert.equal(other.verify, true, "user-entered multiplier still flagged");
});
test("decision Q11: SR and IR sampling text says peak, never trough", () => {
  const sr = T.startCalc({ ...L, s_form: "sr", s_code: "2" });
  const lvl = sr.lines.find((l) => l.tag === "Level").rx;
  assert.match(lvl, /9 h after a morning dose/); assert.match(lvl, /Theo-24 capsules 12 h/); assert.match(lvl, /trough adds nothing/);
  const ir = T.startCalc({ ...L, s_form: "ir", s_code: "3" });
  assert.match(ir.lines.find((l) => l.tag === "Level").rx, /1–2 h after an IR/);
  const off = T.levelCalc({ ...L, l_state: "ss", l_form: "sr", l_code: "2", l_dose: 300, l_level: 9, l_time: 3 });
  assert.ok(off.alerts.some((a) => /outside 8–14 h/.test(a.text)), "SR level away from the peak is flagged");
  const site = T.startCalc({ ...B, s_form: "ir", s_code: "2" });
  assert.match(site.lines.find((l) => l.tag === "Level").rx, /Trough/, "site mode keeps its trough advice");
});

test("tablet rounding: more than 3 tablets when 3 cannot reach the dose (no silent cap)", () => {
  assert.equal(T.roundDose(700, "sr", { group: "amino" }, "2"), 700);   // was capped at 600 (3 × 200)
  assert.equal(T.roundDose(1000, "ir", { group: "amino" }, "1"), 1000);
  assert.equal(T.roundDose(450, "sr", { group: "theo" }, "2"), 450);    // within 3 tablets: unchanged
});

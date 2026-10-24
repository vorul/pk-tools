// Tests for pk-suite/acyclovir.html. Run from the project folder:  node --test pk-suite/tests/
// Loads lib/pkcore.js (sets globalThis.PK), then the page's CALC-START…CALC-END block with new Function,
// so the published code is what is tested. Worked examples A–F come from specs/acyclovir.md §8
// (site mode where they depend on site choices); literature-mode cases follow lit/acyclovir-infusions-hepatic.md.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const PK = require(path.join(__dirname, "..", "lib", "pkcore.js"));

const html = fs.readFileSync(path.join(__dirname, "..", "acyclovir.html"), "utf8");
const block = html.split("// CALC-START")[1].split("// CALC-END")[0];
const A = new Function(`${block}; return { MW, MAX_MGKG, SRC, INDICATIONS, MODELS, WEIGHT_POLICIES, RENAL_TABLE, weights, dosingWeight,
  breakpointDeltaW, renalRegimen, clBlum, clSpector, clFletcher, predictExposure, continuousCss, chooseVolume, calc, orderText };`)();

const near = (actual, expected, tol, msg) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${msg || ""} expected ${expected} ± ${tol}, got ${actual}`);
const IN = 2.54;
const has = (r, code) => r.alerts.some((a) => a.code === code);
const lvl = (r, code) => (r.alerts.find((a) => a.code === code) || {}).lvl;
// Base patient: spec example B (male, 70 in, 120 kg, CrCl 90 entered, HSV encephalitis).
const B = { indication: "hse", age: 50, sex: "M", heightCm: 70 * IN, tbw: 120, crclMode: "entered", crcl: 90, dialysis: "none", roundInc: 25 };
const lit = (o) => A.calc({ ...B, model: "literature", ...o });
const site = (o) => A.calc({ ...B, model: "site", ...o });

test("page shape: loads shared lib, has CALC block, theme tokens, viewport and educational footer", () => {
  assert.match(html, /<script src="lib\/pkcore\.js"><\/script>/);
  assert.match(html, /<link rel="stylesheet" href="lib\/pk\.css">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /<footer>[^<]*Educational/);
  assert.match(html, /id="modelSeg"/);
  assert.ok(!/fetch\(|XMLHttpRequest/.test(html), "no runtime network calls");
  assert.ok(!/function\s+(ibw|cockcroftGault|bsa)\s*\(/.test(block), "no re-implemented pkcore functions");
  assert.equal(A.MODELS.literature.weightPolicy, "adjObese", "approved literature default = AdjBW in obesity");
  assert.equal(A.MODELS.literature.bandBasis, "per173", "approved: bands in label units");
  assert.equal(A.MODELS.site.weightPolicy, "adjIfOver", "site default = AdjBW above IBW");
  assert.equal(A.MODELS.site.bandBasis, "absolute", "site unchanged");
  assert.equal(A.WEIGHT_POLICIES.ibw.label, "IBW (label)");
  assert.match(html, /id="ibwBtn"[^>]*>Use IBW \(label\)</, "one-click IBW (label)");
  for (const k of ["blum", "spector", "fletcher", "crrt", "crrtLit", "hdLit"]) assert.equal(A.SRC[k].verify, true, `${k} carries a verify badge`);
  for (const k of ["idsa", "vzvEnc", "adjObese", "bands173"]) assert.equal(A.SRC[k].verify, false, `${k} approved/verified`);
  assert.match(A.SRC.blum.label, /display only/);
});

// ======================= spec §8 worked examples =======================
test("A: breakpoint discrepancy, male 70 in, f 0.4 (ΔW 32.76 kg at BMI 30, 9.05 at 25; AdjBW 81.8 / 93.8)", () => {
  const w = A.weights({ sex: "M", heightCm: 70 * IN, tbw: 95 });
  near(w.ibw, 73.0, 1e-9, "IBW");
  near(A.breakpointDeltaW({ bp: 30, heightCm: 70 * IN, ibw: w.ibw }).deltaW, 32.76, 0.01, "bp 30");
  near(A.breakpointDeltaW({ bp: 30, heightCm: 70 * IN, ibw: w.ibw }).wbp, 94.84, 0.01, "W_bp 30");
  near(A.breakpointDeltaW({ bp: 25, heightCm: 70 * IN, ibw: w.ibw }).deltaW, 9.05, 0.01, "bp 25");
  near(w.adjbw, 81.8, 1e-9, "AdjBW(95)");
  near(A.weights({ sex: "M", heightCm: 70 * IN, tbw: 125 }).adjbw, 93.8, 1e-9, "AdjBW(125)");
  // f = 0.3 generalisation: ΔW = (W_bp − IBW)·(1/f − 1)
  near(A.breakpointDeltaW({ bp: 30, heightCm: 70 * IN, ibw: 73, adjFactor: 0.3 }).deltaW, (94.84 - 73) * (1 / 0.3 - 1), 0.02);
});

test("B (site): HSE, 120 kg → AdjBW 91.8, 918 → 925 mg q8h, 2775 mg/day, 250 mL, 3.70 mg/mL, 2 h at 125 mL/h, urine 138 mL/h", () => {
  const r = site({});
  assert.ok(r.ok);
  near(r.w.bmi, 37.96, 0.01, "BMI");
  assert.equal(r.dw.basis, "AdjBW");
  near(r.dw.weight, 91.8, 1e-9);
  near(r.exact, 918, 1e-9);
  assert.equal(r.dose, 925);
  assert.equal(r.tau, 8);
  assert.equal(r.daily, 2775);
  assert.equal(r.volume, 250);
  near(r.conc, 3.70, 0.005);
  assert.equal(r.infusionH, 2);
  near(r.rateMlH, 125, 1e-9);
  assert.equal(Math.round(r.urineTarget), 138);
  assert.equal(r.days, "10 days", "site HSE duration = label 10 d");
});

test("B (site): IBW policy 730 → 725 mg; TBW policy 1200 mg with a hard BMI > 30 warning", () => {
  const i = site({ weightPolicy: "ibw" });
  near(i.exact, 730, 1e-9); assert.equal(i.dose, 725);
  const t = site({ weightPolicy: "tbw" });
  near(t.exact, 1200, 1e-9); assert.equal(t.dose, 1200);
  assert.equal(lvl(t, "tbwObese"), "crit");
  assert.ok(has(t, "dose1000") && has(t, "daily3000"));
});

test("C (site): female 64 in, 60 kg, CrCl 40, mucocutaneous HSV → IBW 54.7, AdjBW 56.8, 284 mg → 275 q12h; BMI-30 breakpoint → 300 q12h", () => {
  const p = { indication: "hsvImm", sex: "F", heightCm: 64 * IN, tbw: 60, crcl: 40 };
  const r = site(p);
  near(r.w.ibw, 54.7, 1e-9); near(r.w.bmi, 22.7, 0.01); near(r.w.adjbw, 56.82, 1e-9);
  near(r.exact, 284.1, 0.01);
  assert.equal(r.dose, 275, "nearest 25 mg");
  assert.equal(r.tau, 12);
  assert.equal(r.reg.band, "25–50");
  const b = site({ ...p, weightPolicy: "bmiBpAdjTbw", bp: 30 });
  assert.equal(b.dw.basis, "TBW"); assert.equal(b.dose, 300); assert.equal(b.tau, 12);
  assert.ok(has(b, "breakpoint"), "non-monotonic breakpoint warning at bp 30");
  assert.ok(!has(site({ ...p, weightPolicy: "bmiBpAdjTbw", bp: 25 }), "breakpoint"), "bp 25 is the site's recommended breakpoint");
});

test("D (site): VZV, male 72 in, 80 kg, CrCl 8 → AdjBW 78.6, 786 × 50% = 393 mg q24h", () => {
  const r = site({ indication: "vzvImm", heightCm: 72 * IN, tbw: 80, crcl: 8 });
  near(r.w.ibw, 77.6, 1e-9); near(r.dw.weight, 78.56, 1e-9);
  near(r.exact, 392.8, 0.5, "spec 393");
  assert.equal(r.reg.pct, 0.5); assert.equal(r.tau, 24);
  assert.equal(r.dose, 400, "rounded to nearest 25 mg");
  assert.ok(has(r, "neuro") && lvl(r, "neuro") === "warn", "renal impairment → neurotoxicity warning");
});

test("E: Blum CL at CrCl 100, BSA 1.73 = 21.94 L/h; Vss 48 L → k 0.457, t½ 1.52 h; Spector 16.62, Fletcher 20.72", () => {
  near(A.clBlum(100), 21.942, 1e-9);
  const e = A.predictExposure({ crcl: 100, bsa: 1.73, dose: 500, tau: 8, tinf: 1, weight: 70, V: 48 });
  near(e.CL, 21.94, 0.005); near(e.k, 0.457, 0.0005); near(e.thalf, 1.52, 0.005);
  near(e.clSpector, 16.62, 0.005); near(e.clFletcher, 20.72, 0.005);
  // Label anuric CL 29 mL/min/1.73 m² ≈ Blum intercept (lit A11), and CrCl ≈ 88 gives 327 mL/min/1.73 m²
  near((A.clBlum(0) * 1000) / 60, 29, 0.5);
  near((A.clBlum(88) * 1000) / 60, 327, 2.5, "lit A11 (≈ 88 mL/min)");
});

test("F: continuous infusion 30 mg/kg/day × 70 kg = 87.5 mg/h; Spector CL at CrCl 100 → Css 5.26 mg/L", () => {
  near(A.continuousCss((30 * 70) / 24, A.clSpector(100)), 5.26, 0.005);
});

// ======================= literature mode (approved sign-off decisions, DECISIONS.md 2026-10-23) =======================
const bsaB = PK.body.bsa(120, 70 * IN);
test("literature default: HSE 120 kg male (BMI 38) → AdjBW 91.8 kg, 925 mg q8h, 1 h, 250 mL, 14–21 days; label IBW statement shown", () => {
  const r = lit({});
  assert.equal(r.policy, "adjObese");
  assert.equal(r.dw.basis, "AdjBW"); near(r.dw.weight, 91.8, 1e-9);
  assert.equal(r.dose, 925); assert.equal(r.tau, 8); assert.equal(r.daily, 2775);
  assert.equal(r.infusionH, 1); assert.equal(r.volume, 250, "925 mg in 100 mL = 9.25 mg/mL > 7");
  near(r.rateMlH, 250, 1e-9);
  assert.equal(r.days, "14–21 days"); assert.equal(r.daysSrc, "idsa"); assert.match(r.footnote, /10 days/);
  assert.equal(lvl(r, "obeseLabel"), "info"); assert.match(r.alerts.find((a) => a.code === "obeseLabel").text, /ideal body weight/);
  assert.ok(!has(r, "tbwObese"));
  assert.match(r.order, /^Acyclovir 925 mg IV q8h/);
  assert.match(r.order, /250 mL NS or D5W \(3\.70 mg\/mL\)/);
  assert.match(r.order, /Duration: 14–21 days/);
  assert.match(r.order, /mL\/min\/1\.73 m² \(absolute 90 mL\/min\)/);
});

test("literature: one-click IBW (label) policy gives 725 mg for the same patient", () => {
  const r = lit({ weightPolicy: "ibw" });
  assert.equal(r.dw.basis, "IBW"); assert.equal(r.dose, 725);
});

test("literature obesity trigger: TBW > 1.2 × IBW (BMI < 30) → AdjBW; ≤ 1.2 × IBW → TBW; never TBW when obese", () => {
  const a = lit({ tbw: 90, indication: "hsvImm" }); // 123% IBW, BMI 28.5
  assert.ok(a.w.bmi < 30); assert.equal(a.dw.basis, "AdjBW"); near(a.dw.weight, 73 + 0.4 * 17, 1e-9);
  const b = lit({ tbw: 85, indication: "hsvImm" }); // 116% IBW, BMI 26.9
  assert.equal(b.dw.basis, "TBW"); assert.equal(b.dose, 425);
  assert.ok(!has(b, "obeseLabel"));
  assert.equal(lvl(lit({ tbw: 92, weightPolicy: "tbw" }), "tbwObese"), "crit", "126% IBW on TBW is critical even with BMI < 30");
  const w = A.weights({ sex: "M", heightCm: 70 * IN, tbw: 120 });
  assert.equal(A.dosingWeight("adjObese", w).basis, "AdjBW");
});

test("literature: non-obese patient below IBW is dosed on TBW; label smallest bag at 100 mL", () => {
  const r = lit({ indication: "hsvImm", tbw: 60 });
  assert.equal(r.dw.basis, "TBW"); assert.equal(r.dose, 300); assert.equal(r.volume, 100); near(r.conc, 3, 1e-9);
});

// Label bands on absolute CrCl (option kept): exact edges.
const bandCases = [
  [120, 8, 1, "> 50"], [51, 8, 1, "> 50"], [50, 12, 1, "25–50"], [40, 12, 1, "25–50"], [25, 12, 1, "25–50"],
  [24.9, 24, 1, "10–<25"], [15, 24, 1, "10–<25"], [10, 24, 1, "10–<25"], [9.9, 24, 0.5, "< 10"], [0, 24, 0.5, "< 10"],
];
for (const [crcl, tau, pct, band] of bandCases) {
  test(`literature renal band (absolute option): CrCl ${crcl} → ${pct * 100}% q${tau}h (${band})`, () => {
    const r = lit({ crcl, tbw: 73, bandBasis: "absolute" });
    assert.equal(r.tau, tau); assert.equal(r.reg.pct, pct); assert.equal(r.reg.band, band);
    near(r.exact, 730 * pct, 1e-9);
    assert.equal(r.dose, pct === 1 ? 725 : 375);
  });
}

// Default: bands on CrCl normalised per 1.73 m². Entered absolute CrCl chosen so the normalised value sits just inside each band.
const bsa73 = PK.body.bsa(73, 70 * IN);
for (const [c173, tau, pct, band] of [[50.5, 8, 1, "> 50"], [49.5, 12, 1, "25–50"], [25.5, 12, 1, "25–50"], [24.5, 24, 1, "10–<25"], [10.5, 24, 1, "10–<25"], [9.5, 24, 0.5, "< 10"]]) {
  test(`literature renal band (default, per 1.73 m²): CrCl ${c173} mL/min/1.73 m² → ${pct * 100}% q${tau}h`, () => {
    const r = lit({ crcl: (c173 * bsa73) / 1.73, tbw: 73 });
    assert.equal(r.bandBasis, "per173");
    near(r.crcl173, c173, 1e-9); near(r.crclBand, c173, 1e-9);
    assert.equal(r.tau, tau); assert.equal(r.reg.pct, pct); assert.equal(r.reg.band, band);
  });
}

test("literature: CrCl from SCr uses PK.renal.cockcroftGault (literature preset) unchanged", () => {
  const p = { crclMode: "cg", crcl: NaN, age: 60, scr: 1.0, tbw: 80 };
  const r = lit(p);
  const cg = PK.renal.cockcroftGault({ age: 60, sex: "M", scr: 1.0, tbw: 80, heightCm: 70 * IN, preset: "literature" });
  near(r.crcl, cg.crcl, 1e-12); near(r.crcl, (80 * 73) / 72, 1e-9, "min(IBW, TBW) = IBW 73");
  near(r.crcl173, PK.renal.normalizeTo173(cg.crcl, PK.body.bsa(80, 70 * IN)), 1e-12);
  assert.equal(r.crclSource, "cockcroftGault");
  const s = site(p);
  near(s.crcl, PK.renal.cockcroftGault({ age: 60, sex: "M", scr: 1.0, tbw: 80, heightCm: 70 * IN, preset: "site" }).crcl, 1e-12);
  assert.equal(lit({ crclMode: "cg", crcl: NaN, age: NaN, scr: NaN }).ok, false, "needs SCr and age, or CrCl");
});

test("literature: large patient, CrCl 55 mL/min → 39.6 per 1.73 m² → q12h, with bands-differ warning; absolute option gives q8h", () => {
  const n = lit({ crcl: 55 });
  near(n.crcl173, (55 * 1.73) / bsaB, 1e-9);
  assert.ok(n.crcl173 < 50); assert.equal(n.tau, 12);
  assert.equal(n.bandAbs, "> 50"); assert.equal(n.band173, "25–50"); assert.ok(n.bandsDiffer);
  assert.equal(lvl(n, "bandsDiffer"), "warn");
  assert.match(n.order, /bands differ/);
  const abs = lit({ crcl: 55, bandBasis: "absolute" });
  assert.equal(abs.tau, 8); assert.ok(has(abs, "bandsDiffer"), "warning shown whichever basis is used");
  assert.ok(!has(lit({ crcl: 120 }), "bandsDiffer"));
});

test("dialysis (literature): IHD 2.5–5 mg/kg q24h after HD — HSE 5 mg/kg, 5 mg/kg indications 2.5 mg/kg; anuric exposure", () => {
  const r = lit({ dialysis: "hd", crcl: NaN });
  assert.ok(r.ok);
  assert.equal(r.reg.pct, 1); assert.equal(r.tau, 24); assert.ok(r.reg.postHD); assert.equal(r.reg.src, "hdLit");
  assert.equal(r.mgkg, 5); near(r.exact, 459, 1e-9); assert.equal(r.dose, 450);
  assert.match(r.order, /q24h \(on dialysis days give after HD\)/);
  assert.ok(has(r, "hd"));
  assert.ok(r.exposure.available && r.exposure.anuric);
  near(r.exposure.CL, (1.722 * r.w.bsa) / 1.73, 1e-9, "interdialytic CL = Blum intercept");
  const g = lit({ dialysis: "hd", crcl: NaN, indication: "genital", tbw: 73 });
  assert.equal(g.mgkg, 2.5); near(g.exact, 182.5, 1e-9);
  assert.equal(lit({ dialysis: "hd", crcl: NaN, indication: "vzvEnc", customMgkg: 15 }).mgkg, 5, "capped at 5 mg/kg");
});

test("dialysis (literature): PD → 50% q24h, no supplement", () => {
  const r = lit({ dialysis: "pd", crcl: NaN, indication: "hsvImm" });
  assert.equal(r.reg.pct, 0.5); assert.equal(r.tau, 24); assert.ok(!r.reg.postHD);
  near(r.exact, 229.5, 1e-9); assert.equal(r.dose, 225);
});

test("dialysis (literature): CRRT 10 mg/kg q12h for CNS/VZV/severe, else 5–7.5 mg/kg q24h; verify badge; no exposure", () => {
  const r = lit({ dialysis: "crrt", crcl: 20 });
  assert.ok(r.severe); assert.equal(r.mgkg, 10); assert.equal(r.tau, 12); assert.equal(r.dose, 925);
  assert.equal(lvl(r, "crrt"), "warn"); assert.equal(r.reg.src, "crrtLit"); assert.equal(A.SRC.crrtLit.verify, true);
  assert.equal(r.exposure.available, false);
  assert.equal(lit({ dialysis: "crrt", crcl: 20, indication: "vzvEnc", customMgkg: 15 }).mgkg, 10, "VZV encephalitis 15 → 10 on CRRT");
  const z = lit({ dialysis: "crrt", crcl: 20, indication: "vzvImm" });
  assert.equal(z.mgkg, 10); assert.equal(z.tau, 12);
  const h = lit({ dialysis: "crrt", crcl: 20, indication: "hsvImm" });
  assert.ok(!h.severe); assert.equal(h.mgkg, 5); assert.equal(h.tau, 24); near(h.exact, 459, 1e-9); assert.equal(h.dose, 450);
  const c = lit({ dialysis: "crrt", crcl: 20, indication: "custom", customMgkg: 10 });
  assert.equal(c.mgkg, 7.5); assert.equal(c.tau, 24);
  const s = lit({ dialysis: "crrt", crcl: 20, indication: "hsvImm", r_severe: true });
  assert.equal(s.mgkg, 10); assert.equal(s.tau, 12);
});

test("dialysis (site, unchanged): HD 50% q24h; CRRT indication mg/kg (max 10) q12h", () => {
  const h = site({ dialysis: "hd", crcl: NaN });
  assert.equal(h.reg.pct, 0.5); assert.equal(h.tau, 24); assert.equal(h.mgkg, 10); near(h.exact, 459, 1e-9);
  const c = site({ dialysis: "crrt", crcl: 20, indication: "hsvImm" });
  assert.equal(c.tau, 12); assert.equal(c.mgkg, 5); assert.equal(c.reg.src, "crrt");
  assert.equal(site({ dialysis: "crrt", crcl: 20, indication: "vzvEnc", customMgkg: 15 }).mgkg, 10);
});

test("obesity policies: label-obese, %IBW, Toledo, UW and BMI-30 rules", () => {
  const w = A.weights({ sex: "M", heightCm: 70 * IN, tbw: 120 }); // BMI 38, 164% IBW
  assert.equal(A.dosingWeight("labelObese", w).basis, "IBW");
  assert.equal(A.dosingWeight("pct120", w).basis, "AdjBW");
  assert.equal(A.dosingWeight("toledo", w).basis, "IBW", "130–190% IBW → IBW");
  assert.equal(A.dosingWeight("bmi30AdjIbw", w).basis, "AdjBW");
  assert.equal(A.dosingWeight("uw", w, { lifeThreatening: true }).basis, "IBW", "BMI 38 < 40");
  const big = A.weights({ sex: "M", heightCm: 70 * IN, tbw: 150 }); // BMI 47, 205% IBW
  assert.equal(A.dosingWeight("uw", big, { lifeThreatening: true }).basis, "AdjBW");
  assert.equal(A.dosingWeight("uw", big, { lifeThreatening: false }).basis, "IBW");
  assert.equal(A.dosingWeight("toledo", big).basis, "AdjBW");
  const lean = A.weights({ sex: "M", heightCm: 70 * IN, tbw: 70 });
  for (const k of Object.keys(A.WEIGHT_POLICIES)) assert.equal(A.dosingWeight(k, lean).weight, 70, `${k}: TBW below IBW → TBW`);
  assert.throws(() => A.dosingWeight("nope", lean));
});

test("obesity: literature 150 kg HSE → AdjBW 103.8 kg, 1050 mg (IBW option 725); TBW critical; AdjBW 0.3 factor honoured", () => {
  const r = lit({ tbw: 150 });
  near(r.dw.weight, 103.8, 1e-9); assert.equal(r.dose, 1050); assert.ok(has(r, "dose1000"));
  assert.equal(lit({ tbw: 150, weightPolicy: "ibw" }).dose, 725);
  assert.equal(lvl(lit({ tbw: 150, weightPolicy: "tbw" }), "tbwObese"), "crit");
  const a = lit({ tbw: 150, adjFactor: 0.3 });
  near(a.dw.weight, 73 + 0.3 * 77, 1e-9);
});

test("max dose: custom 25 mg/kg capped to label 20 mg/kg q8h; rounding never exceeds the cap", () => {
  const r = lit({ indication: "custom", customMgkg: 25, tbw: 73 });
  assert.equal(r.mgkg, 20); assert.equal(lvl(r, "capMgkg"), "crit");
  near(r.exact, 1460, 1e-9); assert.equal(r.dose, 1450);
  assert.ok(has(r, "soft15") && has(r, "dose1000"));
  const c = lit({ indication: "custom", customMgkg: 20, tbw: 71.2 }); // 1424 → 1425 would exceed 1424
  assert.equal(c.dose, 1400); assert.ok(c.dose <= 20 * 71.2);
  assert.equal(lit({ indication: "custom", customMgkg: NaN }).ok, false);
});

test("concentration: forced 100 mL bag for 725 mg is critical (> 7 mg/mL); 600 mg in 100 mL warns (> 5 mg/mL)", () => {
  assert.equal(lvl(lit({ volume: 100 }), "conc7"), "crit");
  const r = lit({ indication: "custom", customMgkg: 10, tbw: 60, volume: 100 });
  assert.equal(r.dose, 600); assert.equal(lvl(r, "conc5"), "warn"); assert.ok(!has(r, "conc7"));
  assert.deepEqual(A.chooseVolume(1500, 20, "label"), { volume: 250, rule: "label" });
  assert.equal(A.chooseVolume(400, 5, "site").volume, 100);
  assert.equal(A.chooseVolume(400, 10, "site").volume, 250, "site: 250 mL for 10 mg/kg");
  assert.equal(A.chooseVolume(600, 5, "site").volume, 250, "site: 250 mL for > 500 mg");
});

test("infusion time: literature 1 h (label), site 2 h; override honoured", () => {
  assert.equal(lit({}).infusionH, 1);
  assert.equal(site({}).infusionH, 2);
  const r = lit({ infusionH: 2 });
  assert.equal(r.infusionH, 2); near(r.rateMlH, 125, 1e-9);
});

test("predicted exposure in the result uses Blum CL × BSA/1.73 and Vd 0.6 L/kg × dosing weight", () => {
  const r = lit({ tbw: 73, crcl: 100 });
  const e = r.exposure, bsa = PK.body.bsa(73, 70 * IN);
  near(e.CL, A.clBlum((100 * 1.73) / bsa) * (bsa / 1.73), 1e-9);
  near(e.V, 0.6 * 73, 1e-9);
  const ss = PK.one.ss({ dose: 725, tau: 8, tinf: 1 }, { CL: e.CL, V: e.V });
  near(e.cmax, ss.cmax, 1e-9); near(e.cmin, ss.cmin, 1e-9); near(e.auc24, ss.auc24, 1e-9);
  near(e.cmaxUmol, e.cmax / 0.22521, 1e-6, "1 µmol/L = 0.225 mg/L");
});

test("warnings: pediatric, short stature, AKI, risk factors, TTP/HUS, PCR note", () => {
  assert.equal(lvl(lit({ age: 15 }), "age"), "crit");
  const s = lit({ sex: "F", heightCm: 140, tbw: 50 });
  assert.ok(has(s, "short"));
  assert.equal(lvl(lit({ r_aki: true }), "aki"), "crit");
  const n = lit({ r_vanco: true, r_nsaid: true });
  assert.equal(lvl(n, "nephro"), "warn");
  assert.match(n.alerts.find((a) => a.code === "nephro").text, /vancomycin.*NSAID/);
  assert.ok(has(lit({ indication: "hsvImm" }), "ttp"));
  assert.ok(has(lit({}), "pcr") && has(lit({}), "hydration"));
  assert.equal(lvl(lit({ tbw: 70, crcl: 100, age: 40 }), "neuro"), "info");
  assert.equal(lvl(lit({ tbw: 70, crcl: 100, age: 70 }), "neuro"), "warn");
});

test("VZV encephalitis: 10 mg/kg default, clinician 10–15 accepted, outside range warned", () => {
  const d = lit({ indication: "vzvEnc", tbw: 73 });
  assert.equal(d.mgkg, 10); assert.equal(d.days, "10–14 days");
  assert.equal(lit({ indication: "vzvEnc", customMgkg: 15, tbw: 73 }).dose, 1100);
  assert.ok(has(lit({ indication: "vzvEnc", customMgkg: 18, tbw: 73 }), "outOfRange"));
});

test("site vs literature on the same patient differ only by documented model choices", () => {
  const l = lit({}), s = site({});
  assert.equal(l.dose, s.dose, "obese 120 kg: both AdjBW 0.4");
  const lean = { tbw: 80 }; // 110% IBW: literature TBW, site AdjBW
  assert.equal(lit(lean).dw.basis, "TBW"); assert.equal(site(lean).dw.basis, "AdjBW");
  assert.notEqual(l.infusionH, s.infusionH);
  assert.notEqual(l.days, s.days);
  assert.notEqual(l.bandBasis, s.bandBasis);
  assert.equal(l.reg.band, s.reg.band, "same label renal table");
  assert.equal(l.capDose / l.dw.weight, 20);
  assert.match(s.order, /Model: Site/);
});

// ======================= site workbook oracles (dosing per body weight acyclovir web.xlsx, cached values, 2026-10-23) =======================
// Hard-coded from the workbook dump (workbook-checks/acyclovir-engine-coverage.md part A); the tests never read site-mirror.
const W70 = { sex: "M", heightCm: 70 * IN };
const bsa70 = PK.body.bsa(70, 70 * IN);

test("workbook BMIRelatedDosing: male 70 in, 10 mg/kg, bp 25 — IBW, AdjBW, BMI, doses by AdjBW and by 'AdjBW if BMI > 25 else TBW'; ΔW 9.04815", () => {
  // [TBW, IBW, AdjBW, BMI, dose AdjBW (mg), dose breakpoint 25 (mg)]
  for (const [W, ibw, adj, bmi, dAdj, dBp] of [[73, 73, 73, 23.091883, 730, 730], [79, 73, 75.4, 24.989846, 754, 790], [80, 73, 75.8, 25.306173, 758, 758],
    [100, 73, 83.8, 31.632716, 838, 838], [125, 73, 93.8, 39.540895, 938, 938]]) {
    const w = A.weights({ ...W70, tbw: W });
    near(w.ibw, ibw, 1e-9, `IBW ${W}`); near(w.adjbw, adj, 1e-9, `AdjBW ${W}`); near(w.bmi, bmi, 1e-5, `BMI ${W}`);
    near(10 * A.dosingWeight("adjIfOver", w).weight, dAdj, 1e-9, `AdjBW dose ${W}`);
    near(10 * A.dosingWeight("bmiBpAdjTbw", w, { bp: 25 }).weight, dBp, 1e-9, `bp 25 dose ${W}`);
  }
  near(A.breakpointDeltaW({ bp: 25, heightCm: 70 * IN, ibw: 73 }).deltaW, 9.04815, 1e-9, "C17");
});

test("workbook Blum individual patient (site model): 70 kg, 70 in, 70 y, SCr 1, 700 mg q8h over 1 h → V 51.871, k 0.30116, Cmax 12.803, Cmin 1.5551", () => {
  near(bsa70, 1.8695346, 1e-6, "BSA");
  const cg = PK.renal.cockcroftGault({ age: 70, sex: "M", scr: 1, tbw: 70, heightCm: 70 * IN, preset: "site" });
  near(cg.crcl, 68.055556, 1e-5, "CrCl mL/min"); near(PK.renal.normalizeTo173(cg.crcl, bsa70), 62.97616, 1e-5, "CrCl/1.73");
  const e = A.predictExposure({ crcl: cg.crcl, bsa: bsa70, dose: 700, tau: 8, tinf: 1, weight: 70, vdModel: "blum48" });
  near(e.CL, 15.621723, 1e-5); near(e.V, 51.871481, 1e-5); near(e.k, 0.30116207, 1e-7);
  near(e.thalf, 2.3010866, 2e-3, "workbook uses 0.693/k");
  near(e.cmax, 12.803052, 1e-5); near(e.cmin, 1.5551143, 1e-6);
  near(e.auc24TrapLog, 133.58261, 1e-4); near(e.auc24, 134.4282, 1e-4); near(e.cssContinuous, 5.6011748, 1e-6);
  near(e.urine.continuous, 0.7875, 1e-9, "G26 continuous urine mg/mL");
  near(e.urine.hour1, 1.55, 0.005, "first post-infusion hour"); near(e.urine.duringInfusion, 1.05, 0.005); near(e.urine.peak, 1.80, 0.005);
  assert.ok(e.urine.over && !e.urine.continuousOver, "intermittent above 1.3 mg/mL, continuous below");
  // Same patient through calc(): site model uses V = 48·BSA/1.73; literature keeps 0.6 L/kg × dosing weight (V 42 L).
  const p = { indication: "custom", customMgkg: 10, age: 70, sex: "M", heightCm: 70 * IN, tbw: 70, crclMode: "cg", crcl: NaN, scr: 1, dialysis: "none", infusionH: 1, bandBasis: "per173" };
  const s = A.calc({ ...p, model: "site" });
  assert.equal(s.vdModel, "blum48"); assert.equal(s.dose, 700); assert.equal(s.tau, 8);
  near(s.exposure.V, 51.871481, 1e-5); near(s.exposure.cmax, 12.803052, 1e-5);
  assert.ok(has(s, "urineSol"), "urine solubility warning");
  const l = A.calc({ ...p, model: "literature" });
  assert.equal(l.vdModel, "perKg"); near(l.exposure.V, 42, 1e-9); near(l.exposure.cmax, 14.666, 0.001);
  near(l.exposure.vBlum48, 51.871481, 1e-5, "48 L/1.73 m² shown as the alternative");
  near(A.calc({ ...p, model: "literature", vdModel: "blum48" }).exposure.cmax, 12.803052, 1e-5, "selectable in literature");
});

// Package-insert grid: [CrCl/1.73, tau, mg/kg, CL, Cmax, Cmin, AUC/day trap-log, Css continuous, urine first hour (mg/mL)]; 70 kg, 70 in, 1 h infusion, fe 0.9, 100 mL/h.
const GRID = [
  [120, 8, 10, 28.081923, 10.559729, 0.23869293, 73.391092, 3.1158835, 2.0608896], [110, 8, 10, 25.896837, 10.822723, 0.32853821, 79.786588, 3.378791, 1.9857109],
  [100, 8, 10, 23.711751, 11.118264, 0.45326158, 87.349098, 3.6901535, 1.9043835], [90, 8, 10, 21.526665, 11.459276, 0.62738148, 96.432835, 4.0647263, 1.817073],
  [80, 8, 10, 19.341579, 11.865418, 0.87240901, 107.552, 4.5239327, 1.724097], [70, 8, 10, 17.156492, 12.367426, 1.2211782, 121.48266, 5.1001101, 1.6259481],
  [60, 8, 10, 14.971406, 13.015196, 1.7258895, 139.45392, 5.8444744, 1.5233093], [50, 12, 10, 12.78632, 12.615306, 0.83812407, 109.00866, 4.5621675, 1.286643],
  [40, 12, 10, 10.601234, 13.35477, 1.4102241, 131.65352, 5.5025041, 1.1524218], [30, 12, 10, 8.4161478, 14.53053, 2.4387899, 166.02005, 6.9311204, 1.0159713],
  [20, 24, 10, 6.2310617, 13.469712, 0.85007442, 112.21411, 4.6808503, 0.71176913], [10, 24, 5, 4.0459755, 7.6709128, 1.2756242, 86.464148, 3.6044047, 0.26871098],
  [5, 24, 5, 2.9534325, 8.8039331, 2.3765172, 118.47569, 4.9377575, 0.2274789], [0, 24, 5, 1.8608894, 11.481547, 5.0309868, 188.06282, 7.8367545, null],
];
for (const [c173, tau, mgkg, CL, cmax, cmin, aucTL, css, uH1] of GRID) {
  test(`workbook PI grid (site model): CrCl ${c173}/1.73 m² → ${mgkg} mg/kg q${tau}h; CL ${CL}, Cmax ${cmax}, Cmin ${cmin}, AUC ${aucTL}, Css ${css}`, () => {
    const reg = A.renalRegimen(c173, "none", { boundary: "workbook" });
    assert.equal(reg.tau, tau); assert.equal(reg.pct * 10, mgkg, "site band reproduces the workbook regimen");
    const e = A.predictExposure({ crcl: (c173 * bsa70) / 1.73, bsa: bsa70, dose: mgkg * 70, tau, tinf: 1, weight: 70, vdModel: "blum48" });
    const rel = (a, b, m) => assert.ok(Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)), `${m}: expected ${b}, got ${a}`);
    rel(e.CL, CL, "CL"); rel(e.cmax, cmax, "Cmax"); rel(e.cmin, cmin, "Cmin"); rel(e.auc24TrapLog, aucTL, "AUC trap-log"); rel(e.cssContinuous, css, "Css");
    if (uH1 !== null) rel(e.urine.hour1, uH1, "urine first hour");
  });
}

test("CrCl exactly 10: site follows the workbook (50% q24h, band ≤ 10); literature keeps 100% q24h with a band-boundary note", () => {
  assert.equal(A.renalRegimen(10, "none", { boundary: "workbook" }).pct, 0.5);
  assert.equal(A.renalRegimen(10, "none", { boundary: "workbook" }).band, "≤ 10");
  assert.equal(A.renalRegimen(10, "none", { boundary: "workbook" }).src, "wb10");
  assert.equal(A.renalRegimen(10.01, "none", { boundary: "workbook" }).pct, 1);
  assert.equal(A.renalRegimen(10).pct, 1, "label default unchanged");
  const s = site({ crcl: 10, tbw: 73 }), l = lit({ crcl: 10, tbw: 73, bandBasis: "absolute" });
  assert.equal(s.reg.pct, 0.5); assert.equal(s.dose, 375); assert.ok(has(s, "bandBoundary"));
  assert.equal(l.reg.pct, 1); assert.equal(l.dose, 725); assert.equal(lvl(l, "bandBoundary"), "info");
  assert.ok(!has(lit({ crcl: 20, tbw: 73, bandBasis: "absolute" }), "bandBoundary"));
  assert.ok(!has(site({ crcl: 8, tbw: 73 }), "bandBoundary"));
});

test("urine concentration: no prediction on HD/PD; continuous comparison and flow input honoured; Spector/Fletcher labelled as Pierce's fits", () => {
  assert.equal(lit({ dialysis: "hd", crcl: NaN }).exposure.urine, null);
  const a = site({ urineFlow: 200 }), b = site({});
  near(a.exposure.urine.hour1 * 2, b.exposure.urine.hour1, 1e-9);
  near(b.exposure.urine.continuous, (0.9 * b.daily) / 24 / 100, 1e-12);
  near(site({ fe: 0.6 }).exposure.urine.continuous, (0.6 * b.daily) / 24 / 100, 1e-12);
  assert.match(A.SRC.spector.label, /Pierce's own fit/); assert.match(A.SRC.fletcher.label, /Pierce's own fit/);
  assert.equal(A.SRC.vss48.verify, true);
});

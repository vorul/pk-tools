// pkcore.js: shared calculation library for the PK Suite.
// Classic script, no DOM. Sets globalThis.PK, and module.exports = PK under node.
// Source of truth: pk-suite/specs/*.md (core-equations, crcl, bayesian-engine, two-comp-auc, vanco-bayesian).
// Units (internal): time h, concentration mg/L (= mcg/mL), CL L/h, V L, dose mg, weight kg, height in or cm (named), SCr mg/dL.
// Every exported function returns UNROUNDED numbers. Rounding for display lives in PK.round only.
(function (root) {
  "use strict";

  // ---------- Shared numerics ----------
  const exp = Math.exp, ln = Math.log;
  // 1 − e^(−x) without cancellation for small x (k·T' or k·tau near 0).
  const omexp = (x) => -Math.expm1(-x);
  const isNum = (x) => typeof x === "number" && isFinite(x);
  const LN2_SITE = 0.693; // the site uses 0.693, not ln 2 (core-equations §7.10)

  // Resolve a one-compartment parameter object: any two of {V, CL, k} give the third.
  function p1(p) {
    let { V, CL, k } = p;
    if (!isNum(k) && isNum(CL) && isNum(V)) k = CL / V;
    if (!isNum(CL) && isNum(k) && isNum(V)) CL = k * V;
    if (!isNum(V) && isNum(k) && isNum(CL)) V = CL / k;
    return { V, CL, k };
  }
  const sfOf = (o) => (o && isNum(o.S) ? o.S : 1) * (o && isNum(o.F) ? o.F : 1);

  // Provenance tags. UI shows a "verify" badge when verify is true.
  const sources = {
    devine: { label: "Devine IBW", ref: "core-equations §2.14", verify: false },
    adjbw: { label: "Adjusted BW = IBW + 0.4·(TBW − IBW)", ref: "core-equations §2.14", verify: false },
    janmahasatian: { label: "Janmahasatian FFM (corrected constants 6680 / 8780 + 244·BMI)", ref: "core-equations §7.2; site typo corrected", verify: false },
    dubois: { label: "DuBois BSA", ref: "core-equations §2.14", verify: false },
    mosteller: { label: "Mosteller BSA", ref: "not on site", verify: true },
    peck: { label: "Peck LBW (pediatric / height < 48 in)", ref: "vanco-bayesian §2.1", verify: false },
    cockcroftGault: { label: "Cockcroft-Gault, (140 − age)·Wt/(72·SCr), ×0.85 F", ref: "crcl §4.2", verify: false },
    obesityThreshold: { label: "Obese if TBW > 1.2 × IBW (Winter 2012, Leader 1994; site states no threshold)", ref: "lit/aminoglycosides-renal.md; crcl §9.2", verify: false },
    scrFloor: { label: "SCr floor off by default; optional 0.7 / 0.8 mg/dL (0.5 spinal cord injury)", ref: "lit/aminoglycosides-renal.md; crcl §4.2", verify: false },
    chow: { label: "Chow iterative non-steady-state CrCl (dimensionally corrected)", ref: "crcl §4.4, §9.8", verify: false },
    ashp: { label: "ASHP / Jelliffe-type non-steady-state CrCl (ΔT in days)", ref: "crcl §4.5", verify: true },
    winter: { label: "Winter mass-balance CrCl (dimensionally corrected)", ref: "crcl §4.6", verify: true },
    schwartz: { label: "Schwartz pediatric CrCl", ref: "core-equations §2.15", verify: false },
    oneComp: { label: "One-compartment intermittent-infusion equations", ref: "core-equations §2.7–2.12", verify: false },
    sawchukZaske: { label: "Sawchuk-Zaske steady-state peak/trough", ref: "core-equations §2.12", verify: false },
    aucDose: { label: "AUC24 = S·F·Dose/CL · 24/tau", ref: "core-equations §2.10", verify: false },
    aucTrapLog: { label: "AUC24 linear-up / log-down trapezoid", ref: "core-equations §2.10", verify: false },
    twoComp: { label: "Two-compartment infusion (Goti structure)", ref: "two-comp-auc §4", verify: false },
    goti: { label: "Goti 2018 vancomycin covariate structure", ref: "two-comp-auc §3.1; PMID 29470227", verify: true },
    map: { label: "MAP objective Σ((obs−pred)/(CV·obs))² + Σ((θ−μ)/(CV·μ))²", ref: "bayesian-engine §4(c)", verify: false },
    albumin: { label: "Sheiner-Tozer albumin correction (alpha 0.1, normal 4.4 g/dL)", ref: "core-equations §2.4", verify: false },
  };

  // Documented defaults for every policy (ARCHITECTURE: "Policies are explicit options").
  const policies = {
    weightPolicy: "adjIfObese", // CrCl weight: AdjBW if obese, else min(IBW, TBW) (literature default)
    obesityRatio: 1.2,          // obese when TBW > 1.2·IBW (lit/aminoglycosides-renal.md)
    adjFactor: 0.4,
    scrFloor: null,             // OFF by default (literature); pass 0.7 or 0.8 to enable
    scrFloorRound: 0.7,         // used when roundScr: true
    scrFloorSCI: 0.5,
    crclMethod: "cockcroftGault",
    intervals: [6, 8, 12, 16, 24, 36, 48, 72, 96, 120],
    cvAssay: 0.1,
    cvParam: 0.3,
  };

  // =====================================================================
  // PK.body: body size and unit helpers
  // =====================================================================
  const body = {
    LB_PER_KG: 2.2046226,
    CM_PER_IN: 2.54,
    SCR_UMOL_PER_MGDL: 88.4,
    inToCm: (x) => x * 2.54,
    cmToIn: (x) => x / 2.54,
    lbToKg: (x) => x * 0.45359237,  // exact definition of the pound
    kgToLb: (x) => x / 0.45359237,
    scrUmolToMgdl: (x) => x / 88.4,
    scrMgdlToUmol: (x) => x * 88.4,
    // Devine IBW (kg). sex 'M' | 'F'; heightIn in inches. Optional amputation % reduces IBW (crcl §3).
    ibw(sex, heightIn, amputationPct) {
      const w = (sex === "F" ? 45.5 : 50) + 2.3 * (heightIn - 60);
      return amputationPct ? w * (1 - amputationPct / 100) : w;
    },
    // Adjusted body weight: pure formula. Callers decide when it applies (see dosingWeight).
    adjustedBW: (ibw, tbw, factor = 0.4) => ibw + factor * (tbw - ibw),
    bmi: (kg, heightCm) => kg / Math.pow(heightCm / 100, 2),
    // Janmahasatian fat-free mass, corrected constants (the site prints 668 and 8780/(244·BMI)).
    ffm: (sex, tbw, bmi) => (sex === "F" ? (9270 * tbw) / (8780 + 244 * bmi) : (9270 * tbw) / (6680 + 216 * bmi)),
    // BSA m². DuBois default; Mosteller optional (not on site).
    bsa(kg, heightCm, method = "dubois") {
      if (method === "mosteller") return Math.sqrt((kg * heightCm) / 3600);
      return 0.007184 * Math.pow(kg, 0.425) * Math.pow(heightCm, 0.725);
    },
    // Peck LBW in kg for children or height < 48 in (H in inches). Below 22 in, LBW = TBW (vanco-bayesian §2.1).
    // The polynomial gives pounds; the site workbook divides by 2.2, here the exact pound is used (≤ 0.2% apart).
    peckLBW(sex, heightIn, tbw) {
      if (heightIn < 22 && isNum(tbw)) return tbw;
      const H = heightIn;
      const lb = sex === "F"
        ? -77.55796 + 6.93728 * H - 0.171703 * H * H + 0.001726 * H * H * H
        : -59.6035 + 5.2878 * H - 0.123939 * H * H + 0.00128936 * H * H * H;
      return lb * 0.45359237;
    },
    // Dosing weight by explicit policy. Returns { weight, basis, policy, obese, ibw, tbw, adjbw }.
    //   'tbw'          total body weight
    //   'ibw'          Devine IBW
    //   'minIbwTbw'    min(IBW, TBW)                         [site CrCl calculator; digoxin/theophylline "LBW"]
    //   'adjIfObese'   AdjBW if TBW > obesityRatio·IBW, else min(IBW, TBW)   [crcl overview + suite threshold]
    //   'adjIfOver'    AdjBW if TBW > IBW, else TBW          [aminoglycoside dosing weight]
    //   'ffm'          Janmahasatian FFM;  'minFfmTbw'  min(FFM, TBW) [lithium]
    dosingWeight({ policy = policies.weightPolicy, tbw, ibw, ffm, adjFactor = policies.adjFactor, obesityRatio = policies.obesityRatio }) {
      const adjbw = isNum(ibw) ? body.adjustedBW(ibw, tbw, adjFactor) : NaN;
      const obese = isNum(ibw) && tbw > obesityRatio * ibw;
      let weight, basis;
      switch (policy) {
        case "tbw": weight = tbw; basis = "TBW"; break;
        case "ibw": weight = ibw; basis = "IBW"; break;
        case "minIbwTbw": [weight, basis] = tbw < ibw ? [tbw, "TBW"] : [ibw, "IBW"]; break;
        case "adjIfOver": [weight, basis] = tbw > ibw ? [adjbw, "AdjBW"] : [tbw, "TBW"]; break;
        case "ffm": weight = ffm; basis = "FFM"; break;
        case "minFfmTbw": [weight, basis] = tbw < ffm ? [tbw, "TBW"] : [ffm, "FFM"]; break;
        case "adjIfObese":
          if (obese) [weight, basis] = [adjbw, "AdjBW"];
          else [weight, basis] = tbw < ibw ? [tbw, "TBW"] : [ibw, "IBW"];
          break;
        default: throw new Error(`Unknown weight policy: ${policy}`);
      }
      return { weight, basis, policy, obese, ibw, tbw, adjbw };
    },
  };

  // =====================================================================
  // PK.renal: creatinine clearance
  // =====================================================================
  // Amputation % reductions of IBW (crcl §3).
  const AMPUTATION_PCT = { entireUpperLimb: 5.0, aboveElbow: 3.3, belowElbow: 2.3, entireLowerLimb: 16.0, aboveKnee: 8.0, belowKnee: 5.9, foot: 1.5 };
  const sexFactor = (sex) => (sex === "F" ? 0.85 : 1);

  const renal = {
    AMPUTATION_PCT,
    // Bare Cockcroft-Gault (mL/min).
    cgRaw: (age, weight, scr, sex) => ((140 - age) * weight * sexFactor(sex)) / (72 * scr),
    // Cockcroft-Gault with explicit weight policy and SCr floor. Returns the UNROUNDED CrCl plus everything used.
    // opts: { age, sex, scr, tbw, heightIn | heightCm, weightPolicy, obesityRatio, adjFactor,
    //         scrFloor (number | null to disable), sci, amputationPct, weight (explicit override) }
    //         roundScr (true → floor 0.7, or 0.5 with sci), preset ('literature' | 'site') }
    // Explicit options override the preset. Site-parity mode (creatinineclearance.htm) = preset 'site'.
    PRESETS: {
      literature: { weightPolicy: "adjIfObese", obesityRatio: 1.2, scrFloor: null },
      site: { weightPolicy: "minIbwTbw", scrFloor: null },
    },
    cockcroftGault(opts) {
      const o = { ...(opts.preset ? renal.PRESETS[opts.preset] : {}), ...opts };
      const flags = [];
      const heightIn = isNum(o.heightIn) ? o.heightIn : isNum(o.heightCm) ? o.heightCm / 2.54 : NaN;
      const ibw = isNum(heightIn) ? body.ibw(o.sex, heightIn, o.amputationPct) : NaN;
      const policy = o.weightPolicy || policies.weightPolicy;
      let dw;
      if (isNum(o.weight)) dw = { weight: o.weight, basis: "given", policy: "given", obese: false, ibw, tbw: o.tbw, adjbw: NaN };
      else dw = body.dosingWeight({ policy, tbw: o.tbw, ibw, adjFactor: o.adjFactor, obesityRatio: isNum(o.obesityRatio) ? o.obesityRatio : policies.obesityRatio });
      const floor = isNum(o.scrFloor) ? o.scrFloor : o.roundScr ? (o.sci ? policies.scrFloorSCI : policies.scrFloorRound) : policies.scrFloor;
      const scrUsed = floor === null ? o.scr : Math.max(o.scr, floor);
      const scrFloored = scrUsed !== o.scr;
      const crcl = renal.cgRaw(o.age, dw.weight, scrUsed, o.sex);
      if (o.age < 18) flags.push({ code: "age<18", lvl: "crit", text: "Cockcroft-Gault is for adults (18 years and older)." });
      if (scrFloored) flags.push({ code: "scrFloored", lvl: "info", text: `SCr ${o.scr} rounded up to ${floor} mg/dL.` });
      if (dw.obese) flags.push({ code: "obese", lvl: "info", text: `TBW > ${isNum(o.obesityRatio) ? o.obesityRatio : policies.obesityRatio} × IBW: adjusted body weight used (suite policy).` });
      if (isNum(heightIn) && heightIn < 60) flags.push({ code: "short", lvl: "warn", text: "Height under 60 in: Devine IBW is below its base value." });
      if (o.amputationPct) flags.push({ code: "amputation", lvl: "info", text: `IBW reduced ${o.amputationPct}% for amputation.` });
      return { crcl, weight: dw.weight, weightBasis: dw.basis, policy: dw.policy, obese: dw.obese, ibw, adjbw: dw.adjbw, tbw: o.tbw, scrUsed, scrFloored, scrFloor: floor, flags, source: "cockcroftGault" };
    },
    normalizeTo173: (crcl, bsa) => (crcl * 1.73) / bsa,
    // Creatinine production, mg/h: (28 − 0.2·age)·Wt/24, ×0.85 female (crcl §4.3).
    creatinineProduction: (age, weight, sex) => ((28 - 0.2 * age) * weight * sexFactor(sex)) / 24,
    // CrCl (mL/min) from production (mg/h) and SCr (mg/dL): (Rin/60)/(SCr/100) (core-equations §2.15 table).
    crclFromProduction: (prodMgH, scr) => prodMgH / 60 / (scr / 100),
    // Chow iterative non-steady-state CrCl, dimensionally corrected (crcl §4.4):
    //   S2 = S1·e^(−KT) + R/(K·Vd)·(1 − e^(−KT)),  S in mg/L, R mg/h, Vd = vdPerKg·Wt.
    // SCr values are NOT floored here (crcl §4.4 [SUITE]). Solved by bisection on ln K in [1e-6, 5].
    chowNonSteadyState({ age, sex, weight, scr1, scr2, hours, vdPerKg = 0.6 }) {
      const S1 = scr1 * 10, S2 = scr2 * 10, T = hours, Vd = vdPerKg * weight;
      const R = renal.creatinineProduction(age, weight, sex);
      const f = (K) => S1 * exp(-K * T) + (R / (K * Vd)) * omexp(K * T) - S2;
      let lo = 1e-6, hi = 5, flo = f(lo), fhi = f(hi);
      const out = { crcl: NaN, k: NaN, vd: Vd, prodMgH: R, converged: false, flags: [], source: "chow" };
      if (!(T > 0)) { out.flags.push({ code: "badInterval", lvl: "crit", text: "Interval between SCr values must be > 0 h." }); return out; }
      if (flo * fhi > 0) { out.flags.push({ code: "noRoot", lvl: "crit", text: "Unable to fit: SCr change is not physically possible for this patient." }); return out; }
      for (let i = 0; i < 200; i++) {
        const mid = Math.sqrt(lo * hi), fm = f(mid);
        if (fm === 0) { lo = hi = mid; break; }
        if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
        if (hi / lo - 1 < 1e-13) break;
      }
      out.k = Math.sqrt(lo * hi);
      out.crcl = (out.k * Vd * 1000) / 60;
      out.converged = true;
      out.flags.push({ code: "nssUnfloored", lvl: "info", text: "Non-steady-state CrCl uses SCr values without the 0.7 mg/dL floor." });
      return out;
    },
    // ASHP / Jelliffe-type non-steady-state CrCl, as printed (crcl §4.5). days = interval in DAYS. Not weight-scaled.
    jelliffeASHP({ age, sex, scr1, scr2, days }) {
      const m = ((293 - 2.03 * age) * (1.035 - 0.01685 * (scr1 + scr2)) + (49 * (scr1 - scr2)) / days) / (scr1 + scr2);
      return sex === "F" ? 0.86 * m : m;
    },
    // Winter mass-balance non-steady-state CrCl, dimensionally corrected (crcl §4.6).
    winterMassBalance({ age, sex, weight, scr1, scr2, hours }) {
      const prodDay = (28 - 0.2 * age) * weight * sexFactor(sex);
      const dTday = hours / 24;
      return ((prodDay - ((scr2 - scr1) * 10 * 0.6 * weight) / dTday) / (scr2 * 10)) * (1000 / 1440);
    },
    // Schwartz pediatric CrCl (mL/min/1.73 m²). kSchwartz from schwartzK().
    schwartz: (kSchwartz, heightCm, scr) => (kSchwartz * heightCm) / scr,
    // k: 0.45 full term to < 2 y (vanco-bayesian says < 1 y; pass infantMaxAge to choose), 0.55 child < 13 and females 13–21, 0.7 males 13–21.
    schwartzK(ageY, sex, infantMaxAge = 2) {
      if (ageY < infantMaxAge) return 0.45;
      if (ageY < 13) return 0.55;
      return sex === "M" ? 0.7 : 0.55;
    },
    // Suite computeCrCl (crcl §5): CG always; with scr2 + hours also Chow (selected), ASHP and Winter.
    estimate(o) {
      const cg = renal.cockcroftGault(o);
      const out = { ...cg, crclCG: cg.crcl, selected: "cockcroftGault" };
      if (isNum(o.scr2) && isNum(o.hours)) {
        const args = { age: o.age, sex: o.sex, weight: cg.weight, scr1: o.scr, scr2: o.scr2, hours: o.hours };
        const chow = renal.chowNonSteadyState(args);
        out.chow = chow;
        out.crclChow = chow.crcl;
        out.kCreat = chow.k;
        out.crclASHP = renal.jelliffeASHP({ age: o.age, sex: o.sex, scr1: o.scr, scr2: o.scr2, days: o.hours / 24 });
        out.crclWinter = renal.winterMassBalance(args);
        if (chow.converged) { out.crcl = chow.crcl; out.selected = "chow"; }
        out.flags = cg.flags.concat(chow.flags);
      }
      return out;
    },
  };

  // =====================================================================
  // PK.one: one-compartment model
  // Parameter object p = any two of { V (L), CL (L/h), k (1/h) }. sf = { S, F } (default 1).
  // =====================================================================
  const one = {
    k: (CL, V) => CL / V,
    kFromLevels: (c1, c2, dt) => ln(c1 / c2) / dt,
    halfLife: (k, ln2 = LN2_SITE) => ln2 / k,
    kFromHalfLife: (t, ln2 = LN2_SITE) => ln2 / t,
    accumulation: (k, tau) => 1 / omexp(k * tau),
    fracSS: (k, t) => omexp(k * t),                      // fraction of SS after t h of constant input
    fracSSDoses: (N, k, tau) => omexp(N * k * tau),       // after N doses
    timeToFracSS: (k, frac) => -ln(1 - frac) / k,
    timeToFall: (cKnown, cDesired, k) => ln(cKnown / cDesired) / k,
    fracRemaining: (k, t) => exp(-k * t),
    // Single IV bolus at t = 0.
    bolus(t, dose, p, sf) { const q = p1(p); return t < 0 ? 0 : ((sfOf(sf) * dose) / q.V) * exp(-q.k * t); },
    // Constant-rate infusion: level t h into the infusion, and t2 h after it ends.
    infusionDuring(t, rate, p, sf) { const q = p1(p); return ((sfOf(sf) * rate) / q.CL) * omexp(q.k * t); },
    infusionAfter(t2, rate, tinf, p, sf) { const q = p1(p); return ((sfOf(sf) * rate) / q.CL) * omexp(q.k * tinf) * exp(-q.k * t2); },
    // Single intermittent infusion of `dose` over tinf (tinf 0 → bolus); t from the START of the dose.
    infusion(t, dose, tinf, p, sf) {
      if (t <= 0) return 0;
      if (!(tinf > 0)) return one.bolus(t, dose, p, sf);
      return t <= tinf ? one.infusionDuring(t, dose / tinf, p, sf) : one.infusionAfter(t - tinf, dose / tinf, tinf, p, sf);
    },
    // Oral first-order absorption (Bateman); ka ≈ k handled by the limit.
    oral(t, dose, ka, p, sf) {
      if (t <= 0) return 0;
      const q = p1(p), A = sfOf(sf) * dose;
      if (Math.abs(ka - q.k) < 1e-9 * ka) return (A / q.V) * q.k * t * exp(-q.k * t);
      return ((A * ka) / (q.V * (ka - q.k))) * (exp(-q.k * t) - exp(-ka * t));
    },
    oralSS(t, dose, ka, tau, p, sf) {
      const q = p1(p), A = sfOf(sf) * dose;
      return ((A * ka) / (q.V * (ka - q.k))) * (exp(-q.k * t) / omexp(q.k * tau) - exp(-ka * t) / omexp(ka * tau));
    },
    tmaxOral: (ka, k) => ln(ka / k) / (ka - k),
    tmaxOralSS: (ka, k, tau) => ln((ka * omexp(k * tau)) / (k * omexp(ka * tau))) / (ka - k),
    // Steady state for intermittent infusion (tinf > 0) or bolus (tinf 0). Peak = end of infusion.
    // r = { dose, tau, tinf, S, F }. Returns cmax, cmin, first-dose values, per-dose helpers and level-at-time.
    ss(r, p) {
      const q = p1(p), k = q.k, T = r.tinf > 0 ? r.tinf : 0, tau = r.tau, D = sfOf(r) * r.dose;
      const infFactor = T > 0 ? omexp(k * T) / (k * T) : 1;   // (1 − e^−kT')/(kT'); 1 for bolus
      const cmax1 = (D * infFactor) / q.V;
      const cmax = cmax1 / omexp(k * tau);
      const cmin = cmax * exp(-k * (tau - T));
      const cmaxN = (N) => cmax * omexp(N * k * tau);
      const cminN = (N) => cmaxN(N) * exp(-k * (tau - T));
      // Level at SS, t h after the start of a dose (0 ≤ t ≤ tau).
      const at = (t) => (t >= T ? cmax * exp(-k * (t - T)) : ((D / T) / q.CL) * omexp(k * t) + cmin * exp(-k * t));
      return { cmax, cmin, cmax1, cmin1: cminN(1), cmaxN, cminN, at, k, V: q.V, CL: q.CL,
        cavg: D / (q.CL * tau), auc24: one.auc24Dose(r.dose, q.CL, tau, r), accumulation: one.accumulation(k, tau), source: "oneComp" };
    },
    // Superposition over an arbitrary dose list. events: [{ t, dose, tinf = 0, route = 'iv' | 'oral', ka, S, F }].
    // init: optional { c0, t0 } pre-existing level decaying from t0.
    superpose(t, events, p, init) {
      const q = p1(p);
      let c = 0;
      if (init && isNum(init.c0) && t >= (init.t0 || 0)) c += init.c0 * exp(-q.k * (t - (init.t0 || 0)));
      for (const e of events) {
        const dt = t - e.t;
        if (dt <= 0) continue;
        c += e.route === "oral" ? one.oral(dt, e.dose, e.ka, q, e) : one.infusion(dt, e.dose, e.tinf || 0, q, e);
      }
      return c;
    },
    profile: (times, events, p, init) => times.map((t) => one.superpose(t, events, p, init)),
    // Regular regimen → event list: n doses every tau starting at t0.
    regimen: ({ dose, tau, n, tinf = 0, t0 = 0, S, F, route, ka }) =>
      Array.from({ length: n }, (_, i) => ({ t: t0 + i * tau, dose, tinf, S, F, route, ka })),
    // Sawchuk-Zaske: peak and trough after the SAME steady-state dose.
    //   o = { peak, trough, dt (h between levels), tPeakAfterEnd (h after END of infusion; for a bolus, after the dose),
    //         dose, tinf (0 → bolus form), tau, S, F }
    sawchukZaske(o) {
      const sf = sfOf(o), T = o.tinf > 0 ? o.tinf : 0, tp = o.tPeakAfterEnd || 0;
      const k = ln(o.peak / o.trough) / o.dt;
      const infFactor = T > 0 ? omexp(k * T) / (k * T) : 1;
      const V = (sf * o.dose * infFactor * exp(-k * tp)) / (o.peak * omexp(k * o.tau));
      const CL = k * V;
      const cmax = o.peak / exp(-k * tp);
      const cmin = cmax * exp(-k * (o.tau - T));
      const flags = [];
      if (!(o.peak > o.trough)) flags.push({ code: "peak<=trough", lvl: "crit", text: "Peak must be higher than trough." });
      return { k, V, CL, halfLife: one.halfLife(k), cmax, cmin, auc24: one.auc24Dose(o.dose, CL, o.tau, o),
        auc24TrapLog: one.auc24TrapLog(cmax, cmin, k, T, o.tau), flags, source: "sawchukZaske" };
    },
    // New interval for desired peak/trough: ln(Cmax/Cmin)/k + T'.
    intervalForTargets: ({ cmax, cmin, k, tinf = 0 }) => ln(cmax / cmin) / k + tinf,
    // Dose for a desired SS peak (end of infusion) at interval tau.
    doseForPeak({ cmax, tau, tinf = 0, S, F }, p) {
      const q = p1(p), T = tinf > 0 ? tinf : 0;
      const infFactor = T > 0 ? omexp(q.k * T) / (q.k * T) : 1;
      return (cmax * q.V * omexp(q.k * tau)) / (sfOf({ S, F }) * infFactor);
    },
    // Dose for a desired SS trough (end of interval).
    doseForTrough({ cmin, tau, tinf = 0, S, F }, p) {
      const q = p1(p), T = tinf > 0 ? tinf : 0;
      return one.doseForPeak({ cmax: cmin / exp(-q.k * (tau - T)), tau, tinf, S, F }, q);
    },
    doseForAUC: ({ auc24, tau, S, F }, p) => (auc24 * p1(p).CL * tau) / 24 / sfOf({ S, F }),
    doseForAvg: ({ cavg, tau, S, F }, p) => (cavg * p1(p).CL * tau) / sfOf({ S, F }),
    // Loading dose (bolus): (Ctarget − Cinitial)·V/(S·F).
    loadingDose: ({ cTarget, cInitial = 0, V, S, F }) => ((cTarget - cInitial) * V) / sfOf({ S, F }),
    // Loading dose over an infusion so the end-of-infusion level hits cTarget (no drug on board): C·V·kT'/(1 − e^−kT').
    loadingDoseInfusion({ cTarget, tinf, S, F }, p) {
      const q = p1(p);
      return (cTarget * q.V * q.k * tinf) / omexp(q.k * tinf) / sfOf({ S, F });
    },
    // AUC24, primary: S·F·Dose/CL·24/tau (the site omits S·F; S = F = 1 for IV vancomycin).
    auc24Dose: (dose, CL, tau, sf) => ((sfOf(sf) * dose) / CL) * (24 / tau),
    // AUC24, secondary: linear trapezoid during infusion + log-down after it.
    auc24TrapLog: (cmax, cmin, k, tinf, tau) => ((cmin + cmax) * (tinf / 2) + (cmax - cmin) / k) * (24 / tau),
    // Generic trapezoid over sampled (times, concs). logDown uses the log trapezoid on falling segments.
    aucTrapezoid(times, concs, { logDown = false } = {}) {
      let a = 0;
      for (let i = 1; i < times.length; i++) {
        const dt = times[i] - times[i - 1], c0 = concs[i - 1], c1 = concs[i];
        if (logDown && c1 < c0 && c1 > 0) a += ((c0 - c1) * dt) / ln(c0 / c1);
        else a += ((c0 + c1) * dt) / 2;
      }
      return a;
    },
    // Fraction of body amount removed during a dialysis period (core-equations §4).
    dialysisFractionRemoved: (clDial, clRenal, V, hours) => omexp(((clDial + clRenal) / V) * hours),
    // Equivalent dose across dosage forms: dose·(S·F)cur/(S·F)new.
    equivalentDose: (dose, cur, nxt) => (dose * sfOf(cur)) / sfOf(nxt),
  };

  // Albumin (Sheiner-Tozer) normalisation of a total level (core-equations §2.4).
  const binding = {
    albuminCorrect: (cp, alb, { alpha = 0.1, albNormal = 4.4 } = {}) => cp / ((1 - alpha) * (alb / albNormal) + alpha),
  };

  // =====================================================================
  // PK.two: two-compartment model (Goti structure). p = { CL, Vc, Vp, Q }.
  // =====================================================================
  const two = {
    // Micro and hybrid constants, volumes. Flags when the discriminant is not positive.
    micro({ CL, Vc, Vp, Q }, ln2 = Math.LN2) { // two-comp §7: half-lives use ln 2 (core 1-comp uses the site 0.693)
      const k10 = CL / Vc, k12 = Q / Vc, k21 = Q / Vp, S = k10 + k12 + k21;
      const disc = S * S - 4 * k21 * k10;
      const r = Math.sqrt(Math.max(disc, 0));
      const alpha = 0.5 * (S + r), beta = 0.5 * (S - r);
      return { k10, k12, k21, alpha, beta, CL, Vc, Vp, Q, Vss: Vc + Vp, Vbeta: CL / beta,
        Vextrap: (Vc * (alpha - beta)) / (k21 - beta), thalfAlpha: ln2 / alpha, thalfBeta: ln2 / beta,
        valid: disc > 0 && alpha > k21 && k21 > beta };
    },
    // IV bolus coefficients A, B (mg/L) for `dose`.
    bolusCoefs(dose, m) {
      const { alpha, beta, k21, Vc } = m;
      return { A: (dose * (alpha - k21)) / (Vc * (alpha - beta)), B: (dose * (k21 - beta)) / (Vc * (alpha - beta)) };
    },
    // Inverse: from stripped A, B, alpha, beta and dose.
    fromMacro({ A, B, alpha, beta, dose }) {
      const k21 = (A * beta + B * alpha) / (A + B), k10 = (alpha * beta) / k21, k12 = alpha + beta - k10 - k21, Vc = dose / (A + B);
      return two.micro({ CL: k10 * Vc, Vc, Vp: (k12 * Vc) / k21, Q: k12 * Vc });
    },
    // Single intermittent infusion (tinf 0 → bolus), t from start of dose (two-comp §4.4).
    single(t, dose, tinf, m) {
      if (t <= 0) return 0;
      const { alpha, beta, k21 } = m;
      if (!(tinf > 0)) { const c = two.bolusCoefs(dose, m); return c.A * exp(-alpha * t) + c.B * exp(-beta * t); }
      const f = dose / (tinf * m.Vc * (beta - alpha)), ti = Math.min(t, tinf), tp = Math.max(0, t - tinf);
      return f * (((k21 - alpha) / alpha) * omexp(alpha * ti) * exp(-alpha * tp) + ((beta - k21) / beta) * omexp(beta * ti) * exp(-beta * tp));
    },
    // Steady-state level t h after start of an infusion, 0 ≤ t ≤ tau. Includes the carry-over during the
    // infusion that the site's formula drops (two-comp §4.5 [DERIVED] fix).
    ssAt(t, { dose, tinf, tau }, m) {
      const { alpha, beta, k21 } = m;
      const f = dose / (tinf * m.Vc * (beta - alpha));
      const term = (lam, c) => {
        if (t <= tinf) return c * (omexp(lam * t) + (omexp(lam * tinf) * exp(-lam * (tau - tinf)) * exp(-lam * t)) / omexp(lam * tau));
        return (c * omexp(lam * tinf) * exp(-lam * (t - tinf))) / omexp(lam * tau);
      };
      return f * (term(alpha, (k21 - alpha) / alpha) + term(beta, (beta - k21) / beta));
    },
    ss(r, m) {
      const peak = two.ssAt(r.tinf, r, m), trough = two.ssAt(r.tau, r, m);
      return { peak, trough, auc24: two.auc24(r.dose, m.CL, r.tau), at: (t) => two.ssAt(t, r, m), accumulation: 1 / omexp(m.beta * r.tau) };
    },
    // Superposition of infusions. events [{ t, dose, tinf }]; init { c0, t0 } decays with beta (two-comp §4.6).
    superpose(t, events, m, init) {
      let c = 0;
      if (init && isNum(init.c0) && t >= (init.t0 || 0)) c += init.c0 * exp(-m.beta * (t - (init.t0 || 0)));
      for (const e of events) c += two.single(t - e.t, e.dose, e.tinf || 0, m);
      return c;
    },
    auc24: (dose, CL, tau, sf) => one.auc24Dose(dose, CL, tau, sf),
    // Site analytic AUC (exact post-infusion integral + trapezoid over the infusion), about 0.3% low.
    auc24Site({ dose, tinf, tau }, m) {
      const { alpha, beta, k21 } = m;
      const f = dose / (tinf * m.Vc * (beta - alpha));
      const part = (lam, c) => ((c / lam) * omexp(lam * tinf) * omexp(lam * (tau - tinf))) / omexp(lam * tau);
      const post = f * (part(alpha, (k21 - alpha) / alpha) + part(beta, (beta - k21) / beta));
      const s = two.ss({ dose, tinf, tau }, m);
      return post * (24 / tau) + (s.peak + s.trough) * (tinf / 2) * (24 / tau);
    },
    // Numeric linear trapezoid over one SS interval (step h).
    auc24Trapezoid(r, m, h = 0.01) {
      const n = Math.max(1, Math.round(r.tau / h)), ts = [], cs = [];
      for (let i = 0; i <= n; i++) { const t = (i * r.tau) / n; ts.push(t); cs.push(two.ssAt(t, r, m)); }
      return one.aucTrapezoid(ts, cs) * (24 / r.tau);
    },
    loadingDoseVss: (cTarget, m) => cTarget * m.Vss,
    // Exact LD giving cTarget at the end of the first infusion (two-comp §4.7, corrected).
    loadingDoseExact(cTarget, tinf, m) {
      const { alpha, beta, k21, Vc } = m;
      return (cTarget * tinf * Vc * (beta - alpha)) / (((k21 - alpha) / alpha) * omexp(alpha * tinf) + ((beta - k21) / beta) * omexp(beta * tinf));
    },
    // Goti covariate STRUCTURE; coefficients are passed in (README §3, two-comp §3.1; verify against PMID 29470227).
    //   CL = clRef·(min(CrCl, crclCap)/crclRef)^clExp; Vc = vcRef·WT/wtRef; Vp = vpRef·(vpScaled ? WT/wtRef : 1); Q = q
    gotiStructure({ crcl, wt }, c) {
      const cr = isNum(c.crclCap) ? Math.min(crcl, c.crclCap) : crcl, wr = c.wtRef || 70;
      return { CL: c.clRef * Math.pow(cr / (c.crclRef || 120), isNum(c.clExp) ? c.clExp : 0.8), Vc: (c.vcRef * wt) / wr,
        Vp: c.vpRef * (c.vpScaled ? wt / wr : 1), Q: c.q, source: "goti" };
    },
  };

  // =====================================================================
  // PK.fit: least squares and MAP Bayesian estimation
  // =====================================================================
  // Solve A x = b (small dense, Gaussian elimination with partial pivoting). Returns null if singular.
  function solve(A, b) {
    const n = b.length, M = A.map((row, i) => [...row, b[i]]);
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (!(Math.abs(M[piv][c]) > 1e-300)) return null;
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= f * M[c][j]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let j = r + 1; j < n; j++) s -= M[r][j] * x[j]; x[r] = s / M[r][r]; }
    return x;
  }
  const sumSq = (r) => r.reduce((s, x) => s + x * x, 0);

  // Levenberg-Marquardt on a residual function res(x) → vector; objective Σ r².
  function levenbergMarquardt(res, x0, { maxIter = 200, tol = 1e-12 } = {}) {
    let x = x0.slice(), r = res(x), f = sumSq(r), lambda = 1e-3, it = 0, converged = false, J = null;
    if (!isFinite(f)) return { x, f: Infinity, iterations: 0, converged: false };
    const jac = (x, r) => {
      const n = x.length, cols = [];
      for (let j = 0; j < n; j++) {
        const h = 1e-6 * Math.max(1, Math.abs(x[j]));
        const xp = x.slice(), xm = x.slice(); xp[j] += h; xm[j] -= h;
        const rp = res(xp), rm = res(xm);
        cols.push(rp.map((v, i) => (v - rm[i]) / (2 * h)));
      }
      return r.map((_, i) => cols.map((c) => c[i]));
    };
    for (it = 1; it <= maxIter; it++) {
      J = jac(x, r);
      const n = x.length;
      const A = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => J.reduce((s, row) => s + row[a] * row[b], 0)));
      const g = Array.from({ length: n }, (_, a) => J.reduce((s, row, i) => s + row[a] * r[i], 0));
      if (Math.max(...g.map(Math.abs)) <= 1e-14 * (1 + f)) { converged = true; break; }
      let accepted = false;
      while (lambda < 1e16) {
        const Ad = A.map((row, a) => row.map((v, b) => (a === b ? v + lambda * Math.max(v, 1e-12) : v)));
        const d = solve(Ad, g.map((v) => -v));
        if (d) {
          const xn = x.map((v, j) => v + d[j]), rn = res(xn), fn = sumSq(rn);
          if (isFinite(fn) && fn <= f) {
            const small = f - fn <= tol * (f + 1e-300) || Math.max(...d.map(Math.abs)) < 1e-10;
            x = xn; r = rn; f = fn; lambda = Math.max(lambda / 10, 1e-15); accepted = true;
            if (small) converged = true;
            break;
          }
        }
        lambda *= 10;
      }
      if (!accepted) { converged = true; break; } // no descent direction left: at a (local) minimum
      if (converged) break;
    }
    return { x, f, iterations: it, converged, J };
  }

  // Nelder-Mead (bayesian-engine §5.3): α 1, γ 2, ρ 0.5, σ 0.5, deterministic start, one restart.
  function nelderMead(fn, x0, { step = Math.log(1.2), maxIter = 2000, ftol = 1e-10, xtol = 1e-8 } = {}) {
    const run = (start) => {
      const n = start.length;
      let S = [start.slice()];
      for (let i = 0; i < n; i++) { const v = start.slice(); v[i] += step; S.push(v); }
      let F = S.map(fn), it = 0;
      for (; it < maxIter; it++) {
        const idx = S.map((_, i) => i).sort((a, b) => F[a] - F[b]);
        S = idx.map((i) => S[i]); F = idx.map((i) => F[i]);
        const fSpread = Math.max(...F.map((v) => Math.abs(v - F[0])));
        const xSpread = Math.max(...S.flatMap((v) => v.map((c, j) => Math.abs(c - S[0][j]))));
        if (fSpread <= ftol * (Math.abs(F[0]) + 1e-12) && xSpread <= xtol) break;
        const c = new Array(n).fill(0);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += S[i][j] / n;
        const pt = (t) => c.map((v, j) => v + t * (S[n][j] - v));
        const xr = pt(-1), fr = fn(xr);
        if (fr < F[0]) { const xe = pt(-2), fe = fn(xe); if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; } }
        else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
        else {
          const xc = fr < F[n] ? pt(-0.5) : pt(0.5), fc = fn(xc);
          if (fc < Math.min(fr, F[n])) { S[n] = xc; F[n] = fc; }
          else for (let i = 1; i <= n; i++) { S[i] = S[i].map((v, j) => S[0][j] + 0.5 * (v - S[0][j])); F[i] = fn(S[i]); }
        }
      }
      return { x: S[0], f: F[0], iterations: it, converged: it < maxIter };
    };
    const a = run(x0), b = run(a.x);
    return { x: b.x, f: b.f, iterations: a.iterations + b.iterations, converged: a.converged && b.converged };
  }

  // Generic MAP / least-squares fit.
  // spec = {
  //   predict(theta, t) → concentration     theta = { name: value } for ALL parameters (fitted and fixed)
  //   obs: [{ t, c }]                       measured levels
  //   params: [{ name, mean, cv = 0.3, fit = true, value }]   population means (prior μ); fixed params use value ?? mean
  //   bayes = true                          false → (weighted) least squares, no prior terms
  //   error = { type: 'proportionalObs' (site: σ = cv·obs) | 'proportionalPred' | 'additive' | 'combined', cv = 0.1, sd, floor }
  //   priorType = 'normal' (site, linear scale) | 'lognormal' (ω² = ln(1 + CV²))
  //   starts: optional array of theta objects; otherwise deterministic multi-start around the means
  // }
  // Returns { params, objective, residualPart, priorPart, iterations, converged, method, se (log-scale ≈ CV), predictions }.
  function objectiveParts(spec, theta) {
    const err = spec.error || {};
    const type = err.type || "proportionalObs", cvAll = isNum(err.cv) ? err.cv : policies.cvAssay, sd = err.sd || 0;
    const res = [], pri = [];
    for (const o of spec.obs) {
      const pred = spec.predict(theta, o.t), cvA = isNum(o.cv) ? o.cv : cvAll;
      let sigma;
      if (spec.weighted === false) sigma = 1;
      else if (type === "proportionalObs") sigma = cvA * o.c;
      else if (type === "proportionalPred") sigma = cvA * pred;
      else if (type === "additive") sigma = sd;
      else sigma = Math.sqrt(sd * sd + Math.pow(cvA * o.c, 2));
      if (isNum(err.floor)) sigma = Math.max(sigma, err.floor);
      res.push((o.c - pred) / sigma);
    }
    if (spec.bayes !== false) {
      for (const p of spec.params) {
        if (p.fit === false) continue;
        const cv = isNum(p.cv) ? p.cv : policies.cvParam;
        if (spec.priorType === "lognormal") pri.push((ln(theta[p.name]) - ln(p.mean)) / Math.sqrt(ln(1 + cv * cv)));
        else pri.push((theta[p.name] - p.mean) / (cv * p.mean));
      }
    }
    return { res, pri };
  }
  function objective(spec, theta) { const o = objectiveParts(spec, theta); return sumSq(o.res) + sumSq(o.pri); }

  function fitModel(spec) {
    const free = spec.params.filter((p) => p.fit !== false);
    const fixed = {};
    for (const p of spec.params) if (p.fit === false) fixed[p.name] = isNum(p.value) ? p.value : p.mean;
    const toTheta = (phi) => { const th = { ...fixed }; free.forEach((p, j) => (th[p.name] = exp(phi[j]))); return th; };
    const resid = (phi) => {
      const th = toTheta(phi);
      const o = objectiveParts(spec, th);
      const r = o.res.concat(o.pri);
      return r.every(isFinite) ? r : r.map(() => 1e150);
    };
    const fobj = (phi) => sumSq(resid(phi));
    const phi0 = free.map((p) => ln(isNum(p.start) ? p.start : p.mean));
    // Deterministic multi-start: the means, then ±ln 2 corners (n ≤ 3) or axes (n > 3).
    let starts;
    if (spec.starts) starts = spec.starts.map((s) => free.map((p) => ln(s[p.name])));
    else {
      starts = [phi0];
      const n = free.length, d = Math.LN2;
      if (n <= 3) for (let m = 0; m < 1 << n; m++) starts.push(phi0.map((v, j) => v + ((m >> j) & 1 ? d : -d)));
      else for (let j = 0; j < n; j++) for (const s of [d, -d]) starts.push(phi0.map((v, i) => (i === j ? v + s : v)));
    }
    let best = null, iterations = 0;
    for (const s of starts) {
      const r = levenbergMarquardt(resid, s, { maxIter: spec.maxIter || 200 });
      iterations += r.iterations;
      if (!best || r.f < best.f) best = { ...r, method: "LM" };
    }
    // Nelder-Mead fallback / polish when LM did not converge.
    if (!best.converged || !isFinite(best.f)) {
      const nm = nelderMead(fobj, best.x);
      iterations += nm.iterations;
      if (nm.f <= best.f) best = { ...nm, method: "NM", J: null };
    }
    const theta = toTheta(best.x);
    const parts = objectiveParts(spec, theta);
    // Approximate posterior covariance in log space: (JᵀJ)⁻¹ → SE of ln θ ≈ CV of θ.
    let se = null;
    const J = best.J || levenbergMarquardt(resid, best.x, { maxIter: 1 }).J;
    if (J && free.length) {
      const n = free.length;
      const A = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => J.reduce((s, row) => s + row[a] * row[b], 0)));
      se = {};
      free.forEach((p, j) => { const e = new Array(n).fill(0); e[j] = 1; const col = solve(A, e); se[p.name] = col ? Math.sqrt(Math.max(col[j], 0)) : NaN; });
    }
    return { params: theta, objective: sumSq(parts.res) + sumSq(parts.pri), residualPart: sumSq(parts.res), priorPart: sumSq(parts.pri),
      iterations, converged: !!best.converged, method: best.method, se,
      predictions: spec.obs.map((o) => ({ t: o.t, obs: o.c, pred: spec.predict(theta, o.t) })), source: spec.bayes === false ? "leastSquares" : "map" };
  }

  const fit = {
    objective,
    objectiveParts,
    map: (spec) => fitModel({ ...spec, bayes: true }),
    // Least squares. weighted: true uses the error model σ; false (default) is ordinary Σ(obs − pred)².
    leastSquares: (spec) => fitModel({ ...spec, bayes: false, weighted: spec.weighted === true }),
    levenbergMarquardt,
    nelderMead,
    solve,
    // Convenience: one-compartment predict() from a dose-event list. theta needs V and CL.
    oneCompPredictor: (events, init) => (th, t) => one.superpose(t, events, { V: th.V, CL: th.CL }, init),
    // Two-compartment predict(): theta needs CL, Vc, Vp, Q.
    twoCompPredictor: (events, init) => (th, t) => two.superpose(t, events, two.micro(th), init),
  };

  // =====================================================================
  // PK.round: rounding and display
  // =====================================================================
  const round = {
    // Round to an increment. mode 'nearest' | 'up' | 'down'.
    roundTo(x, inc, mode = "nearest") {
      if (!(inc > 0)) return x;
      const q = x / inc, fnr = mode === "up" ? Math.ceil : mode === "down" ? Math.floor : Math.round;
      return +(fnr(q - (mode === "up" ? 1e-9 : mode === "down" ? -1e-9 : 0)) * inc).toFixed(10);
    },
    // Nearest deliverable total from product strengths (e.g. [300], [100, 30]). Ties prefer fewer units, then lower dose.
    // Returns { total, units: [{ strength, count }], count, diff }.
    roundToStrengths(dose, strengths, { maxUnits = 12 } = {}) {
      const st = [...strengths].sort((a, b) => b - a);
      let best = null;
      const rec = (i, left, counts, used, total) => {
        if (i === st.length) {
          if (total <= 0) return;
          const diff = Math.abs(total - dose);
          if (!best || diff < best.diff - 1e-9 || (Math.abs(diff - best.diff) <= 1e-9 && (used < best.count || (used === best.count && total < best.total))))
            best = { total, diff, count: used, units: st.map((s, j) => ({ strength: s, count: counts[j] })).filter((u) => u.count) };
          return;
        }
        for (let c = 0; c <= left; c++) rec(i + 1, left - c, [...counts, c], used + c, total + c * st[i]);
      };
      rec(0, maxUnits, [], 0, 0);
      return best;
    },
    // Snap an interval to an allowed list. mode 'nearest' | 'down' | 'up'.
    snapInterval(tau, allowed = policies.intervals, mode = "nearest") {
      const a = [...allowed].sort((x, y) => x - y);
      if (mode === "down") return [...a].reverse().find((v) => v <= tau + 1e-9) ?? a[0];
      if (mode === "up") return a.find((v) => v >= tau - 1e-9) ?? a[a.length - 1];
      return a.reduce((b, v) => (Math.abs(v - tau) < Math.abs(b - tau) ? v : b), a[0]);
    },
    // Truncate (the site truncates some displayed levels, e.g. 28.58 → 28.5).
    truncate: (x, dp = 1) => Math.trunc(x * Math.pow(10, dp) + 1e-9 * Math.sign(x)) / Math.pow(10, dp),
    // Display formatting: fixed dp, "—" for non-finite.
    fmt: (x, dp = 1) => (isNum(x) ? x.toFixed(dp) : "—"),
    // Significant figures, trimmed.
    sig: (x, n = 3) => (isNum(x) ? String(+x.toPrecision(n)) : "—"),
  };

  const PK = { version: "0.1.0", LN2_SITE, sources, policies, body, renal, one, binding, two, fit, round, _omexp: omexp };
  root.PK = PK;
  if (typeof module !== "undefined" && module.exports) module.exports = PK;
})(typeof globalThis !== "undefined" ? globalThis : this);

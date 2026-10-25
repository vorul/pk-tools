// Tests for the plausibility limits in pk-suite/lib/pk-ui.js (PKUI.checkLimits). Run: node --test pk-suite/tests/
// limitGate() needs a DOM and is covered by the page smoke checks; checkLimits() is pure.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
require(path.join(__dirname, "..", "lib", "pkcore.js"));
require(path.join(__dirname, "..", "lib", "pk-ui.js"));
const { checkLimits, LIMITS } = globalThis.PKUI;

test("limits: adult 18–110 y, 25–350 kg, 120–230 cm; all ages 0–110 y, 0.4–350 kg, 30–230 cm; SCr 0.1–20 mg/dL", () => {
  assert.deepEqual(LIMITS.adult, { age: [18, 110], wtKg: [25, 350], htCm: [120, 230], scr: [0.1, 20] });
  assert.deepEqual(LIMITS.all, { age: [0, 110], wtKg: [0.4, 350], htCm: [30, 230], scr: [0.1, 20] });
});

test("checkLimits: in range is clear; each value outside its range is listed (soft); blanks are skipped", () => {
  const ok = checkLimits({ age: 60, wtKg: 80, htCm: 178, scr: 1, sex: "M" }, { cg: true });
  assert.deepEqual([ok.soft, ok.hard, ok.key], [[], [], ""]);
  const edges = checkLimits({ age: 18, wtKg: 350, htCm: 120, scr: 0.1 });
  assert.equal(edges.soft.length, 0, "range ends are inside");
  const out = checkLimits({ age: 112, wtKg: 400, htCm: 250, scr: 25 });
  assert.equal(out.soft.length, 4);
  assert.match(out.soft[0], /Age 112 y is outside 18–110 y/);
  assert.match(out.soft[3], /SCr 25 mg\/dL \(2210 µmol\/L\) is outside 0\.1–20 mg\/dL/);
  assert.equal(checkLimits({ age: NaN, wtKg: undefined, htCm: 178 }).soft.length, 0);
  assert.equal(checkLimits({ age: 16 }).soft.length, 1, "adult set: age 16 is outside");
  assert.equal(checkLimits({ age: 16, wtKg: 3, htCm: 50 }, { set: "all" }).soft.length, 0, "all-ages set: a child is inside");
});

test("checkLimits: Cockcroft-Gault CrCl ≤ 0 (age ≥ 140, or IBW ≤ 0) is a hard block, only when the page uses CG", () => {
  assert.equal(checkLimits({ age: 150 }, { cg: true }).hard.length, 1);
  assert.equal(checkLimits({ age: 150 }).hard.length, 0, "no CG: soft only");
  assert.equal(checkLimits({ age: 139.9 }, { cg: true }).hard.length, 0);
  // Devine IBW = 0 at 60 − 50/2.3 in (male) and 60 − 45.5/2.3 in (female)
  assert.equal(checkLimits({ htCm: 100, sex: "M" }, { cg: true }).hard.length, 0, "male 100 cm: IBW > 0");
  assert.equal(checkLimits({ htCm: 95, sex: "M" }, { cg: true }).hard.length, 1, "male 95 cm: IBW ≤ 0");
  assert.equal(checkLimits({ htCm: 100, sex: "F" }, { cg: true }).hard.length, 1, "female 100 cm: IBW ≤ 0");
});

test("checkLimits: the key changes with the values, so an override covers only the values it was given for", () => {
  const a = checkLimits({ age: 112 }), b = checkLimits({ age: 115 }), c = checkLimits({ age: 112 });
  assert.notEqual(a.key, b.key); assert.equal(a.key, c.key);
});

// pk-ui.js: optional small UI helpers for PK Suite pages. Load after pkcore.js. Sets globalThis.PKUI.
// No calculations here: everything numeric comes from PK.*.
(function (root) {
  "use strict";
  const PK = root.PK;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Unit conversions keyed "from>to", used by unit toggles.
  const CONVERT = {
    "in>cm": (x) => x * 2.54, "cm>in": (x) => x / 2.54,
    "kg>lb": (x) => x * 2.2046226, "lb>kg": (x) => x / 2.2046226,
    "mg/dL>µmol/L": (x) => x * 88.4, "µmol/L>mg/dL": (x) => x / 88.4,
    "mg/L>ng/mL": (x) => x * 1000, "ng/mL>mg/L": (x) => x / 1000,
  };

  // Unit toggle button glued to an input (<span class="ig"><input><button class="ub"></button></span>).
  // Clicking cycles units and converts the input's value. getValue() always returns the value in units[0] (internal unit).
  function unitToggle(input, button, units, { dp = 2, onChange } = {}) {
    let i = 0;
    const paint = () => { button.textContent = units[i]; button.setAttribute("aria-label", `Units: ${units[i]}. Click to change.`); };
    button.type = "button";
    button.addEventListener("click", () => {
      const from = units[i], to = units[(i + 1) % units.length], v = parseFloat(input.value), f = CONVERT[`${from}>${to}`];
      i = (i + 1) % units.length;
      if (isFinite(v) && f) input.value = +f(v).toFixed(dp);
      paint();
      if (onChange) onChange(units[i]);
    });
    paint();
    return {
      unit: () => units[i],
      getValue() { const v = parseFloat(input.value); if (!i) return v; const f = CONVERT[`${units[i]}>${units[0]}`]; return f ? f(v) : v; },
    };
  }

  // Number formatting: fixed decimals, "—" for missing; optional unit suffix.
  const num = (x, dp = 1, unit) => (typeof x === "number" && isFinite(x) ? x.toFixed(dp) + (unit ? ` ${unit}` : "") : "—");

  // Render banners into a container from [{ lvl: 'info'|'warn'|'crit', text }] (PK flags use the same shape).
  function renderBanners(container, alerts) {
    container.innerHTML = (alerts || []).map((a) => `<div class="alert ${a.lvl === "warn" ? "" : esc(a.lvl || "")}" role="${a.lvl === "crit" ? "alert" : "status"}">${esc(a.text)}</div>`).join("");
  }

  // Provenance badge HTML for a PK.sources key. Unverified or off-site values show a visible "verify" badge.
  function badge(key) {
    const s = PK && PK.sources[key];
    if (!s) return `<span class="src verify" title="Unknown source">verify</span>`;
    const title = esc(`${s.label} (${s.ref})`);
    return s.verify ? `<span class="src verify" title="${title}">verify</span>` : `<span class="src" title="${title}">src</span>`;
  }

  // Segmented control: buttons with data-value; returns { value(), set(v) }.
  function segmented(el, onChange) {
    const btns = [...el.querySelectorAll("button")];
    const set = (v) => btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === v)));
    btns.forEach((b) => { b.type = "button"; b.addEventListener("click", () => { set(b.dataset.value); if (onChange) onChange(b.dataset.value); }); });
    return { value: () => (btns.find((b) => b.getAttribute("aria-pressed") === "true") || {}).dataset?.value, set };
  }

  // ---------- Plausibility limits (review 2026-10-25) ----------
  // Values outside these ranges block the result until the user confirms them ("Use these values anyway").
  // A Cockcroft-Gault CrCl of 0 or below (age ≥ 140, or a height that gives IBW ≤ 0) blocks with no override.
  // Values are in internal units: years, kg, cm, mg/dL.
  const LIMITS = {
    adult: { age: [18, 110], wtKg: [25, 350], htCm: [120, 230], scr: [0.1, 20] },
    all: { age: [0, 110], wtKg: [0.4, 350], htCm: [30, 230], scr: [0.1, 20] },
  };
  const LIMIT_LABEL = {
    age: (v) => `Age ${+v.toFixed(1)} y`, wtKg: (v) => `Weight ${+v.toFixed(1)} kg`,
    htCm: (v) => `Height ${+v.toFixed(1)} cm (${+(v / 2.54).toFixed(1)} in)`, scr: (v) => `SCr ${+v.toFixed(2)} mg/dL (${Math.round(v * 88.4)} µmol/L)`,
  };
  const LIMIT_RANGE = { age: (a, b) => `${a}–${b} y`, wtKg: (a, b) => `${a}–${b} kg`, htCm: (a, b) => `${a}–${b} cm`, scr: (a, b) => `${a}–${b} mg/dL` };
  // vals: { age, wtKg, htCm, scr, sex } (missing keys are skipped). opts: { set: 'adult' | 'all', cg: uses Cockcroft-Gault }.
  // Returns { soft: [text], hard: [text], key }.
  function checkLimits(vals, { set = "adult", cg = false } = {}) {
    const L = LIMITS[set], soft = [], hard = [];
    for (const k of Object.keys(L)) {
      const v = vals[k];
      if (typeof v !== "number" || !isFinite(v)) continue;
      if (v < L[k][0] || v > L[k][1]) soft.push(`${LIMIT_LABEL[k](v)} is outside ${LIMIT_RANGE[k](L[k][0], L[k][1])}.`);
    }
    if (cg && isFinite(vals.age) && vals.age >= 140) hard.push(`Cockcroft-Gault gives a CrCl of 0 or below at age ${vals.age} (140 or over).`);
    if (cg && isFinite(vals.htCm) && PK && PK.body.ibw(vals.sex, vals.htCm / 2.54) <= 0) hard.push(`Height ${+vals.htCm.toFixed(1)} cm gives an ideal body weight of 0 or below, so CrCl cannot be estimated.`);
    return { soft, hard, key: soft.concat(hard).join("|") };
  }
  // Show the gate above `anchor` and report whether the result must be withheld. rerun() is called when the user
  // ticks the override. The override holds only for the exact set of out-of-range values it was given for.
  const accepted = new Set();
  function limitGate(anchor, lim, rerun) {
    let box = anchor.previousElementSibling;
    if (!box || !box.classList.contains("limitgate")) { box = document.createElement("div"); box.className = "limitgate"; anchor.parentNode.insertBefore(box, anchor); }
    if (!lim.soft.length && !lim.hard.length) { box.innerHTML = ""; return false; }
    const ok = !lim.hard.length && accepted.has(lim.key);
    const items = lim.hard.concat(lim.soft).map((t) => `<li>${esc(t)}</li>`).join("");
    const head = lim.hard.length ? "Cannot calculate with these values." : ok ? "Using values outside the usual range (confirmed). Check them before acting on the result." : "Check these values. No result is shown until you confirm them.";
    box.innerHTML = `<div class="alert ${ok ? "" : "crit"}" role="alert"><b>${esc(head)}</b><ul>${items}</ul>${lim.hard.length ? "" :
      `<label><input type="checkbox" ${ok ? "checked" : ""}> Use these values anyway</label>`}</div>`;
    const cb = box.querySelector("input[type=checkbox]");
    if (cb) cb.addEventListener("change", () => { if (cb.checked) accepted.add(lim.key); else accepted.delete(lim.key); rerun(); });
    return !ok;
  }

  root.PKUI = { CONVERT, unitToggle, num, renderBanners, badge, segmented, esc, LIMITS, checkLimits, limitGate };
})(typeof globalThis !== "undefined" ? globalThis : this);

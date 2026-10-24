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

  root.PKUI = { CONVERT, unitToggle, num, renderBanners, badge, segmented, esc };
})(typeof globalThis !== "undefined" ? globalThis : this);

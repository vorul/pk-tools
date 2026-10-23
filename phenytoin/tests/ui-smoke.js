// Interface tests for the phenytoin calculator (../index.html).
// Open the calculator in a browser, open the developer console, paste this whole file and press Enter.
// It clicks through the page and returns { passed, failed, results }. It resets saved inputs when done.
(() => {
  const results = [];
  const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail: ok ? "" : String(detail) });
  const $ = (id) => document.getElementById(id);
  const fire = (el) => el.dispatchEvent(new Event("input", { bubbles: true }));
  const set = (id, v) => { const el = $(id); if (el.type === "checkbox") el.checked = v; else el.value = v; fire(el); };
  const click = (sel) => document.querySelector(sel).click();
  const tab = (t) => $(`tab-${t}`).click();
  const card = () => (document.querySelector("#result .order") || {}).innerText || "";
  const orderLine = () => [...document.querySelectorAll("#result .oline")].map((e) => e.innerText.replace(/\s+/g, " ")).join(" | ");
  const predicted = () => parseFloat((document.querySelector("#result .order .val") || {}).textContent);
  const unit = (id) => document.querySelector(`button.ub[data-for="${id}"]`).textContent;
  const errors = [];
  const onErr = (e) => errors.push(e.message);
  window.addEventListener("error", onErr);
  const tabs = ["adjust", "start", "two", "stop", "load", "interp"];

  try { localStorage.clear(); } catch (e) {}
  click('[data-country="ca"]');
  // Start from Winter's Q2 sample regardless of what the browser restored.
  const start = { age: 45, sex: "M", wt: 70, ht: 178, alb: 44, renal: "normal", bind: "alb", cyp: "normal", kmMode: "winter", inc: "auto",
    a_form: "cap", a_dose: 100, a_tau: 8, a_days: 21, a_level: 32, a_target: 60, a_trough: false };
  for (const [k, v] of Object.entries(start)) set(k, v);

  // 1. Every tab renders an order card with no calculation error.
  for (const t of tabs) {
    tab(t);
    const c = card();
    check(`${t}: renders a result card`, c.length > 20, c.slice(0, 80));
    check(`${t}: no calculation error`, !/can't be calculated/.test($("result").innerText), $("result").innerText.slice(0, 120));
    check(`${t}: only its own inputs are visible`, tabs.every((x) => $(`panel-${x}`).hidden === (x !== t)));
  }

  // 2. Sub-modes show the right input lines.
  tab("two"); set("t_mode", "nss");
  check("two levels: non-steady-state lines shown", [...document.querySelectorAll(".t-nss")].every((e) => !e.hidden) && [...document.querySelectorAll(".t-ss")].every((e) => e.hidden));
  check("two levels: non-steady-state result", /non|order|then/i.test(card()) && card().length > 20);
  set("t_method", "bayes"); check("two levels: Bayesian fit renders", card().length > 20);
  set("t_method", "mb"); set("t_mode", "ss");
  tab("load"); set("l_mode", "switch");
  check("switch: Stop and Start lines", /stop/i.test(orderLine()) && /start/i.test(orderLine()), orderLine());
  set("l_mode", "load");
  check("load: Load line", /load/i.test(orderLine()), orderLine());

  // 3. Adjust tab: Winter Q2 sample gives 360 mg/day (exact 355) and a sensible order line.
  tab("adjust");
  check("adjust: Q2 sample recommends 360 mg/day", /360 mg\/day/.test(card()), card().slice(0, 200));
  check("adjust: order line names the drug and frequency", /phenytoin sodium ER/.test(orderLine()) && /q8h|q12h|daily/.test(orderLine()), orderLine());

  // 4. Per-field unit toggle converts and round-trips.
  const before = parseFloat($("a_level").value), beforeOrder = orderLine();
  click('button.ub[data-for="a_level"]');
  check("field unit: level switches to mg/L", unit("a_level") === "mg/L", unit("a_level"));
  check("field unit: value converted (32 µmol/L ≈ 8.1 mg/L)", Math.abs(parseFloat($("a_level").value) - before * 0.25227) < 0.06, $("a_level").value);
  check("field unit: same recommendation after switching one field", orderLine() === beforeOrder, orderLine());
  click('button.ub[data-for="a_level"]');
  check("field unit: switching back restores the value", Math.abs(parseFloat($("a_level").value) - before) <= 0.5, $("a_level").value);

  // 5. Mixed units: target typed in mg/L while level stays µmol/L.
  click('button.ub[data-for="a_target"]');
  set("a_target", "15.1");
  check("mixed units: same order with target entered as 15.1 mg/L", orderLine() === beforeOrder, orderLine());
  click('button.ub[data-for="a_target"]'); set("a_target", "60");

  // 6. Country switcher resets every field.
  const ids = ["a_level", "a_target", "alb", "ht", "wt"];
  const caVals = ids.map((i) => parseFloat($(i).value));
  click('[data-country="us"]');
  check("US: units are mg/L, g/dL, in, kg", ids.map(unit).join(",") === "mg/L,mg/L,g/dL,in,kg", ids.map(unit).join(","));
  check("US: albumin 44 g/L → 4.4 g/dL", Math.abs(parseFloat($("alb").value) - caVals[2] / 10) < 0.051, $("alb").value);
  check("US: height 178 cm → 70.1 in", Math.abs(parseFloat($("ht").value) - caVals[3] / 2.54) < 0.06, $("ht").value);
  check("US: same order as CA", orderLine() === beforeOrder, orderLine());
  check("US: results shown in mg/L", /mg\/L/.test(document.querySelector("#result .order .right").innerText));
  click('[data-country="uk"]');
  check("UK: mg/L levels with g/L albumin and cm", ids.map(unit).join(",") === "mg/L,mg/L,g/L,cm,kg", ids.map(unit).join(","));
  check("UK: same order as CA", orderLine() === beforeOrder, orderLine());
  click('[data-country="ca"]');
  check("CA: back to µmol/L, g/L, cm, kg", ids.map(unit).join(",") === "µmol/L,µmol/L,g/L,cm,kg", ids.map(unit).join(","));
  check("CA: values restored after round trip", ids.every((i, k) => Math.abs(parseFloat($(i).value) - caVals[k]) <= Math.max(0.5, caVals[k] * 0.01)), ids.map((i) => $(i).value).join(","));

  // 7. Weight in pounds gives the same answer.
  click('button.ub[data-for="wt"]');
  check("weight: kg → lb", unit("wt") === "lb" && Math.abs(parseFloat($("wt").value) - 154) <= 1, $("wt").value);
  check("weight: same order in lb", orderLine() === beforeOrder, orderLine());
  click('button.ub[data-for="wt"]');

  // 8. Results unit toggle.
  const pu = predicted();
  click("#result button[data-ru]");
  const pm = predicted();
  check("results unit: µmol/L → mg/L divides by 3.96", Math.abs(pu / pm - 3.964) < 0.2, `${pu} vs ${pm}`);
  click("#result button[data-ru]");

  // 9. Detail panels and copy note.
  click('#result button[data-act="opts"]');
  check("Other doses: dose table opens", /Daily dose options/.test($("result").textContent));
  click('#result button[data-act="work"]');
  const heads = [...document.querySelectorAll("#result h2")].map((h) => h.textContent).join(", ");
  check("Show working: recheck, chart, working and note", /When to recheck/.test(heads) && /Dose vs steady-state/.test(heads) && /Working/.test(heads) && /Chart note/.test(heads), heads);
  const note = ($("noteText") || {}).value || "";
  check("chart note includes the order and recheck plan", /Order|Then/.test(note) && /Recheck/.test(note), note.slice(0, 120));
  check("chart note uses the results unit", /µmol\/L/.test(note), note.slice(0, 120));
  click('#result button[data-act="opts"]'); click('#result button[data-act="work"]');
  check("panels close again", !/Daily dose options/.test($("result").textContent));

  // 10. Patient panel and strip.
  $("editPatient").click();
  check("Edit patient opens the panel", !$("patientPanel").hidden);
  set("wt", "41.5"); set("sex", "F"); set("ht", "165"); set("alb", "48");
  check("strip shows the new weight", /41\.5 kg/.test($("strip").innerText), $("strip").innerText);
  set("bind", "free");
  check("free level fields appear", !$("freeRow").hidden && !$("freeTotRow").hidden);
  set("bind", "vpa");
  check("valproate field appears", !$("vpaRow").hidden && $("freeRow").hidden);
  set("bind", "alb");
  $("editPatient").click();
  check("Done closes the panel", $("patientPanel").hidden);

  // 11. The user's patient case end to end.
  set("a_dose", "100"); set("a_tau", "8"); set("a_days", "30"); set("a_level", "109"); set("a_target", "60");
  const ol = orderLine();
  check("user's patient: hold 4 doses then 130 mg q12h", /hold phenytoin × 4 doses/i.test(ol) && /130 mg PO q12h/.test(ol), ol);
  check("user's patient: predicted 49 µmol/L", Math.abs(predicted() - 49) <= 1, predicted());
  check("user's patient: level-above-range warning shown", /above 80/.test($("result").innerText));

  // 12. Blank input is handled.
  set("a_level", "");
  check("blank level shows a prompt, not an error", /Enter the dose, interval and level/.test($("result").innerText), $("result").innerText.slice(0, 120));
  set("a_level", "109");

  // 13. Saved inputs.
  let saved = null, storage = true;
  try { localStorage.setItem("_t", "1"); localStorage.removeItem("_t"); saved = JSON.parse(localStorage.getItem("phenytoin-adjuster-v4")); } catch (e) { storage = false; }
  if (storage) check("inputs are saved for this browser", saved && saved.a_level === "109" && saved._country === "ca", JSON.stringify(saved || {}).slice(0, 120));
  else results.push({ name: "inputs are saved for this browser", ok: true, detail: "skipped: this page has no browser storage (local preview)" });

  // 14. No sideways scrolling at the current width on any tab.
  if (innerWidth > 0) for (const t of tabs) { tab(t); check(`${t}: no horizontal page scroll`, document.documentElement.scrollWidth <= innerWidth + 1, `${document.documentElement.scrollWidth} > ${innerWidth}`); }

  check("no script errors during the run", errors.length === 0, errors.join("; "));
  window.removeEventListener("error", onErr);
  try { localStorage.clear(); } catch (e) {}
  tab("adjust");
  const failed = results.filter((r) => !r.ok);
  return { passed: results.length - failed.length, failed: failed.length, failures: failed, total: results.length };
})();

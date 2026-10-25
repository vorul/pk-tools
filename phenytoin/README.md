# Phenytoin dose adjuster

[`index.html`](index.html) is the whole tool. Open it in a browser.

## Scenarios

- **Adjust:** a new dose from the current dose and one steady-state level
- **Start:** an initial maintenance dose, with an optional loading dose
- **Two levels:** Km and Vmax from two steady-state levels, or from two levels not at steady state (mass balance or Bayesian fit)
- **After stopping:** time for a high level to fall to a target
- **Load / switch:** a loading dose to raise a level, or switching between capsules, chewables, suspension, IV and fosphenytoin
- **Interpret:** a level after correcting for albumin, renal failure, valproate or a free level, including CRRT

Patient fields start blank on every load and are never saved; settings are. Ages, weights and heights outside 0–110 y, 0.4–350 kg and 30–230 cm hold back the result until confirmed.

Each scenario returns an order in deliverable doses (100 and 30 mg capsules, 50 mg chewables), optional hold doses, a recheck schedule and a chart note. Units default to Canadian (µmol/L, g/L, cm). Every field can switch units, and a country switch resets every field at once.

## Method

Michaelis-Menten kinetics with population Km and Vmax by age, Winter-Tozer albumin correction when albumin is below 4.4 g/dL, and salt factors by product. The Methods section of the page lists every equation and source.

Based on the phenytoin dosing work of Marshall Pierce, PharmD, at [pkineticdrugdosing.com](https://pkineticdrugdosing.com/index.html).

## Tests

See [tests/README.md](tests/README.md).

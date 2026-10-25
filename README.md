# pk-tools

Clinical pharmacokinetic dosing tools. Each tool is a single HTML page that runs in the browser, with no install, server or account needed.

| Tool | What it does |
| --- | --- |
| [Phenytoin](pk-suite/phenytoin.html) | Part of the PK suite. Adjusts a dose from a level, starts therapy, fits two levels, predicts decline after stopping, plans loading doses and product switches, and interprets levels (including low albumin, renal failure, valproate and CRRT). Uses Michaelis-Menten kinetics. The old standalone address, `phenytoin/`, redirects here. |
| [PK suite](pk-suite/) | Eleven tools sharing one library: aminoglycosides, vancomycin (AUC, Bayesian and two-compartment), vancomycin in hemodialysis, acyclovir, digoxin, theophylline, lithium, phenobarbital, phenytoin, renal and hepatic function, and infusion rates. Each has a Literature model (the default) and a Site model that reproduces pkineticdrugdosing.com. Several also have a Workbook model that reproduces Pierce's spreadsheets. Literature checks and sign-off decisions are in the folder. |

## Using a tool

Open the tool's `index.html` in a browser. The tools are also served at https://vorul.github.io/pk-tools/.

Patient fields start blank every time a tool opens, and the tools never store patient values in the browser; only settings such as units, model and targets are remembered. A value outside the plausible range (for example age 145 or weight 400 kg) holds back the result until you confirm it.

## Tests

The tests are in `pk-suite/tests/`. Run every calculation test from the repository root with Node 18 or later:

```bash
npm test
```

The phenytoin page also has a browser self-check, `pk-suite/tests/phenytoin-ui-smoke.js`: open the page, paste the file into the developer console and press Enter.

## Acknowledgements

The phenytoin tool is based on the phenytoin dosing work of **Marshall Pierce, PharmD**, at [pkineticdrugdosing.com](https://pkineticdrugdosing.com/index.html), including his [phenytoin page](https://pkineticdrugdosing.com/documents/phenytoin.html) and spreadsheet calculators. This repository reimplements those methods; it does not include his files, and any errors are its own.

The equations and worked examples also follow Winter, *Basic Clinical Pharmacokinetics*, 6th ed., chapter 14. Each tool's page lists its full sources.

## Disclaimer

These tools support, and do not replace, clinical judgement. Check every result against the patient, current references and your institution's policies before acting on it. They are provided without warranty of any kind; see the license.

## License

[GNU Affero General Public License v3.0 or later](LICENSE). You may use, change and share the code. If you distribute a modified version, or run one for users over a network (for example on a hospital intranet), you must offer those users its source under the same license.

Linking to these tools from an EMR, or opening them in an embedded browser, does not place the EMR under this license.

**Other licensing:** if the AGPL doesn't suit your organization, for example for EMR or vendor integration, contact the repository owner about a separate license.

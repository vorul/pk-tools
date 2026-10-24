// Entry point so `node --test pk-suite/tests/` works on Node versions that treat a directory
// argument as a module path (Node 22+ on Windows). Loads every *.test.js file in this folder.
const fs = require("node:fs");
const path = require("node:path");
for (const f of fs.readdirSync(__dirname).filter((n) => n.endsWith(".test.js")).sort()) require(path.join(__dirname, f));

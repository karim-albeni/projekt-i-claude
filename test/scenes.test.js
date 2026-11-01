// Headless check: every scene runs to the end, every element it points at exists,
// every chapter in the rail exists, and there are no en or em dashes anywhere.
// Run from the project root: npm i -D jsdom@24 && node test/scenes.test.js
const fs = require("fs");
const { JSDOM } = require("jsdom");

const files = { html: "index.html", appCss: "app.css", siteCss: "site.css", appJs: "app.js", siteJs: "site.js" };
const text = Object.fromEntries(Object.entries(files).map(([key, path]) => [key, fs.readFileSync(path, "utf8")]));
const inlined = text.html
  .replace('<script src="app.js"></script>', () => `<script>${text.appJs}</script>`)
  .replace('<script src="site.js"></script>', () => `<script>${text.siteJs}</script>`);

const errors = [];
const dom = new JSDOM(inlined, {
  runScripts: "dangerously", pretendToBeVisual: true,
  beforeParse(w) {
    w.ResizeObserver = class { observe() {} };
    w.IntersectionObserver = class { observe() {} };
    w.matchMedia = () => ({ matches: true });   // reduced motion, so scenes run instantly
    w.console.error = (e) => errors.push(String((e && e.message) || e));
    w.navigator.clipboard = { writeText: async () => {} };
  }
});
const w = dom.window, d = w.document;

setTimeout(async () => {
  const figures = d.querySelectorAll("figure.player[data-scene]");
  for (const fig of figures) {
    const name = fig.dataset.scene, canvas = fig.querySelector(".canvas");
    try {
      canvas.innerHTML = w.eval(`scenes["${name}"].build()`) + w.eval("OVERLAY");
      const ui = { setCaption() {} };
      await w.eval(`scenes["${name}"]`).run(w.eval("makeHelper")(canvas, () => 1, { instant: true }, ui));
      console.log("OK  ", name);
    } catch (e) { errors.push(name + ": " + e.message); console.log("FAIL", name); }
  }

  const demoLit = d.querySelectorAll(".player-demo .w-sec.lit").length;
  if (demoLit !== 3) errors.push(`demo shows ${demoLit} lit sections, expected 3`);
  else console.log("OK   demo");

  for (const link of d.querySelectorAll(".rail a.ch")) {
    if (!d.querySelector(link.getAttribute("href"))) errors.push("rail link without target: " + link.getAttribute("href"));
  }

  const dashes = Object.values(text).join("").match(/[–—]/g) || [];
  console.log(errors.length ? "ERRORS: " + errors.join(" | ") : "No errors", "| scenes:", figures.length, "| dashes:", dashes.length);
  process.exit(errors.length || dashes.length ? 1 : 0);
}, 50);

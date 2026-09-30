const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

function fixture({ observer = true, footer = true } = {}) {
  const year = { textContent: "2026" };
  const ids = ["work", "approach", "experience"];
  const sections = ids.map((id) => ({ id }));
  const links = ids.map((id) => ({
    attrs: { href: `#${id}` },
    getAttribute(name) { return this.attrs[name]; },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
  }));
  let callback;
  const observed = [];
  class FakeObserver {
    constructor(cb) { callback = cb; }
    observe(element) { observed.push(element); }
  }
  const window = observer ? { IntersectionObserver: FakeObserver } : {};
  const document = {
    querySelectorAll() { return links; },
    querySelector(selector) {
      return selector === "#year" ? (footer ? year : null) : sections.find((section) => `#${section.id}` === selector);
    },
  };
  vm.runInNewContext(source, { window, document, IntersectionObserver: FakeObserver, Date });
  return { year, links, sections, observed, callback };
}

test("updates footer year and observes navigation sections", () => {
  const state = fixture();
  assert.equal(state.year.textContent, String(new Date().getFullYear()));
  assert.deepEqual(state.observed, state.sections);
});

test("updates the current location during repeated section changes", () => {
  const state = fixture();
  for (const i of [0, 2, 1, 0, 0, 2]) {
    state.callback([{ isIntersecting: true, target: state.sections[i] }]);
    state.links.forEach((link, j) => assert.equal(link.attrs["aria-current"], i === j ? "location" : undefined));
  }
});

test("ignores non-intersecting observer entries", () => {
  const state = fixture();
  state.callback([{ isIntersecting: false, target: state.sections[1] }]);
  assert.ok(state.links.every((link) => !link.attrs["aria-current"]));
});

test("supports browsers without IntersectionObserver and a missing footer", () => {
  const state = fixture({ observer: false, footer: false });
  assert.equal(state.observed.length, 0);
});

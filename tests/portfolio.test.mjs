import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  projects,
  getProject,
  projectCategories,
} from "../src/content/projects.ts";
import { experience } from "../src/content/experience.ts";
import { education } from "../src/content/education.ts";

test("the six projects retain the requested order and unique routes", () => {
  assert.deepEqual(
    projects.map((p) => p.slug),
    [
      "kithrelay",
      "campus-mind",
      "braingit",
      "ibm-telco-churn",
      "singhacks-msig",
      "m5-forecasting",
    ],
  );
  assert.equal(new Set(projects.map((p) => p.slug)).size, 6);
  assert.equal(getProject("unknown-project"), undefined);
});
test("every project has a valid public GitHub repository and complete case content", () => {
  for (const p of projects) {
    assert.ok(
      p.preview &&
        p.description &&
        p.approach.length &&
        p.outcomes.length &&
        p.stack.length,
    );
    assert.ok(projectCategories.includes(p.category));
    assert.ok(p.links.some((l) => new URL(l.href).hostname === "github.com"));
    for (const link of p.links)
      assert.equal(new URL(link.href).protocol, "https:");
  }
});
test("deterministic care coordination is not mislabelled as ML", () => {
  assert.equal(getProject("kithrelay").category, "Engineering");
});
test("ML summaries retain evaluation context and precision-recall trade-offs", () => {
  assert.match(
    getProject("ibm-telco-churn").preview,
    /88.5%.*46.4%.*trade-off/,
  );
  assert.match(
    getProject("m5-forecasting").preview,
    /local RMSE.*28-day temporal holdout/,
  );
});
test("work preserves both national service postings and research repository privacy", () => {
  assert.equal(
    experience.filter((r) => r.type === "National Service").length,
    2,
  );
  assert.match(experience[0].repositoryNote, /private/);
  assert.equal(experience[0].links, undefined);
  assert.equal(
    experience[1].links[0].href,
    "https://github.com/singaporetech/r3cap",
  );
  assert.match(experience[0].highlights.join(" "), /local replay benchmark/);
});
test("education retains the confirmed 2028 graduation date", () => {
  assert.match(education[0].end, /2028/);
});
test("resume and red H favicon assets are present", () => {
  assert.equal(
    readFileSync(new URL("../public/resume.pdf", import.meta.url))
      .subarray(0, 5)
      .toString(),
    "%PDF-",
  );
  assert.ok(
    existsSync(new URL("../public/me/bamboo-forest.jpg", import.meta.url)),
  );
  assert.match(
    readFileSync(new URL("../src/app/icon.svg", import.meta.url), "utf8"),
    /#ff1e3c/,
  );
});

test("the global palette and sections after the scoped opening are preserved", () => {
  const css = readFileSync(new URL("../src/styles/globals.css", import.meta.url), "utf8");
  assert.match(css, /--color-accent:\s*#ff1e3c/);
  assert.match(css, /--color-bg-0:\s*#030305/);
  const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  for (const component of ["OpeningSequence", "Marquee", "StatsStrip", "FeaturedRail", "ProjectsBento", "CrawlingBorder"]) {
    assert.ok(page.includes("<" + component), component + " must remain mounted");
  }
  const opening = readFileSync(new URL("../src/components/hero/opening-sequence.tsx", import.meta.url), "utf8");
  assert.match(opening, /<Hero\s/);
  assert.match(opening, /<ManifestoScroll\s/);
  assert.ok(!css.includes(".glitch-word-ghost { display: none"));
});

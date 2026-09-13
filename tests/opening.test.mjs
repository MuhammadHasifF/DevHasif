import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  portalPose,
  cityCamera,
  PORTAL_END,
} from "../src/components/hero/opening-math.ts";

const viewports = [
  [1440, 900],
  [1920, 1080],
  [1366, 768],
  [390, 844],
];
const bounds = { x: 350, y: 310, width: 120, height: 120 / 1.8 };

test("fresh hero hides the city and keeps the portal exactly at its inline origin", () => {
  const p = portalPose(0, bounds, 1440, 900);
  assert.equal(p.cityOpacity, 0);
  assert.equal(p.heroOpacity, 1);
  assert.equal(p.secondaryOpacity, 1);
  assert.equal(p.x, bounds.x + bounds.width / 2);
  assert.equal(p.y, bounds.y + bounds.height / 2);
  assert.equal(p.scale, bounds.width / 180);
  assert.equal(p.descent, 0);
});

test("central slash covers every viewport corner before the portal stage ends", () => {
  for (const [width, height] of viewports) {
    const p = portalPose(PORTAL_END, bounds, width, height);
    for (const x of [0, width])
      for (const y of [0, height]) {
        const gx = (x - p.x) / p.scale + 90,
          gy = (y - p.y) / p.scale + 50;
        // The slash is a parallelogram bounded by x+(y-4)/2 = 106 and 120.
        assert.ok(gy >= 4 && gy <= 96);
        assert.ok(
          gx + (gy - 4) / 2 >= 106 && gx + (gy - 4) / 2 <= 120,
          `${width}x${height}: uncovered corner`,
        );
      }
    assert.equal(p.cityOpacity, 1);
    assert.equal(p.heroOpacity, 0);
    assert.equal(p.edgeOpacity, 0);
  }
});

test("portal geometry is continuous and completely direction-independent", () => {
  const forward = Array.from({ length: 1001 }, (_, i) =>
    portalPose(i / 1000, bounds, 1440, 900),
  );
  for (let i = 1000; i >= 0; i--)
    assert.deepEqual(portalPose(i / 1000, bounds, 1440, 900), forward[i]);
  for (let i = 1; i < forward.length; i++) {
    assert.ok(forward[i].scale >= forward[i - 1].scale);
    assert.ok(Math.abs(forward[i].x - forward[i - 1].x) < 6);
    assert.ok(forward[i].descent >= forward[i - 1].descent);
  }
});

test("camera descends continuously from clouds to below the skyline without an orbit", () => {
  let previous = cityCamera(0);
  assert.equal(previous.y, 365);
  for (let i = 1; i <= 1000; i++) {
    const current = cityCamera(i / 1000);
    assert.ok(current.y < previous.y);
    assert.ok(current.z < previous.z);
    assert.ok(Math.abs(current.x - previous.x) < 0.05);
    assert.ok(Math.abs(current.roll) <= 0.012);
    previous = current;
  }
  assert.equal(previous.y, -48);
  assert.equal(previous.z, -150);
});

test("hero informational copy and links remain intact and old city is unmounted", () => {
  const source = readFileSync(
    new URL("../src/components/hero/hero.tsx", import.meta.url),
    "utf8",
  );
  for (const text of [
    "00 / 07",
    "/ INDEX · MUHAMMAD HASIF",
    "OPEN TO DATA, ML &amp; AI INTERNSHIPS",
    "siteConfig.tagline",
    "View work",
    "Get in touch",
    "Data Analytics / ML / AI",
    "Singapore",
    "SIT · Applied AI",
    "Expected 2028",
    "SCROLL TO BEGIN",
    "SECTIONS",
  ]) {
    assert.ok(source.includes(text), text);
  }
  assert.match(source, /href="\/work"/);
  assert.match(source, /href="\/#contact"/);
  assert.ok(!source.includes("Cityscape"));
  const headline = readFileSync(
    new URL("../src/components/hero/glitch-headline.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(headline.includes("HASIF</>"));
  assert.ok(headline.includes("frozen.current"));
});

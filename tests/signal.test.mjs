import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  captureProgress,
  signalSegment,
} from "../src/components/hero/signal-math.ts";

test("signal begins at the core outlet, never beside or below it", () => {
  const p = signalSegment(715, 11000, 9300, 360, 238, 900, 0.9);
  assert.equal(p.start, 9300 + 360 + (238 * 1.4) / 3.2);
  assert.equal(p.x, 715);
  assert.ok(p.length > 0);
});

test("all 10001 capture samples are continuous, ordered and reversible", () => {
  const frames = Array.from({ length: 10001 }, (_, i) =>
    captureProgress(i / 10000),
  );
  for (let i = 1; i < frames.length; i++) {
    for (const key of ["hand", "grip", "crush", "release"]) {
      const delta = frames[i][key] - frames[i - 1][key];
      assert.ok(delta >= 0 && delta < 0.002, `${key} jumped at ${i}`);
      assert.ok(frames[i][key] >= 0 && frames[i][key] <= 1);
    }
  }
  for (let i = 10000; i >= 0; i--)
    assert.deepEqual(captureProgress(i / 10000), frames[i]);
  assert.equal(captureProgress(0.35).hand, 1);
  assert.equal(captureProgress(0.35).grip, 0);
  assert.equal(captureProgress(0.69).grip, 1);
  assert.equal(captureProgress(0.69).crush, 0);
  assert.equal(captureProgress(0.8).release, 0);
});
test("one stable vertical axis on all four target viewports, forward and reverse", () => {
  for (const [w, h] of [
    [1920, 1080],
    [1440, 900],
    [1366, 768],
    [390, 844],
  ]) {
    const axis = w < 768 ? 48.5 : (w - 10) / 2,
      rail = 12 * h;
    const poses = Array.from({ length: 101 }, (_, i) =>
      signalSegment(
        axis,
        rail,
        9 * h + (i * h) / 20,
        0.4 * h,
        238,
        h,
        Math.min(1, i / 20),
      ),
    );
    for (let i = 100; i >= 0; i--) {
      assert.deepEqual(
        signalSegment(
          axis,
          rail,
          9 * h + (i * h) / 20,
          0.4 * h,
          238,
          h,
          Math.min(1, i / 20),
        ),
        poses[i],
      );
      assert.equal(poses[i].x, axis);
      assert.ok(poses[i].length >= 0);
    }
  }
});
test("document handoff preserves outlet position and rail endpoint exactly", () => {
  const fixed = signalSegment(715, 11000, 9700, 360, 238, 900, 1);
  const flowing = signalSegment(715, 11000, 10300, -240, 238, 900, 1);
  assert.equal(fixed.start, flowing.start);
  assert.equal(flowing.end, 11000);
  assert.equal(signalSegment(48.5, 11000, 9500, 360, 145, 844, 0).length, 0);
});
test("no liquid geometry, curved routing, whole-core crush scaling, or duplicate rail driver", () => {
  const world = readFileSync(
    new URL("../src/components/hero/signal-world.ts", import.meta.url),
    "utf8",
  );
  const story = readFileSync(
    new URL("../src/components/hero/signal-story.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(
    !/CapsuleGeometry|SphereGeometry|CylinderGeometry|core\.scale|const (drops|strands)/.test(
      world,
    ),
    "legacy procedural hand, liquid or whole-core scaling must not return",
  );
  assert.doesNotMatch(
    story,
    /getPointAtLength|strokeDashoffset|pathSamples|\.offsetHeight/,
  );
  assert.match(story, /railX = r\.x \+ r\.width \/ 2/);
  assert.doesNotMatch(story, /lineHeight|style\.height.*lit/);
});

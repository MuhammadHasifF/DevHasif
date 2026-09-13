import test from "node:test";
import assert from "node:assert/strict";
import { createAnimationTimers } from "../src/lib/animation-timers.ts";

test("completed glitch beats release their timer handles", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const timers = createAnimationTimers();
  let beats = 0;
  for (let i = 0; i < 1000; i++) {
    timers.schedule(() => beats++, 70);
    t.mock.timers.tick(70);
    assert.equal(timers.pendingCount, 0);
  }
  assert.equal(beats, 1000);
});

test("cleanup cancels pending beats without executing them", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const timers = createAnimationTimers();
  let calls = 0;
  timers.schedule(() => calls++, 100);
  timers.schedule(() => calls++, 200);
  assert.equal(timers.pendingCount, 2);
  timers.clear();
  t.mock.timers.tick(300);
  assert.equal(timers.pendingCount, 0);
  assert.equal(calls, 0);
});

test("a chained beat retains only its next live timer", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const timers = createAnimationTimers();
  timers.schedule(() => timers.schedule(() => {}, 70), 70);
  t.mock.timers.tick(70);
  assert.equal(timers.pendingCount, 1);
  t.mock.timers.tick(70);
  assert.equal(timers.pendingCount, 0);
});

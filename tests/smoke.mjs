// Non-browser production-route checks. Run against a local production server.
import assert from "node:assert/strict";
import { projects } from "../src/content/projects.ts";
const base = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3040";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Smoke checks must use a local server.",
);
for (const path of [
  "/",
  "/work",
  "/resume",
  "/writing",
  ...projects.map((p) => "/work/" + p.slug),
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) ?? []).length,
    1,
    path + " has one H1",
  );
  assert.match(html, /rel="canonical"/, path + " has a canonical");
  console.log("PASS", path);
}
const home = await (await fetch(base)).text();
for (const id of [
  "main",
  "about",
  "experience",
  "work",
  "skills",
  "credentials",
  "github",
  "contact",
]) {
  assert.ok(
    home.includes('id="' + id + '"'),
    "Missing navigation anchor " + id,
  );
}
for (const [path, type] of [
  ["/resume.pdf", "application/pdf"],
  ["/icon.svg", "image/svg+xml"],
  ["/api/og", "image/png"],
  ["/sitemap.xml", "application/xml"],
  ["/robots.txt", "text/plain"],
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  assert.ok(response.headers.get("content-type")?.includes(type), path);
  console.log("PASS", path, type);
}
assert.equal((await fetch(base + "/work/not-a-project")).status, 404);
// Invalid data only: these checks must never send mail.
const invalid = await fetch(base + "/api/contact", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "", email: "invalid", message: "" }),
});
assert.equal(invalid.status, 400);
const malformed = await fetch(base + "/api/contact", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{",
});
assert.equal(malformed.status, 400);
console.log(
  "PASS anchors, unknown-project 404, invalid/malformed contact rejection",
);

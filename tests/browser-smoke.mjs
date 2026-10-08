import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

// Optional tool: npm install --no-save --package-lock=false playwright
// Or point PLAYWRIGHT_MODULE at an existing Playwright installation.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const evidence = path.resolve("docs/bukti");
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const failures = [];
const checks = [];
page.on("pageerror", error => failures.push(error.message));
const url = process.env.APP_URL || "http://127.0.0.1:3100";
const result = page.getByRole("textbox", { name: "Hasil pemrosesan", exact: true });
async function screenshot(name) { await page.screenshot({ path: path.join(evidence, name), fullPage: true }); }
async function downloadAs(name) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh hasil" }).click();
  const download = await pending;
  const filePath = path.join(evidence, name);
  await download.saveAs(filePath);
  return { filePath, name: download.suggestedFilename(), bytes: await readFile(filePath) };
}
try {
  await page.goto(url);
  if (await page.getByRole("button", { name: "Aktifkan mode gelap" }).count()) await page.getByRole("button", { name: "Aktifkan mode gelap" }).click();
  await page.getByRole("button", { name: "Enkripsi pesan", exact: true }).click();
  await result.waitFor();
  const defaultCipher = await result.inputValue();
  assert.equal(defaultCipher, "LROJLPGXUXJUTMAM");
  checks.push("Default Vigenere sample calculated and rendered");
  await screenshot("01-vigenere-dark.png");

  await page.getByRole("combobox", { name: "Format hasil", exact: true }).selectOption("base64");
  assert.equal(await result.inputValue(), Buffer.from(defaultCipher).toString("base64"));
  await page.getByText("Lihat pesan masukan dan Base64", { exact: true }).click();
  assert.equal(await page.getByRole("textbox", { name: "Pratinjau input", exact: true }).inputValue(), Buffer.from("KRIPTOGRAFI UNSIL").toString("base64"));
  await page.getByRole("button", { name: "Salin hasil", exact: true }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), Buffer.from(defaultCipher).toString("base64"));
  await page.getByRole("button", { name: "Aktifkan mode terang" }).click();
  await screenshot("02-base64-light.png");
  checks.push("Input/output Base64, clipboard and light theme");
  await page.reload();
  await page.getByRole("button", { name: "Aktifkan mode gelap" }).waitFor();

  for (const [algorithm, plaintext] of [["vigenere", "KRIPTOGRAFIUNSIL"], ["autokey", "TEKNIKINFORMATIKA"], ["affine", "UNIVERSITASSILIWANGI"]]) {
    await page.getByLabel("Algoritma", { exact: true }).selectOption(algorithm);
    await page.getByRole("button", { name: "Isi contoh", exact: true }).click();
    await page.getByRole("button", { name: "Enkripsi pesan", exact: true }).click();
    await result.waitFor();
    const cipher = await result.inputValue();
    await page.getByRole("button", { name: "Balikkan proses" }).click();
    await page.getByRole("button", { name: "Dekripsi pesan", exact: true }).click();
    await result.waitFor();
    assert.equal(await result.inputValue(), plaintext);
    checks.push({ algorithm, plaintext, ciphertext: cipher, decrypted: plaintext });
    if (algorithm === "autokey") await screenshot("03-autokey-dekripsi.png");
  }
  await page.getByLabel("Pengali (a)", { exact: true }).fill("13");
  await page.getByRole("button", { name: "Dekripsi pesan", exact: true }).click();
  assert.match(await page.locator(".error-banner[role='alert']").innerText(), /relatif prima/);
  await screenshot("04-affine-validasi.png");
  checks.push("Affine invalid a=13 rejected visibly");

  for (const algorithm of ["vigenere", "autokey", "affine", "extended", "super"]) {
    await page.getByLabel("Algoritma", { exact: true }).selectOption(algorithm);
    await page.getByRole("button", { name: "Isi contoh", exact: true }).click();
    await page.getByRole("button", { name: "Unggah berkas", exact: true }).click();
    const binary = ["extended", "super"].includes(algorithm);
    // Synthetic fixtures exercise the UI. They are not the team's final five-media evidence.
    const bytes = binary ? Buffer.from(Array.from({ length: 1025 }, (_, i) => i % 256)) : Buffer.from("Halo, Dunia! 123\nKriptografi.");
    const filename = binary ? "sintetis.bin" : "contoh.txt";
    await page.locator("#file-input").setInputFiles({ name: filename, mimeType: "application/octet-stream", buffer: bytes });
    await page.getByRole("button", { name: "Enkripsi pesan", exact: true }).click();
    await result.waitFor();
    const encrypted = await downloadAs(`${algorithm}-cipher.dat`);
    assert.equal(encrypted.name, filename.replace(/\.[^.]+$/, ".dat"));
    assert.equal(encrypted.bytes.subarray(0, 4).toString(), "KRIP");
    if (algorithm === "super") await screenshot("05-super-file.png");
    await page.getByRole("button", { name: "Dekripsi", exact: true }).click();
    await page.locator("#file-input").setInputFiles(encrypted.filePath);
    await page.getByRole("button", { name: "Dekripsi pesan", exact: true }).click();
    await result.waitFor();
    const decrypted = await downloadAs(`${algorithm}-restored.${binary ? "bin" : "txt"}`);
    const expected = binary ? bytes : Buffer.from("HALODUNIAKRIPTOGRAFI");
    assert.deepEqual(decrypted.bytes, expected);
    assert.equal(path.extname(decrypted.name), binary ? ".bin" : ".txt");
    checks.push({ algorithm, fileRoundTrip: true, syntheticFixture: true, outputSha256: createHash("sha256").update(decrypted.bytes).digest("hex") });
    if (algorithm === "super") await screenshot("06-super-file-dekripsi.png");
  }

  await page.getByLabel("Algoritma", { exact: true }).selectOption("hill");
  await page.getByRole("button", { name: "Teks langsung", exact: true }).click();
  await page.getByRole("button", { name: "Enkripsi", exact: true }).click();
  await page.locator("#message").fill("HELP");
  await page.getByRole("button", { name: "Enkripsi pesan", exact: true }).click();
  await result.waitFor();
  assert.equal(await result.inputValue(), "HIAT");
  await page.getByRole("button", { name: "Balikkan proses" }).click();
  await page.getByRole("button", { name: "Dekripsi pesan", exact: true }).click();
  await result.waitFor();
  assert.equal(await result.inputValue(), "HELP");
  await page.locator("#message").fill("ABC");
  await page.getByRole("button", { name: "Dekripsi pesan", exact: true }).click();
  assert.match(await page.locator(".error-banner[role='alert']").innerText(), /kelipatan/);
  await screenshot("08-hill.png");
  checks.push({ algorithm: "hill", key: "3 3; 2 5", plaintext: "HELP", ciphertext: "HIAT", decrypted: "HELP", invalidCipherLengthRejected: true });
  await page.getByLabel("Algoritma", { exact: true }).selectOption("vigenere");
  await page.getByRole("button", { name: "Isi contoh", exact: true }).click();
  await page.getByRole("button", { name: "Aktifkan mode gelap" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Enkripsi pesan", exact: true }).click();
  await result.waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await screenshot("07-mobile.png");
  checks.push("390px mobile viewport has no horizontal overflow");
  assert.deepEqual(failures, []);
  await writeFile(path.join(evidence, "browser-results.json"), JSON.stringify({ runAt: new Date().toISOString(), url, browser: browser.version(), checks, pageErrors: failures }, null, 2));
  console.log(`PASS: ${checks.length} browser checks; screenshots and downloads in docs/bukti.`);
} finally { await browser.close(); }

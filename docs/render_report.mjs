import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve("docs/LAPORAN_ANGGOTA_1.html")).href);
  await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
  await page.pdf({ path: "docs/LAPORAN_ANGGOTA_1.pdf", format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
    headerTemplate: "<span></span>", footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#64748b">KriptoLab · Bagian Anggota 1 · <span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
  console.log("PDF rendered: docs/LAPORAN_ANGGOTA_1.pdf");
} finally { await browser.close(); }

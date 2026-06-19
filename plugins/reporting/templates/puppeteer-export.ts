import puppeteer from 'puppeteer';
import path from 'path';

const inputFile = process.argv[2];
const outputFile = process.argv[3] ?? 'rapport.pdf';

if (!inputFile) {
  console.error('Usage: bun puppeteer-export.ts <input.html> [output.pdf]');
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`file://${path.resolve(inputFile)}`, { waitUntil: 'networkidle0' });

await page.pdf({
  path: outputFile,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '1.5cm', bottom: '1.5cm', left: '1.5cm', right: '1.5cm' },
});

await browser.close();
console.log(`PDF generated: ${outputFile}`);

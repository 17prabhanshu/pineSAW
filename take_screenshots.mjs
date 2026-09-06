import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to a standard desktop size
  await page.setViewport({ width: 1440, height: 900 });

  const artifactDir = "/Users/prabhanshushekhar/.gemini/antigravity/brain/cd447ef4-a175-475e-93d4-d9fc846c1e36";

  console.log("Navigating to Command Center...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000)); // wait for animations
  await page.screenshot({ path: join(artifactDir, 'phase4_1_dashboard.png'), fullPage: true });

  console.log("Opening Command Palette...");
  await page.keyboard.down('Meta');
  await page.keyboard.press('k');
  await page.keyboard.up('Meta');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: join(artifactDir, 'phase4_2_command_palette.png') });
  await page.keyboard.press('Escape');

  console.log("Navigating to Investigations...");
  await page.goto('http://localhost:3000/investigations', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000)); // wait for stagger animations
  await page.screenshot({ path: join(artifactDir, 'phase4_3_investigations.png'), fullPage: true });

  await browser.close();
  console.log("Phase 4 Demo Screenshots saved to artifacts.");
})();

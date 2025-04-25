// scripts/save-cookies.js
const { chromium } = require('playwright');
const fs = require('fs-extra');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.linkedin.com/login');
  console.log('🚨 Log in manually and then press ENTER in the terminal...');

  process.stdin.once('data', async () => {
    const cookies = await context.storageState();
    await fs.outputJSON('./data/cookies.json', cookies);
    console.log('✅ Cookies saved!');
    await browser.close();
    process.exit(0);
  });
})();

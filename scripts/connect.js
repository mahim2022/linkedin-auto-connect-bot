const { chromium } = require('playwright');
const fs = require('fs-extra');
require('dotenv').config();

// Utility for random delay
const delay = ms => new Promise(res => setTimeout(res, ms));
const randomDelay = (min = 2000, max = 5000) => delay(Math.floor(Math.random() * (max - min) + min));

(async () => {
  // Load cookies
  const storageState = await fs.readJSON('./data/cookies.json');

  // Launch headless browser with session
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  // Search URL using keyword and location from .env
  const keyword = encodeURIComponent(process.env.SEARCH_KEYWORD);
  const locationUrn = process.env.SEARCH_LOCATION_URN;
  const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${keyword}&geoUrn=%5B${locationUrn}%5D&origin=GLOBAL_SEARCH_HEADER`;

  console.log(`🔍 Navigating to: ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  // Scroll to load more profiles
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 1000);
    await randomDelay(1000, 2000);
  }

  // Find all "Connect" buttons
  const connectButtons = await page.$$('button:has-text("Connect")');
  console.log(`🔗 Found ${connectButtons.length} connect buttons.`);

  for (const button of connectButtons) {
    try {
      await button.scrollIntoViewIfNeeded();
      await randomDelay();

      // Click "Connect"
      await button.click();
      await page.waitForTimeout(1000);

      // Click "Send" on the dialog (no message)
      const sendBtn = await page.$('button:has-text("Send")');
      if (sendBtn) {
        await sendBtn.click();
        console.log('✅ Sent connection request (no message).');
      } else {
        console.log('⚠️ Could not find Send button.');
      }

      await randomDelay(3000, 6000);
    } catch (err) {
      console.log('❌ Error sending connection:', err.message);
      continue;
    }
  }

  await browser.close();
})();

const { chromium } = require('playwright');
const fs = require('fs-extra');
require('dotenv').config();

// Utility for random delay
const delay = ms => new Promise(res => setTimeout(res, ms));
const randomDelay = (min = 2000, max = 5000) => delay(Math.floor(Math.random() * (max - min) + min));

(async () => {
  try {
    console.log('🔄 Starting the LinkedIn automation bot...');
  
    // Load cookies
    console.log('📂 Loading cookies from ./data/cookies.json...');
    const storageState = await fs.readJSON('./data/cookies.json');
    console.log('✔️ Cookies loaded successfully.');
  
    // Launch headless browser with session
    console.log('🌐 Launching the browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    console.log('✔️ Browser launched successfully.');

    // Search URL using keyword and location from .env
    const keyword = encodeURIComponent(process.env.SEARCH_KEYWORD);
    const locationUrn = process.env.SEARCH_LOCATION_URN;
    const networkFilter = process.env.SEARCH_NETWORK || 'f'; // f = 2nd degree by default
    // Build network part dynamically
    const networkQuery = `network%5B%5D=${networkFilter}`;

    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${keyword}&geoUrn=%5B${locationUrn}%5D&${networkQuery}&origin=GLOBAL_SEARCH_HEADER`;


    console.log(`🔍 Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    console.log('✔️ Page loaded successfully.');
    
    // Scroll to load more profiles
    console.log('🔄 Scrolling to load more profiles...');
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 1000);
      console.log(`⏳ Scroll iteration: ${i + 1}`);
      await randomDelay(1000, 2000);
    }

    // Find all "Connect" buttons
    console.log('🔍 Finding all "Connect" buttons...');
    const connectButtons = await page.$$('button:has-text("Connect")');
    console.log(`🔗 Found ${connectButtons.length} connect buttons.`);

    // Loop through each connect button
    for (const button of connectButtons) {
      try {
        console.log('🔘 Found a connect button, attempting to click...');
        await button.scrollIntoViewIfNeeded();
        await randomDelay();

        // Click "Connect"
        console.log('✋ Clicking "Connect" button...');
        await button.click();
        await page.waitForTimeout(1000);
        console.log('✔️ "Connect" button clicked.');

        // Click "Send" on the dialog (no message)
        console.log('🔍 Looking for "Send" button...');
        const sendBtn = await page.$('button:has-text("Send")');
        if (sendBtn) {
          await sendBtn.click();
          console.log('✅ Sent connection request (no message).');
        } else {
          console.log('⚠️ Could not find "Send" button.');
        }

        await randomDelay(3000, 6000);
      } catch (err) {
        console.log(`❌ Error sending connection: ${err.message}`);
        continue;
      }
    }

    console.log('🔚 All connection requests sent.');
    await browser.close();
    console.log('✔️ Browser closed successfully.');
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
})();

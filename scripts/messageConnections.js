const { chromium } = require('playwright');
const fs = require('fs-extra');
require('dotenv').config();

const delay = ms => new Promise(res => setTimeout(res, ms));
const randomDelay = (min = 2000, max = 4000) => delay(Math.floor(Math.random() * (max - min + 1)) + min);

(async () => {
  console.log('🌐 Launching browser...');
  const storageState = await fs.readJSON('./data/cookies.json');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  const connectionsUrl = 'https://www.linkedin.com/mynetwork/invite-connect/connections/';
  const sentLogPath = './data/sent_log.json';
  let sentProfiles = fs.existsSync(sentLogPath) ? await fs.readJSON(sentLogPath) : [];

  console.log('🔎 Navigating to your LinkedIn connections page...');
  await page.goto(connectionsUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('a[href*="/in/"]');

  // Scroll to load more connections
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 2000);
    await randomDelay(1000, 2000);
  }

  const profileLinks = await page.$$eval('a[href*="/in/"]', links =>
    Array.from(new Set(links.map(link => link.href.split('?')[0])))
  );
  console.log(`🔗 Found ${profileLinks.length} connections.`);

  for (const profileUrl of profileLinks) {
    try {
      if (sentProfiles.includes(profileUrl)) {
        console.log(`↪️ Already messaged: ${profileUrl}`);
        continue;
      }

      // Close open message chat window before visiting next profile
      // Close all open message overlays
const closeButtons = await page.$$('button.msg-overlay-bubble-header__control');
for (const btn of closeButtons) {
  await btn.click();
  await delay(500); // short delay between clicks
}



      console.log(`➡️ Visiting: ${profileUrl}`);
      await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('domcontentloaded');

      // Try the primary "Message" button
      const messageBtn = await page.waitForSelector('button.WVrXrNuuCTPvccbqOFfIyRueqgEonLwHrY:has-text("Message")', { timeout: 10000 }).catch(() => null);

      // If not found, try from the "More" menu
      if (!messageBtn) {
        const moreBtn = await page.$('button[aria-label*="More actions"]');
        if (moreBtn) {
          await moreBtn.click();
          await delay(1000);
          messageBtn = await page.$('div[role="menu"] button:has-text("Message")');
        }
      }

      if (messageBtn) {
        await messageBtn.scrollIntoViewIfNeeded();
        await randomDelay();
        await messageBtn.click();
        console.log('✅ Opened message box.');

        // Wait for overlay loaders to disappear (if any)
        await page.waitForSelector('.msg-connection-typeahead__loader', { state: 'detached', timeout: 5000 }).catch(() => {});

        // Type and send the message
        const inputBox = await page.waitForSelector('div.msg-form__contenteditable', { timeout: 10000 });
        await inputBox.click();
        await page.keyboard.type(process.env.MESSAGE_TEXT || 'Hi, great to connect!');
        await randomDelay();

        const sendBtn = await page.waitForSelector('button.msg-form__send-button', { timeout: 5000 });
        await sendBtn.click();
        console.log('📨 Message sent.');

        // Log this profile to skip in future runs
        sentProfiles.push(profileUrl);
        await fs.writeJSON(sentLogPath, sentProfiles);
      } else {
        console.log('⚠️ Message button not visible for this profile. Skipping.');
      }

      await randomDelay(3000, 5000);
    } catch (err) {
      console.log(`❌ Error at profile ${profileUrl}:`, err.message);
    }
  }

  await browser.close();
  console.log('🏁 Done!');
})();

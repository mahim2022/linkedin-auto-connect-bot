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
      console.log(`➡️ Visiting: ${profileUrl}`);
      await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });

    // const messageBtn = await page.waitForSelector('button.message-anywhere-button, button.pvs-profile-actions__action', { timeout: 10000 }).catch(() => null);

    const messageBtn = await page.waitForSelector('button.WVrXrNuuCTPvccbqOFfIyRueqgEonLwHrY:has-text("Message")', { timeout: 10000 }).catch(() => null);

    // If not found, click the "More" button first
if (!messageBtn) {
    const moreBtn = await page.$('button[aria-label*="More actions"]');
    if (moreBtn) {
      await moreBtn.click();
      await page.waitForTimeout(1000); // Wait a little for the menu to open
      messageBtn = await page.$('div[role="menu"] button:has-text("Message")');
    }
  }
  


      if (messageBtn) {
        await messageBtn.scrollIntoViewIfNeeded();
        await randomDelay();
        await messageBtn.click();
        console.log('✅ Opened message box.');

        // Wait for the message input and type message
        const inputBox = await page.waitForSelector('div.msg-form__contenteditable', { timeout: 10000 });
        await inputBox.click();
        // await inputBox.click({ clickCount: 3 });
        await page.keyboard.type(process.env.MESSAGE_TEXT || 'Hi, great to connect!');
        await randomDelay();

        const sendBtn = await page.waitForSelector('button.msg-form__send-button', { timeout: 5000 });
        await sendBtn.click();
        console.log('📨 Message sent.');
      } else {
        console.log('⚠️ Message button not visible for this profile. Skipping.');
      }

      await randomDelay(3000, 5000);
    } catch (err) {
      console.log('❌ Error processing profile:', err.message);
    }
  }

  await browser.close();
  console.log('🏁 Done!');
})();

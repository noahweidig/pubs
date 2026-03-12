const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + process.cwd() + '/index.html');
  await page.screenshot({ path: 'before.png', fullPage: true });

  await page.addStyleTag({ content: '.entry { content-visibility: auto; contain-intrinsic-size: auto 200px; }' });
  await page.screenshot({ path: 'after.png', fullPage: true });

  await browser.close();
})();

const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR MESSAGE:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await page.goto('http://localhost:5173/login');
  
  await page.type('input[type="text"]', 'admin');
  await page.type('input[type="password"]', '123456rR%');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  
  await page.goto('http://localhost:5173/venda-balcao');
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();

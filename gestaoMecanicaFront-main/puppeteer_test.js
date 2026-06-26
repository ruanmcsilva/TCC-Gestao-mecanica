const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Listen for console errors
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await page.goto('http://localhost:5173/login');
  
  // Login
  await page.type('input[type="email"]', 'admin');
  await page.type('input[type="password"]', '123456rR%');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  
  // Go to venda balcao
  await page.goto('http://localhost:5173/venda-balcao');
  
  // Wait a bit to see if error happens
  await new Promise(r => setTimeout(r, 2000));
  
  // Click somewhere?
  console.log("Done waiting");
  
  await browser.close();
})();

const { chromium } = require("playwright");
const xml2js = require("xml2js");

(async () => {
  const browser = await chromium.launch({ headless: false }); // the browser will be visible
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://reddit.com/r/ukrainianconflict.rss");

  // Get the content of the <pre> tag
  const preContent = await page.$eval("pre", (pre) => pre.textContent);

  const parser = new xml2js.Parser();
  parser.parseString(preContent, (err, result) => {
    if (err) {
      console.error("Error parsing XML", err);
    } else {
      const items = result.feed.entry.slice(0, 15);
      const titles = items.map((item) => item.title[0]);
      console.log(titles);
    }
  });

  await browser.close();
})();

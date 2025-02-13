const { chromium } = require("playwright");
const fs = require("fs").promises;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://memeorandum.com/");
  await page.waitForSelector("div.ii");

  const divContents = await page.$$eval("div.ii", (divs) =>
    divs.map((div) => ({
      text: div.textContent,
      url: div.querySelector("a") ? div.querySelector("a").href : null,
    }))
  );

  console.log(divContents);

  // Write divContents to memeorandum.json
  await fs.writeFile(
    "public/memeorandum.json",
    JSON.stringify(divContents, null, 2)
  );

  await browser.close();
})();

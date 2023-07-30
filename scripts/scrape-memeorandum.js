const { chromium } = require("playwright");
const fs = require("fs").promises; // Import the promises version of fs

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

  // Write divContents to output.json
  await fs.writeFile(
    "public/output.json",
    JSON.stringify(divContents, null, 2)
  );

  await browser.close();
})();

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sql from "./db.mjs";
import fetch from "node-fetch";

const __dirname = dirname(fileURLToPath(import.meta.url));
const openaiEndpoint =
  "https://api.openai.com/v1/engines/davinci-codex/completions";
const openaiKey = process.env.OPENAI_KEY;

async function getTranslation(summaryText) {
  const instructions =
    "Please summarise this line of text as a news headline: ";
  const response = await fetch(openaiEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: instructions + summaryText,
      max_tokens: 60,
    }),
  });

  const data = await response.json();

  if (!data.choices) {
    console.error("Unexpected response from OpenAI API:", data);
    throw new Error("Unexpected response from OpenAI API");
  }

  return data.choices[0].text.trim();
}

async function urlExists(url) {
  console.log(`Checking if URL exists: ${url}`);
  const result = await sql`
    SELECT *
    FROM arbiter_v1
    WHERE url = ${url}
  `;
  console.log(`Finished checking if URL exists: ${url}`);
  return result;
}

async function insertUrl(summary) {
  console.log(`Inserting URL: ${summary.url}`);
  const translatedSummary = await getTranslation(summary.text);
  const result = await sql`
    INSERT INTO arbiter_v1 (url, summary_raw, summary_translated)
    VALUES (${summary.url}, ${summary.text}, ${translatedSummary})
    RETURNING *
  `;
  console.log(`Finished inserting URL: ${summary.url}`);
  return result;
}

async function main() {
  // Read your data
  const data = JSON.parse(
    readFileSync(join(__dirname, "../public/output.json"), "utf-8")
  );

  let pendingUrls = data.map((item) => item.url);

  console.log(`Total URLs: ${pendingUrls.length}`);
  console.log(`Pending URLs:`, pendingUrls);

  // Iterate over the data
  for (let i = 0; i < data.length; i++) {
    const summary = data[i];

    try {
      const result = await urlExists(summary.url);

      if (result.length > 0) {
        console.log(`URL exists: ${summary.url}`);
        getTranslation("Tell me a joke");
        console.log("GPT called");
      } else {
        console.log(`URL does not exist: ${summary.url}`);

        try {
          const insertResult = await insertUrl(summary);
          console.log("Inserted new URL:", insertResult[0].url);
        } catch (insertErr) {
          console.error("Error inserting new URL:", insertErr);
        }
      }

      // Remove the URL from the pendingUrls array
      pendingUrls = pendingUrls.filter((url) => url !== summary.url);

      console.log(`Remaining URLs: ${pendingUrls.length}`);
      console.log(`Pending URLs:`, pendingUrls);

      // If there are no more pending URLs, terminate the script
      if (pendingUrls.length === 0) {
        console.log("All URLs processed. Terminating script.");
        process.exit(0);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

main();

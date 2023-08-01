import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sql from "./db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function urlExists(url) {
  const result = await sql`
    SELECT *
    FROM arbiter_v1
    WHERE url = ${url}
  `;
  return result;
}

async function insertUrl(summary) {
  const result = await sql`
    INSERT INTO arbiter_v1 (url, summary_raw)
    VALUES (${summary.url}, ${summary.text})
    RETURNING *
  `;
  return result;
}

async function main() {
  // Read your data
  const data = JSON.parse(
    readFileSync(join(__dirname, "../public/output.json"), "utf-8")
  );

  // Iterate over the data
  for (let i = 0; i < data.length; i++) {
    const summary = data[i];

    try {
      const result = await urlExists(summary.url);

      if (result.length > 0) {
        console.log(`URL exists: ${summary.url}`);
      } else {
        console.log(`URL does not exist: ${summary.url}`);

        try {
          const insertResult = await insertUrl(summary);
          console.log("Inserted new URL:", insertResult[0].url);
        } catch (insertErr) {
          console.error("Error inserting new URL:", insertErr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}

main();

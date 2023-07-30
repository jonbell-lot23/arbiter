import { createClient } from "@supabase/supabase-js";
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

async function insertUrl(url) {
  const result = await sql`
    INSERT INTO arbiter_v1 (url, summary_raw)
    VALUES (${url}, '')
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
    const url = data[i]; // Adjust depending on your data structure

    urlExists(url)
      .then((result) => {
        if (result.length > 0) {
          console.log(`URL exists: ${url}`);
        } else {
          console.log(`URL does not exist: ${url}`);
          insertUrl(url)
            .then((insertResult) =>
              console.log("Inserted new URL:", insertResult)
            )
            .catch((insertErr) =>
              console.error("Error inserting new URL:", insertErr)
            );
        }
      })
      .catch((err) => console.error(err));
  }
}

main();

main();

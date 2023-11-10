import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sql from "./db.mjs";
import fetch from "node-fetch";
import { config } from "dotenv";
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const openaiEndpoint = "https://api.openai.com/v1/chat/completions";
const openaiKey = process.env.OPENAI_KEY;

async function getTranslation(headlines) {
  const instructions =
    "Please summarise the last week's news. These are the headlines to summarise.";
  const response = await fetch(openaiEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: headlines.join("\n") },
      ],
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (
    !data.choices ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    console.error("Unexpected response from OpenAI API:", data);
    throw new Error("Unexpected response from OpenAI API");
  }

  return data.choices[0].message.content.trim();
}

async function getHeadlines() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const result = await sql`
    SELECT summary_raw
    FROM arbiter_v1
    WHERE created_at >= ${oneWeekAgo}
  `;

  return result.map((row) => row.summary_raw);
}

async function main() {
  const headlines = await getHeadlines();
  const summary = await getTranslation(headlines);
  console.log(summary);
}

main();

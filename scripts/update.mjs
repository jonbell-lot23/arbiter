import { createClient } from "@supabase/supabase-js";
import { Configuration, OpenAIApi } from "openai";
import { readFileSync } from "fs";

import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup OpenAI
const openai = new OpenAIApi(
  new Configuration({
    apiKey: "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",
  })
);

// Setup Supabase
const supabaseUrl = "https://stmbjgygayliaaaqiqrz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bWJqZ3lnYXlsaWFhYXFpcXJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODA4MDMwMiwiZXhwIjoxOTkzNjU2MzAyfQ.nNXqdv0Z5uRSIEZ8mVEyXddieoyAjxrNdKFSMN_z_mU";
const supabase = createClient(supabaseUrl, supabaseKey);

// Your existing generateSummary function
async function generateSummary(prompt) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.4,
    max_tokens: 100,
  });
  return completion.data.choices[0].text;
}

async function main() {
  // Read your data
  const data = JSON.parse(
    readFileSync(join(__dirname, "../public/output.json"), "utf-8")
  );

  // Iterate over the data
  for (let i = 0; i < data.length; i++) {
    const url = data[i]; // Adjust depending on your data structure
    const prompt = `Summarise this neutrally and in a news-oriented way. No drama. Try to keep it to two sentences. People viewing it should understand the news story, so make sure it's not vague. ${url}`;
    const summary = await generateSummary(prompt);

    // Check if URL already exists in the database
    const { data: exists, error } = await supabase
      .from("arbiter_v1")
      .select("id")
      .eq("url", url)
      .single();

    // If error occurred during the query
    if (error) {
      console.error("Error querying database:", error);
      continue;
    }

    // If it doesn't exist, insert it into the database
    if (!exists) {
      const { error: insertError } = await supabase
        .from("arbiter_v1")
        .insert([{ url: url, summary_raw: summary }]);

      if (insertError) {
        console.error("Error inserting into database:", insertError);
      }
    }
  }
}

main();

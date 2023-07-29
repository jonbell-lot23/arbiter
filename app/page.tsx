"use client";
import { useEffect, useState } from "react";
import { generateSummary } from "./callOpenai";
import outputText from "../public/output.json";

export default function Page() {
  const data = outputText;
  const [summaries, setSummaries] = useState<string[]>([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      let tempSummaries: (string | undefined)[] = [];
      for (let i = 0; i < data.length; i++) {
        const prompt = `Summarise this neutrally and in a news-oriented way. No drama, just news.  ${data[i]}`;
        const summary = await generateSummary(prompt);
        tempSummaries.push(summary);
      }
      setSummaries(
        tempSummaries.filter(
          (summary): summary is string => summary !== undefined
        )
      );
    };
    fetchSummaries();
  }, [data]);

  return (
    <div>
      <div className="mt-3 ml-3 font-bold text-green-600">Memeorandum Lite</div>
      {summaries.map((item, index) => (
        <div key={index} className="m-3 text-md">
          {item}
        </div>
      ))}
    </div>
  );
}

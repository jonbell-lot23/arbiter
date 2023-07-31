"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://stmbjgygayliaaaqiqrz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bWJqZ3lnYXlsaWFhYXFpcXJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3ODA4MDMwMiwiZXhwIjoxOTkzNjU2MzAyfQ.nNXqdv0Z5uRSIEZ8mVEyXddieoyAjxrNdKFSMN_z_mU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Page() {
  const [summaries, setSummaries] = useState<string[]>([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const { data, error } = await supabase
        .from("arbiter_v1")
        .select("summary_raw")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching summaries:", error);
        return;
      }

      setSummaries(data.map((item) => item.summary_raw));
    };

    fetchSummaries();
  }, []);

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

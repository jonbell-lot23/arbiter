import { config } from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

if (process.env.NODE_ENV !== "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  config({ path: `${__dirname}/../.env.local` });
}

console.log(process.env.NEXT_PUBLIC_PG_CONNECTION_STRING);

const connectionString = process.env.NEXT_PUBLIC_PG_CONNECTION_STRING;
const sql = postgres(connectionString);

export default sql;

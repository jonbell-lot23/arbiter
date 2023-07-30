import postgres from "postgres";

const connectionString =
  "postgresql://postgres:jupkej-wadse1-pebpiP@db.stmbjgygayliaaaqiqrz.supabase.co:5432/postgres";
const sql = postgres(connectionString);

export default sql;

import sql from "./db.mjs";

async function getUsersOver(age) {
  const users = await sql`
    select *
    from arbiter_v1
  `;
  return users;
}

// Call the function and log the results
getUsersOver(20)
  .then((users) => console.log(users))
  .catch((err) => console.error(err));

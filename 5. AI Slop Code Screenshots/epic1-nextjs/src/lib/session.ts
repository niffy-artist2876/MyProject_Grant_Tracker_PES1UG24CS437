import "server-only";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { getUser, listUsers, type User } from "./ledger";

// PLACEHOLDER UNTIL AUTHENTICATION IS BUILT.
// The current user is whichever seeded user the "uid" cookie names, and anyone
// can switch. This exists only so both roles can be exercised in development.
export const USER_COOKIE = "uid";

export async function getCurrentUser(): Promise<User> {
  const db = getDb();
  const id = Number((await cookies()).get(USER_COOKIE)?.value);
  return (Number.isInteger(id) && getUser(db, id)) || listUsers(db)[0];
}

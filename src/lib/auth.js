
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { pool } from "@/lib/db";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("artfra_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  const result = await pool.query(
    `SELECT id, username, display_name, email, role, curator_status
     FROM users
     WHERE id = $1 AND is_active = TRUE`,
    [session.id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function requireAuth() {
  return await getUser();
}

export async function requireRole(role) {
  const user = await getUser();

  if (!user || user.role !== role) {
    return null;
  }

  return user;
}

export async function requireApprovedCurator() {
  const user = await getUser();

  if (
    !user ||
    user.role !== "curator" ||
    user.curator_status !== "approved"
  ) {
    return null;
  }

  return user;
}

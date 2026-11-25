
import { pool } from "@/lib/db";

export async function createNotification({
  userId,
  type,
  message,
  link = null,
}) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, link)
       VALUES ($1, $2, $3, $4)`,
      [userId, type, message, link]
    );
  } catch (error) {
    console.error("Create notification error:", error);
  }
}

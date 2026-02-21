import { getDb } from "./db";
import {
  messages,
  type InsertMessage,
  type Message,
} from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function getMessages(pageUrl: string): Promise<Message[]> {
  const db = getDb();
  return await db
    .select()
    .from(messages)
    .where(eq(messages.pageUrl, pageUrl))
    .orderBy(desc(messages.createdAt))
    .limit(100);
}

export async function createMessage(insertMessage: InsertMessage): Promise<Message> {
  const db = getDb();
  const [message] = await db
    .insert(messages)
    .values(insertMessage)
    .returning();
  return message;
}

export async function getMessageById(id: number): Promise<Message | undefined> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  return row;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.delete(messages).where(eq(messages.id, id));
  return (result.rowCount ?? 0) > 0;
}

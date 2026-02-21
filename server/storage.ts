import { db } from "./db";
import {
  messages,
  type InsertMessage,
  type Message
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getMessages(pageUrl: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageById(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(pageUrl: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.pageUrl, pageUrl))
      .orderBy(desc(messages.createdAt))
      .limit(100);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    const [row] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);
    return row;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
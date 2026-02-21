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
}

export class DatabaseStorage implements IStorage {
  async getMessages(pageUrl: string): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.pageUrl, pageUrl))
      .orderBy(desc(messages.createdAt))
      .limit(100);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
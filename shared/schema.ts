import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Credit Report schema
export const creditReports = pgTable("credit_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  bureau: text("bureau").notNull(), // Experian, Equifax, TransUnion
  reportDate: timestamp("report_date").defaultNow(),
  reportDetails: jsonb("report_details"),
});

export const insertCreditReportSchema = createInsertSchema(creditReports).omit({
  id: true,
});

// Dispute schema
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  creditorName: text("creditor_name").notNull(),
  accountNumber: text("account_number"),
  disputeType: text("dispute_type").notNull(), // UCC Article 8, UCC Article 9
  reason: text("reason").notNull(),
  status: text("status").notNull(), // In Progress, Resolved, Rejected
  dateFiled: timestamp("date_filed").defaultNow(),
  dateResolved: timestamp("date_resolved"),
  documentPath: text("document_path"),
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  dateResolved: true,
});

// Trust Document schema
export const trustDocuments = pgTable("trust_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trustName: text("trust_name").notNull(),
  trustType: text("trust_type").notNull(), // Living, Revocable, Irrevocable
  trusteeNames: text("trustee_names").array(),
  beneficiaryNames: text("beneficiary_names").array(),
  assetsList: jsonb("assets_list"),
  dateCreated: timestamp("date_created").defaultNow(),
  documentPath: text("document_path"),
});

export const insertTrustDocumentSchema = createInsertSchema(trustDocuments).omit({
  id: true,
});

// EIN Application schema
export const einApplications = pgTable("ein_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entityName: text("entity_name").notNull(),
  entityType: text("entity_type").notNull(), // Trust, LLC, Corporation
  responsibleParty: text("responsible_party").notNull(),
  einNumber: text("ein_number"),
  applicationStatus: text("application_status").notNull(), // Draft, Submitted, Approved
  submissionDate: timestamp("submission_date"),
  approvalDate: timestamp("approval_date"),
  documentPath: text("document_path"),
});

export const insertEINApplicationSchema = createInsertSchema(einApplications).omit({
  id: true,
  einNumber: true,
  approvalDate: true,
});

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentName: text("document_name").notNull(),
  documentType: text("document_type").notNull(), // Dispute, Trust, EIN, Report
  filePath: text("file_path").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  fileSize: integer("file_size"),
  isTemplate: boolean("is_template").default(false),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadDate: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // Alert, Reminder, Update
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Stock schema
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  company: text("company").notNull(),
  quantity: integer("quantity"),
  purchasePrice: text("purchase_price"),
  addedDate: timestamp("added_date").defaultNow(),
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  addedDate: true,
});

// News schema
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // Financial Regulation, Market News, Legal Updates
  imageUrl: text("image_url"),
  publishDate: timestamp("publish_date").defaultNow(),
  source: text("source"),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  publishDate: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CreditReport = typeof creditReports.$inferSelect;
export type InsertCreditReport = z.infer<typeof insertCreditReportSchema>;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;

export type TrustDocument = typeof trustDocuments.$inferSelect;
export type InsertTrustDocument = z.infer<typeof insertTrustDocumentSchema>;

export type EINApplication = typeof einApplications.$inferSelect;
export type InsertEINApplication = z.infer<typeof insertEINApplicationSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

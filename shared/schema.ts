import { pgTable, text, serial, integer, timestamp, boolean, jsonb, primaryKey, varchar } from "drizzle-orm/pg-core";
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

// User roles (staff/client)
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // "client", "worker", "admin"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

// Service types
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  estimatedTimeInDays: integer("estimated_time_in_days").notNull(),
  active: boolean("active").default(true),
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
});

// Client service requests
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(), // References users.id
  serviceTypeId: integer("service_type_id").notNull(), // References service_types.id
  status: text("status").notNull(), // "pending", "assigned", "in_progress", "completed", "cancelled"
  notes: text("notes"),
  requestDate: timestamp("request_date").defaultNow(),
  desiredCompletionDate: timestamp("desired_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  priority: text("priority").default("normal"), // "low", "normal", "high", "urgent"
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  requestDate: true,
  actualCompletionDate: true,
});

// Task assignments for workers
export const taskAssignments = pgTable("task_assignments", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(), // References service_requests.id
  workerId: integer("worker_id").notNull(), // References users.id (with worker role)
  assignedDate: timestamp("assigned_date").defaultNow(),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull(), // "assigned", "in_progress", "on_hold", "completed", "cancelled"
  notes: text("notes"),
  timeSpentInMinutes: integer("time_spent_in_minutes").default(0),
});

export const insertTaskAssignmentSchema = createInsertSchema(taskAssignments).omit({
  id: true,
  assignedDate: true,
  completedDate: true,
});

// Progress updates for service requests
export const progressUpdates = pgTable("progress_updates", {
  id: serial("id").primaryKey(),
  taskAssignmentId: integer("task_assignment_id").notNull(), // References task_assignments.id
  updateDate: timestamp("update_date").defaultNow(),
  percentComplete: integer("percent_complete").notNull(),
  description: text("description").notNull(),
  createdBy: integer("created_by").notNull(), // References users.id
  attachmentPath: text("attachment_path"),
});

export const insertProgressUpdateSchema = createInsertSchema(progressUpdates).omit({
  id: true,
  updateDate: true,
});

// Comments on service requests
export const serviceComments = pgTable("service_comments", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(), // References service_requests.id
  userId: integer("user_id").notNull(), // References users.id
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isInternal: boolean("is_internal").default(false), // If true, only visible to workers
});

export const insertServiceCommentSchema = createInsertSchema(serviceComments).omit({
  id: true,
  createdAt: true,
});

// Dispute Letter Category schema
export const disputeLetterCategories = pgTable("dispute_letter_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  count: integer("count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDisputeLetterCategorySchema = createInsertSchema(disputeLetterCategories).omit({
  id: true,
  count: true,
  createdAt: true,
});

// Dispute Letter Template schema
export const disputeLetterTemplates = pgTable("dispute_letter_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  tags: text("tags").array(),
  uploadedBy: integer("uploaded_by").notNull(),
  dateAdded: timestamp("date_added").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const insertDisputeLetterTemplateSchema = createInsertSchema(disputeLetterTemplates).omit({
  id: true,
  dateAdded: true,
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

export type DisputeLetterCategory = typeof disputeLetterCategories.$inferSelect;
export type InsertDisputeLetterCategory = z.infer<typeof insertDisputeLetterCategorySchema>;

export type DisputeLetterTemplate = typeof disputeLetterTemplates.$inferSelect;
export type InsertDisputeLetterTemplate = z.infer<typeof insertDisputeLetterTemplateSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;

export type ProgressUpdate = typeof progressUpdates.$inferSelect;
export type InsertProgressUpdate = z.infer<typeof insertProgressUpdateSchema>;

export type ServiceComment = typeof serviceComments.$inferSelect;
export type InsertServiceComment = z.infer<typeof insertServiceCommentSchema>;

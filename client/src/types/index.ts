export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface CreditReport {
  id: number;
  userId: number;
  score: number;
  bureau: string;
  reportDate: string;
  reportDetails?: any;
}

export interface Dispute {
  id: number;
  userId: number;
  creditorName: string;
  accountNumber?: string;
  disputeType: string;
  reason: string;
  status: string;
  dateFiled: string;
  dateResolved?: string;
  documentPath?: string;
}

export interface TrustDocument {
  id: number;
  userId: number;
  trustName: string;
  trustType: string;
  trusteeNames: string[];
  beneficiaryNames: string[];
  assetsList?: any;
  dateCreated: string;
  documentPath?: string;
}

export interface EINApplication {
  id: number;
  userId: number;
  entityName: string;
  entityType: string;
  responsibleParty: string;
  einNumber?: string;
  applicationStatus: string;
  submissionDate?: string;
  approvalDate?: string;
  documentPath?: string;
}

export interface Document {
  id: number;
  userId: number;
  documentName: string;
  documentType: string;
  filePath: string;
  uploadDate: string;
  fileSize?: number;
  isTemplate: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  dueDate?: string;
}

export interface Stock {
  id: number;
  userId: number;
  symbol: string;
  company: string;
  quantity?: number;
  purchasePrice?: string;
  addedDate: string;
  currentPrice?: string;
  change?: string;
  changePercent?: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  publishDate: string;
  source?: string;
}

export type DisputeType = 'UCC Article 8' | 'UCC Article 9';
export type DisputeStatus = 'In Progress' | 'Resolved' | 'Rejected';
export type TrustType = 'Living' | 'Revocable' | 'Irrevocable';
export type EntityType = 'Trust' | 'LLC' | 'Corporation';
export type ApplicationStatus = 'Draft' | 'Submitted' | 'Approved';
export type DocumentType = 'Dispute' | 'Trust' | 'EIN' | 'Report';
export type NotificationType = 'Alert' | 'Reminder' | 'Update';
export type CreditBureau = 'Experian' | 'Equifax' | 'TransUnion';
export type NewsCategory = 'Financial Regulation' | 'Market News' | 'Legal Updates';

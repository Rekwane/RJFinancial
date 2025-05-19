import {
  users, type User, type InsertUser,
  creditReports, type CreditReport, type InsertCreditReport,
  disputes, type Dispute, type InsertDispute,
  trustDocuments, type TrustDocument, type InsertTrustDocument,
  einApplications, type EINApplication, type InsertEINApplication,
  documents, type Document, type InsertDocument,
  notifications, type Notification, type InsertNotification,
  stocks, type Stock, type InsertStock,
  news, type News, type InsertNews,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Credit report operations
  getCreditReportsByUserId(userId: number): Promise<CreditReport[]>;
  getCreditReportById(id: number): Promise<CreditReport | undefined>;
  createCreditReport(report: InsertCreditReport): Promise<CreditReport>;
  
  // Dispute operations
  getDisputesByUserId(userId: number): Promise<Dispute[]>;
  getDisputeById(id: number): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDisputeStatus(id: number, status: string, dateResolved?: Date): Promise<Dispute | undefined>;
  
  // Trust document operations
  getTrustDocumentsByUserId(userId: number): Promise<TrustDocument[]>;
  getTrustDocumentById(id: number): Promise<TrustDocument | undefined>;
  createTrustDocument(trustDoc: InsertTrustDocument): Promise<TrustDocument>;
  
  // EIN application operations
  getEINApplicationsByUserId(userId: number): Promise<EINApplication[]>;
  getEINApplicationById(id: number): Promise<EINApplication | undefined>;
  createEINApplication(einApp: InsertEINApplication): Promise<EINApplication>;
  updateEINApplication(id: number, status: string, einNumber?: string): Promise<EINApplication | undefined>;
  
  // Document operations
  getDocumentsByUserId(userId: number, documentType?: string): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getNotificationById(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Stock operations
  getStocksByUserId(userId: number): Promise<Stock[]>;
  getStockById(id: number): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, quantity: number, purchasePrice: string): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<boolean>;
  
  // News operations
  getAllNews(limit?: number): Promise<News[]>;
  getNewsByCategory(category: string): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private creditReports: Map<number, CreditReport>;
  private disputes: Map<number, Dispute>;
  private trustDocuments: Map<number, TrustDocument>;
  private einApplications: Map<number, EINApplication>;
  private documents: Map<number, Document>;
  private notifications: Map<number, Notification>;
  private stocks: Map<number, Stock>;
  private news: Map<number, News>;
  
  private userId: number;
  private creditReportId: number;
  private disputeId: number;
  private trustDocumentId: number;
  private einApplicationId: number;
  private documentId: number;
  private notificationId: number;
  private stockId: number;
  private newsId: number;

  constructor() {
    this.users = new Map();
    this.creditReports = new Map();
    this.disputes = new Map();
    this.trustDocuments = new Map();
    this.einApplications = new Map();
    this.documents = new Map();
    this.notifications = new Map();
    this.stocks = new Map();
    this.news = new Map();
    
    this.userId = 1;
    this.creditReportId = 1;
    this.disputeId = 1;
    this.trustDocumentId = 1;
    this.einApplicationId = 1;
    this.documentId = 1;
    this.notificationId = 1;
    this.stockId = 1;
    this.newsId = 1;
    
    // Add sample initial data for quick testing
    this.initializeData();
  }

  private initializeData() {
    // Add some initial news articles
    this.createNews({
      title: "New UCC Regulations May Impact Credit Dispute Process",
      content: "Recent changes to UCC regulations could affect how credit disputes are handled. Learn what this means for your credit repair journey.",
      category: "Financial Regulation",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      source: "Financial Times"
    });
    
    this.createNews({
      title: "IRS Updates EIN Application Process for Trusts",
      content: "The Internal Revenue Service has streamlined the process for obtaining Employer Identification Numbers for trusts and other legal entities.",
      category: "Legal Updates",
      imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      source: "IRS.gov"
    });
    
    this.createNews({
      title: "Financial Markets Responding to New Federal Reserve Policies",
      content: "Recent Federal Reserve announcements have caused significant movements in financial markets. Here's what investors should know.",
      category: "Market News",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500",
      source: "Wall Street Journal"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Credit report operations
  async getCreditReportsByUserId(userId: number): Promise<CreditReport[]> {
    return Array.from(this.creditReports.values()).filter(
      (report) => report.userId === userId
    );
  }

  async getCreditReportById(id: number): Promise<CreditReport | undefined> {
    return this.creditReports.get(id);
  }

  async createCreditReport(report: InsertCreditReport): Promise<CreditReport> {
    const id = this.creditReportId++;
    const newReport: CreditReport = { ...report, id };
    this.creditReports.set(id, newReport);
    return newReport;
  }

  // Dispute operations
  async getDisputesByUserId(userId: number): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(
      (dispute) => dispute.userId === userId
    );
  }

  async getDisputeById(id: number): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const id = this.disputeId++;
    const newDispute: Dispute = { ...dispute, id };
    this.disputes.set(id, newDispute);
    return newDispute;
  }

  async updateDisputeStatus(id: number, status: string, dateResolved?: Date): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(id);
    if (!dispute) return undefined;
    
    const updatedDispute: Dispute = {
      ...dispute,
      status,
      dateResolved
    };
    
    this.disputes.set(id, updatedDispute);
    return updatedDispute;
  }

  // Trust document operations
  async getTrustDocumentsByUserId(userId: number): Promise<TrustDocument[]> {
    return Array.from(this.trustDocuments.values()).filter(
      (doc) => doc.userId === userId
    );
  }

  async getTrustDocumentById(id: number): Promise<TrustDocument | undefined> {
    return this.trustDocuments.get(id);
  }

  async createTrustDocument(trustDoc: InsertTrustDocument): Promise<TrustDocument> {
    const id = this.trustDocumentId++;
    const newTrustDoc: TrustDocument = { ...trustDoc, id };
    this.trustDocuments.set(id, newTrustDoc);
    return newTrustDoc;
  }

  // EIN application operations
  async getEINApplicationsByUserId(userId: number): Promise<EINApplication[]> {
    return Array.from(this.einApplications.values()).filter(
      (app) => app.userId === userId
    );
  }

  async getEINApplicationById(id: number): Promise<EINApplication | undefined> {
    return this.einApplications.get(id);
  }

  async createEINApplication(einApp: InsertEINApplication): Promise<EINApplication> {
    const id = this.einApplicationId++;
    const newApplication: EINApplication = { ...einApp, id };
    this.einApplications.set(id, newApplication);
    return newApplication;
  }

  async updateEINApplication(id: number, status: string, einNumber?: string): Promise<EINApplication | undefined> {
    const app = this.einApplications.get(id);
    if (!app) return undefined;
    
    const updatedApp: EINApplication = {
      ...app,
      applicationStatus: status,
      einNumber: einNumber || app.einNumber,
      approvalDate: status === 'Approved' ? new Date() : app.approvalDate
    };
    
    this.einApplications.set(id, updatedApp);
    return updatedApp;
  }

  // Document operations
  async getDocumentsByUserId(userId: number, documentType?: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId && (!documentType || doc.documentType === documentType)
    );
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const newDocument: Document = { ...document, id, uploadDate: new Date() };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = { ...notification, id, createdAt: new Date() };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = {
      ...notification,
      isRead: true
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Stock operations
  async getStocksByUserId(userId: number): Promise<Stock[]> {
    return Array.from(this.stocks.values()).filter(
      (stock) => stock.userId === userId
    );
  }

  async getStockById(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const id = this.stockId++;
    const newStock: Stock = { ...stock, id, addedDate: new Date() };
    this.stocks.set(id, newStock);
    return newStock;
  }

  async updateStock(id: number, quantity: number, purchasePrice: string): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock: Stock = {
      ...stock,
      quantity,
      purchasePrice
    };
    
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async deleteStock(id: number): Promise<boolean> {
    return this.stocks.delete(id);
  }

  // News operations
  async getAllNews(limit = 10): Promise<News[]> {
    const allNews = Array.from(this.news.values());
    const sortedNews = allNews.sort((a, b) => 
      b.publishDate.getTime() - a.publishDate.getTime()
    );
    
    return sortedNews.slice(0, limit);
  }

  async getNewsByCategory(category: string): Promise<News[]> {
    return Array.from(this.news.values()).filter(
      (news) => news.category === category
    );
  }

  async getNewsById(id: number): Promise<News | undefined> {
    return this.news.get(id);
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    const id = this.newsId++;
    const newNews: News = { ...newsItem, id, publishDate: new Date() };
    this.news.set(id, newNews);
    return newNews;
  }
}

export const storage = new MemStorage();

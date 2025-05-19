import { Router, type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import {
  insertUserSchema,
  insertDisputeSchema,
  insertTrustDocumentSchema,
  insertEINApplicationSchema,
  insertDocumentSchema,
  insertNotificationSchema,
  insertStockSchema,
  insertNewsSchema,
  insertCreditReportSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Error handling middleware for Zod validation
  const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: "Validation failed",
            errors: error.errors
          });
        } else {
          next(error);
        }
      }
    };
  };

  // Auth Routes
  apiRouter.post("/auth/register", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  apiRouter.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate user existence
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      
      // Validate password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // In a real application, you would generate a JWT token here
      res.status(200).json({ 
        user: userWithoutPassword,
        // token: generatedToken
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Credit Report Routes
  apiRouter.get("/credit-reports", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const reports = await storage.getCreditReportsByUserId(userId);
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit reports" });
    }
  });

  apiRouter.post("/credit-reports", validateRequest(insertCreditReportSchema), async (req, res) => {
    try {
      const report = await storage.createCreditReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to create credit report" });
    }
  });

  // Dispute Routes
  apiRouter.get("/disputes", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const disputes = await storage.getDisputesByUserId(userId);
      res.status(200).json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  apiRouter.get("/disputes/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const dispute = await storage.getDisputeById(id);
      
      if (!dispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      res.status(200).json(dispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dispute" });
    }
  });

  apiRouter.post("/disputes", validateRequest(insertDisputeSchema), async (req, res) => {
    try {
      const dispute = await storage.createDispute(req.body);
      res.status(201).json(dispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });

  apiRouter.patch("/disputes/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const dateResolved = status === "Resolved" ? new Date() : undefined;
      
      const updatedDispute = await storage.updateDisputeStatus(id, status, dateResolved);
      
      if (!updatedDispute) {
        return res.status(404).json({ message: "Dispute not found" });
      }
      
      res.status(200).json(updatedDispute);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dispute status" });
    }
  });

  // Trust Document Routes
  apiRouter.get("/trust-documents", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const documents = await storage.getTrustDocumentsByUserId(userId);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trust documents" });
    }
  });

  apiRouter.get("/trust-documents/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const document = await storage.getTrustDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: "Trust document not found" });
      }
      
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trust document" });
    }
  });

  apiRouter.post("/trust-documents", validateRequest(insertTrustDocumentSchema), async (req, res) => {
    try {
      const document = await storage.createTrustDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to create trust document" });
    }
  });

  // EIN Application Routes
  apiRouter.get("/ein-applications", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const applications = await storage.getEINApplicationsByUserId(userId);
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch EIN applications" });
    }
  });

  apiRouter.get("/ein-applications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const application = await storage.getEINApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "EIN application not found" });
      }
      
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch EIN application" });
    }
  });

  apiRouter.post("/ein-applications", validateRequest(insertEINApplicationSchema), async (req, res) => {
    try {
      const application = await storage.createEINApplication(req.body);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to create EIN application" });
    }
  });

  apiRouter.patch("/ein-applications/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, einNumber } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedApplication = await storage.updateEINApplication(id, status, einNumber);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "EIN application not found" });
      }
      
      res.status(200).json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update EIN application" });
    }
  });

  // Document Routes
  apiRouter.get("/documents", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      const documentType = req.query.documentType as string | undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const documents = await storage.getDocumentsByUserId(userId, documentType);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  apiRouter.post("/documents", validateRequest(insertDocumentSchema), async (req, res) => {
    try {
      const document = await storage.createDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  apiRouter.delete("/documents/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Notification Routes
  apiRouter.get("/notifications", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const notifications = await storage.getNotificationsByUserId(userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  apiRouter.post("/notifications", validateRequest(insertNotificationSchema), async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  apiRouter.patch("/notifications/:id/read", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(id);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(200).json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Stock Routes
  apiRouter.get("/stocks", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const stocks = await storage.getStocksByUserId(userId);
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  apiRouter.post("/stocks", validateRequest(insertStockSchema), async (req, res) => {
    try {
      const stock = await storage.createStock(req.body);
      res.status(201).json(stock);
    } catch (error) {
      res.status(500).json({ message: "Failed to create stock" });
    }
  });

  apiRouter.patch("/stocks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { quantity, purchasePrice } = req.body;
      
      if (quantity === undefined || !purchasePrice) {
        return res.status(400).json({ message: "Quantity and purchase price are required" });
      }
      
      const updatedStock = await storage.updateStock(id, quantity, purchasePrice);
      
      if (!updatedStock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.status(200).json(updatedStock);
    } catch (error) {
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  apiRouter.delete("/stocks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteStock(id);
      
      if (!success) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stock" });
    }
  });

  // News Routes
  apiRouter.get("/news", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const news = await storage.getAllNews(limit);
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  apiRouter.get("/news/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const news = await storage.getNewsByCategory(category);
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news by category" });
    }
  });

  apiRouter.get("/news/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const newsItem = await storage.getNewsById(id);
      
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      
      res.status(200).json(newsItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news item" });
    }
  });

  apiRouter.post("/news", validateRequest(insertNewsSchema), async (req, res) => {
    try {
      const newsItem = await storage.createNews(req.body);
      res.status(201).json(newsItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create news item" });
    }
  });

  // Mount api router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

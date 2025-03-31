import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import Stripe from "stripe";
import { z } from "zod";
import {
  insertCourseSchema,
  insertCategorySchema,
  insertEnrollmentSchema,
  insertPaymentSchema,
  insertReviewSchema,
} from "@shared/schema";

// Initialize Stripe with fallback to avoid errors in development
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_default";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  // Courses routes
  app.get("/api/courses", async (req, res, next) => {
    try {
      const query = req.query;
      const courses = await storage.getCourses(query);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/featured", async (req, res, next) => {
    try {
      const courses = await storage.getFeaturedCourses();
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id/lessons", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const lessons = await storage.getLessonsByCourse(id);
      res.json(lessons);
    } catch (error) {
      next(error);
    }
  });

  // User enrollments
  app.get("/api/user/enrollments", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/enroll", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const { courseId } = req.body;
      
      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollment = await storage.createEnrollment({
        userId,
        courseId,
        status: "active",
      });

      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  });
  
  // Update enrollment progress
  app.post("/api/enrollments/:id/progress", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const enrollmentId = parseInt(req.params.id);
      const { progress, lessonId } = req.body;
      
      const enrollment = await storage.updateEnrollmentProgress(
        enrollmentId, 
        progress, 
        lessonId ? parseInt(lessonId) : undefined
      );
      
      if (progress === 100) {
        await storage.completeEnrollment(enrollmentId);
      }
      
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  });
  
  // Mark lesson as completed
  app.post("/api/enrollments/:id/complete-lesson/:lessonId", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const enrollmentId = parseInt(req.params.id);
      const lessonId = parseInt(req.params.lessonId);
      
      const enrollment = await storage.getEnrollment(req.user!.id, parseInt(req.body.courseId));
      if (!enrollment || enrollment.id !== enrollmentId) {
        return res.status(403).json({ message: "Not authorized to update this enrollment" });
      }
      
      // Get all lessons in the course to calculate progress
      const course = await storage.getCourse(enrollment.courseId);
      const lessons = await storage.getLessonsByCourse(enrollment.courseId);
      
      if (!course || !lessons || lessons.length === 0) {
        return res.status(404).json({ message: "Course or lessons not found" });
      }
      
      // Update enrollment with the completed lesson
      const completedLessons = [...(enrollment.completedLessons || []), lessonId.toString()];
      // Remove duplicates
      const uniqueCompletedLessons = Array.from(new Set(completedLessons));
      const progress = Math.min(100, Math.round((uniqueCompletedLessons.length / lessons.length) * 100));
      
      const updatedEnrollment = await storage.updateEnrollmentProgress(enrollmentId, progress, lessonId);
      
      res.json(updatedEnrollment);
    } catch (error) {
      next(error);
    }
  });

  // Payment processing
  app.post("/api/create-payment-intent", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { courseId } = req.body;
      const userId = req.user!.id;

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const amount = Math.round((course.discountPrice || course.price) * 100); // Convert to cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          userId: userId.toString(),
          courseId: courseId.toString(),
        },
      });

      // Create a pending payment record
      await storage.createPayment({
        userId,
        courseId,
        amount: amount / 100, // Store in dollars
        currency: "usd",
        status: "pending",
        paymentIntentId: paymentIntent.id,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      next(error);
    }
  });

  // Payment webhook (for production, would need proper setup)
  app.post("/api/payment-webhook", async (req, res, next) => {
    const event = req.body;

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          const { userId, courseId } = paymentIntent.metadata;

          // Update payment status
          await storage.updatePaymentStatus(paymentIntent.id, "completed");

          // Create enrollment
          await storage.createEnrollment({
            userId: parseInt(userId),
            courseId: parseInt(courseId),
            status: "active",
          });

          break;
        case "payment_intent.payment_failed":
          const failedPaymentIntent = event.data.object;
          await storage.updatePaymentStatus(failedPaymentIntent.id, "failed");
          break;
      }

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  // Reviews
  app.post("/api/courses/:id/reviews", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user!.id;

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if enrolled
      const enrollment = await storage.getEnrollment(userId, courseId);
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled to review this course" });
      }

      // Check if already reviewed
      const existingReview = await storage.getUserReview(userId, courseId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this course" });
      }

      const review = await storage.createReview({
        userId,
        courseId,
        rating: req.body.rating,
        comment: req.body.comment,
      });

      // Update course rating
      await storage.updateCourseRating(courseId);

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id/reviews", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const reviews = await storage.getCourseReviews(courseId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

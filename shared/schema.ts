import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  role: text("role").default("student"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  courseCount: integer("course_count").default(0),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  discountPrice: doublePrecision("discount_price"),
  thumbnail: text("thumbnail"),
  instructorId: integer("instructor_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  lessonCount: integer("lesson_count").default(0),
  duration: integer("duration").default(0), // in minutes
  level: text("level").default("beginner"),
  isFeatured: boolean("is_featured").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isNew: boolean("is_new").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  courseId: integer("course_id").references(() => courses.id),
  duration: integer("duration").default(0), // in minutes
  order: integer("order").default(0),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  status: text("status").default("active"), // active, completed, cancelled
  progress: integer("progress").default(0), // percentage
  completedLessons: text("completed_lessons").array(), // Array of completed lesson IDs
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, completed, failed
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    firstName: true,
    lastName: true,
  });

// Schema for inserting categories
export const insertCategorySchema = createInsertSchema(categories)
  .pick({
    name: true,
    slug: true,
    description: true,
    icon: true,
  });

// Schema for inserting courses
export const insertCourseSchema = createInsertSchema(courses)
  .pick({
    title: true,
    slug: true,
    description: true,
    price: true,
    discountPrice: true,
    thumbnail: true,
    instructorId: true,
    categoryId: true,
    lessonCount: true,
    duration: true,
    level: true,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
  });

// Schema for inserting lessons
export const insertLessonSchema = createInsertSchema(lessons)
  .pick({
    title: true,
    description: true,
    content: true,
    courseId: true,
    duration: true,
    order: true,
  });

// Schema for inserting enrollments
export const insertEnrollmentSchema = createInsertSchema(enrollments)
  .pick({
    userId: true,
    courseId: true,
    status: true,
  });

// Schema for inserting payments
export const insertPaymentSchema = createInsertSchema(payments)
  .pick({
    userId: true,
    courseId: true,
    amount: true,
    currency: true,
    status: true,
    paymentIntentId: true,
  });

// Schema for inserting reviews
export const insertReviewSchema = createInsertSchema(reviews)
  .pick({
    userId: true,
    courseId: true,
    rating: true,
    comment: true,
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

import { users, categories, courses, lessons, enrollments, payments, reviews, 
  type User, type InsertUser, type Category, type InsertCategory, 
  type Course, type InsertCourse, type Lesson, type InsertLesson,
  type Enrollment, type InsertEnrollment, type Payment, type InsertPayment,
  type Review, type InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<Category>): Promise<Category>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  getCourses(query?: any): Promise<Course[]>;
  getFeaturedCourses(): Promise<Course[]>;
  getCoursesInCategory(categoryId: number): Promise<Course[]>;
  getCoursesByInstructor(instructorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, data: Partial<Course>): Promise<Course>;
  updateCourseRating(courseId: number): Promise<void>;
  
  // Lesson methods
  getLesson(id: number): Promise<Lesson | undefined>;
  getLessonsByCourse(courseId: number): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson>;
  
  // Enrollment methods
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment>;
  completeEnrollment(id: number): Promise<Enrollment>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByIntent(paymentIntentId: string): Promise<Payment | undefined>;
  getUserPayments(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(paymentIntentId: string, status: string): Promise<Payment>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getUserReview(userId: number, courseId: number): Promise<Review | undefined>;
  getCourseReviews(courseId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private courses: Map<number, Course>;
  private lessons: Map<number, Lesson>;
  private enrollments: Map<number, Enrollment>;
  private payments: Map<number, Payment>;
  private reviews: Map<number, Review>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private courseIdCounter: number;
  private lessonIdCounter: number;
  private enrollmentIdCounter: number;
  private paymentIdCounter: number;
  private reviewIdCounter: number;
  
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.enrollments = new Map();
    this.payments = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.courseIdCounter = 1;
    this.lessonIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.paymentIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      role: "student",
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      avatar: null,
      bio: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id, courseCount: 0 };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error("Category not found");
    }
    const updatedCategory = { ...category, ...data };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(
      (course) => course.slug === slug,
    );
  }

  async getCourses(query?: any): Promise<Course[]> {
    let filteredCourses = Array.from(this.courses.values());
    
    if (query) {
      if (query.categoryId) {
        const categoryId = parseInt(query.categoryId as string);
        filteredCourses = filteredCourses.filter(c => c.categoryId === categoryId);
      }
      
      if (query.search) {
        const search = (query.search as string).toLowerCase();
        filteredCourses = filteredCourses.filter(c => 
          c.title.toLowerCase().includes(search) || 
          c.description?.toLowerCase().includes(search)
        );
      }
      
      if (query.minPrice || query.maxPrice) {
        const minPrice = query.minPrice ? parseFloat(query.minPrice as string) : 0;
        const maxPrice = query.maxPrice ? parseFloat(query.maxPrice as string) : Infinity;
        
        filteredCourses = filteredCourses.filter(c => {
          const price = c.discountPrice || c.price;
          return price >= minPrice && price <= maxPrice;
        });
      }
      
      if (query.level) {
        filteredCourses = filteredCourses.filter(c => c.level === query.level);
      }
    }
    
    return filteredCourses;
  }

  async getFeaturedCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(c => c.isFeatured);
  }

  async getCoursesInCategory(categoryId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.categoryId === categoryId,
    );
  }

  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.instructorId === instructorId,
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const now = new Date();
    const course: Course = { 
      ...insertCourse, 
      id,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.courses.set(id, course);
    
    // Update category course count
    if (course.categoryId) {
      const category = this.categories.get(course.categoryId);
      if (category) {
        this.categories.set(category.id, {
          ...category,
          courseCount: category.courseCount + 1
        });
      }
    }
    
    return course;
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const course = this.courses.get(id);
    if (!course) {
      throw new Error("Course not found");
    }
    const updatedCourse = { ...course, ...data, updatedAt: new Date() };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async updateCourseRating(courseId: number): Promise<void> {
    const reviews = Array.from(this.reviews.values()).filter(
      (review) => review.courseId === courseId,
    );
    
    if (reviews.length === 0) {
      await this.updateCourse(courseId, { rating: 0, reviewCount: 0 });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await this.updateCourse(courseId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });
  }

  // Lesson methods
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    const courseLessons = Array.from(this.lessons.values())
      .filter((lesson) => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
    
    return courseLessons;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonIdCounter++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    
    // Update course lesson count
    const course = this.courses.get(insertLesson.courseId);
    if (course) {
      this.courses.set(course.id, {
        ...course,
        lessonCount: course.lessonCount + 1,
        updatedAt: new Date()
      });
    }
    
    return lesson;
  }

  async updateLesson(id: number, data: Partial<Lesson>): Promise<Lesson> {
    const lesson = this.lessons.get(id);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    const updatedLesson = { ...lesson, ...data };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  // Enrollment methods
  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      (enrollment) => enrollment.userId === userId && enrollment.courseId === courseId,
    );
  }

  async getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]> {
    const userEnrollments = Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId,
    );
    
    return userEnrollments.map(enrollment => {
      const course = this.courses.get(enrollment.courseId)!;
      return { ...enrollment, course };
    });
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const now = new Date();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id, 
      progress: 0, 
      completedAt: null,
      createdAt: now 
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    
    const updatedEnrollment = { 
      ...enrollment, 
      progress,
      completedAt: progress === 100 ? new Date() : enrollment.completedAt
    };
    
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  async completeEnrollment(id: number): Promise<Enrollment> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    
    const updatedEnrollment = { 
      ...enrollment, 
      progress: 100,
      status: "completed" as any,
      completedAt: new Date()
    };
    
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByIntent(paymentIntentId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.paymentIntentId === paymentIntentId,
    );
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId,
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    const payment: Payment = { ...insertPayment, id, createdAt: now };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(paymentIntentId: string, status: string): Promise<Payment> {
    const payment = await this.getPaymentByIntent(paymentIntentId);
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    const updatedPayment = { ...payment, status };
    this.payments.set(payment.id, updatedPayment);
    return updatedPayment;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getUserReview(userId: number, courseId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.userId === userId && review.courseId === courseId,
    );
  }

  async getCourseReviews(courseId: number): Promise<(Review & { user: User })[]> {
    const courseReviews = Array.from(this.reviews.values()).filter(
      (review) => review.courseId === courseId,
    );
    
    return courseReviews.map(review => {
      const user = this.users.get(review.userId)!;
      return { ...review, user };
    });
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { ...insertReview, id, createdAt: now };
    this.reviews.set(id, review);
    return review;
  }

  // Initialize sample data
  private async initializeDemoData() {
    // Create sample instructor
    const instructor1 = await this.createUser({
      username: "davidmitchell",
      password: "password123",
      email: "david@example.com",
      firstName: "David",
      lastName: "Mitchell"
    });
    
    const instructor2 = await this.createUser({
      username: "sarahjohnson",
      password: "password123",
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Johnson"
    });
    
    const instructor3 = await this.createUser({
      username: "michaelcarter",
      password: "password123",
      email: "michael@example.com",
      firstName: "Michael",
      lastName: "Carter"
    });
    
    const instructor4 = await this.createUser({
      username: "jessicalee",
      password: "password123",
      email: "jessica@example.com",
      firstName: "Jessica",
      lastName: "Lee"
    });
    
    // Create categories
    const programming = await this.createCategory({
      name: "Programming",
      slug: "programming",
      description: "Learn programming languages and coding skills",
      icon: "fas fa-laptop-code"
    });
    
    const business = await this.createCategory({
      name: "Business",
      slug: "business",
      description: "Business, entrepreneurship, and management courses",
      icon: "fas fa-chart-line"
    });
    
    const design = await this.createCategory({
      name: "Design",
      slug: "design",
      description: "Graphic design, UX/UI, and creative courses",
      icon: "fas fa-palette"
    });
    
    const marketing = await this.createCategory({
      name: "Marketing",
      slug: "marketing",
      description: "Digital marketing, SEO, and promotion strategies",
      icon: "fas fa-bullhorn"
    });
    
    const photography = await this.createCategory({
      name: "Photography",
      slug: "photography",
      description: "Photography, videography, and visual arts",
      icon: "fas fa-camera"
    });
    
    const health = await this.createCategory({
      name: "Health",
      slug: "health",
      description: "Health, fitness, and wellness courses",
      icon: "fas fa-heartbeat"
    });
    
    // Create sample courses
    const webDevCourse = await this.createCourse({
      title: "Complete Web Development Bootcamp",
      slug: "web-development-bootcamp",
      description: "Learn HTML, CSS, JavaScript, React and Node.js in this comprehensive course.",
      price: 89.99,
      discountPrice: null,
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      instructorId: instructor1.id,
      categoryId: programming.id,
      lessonCount: 64,
      duration: 2520, // 42 hours
      level: "beginner",
      isFeatured: true,
      isBestseller: true,
      isNew: false
    });
    
    const dataScienceCourse = await this.createCourse({
      title: "Data Science and Machine Learning",
      slug: "data-science-machine-learning",
      description: "Master Python, data analysis, and machine learning algorithms.",
      price: 119.99,
      discountPrice: null,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      instructorId: instructor2.id,
      categoryId: programming.id,
      lessonCount: 82,
      duration: 3360, // 56 hours
      level: "intermediate",
      isFeatured: true,
      isBestseller: false,
      isNew: false
    });
    
    const marketingCourse = await this.createCourse({
      title: "Digital Marketing Masterclass",
      slug: "digital-marketing-masterclass",
      description: "Learn SEO, social media marketing, email campaigns and more.",
      price: 79.99,
      discountPrice: null,
      thumbnail: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740",
      instructorId: instructor3.id,
      categoryId: marketing.id,
      lessonCount: 58,
      duration: 2280, // 38 hours
      level: "beginner",
      isFeatured: true,
      isBestseller: false,
      isNew: true
    });
    
    const uxCourse = await this.createCourse({
      title: "UX/UI Design Principles",
      slug: "ux-ui-design-principles",
      description: "Create user-centered designs and improve your design thinking skills.",
      price: 99.99,
      discountPrice: null,
      thumbnail: "https://images.unsplash.com/photo-1587440871875-191322ee64b0",
      instructorId: instructor4.id,
      categoryId: design.id,
      lessonCount: 47,
      duration: 1920, // 32 hours
      level: "beginner",
      isFeatured: true,
      isBestseller: false,
      isNew: false
    });
    
    // Create some sample lessons for each course
    for (let i = 1; i <= 5; i++) {
      await this.createLesson({
        title: `Web Development Lesson ${i}`,
        description: `Introduction to Web Development - Part ${i}`,
        content: "Lesson content goes here...",
        courseId: webDevCourse.id,
        duration: 30,
        order: i
      });
    }
    
    for (let i = 1; i <= 5; i++) {
      await this.createLesson({
        title: `Data Science Lesson ${i}`,
        description: `Introduction to Data Science - Part ${i}`,
        content: "Lesson content goes here...",
        courseId: dataScienceCourse.id,
        duration: 45,
        order: i
      });
    }
    
    for (let i = 1; i <= 5; i++) {
      await this.createLesson({
        title: `Marketing Lesson ${i}`,
        description: `Introduction to Digital Marketing - Part ${i}`,
        content: "Lesson content goes here...",
        courseId: marketingCourse.id,
        duration: 35,
        order: i
      });
    }
    
    for (let i = 1; i <= 5; i++) {
      await this.createLesson({
        title: `UX/UI Design Lesson ${i}`,
        description: `Introduction to UX/UI Design - Part ${i}`,
        content: "Lesson content goes here...",
        courseId: uxCourse.id,
        duration: 40,
        order: i
      });
    }
  }
}

export const storage = new MemStorage();

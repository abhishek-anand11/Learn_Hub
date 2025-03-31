import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Course, Lesson, User as Instructor, Review } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Star, StarHalf, Clock, Video, BarChart, Award, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage() {
  const [, params] = useRoute<{ id: string }>("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch course details
  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Fetch course lessons
  const {
    data: lessons,
    isLoading: isLoadingLessons,
  } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });
  
  // Fetch instructor details
  const {
    data: instructor,
    isLoading: isLoadingInstructor,
  } = useQuery<Instructor>({
    queryKey: [`/api/users/${course?.instructorId}`],
    enabled: !!course?.instructorId,
  });
  
  // Fetch course reviews
  const {
    data: reviews,
    isLoading: isLoadingReviews,
  } = useQuery<Review[]>({
    queryKey: [`/api/courses/${courseId}/reviews`],
    enabled: !!courseId,
  });
  
  // Check if user is enrolled
  const {
    data: enrollment,
    isLoading: isLoadingEnrollment,
  } = useQuery({
    queryKey: [`/api/user/enrollments`],
    enabled: !!user,
    select: (data) => data?.find((e: any) => e.courseId === courseId),
  });
  
  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enroll", { courseId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/enrollments`] });
      toast({
        title: "Enrolled successfully",
        description: "You have been enrolled in this course.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Format time from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} min` : ''}`;
  };
  
  // Handle enrollment
  const handleEnroll = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      });
      return;
    }
    
    if (course?.price && course.price > 0) {
      // If course has a price, redirect to checkout
      window.location.href = `/checkout/${courseId}`;
    } else {
      // If course is free, enroll directly
      enrollMutation.mutate();
    }
  };
  
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-amber-400 text-amber-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-amber-400" />);
    }
    
    return (
      <div className="flex">
        {stars}
      </div>
    );
  };
  
  // Show loading state
  if (isLoadingCourse) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-64 bg-neutral-200 rounded mb-6"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3 mb-6"></div>
              </div>
              <div>
                <div className="h-96 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Show error state
  if (courseError || !course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Course Not Found</h2>
            <p className="text-red-600 mb-6">
              {courseError instanceof Error ? courseError.message : "The requested course could not be found."}
            </p>
            <Link href="/courses">
              <Button variant="outline">Browse All Courses</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Course header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex items-center mb-4">
              <Badge variant="secondary" className="mr-2">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
              {course.isBestseller && (
                <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 mr-2">
                  Bestseller
                </Badge>
              )}
              {course.isNew && (
                <Badge variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  New
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center mr-4">
                {renderStars(course.rating)}
                <span className="ml-2 text-primary-100">
                  {course.rating.toFixed(1)} ({course.reviewCount} {course.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <div className="flex items-center space-x-4 text-primary-100">
                <div className="flex items-center">
                  <Video className="mr-1 h-4 w-4" />
                  <span>{course.lessonCount} lessons</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              {isLoadingInstructor ? (
                <Skeleton className="h-10 w-40" />
              ) : instructor ? (
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={instructor.avatar || undefined} alt={instructor.username} />
                    <AvatarFallback>
                      {instructor.firstName?.[0] || instructor.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {instructor.firstName && instructor.lastName 
                        ? `${instructor.firstName} ${instructor.lastName}` 
                        : instructor.username}
                    </p>
                    <p className="text-sm text-primary-100">{instructor.role}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      {/* Course content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: Course details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="prose max-w-none">
                  <h2>About This Course</h2>
                  <p>{course.description}</p>
                  
                  <h3>What You Will Learn</h3>
                  <ul>
                    <li>Master the fundamentals of {course.title}</li>
                    <li>Build real-world projects to add to your portfolio</li>
                    <li>Learn industry best practices and techniques</li>
                    <li>Gain confidence in your skills through hands-on exercises</li>
                  </ul>
                  
                  <h3>Requirements</h3>
                  <ul>
                    <li>Basic computer skills</li>
                    <li>No prior experience in {course.title.split(' ')[0]} is necessary - we'll teach you everything!</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="curriculum">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-neutral-600">
                      {course.lessonCount} lessons • {formatDuration(course.duration)} total length
                    </p>
                  </div>
                  
                  {isLoadingLessons ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : lessons && lessons.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {lessons.map((lesson, index) => (
                        <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                          <AccordionTrigger className="hover:bg-neutral-50 p-4">
                            <div className="flex items-start text-left">
                              <div className="flex-shrink-0 mr-3 mt-1 bg-primary-100 text-primary-600 h-6 w-6 rounded-full flex items-center justify-center">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-medium">{lesson.title}</h3>
                                <div className="flex items-center mt-1 text-sm text-neutral-500">
                                  <Play className="h-3 w-3 mr-1" />
                                  <span>{lesson.duration} min</span>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-0 pl-12">
                            <p className="text-neutral-600">{lesson.description}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-neutral-500">No lessons available yet.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                  
                  <div className="mb-8 flex items-center">
                    <div className="mr-4">
                      <div className="text-4xl font-bold text-neutral-900">{course.rating.toFixed(1)}</div>
                      <div className="flex mt-1">{renderStars(course.rating)}</div>
                      <div className="text-sm text-neutral-500 mt-1">Course Rating</div>
                    </div>
                    
                    <div className="flex-1 ml-4">
                      {/* Rating distribution could go here */}
                    </div>
                  </div>
                  
                  {isLoadingReviews ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-neutral-200 pb-6">
                          <div className="flex items-start">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage src={review.user?.avatar} alt={review.user?.username} />
                              <AvatarFallback>
                                {review.user?.firstName?.[0] || review.user?.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">
                                  {review.user?.firstName && review.user?.lastName 
                                    ? `${review.user.firstName} ${review.user.lastName}` 
                                    : review.user?.username}
                                </h4>
                                <span className="text-neutral-400 mx-2">•</span>
                                <span className="text-sm text-neutral-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex mt-1 mb-2">{renderStars(review.rating)}</div>
                              <p className="text-neutral-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-neutral-50 rounded-lg">
                      <p className="text-neutral-600">No reviews yet. Be the first to review this course!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="instructor">
                {isLoadingInstructor ? (
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : instructor ? (
                  <div>
                    <div className="flex items-center mb-6">
                      <Avatar className="h-16 w-16 mr-4">
                        <AvatarImage src={instructor.avatar || undefined} alt={instructor.username} />
                        <AvatarFallback>
                          {instructor.firstName?.[0] || instructor.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {instructor.firstName && instructor.lastName 
                            ? `${instructor.firstName} ${instructor.lastName}` 
                            : instructor.username}
                        </h2>
                        <p className="text-neutral-600">{instructor.role}</p>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none">
                      <h3>About the Instructor</h3>
                      <p>{instructor.bio || "No bio available for this instructor."}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-500">Instructor information not available.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column: Course enrollment card */}
          <div>
            <Card className="sticky top-24">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity hover:bg-opacity-40">
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-bold">
                      ${(course.discountPrice || course.price).toFixed(2)}
                    </div>
                    {course.discountPrice && (
                      <div className="text-neutral-500 line-through">${course.price.toFixed(2)}</div>
                    )}
                  </div>
                  
                  {course.discountPrice && (
                    <div className="text-sm text-green-600 font-medium">
                      {Math.round((1 - course.discountPrice / course.price) * 100)}% off
                    </div>
                  )}
                </div>
                
                {isLoadingEnrollment ? (
                  <Skeleton className="h-10 w-full mb-4" />
                ) : enrollment ? (
                  <Link href="/my-courses">
                    <Button className="w-full mb-4">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      onClick={handleEnroll}
                      className="w-full mb-4"
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending 
                        ? "Processing..." 
                        : (course.price > 0 ? "Enroll Now" : "Enroll for Free")}
                    </Button>
                    
                    {course.price > 0 && (
                      <p className="text-xs text-center text-neutral-500 mb-4">
                        30-Day Money-Back Guarantee
                      </p>
                    )}
                  </>
                )}
                
                <div className="space-y-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  
                  <div className="space-y-2">
                    <div className="flex">
                      <Video className="h-5 w-5 mr-3 text-neutral-600" />
                      <span>{course.lessonCount} on-demand video lessons</span>
                    </div>
                    <div className="flex">
                      <Clock className="h-5 w-5 mr-3 text-neutral-600" />
                      <span>{formatDuration(course.duration)} total length</span>
                    </div>
                    <div className="flex">
                      <BarChart className="h-5 w-5 mr-3 text-neutral-600" />
                      <span>{course.level.charAt(0).toUpperCase() + course.level.slice(1)} level</span>
                    </div>
                    <div className="flex">
                      <Award className="h-5 w-5 mr-3 text-neutral-600" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <h3 className="font-semibold mb-2">Share this course:</h3>
                    <div className="flex space-x-3">
                      <Button variant="outline" size="icon" className="rounded-full">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

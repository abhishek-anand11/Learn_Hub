import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lesson, Course } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Menu,
  X,
  Award,
  ChevronDown,
  BookOpen,
  Home
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LessonViewerPage() {
  const { user } = useAuth();
  const [, params] = useRoute<{ courseId: string; lessonId: string }>("/courses/:courseId/lessons/:lessonId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const courseId = params?.courseId ? parseInt(params.courseId) : 0;
  const lessonId = params?.lessonId ? parseInt(params.lessonId) : 0;
  
  // Fetch course details
  const {
    data: course,
    isLoading: isLoadingCourse,
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Fetch all lessons for the course
  const {
    data: lessons,
    isLoading: isLoadingLessons,
  } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });
  
  // Get current lesson
  const currentLesson = lessons?.find(lesson => lesson.id === lessonId);
  
  // Fetch enrollment details to get progress
  const {
    data: enrollment,
    isLoading: isLoadingEnrollment,
  } = useQuery({
    queryKey: [`/api/user/enrollments`],
    enabled: !!user,
    select: (data) => data?.find((e: any) => e.courseId === courseId),
  });
  
  // Lessons are now tracked through the /api/enrollments/:id/complete-lesson/:lessonId endpoint
  
  // Mark lesson as completed
  const markLessonCompleted = (lessonId: number) => {
    if (!enrollment || !courseId) return;
    
    // Use the dedicated API endpoint to mark a lesson as completed
    apiRequest("POST", `/api/enrollments/${enrollment.id}/complete-lesson/${lessonId}`, {
      courseId
    }).then(() => {
      // After successfully marking the lesson as completed, invalidate the enrollments query
      queryClient.invalidateQueries({ queryKey: [`/api/user/enrollments`] });
      
      toast({
        title: "Progress updated",
        description: "Lesson marked as completed",
      });
    }).catch(error => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    });
  };
  
  // Navigate to next or previous lesson
  const navigateToLesson = (direction: 'next' | 'prev') => {
    if (!lessons || !currentLesson) return;
    
    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLesson.id);
    let targetIndex;
    
    if (direction === 'next') {
      targetIndex = currentIndex + 1;
      if (targetIndex >= lessons.length) {
        // If this is the last lesson, mark it as completed and go to course completion
        if (currentLesson && enrollment) {
          markLessonCompleted(currentLesson.id);
        }
        setLocation(`/courses/${courseId}/complete`);
        return;
      }
    } else {
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) {
        setLocation(`/courses/${courseId}`);
        return;
      }
    }
    
    const targetLesson = lessons[targetIndex];
    setLocation(`/courses/${courseId}/lessons/${targetLesson.id}`);
  };
  
  // Mark lesson as completed and go to next lesson
  const completeAndContinue = () => {
    if (currentLesson && enrollment) {
      markLessonCompleted(currentLesson.id);
      navigateToLesson('next');
    }
  };
  
  // Loading state
  if (isLoadingCourse || isLoadingLessons || isLoadingEnrollment) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <div className="h-64 bg-neutral-200 rounded mb-6"></div>
              </div>
              <div className="md:col-span-3">
                <div className="h-96 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Error state or not found
  if (!course || !lessons || !currentLesson) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Lesson Not Found</h2>
            <p className="text-red-600 mb-6">
              The requested lesson could not be found.
            </p>
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline">Back to Course</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Check if user is enrolled
  if (!enrollment) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Not Enrolled</h2>
            <p className="text-red-600 mb-6">
              You must be enrolled in this course to view the lessons.
            </p>
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline">View Course</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      {/* Lesson viewer header */}
      <div className="bg-neutral-100 border-b border-neutral-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 md:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div>
              <h1 className="text-lg font-medium text-neutral-900 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {course.title}
              </h1>
              <div className="flex items-center text-sm text-neutral-500">
                <Progress value={enrollment.progress} className="w-32 h-2 mr-2" />
                <span>{enrollment.progress}% complete</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Course Overview</span>
              </Button>
            </Link>
            <Link href="/my-courses">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">My Courses</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="flex min-h-[calc(100vh-14rem)]">
        {/* Sidebar */}
        <div className={`bg-white border-r border-neutral-200 w-full md:w-80 fixed md:sticky top-0 bottom-0 md:top-16 md:h-[calc(100vh-8rem)] z-30 transition-all transform ${
          sidebarOpen ? "left-0" : "-left-full md:left-0"
        } md:transform-none`}>
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-medium">Course Content</h2>
            <p className="text-sm text-neutral-500">
              {lessons.length} lessons • {Math.floor(course.duration / 60)} hours total
            </p>
          </div>
          
          <ScrollArea className="h-[calc(100%-4rem)]">
            <Accordion
              type="single"
              collapsible
              defaultValue="module-1"
              className="w-full"
            >
              <AccordionItem value="module-1">
                <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50">
                  <div className="flex items-center text-left">
                    <span className="font-medium">Course Lessons</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-0">
                  <div className="divide-y divide-neutral-100">
                    {lessons.map((lesson, index) => (
                      <Link 
                        key={lesson.id}
                        href={`/courses/${courseId}/lessons/${lesson.id}`}
                      >
                        <div 
                          className={`flex p-4 hover:bg-neutral-50 ${
                            lesson.id === currentLesson.id ? "bg-neutral-50" : ""
                          }`}
                        >
                          <div className="flex-shrink-0 mr-3 mt-1 bg-neutral-100 text-neutral-600 h-6 w-6 rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-sm">
                                {lesson.title}
                              </h3>
                              {enrollment.completedLessons?.includes(lesson.id) ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : lesson.id === currentLesson.id ? (
                                <PlayCircle className="h-4 w-4 text-primary-500 flex-shrink-0" />
                              ) : null}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                              {lesson.duration} min
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-white">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{currentLesson.title}</h1>
              <p className="text-neutral-600">{currentLesson.description}</p>
            </div>
            
            {/* Video placeholder */}
            <div className="aspect-video bg-neutral-900 rounded-lg mb-8 flex items-center justify-center">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 text-white opacity-80 mx-auto mb-4" />
                <p className="text-white text-lg">Video content would play here</p>
                <p className="text-neutral-400">This is a placeholder for lesson video content</p>
              </div>
            </div>
            
            {/* Lesson content */}
            <div className="prose max-w-none mb-12">
              <h2>Lesson Content</h2>
              <p>
                {currentLesson.content || 
                  `This is placeholder content for "${currentLesson.title}". In a real application, the lesson would include comprehensive teaching materials, examples, and exercises.`}
              </p>
              
              <h3>Key Takeaways</h3>
              <ul>
                <li>Understanding the fundamental concepts presented in this lesson</li>
                <li>Applying these concepts through practical examples</li>
                <li>Building skills through guided exercises and challenges</li>
                <li>Connecting this material to real-world applications</li>
              </ul>
              
              <h3>Practice Exercise</h3>
              <p>
                Try implementing what you've learned in this lesson with the following exercise:
              </p>
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <p className="font-medium">Exercise: Apply the concepts from this lesson</p>
                <p>Create a simple project that demonstrates your understanding of the material covered.</p>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-neutral-200 pt-6">
              <Button
                variant="outline"
                onClick={() => navigateToLesson("prev")}
                className="space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Lesson</span>
              </Button>
              
              <Button 
                onClick={completeAndContinue}
                className="space-x-2"
              >
                <span>Complete & Continue</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
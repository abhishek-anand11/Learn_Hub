import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import { Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Award, Star, BookOpen, Home } from "lucide-react";

export default function CourseCompletePage() {
  const { user } = useAuth();
  const [, params] = useRoute<{ courseId: string }>("/courses/:courseId/complete");
  const courseId = params?.courseId ? parseInt(params.courseId) : 0;
  
  // Fetch course details
  const {
    data: course,
    isLoading,
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Fetch enrollment to check if it's completed
  const {
    data: enrollment,
  } = useQuery({
    queryKey: [`/api/user/enrollments`],
    enabled: !!user,
    select: (data) => data?.find((e: any) => e.courseId === courseId),
  });
  
  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4 mx-auto"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8 mx-auto"></div>
            <div className="h-64 bg-neutral-200 rounded mb-6 max-w-md mx-auto"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Course not found
  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Course Not Found</h1>
            <p className="text-neutral-600 mb-8">
              We couldn't find the course you're looking for.
            </p>
            <Link href="/my-courses">
              <Button>
                Go to My Courses
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-6">
            <Award className="h-12 w-12 text-primary-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Congratulations!
          </h1>
          
          <p className="text-xl text-neutral-600 mb-8">
            You've completed {course.title}
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Achievement</h2>
            <p className="text-neutral-600 mb-6">
              You've successfully completed all lessons and exercises in this course.
              This certificate recognizes your dedication and newly acquired skills.
            </p>
            
            <div className="border-4 border-double border-neutral-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-semibold">Certificate of Completion</span>
                </div>
                <div className="text-sm text-neutral-500">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center mb-2">{course.title}</h3>
              <p className="text-center text-neutral-600 mb-6">
                This certifies that
              </p>
              <p className="text-xl font-semibold text-center text-primary-600 mb-6">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.username}
              </p>
              <p className="text-center text-neutral-600 mb-6">
                has successfully completed the course
              </p>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-neutral-500 text-sm">
                  LearnHub
                </div>
                <div className="text-neutral-500 text-sm">
                  ID: {courseId}-{user?.id}-{Math.floor(Date.now()/1000)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                Download Certificate
              </Button>
              <Button variant="outline">
                Share Achievement
              </Button>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-5 w-5" />
                Review Course Material
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full justify-start">
                <Home className="mr-2 h-5 w-5" />
                Explore More Courses
              </Button>
            </Link>
          </div>
          
          <Link href="/my-courses">
            <Button size="lg">
              Back to My Courses
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
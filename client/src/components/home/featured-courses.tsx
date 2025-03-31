import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "../courses/course-card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FeaturedCourses() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses/featured"],
  });

  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 4;
  
  // Calculate total pages
  const totalPages = courses ? Math.ceil(courses.length / coursesPerPage) : 0;
  
  // Get current courses
  const currentCourses = courses ? 
    courses.slice(currentPage * coursesPerPage, (currentPage + 1) * coursesPerPage) :
    [];
  
  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Featured Courses</h2>
            <p className="mt-2 text-neutral-500">Top-rated courses recommended for you</p>
          </div>
          <div className="hidden sm:flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentPage === 0 || isLoading}
              aria-label="Previous page"
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1 || isLoading}
              aria-label="Next page"
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading && Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
              <Skeleton className="h-40 w-full" />
              <div className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
          
          {error && (
            <div className="col-span-full text-center text-red-500">
              Failed to load featured courses. Please try again later.
            </div>
          )}
          
          {currentCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/courses">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary-50">
              Browse all courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

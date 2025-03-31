import { Course } from "@shared/schema";
import CourseCard from "./course-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface CourseGridProps {
  courses: Course[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CourseGrid({ 
  courses, 
  isLoading, 
  error, 
  currentPage,
  totalPages,
  onPageChange
}: CourseGridProps) {
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">Error loading courses</h3>
        <p className="mt-2 text-red-600">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-neutral-200 h-48 rounded-t-lg"></div>
            <div className="p-4 bg-white rounded-b-lg border border-neutral-200">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-neutral-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between">
                <div className="flex">
                  <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
                  <div className="h-8 w-24 bg-neutral-200 rounded ml-2"></div>
                </div>
                <div className="h-6 w-16 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center p-8 bg-neutral-50 rounded-lg border border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">No courses found</h3>
        <p className="mt-2 text-neutral-600">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)} 
                  disabled={currentPage === 0}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    isActive={i === currentPage} 
                    onClick={() => onPageChange(i)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

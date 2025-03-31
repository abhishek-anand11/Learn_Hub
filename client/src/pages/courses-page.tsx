import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Course } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import CourseFilter from "@/components/courses/course-filter";
import CourseGrid from "@/components/courses/course-grid";
import { Separator } from "@/components/ui/separator";

// Parse search params
function parseSearchParams() {
  // Get the search params from the URL if in browser
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    
    return {
      search: params.get("search") || undefined,
      category: params.get("category") || undefined,
      minPrice: params.get("minPrice") ? parseFloat(params.get("minPrice") as string) : undefined,
      maxPrice: params.get("maxPrice") ? parseFloat(params.get("maxPrice") as string) : undefined,
      level: params.get("level") || undefined,
    };
  }
  
  return {};
}

interface FilterParams {
  search?: string;
  category?: string | number;
  minPrice?: number;
  maxPrice?: number;
  level?: string;
}

export default function CoursesPage() {
  const [, setLocation] = useLocation();
  const initialFilters = parseSearchParams();
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 12;
  
  // Build query string for API call
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("categoryId", filters.category.toString());
    if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.level) params.append("level", filters.level);
    
    return params.toString() ? `?${params.toString()}` : "";
  };
  
  // Fetch courses with filters
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: [`/api/courses${buildQueryString()}`],
  });
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category.toString());
    if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.level) params.append("level", filters.level);
    
    setLocation(params.toString() ? `?${params.toString()}` : "");
    setCurrentPage(0); // Reset to first page when filters change
  }, [filters, setLocation]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };
  
  // Calculate pagination
  const totalCourses = courses?.length || 0;
  const totalPages = Math.ceil(totalCourses / coursesPerPage);
  const paginatedCourses = courses?.slice(
    currentPage * coursesPerPage,
    (currentPage + 1) * coursesPerPage
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Browse Courses</h1>
          <p className="text-neutral-500 mt-2">
            Discover our wide range of courses to help you advance your career and skills
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className="lg:w-1/4">
            <CourseFilter onFilterChange={handleFilterChange} initialFilters={initialFilters} />
          </div>
          
          {/* Course grid */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-neutral-900">
                  {totalCourses} {totalCourses === 1 ? "Course" : "Courses"}
                </h2>
                {Object.keys(filters).length > 0 && (
                  <p className="text-sm text-neutral-500">Filtered results</p>
                )}
              </div>
              
              <div className="mt-2 sm:mt-0">
                {/* Additional sorting options could go here */}
              </div>
            </div>
            
            <Separator className="mb-6" />
            
            <CourseGrid
              courses={paginatedCourses || []}
              isLoading={isLoading}
              error={error as Error}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

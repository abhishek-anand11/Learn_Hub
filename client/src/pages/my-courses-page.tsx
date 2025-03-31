import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  PlayCircle, 
  Award, 
  Search, 
  Clock, 
  Filter,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filter, setFilter] = useState("all");
  
  // Fetch user enrollments
  const {
    data: enrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: !!user,
  });
  
  // Filter and sort enrollments
  const filterAndSortEnrollments = (data: any[] | undefined, status: string) => {
    if (!data) return [];
    
    let filtered = data;
    
    // Apply status filter
    if (status === "in-progress") {
      filtered = data.filter(e => e.status !== "completed");
    } else if (status === "completed") {
      filtered = data.filter(e => e.status === "completed");
    }
    
    // Apply custom filter
    if (filter === "not-started") {
      filtered = filtered.filter(e => e.progress === 0);
    } else if (filter === "in-progress") {
      filtered = filtered.filter(e => e.progress > 0 && e.progress < 100);
    } else if (filter === "almost-done") {
      filtered = filtered.filter(e => e.progress >= 75 && e.progress < 100);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.course.title.toLowerCase().includes(query) || 
        e.course.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "title-asc") {
      filtered.sort((a, b) => a.course.title.localeCompare(b.course.title));
    } else if (sortBy === "title-desc") {
      filtered.sort((a, b) => b.course.title.localeCompare(a.course.title));
    } else if (sortBy === "progress") {
      filtered.sort((a, b) => b.progress - a.progress);
    }
    
    return filtered;
  };
  
  // Get filtered enrollments
  const inProgressCourses = filterAndSortEnrollments(enrollments, "in-progress");
  const completedCourses = filterAndSortEnrollments(enrollments, "completed");

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Courses</h1>
            <p className="text-neutral-500 mt-1">
              Manage your enrolled courses and track your progress
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/courses">
              <Button>
                Browse More Courses
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search your courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <span className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="almost-done">Almost Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>My Learning</CardTitle>
            <CardDescription>
              Track your progress across all your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all-courses">
              <TabsList className="mb-4">
                <TabsTrigger value="all-courses">All Courses</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all-courses">
                {isLoadingEnrollments ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : enrollments && filterAndSortEnrollments(enrollments, "all").length > 0 ? (
                  <div className="space-y-4">
                    {filterAndSortEnrollments(enrollments, "all").map((enrollment: any) => (
                      <div 
                        key={enrollment.id} 
                        className="flex flex-col md:flex-row p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="md:w-16 md:h-16 w-full h-24 bg-neutral-100 rounded-lg overflow-hidden mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                          <img 
                            src={enrollment.course.thumbnail} 
                            alt={enrollment.course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{enrollment.course.title}</h3>
                          <div className="flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-1 mb-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {Math.floor(enrollment.course.duration / 60)} hours
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span>{enrollment.course.lessonCount} lessons</span>
                            </div>
                            {enrollment.status === "completed" ? (
                              <div className="flex items-center text-green-600">
                                <Award className="h-4 w-4 mr-1" />
                                <span>Completed</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <PlayCircle className="h-4 w-4 mr-1" />
                                <span>In progress</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-4 flex items-center justify-end">
                          <Link href={`/courses/${enrollment.course.id}`}>
                            <Button variant="outline">
                              {enrollment.status === "completed" ? "Review" : enrollment.progress > 0 ? "Continue" : "Start Learning"}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
                      <BookOpen className="h-10 w-10 text-neutral-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No courses found</h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                      {searchQuery ? "No courses match your search criteria. Try a different search term." : "You haven't enrolled in any courses yet. Start learning by browsing our course catalog."}
                    </p>
                    <Link href="/courses">
                      <Button>
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="in-progress">
                {isLoadingEnrollments ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : inProgressCourses.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressCourses.map((enrollment: any) => (
                      <div 
                        key={enrollment.id} 
                        className="flex flex-col md:flex-row p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="md:w-16 md:h-16 w-full h-24 bg-neutral-100 rounded-lg overflow-hidden mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                          <img 
                            src={enrollment.course.thumbnail} 
                            alt={enrollment.course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{enrollment.course.title}</h3>
                          <div className="flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-1 mb-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {Math.floor(enrollment.course.duration / 60)} hours
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span>{enrollment.course.lessonCount} lessons</span>
                            </div>
                            <div className="flex items-center">
                              <PlayCircle className="h-4 w-4 mr-1" />
                              <span>In progress</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-4 flex items-center justify-end">
                          <Link href={`/courses/${enrollment.course.id}`}>
                            <Button variant="outline">
                              {enrollment.progress > 0 ? "Continue" : "Start Learning"}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
                      <PlayCircle className="h-10 w-10 text-neutral-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No courses in progress</h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                      {searchQuery ? "No in-progress courses match your search criteria." : "Start learning by enrolling in a course!"}
                    </p>
                    <Link href="/courses">
                      <Button>
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {isLoadingEnrollments ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : completedCourses.length > 0 ? (
                  <div className="space-y-4">
                    {completedCourses.map((enrollment: any) => (
                      <div 
                        key={enrollment.id} 
                        className="flex flex-col md:flex-row p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <div className="md:w-16 md:h-16 w-full h-24 bg-neutral-100 rounded-lg overflow-hidden mb-4 md:mb-0 md:mr-4 flex-shrink-0">
                          <img 
                            src={enrollment.course.thumbnail} 
                            alt={enrollment.course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{enrollment.course.title}</h3>
                          <div className="flex flex-wrap items-center text-sm text-neutral-500 gap-x-4 gap-y-1 mb-3">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {Math.floor(enrollment.course.duration / 60)} hours
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              <span>{enrollment.course.lessonCount} lessons</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <Award className="h-4 w-4 mr-1" />
                              <span>Completed</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-4 flex items-center justify-end">
                          <Link href={`/courses/${enrollment.course.id}`}>
                            <Button variant="outline">
                              Review Course
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
                      <Award className="h-10 w-10 text-neutral-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No completed courses yet</h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                      {searchQuery ? "No completed courses match your search criteria." : "Keep learning to complete your first course and earn a certificate!"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

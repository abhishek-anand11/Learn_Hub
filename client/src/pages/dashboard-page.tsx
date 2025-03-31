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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { PlayCircle, Award, Clock, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch user enrollments
  const {
    data: enrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: !!user,
  });
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate stats
  const calculateStats = () => {
    if (!enrollments) return { total: 0, inProgress: 0, completed: 0, avgProgress: 0 };
    
    const total = enrollments.length;
    const completed = enrollments.filter((e: any) => e.status === "completed").length;
    const inProgress = total - completed;
    
    const totalProgress = enrollments.reduce((sum: number, e: any) => sum + e.progress, 0);
    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;
    
    return { total, inProgress, completed, avgProgress };
  };
  
  const stats = calculateStats();
  
  // Get in-progress and recently completed courses
  const inProgressCourses = enrollments?.filter((e: any) => 
    e.status !== "completed" && e.progress > 0
  ).sort((a: any, b: any) => b.progress - a.progress).slice(0, 3);
  
  const completedCourses = enrollments?.filter((e: any) => 
    e.status === "completed"
  ).sort((a: any, b: any) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  ).slice(0, 3);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-500 mt-1">
              Track your learning progress and manage your courses
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/courses">
              <Button>
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats.total}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats.completed}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Average Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                  <Progress value={stats.avgProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Progress */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>
                  Track your progress and continue learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="in-progress">
                  <TabsList className="mb-4">
                    <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="in-progress">
                    {isLoadingEnrollments ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : inProgressCourses && inProgressCourses.length > 0 ? (
                      <div className="space-y-4">
                        {inProgressCourses.map((enrollment: any) => (
                          <div 
                            key={enrollment.id} 
                            className="flex flex-col md:flex-row md:items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{enrollment.course.title}</h3>
                              <div className="flex flex-col md:flex-row md:items-center text-sm text-neutral-500 mb-3 md:mb-0">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>
                                    {Math.floor(enrollment.course.duration / 60)} hours
                                  </span>
                                </div>
                                <span className="hidden md:inline-block mx-2">•</span>
                                <div className="flex items-center">
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  <span>{enrollment.course.lessonCount} lessons</span>
                                </div>
                              </div>
                              <div className="md:hidden mt-2 mb-3">
                                <p className="text-sm mb-1">Progress: {enrollment.progress}%</p>
                                <Progress value={enrollment.progress} className="h-2" />
                              </div>
                            </div>
                            
                            <div className="hidden md:block w-40 mr-4">
                              <p className="text-sm mb-1">Progress: {enrollment.progress}%</p>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                            
                            <Link href={`/courses/${enrollment.course.id}`}>
                              <Button variant="outline" size="sm">
                                Continue
                              </Button>
                            </Link>
                          </div>
                        ))}
                        
                        <div className="text-center pt-2">
                          <Link href="/my-courses">
                            <Button variant="link">
                              View all courses
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                          <PlayCircle className="h-8 w-8 text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
                        <p className="text-neutral-500 mb-4">
                          Start learning by enrolling in a course!
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
                    ) : completedCourses && completedCourses.length > 0 ? (
                      <div className="space-y-4">
                        {completedCourses.map((enrollment: any) => (
                          <div 
                            key={enrollment.id} 
                            className="flex flex-col md:flex-row md:items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{enrollment.course.title}</h3>
                              <div className="flex flex-col md:flex-row md:items-center text-sm text-neutral-500 mb-3 md:mb-0">
                                <div className="flex items-center">
                                  <Award className="h-4 w-4 mr-1 text-green-500" />
                                  <span className="text-green-600 font-medium">Completed</span>
                                </div>
                                <span className="hidden md:inline-block mx-2">•</span>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>
                                    {enrollment.completedAt ? formatDate(enrollment.completedAt) : 'Unknown date'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <Link href={`/courses/${enrollment.course.id}`}>
                              <Button variant="outline" size="sm">
                                Review
                              </Button>
                            </Link>
                          </div>
                        ))}
                        
                        <div className="text-center pt-2">
                          <Link href="/my-courses">
                            <Button variant="link">
                              View all courses
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                          <Award className="h-8 w-8 text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No courses completed yet</h3>
                        <p className="text-neutral-500 mb-4">
                          Keep learning to earn your first certificate!
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.username || ""} />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.[0] || user?.username?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-bold">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username}
                  </h2>
                  <p className="text-neutral-500">{user?.email}</p>
                  
                  <div className="mt-2 flex">
                    <Link href="/settings">
                      <Button variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Account Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Username:</span>
                      <span>{user?.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Account Type:</span>
                      <span className="capitalize">{user?.role || "Student"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Joined:</span>
                      <span>{user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Learning Stats</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{stats.completed}</p>
                      <p className="text-xs text-neutral-500">Completed</p>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{stats.inProgress}</p>
                      <p className="text-xs text-neutral-500">In Progress</p>
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

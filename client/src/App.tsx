import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursesPage from "@/pages/courses-page";
import CategoriesPage from "@/pages/categories-page";
import AboutPage from "@/pages/about-page";
import CourseDetailPage from "@/pages/course-detail-page";
import CheckoutPage from "@/pages/checkout-page";
import DashboardPage from "@/pages/dashboard-page";
import MyCoursesPage from "@/pages/my-courses-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/courses/:id" component={CourseDetailPage} />
      <ProtectedRoute path="/checkout/:courseId" component={CheckoutPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/my-courses" component={MyCoursesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

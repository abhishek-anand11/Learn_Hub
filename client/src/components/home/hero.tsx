import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-primary-800 text-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Advance your career with LearnHub
            </h1>
            <p className="mt-3 max-w-md text-lg text-primary-100 sm:text-xl md:mt-5">
              Access world-class courses taught by industry experts. Learn at your own pace and build skills for your future.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:gap-3">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-primary-50">
                  Browse Courses
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" className="mt-3 sm:mt-0 w-full sm:w-auto bg-primary-700 hover:bg-primary-800">
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 lg:mt-0 lg:w-1/2 lg:flex lg:justify-end">
            <div className="relative mx-auto w-full lg:max-w-md">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                  alt="Student learning online" 
                  className="object-cover rounded-lg shadow-xl"
                />
                <div className="absolute inset-0 bg-primary-800 opacity-10 rounded-lg"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-secondary-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">500+ courses available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Laptop, 
  BarChart2, 
  Palette, 
  Megaphone, 
  Camera,
  Heart
} from "lucide-react";

// Map category slugs to icons
const categoryIcons: Record<string, React.ReactNode> = {
  "programming": <Laptop className="text-xl" />,
  "business": <BarChart2 className="text-xl" />,
  "design": <Palette className="text-xl" />,
  "marketing": <Megaphone className="text-xl" />,
  "photography": <Camera className="text-xl" />,
  "health": <Heart className="text-xl" />,
};

// Map category slugs to colors
const categoryColors: Record<string, string> = {
  "programming": "bg-primary-100 text-primary-600 group-hover:bg-primary-200",
  "business": "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200",
  "design": "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
  "marketing": "bg-red-100 text-red-600 group-hover:bg-red-200",
  "photography": "bg-amber-100 text-amber-600 group-hover:bg-amber-200",
  "health": "bg-green-100 text-green-600 group-hover:bg-green-200",
};

export default function Categories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Explore Popular Categories</h2>
          <p className="mt-3 text-neutral-500 sm:mt-4">
            Find the perfect course from our wide range of categories
          </p>
        </div>
        
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {isLoading && Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 mt-4" />
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          ))}
          
          {error && (
            <div className="col-span-full text-center text-red-500">
              Failed to load categories. Please try again later.
            </div>
          )}
          
          {categories && categories.map((category) => (
            <Link key={category.id} href={`/courses?category=${category.slug}`}>
              <a className="group flex flex-col items-center p-4 rounded-lg transition-all hover:bg-neutral-50">
                <div className={`flex items-center justify-center h-16 w-16 rounded-full ${categoryColors[category.slug] || 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'}`}>
                  {categoryIcons[category.slug] || <Laptop className="text-xl" />}
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">{category.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{category.courseCount}+ courses</p>
              </a>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/categories">
            <a className="inline-flex items-center text-primary hover:text-primary-700 font-medium">
              View all categories
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}

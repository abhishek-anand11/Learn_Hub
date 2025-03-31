import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Link } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import { Separator } from "@/components/ui/separator";
import { 
  Laptop, 
  BarChart2, 
  Palette, 
  Megaphone, 
  Camera,
  Heart,
  ShieldCheck,
  Book,
  Music,
  Globe,
  Microscope,
  Briefcase
} from "lucide-react";

// Map category slugs to icons
const categoryIcons: Record<string, React.ReactNode> = {
  "programming": <Laptop className="text-2xl" />,
  "business": <BarChart2 className="text-2xl" />,
  "design": <Palette className="text-2xl" />,
  "marketing": <Megaphone className="text-2xl" />,
  "photography": <Camera className="text-2xl" />,
  "health": <Heart className="text-2xl" />,
  "finance": <Briefcase className="text-2xl" />,
  "music": <Music className="text-2xl" />,
  "science": <Microscope className="text-2xl" />,
  "language": <Globe className="text-2xl" />,
  "personal-development": <ShieldCheck className="text-2xl" />,
  "academics": <Book className="text-2xl" />,
};

// Map category slugs to colors
const categoryColors: Record<string, string> = {
  "programming": "bg-primary-100 text-primary-600 group-hover:bg-primary-200",
  "business": "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200",
  "design": "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
  "marketing": "bg-red-100 text-red-600 group-hover:bg-red-200",
  "photography": "bg-amber-100 text-amber-600 group-hover:bg-amber-200",
  "health": "bg-green-100 text-green-600 group-hover:bg-green-200",
  "finance": "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
  "music": "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200",
  "science": "bg-teal-100 text-teal-600 group-hover:bg-teal-200",
  "language": "bg-orange-100 text-orange-600 group-hover:bg-orange-200",
  "personal-development": "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200",
  "academics": "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200",
};

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Browse Categories
          </h1>
          <p className="mt-3 text-xl text-neutral-500">
            Explore our vast library of courses across diverse categories
          </p>
        </div>

        <Separator className="my-8" />

        {error && (
          <div className="text-center text-red-500 py-8">
            Failed to load categories. Please try again later.
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
                <div className="animate-pulse">
                  <div className="rounded-full bg-neutral-200 h-16 w-16 mx-auto mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded mx-auto w-24 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded mx-auto w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Link 
                key={category.id} 
                href={`/courses?category=${category.slug}`}
                className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200 text-center transition-all hover:shadow-md hover:border-primary"
              >
                <div className={`flex items-center justify-center h-20 w-20 rounded-full mx-auto mb-4 ${categoryColors[category.slug] || 'bg-neutral-100 text-neutral-600'}`}>
                  {categoryIcons[category.slug] || <Laptop className="text-2xl" />}
                </div>
                <h3 className="text-lg font-medium text-neutral-900">{category.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{category.courseCount}+ courses</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
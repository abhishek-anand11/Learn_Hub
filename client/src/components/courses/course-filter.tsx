import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { useLocation, useSearch } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterParams {
  search?: string;
  category?: string | number;
  minPrice?: number;
  maxPrice?: number;
  level?: string;
}

interface CourseFilterProps {
  onFilterChange: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
}

export default function CourseFilter({ onFilterChange, initialFilters = {} }: CourseFilterProps) {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState(initialFilters.search || "");
  const [categoryId, setCategoryId] = useState<string | number | undefined>(initialFilters.category);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPrice || 0,
    initialFilters.maxPrice || 200,
  ]);
  const [level, setLevel] = useState<string | undefined>(initialFilters.level);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Apply filters when they change
  useEffect(() => {
    const filters: FilterParams = {};
    if (search) filters.search = search;
    if (categoryId) filters.category = categoryId;
    if (priceRange[0] > 0) filters.minPrice = priceRange[0];
    if (priceRange[1] < 200) filters.maxPrice = priceRange[1];
    if (level) filters.level = level;

    onFilterChange(filters);
  }, [categoryId, priceRange, level]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: FilterParams = { ...initialFilters, search };
    onFilterChange(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setPriceRange([0, 200]);
    setLevel(undefined);
    onFilterChange({});
  };

  return (
    <div className="w-full">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
          >
            <Search size={18} />
          </button>
        </form>
        <Button
          variant="outline"
          className="ml-2 flex items-center"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Desktop Filter */}
      <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg shadow-md lg:shadow-none border lg:border-0 border-neutral-200`}>
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h3 className="font-medium">Filters</h3>
          <Button variant="ghost" size="sm" onClick={() => setMobileFilterOpen(false)}>
            <X size={18} />
          </Button>
        </div>

        <div className="hidden lg:block mb-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        <Accordion type="multiple" defaultValue={["category", "price", "level"]} className="w-full">
          <AccordionItem value="category">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              {categories ? (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={categoryId === category.id}
                        onCheckedChange={() =>
                          setCategoryId(categoryId === category.id ? undefined : category.id)
                        }
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {category.name} ({category.courseCount})
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-sm text-neutral-500">Loading categories...</div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger>Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="px-1">
                <Slider
                  value={priceRange}
                  min={0}
                  max={200}
                  step={5}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="my-6"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="level">
            <AccordionTrigger>Level</AccordionTrigger>
            <AccordionContent>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6">
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

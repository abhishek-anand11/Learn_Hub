import { Course } from "@shared/schema";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, Star, StarHalf } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

// Helper function to format time from minutes to hours and minutes
const formatDuration = (minutes: number | null) => {
  if (minutes === null) {
    return '0 hours';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} min` : ''}`;
};

export interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // Fetch instructor details
  const { data: instructor } = useQuery<User>({
    queryKey: [`/api/users/${course.instructorId}`],
    enabled: !!course.instructorId,
  });

  // Render stars based on rating
  const renderStars = (rating: number | null) => {
    if (rating === null) {
      rating = 0;
    }
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-amber-400 text-amber-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-amber-400" />);
    }
    
    return (
      <div className="flex">
        {stars}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border border-neutral-200 transition-all hover:shadow-md">
      <div className="relative aspect-video">
        <img 
          src={course.thumbnail || undefined} 
          alt={course.title} 
          className="absolute h-full w-full object-cover"
        />
        {course.isBestseller && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-200">
              Bestseller
            </Badge>
          </div>
        )}
        {course.isNew && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary">New</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-center mb-3">
          {renderStars(course.rating)}
          <span className="ml-2 text-sm text-neutral-600">
            {course.rating !== null ? course.rating.toFixed(1) : '0.0'} ({course.reviewCount} {course.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
          <Link href={`/courses/${course.id}`} className="hover:underline">
            {course.title}
          </Link>
        </h3>
        
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center text-sm text-neutral-500 space-x-4 mb-3">
          <div className="flex items-center">
            <Video className="mr-2 h-4 w-4 text-neutral-400" />
            <span>{course.lessonCount} lessons</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-neutral-400" />
            <span>{formatDuration(course.duration)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center">
          {instructor ? (
            <>
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={instructor.avatar || undefined} alt={instructor.username} />
                <AvatarFallback>
                  {instructor.firstName?.[0] || instructor.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-neutral-700">
                {instructor.firstName && instructor.lastName 
                  ? `${instructor.firstName} ${instructor.lastName}` 
                  : instructor.username}
              </span>
            </>
          ) : (
            <div className="animate-pulse flex items-center">
              <div className="h-8 w-8 bg-neutral-200 rounded-full mr-2"></div>
              <div className="h-4 w-24 bg-neutral-200 rounded"></div>
            </div>
          )}
        </div>
        <div className="text-primary-700 font-bold">
          {course.price === 0 ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
              Free
            </span>
          ) : course.discountPrice ? (
            <div>
              <span className="text-primary-700">${course.discountPrice.toFixed(2)}</span>
              <span className="ml-2 text-neutral-500 line-through text-sm">${course.price.toFixed(2)}</span>
            </div>
          ) : (
            <span>${course.price.toFixed(2)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, StarHalf } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "The web development bootcamp was exactly what I needed to transition to a new career. I landed a job as a frontend developer within a month of completing the course!",
    name: "Emma Rodriguez",
    role: "Web Developer at TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5
  },
  {
    id: 2,
    content: "The UX Design course completely changed how I approach my work. The instructor was amazing and the practical exercises helped me build a portfolio that impressed my clients.",
    name: "James Wilson",
    role: "Freelance UX Designer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5
  },
  {
    id: 3,
    content: "The data science course was incredibly comprehensive. I went from knowing basic Python to implementing machine learning models in just 3 months. Worth every penny!",
    name: "Daniel Chen",
    role: "Data Analyst at FinTech Inc.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=120&h=120&q=80",
    rating: 4.5
  }
];

export default function Testimonials() {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-amber-400 text-amber-400" />);
    }
    
    return stars;
  };

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Student Success Stories</h2>
          <p className="mt-3 text-lg text-neutral-500">
            See what our students have achieved after completing our courses
          </p>
        </div>
        
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
              <div className="flex text-amber-400 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <blockquote className="text-neutral-700">
                <p>"{testimonial.content}"</p>
              </blockquote>
              <div className="mt-6 flex items-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <div className="font-medium text-neutral-900">{testimonial.name}</div>
                  <div className="text-sm text-neutral-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

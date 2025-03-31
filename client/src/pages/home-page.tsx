import MainLayout from "@/components/layout/main-layout";
import Hero from "@/components/home/hero";
import Categories from "@/components/home/categories";
import FeaturedCourses from "@/components/home/featured-courses";
import Benefits from "@/components/home/benefits";
import Testimonials from "@/components/home/testimonials";
import InstructorCTA from "@/components/home/instructor-cta";
import Newsletter from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <Categories />
      <FeaturedCourses />
      <Benefits />
      <Testimonials />
      <InstructorCTA />
      <Newsletter />
    </MainLayout>
  );
}

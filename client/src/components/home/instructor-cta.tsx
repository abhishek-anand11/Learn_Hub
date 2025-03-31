import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function InstructorCTA() {
  return (
    <section className="py-12 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold sm:text-3xl">Become an Instructor</h2>
            <p className="mt-3 text-purple-100 text-lg">
              Share your knowledge with our global community of learners. Create courses and earn revenue while making a difference.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:gap-3">
              <Link href="/become-instructor">
                <Button variant="secondary" size="lg" className="bg-white text-purple-700 hover:bg-purple-50">
                  Start Teaching Today
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 lg:mt-0 lg:w-1/3 lg:flex lg:justify-end">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-neutral-900">Instructor Benefits</h3>
                <ul className="mt-4 space-y-3 text-left text-neutral-700">
                  <li className="flex">
                    <CheckCircle2 className="h-5 w-5 text-secondary-500 mr-2" />
                    Earn competitive revenue
                  </li>
                  <li className="flex">
                    <CheckCircle2 className="h-5 w-5 text-secondary-500 mr-2" />
                    Reach students worldwide
                  </li>
                  <li className="flex">
                    <CheckCircle2 className="h-5 w-5 text-secondary-500 mr-2" />
                    Get technical support
                  </li>
                  <li className="flex">
                    <CheckCircle2 className="h-5 w-5 text-secondary-500 mr-2" />
                    Build your personal brand
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

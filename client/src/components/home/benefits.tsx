import { 
  Play, 
  Laptop, 
  Code, 
  Award, 
  Users, 
  Zap, 
  RefreshCw 
} from "lucide-react";

const benefits = [
  {
    icon: <Play />,
    title: "High-Quality Video Content",
    description: "Access professional HD video lessons with clear explanations and demonstrations."
  },
  {
    icon: <><Laptop className="h-4 w-4 mr-1" /><Code className="h-4 w-4" /></>,
    title: "Hands-On Projects",
    description: "Build your portfolio with real-world projects that demonstrate your skills."
  },
  {
    icon: <Award />,
    title: "Certificates of Completion",
    description: "Earn certificates that you can add to your resume and share on LinkedIn."
  },
  {
    icon: <Users />,
    title: "Community Support",
    description: "Join our active community of learners and get help when you need it."
  },
  {
    icon: <Zap />,
    title: "Learn at Your Own Pace",
    description: "Access course materials anytime, anywhere, and learn on your schedule."
  },
  {
    icon: <RefreshCw />,
    title: "Regular Updates",
    description: "Courses are regularly updated to ensure content stays current and relevant."
  }
];

export default function Benefits() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Why Learn with LearnHub?</h2>
          <p className="mt-3 text-lg text-neutral-500">
            We provide the tools and content you need to accelerate your learning journey
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-medium text-neutral-900">{benefit.title}</h3>
              <p className="mt-2 text-neutral-500">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

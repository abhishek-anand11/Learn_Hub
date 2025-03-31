import MainLayout from "@/components/layout/main-layout";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Users, Award, Globe, Clock, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
            About LearnHub
          </h1>
          <p className="mt-4 text-xl text-neutral-500">
            Transforming lives through accessible, high-quality education
          </p>
        </div>

        <Separator className="my-12" />

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Our Mission</h2>
            <p className="text-lg text-neutral-700 mb-6">
              At LearnHub, our mission is to create a world where anyone, anywhere can transform their life through learning. We believe that education is a fundamental human right and should be accessible to all.
            </p>
            <p className="text-lg text-neutral-700">
              We're committed to connecting learners to the skills they need to succeed in today's rapidly changing world. By partnering with top-tier instructors and industry experts, we ensure our content is not only current but truly transformational.
            </p>
          </div>
          <div className="bg-gradient-to-tr from-primary-100 to-primary-50 rounded-xl p-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary-200 p-4 inline-flex">
                    <Users className="h-8 w-8 text-primary-700" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900">12M+</h3>
                <p className="text-neutral-600">Learners</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary-200 p-4 inline-flex">
                    <GraduationCap className="h-8 w-8 text-primary-700" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900">100K+</h3>
                <p className="text-neutral-600">Courses</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary-200 p-4 inline-flex">
                    <Award className="h-8 w-8 text-primary-700" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900">5K+</h3>
                <p className="text-neutral-600">Instructors</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary-200 p-4 inline-flex">
                    <Globe className="h-8 w-8 text-primary-700" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900">180+</h3>
                <p className="text-neutral-600">Countries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Our Values</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Accessibility</h3>
              <p className="text-neutral-600">
                We believe quality education should be available to everyone regardless of geographic or economic constraints.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Excellence</h3>
              <p className="text-neutral-600">
                We are committed to maintaining the highest standards in our course offerings and platform experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <div className="rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Lifelong Learning</h3>
              <p className="text-neutral-600">
                We foster a community where curiosity is celebrated and continuous learning is encouraged.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Meet Our Leadership</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The passionate individuals driving our mission forward.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: "Alex Morgan",
                title: "CEO & Co-founder",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
              },
              {
                name: "Sarah Chen",
                title: "CTO & Co-founder",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
              },
              {
                name: "David Rodriguez",
                title: "Chief Learning Officer",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&auto=format&fit=crop"
              },
              {
                name: "Michelle Park",
                title: "COO",
                image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&auto=format&fit=crop"
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative rounded-full w-32 h-32 mx-auto mb-4 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="object-cover h-full w-full"
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">{member.name}</h3>
                <p className="text-neutral-600">{member.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join Us Section */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Join Our Journey</h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-8">
            Whether you're here to learn, teach, or join our team, you're helping to create a world where quality education is accessible to all.
          </p>
          <div className="flex justify-center space-x-4 flex-wrap">
            <a href="/courses" className="inline-flex rounded-md bg-primary px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mb-2">
              Browse Courses
            </a>
            <a href="/auth" className="inline-flex rounded-md bg-white px-6 py-3 text-lg font-medium text-primary border border-primary shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mb-2">
              Sign Up Today
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
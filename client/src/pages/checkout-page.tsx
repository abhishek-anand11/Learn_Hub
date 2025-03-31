import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Course } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Lock, CreditCard } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Simplified payment form schema - in a real app, this would be handled by Stripe
const paymentFormSchema = z.object({
  cardName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), {
    message: "Card number must be 16 digits",
  }),
  expiry: z.string().refine((val) => /^\d{2}\/\d{2}$/.test(val), {
    message: "Expiry date must be in MM/YY format",
  }),
  cvc: z.string().refine((val) => /^\d{3,4}$/.test(val), {
    message: "CVC must be 3 or 4 digits",
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function CheckoutPage() {
  const [, params] = useRoute<{ courseId: string }>("/checkout/:courseId");
  const courseId = params?.courseId ? parseInt(params.courseId) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch course details
  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });
  
  // Payment form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });
  
  // Format card number with spaces while typing
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    return v;
  };
  
  // Format expiry date while typing
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would create a payment intent with Stripe
      const res = await apiRequest("POST", "/api/create-payment-intent", { 
        courseId 
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsSubmitting(false);
      // Simulate successful payment and enrollment
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/user/enrollments`] });
        toast({
          title: "Payment successful!",
          description: "You have been enrolled in this course.",
        });
        // Redirect to the course page
        window.location.href = `/courses/${courseId}`;
      }, 1500);
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: PaymentFormValues) => {
    setIsSubmitting(true);
    
    // In a real app, this would validate the payment with Stripe
    // before calling the payment intent API
    setTimeout(() => {
      paymentMutation.mutate();
    }, 1500);
  };
  
  // Calculate order summary
  const calculateOrderSummary = () => {
    if (!course) return { subtotal: 0, total: 0 };
    
    const price = course.discountPrice || course.price;
    return {
      subtotal: price,
      total: price,
    };
  };
  
  const { subtotal, total } = calculateOrderSummary();
  
  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your purchase.",
        variant: "destructive",
      });
      window.location.href = "/auth";
    }
  }, [user]);
  
  // Show loading state
  if (isLoadingCourse) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Show error state
  if (courseError || !course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-800 mb-2">Course Not Found</h2>
            <p className="text-red-600 mb-6">
              The requested course could not be found.
            </p>
            <Link href="/courses">
              <Button variant="outline">Browse All Courses</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="ml-auto flex items-center text-sm text-neutral-600">
            <Lock className="h-4 w-4 mr-1" />
            Secure Checkout
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Complete your purchase securely with credit card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name on card" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="1234 5678 9012 3456" 
                                {...field} 
                                onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                                maxLength={16}
                              />
                              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MM/YY" 
                                {...field} 
                                onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                                maxLength={5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123" 
                                type="password" 
                                {...field} 
                                maxLength={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting 
                        ? "Processing Payment..." 
                        : `Pay $${total.toFixed(2)}`}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 flex items-center justify-center">
                  <div className="flex space-x-4">
                    <img 
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" 
                      alt="Visa" 
                      className="h-8"
                    />
                    <img 
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" 
                      alt="Mastercard" 
                      className="h-8"
                    />
                    <img 
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" 
                      alt="Apple Pay" 
                      className="h-8"
                    />
                    <svg className="h-8" viewBox="0 0 124 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28.4855 0H3.55844C1.5919 0 0 1.59178 0 3.55831V29.4414C0 31.408 1.5919 32.9998 3.55844 32.9998H28.4855C30.4521 32.9998 32.044 31.408 32.044 29.4414V3.55831C32.044 1.59178 30.4521 0 28.4855 0Z" fill="#6772E5"/>
                      <path d="M17.6567 13.5857C17.6567 12.3462 18.6412 11.9996 19.6155 11.9996C20.979 11.9996 22.633 12.504 23.9868 13.3922V8.89107C22.5026 8.21191 21.0282 8 19.6155 8C16.2231 8 13.3999 10.1844 13.3999 13.6968C13.3999 18.7386 19.802 17.8514 19.802 19.919C19.802 21.3628 18.6233 21.723 17.5272 21.723C16.0232 21.723 14.2079 20.9884 12.69 19.9793V24.5408C14.3749 25.4138 16.0946 25.7207 17.5272 25.7207C21.0044 25.7207 24.0955 23.6592 24.0955 19.9081C24.0955 14.4621 17.6567 15.5682 17.6567 13.5857Z" fill="white"/>
                      <path d="M48.8953 8.319H45.2681L45.3086 22.6996H49.1196L55.4188 13.1748V22.6996H59.2368V8.319H55.6503L49.3106 17.8039L48.8953 8.319Z" fill="#6772E5"/>
                      <path d="M69.8142 16.4922H65.6306L67.6821 10.208L69.8142 16.4922ZM72.5454 22.6996H76.5988L70.9962 8.319H66.42L60.8174 22.6996H64.8708L65.8553 19.798H71.5619L72.5454 22.6996Z" fill="#6772E5"/>
                      <path d="M83.544 10.897V22.6996H79.7239V8.319H85.1693L87.8093 19.9384L90.4482 8.319H95.8937V22.6996H92.0756V10.897L88.6968 22.6996H86.9218L83.544 10.897Z" fill="#6772E5"/>
                      <path d="M110.777 14.5601V22.6996H106.873V8.319H110.777V12.6757L114.301 8.319H118.775L114.42 13.5037L124 22.6996H118.513L112.139 16.1803L110.777 14.5601Z" fill="#6772E5"/>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{course.title}</h3>
                      <div className="text-sm text-neutral-500">
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)} Level
                      </div>
                      
                      {course.discountPrice && course.discountPrice < course.price && (
                        <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-200">
                          {Math.round((1 - course.discountPrice / course.price) * 100)}% off
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-xs text-center text-neutral-500 mb-4">
                  By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
                <p className="text-xs text-center text-neutral-500">
                  30-Day Money-Back Guarantee
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, ArrowLeft, Shield, CheckCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const resetSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(6),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ForgotPassword = () => {
  const [step, setStep] = useState<"EMAIL" | "RESET">("EMAIL");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleEmailSubmit = async (data: EmailValues) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast({ title: "OTP sent!", description: "Check your email inbox." });
        setStep("RESET");
        resetForm.reset({ email: data.email, otp: "", password: "", confirmPassword: "" });
      } else {
        toast({
          title: "Error sending OTP",
          description: result?.message || "Try again later.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Unable to reach the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetValues) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Password reset successful!" });
        navigate("/login");
      } else {
        toast({
          title: "Reset Failed",
          description: result?.message || "Check your OTP and try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Unable to reset password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar onOpenAuth={() => {}} />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl overflow-hidden">
            <div className="md:flex">
              {/* Left side - Illustration */}
              <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">
                      {step === "EMAIL" ? "Reset Password" : "Create New Password"}
                    </h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      {step === "EMAIL" 
                        ? "Don't worry! We'll help you regain access to your account quickly and securely."
                        : "You're almost done! Create a strong new password for your account."
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                      <span>Secure password recovery</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>Email verification</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                      <span>Account protection</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative shapes */}
                <div className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-xl rotate-12"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/3 right-8 w-8 h-8 bg-white/10 rounded-lg"></div>
              </div>

              {/* Right side - Form */}
              <div className="md:w-1/2 p-8 lg:p-12">
                <CardHeader className="text-center mb-8 p-0">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {step === "EMAIL" ? "Forgot Password" : "Reset Password"}
                  </CardTitle>
                  <p className="text-gray-600">
                    {step === "EMAIL" 
                      ? "Enter your email to receive a verification code"
                      : "Enter the code sent to your email and create a new password"
                    }
                  </p>
                </CardHeader>

                <CardContent className="p-0">
                  {step === "EMAIL" ? (
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                  <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 transition-colors"
                                    disabled={loading}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]" 
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Sending OTP...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>Send Verification Code</span>
                            </div>
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...resetForm}>
                      <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-6">
                        <FormField
                          control={resetForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    disabled={true}
                                    className="pl-10 h-11 bg-gray-50 border-gray-200"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={resetForm.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Verification Code</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input 
                                    type="text" 
                                    placeholder="Enter 6-digit code" 
                                    maxLength={6} 
                                    disabled={loading}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors text-center text-lg tracking-widest"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={resetForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input 
                                    type="password" 
                                    placeholder="Create a strong password" 
                                    disabled={loading}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={resetForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Confirm New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input 
                                    type="password" 
                                    placeholder="Confirm your password" 
                                    disabled={loading}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]" 
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Resetting Password...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Reset Password</span>
                            </div>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-gray-600 hover:text-gray-800"
                          onClick={() => {
                            setStep("EMAIL");
                            resetForm.reset();
                          }}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to email verification
                        </Button>
                      </form>
                    </Form>
                  )}
                  
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      Remember your password?{" "}
                      <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPassword;

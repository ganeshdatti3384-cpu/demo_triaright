
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail } from "lucide-react";
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
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-4">
        <Card className="w-full max-w-4xl md:flex rounded-2xl shadow-2xl overflow-hidden -mt-16">
          {/* Left Column */}
          <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
            <div className="text-center">
              <img
                src="/lovable-uploads/register.png"
                alt="Reset Password"
                className="h-64 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-blue-700">Reset Your Password</h2>
              <p className="mt-2 text-sm text-gray-700">
                We'll help you get back into your account quickly.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2 bg-white p-6">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl text-gray-800">
                {step === "EMAIL" ? "Forgot Password" : "Reset Password"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "EMAIL" ? (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10"
                                disabled={loading}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" disabled={loading} {...field} />
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
                          <FormLabel>OTP</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Enter OTP" maxLength={6} disabled={loading} {...field} />
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
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="New password" disabled={loading} {...field} />
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
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm password" disabled={loading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm mt-2"
                      onClick={() => {
                        setStep("EMAIL");
                        resetForm.reset();
                      }}
                    >
                      ← Back to email
                    </Button>
                  </form>
                </Form>
              )}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPassword;


import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Sparkles } from "lucide-react";
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
import { authApi } from "@/services/api";

const resetSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type ResetValues = z.infer<typeof resetSchema>;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
      newPassword: "",
    },
  });

  const handleSubmit = async (data: ResetValues) => {
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(data.email);

      toast({
        title: "Success",
        description: result.message || "Password changed successfully",
      });

      form.reset();
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Failed to reset",
        description:
          err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 px-4 py-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
        </div>

        <Card className="w-full max-w-4xl md:flex rounded-2xl shadow-2xl overflow-hidden -mt-16 bg-white/10 backdrop-blur-md border-0 relative z-10">
          {/* Left Column */}
          <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300 mx-auto w-fit">
                <Lock className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Reset Your Password
              </h2>
              <p className="text-blue-200 text-lg">
                We'll help you get back into your account quickly and securely.
              </p>
              <div className="flex justify-center mt-4">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-sm p-6">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100 font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10 bg-white/20 border-blue-300/30 text-white placeholder:text-blue-300 focus:bg-white/30 transition-all shadow-lg"
                              disabled={loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100 font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          New Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              className="pl-10 bg-white/20 border-blue-300/30 text-white placeholder:text-blue-300 focus:bg-white/30 transition-all shadow-lg"
                              disabled={loading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Changing Password...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Change Password
                      </div>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-blue-200">
                  Remember your password?{" "}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-colors">
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

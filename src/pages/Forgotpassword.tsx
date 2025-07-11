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
import { authApi } from "@/services/api"; // Import this function

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
      const result = await authApi.changePasswordWithEmail({
        email: data.email,
        newPassword: data.newPassword,
      });

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
              <CardTitle className="text-2xl text-gray-800">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </Form>

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

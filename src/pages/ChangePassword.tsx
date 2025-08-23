/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { authApi } from "@/services/api"; // Adjust path if needed
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const handleChangePassword = async (data: ChangePasswordValues) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const result = await authApi.updatePassword({
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      }, token);

      toast({
        title: "Success",
        description: result.message || "Password updated successfully",
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message || error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
        <Card className="w-full max-w-md rounded-2xl shadow-2xl p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleChangePassword)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Old Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter old password"
                          disabled={loading}
                          {...field}
                        />
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
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ChangePassword;
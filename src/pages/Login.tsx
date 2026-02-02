/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Zap, Shield, Lock, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      login(response.user, response.token);

      toast.success('Login Successful!', {
        description: 'Welcome back!',
      });

      /*  ⭐ UPDATED ROLE-BASED NAVIGATION  */
      switch (response.user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'Trainer':
          navigate('/trainer/dashboard');
          break;
        case 'jobseeker':
          navigate('/job-seeker');
          break;
        case 'employer':
          navigate('/employer');
          break;
        case 'college':
          navigate('/college');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;

        /*  ⭐ TRAINER → Trainer Dashboard  */
        case 'Trainer':
          navigate('/trainer/dashboard');
          break;

        case 'superadmin':
          navigate('/super-admin');
          break;
        default:
          navigate('/');
      }

    } catch (error: any) {
      toast.error('Login Failed', {
        description: error.response?.data?.message || 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rotate-12 animate-pulse"></div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl flex items-center justify-center">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

              {/* Left Section */}
              <div className="hidden lg:flex flex-col items-center text-center text-black space-y-8">
                <div className="relative">
                  <div className="w-80 h-80 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl backdrop-blur-xl border border-blue transform rotate-3 shadow-2xl"></div>
                    <div className="absolute inset-2 rounded-2xl backdrop-blur-xl border border-white/5 flex items-center justify-center transform -rotate-2">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                          <Lock className="h-10 w-10 text-black" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full mx-auto w-32 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mx-auto w-24 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Welcome Back to TriaRight
                  </h2>
                  <p className="text-xl text-black max-w-md">
                    Secure login to access your personalized learning journey
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <div className="w-full max-w-md mx-auto">
                <Card className="backdrop-blur-xl bg-black/5 border-0 shadow-2xl">
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Lock className="h-8 w-8 text-black" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-black/80 bg-clip-text text-transparent">
                      Sign In
                    </CardTitle>
                    <p className="text-gray-400 mt-2">Access your account securely</p>
                  </CardHeader>

                  <CardContent className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-gray-800 font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/50 border-white/20 text-black placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-800 font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-12 h-12 bg-white/50 border-white/20 text-black placeholder:text-gray-400"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-black hover:scale-105 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-gray-800 text-sm">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-blue-400 hover:underline">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;


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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      login(response.user, response.token);

      toast({
        title: 'Login successful!',
        description: 'Welcome back!',
      });

      switch (response.user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'jobseeker':
          navigate('/jobseeker');
          break;
        case 'employer':
          navigate('/employer');
          break;
        case 'college':
          navigate('/college');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'superadmin':
          navigate('/super-admin');
          break;
        default:
          navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rotate-12 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Radial gradients */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl flex items-center justify-center">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              
              {/* Left Column - 3D Illustration & Features */}
              <div className="hidden lg:flex flex-col items-center text-center text-white space-y-8">
                {/* 3D-like login illustration */}
                <div className="relative">
                  <div className="w-80 h-80 relative">
                    {/* Main container with 3D effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-3xl backdrop-blur-xl border border-white/10 transform rotate-3 shadow-2xl"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl backdrop-blur-xl border border-white/5 flex items-center justify-center transform -rotate-2">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                          <Lock className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full mx-auto w-32 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mx-auto w-24 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature highlights */}
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Welcome Back to TriaRight
                  </h2>
                  <p className="text-xl text-gray-300 max-w-md">
                    Secure login to access your personalized learning journey
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Secure Access</h4>
                        <p className="text-sm text-gray-400">Protected login system</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Personalized</h4>
                        <p className="text-sm text-gray-400">Tailored experience</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Fast & Reliable</h4>
                        <p className="text-sm text-gray-400">Quick access to courses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="w-full max-w-md mx-auto">
                <Card className="backdrop-blur-xl bg-white/10 border-0 shadow-2xl">
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Sign In
                    </CardTitle>
                    <p className="text-gray-400 mt-2">Access your account securely</p>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-200 font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-200 font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-12 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            id="remember"
                            type="checkbox"
                            className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-400/20"
                          />
                          <Label htmlFor="remember" className="text-sm text-gray-300">Remember me</Label>
                        </div>
                        <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          Forgot password?
                        </Link>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Sign In</span>
                            <Sparkles className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-gray-400 text-sm">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
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

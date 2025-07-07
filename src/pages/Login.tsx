
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // Store authentication data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', response.user.role);

      toast({
        title: 'Login successful!',
        description: 'Welcome back!',
      });

      // Redirect based on user role
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

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl overflow-hidden">
            <div className="md:flex">
              {/* Left side - Illustration */}
              <div className="md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      Continue your learning journey with TriaRight. Access thousands of courses and advance your career.
                    </p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                      <span>Personalized learning paths</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span>Industry-recognized certifications</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                      <span>Expert-led courses</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative shapes */}
                <div className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-xl rotate-12"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 right-8 w-8 h-8 bg-white/10 rounded-lg"></div>
              </div>

              {/* Right side - Login form */}
              <div className="md:w-1/2 p-8 lg:p-12">
                <CardHeader className="text-center mb-8 p-0">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Sign In
                  </CardTitle>
                  <p className="text-gray-600">Enter your credentials to access your account</p>
                </CardHeader>

                <CardContent className="p-0">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 transition-colors"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          id="remember"
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
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
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Create account
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

export default Login;

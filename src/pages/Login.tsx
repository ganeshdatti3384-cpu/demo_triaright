
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        // Set authentication status in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('userName', email.split('@')[0]);

        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });

        // Navigate to appropriate dashboard based on role
        switch (selectedRole) {
          case 'student':
            navigate('/student');
            break;
          case 'job-seeker':
            navigate('/job-seeker');
            break;
          case 'employee':
            navigate('/employee');
            break;
          case 'employer':
            navigate('/employer');
            break;
          case 'colleges':
            navigate('/college');
            break;
          case 'admin':
            navigate('/admin');
            break;
          case 'super-admin':
            navigate('/super-admin');
            break;
          default:
            navigate('/student');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Please enter valid credentials",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <Navbar onOpenAuth={() => {}} />  

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-4">
        <Card className="w-full max-w-4xl md:flex rounded-2xl shadow-2xl overflow-hidden -mt-16">
          {/* Left Column */}
          <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
            <div className="text-center">
              <img
                src="/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png"
                alt="TriaRight Logo"
                className="h-16 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-blue-700">Welcome to Aploye</h2>
              <p className="mt-2 text-sm text-gray-700">
                Connect. Learn. Grow. Start your future today.
              </p>
            </div>
          </div>

          {/* Right Column - Login */}
          <div className="w-full md:w-1/2 bg-white p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-center text-gray-800">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700">Login as</Label>
                  <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="student">Student</option>
                    <option value="job-seeker">Job Seeker</option>
                    <option value="employee">Employee</option>
                    <option value="employer">Employer</option>
                    <option value="colleges">College</option>
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                    Sign up
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

export default Login;

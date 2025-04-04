import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, otpSchema } from '../../lib/validations';
import { useToast } from '../../hooks/use-toast';
import UpdatedLayout from '../../components/layout/UpdatedLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

type LoginData = z.infer<typeof loginSchema>;
type OtpData = z.infer<typeof otpSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, verifyOTP, loading } = useAuth();
  const { toast } = useToast();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      studentNumber: '',
    },
  });

  // OTP form
  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Reset OTP form when showing it
  useEffect(() => {
    if (showOtpForm) {
      // Make sure the OTP field is cleared when we show the OTP form
      otpForm.reset({ otp: '' });
    }
  }, [showOtpForm, otpForm]);

  // Submit login form
  const onLoginSubmit = async (data: LoginData) => {
    try {
      const result = await login(data.studentNumber);
      
      if (result.success) {
        setStudentNumber(data.studentNumber);
        setShowOtpForm(true);
        
        toast({
          title: "OTP Sent",
          description: "Please check your registered contact details for the OTP",
        });
        
        // In development mode, show the OTP in toast
        if (import.meta.env.DEV && result.otp) {
          toast({
            title: "Development Mode",
            description: `Your OTP is: ${result.otp}`,
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Submit OTP form
  const onOtpSubmit = async (data: OtpData) => {
    try {
      const result = await verifyOTP(data.otp);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the SRC Nomination Platform",
        });
        navigate('/');
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Go back to login form
  const handleBackToLogin = () => {
    setShowOtpForm(false);
    loginForm.reset();
    otpForm.reset({ otp: '' });
  };

  return (
    <UpdatedLayout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          {!showOtpForm ? (
            // Login Form
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                  Enter your student number to access the SRC nomination platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="studentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your student number"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormDescription>
                            Your registered student number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending OTP..." : "Continue"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center mt-2">
                  <Link to="/admin/login" className="text-primary hover:underline">
                    Admin Login
                  </Link>
                </div>
              </CardFooter>
            </>
          ) : (
            // OTP Verification Form
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to your registered contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                    <div className="text-sm mb-4 p-3 bg-gray-50 rounded-md">
                      Verification code sent to student number: <strong>{studentNumber}</strong>
                    </div>
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OTP Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit OTP"
                              {...field}
                              maxLength={6}
                              disabled={loading}
                              type="text"
                              autoComplete="one-time-code"
                              className="text-center tracking-widest text-lg font-medium"
                            />
                          </FormControl>
                          <FormDescription>
                            The code has been sent to your registered contact details
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-sm"
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </UpdatedLayout>
  );
};

export default LoginPage;

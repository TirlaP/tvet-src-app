import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import UpdatedLayout from '../../components/layout/UpdatedLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

// Updated validation schemas
const loginSchema = z.object({
  studentNumber: z.string().min(5, "Student number must be at least 5 characters"),
  email: z.string().email("Please enter a valid email address")
});

const otpSchema = z.object({
  otp: z.string().min(1, "OTP is required").max(6, "OTP must be 6 digits")
});

type LoginData = z.infer<typeof loginSchema>;
type OtpData = z.infer<typeof otpSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, verifyOTP, loading } = useAuth();
  const { toast } = useToast();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [processingOtp, setProcessingOtp] = useState(false);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      studentNumber: '',
      email: ''
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
      // Store student number and email for OTP verification
      setStudentNumber(data.studentNumber);
      setEmail(data.email);
      
      const result = await login(data.studentNumber, data.email);
      
      if (result.success) {
        setShowOtpForm(true);
        
        toast({
          title: "OTP Sent",
          description: `Please check ${data.email} for the OTP code`,
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
      console.error('Login submission error:', error);
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
      setProcessingOtp(true);
      console.log("Submitting OTP:", data.otp);
      
      const result = await verifyOTP(studentNumber, email, data.otp);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the SRC Nomination Platform",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingOtp(false);
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
                  Enter your student number and email to access the platform
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
                    
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormDescription>
                            OTP verification code will be sent to this email
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
                  Enter the 6-digit code sent to your email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                    <div className="text-sm mb-4 p-3 bg-gray-50 rounded-md">
                      <div>Student: <strong>{studentNumber}</strong></div>
                      <div>Email: <strong>{email}</strong></div>
                    </div>
                    
                    {/* Modified OTP Input Field */}
                    <div className="space-y-2">
                      <FormLabel htmlFor="otp-input">OTP Code</FormLabel>
                      <Input 
                        id="otp-input"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        type="text" 
                        autoComplete="one-time-code"
                        className="text-center tracking-widest text-lg font-medium"
                        disabled={processingOtp}
                        value={otpForm.watch('otp') || ''}
                        onChange={(e) => {
                          console.log("OTP input changed:", e.target.value);
                          otpForm.setValue('otp', e.target.value, { shouldValidate: true });
                        }}
                      />
                      {otpForm.formState.errors.otp && (
                        <p className="text-sm font-medium text-destructive">
                          {otpForm.formState.errors.otp.message}
                        </p>
                      )}
                      <FormDescription className="text-sm text-muted-foreground">
                        The code has been sent to your email address
                      </FormDescription>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={processingOtp}>
                      {processingOtp ? "Verifying..." : "Verify & Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-sm"
                  disabled={processingOtp}
                >
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Resend OTP
                    login(studentNumber, email).then((result) => {
                      if (result.success) {
                        toast({
                          title: "OTP Resent",
                          description: `Please check ${email} for the new OTP code`,
                        });
                        
                        // In development mode, show the OTP in toast
                        if (import.meta.env.DEV && result.otp) {
                          toast({
                            title: "Development Mode",
                            description: `Your new OTP is: ${result.otp}`,
                            variant: "default",
                          });
                        }
                      } else {
                        toast({
                          title: "Failed to Resend OTP",
                          description: result.message,
                          variant: "destructive",
                        });
                      }
                    });
                  }}
                  disabled={processingOtp}
                >
                  Resend OTP
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
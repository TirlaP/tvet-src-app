import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { FileUpload } from '../../components/ui/file-upload';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { studentService } from '../../lib/services';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save } from 'lucide-react';

// Profile update schema
const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  cellNumber: z.string().min(10, { message: 'Please enter a valid phone number' }),
  course: z.string().min(2, { message: 'Course name is required' }),
  yearOfStudy: z.string().min(1, { message: 'Year of study is required' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [studentCardImage, setStudentCardImage] = useState<string>('');
  
  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      cellNumber: currentUser?.cellNumber || '',
      course: currentUser?.course || '',
      yearOfStudy: currentUser?.yearOfStudy || '',
    },
  });
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      // Set studentCardImage if available
      setStudentCardImage(currentUser.studentCardImage || '');
    }
  }, [currentUser, navigate]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      
      // Update student information
      await studentService.update(currentUser.id, {
        ...data,
        studentCardImage
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully",
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              My Profile
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <div className="text-sm text-gray-500">Student Number</div>
                  <div className="text-lg font-medium">{currentUser.studentNumber}</div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cellNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cell Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your cell number" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Format: 0XXXXXXXXX
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your course name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="yearOfStudy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Study</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your year of study" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Student Card Image</FormLabel>
                    <FileUpload
                      onFileChange={setStudentCardImage}
                      accept="image/*"
                      maxSize={3}
                      description="Upload a clear image of your student card"
                      className="mt-1"
                      currentImage={studentCardImage}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;

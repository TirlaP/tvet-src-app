import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { studentSchema } from '../../lib/validations';
import { useFormWizard } from '../../contexts/FormWizardContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent } from '../ui/card';

type NomineePersonalInfoData = z.infer<typeof studentSchema>;

const NomineePersonalInfo: React.FC = () => {
  const { formState, setFormData, nextStep } = useFormWizard();
  const { currentUser } = useAuth();
  
  // Pre-fill form with current user data if available
  const defaultValues: Partial<NomineePersonalInfoData> = {
    fullName: formState.data.fullName || currentUser?.fullName || '',
    studentNumber: formState.data.studentNumber || currentUser?.studentNumber || '',
    email: formState.data.email || currentUser?.email || '',
    cellNumber: formState.data.cellNumber || currentUser?.cellNumber || '',
    course: formState.data.course || currentUser?.course || '',
    yearOfStudy: formState.data.yearOfStudy || currentUser?.yearOfStudy || '',
    dataConsent: formState.data.dataConsent || currentUser?.dataConsent || false,
  };

  const form = useForm<NomineePersonalInfoData>({
    resolver: zodResolver(studentSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = (data: NomineePersonalInfoData) => {
    setFormData(data);
    nextStep();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormDescription>
                      Enter your name as it appears on your student card
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your student number" 
                        {...field} 
                        disabled={!!currentUser?.studentNumber}
                      />
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

              <FormField
                control={form.control}
                name="dataConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-4 bg-gray-50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Data Consent</FormLabel>
                      <FormDescription>
                        I consent to the collection and processing of my personal information for the purpose of SRC elections in accordance with POPIA regulations. I understand that my information will be used solely for election-related processes and will be stored securely.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NomineePersonalInfo;

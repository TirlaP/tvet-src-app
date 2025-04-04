import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nominationSchema } from '../../lib/validations';
import { useFormWizard } from '../../contexts/FormWizardContext';
import { Button } from '../ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';

type NomineePositionData = z.infer<typeof nominationSchema>;

// Available SRC positions
const srcPositions = [
  { id: 'president', name: 'President' },
  { id: 'deputy_president', name: 'Deputy President' },
  { id: 'secretary', name: 'Secretary' },
  { id: 'deputy_secretary', name: 'Deputy Secretary' },
  { id: 'treasurer', name: 'Treasurer' },
  { id: 'academic_officer', name: 'Academic Officer' },
  { id: 'sports_officer', name: 'Sports Officer' },
  { id: 'cultural_officer', name: 'Cultural Officer' },
  { id: 'communications_officer', name: 'Communications Officer' },
  { id: 'residence_officer', name: 'Residence Officer' },
];

const NomineePosition: React.FC = () => {
  const { formState, setFormData, prevStep, nextStep } = useFormWizard();
  
  const defaultValues: NomineePositionData = {
    position: formState.data.position || '',
    motivation: formState.data.motivation || '',
  };

  const form = useForm<NomineePositionData>({
    resolver: zodResolver(nominationSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = (data: NomineePositionData) => {
    setFormData(data);
    nextStep();
  };

  // Character count for motivation
  const motivationLength = form.watch('motivation')?.length || 0;
  const maxMotivationLength = 500;

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {srcPositions.map((position) => (
                          <SelectItem 
                            key={position.id} 
                            value={position.id}
                          >
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the SRC position you wish to contest
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief motivation for your nomination"
                        className="min-h-32 resize-none"
                        maxLength={maxMotivationLength}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Explain why you are suitable for this position</span>
                      <span className={motivationLength > 450 ? "text-orange-500" : ""}>
                        {motivationLength}/{maxMotivationLength}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
              >
                Back
              </Button>
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

export default NomineePosition;

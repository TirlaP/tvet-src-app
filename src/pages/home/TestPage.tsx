import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { nominationService } from '../../lib/services';
import { db } from '../../db/db';
import { NominationStatus } from '../../types/database';

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const [shareLink, setShareLink] = useState('m936l2a0eoprts651t');
  const [message, setMessage] = useState<string | null>(null);
  
  const createTestNomination = async () => {
    try {
      setMessage('Creating test nomination...');
      
      // Create a test student
      const testStudentId = await db.students.add({
        studentNumber: 'ST12345',
        fullName: 'Test Student',
        email: 'test@example.com',
        cellNumber: '0781234567',
        course: 'Computer Science',
        yearOfStudy: '2',
        dataConsent: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create a test nomination with the specified shareLink
      await db.nominations.add({
        nomineeId: testStudentId,
        position: 'President',
        motivation: 'I want to make a difference',
        status: NominationStatus.DRAFT,
        shareLink,
        qrCode: shareLink,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setMessage(`Test nomination created with shareLink: ${shareLink}`);
    } catch (error) {
      console.error('Error creating test nomination:', error);
      setMessage('Error creating test nomination');
    }
  };
  
  const testShareLink = async () => {
    try {
      setMessage('Testing shareLink...');
      
      const nomination = await nominationService.getByShareLink(shareLink);
      
      if (nomination) {
        setMessage(`Nomination found: ${JSON.stringify(nomination)}`);
      } else {
        setMessage('Nomination not found');
      }
    } catch (error) {
      console.error('Error testing shareLink:', error);
      setMessage('Error testing shareLink');
    }
  };
  
  const clearDatabase = async () => {
    try {
      setMessage('Clearing database...');
      
      await db.students.clear();
      await db.nominations.clear();
      await db.supporters.clear();
      await db.adminAudit.clear();
      
      setMessage('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      setMessage('Error clearing database');
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-3xl mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Page</CardTitle>
            <CardDescription>
              This page contains utilities for testing the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">ShareLink Testing</h3>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={shareLink}
                  onChange={(e) => setShareLink(e.target.value)}
                  placeholder="Enter share link"
                />
                <Button onClick={testShareLink} className="whitespace-nowrap">
                  Test Link
                </Button>
              </div>
              <Button 
                onClick={() => navigate(`/support/${shareLink}`)}
                variant="outline"
              >
                Go to Support Page
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Button onClick={createTestNomination}>
                Create Test Nomination
              </Button>
              <Button onClick={clearDatabase} variant="destructive">
                Clear Database
              </Button>
            </div>
            
            {message && (
              <div className="mt-4 p-4 border rounded bg-gray-50 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{message}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default TestPage;

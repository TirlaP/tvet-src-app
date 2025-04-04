import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../types/database';
import { db } from '../db/db';
import { delay, generateOTP } from '../lib/utils';

interface AuthContextType {
  currentUser: Student | null;
  loading: boolean;
  login: (studentNumber: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAdmin: boolean;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [storedOTP, setStoredOTP] = useState<string | null>(null);
  const [otpStudentNumber, setOtpStudentNumber] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on startup
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        
        if (storedIsAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (studentNumber: string): Promise<{ success: boolean; message: string; otp?: string }> => {
    try {
      setLoading(true);
      
      // In a real implementation, you would check if the student exists in the database
      const student = await db.students
        .where({ studentNumber })
        .first();
      
      if (!student && import.meta.env.PROD) {
        return { success: false, message: 'Student not found' };
      }
      
      // For development, create a test student if doesn't exist
      if (!student && import.meta.env.DEV) {
        // In development mode, create a test student if one doesn't exist
        const defaultStudent: Student = {
          studentNumber,
          fullName: 'Test Student',
          email: 'test@example.com',
          cellNumber: '0781234567',
          course: 'Computer Science',
          yearOfStudy: '2',
          dataConsent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save to the database
        await db.students.add(defaultStudent);
      }
      
      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP in state for verification
      setStoredOTP(otp);
      setOtpStudentNumber(studentNumber);
      
      // In development, log the OTP
      if (import.meta.env.DEV) {
        console.log('Generated OTP:', otp);
      }
      
      // In a real implementation, you would send this OTP to the student's phone or email
      
      return { 
        success: true, 
        message: 'OTP sent to your registered contact details', 
        otp: import.meta.env.DEV ? otp : undefined
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Something went wrong, please try again' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      
      // Debug logs in development
      if (import.meta.env.DEV) {
        console.log('Verifying OTP:', otp);
        console.log('Stored OTP:', storedOTP);
        console.log('Student Number:', otpStudentNumber);
      }
      
      // Check if OTP matches
      if (otp !== storedOTP || !otpStudentNumber) {
        return { success: false, message: 'Invalid OTP, please try again' };
      }
      
      // Get student from database
      const student = await db.students
        .where({ studentNumber: otpStudentNumber })
        .first();
      
      if (!student) {
        return { success: false, message: 'Student not found' };
      }
      
      // Add a small delay for better UX
      await delay(500);
      
      // Set current user
      setCurrentUser(student);
      localStorage.setItem('currentUser', JSON.stringify(student));
      
      // Clear OTP data
      setStoredOTP(null);
      setOtpStudentNumber(null);
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'Something went wrong, please try again' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
  };

  const adminLogin = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      
      // For simplicity, we'll use a hardcoded admin in development
      // In production, you would check against a secure database
      if (import.meta.env.DEV) {
        if (username === 'admin' && password === 'admin') {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
          
          await delay(1000); // Simulate delay
          
          return { success: true, message: 'Admin login successful' };
        }
      }
      
      // In production, implement actual admin auth
      if (import.meta.env.PROD) {
        // Real implementation would go here
      }
      
      return { success: false, message: 'Invalid username or password' };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: 'Something went wrong, please try again' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    verifyOTP,
    logout,
    isAdmin,
    adminLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

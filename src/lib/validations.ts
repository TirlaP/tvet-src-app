import { z } from 'zod';
import { isValidEmail, isValidPhoneNumber, isValidStudentNumber } from './utils';

// Student Schema
export const studentSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  studentNumber: z.string().refine(isValidStudentNumber, {
    message: 'Please enter a valid student number'
  }),
  email: z.string().refine(isValidEmail, {
    message: 'Please enter a valid email address'
  }),
  cellNumber: z.string().refine(isValidPhoneNumber, {
    message: 'Please enter a valid South African phone number'
  }),
  course: z.string().min(2, { message: 'Course name is required' }),
  yearOfStudy: z.string().min(1, { message: 'Year of study is required' }),
  studentCardImage: z.string().optional(),
  selfieImage: z.string().optional(),
  signature: z.string().optional(),
  dataConsent: z.boolean().refine(val => val === true, {
    message: 'You must consent to the data policy to continue'
  })
});

// Authentication Schema
export const loginSchema = z.object({
  studentNumber: z.string().refine(isValidStudentNumber, {
    message: 'Please enter a valid student number'
  }),
  email: z.string().refine(isValidEmail, {
    message: 'Please enter a valid email address'
  })
});

export const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits' })
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

// Nomination Schema
export const nominationSchema = z.object({
  position: z.string().min(2, { message: 'Position is required' }),
  motivation: z.string().min(20, { 
    message: 'Motivation must be at least 20 characters' 
  }).max(500, {
    message: 'Motivation cannot exceed 500 characters'
  })
});

// Full Nominee Schema (combines student and nomination data)
export const nomineeSchema = studentSchema.merge(nominationSchema);

// Supporter Schema (just student data)
export const supporterSchema = studentSchema;

// Image Upload Schema
export const imageUploadSchema = z.object({
  image: z.string().min(1, { message: 'Image is required' })
});

// QR Code Schema
export const qrCodeSchema = z.object({
  qrCode: z.string().min(1, { message: 'QR code is required' })
});

// Admin Filter Schema
export const adminFilterSchema = z.object({
  status: z.string().optional(),
  position: z.string().optional(),
  searchTerm: z.string().optional()
});

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidStudentNumber(studentNumber: string): boolean {
  // Allow both numeric formats and alphanumeric formats like 'ST12345'
  return /^([A-Za-z]{0,2}\d{5,10})$/.test(studentNumber);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  // South African phone number format
  const phoneRegex = /^(0[0-9]{9})$/;
  return phoneRegex.test(phoneNumber);
}

// Format position name (e.g., "deputy_president" -> "Deputy President")
export function formatPositionName(position: string): string {
  if (!position) return '';
  
  return position
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

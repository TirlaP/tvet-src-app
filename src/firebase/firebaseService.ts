import { db as firestoreDb } from './config';
import { db as dexieDb } from '../db/db';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  Student, 
  Nomination, 
  Supporter, 
  AdminAudit, 
  Admin 
} from '../types/database';

// Collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  NOMINATIONS: 'nominations',
  SUPPORTERS: 'supporters',
  ADMIN_AUDIT: 'adminAudit',
  ADMINS: 'admins',
  OTP: 'otps' // New collection for OTP storage
};

// Safety wrapper for Firebase operations
const safeFirebaseOperation = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  // Skip Firebase in development mode
  if (import.meta.env.DEV) {
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Firebase operation failed:', error);
    return fallback;
  }
};

// Firebase Service for students
export const studentService = {
  async add(student: Student): Promise<string> {
    try {
      // Check if student already exists in Dexie by id or studentNumber
      let existingId: number | undefined;
      
      if (student.id) {
        // First check by ID if present
        const existing = await dexieDb.students.get(student.id);
        if (existing) {
          existingId = student.id;
        }
      }
      
      // If no ID found, check by studentNumber
      if (!existingId && student.studentNumber) {
        const existing = await dexieDb.students.where({ studentNumber: student.studentNumber }).first();
        if (existing && existing.id) {
          existingId = existing.id;
        }
      }
      
      let id: number;
      
      if (existingId) {
        // Update existing student instead of adding new
        id = existingId;
        await dexieDb.students.update(id, {
          ...student,
          updatedAt: new Date()
        });
      } else {
        // Add new student
        id = await dexieDb.students.add(student);
      }
      
      const studentWithId = { ...student, id };
      
      // Then try to add to Firestore
      await safeFirebaseOperation(async () => {
        const docRef = doc(firestoreDb, COLLECTIONS.STUDENTS, id.toString());
        await setDoc(docRef, studentWithId);
      }, undefined);
      
      return id.toString();
    } catch (error) {
      console.error('Error adding student:', error);
      // Return a string ID even if there's an error - this prevents retries that will just fail again
      if (error.name === 'ConstraintError' && student.id) {
        return student.id.toString();
      }
      throw error;
    }
  },
  
  async update(id: number, student: Partial<Student>): Promise<void> {
    try {
      // Update in Dexie
      await dexieDb.students.update(id, student);
      
      // Try to update in Firestore
      await safeFirebaseOperation(async () => {
        const docRef = doc(firestoreDb, COLLECTIONS.STUDENTS, id.toString());
        await updateDoc(docRef, student);
      }, undefined);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },
  
  async getByStudentNumber(studentNumber: string): Promise<Student | undefined> {
    try {
      // Try to get from Dexie first (for speed)
      let student = await dexieDb.students.where({ studentNumber }).first();
      
      // If not found in Dexie, try Firebase
      if (!student) {
        student = await safeFirebaseOperation(async () => {
          const q = query(
            collection(firestoreDb, COLLECTIONS.STUDENTS), 
            where("studentNumber", "==", studentNumber)
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as Student;
            
            // Save to Dexie for next time
            if (data.id) {
              await dexieDb.students.put(data, data.id);
            }
            
            return data;
          }
          return undefined;
        }, undefined);
      }
      
      return student;
    } catch (error) {
      console.error('Error getting student by number:', error);
      return undefined;
    }
  },
  
  async getByEmail(email: string): Promise<Student | undefined> {
    try {
      // Try to get from Dexie first
      let student = await dexieDb.students.where({ email }).first();
      
      // If not found in Dexie, try Firebase
      if (!student) {
        student = await safeFirebaseOperation(async () => {
          const q = query(
            collection(firestoreDb, COLLECTIONS.STUDENTS), 
            where("email", "==", email)
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as Student;
            
            // Save to Dexie for next time
            if (data.id) {
              await dexieDb.students.put(data, data.id);
            }
            
            return data;
          }
          return undefined;
        }, undefined);
      }
      
      return student;
    } catch (error) {
      console.error('Error getting student by email:', error);
      return undefined;
    }
  }
};

// Firebase Service for nominations
export const nominationService = {
  async add(nomination: Nomination): Promise<string> {
    try {
      // Check if nomination already exists in Dexie
      let existingId: number | undefined;
      
      if (nomination.id) {
        // First check by ID if present
        const existing = await dexieDb.nominations.get(nomination.id);
        if (existing) {
          existingId = nomination.id;
        }
      }
      
      // If no ID found, check by nomineeId
      if (!existingId && nomination.nomineeId) {
        const existing = await dexieDb.nominations.where({ nomineeId: nomination.nomineeId }).first();
        if (existing && existing.id) {
          existingId = existing.id;
        }
      }
      
      let id: number;
      
      if (existingId) {
        // Update existing nomination instead of adding new
        id = existingId;
        await dexieDb.nominations.update(id, {
          ...nomination,
          updatedAt: new Date()
        });
      } else {
        // Add new nomination
        id = await dexieDb.nominations.add(nomination);
      }
      
      const nominationWithId = { ...nomination, id };
      
      // Try to add to Firestore
      await safeFirebaseOperation(async () => {
        const docRef = doc(firestoreDb, COLLECTIONS.NOMINATIONS, id.toString());
        await setDoc(docRef, nominationWithId);
      }, undefined);
      
      return id.toString();
    } catch (error) {
      console.error('Error adding nomination:', error);
      // Return a string ID even if there's an error - this prevents retries that will just fail again
      if (error.name === 'ConstraintError' && nomination.id) {
        return nomination.id.toString();
      }
      throw error;
    }
  },
  
  async update(id: number, nomination: Partial<Nomination>): Promise<void> {
    try {
      // Update in Dexie
      await dexieDb.nominations.update(id, nomination);
      
      // Try to update in Firestore
      await safeFirebaseOperation(async () => {
        const docRef = doc(firestoreDb, COLLECTIONS.NOMINATIONS, id.toString());
        await updateDoc(docRef, nomination);
      }, undefined);
    } catch (error) {
      console.error('Error updating nomination:', error);
      throw error;
    }
  },
  
  async getByShareLink(shareLink: string): Promise<Nomination | undefined> {
    try {
      // Try Dexie first
      let nomination = await dexieDb.nominations.where({ shareLink }).first();
      
      // If not found, try Firebase
      if (!nomination) {
        nomination = await safeFirebaseOperation(async () => {
          const q = query(
            collection(firestoreDb, COLLECTIONS.NOMINATIONS), 
            where("shareLink", "==", shareLink)
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as Nomination;
            
            // Save to Dexie
            if (data.id) {
              await dexieDb.nominations.put(data, data.id);
            }
            
            return data;
          }
          return undefined;
        }, undefined);
      }
      
      return nomination;
    } catch (error) {
      console.error('Error getting nomination by share link:', error);
      return undefined;
    }
  }
};

// Firebase Service for admin authentication
export const adminService = {
  async add(admin: Admin): Promise<string> {
    try {
      // Add to Dexie
      const id = await dexieDb.admins.add(admin);
      const adminWithId = { ...admin, id };
      
      // Try to add to Firestore
      await safeFirebaseOperation(async () => {
        const docRef = doc(firestoreDb, COLLECTIONS.ADMINS, id.toString());
        await setDoc(docRef, adminWithId);
      }, undefined);
      
      return id.toString();
    } catch (error) {
      console.error('Error adding admin:', error);
      throw error;
    }
  },
  
  async authenticate(username: string, password: string): Promise<Admin | null> {
    try {
      // Try Dexie first
      const admin = await dexieDb.admins.where({ username }).first();
      
      if (admin && admin.password === password) {
        return admin;
      }
      
      // If not found or password doesn't match, try Firebase
      return await safeFirebaseOperation(async () => {
        const q = query(
          collection(firestoreDb, COLLECTIONS.ADMINS), 
          where("username", "==", username)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as Admin;
          
          // Check password
          if (data.password === password) {
            // Save to Dexie
            if (data.id) {
              await dexieDb.admins.put(data, data.id);
            }
            
            return data;
          }
        }
        return null;
      }, null);
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return null;
    }
  }
};

// Firebase Service for OTP
export const otpService = {
  async storeOTP(studentNumber: string, email: string, otp: string): Promise<boolean> {
    try {
      // Only attempt this in production
      if (import.meta.env.DEV) {
        return true;
      }
      
      // Create OTP document with expiration (10 minutes from now)
      const otpData = {
        studentNumber,
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        createdAt: new Date()
      };
      
      // Store in Firestore
      const docRef = doc(firestoreDb, COLLECTIONS.OTP, `${studentNumber}_${email}`);
      await setDoc(docRef, otpData);
      
      return true;
    } catch (error) {
      console.error('Error storing OTP:', error);
      return false;
    }
  },
  
  async verifyOTP(studentNumber: string, email: string, otp: string): Promise<boolean> {
    try {
      // In development, don't verify with Firebase
      if (import.meta.env.DEV) {
        return true;
      }
      
      // Get the OTP document
      const docRef = doc(firestoreDb, COLLECTIONS.OTP, `${studentNumber}_${email}`);
      
      // First try to get directly by combined ID
      let otpDoc = await getDoc(docRef);
      
      // If not found, try query
      if (!otpDoc.exists()) {
        const q = query(
          collection(firestoreDb, COLLECTIONS.OTP),
          where("studentNumber", "==", studentNumber),
          where("email", "==", email)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return false; // No OTP found
        }
        
        otpDoc = querySnapshot.docs[0];
      }
      
      const otpData = otpDoc.data();
      
      // Check if OTP has expired
      const expiresAt = otpData.expiresAt.toDate ? 
        otpData.expiresAt.toDate() : new Date(otpData.expiresAt);
        
      if (new Date() > expiresAt) {
        // Delete expired OTP
        await deleteDoc(otpDoc.ref);
        return false;
      }
      
      // Check if OTP matches
      if (otpData.otp !== otp) {
        return false;
      }
      
      // OTP is valid, delete it to prevent reuse
      await deleteDoc(otpDoc.ref);
      
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }
};

// Export all services
export const firebaseService = {
  student: studentService,
  nomination: nominationService,
  admin: adminService,
  otp: otpService
};

export default firebaseService;
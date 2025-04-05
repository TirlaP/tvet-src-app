export interface Admin {
  id?: number;
  username: string;
  password: string; // In production, you should store a hashed password
  createdAt: Date;
}

export interface Student {
  id?: number;
  studentNumber: string;
  fullName: string;
  email: string;
  cellNumber: string;
  course: string;
  yearOfStudy: string;
  studentCardImage?: string; // Base64 encoded image
  selfieImage?: string; // Base64 encoded image
  signature?: string; // Base64 encoded signature
  dataConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Nomination {
  id?: number;
  nomineeId: number; // Reference to Student
  position: string;
  motivation: string;
  status: NominationStatus;
  qrCode?: string; // Generated QR code for supporters
  shareLink?: string; // Direct link for supporters
  createdAt: Date;
  updatedAt: Date;
}

export interface Supporter {
  id?: number;
  nominationId: number; // Reference to Nomination
  studentId: number; // Reference to Student
  type: SupporterType;
  createdAt: Date;
}

export interface AdminAudit {
  id?: number;
  adminId: string;
  action: AdminAction;
  entityType: EntityType;
  entityId: string | number;
  details: string;
  timestamp: Date;
}

export enum NominationStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SupporterType {
  PROPOSER = 'PROPOSER',
  SECONDER = 'SECONDER'
}

export enum AdminAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  INITIALIZE = 'INITIALIZE'
}

export enum EntityType {
  STUDENT = 'STUDENT',
  NOMINATION = 'NOMINATION', 
  SUPPORTER = 'SUPPORTER',
  ADMIN = 'ADMIN',
  DATABASE = 'DATABASE'
}

export interface FormState {
  step: number;
  data: Partial<Student & Nomination>;
  isSubmitting: boolean;
  isComplete: boolean;
  error?: string;
  nominationId?: number; // Store the nomination ID when created
}

export interface NominationWithDetails extends Nomination {
  nominee: Student;
  supporters: Array<{
    supporter: Student;
    type: SupporterType;
  }>;
}

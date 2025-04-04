import {
  Student,
  Nomination,
  Supporter,
  AdminAudit,
  NominationStatus,
  SupporterType,
  AdminAction,
  EntityType,
  NominationWithDetails
} from '../types/database';
import { db } from '../db/db';
import { generateUniqueId } from './utils';

// Student Services
export const studentService = {
  getByStudentNumber: async (studentNumber: string): Promise<Student | undefined> => {
    return await db.students.where({ studentNumber }).first();
  },

  getById: async (id: number): Promise<Student | undefined> => {
    return await db.students.get(id);
  },

  create: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const now = new Date();
    const studentData: Student = {
      ...student,
      createdAt: now,
      updatedAt: now
    };
    return await db.students.add(studentData);
  },

  update: async (id: number, student: Partial<Student>): Promise<number> => {
    const updatedStudent = {
      ...student,
      updatedAt: new Date()
    };
    await db.students.update(id, updatedStudent);
    return id;
  },

  findOrCreate: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const existingStudent = await studentService.getByStudentNumber(student.studentNumber);
    if (existingStudent) {
      return await studentService.update(existingStudent.id!, {
        ...student,
        updatedAt: new Date()
      });
    } else {
      return await studentService.create(student);
    }
  }
};

// Nomination Services
export const nominationService = {
  getById: async (id: number): Promise<Nomination | undefined> => {
    return await db.nominations.get(id);
  },

  getByNomineeId: async (nomineeId: number): Promise<Nomination | undefined> => {
    return await db.nominations.where({ nomineeId }).first();
  },

  create: async (nomination: Omit<Nomination, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const now = new Date();
    const shareLink = generateUniqueId();
    
    const nominationData: Nomination = {
      ...nomination,
      qrCode: shareLink,
      shareLink: shareLink,
      status: NominationStatus.DRAFT,
      createdAt: now,
      updatedAt: now
    };
    
    return await db.nominations.add(nominationData);
  },

  update: async (id: number, nomination: Partial<Nomination>): Promise<number> => {
    const updatedNomination = {
      ...nomination,
      updatedAt: new Date()
    };
    await db.nominations.update(id, updatedNomination);
    return id;
  },

  updateStatus: async (id: number, status: NominationStatus, adminId: string): Promise<number> => {
    await db.nominations.update(id, {
      status,
      updatedAt: new Date()
    });
    
    // Log action in audit
    await adminService.logAction({
      adminId,
      action: status === NominationStatus.APPROVED ? AdminAction.APPROVE : AdminAction.REJECT,
      entityType: EntityType.NOMINATION,
      entityId: id,
      details: `Nomination ${status.toLowerCase()}`,
      timestamp: new Date()
    });
    
    return id;
  },

  getAll: async (
    filters?: {
      status?: NominationStatus,
      position?: string,
      search?: string
    }
  ): Promise<NominationWithDetails[]> => {
    // First get all nominations
    let query = db.nominations.toCollection();
    
    // Apply status filter if provided
    if (filters?.status) {
      query = db.nominations.where('status').equals(filters.status);
    }
    
    const nominations = await query.toArray();
    
    // Get details for each nomination
    const nominationsWithDetails: NominationWithDetails[] = await Promise.all(
      nominations.map(async (nomination) => {
        const nominee = await studentService.getById(nomination.nomineeId);
        const supporters = await supporterService.getByNominationId(nomination.id!);
        
        // Get supporter details
        const supportersWithDetails = await Promise.all(
          supporters.map(async (supporter) => {
            const supporterDetails = await studentService.getById(supporter.studentId);
            return {
              supporter: supporterDetails!,
              type: supporter.type
            };
          })
        );
        
        return {
          ...nomination,
          nominee: nominee!,
          supporters: supportersWithDetails
        };
      })
    );
    
    // Apply position filter if provided
    let filteredNominations = nominationsWithDetails;
    if (filters?.position) {
      filteredNominations = filteredNominations.filter(
        (nomination) => nomination.position === filters.position
      );
    }
    
    // Apply search filter if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredNominations = filteredNominations.filter(
        (nomination) => 
          nomination.nominee.fullName.toLowerCase().includes(searchTerm) ||
          nomination.nominee.studentNumber.toLowerCase().includes(searchTerm) ||
          nomination.nominee.email.toLowerCase().includes(searchTerm)
      );
    }
    
    return filteredNominations;
  },

  getByShareLink: async (shareLink: string): Promise<Nomination | undefined> => {
    console.log('Looking up nomination by shareLink:', shareLink);
    
    // Make sure shareLink is exactly matched
    const nomination = await db.nominations.where('shareLink').equals(shareLink).first();
    
    console.log('Found nomination:', nomination);
    return nomination;
  }
};

// Supporter Services
export const supporterService = {
  getById: async (id: number): Promise<Supporter | undefined> => {
    return await db.supporters.get(id);
  },

  getByNominationId: async (nominationId: number): Promise<Supporter[]> => {
    return await db.supporters.where({ nominationId }).toArray();
  },

  create: async (supporter: Omit<Supporter, 'id' | 'createdAt'>): Promise<number> => {
    const supporterData: Supporter = {
      ...supporter,
      createdAt: new Date()
    };
    
    return await db.supporters.add(supporterData);
  },

  countByNominationId: async (nominationId: number): Promise<number> => {
    return await db.supporters.where({ nominationId }).count();
  },

  // Check if a student has already supported a nomination
  hasStudentSupported: async (nominationId: number, studentId: number): Promise<boolean> => {
    const supporter = await db.supporters
      .where({ nominationId, studentId })
      .first();
    
    return !!supporter;
  }
};

// Admin Audit Services
export const adminService = {
  logAction: async (auditEntry: Omit<AdminAudit, 'id'>): Promise<number> => {
    return await db.adminAudit.add(auditEntry);
  },

  getAuditLog: async (): Promise<AdminAudit[]> => {
    return await db.adminAudit
      .orderBy('timestamp')
      .reverse()
      .toArray();
  },

  exportNominations: async (
    adminId: string,
    format: 'PDF' | 'CSV'
  ): Promise<void> => {
    // Log the export action
    await adminService.logAction({
      adminId,
      action: AdminAction.EXPORT,
      entityType: EntityType.NOMINATION,
      entityId: 'all',
      details: `Exported nominations as ${format}`,
      timestamp: new Date()
    });
    
    // The actual export functionality would be implemented elsewhere
  }
};

// Nomination Process Service - combines multiple operations
export const nominationProcessService = {
  // Create a complete nomination including nominee and nomination data
  createNomination: async (
    nomineeData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
    nominationData: Pick<Nomination, 'position' | 'motivation'>
  ): Promise<{
    nomineeId: number;
    nominationId: number;
  }> => {
    // Create or update the nominee
    const nomineeId = await studentService.findOrCreate(nomineeData);
    
    // Create the nomination
    const nominationId = await nominationService.create({
      nomineeId,
      position: nominationData.position,
      motivation: nominationData.motivation,
      status: NominationStatus.DRAFT
    });
    
    return {
      nomineeId,
      nominationId
    };
  },

  // Add a supporter to a nomination
  addSupporter: async (
    nominationId: number,
    supporterData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
    type: SupporterType
  ): Promise<{
    supporterId: number;
    supporterStudentId: number;
  }> => {
    // Create or update the supporter student record
    const supporterStudentId = await studentService.findOrCreate(supporterData);
    
    // Check if this student has already supported this nomination
    const hasSupported = await supporterService.hasStudentSupported(nominationId, supporterStudentId);
    if (hasSupported) {
      throw new Error('This student has already supported this nomination');
    }
    
    // Add the supporter
    const supporterId = await supporterService.create({
      nominationId,
      studentId: supporterStudentId,
      type
    });
    
    // Check if we have all required supporters and update nomination status if needed
    const supporterCount = await supporterService.countByNominationId(nominationId);
    if (supporterCount >= 3) {
      await nominationService.update(nominationId, {
        status: NominationStatus.PENDING
      });
    }
    
    return {
      supporterId,
      supporterStudentId
    };
  },

  // Get complete nomination details including nominee and supporters
  getNominationDetails: async (nominationId: number): Promise<NominationWithDetails | null> => {
    const nomination = await nominationService.getById(nominationId);
    if (!nomination) return null;
    
    const nominee = await studentService.getById(nomination.nomineeId);
    if (!nominee) return null;
    
    const supporters = await supporterService.getByNominationId(nominationId);
    
    // Get supporter details
    const supportersWithDetails = await Promise.all(
      supporters.map(async (supporter) => {
        const supporterDetails = await studentService.getById(supporter.studentId);
        return {
          supporter: supporterDetails!,
          type: supporter.type
        };
      })
    );
    
    return {
      ...nomination,
      nominee,
      supporters: supportersWithDetails
    };
  }
};

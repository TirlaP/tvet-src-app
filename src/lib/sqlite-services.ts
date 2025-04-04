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
import { db, rowToStudent, rowToNomination, rowToSupporter, rowToAdminAudit } from '../db/sqlite/db';
import { generateUniqueId } from './utils';

// Student Services
export const studentService = {
  getByStudentNumber: async (studentNumber: string): Promise<Student | undefined> => {
    const stmt = db.prepare('SELECT * FROM students WHERE studentNumber = ?');
    const row = stmt.get(studentNumber);
    return row ? rowToStudent(row) : undefined;
  },

  getById: async (id: number): Promise<Student | undefined> => {
    const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToStudent(row) : undefined;
  },

  create: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO students (
        studentNumber, fullName, email, cellNumber, course, yearOfStudy, 
        studentCardImage, selfieImage, signature, dataConsent, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      student.studentNumber,
      student.fullName,
      student.email,
      student.cellNumber,
      student.course,
      student.yearOfStudy,
      student.studentCardImage || null,
      student.selfieImage || null,
      student.signature || null,
      student.dataConsent ? 1 : 0,
      now,
      now
    );
    
    return result.lastInsertRowid as number;
  },

  update: async (id: number, student: Partial<Student>): Promise<number> => {
    const now = new Date().toISOString();
    
    // Get current student data
    const currentStudent = await studentService.getById(id);
    if (!currentStudent) {
      throw new Error(`Student with ID ${id} not found`);
    }
    
    // Merge with updates
    const updatedStudent = {
      ...currentStudent,
      ...student,
      dataConsent: 'dataConsent' in student ? (student.dataConsent ? 1 : 0) : (currentStudent.dataConsent ? 1 : 0),
      updatedAt: now
    };
    
    const stmt = db.prepare(`
      UPDATE students SET
        studentNumber = ?,
        fullName = ?,
        email = ?,
        cellNumber = ?,
        course = ?,
        yearOfStudy = ?,
        studentCardImage = ?,
        selfieImage = ?,
        signature = ?,
        dataConsent = ?,
        updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedStudent.studentNumber,
      updatedStudent.fullName,
      updatedStudent.email,
      updatedStudent.cellNumber,
      updatedStudent.course,
      updatedStudent.yearOfStudy,
      updatedStudent.studentCardImage || null,
      updatedStudent.selfieImage || null,
      updatedStudent.signature || null,
      updatedStudent.dataConsent ? 1 : 0,
      updatedStudent.updatedAt.toISOString(),
      id
    );
    
    return id;
  },

  findOrCreate: async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const existingStudent = await studentService.getByStudentNumber(student.studentNumber);
    if (existingStudent) {
      return await studentService.update(existingStudent.id!, student);
    } else {
      return await studentService.create(student);
    }
  }
};

// Nomination Services
export const nominationService = {
  getById: async (id: number): Promise<Nomination | undefined> => {
    const stmt = db.prepare('SELECT * FROM nominations WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToNomination(row) : undefined;
  },

  getByNomineeId: async (nomineeId: number): Promise<Nomination | undefined> => {
    const stmt = db.prepare('SELECT * FROM nominations WHERE nomineeId = ?');
    const row = stmt.get(nomineeId);
    return row ? rowToNomination(row) : undefined;
  },

  create: async (nomination: Omit<Nomination, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const now = new Date().toISOString();
    const shareLink = generateUniqueId();
    
    const stmt = db.prepare(`
      INSERT INTO nominations (
        nomineeId, position, motivation, status, qrCode, shareLink, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      nomination.nomineeId,
      nomination.position,
      nomination.motivation,
      nomination.status,
      shareLink, // qrCode
      shareLink, // shareLink
      now,
      now
    );
    
    return result.lastInsertRowid as number;
  },

  update: async (id: number, nomination: Partial<Nomination>): Promise<number> => {
    const now = new Date().toISOString();
    
    // Get current nomination data
    const currentNomination = await nominationService.getById(id);
    if (!currentNomination) {
      throw new Error(`Nomination with ID ${id} not found`);
    }
    
    // Build SET clause dynamically based on provided fields
    const updates: string[] = [];
    const params: any[] = [];
    
    if ('nomineeId' in nomination) {
      updates.push('nomineeId = ?');
      params.push(nomination.nomineeId);
    }
    
    if ('position' in nomination) {
      updates.push('position = ?');
      params.push(nomination.position);
    }
    
    if ('motivation' in nomination) {
      updates.push('motivation = ?');
      params.push(nomination.motivation);
    }
    
    if ('status' in nomination) {
      updates.push('status = ?');
      params.push(nomination.status);
    }
    
    if ('qrCode' in nomination) {
      updates.push('qrCode = ?');
      params.push(nomination.qrCode);
    }
    
    if ('shareLink' in nomination) {
      updates.push('shareLink = ?');
      params.push(nomination.shareLink);
    }
    
    updates.push('updatedAt = ?');
    params.push(now);
    
    // Add ID as the last parameter
    params.push(id);
    
    const stmt = db.prepare(`
      UPDATE nominations SET ${updates.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...params);
    
    return id;
  },

  updateStatus: async (id: number, status: NominationStatus, adminId: string): Promise<number> => {
    await nominationService.update(id, { status });
    
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
    let query = 'SELECT * FROM nominations';
    const params: any[] = [];
    
    // Apply status filter if provided
    if (filters?.status) {
      query += ' WHERE status = ?';
      params.push(filters.status);
    }
    
    const stmt = db.prepare(query);
    let nominations: Nomination[];
    
    if (params.length > 0) {
      nominations = stmt.all(...params).map(rowToNomination);
    } else {
      nominations = stmt.all().map(rowToNomination);
    }
    
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
    const stmt = db.prepare('SELECT * FROM nominations WHERE shareLink = ?');
    const row = stmt.get(shareLink);
    return row ? rowToNomination(row) : undefined;
  }
};

// Supporter Services
export const supporterService = {
  getById: async (id: number): Promise<Supporter | undefined> => {
    const stmt = db.prepare('SELECT * FROM supporters WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToSupporter(row) : undefined;
  },

  getByNominationId: async (nominationId: number): Promise<Supporter[]> => {
    const stmt = db.prepare('SELECT * FROM supporters WHERE nominationId = ?');
    const rows = stmt.all(nominationId);
    return rows.map(rowToSupporter);
  },

  create: async (supporter: Omit<Supporter, 'id' | 'createdAt'>): Promise<number> => {
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO supporters (
        nominationId, studentId, type, createdAt
      ) VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      supporter.nominationId,
      supporter.studentId,
      supporter.type,
      now
    );
    
    return result.lastInsertRowid as number;
  },

  countByNominationId: async (nominationId: number): Promise<number> => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM supporters WHERE nominationId = ?');
    const result = stmt.get(nominationId);
    return result ? result.count : 0;
  },

  // Check if a student has already supported a nomination
  hasStudentSupported: async (nominationId: number, studentId: number): Promise<boolean> => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM supporters WHERE nominationId = ? AND studentId = ?');
    const result = stmt.get(nominationId, studentId);
    return result ? result.count > 0 : false;
  }
};

// Admin Audit Services
export const adminService = {
  logAction: async (auditEntry: Omit<AdminAudit, 'id'>): Promise<number> => {
    const stmt = db.prepare(`
      INSERT INTO adminAudit (
        adminId, action, entityType, entityId, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      auditEntry.adminId,
      auditEntry.action,
      auditEntry.entityType,
      auditEntry.entityId,
      auditEntry.details,
      auditEntry.timestamp.toISOString()
    );
    
    return result.lastInsertRowid as number;
  },

  getAuditLog: async (): Promise<AdminAudit[]> => {
    const stmt = db.prepare('SELECT * FROM adminAudit ORDER BY timestamp DESC');
    const rows = stmt.all();
    return rows.map(rowToAdminAudit);
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
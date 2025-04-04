import Dexie, { Table } from 'dexie';
import { Student, Nomination, Supporter, AdminAudit, Admin } from '../types/database';

class SrcNominationDB extends Dexie {
  students!: Table<Student>;
  nominations!: Table<Nomination>;
  supporters!: Table<Supporter>;
  adminAudit!: Table<AdminAudit>;
  admins!: Table<Admin>; // New table for admin users

  constructor() {
    super('SrcNominationDB');
    
    // Update the version to include the new admins table (version 3)
    this.version(3).stores({
      students: '++id, studentNumber, email, [studentNumber+email]',
      nominations: '++id, nomineeId, position, status, *shareLink, qrCode, createdAt, updatedAt',
      supporters: '++id, nominationId, studentId, type, createdAt',
      adminAudit: '++id, adminId, action, entityType, entityId, details, timestamp',
      admins: '++id, username, password, createdAt'
    });
  }
}

export const db = new SrcNominationDB();

// Log database events
db.on('ready', () => {
  console.log(`Database opened successfully. Version: ${db.verno}`);
});

db.on('populate', () => {
  console.log('Database is being populated from scratch');
});

db.on('blocked', () => {
  console.warn('Database blocked - another instance may be upgrading the database');
});

db.on('versionchange', function(event) {
  console.log(`Database version changed from ${event.oldVersion} to ${event.newVersion}`);
  db.close();
  alert("Database schema has been updated. Please refresh this page.");
  window.location.reload();
});

// Remove the DEV check so that the test data always seeds when the DB is empty
db.on('ready', async () => {
  // Check if we need to initialize the database
  const adminAuditCount = await db.adminAudit.count();
  const adminCount = await db.admins.count();

  if (adminAuditCount === 0) {
    try {
      console.log('Initializing database with test data...');

      // Seed the admin user if none exists
      if (adminCount === 0) {
        await db.admins.add({
          username: 'admin',
          password: 'admin', // For production, use a hashed password
          createdAt: new Date()
        });
        console.log('Test admin seeded with username: "admin" and password: "admin"');
      }

      // Log the initialization action in adminAudit
      await db.adminAudit.add({
        adminId: 'system',
        action: 'INITIALIZE',
        entityType: 'DATABASE',
        entityId: 'system',
        details: 'Initial database setup',
        timestamp: new Date()
      });

      // Create a test student
      const testStudentId = await db.students.add({
        studentNumber: 'ST12345',
        fullName: 'Test Student',
        email: 'petru.tirla@gmail.com',
        cellNumber: '0781234567',
        course: 'Computer Science',
        yearOfStudy: '2',
        dataConsent: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create test nominations with example share links
      await db.nominations.add({
        nomineeId: testStudentId,
        position: 'President',
        motivation: 'I want to make a difference',
        status: 'DRAFT',
        shareLink: 'm936l2a0eoprts651t',
        qrCode: 'm936l2a0eoprts651t',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await db.nominations.add({
        nomineeId: testStudentId,
        position: 'Secretary',
        motivation: 'I am organized and efficient',
        status: 'DRAFT',
        shareLink: 'test-share-link-2',
        qrCode: 'test-qr-code-2',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Database initialized with test data.');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
});

export default db;

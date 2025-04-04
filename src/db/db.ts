import Dexie, { Table } from 'dexie';
import { Student, Nomination, Supporter, AdminAudit } from '../types/database';

// Check if schema version needs to be upgraded, but don't delete existing data
// We'll use Dexie's built-in versioning system instead of deleting the database

class SrcNominationDB extends Dexie {
  students!: Table<Student>;
  nominations!: Table<Nomination>;
  supporters!: Table<Supporter>;
  adminAudit!: Table<AdminAudit>;

  constructor() {
    super('SrcNominationDB');
    
    // Define schema with proper indexes
    this.version(2).stores({
      students: '++id, studentNumber, email, [studentNumber+email]',
      nominations: '++id, nomineeId, position, status, *shareLink, qrCode, createdAt, updatedAt',
      supporters: '++id, nominationId, studentId, type, createdAt',
      adminAudit: '++id, adminId, action, entityType, entityId, details, timestamp'
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

// Initialize with some example data in development mode
if (import.meta.env.DEV) {
  db.on('ready', async () => {
    // Check if we need to initialize the database
    const adminCount = await db.adminAudit.count();
    
    if (adminCount === 0) {
      try {
        // Initialize with test data
        console.log('Initializing database with test data...');
        
        // Example admin action to mark initialization
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
          email: 'test@example.com',
          cellNumber: '0781234567',
          course: 'Computer Science',
          yearOfStudy: '2',
          dataConsent: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Create test nominations with specific shareLinks for testing
        await db.nominations.add({
          nomineeId: testStudentId,
          position: 'President',
          motivation: 'I want to make a difference',
          status: 'DRAFT',
          shareLink: 'm936l2a0eoprts651t', // Match URL in your browser
          qrCode: 'm936l2a0eoprts651t',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Create additional test nominations
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
}

export default db;

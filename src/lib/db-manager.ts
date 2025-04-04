import { 
  studentService as dexieStudentService,
  nominationService as dexieNominationService, 
  supporterService as dexieSupporterService,
  adminService as dexieAdminService,
  nominationProcessService as dexieNominationProcessService
} from './services';

import {
  studentService as sqliteStudentService,
  nominationService as sqliteNominationService,
  supporterService as sqliteSupporterService,
  adminService as sqliteAdminService,
  nominationProcessService as sqliteNominationProcessService
} from './sqlite-services';

import { DB_CONFIG } from '../config';

// Get database engine from configuration
const DB_ENGINE = DB_CONFIG.ENGINE;

export const studentService = DB_ENGINE === 'dexie' ? dexieStudentService : sqliteStudentService;
export const nominationService = DB_ENGINE === 'dexie' ? dexieNominationService : sqliteNominationService;
export const supporterService = DB_ENGINE === 'dexie' ? dexieSupporterService : sqliteSupporterService;
export const adminService = DB_ENGINE === 'dexie' ? dexieAdminService : sqliteAdminService;
export const nominationProcessService = DB_ENGINE === 'dexie' ? dexieNominationProcessService : sqliteNominationProcessService;

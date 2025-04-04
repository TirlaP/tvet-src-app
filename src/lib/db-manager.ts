import { 
  studentService as dexieStudentService,
  nominationService as dexieNominationService, 
  supporterService as dexieSupporterService,
  adminService as dexieAdminService,
  nominationProcessService as dexieNominationProcessService
} from './services';

import { DB_CONFIG } from '../config';

// Get database engine from configuration
const DB_ENGINE = DB_CONFIG.ENGINE;

export const studentService = dexieStudentService
export const nominationService = dexieNominationService
export const supporterService = dexieSupporterService
export const adminService = dexieAdminService
export const nominationProcessService = dexieNominationProcessService

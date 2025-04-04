import React from 'react';
import { DB_CONFIG } from '../config';
import { AuthProvider as DexieAuthProvider, useAuth as useDexieAuth } from './AuthContext';
import { AuthProvider as SqliteAuthProvider, useAuth as useSqliteAuth } from './SqliteAuthContext';

// Export the appropriate AuthProvider based on the database engine
export const AuthProvider: React.FC<{ children: React.ReactNode }> = 
  DB_CONFIG.ENGINE === 'dexie' ? DexieAuthProvider : SqliteAuthProvider;

// Conditionally export the appropriate useAuth hook
export const useAuth = DB_CONFIG.ENGINE === 'dexie' ? useDexieAuth : useSqliteAuth;

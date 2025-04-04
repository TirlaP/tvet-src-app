import React from 'react';
import { AuthProvider as DexieAuthProvider, useAuth as useDexieAuth } from './AuthContext';

// Export the Dexie AuthProvider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = DexieAuthProvider;

// Export the Dexie useAuth hook
export const useAuth = useDexieAuth;

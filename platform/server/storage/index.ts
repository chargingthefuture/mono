/**
 * Main storage index - aggregates all storage modules
 * 
 * This file serves as the central export point for all storage operations.
 * It composes modules from core/ and mini-apps/ directories.
 */

// Export the composed storage class and interface
export { DatabaseStorage, storage } from './composed-storage';
export type { IStorage } from './types/index';

// Re-export individual modules for direct access if needed
export { CoreStorage } from './core';
export * from './mini-apps';


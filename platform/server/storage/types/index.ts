/**
 * Storage Interface Types - Main Entry Point
 * 
 * This file composes all domain-specific storage interfaces into a single IStorage interface.
 * This maintains backward compatibility while allowing for modular code organization.
 */

// Import interfaces for use in extends clause
import type { ICoreStorage } from './core-storage.interface';
import type { ISupportMatchStorage } from './supportmatch-storage.interface';
import type { ILighthouseStorage } from './lighthouse-storage.interface';
import type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
import type { ISocketRelayStorage } from './socketrelay-storage.interface';
import type { IDirectoryStorage } from './directory-storage.interface';
import type { ISkillsStorage } from './skills-storage.interface';
import type { IProfileDeletionStorage } from './profile-deletion-storage.interface';

// Re-export for external use
export type { ICoreStorage } from './core-storage.interface';
export type { ISupportMatchStorage } from './supportmatch-storage.interface';
export type { ILighthouseStorage } from './lighthouse-storage.interface';
export type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
export type { ISocketRelayStorage } from './socketrelay-storage.interface';
export type { IDirectoryStorage } from './directory-storage.interface';
export type { ISkillsStorage } from './skills-storage.interface';
export type { IProfileDeletionStorage } from './profile-deletion-storage.interface';

// Re-export the complete IStorage interface from the parent types.ts file
// This ensures the full interface with all methods is available when importing from './types'
export type { IStorage } from '../types';


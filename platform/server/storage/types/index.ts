/**
 * Storage Interface Types - Main Entry Point
 * 
 * This file composes all domain-specific storage interfaces into a single IStorage interface.
 * This maintains backward compatibility while allowing for modular code organization.
 */

// Core storage interface
export type { ICoreStorage } from './core-storage.interface';

// Mini-app storage interfaces
export type { ISupportMatchStorage } from './supportmatch-storage.interface';
export type { ILighthouseStorage } from './lighthouse-storage.interface';
export type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
export type { ISocketRelayStorage } from './socketrelay-storage.interface';
export type { IDirectoryStorage } from './directory-storage.interface';
export type { ISkillsStorage } from './skills-storage.interface';
export type { IProfileDeletionStorage } from './profile-deletion-storage.interface';

// Compose all interfaces into IStorage
// This maintains backward compatibility with existing code
export interface IStorage 
  extends ICoreStorage,
          ISupportMatchStorage,
          ILighthouseStorage,
          IMechanicMatchStorage,
          ISocketRelayStorage,
          IDirectoryStorage,
          ISkillsStorage,
          IProfileDeletionStorage {
  // Additional methods that don't fit into domain-specific interfaces
  // These will be added as we continue refactoring
  
  // Note: The full IStorage interface with all methods is still defined in types.ts
  // for backward compatibility. This composition approach allows gradual migration.
}


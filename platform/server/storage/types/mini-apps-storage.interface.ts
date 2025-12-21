/**
 * Mini-Apps Storage Interfaces
 * 
 * Composes all mini-app storage interfaces into a single interface.
 */

import type { ISupportMatchStorage } from './supportmatch-storage.interface';
import type { ILighthouseStorage } from './lighthouse-storage.interface';
import type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
import type { ISocketRelayStorage } from './socketrelay-storage.interface';
import type { IDirectoryStorage } from './directory-storage.interface';
import type { ISkillsStorage } from './skills-storage.interface';
import type { IResearchStorage } from './research-storage.interface';
import type { ILostMailStorage } from './lostmail-storage.interface';
import type { ITrustTransportStorage } from './trusttransport-storage.interface';
import type { IChatGroupsStorage } from './chatgroups-storage.interface';
import type { IGentlePulseStorage } from './gentlepulse-storage.interface';
import type { IChymeStorage } from './chyme-storage.interface';
import type { IWorkforceRecruiterStorage } from './workforce-recruiter-storage.interface';
import type { IBlogStorage } from './blog-storage.interface';
import type { IDefaultAliveOrDeadStorage } from './default-alive-or-dead-storage.interface';

/**
 * Composed interface for all mini-app storage operations
 */
export interface IMiniAppsStorage
  extends ISupportMatchStorage,
          ILighthouseStorage,
          IMechanicMatchStorage,
          ISocketRelayStorage,
          IDirectoryStorage,
          ISkillsStorage,
          IResearchStorage,
          ILostMailStorage,
          ITrustTransportStorage,
          IChatGroupsStorage,
          IGentlePulseStorage,
          IChymeStorage,
          IWorkforceRecruiterStorage,
          IBlogStorage,
          IDefaultAliveOrDeadStorage {}

// Re-export individual interfaces for convenience
export type { ISupportMatchStorage } from './supportmatch-storage.interface';
export type { ILighthouseStorage } from './lighthouse-storage.interface';
export type { IMechanicMatchStorage } from './mechanicmatch-storage.interface';
export type { ISocketRelayStorage } from './socketrelay-storage.interface';
export type { IDirectoryStorage } from './directory-storage.interface';
export type { ISkillsStorage } from './skills-storage.interface';
export type { IResearchStorage } from './research-storage.interface';
export type { ILostMailStorage } from './lostmail-storage.interface';
export type { ITrustTransportStorage } from './trusttransport-storage.interface';
export type { IChatGroupsStorage } from './chatgroups-storage.interface';
export type { IGentlePulseStorage } from './gentlepulse-storage.interface';
export type { IChymeStorage } from './chyme-storage.interface';
export type { IWorkforceRecruiterStorage } from './workforce-recruiter-storage.interface';
export type { IBlogStorage } from './blog-storage.interface';
export type { IDefaultAliveOrDeadStorage } from './default-alive-or-dead-storage.interface';
export type { IProfileDeletionStorage } from './profile-deletion-storage.interface';


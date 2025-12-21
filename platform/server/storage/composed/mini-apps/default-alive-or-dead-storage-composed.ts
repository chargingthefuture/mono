/**
 * Default Alive Or Dead Storage Composed
 * 
 * Handles delegation of Default Alive Or Dead storage operations.
 */

import type { IDefaultAliveOrDeadStorage } from '../../types/default-alive-or-dead-storage.interface';
import { DefaultAliveOrDeadStorage } from '../../mini-apps';

export class DefaultAliveOrDeadStorageComposed implements IDefaultAliveOrDeadStorage {
  private defaultAliveOrDeadStorage: DefaultAliveOrDeadStorage;

  constructor() {
    this.defaultAliveOrDeadStorage = new DefaultAliveOrDeadStorage();
  }

  // Financial entry operations
  async createDefaultAliveOrDeadFinancialEntry(entry: any, userId: string) {
    return this.defaultAliveOrDeadStorage.createDefaultAliveOrDeadFinancialEntry(entry, userId);
  }

  async getDefaultAliveOrDeadFinancialEntry(id: string) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadFinancialEntry(id);
  }

  async getDefaultAliveOrDeadFinancialEntries(filters?: any) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadFinancialEntries(filters);
  }

  async updateDefaultAliveOrDeadFinancialEntry(id: string, entry: any) {
    return this.defaultAliveOrDeadStorage.updateDefaultAliveOrDeadFinancialEntry(id, entry);
  }

  async deleteDefaultAliveOrDeadFinancialEntry(id: string) {
    return this.defaultAliveOrDeadStorage.deleteDefaultAliveOrDeadFinancialEntry(id);
  }

  async getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate: Date) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadFinancialEntryByWeek(weekStartDate);
  }

  // EBITDA snapshot operations
  async calculateAndStoreEbitdaSnapshot(weekStartDate: Date, currentFunding?: number) {
    return this.defaultAliveOrDeadStorage.calculateAndStoreEbitdaSnapshot(weekStartDate, currentFunding);
  }

  async getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate: Date) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadEbitdaSnapshot(weekStartDate);
  }

  async getDefaultAliveOrDeadEbitdaSnapshots(filters?: any) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadEbitdaSnapshots(filters);
  }

  // Status and trends operations
  async getDefaultAliveOrDeadCurrentStatus() {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadCurrentStatus();
  }

  async getDefaultAliveOrDeadWeeklyTrends(weeks?: number) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadWeeklyTrends(weeks);
  }

  async getDefaultAliveOrDeadWeekComparison(weekStart: Date) {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadWeekComparison(weekStart);
  }

  // Funding operations
  async getDefaultAliveOrDeadCurrentFunding() {
    return this.defaultAliveOrDeadStorage.getDefaultAliveOrDeadCurrentFunding();
  }

  async updateDefaultAliveOrDeadCurrentFunding(amount: number) {
    return this.defaultAliveOrDeadStorage.updateDefaultAliveOrDeadCurrentFunding(amount);
  }
}


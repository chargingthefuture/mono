/**
 * Skills Storage Composed
 * 
 * Handles delegation of Skills storage operations (shared across mini-apps).
 */

import type { ISkillsStorage } from '../../types/skills-storage.interface';
import { SkillsStorage } from '../../mini-apps';

export class SkillsStorageComposed implements ISkillsStorage {
  private skillsStorage: SkillsStorage;

  constructor() {
    this.skillsStorage = new SkillsStorage();
  }

  // Sector operations
  async getAllSkillsSectors() {
    return this.skillsStorage.getAllSkillsSectors();
  }

  async getSkillsSectorById(id: string) {
    return this.skillsStorage.getSkillsSectorById(id);
  }

  async createSkillsSector(sector: any) {
    return this.skillsStorage.createSkillsSector(sector);
  }

  async updateSkillsSector(id: string, sector: any) {
    return this.skillsStorage.updateSkillsSector(id, sector);
  }

  async deleteSkillsSector(id: string) {
    return this.skillsStorage.deleteSkillsSector(id);
  }

  // Job title operations
  async getAllSkillsJobTitles(sectorId?: string) {
    return this.skillsStorage.getAllSkillsJobTitles(sectorId);
  }

  async getSkillsJobTitleById(id: string) {
    return this.skillsStorage.getSkillsJobTitleById(id);
  }

  async createSkillsJobTitle(jobTitle: any) {
    return this.skillsStorage.createSkillsJobTitle(jobTitle);
  }

  async updateSkillsJobTitle(id: string, jobTitle: any) {
    return this.skillsStorage.updateSkillsJobTitle(id, jobTitle);
  }

  async deleteSkillsJobTitle(id: string) {
    return this.skillsStorage.deleteSkillsJobTitle(id);
  }

  // Skill operations
  async getAllSkillsSkills(jobTitleId?: string) {
    return this.skillsStorage.getAllSkillsSkills(jobTitleId);
  }

  async getSkillsSkillById(id: string) {
    return this.skillsStorage.getSkillsSkillById(id);
  }

  async createSkillsSkill(skill: any) {
    return this.skillsStorage.createSkillsSkill(skill);
  }

  async updateSkillsSkill(id: string, skill: any) {
    return this.skillsStorage.updateSkillsSkill(id, skill);
  }

  async deleteSkillsSkill(id: string) {
    return this.skillsStorage.deleteSkillsSkill(id);
  }

  // Hierarchy operations
  async getSkillsHierarchy() {
    return this.skillsStorage.getSkillsHierarchy();
  }

  async getAllSkillsFlattened() {
    return this.skillsStorage.getAllSkillsFlattened();
  }
}


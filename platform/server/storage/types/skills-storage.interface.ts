/**
 * Skills Storage Interface
 * 
 * Defines shared Skills database operations (Sector → Job Title → Skills).
 */

import type {
  SkillsSector,
  InsertSkillsSector,
  SkillsJobTitle,
  InsertSkillsJobTitle,
  SkillsSkill,
  InsertSkillsSkill,
} from "@shared/schema";

export interface ISkillsStorage {
  // Sectors
  getAllSkillsSectors(): Promise<SkillsSector[]>;
  getSkillsSectorById(id: string): Promise<SkillsSector | undefined>;
  createSkillsSector(sector: InsertSkillsSector): Promise<SkillsSector>;
  updateSkillsSector(id: string, sector: Partial<InsertSkillsSector>): Promise<SkillsSector>;
  deleteSkillsSector(id: string): Promise<void>;
  
  // Job Titles
  getAllSkillsJobTitles(sectorId?: string): Promise<SkillsJobTitle[]>;
  getSkillsJobTitleById(id: string): Promise<SkillsJobTitle | undefined>;
  createSkillsJobTitle(jobTitle: InsertSkillsJobTitle): Promise<SkillsJobTitle>;
  updateSkillsJobTitle(id: string, jobTitle: Partial<InsertSkillsJobTitle>): Promise<SkillsJobTitle>;
  deleteSkillsJobTitle(id: string): Promise<void>;
  
  // Skills
  getAllSkillsSkills(jobTitleId?: string): Promise<SkillsSkill[]>;
  getSkillsSkillById(id: string): Promise<SkillsSkill | undefined>;
  createSkillsSkill(skill: InsertSkillsSkill): Promise<SkillsSkill>;
  updateSkillsSkill(id: string, skill: Partial<InsertSkillsSkill>): Promise<SkillsSkill>;
  deleteSkillsSkill(id: string): Promise<void>;
  
  // Convenience methods
  getSkillsHierarchy(): Promise<Array<{
    sector: SkillsSector;
    jobTitles: Array<{
      jobTitle: SkillsJobTitle;
      skills: SkillsSkill[];
    }>;
  }>>;
  
  getAllSkillsFlattened(): Promise<Array<{ id: string; name: string; sector: string; jobTitle: string }>>;
}

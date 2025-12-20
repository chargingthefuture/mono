/**
 * Skills Storage Module
 * 
 * Handles shared Skills Database operations (Sector → Job Title → Skills hierarchy).
 * This is a shared module used by multiple mini-apps (Directory, Workforce Recruiter, etc.)
 */

import {
  skillsSectors,
  skillsJobTitles,
  skillsSkills,
  type SkillsSector,
  type InsertSkillsSector,
  type SkillsJobTitle,
  type InsertSkillsJobTitle,
  type SkillsSkill,
  type InsertSkillsSkill,
} from "@shared/schema";
import { db } from "../db";
import { eq, asc } from "drizzle-orm";

export class SkillsStorage {
  // ========================================
  // SKILLS SECTOR OPERATIONS
  // ========================================

  async getAllSkillsSectors(): Promise<SkillsSector[]> {
    return await db
      .select()
      .from(skillsSectors)
      .orderBy(asc(skillsSectors.displayOrder), asc(skillsSectors.name));
  }

  async getSkillsSectorById(id: string): Promise<SkillsSector | undefined> {
    const [sector] = await db
      .select()
      .from(skillsSectors)
      .where(eq(skillsSectors.id, id))
      .limit(1);
    return sector;
  }

  async createSkillsSector(sectorData: InsertSkillsSector): Promise<SkillsSector> {
    const [sector] = await db
      .insert(skillsSectors)
      .values(sectorData)
      .returning();
    return sector;
  }

  async updateSkillsSector(id: string, sectorData: Partial<InsertSkillsSector>): Promise<SkillsSector> {
    const [sector] = await db
      .update(skillsSectors)
      .set({ ...sectorData, updatedAt: new Date() })
      .where(eq(skillsSectors.id, id))
      .returning();
    return sector;
  }

  async deleteSkillsSector(id: string): Promise<void> {
    await db
      .delete(skillsSectors)
      .where(eq(skillsSectors.id, id));
  }

  // ========================================
  // SKILLS JOB TITLE OPERATIONS
  // ========================================

  async getAllSkillsJobTitles(sectorId?: string): Promise<SkillsJobTitle[]> {
    if (sectorId) {
      return await db
        .select()
        .from(skillsJobTitles)
        .where(eq(skillsJobTitles.sectorId, sectorId))
        .orderBy(asc(skillsJobTitles.displayOrder), asc(skillsJobTitles.name));
    }
    return await db
      .select()
      .from(skillsJobTitles)
      .orderBy(asc(skillsJobTitles.displayOrder), asc(skillsJobTitles.name));
  }

  async getSkillsJobTitleById(id: string): Promise<SkillsJobTitle | undefined> {
    const [jobTitle] = await db
      .select()
      .from(skillsJobTitles)
      .where(eq(skillsJobTitles.id, id))
      .limit(1);
    return jobTitle;
  }

  async createSkillsJobTitle(jobTitleData: InsertSkillsJobTitle): Promise<SkillsJobTitle> {
    const [jobTitle] = await db
      .insert(skillsJobTitles)
      .values(jobTitleData)
      .returning();
    return jobTitle;
  }

  async updateSkillsJobTitle(id: string, jobTitleData: Partial<InsertSkillsJobTitle>): Promise<SkillsJobTitle> {
    const [jobTitle] = await db
      .update(skillsJobTitles)
      .set({ ...jobTitleData, updatedAt: new Date() })
      .where(eq(skillsJobTitles.id, id))
      .returning();
    return jobTitle;
  }

  async deleteSkillsJobTitle(id: string): Promise<void> {
    await db
      .delete(skillsJobTitles)
      .where(eq(skillsJobTitles.id, id));
  }

  // ========================================
  // SKILLS SKILL OPERATIONS
  // ========================================

  async getAllSkillsSkills(jobTitleId?: string): Promise<SkillsSkill[]> {
    if (jobTitleId) {
      return await db
        .select()
        .from(skillsSkills)
        .where(eq(skillsSkills.jobTitleId, jobTitleId))
        .orderBy(asc(skillsSkills.displayOrder), asc(skillsSkills.name));
    }
    return await db
      .select()
      .from(skillsSkills)
      .orderBy(asc(skillsSkills.displayOrder), asc(skillsSkills.name));
  }

  async getSkillsSkillById(id: string): Promise<SkillsSkill | undefined> {
    const [skill] = await db
      .select()
      .from(skillsSkills)
      .where(eq(skillsSkills.id, id))
      .limit(1);
    return skill;
  }

  async createSkillsSkill(skillData: InsertSkillsSkill): Promise<SkillsSkill> {
    const [skill] = await db
      .insert(skillsSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async updateSkillsSkill(id: string, skillData: Partial<InsertSkillsSkill>): Promise<SkillsSkill> {
    const [skill] = await db
      .update(skillsSkills)
      .set({ ...skillData, updatedAt: new Date() })
      .where(eq(skillsSkills.id, id))
      .returning();
    return skill;
  }

  async deleteSkillsSkill(id: string): Promise<void> {
    await db
      .delete(skillsSkills)
      .where(eq(skillsSkills.id, id));
  }

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  /**
   * Gets the full skills hierarchy: Sectors → Job Titles → Skills
   */
  async getSkillsHierarchy(): Promise<Array<{
    sector: SkillsSector;
    jobTitles: Array<{
      jobTitle: SkillsJobTitle;
      skills: SkillsSkill[];
    }>;
  }>> {
    const sectors = await this.getAllSkillsSectors();
    const jobTitles = await this.getAllSkillsJobTitles();
    const skills = await this.getAllSkillsSkills();

    return sectors.map(sector => ({
      sector,
      jobTitles: jobTitles
        .filter(jt => jt.sectorId === sector.id)
        .map(jobTitle => ({
          jobTitle,
          skills: skills.filter(s => s.jobTitleId === jobTitle.id),
        })),
    }));
  }

  /**
   * Gets a flattened list of all skills with their sector and job title names.
   * Useful for Directory app compatibility.
   */
  async getAllSkillsFlattened(): Promise<Array<{ id: string; name: string; sector: string; jobTitle: string }>> {
    const sectors = await this.getAllSkillsSectors();
    const jobTitles = await this.getAllSkillsJobTitles();
    const skills = await this.getAllSkillsSkills();

    return skills.map(skill => {
      const jobTitle = jobTitles.find(jt => jt.id === skill.jobTitleId);
      const sector = jobTitle ? sectors.find(s => s.id === jobTitle.sectorId) : null;
      return {
        id: skill.id,
        name: skill.name,
        sector: sector?.name || 'Unknown',
        jobTitle: jobTitle?.name || 'Unknown',
      };
    });
  }
}


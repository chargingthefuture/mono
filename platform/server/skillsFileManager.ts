import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SKILLS_FILE_PATH = join(process.cwd(), 'client', 'src', 'lib', 'skills.ts');

export interface Skill {
  name: string;
}

/**
 * Read skills from the skills.ts file
 */
export function readSkillsFromFile(): string[] {
  try {
    const fileContent = readFileSync(SKILLS_FILE_PATH, 'utf-8');
    
    // Extract the array content using regex
    // Matches: export const ALL_SKILLS = [ ... ];
    const arrayMatch = fileContent.match(/export const ALL_SKILLS = \[([\s\S]*?)\];/);
    
    if (!arrayMatch) {
      throw new Error('Could not find ALL_SKILLS array in skills.ts');
    }
    
    const arrayContent = arrayMatch[1];
    
    // Extract quoted strings from the array
    // Matches: "Skill Name" or 'Skill Name'
    const skillMatches = arrayContent.matchAll(/"([^"]+)"/g);
    const skills: string[] = [];
    
    for (const match of skillMatches) {
      // Trim each skill name to remove any whitespace
      const skillName = match[1].trim();
      if (skillName) {
        skills.push(skillName);
      }
    }
    
    return skills.sort(); // Return sorted for consistency
  } catch (error) {
    console.error('Error reading skills from file:', error);
    throw new Error(`Failed to read skills file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Write skills to the skills.ts file
 */
export function writeSkillsToFile(skills: string[]): void {
  try {
    // Validate skills
    if (!Array.isArray(skills)) {
      throw new Error('Skills must be an array');
    }
    
    if (skills.length === 0) {
      throw new Error('Skills array cannot be empty');
    }
    
    // Validate each skill
    for (const skill of skills) {
      if (typeof skill !== 'string' || skill.trim().length === 0) {
        throw new Error('All skills must be non-empty strings');
      }
      if (skill.includes('"') || skill.includes('\n')) {
        throw new Error(`Invalid skill name: "${skill}" - cannot contain quotes or newlines`);
      }
    }
    
    // Remove duplicates and sort
    const uniqueSkills = [...new Set(skills.map(s => s.trim()))].sort();
    
    // Generate the file content
    const skillsList = uniqueSkills
      .map(skill => `  "${skill}"`)
      .join(',\n');
    
    const fileContent = `export const ALL_SKILLS = [\n${skillsList},\n];\n`;
    
    // Write to file
    writeFileSync(SKILLS_FILE_PATH, fileContent, 'utf-8');
  } catch (error) {
    console.error('Error writing skills to file:', error);
    throw new Error(`Failed to write skills file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add a skill to the skills.ts file
 */
export function addSkillToFile(skillName: string): void {
  const skills = readSkillsFromFile();
  
  // Check if skill already exists (case-insensitive)
  const skillLower = skillName.trim().toLowerCase();
  if (skills.some(s => s.toLowerCase() === skillLower)) {
    throw new Error(`Skill "${skillName}" already exists`);
  }
  
  skills.push(skillName.trim());
  writeSkillsToFile(skills);
}

/**
 * Remove a skill from the skills.ts file
 */
export function removeSkillFromFile(skillName: string): void {
  const skills = readSkillsFromFile();
  
  // Find and remove the skill (case-insensitive match)
  const skillLower = skillName.trim().toLowerCase();
  const index = skills.findIndex(s => s.toLowerCase() === skillLower);
  
  if (index === -1) {
    throw new Error(`Skill "${skillName}" not found`);
  }
  
  skills.splice(index, 1);
  writeSkillsToFile(skills);
}

/**
 * Get skills as DirectorySkill format (for API compatibility)
 */
export function getSkillsAsDirectorySkills(): Array<{ name: string }> {
  const skills = readSkillsFromFile();
  return skills.map(name => ({ name }));
}


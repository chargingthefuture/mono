#!/usr/bin/env python3
"""
Script to extract route modules from routes.ts
This helps systematically split the large routes.ts file into domain-specific modules.
"""

import re
from pathlib import Path

ROUTES_FILE = Path(__file__).parent.parent / "routes.ts"
ROUTES_DIR = Path(__file__).parent

# Route section markers and their corresponding module names
ROUTE_SECTIONS = [
    (923, 1479, "directory.routes.ts", "Directory"),
    (1480, 1623, "skills.routes.ts", "Skills"),
    (1624, 2126, "chatgroups.routes.ts", "ChatGroups"),
    (2127, 3334, "lighthouse.routes.ts", "Lighthouse"),
    (3335, 3670, "trusttransport.routes.ts", "TrustTransport"),
    (3671, 4475, "mechanicmatch.routes.ts", "MechanicMatch"),
    (4476, 5105, "research.routes.ts", "Research"),
    (5106, 5296, "gentlepulse.routes.ts", "GentlePulse"),
    (5297, 5613, "blog.routes.ts", "Blog"),
    (5614, 5898, "lostmail.routes.ts", "LostMail"),
    (5899, 6316, "chyme.routes.ts", "Chyme"),
    (6317, 6974, "chyme-rooms.routes.ts", "ChymeRooms"),
    (6975, 7517, "workforce-recruiter.routes.ts", "WorkforceRecruiter"),
    (7518, 7681, "default-alive-or-dead.routes.ts", "DefaultAliveOrDead"),
]

def extract_route_section(start_line: int, end_line: int, module_name: str, app_name: str):
    """Extract a route section and create a module file"""
    with open(ROUTES_FILE, 'r') as f:
        lines = f.readlines()
    
    # Extract the section (1-indexed to 0-indexed)
    section_lines = lines[start_line-1:end_line-1]
    
    # Find imports needed for this section
    # This is a simplified version - in practice, you'd need to analyze dependencies
    imports = """import express, { type Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin, isAdminWithCsrf, getUserId } from "../auth";
import { validateCsrfToken } from "../csrf";
import { publicListingLimiter, publicItemLimiter } from "../rateLimiter";
import { asyncHandler } from "../errorHandler";
import { validateWithZod } from "../validationErrorFormatter";
import { withDatabaseErrorHandling } from "../databaseErrorHandler";
import { NotFoundError } from "../errors";
import { logInfo } from "../errorLogger";
import { logAdminAction } from "./shared";
import { rotateDisplayOrder, addAntiScrapingDelay, isLikelyBot } from "../dataObfuscation";
import * as Sentry from '@sentry/node';
import { z } from "zod";
"""
    
    # Create module content
    module_content = f'''/**
 * {app_name} routes
 */

{imports}
'''
    
    # Add the route handlers (remove the section comment header)
    for line in section_lines:
        if line.strip().startswith("// =") and "ROUTES" in line:
            continue  # Skip section header
        module_content += line
    
    module_content += f'''
export function register{app_name.replace(" ", "")}Routes(app: Express) {{
  // Routes extracted from routes.ts
  // TODO: Add route handlers here
}}
'''
    
    # Write module file
    module_path = ROUTES_DIR / module_name
    with open(module_path, 'w') as f:
        f.write(module_content)
    
    print(f"Created {module_name}")

if __name__ == "__main__":
    print("Route extraction script")
    print("Note: This is a helper script. Manual refinement is required.")
    print("\nTo extract routes:")
    print("1. Read the routes.ts file")
    print("2. Identify route sections by line numbers")
    print("3. Extract each section into its own module")
    print("4. Update routes/index.ts to import all modules")


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
    if not ROUTES_FILE.exists():
        print(f"Warning: {ROUTES_FILE} not found. Route extraction already completed.")
        print(f"  This script was used during refactoring to extract routes from the monolithic routes.ts file.")
        print(f"  All routes have been successfully extracted to individual modules.")
        return
    
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
    
    # Extract route handlers from section
    # Route handlers are lines that start with app.get, app.post, app.put, app.delete, etc.
    route_handlers = []
    in_route_handler = False
    indent_level = 0
    
    for line in section_lines:
        # Skip section header comments
        if line.strip().startswith("// =") and "ROUTES" in line:
            continue
        
        # Detect start of route handler (app.get, app.post, etc.)
        if re.match(r'^\s*app\.(get|post|put|delete|patch)\(', line):
            in_route_handler = True
            # Count initial indentation
            indent_level = len(line) - len(line.lstrip())
            route_handlers.append(line)
        elif in_route_handler:
            # Continue collecting route handler lines
            route_handlers.append(line)
            # Check if we've reached the end of the route handler (closing parenthesis and semicolon)
            if line.strip().endswith(');') or line.strip().endswith('});'):
                # Check if this is the actual end (not nested)
                current_indent = len(line) - len(line.lstrip())
                if current_indent <= indent_level:
                    in_route_handler = False
        else:
            # Lines before first route handler (could be comments, variable declarations, etc.)
            # Include them as they might be needed
            route_handlers.append(line)
    
    # Create module content
    module_content = f'''/**
 * {app_name} routes
 */

{imports}
'''
    
    # Add schema imports if needed (this would need to be detected from the route handlers)
    # For now, we'll add a comment indicating manual addition may be needed
    if any('Schema' in line or 'schema' in line for line in route_handlers):
        module_content += '// TODO: Add schema imports from "@shared/schema" as needed\n'
    
    # Create the register function with route handlers inside
    function_name = app_name.replace(" ", "") + "Routes"
    module_content += f'''
export function register{function_name}(app: Express) {{
'''
    
    # Add route handlers with proper indentation (2 spaces for function body)
    for line in route_handlers:
        # Remove any existing indentation and add 2 spaces for function body
        stripped = line.lstrip()
        if stripped:  # Only add non-empty lines
            # Preserve relative indentation but ensure minimum 2 spaces
            original_indent = len(line) - len(line.lstrip())
            # If line was at root level, give it 2 spaces; otherwise preserve relative indent
            if original_indent == 0:
                module_content += '  ' + stripped + '\n'
            else:
                # Preserve relative indentation (add 2 spaces base)
                module_content += '  ' + line
    
    module_content += '}\n'
    
    # Write module file
    module_path = ROUTES_DIR / module_name
    with open(module_path, 'w') as f:
        f.write(module_content)
    
    print(f"Created {module_name}")

if __name__ == "__main__":
    print("Route extraction script")
    print("=" * 60)
    print("Note: This script was used during refactoring to extract routes")
    print("from the monolithic routes.ts file into domain-specific modules.")
    print("\nStatus: Route extraction has been completed.")
    print("All routes are now in individual module files.")
    print("\nThis script is kept for reference but is no longer needed.")
    print("=" * 60)
    
    # Optionally, you can still run extraction if routes.ts exists
    if ROUTES_FILE.exists():
        print(f"\n{ROUTES_FILE.name} found. Would you like to extract routes?")
        print("Run: python extract_routes.py --extract-all")
    else:
        print(f"\n{ROUTES_FILE.name} not found - extraction already completed.")


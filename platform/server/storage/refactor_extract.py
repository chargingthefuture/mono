#!/usr/bin/env python3
"""
Script to extract code sections from storage.ts and organize into modules.
This helps with the refactoring process.
"""

import re
import os

def extract_methods_by_domain():
    """Extract methods grouped by domain from storage.ts"""
    
    with open('../storage.ts', 'r') as f:
        content = f.read()
    
    # Find all async method definitions
    method_pattern = r'async\s+(\w+)\([^)]*\)[^{]*\{'
    methods = re.findall(method_pattern, content)
    
    print(f"Found {len(methods)} methods")
    print(f"First 20 methods: {methods[:20]}")
    
    # Domain mapping (based on method name patterns)
    domains = {
        'user': ['getUser', 'upsertUser', 'getAllUsers', 'updateUser'],
        'auth': ['OTP', 'AuthToken', 'deleteExpired'],
        'billing': ['PricingTier', 'Payment', 'Delinquent'],
        'admin': ['AdminActionLog', 'getAdminStats', 'getWeeklyPerformanceReview'],
        'supportmatch': ['SupportMatch', 'Partnership', 'Message', 'Exclusion', 'Report'],
        'lighthouse': ['Lighthouse'],
        'socketrelay': ['Socketrelay', 'SocketRelay'],
        'directory': ['Directory'],
        'skills': ['Skills'],
        'chatgroups': ['ChatGroup', 'Chatgroups'],
        'trusttransport': ['Trusttransport'],
        'mechanicmatch': ['Mechanicmatch'],
        'lostmail': ['Lostmail'],
        'research': ['Research'],
        'gentlepulse': ['Gentlepulse'],
        'chyme': ['Chyme'],
        'workforce': ['WorkforceRecruiter'],
        'blog': ['Blog'],
        'default-alive-or-dead': ['DefaultAliveOrDead'],
        'profile-deletion': ['deleteSupportMatchProfile', 'deleteLighthouseProfile', 'deleteUserAccount'],
        'nps': ['Nps']
    }
    
    return methods, domains

if __name__ == '__main__':
    methods, domains = extract_methods_by_domain()
    print("\nDomain structure:")
    for domain, patterns in domains.items():
        matching = [m for m in methods if any(p.lower() in m.lower() for p in patterns)]
        print(f"{domain}: {len(matching)} methods")




































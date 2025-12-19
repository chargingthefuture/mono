#!/usr/bin/env python3
"""
Android Logcat Analyzer

Parses Android logcat output and categorizes errors for easier debugging.
"""

import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional
import argparse


@dataclass
class LogEntry:
    """Represents a single logcat entry"""
    timestamp: str
    level: str
    tag: str
    pid: Optional[str]
    message: str
    raw_line: str

    @property
    def is_error(self) -> bool:
        return self.level == 'E'

    @property
    def is_anr(self) -> bool:
        return 'ANR' in self.message or 'Application Not Responding' in self.message


class LogcatAnalyzer:
    """Analyzes Android logcat output"""

    # Common error patterns
    ERROR_PATTERNS = {
        'bluetooth': [
            r'bt_',
            r'Bluetooth',
            r'BLE_',
            r'AdapterState',
        ],
        'network': [
            r'Netd',
            r'ConnectivityService',
            r'DnsResolver',
            r'network',
            r'ECONNREFUSED',
            r'Network is unreachable',
        ],
        'anr': [
            r'ANR',
            r'Application Not Responding',
        ],
        'service': [
            r'Bad service name',
            r'unable to connect to service',
            r'ServiceSpecificException',
        ],
        'file': [
            r'FileNotFoundException',
            r'ENOENT',
            r'open failed',
        ],
        'permission': [
            r'Permission denied',
            r'getpgid.*failed',
        ],
        'memory': [
            r'libdebuggerd',
            r'tombstoned',
            r'crash_dump',
        ],
    }

    def __init__(self):
        self.entries: List[LogEntry] = []
        self.errors_by_category: Dict[str, List[LogEntry]] = defaultdict(list)
        self.anr_entries: List[LogEntry] = []
        self.error_count = 0

    def parse_logcat(self, content: str) -> None:
        """Parse logcat content"""
        # Pattern: MM-DD HH:MM:SS.mmm E/Tag(  PID): message
        # Or: MM-DD HH:MM:SS.mmm E/Tag( PID): message
        pattern = r'(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+([EWIDV])/(\S+)\s*\(\s*(\d+)?\s*\):\s+(.+)$'
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            match = re.match(pattern, line)
            if match:
                timestamp, level, tag, pid, message = match.groups()
                entry = LogEntry(
                    timestamp=timestamp,
                    level=level,
                    tag=tag,
                    pid=pid,
                    message=message,
                    raw_line=line
                )
                self.entries.append(entry)
                
                if entry.is_error:
                    self.error_count += 1
                    self._categorize_error(entry)
                
                if entry.is_anr:
                    self.anr_entries.append(entry)

    def _categorize_error(self, entry: LogEntry) -> None:
        """Categorize an error entry"""
        message_lower = entry.message.lower()
        tag_lower = entry.tag.lower()
        combined = f"{tag_lower} {message_lower}"
        
        categorized = False
        for category, patterns in self.ERROR_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, combined, re.IGNORECASE):
                    self.errors_by_category[category].append(entry)
                    categorized = True
                    break
            if categorized:
                break
        
        if not categorized:
            self.errors_by_category['other'].append(entry)

    def generate_report(self) -> str:
        """Generate analysis report"""
        report = []
        report.append("=" * 80)
        report.append("ANDROID LOGCAT ANALYSIS REPORT")
        report.append("=" * 80)
        report.append("")
        
        # Summary
        report.append("SUMMARY")
        report.append("-" * 80)
        report.append(f"Total log entries: {len(self.entries)}")
        report.append(f"Total errors: {self.error_count}")
        report.append(f"ANR occurrences: {len(self.anr_entries)}")
        report.append("")
        
        # Error breakdown by category
        report.append("ERROR BREAKDOWN BY CATEGORY")
        report.append("-" * 80)
        for category in sorted(self.errors_by_category.keys()):
            count = len(self.errors_by_category[category])
            report.append(f"{category.upper()}: {count} errors")
        report.append("")
        
        # ANR Details
        if self.anr_entries:
            report.append("APPLICATION NOT RESPONDING (ANR) ERRORS")
            report.append("-" * 80)
            for i, entry in enumerate(self.anr_entries, 1):
                report.append(f"\nANR #{i}:")
                report.append(f"  Time: {entry.timestamp}")
                report.append(f"  Tag: {entry.tag}")
                report.append(f"  PID: {entry.pid}")
                report.append(f"  Message: {entry.message[:200]}...")
            report.append("")
        
        # Top errors by category
        report.append("DETAILED ERROR ANALYSIS")
        report.append("-" * 80)
        for category in sorted(self.errors_by_category.keys()):
            errors = self.errors_by_category[category]
            if not errors:
                continue
            
            report.append(f"\n{category.upper()} ERRORS ({len(errors)} total):")
            report.append("-" * 40)
            
            # Group by tag
            by_tag = defaultdict(list)
            for error in errors:
                by_tag[error.tag].append(error)
            
            # Show top tags
            sorted_tags = sorted(by_tag.items(), key=lambda x: len(x[1]), reverse=True)[:5]
            for tag, tag_errors in sorted_tags:
                report.append(f"\n  {tag} ({len(tag_errors)} errors):")
                # Show unique error messages
                unique_messages = set()
                for error in tag_errors[:10]:  # Limit to first 10
                    msg_preview = error.message[:100]
                    if msg_preview not in unique_messages:
                        unique_messages.add(msg_preview)
                        report.append(f"    - {msg_preview}...")
            
            if len(errors) > 10:
                report.append(f"    ... and {len(errors) - 10} more errors")
        
        report.append("")
        report.append("=" * 80)
        
        return "\n".join(report)

    def get_anr_details(self) -> List[Dict]:
        """Extract detailed ANR information"""
        anr_details = []
        
        for entry in self.anr_entries:
            # Try to extract PID and process name from ANR message
            pid_match = re.search(r'PID:\s*(\d+)', entry.message)
            process_match = re.search(r'ANR in\s+([^\s]+)', entry.message)
            
            detail = {
                'timestamp': entry.timestamp,
                'pid': pid_match.group(1) if pid_match else entry.pid,
                'process': process_match.group(1) if process_match else 'Unknown',
                'message': entry.message,
            }
            anr_details.append(detail)
        
        return anr_details


def main():
    parser = argparse.ArgumentParser(description='Analyze Android logcat output')
    parser.add_argument('input', nargs='?', type=argparse.FileType('r'), default=sys.stdin,
                       help='Input logcat file (default: stdin)')
    parser.add_argument('-o', '--output', type=argparse.FileType('w'), default=sys.stdout,
                       help='Output report file (default: stdout)')
    parser.add_argument('--json', action='store_true',
                       help='Output as JSON')
    
    args = parser.parse_args()
    
    analyzer = LogcatAnalyzer()
    content = args.input.read()
    analyzer.parse_logcat(content)
    
    if args.json:
        import json
        output = {
            'summary': {
                'total_entries': len(analyzer.entries),
                'total_errors': analyzer.error_count,
                'anr_count': len(analyzer.anr_entries),
            },
            'errors_by_category': {
                cat: len(errors) for cat, errors in analyzer.errors_by_category.items()
            },
            'anr_details': analyzer.get_anr_details(),
        }
        json.dump(output, args.output, indent=2)
    else:
        report = analyzer.generate_report()
        args.output.write(report)


if __name__ == '__main__':
    main()


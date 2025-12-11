[![Platform Release](https://github.com/chargingthefuture/app/actions/workflows/platform-release.yml/badge.svg)](https://github.com/chargingthefuture/app/actions/workflows/platform-release.yml)

A secure, invite-only platform designed specifically for survivors, offering essential services and support with dignity, privacy, and respect.

## Meta Description (150-160 characters)
Secure, invite-only platform for human trafficking survivors. Access 12+ essential services including housing, transportation, job search, and community support in one unified app.

## Tagline
World's First Psyop-Free TI Economy

## One-Line Description
A secure, invite-only super app platform providing essential services and support for human trafficking survivors with dignity, privacy, and respect.

## Brief Overview (2-3 sentences)
The Psyop-Free Economy is a comprehensive super app built exclusively for human trafficking survivors. Operating like WeChat's mini-app ecosystem, it provides 12+ essential services—from housing and transportation to job search and community support—all accessible through a single secure account. Every feature is designed with trauma-informed principles, WCAG AAA accessibility standards, and user privacy as top priorities.

## Value Proposition
- **12+ Essential Services** in one secure platform
- **Invite-Only Access** for community safety
- **Trauma-Informed Design** with WCAG AAA accessibility
- **Complete Privacy Control** with full account deletion
- **Community-Driven** by and for survivors

## Service Categories

**Essential Services:**
- Housing (LightHouse)
- Transportation (TrustTransport)
- Vehicle Repair (MechanicMatch)
- Job Search (Workforce Recruiter)

**Community & Support:**
- Accountability Partners (SupportMatch)
- Skill Sharing (Directory)
- Mutual Aid (SocketRelay)
- Knowledge Base (CompareNotes)

**Wellness & Communication:**
- Meditation Library (GentlePulse)
- Social Audio (Chyme)
- Chat Groups (Signal.org)

**Safety & Reporting:**
- Mail Incident Tracking (LostMail)

## Key Differentiators
1. **Super App Architecture**: All services in one place, one account
2. **Survivor-Focused**: Built specifically for this community
3. **Privacy-First**: Complete data control and anonymization
4. **Accessibility**: WCAG AAA compliant, trauma-informed design
5. **Safety**: Invite-only, comprehensive moderation tools
6. **Free to Use**: All services available at no cost

---

## Overview

This Psyop-Free Skills Economy is a comprehensive super app platform built exclusively for human trafficking survivors. Operating like WeChat's mini-app ecosystem, it provides a unified, secure environment where survivors can access multiple essential services through a single account. Each service operates as an independent mini-app while sharing core platform functionalities, ensuring seamless integration and consistent user experience.

**Key Values:**
- **Safety First**: Invite-only access with robust security measures
- **Privacy by Design**: End-to-end encryption and data protection
- **Trauma-Informed**: WCAG AAA accessibility standards, no overwhelming animations
- **Dignity & Respect**: User-controlled data, complete account deletion options
- **Community-Driven**: Built by and for survivors

---

## Core Features

### Security & Privacy
- Invite-only access control
- Secure authentication system
- Complete account deletion with data anonymization
- Privacy-first design principles
- CSRF protection for all admin operations
- Anti-scraping protection for public endpoints

### Accessibility
- WCAG AAA compliance (7:1 contrast ratios)
- Full keyboard navigation support
- Screen reader compatible
- Trauma-informed design (no parallax, predictable interfaces)
- Mobile-responsive across all devices

### User Experience
- Unified dashboard for all services
- Single sign-on across all mini-apps
- Real-time messaging and notifications
- Payment tracking and management
- Comprehensive admin tools
- Announcement system for each service

---

## Mini-Apps & Services

### SupportMatch
**Accountability Partner Matching**
A partner matching platform featuring monthly partnership cycles, real-time messaging, and robust safety features. Connect with accountability partners for mutual support and growth.

### LightHouse
**Safe Housing & Accommodations**
Dual-role system connecting housing seekers with hosts. Provides safe accommodations and support resources, guiding survivors towards healing and empowerment.

### TrustTransport
**Safe Transportation Services**
Request or provide safe transportation services. Connect with trusted drivers for rides to appointments, errands, or other essential travel needs.

### MechanicMatch
**Vehicle Repair Services**
Connect with trusted mechanics for vehicle repair, remote diagnosis, or expert advice. Mechanics can build their profile and help car owners maintain safe, reliable transportation.

### SocketRelay
**Request & Fulfillment Network**
Find what you need or help others get the goods and services they request. A community-driven mutual aid system for sharing resources.

### Directory
**Skill-Sharing & Collaboration**
Find talented individuals to collaborate with. Build your professional profile and connect with others who share your skills and interests.

### Workforce Recruiter
**Job Search & Career Tracking**
Track your job search progress, manage applications, and connect with employment opportunities. Build your professional profile and track your career journey with comprehensive recruitment analytics.

### LostMail
**Mail Incident Reporting**
Report mail incidents (lost, damaged, tampered, delayed) and track your reports. Admin dashboard available for incident management and pattern tracking.

### CompareNotes (Beta)
**Knowledge Sharing & Q&A**
Post research questions, receive sourced answers, and collaboratively surface the most relevant, accurate responses with voting and tagging. Build a community knowledge base.

### GentlePulse
**Meditation & Wellness Library**
Access guided meditations hosted on Wistia, track your mood, and find supportive resources. Designed with privacy, accessibility, and trauma-informed care in mind.

### Chyme (Beta)
**Social Audio Platform**
Join private or public audio rooms for voice conversations. Secure, encrypted, and designed with privacy and trauma-informed care in mind.

### Chat Groups
**Real-Time Communication**
Access Signal.org group links for real-time chats with trusted individuals. Public listing of active groups with admin management interface.

---

## Technical Highlights

### Architecture
- **Super App Model**: WeChat-style mini-app ecosystem
- **Monorepo Structure**: Shared types between frontend/backend
- **Modern Tech Stack**: React, TypeScript, Express.js, PostgreSQL
- **Real-Time Capabilities**: WebSocket support for live messaging
- **Scalable Design**: Independent mini-apps with shared infrastructure

### Platform Capabilities
- Payment tracking and management
- User management and admin tools
- Activity logging and audit trails
- Weekly performance analytics
- Skills database management
- Pricing configuration
- Video-to-GIF conversion tools

### Integration Features
- Townsquare forum integration
- Wistia media hosting
- Signal.org group links
- External link management with confirmation dialogs

---

## Call to Action

**For Survivors:**
This platform is invite-only. If you have received an invitation, you can create an account and begin accessing services immediately. All services are designed with your safety and privacy as the top priority.

---

## Privacy & Safety Commitment

- **Complete Data Control**: Users can delete their entire account at any time
- **Anonymization**: All deleted data is properly anonymized, not hard-deleted
- **No Data Selling**: We never sell or share user data
- **Transparent Policies**: Clear terms of service and privacy policies
- **Admin Oversight**: Comprehensive moderation tools and safety reporting
- **Regular Security Audits**: Ongoing security improvements and updates

---

## Releases

The platform uses GitHub Actions for automated builds and releases. When a new release is created on GitHub, the workflow automatically:

- Builds the application with all dependencies
- Runs type checking and tests
- Creates a Docker image for deployment
- Uploads build artifacts to the GitHub release

### Release Process

1. **Automatic Builds**: Every push to `main` triggers a build and test run
2. **Release Creation**: Create a new release on GitHub to generate deployable artifacts
3. **Docker Deployment**: The Docker image can be deployed to Railway or any Docker-compatible platform

### Viewing Releases

- Check the [GitHub Actions workflow](https://github.com/chargingthefuture/app/actions/workflows/platform-release.yml) for build status
- Visit the [Releases page](https://github.com/chargingthefuture/app/releases) to download artifacts
- Each release includes a Docker image and build artifacts

---

## Footer Notes

**Platform Status**: Active and continuously improving
**Access**: Invite-only registration
**Support**: Available through Townsquare forum and in-app messaging
**Updates**: Regular feature additions and improvements based on community feedback

---

*This platform is built with care, respect, and dedication to serving the survivor community. Every feature is designed with trauma-informed principles, accessibility standards, and user dignity at the forefront.*

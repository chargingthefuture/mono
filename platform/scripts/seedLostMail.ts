import { db } from "../server/db";
import { 
  lostmailIncidents, 
  lostmailAuditTrail,
  lostmailAnnouncements
} from "../shared/schema";

async function seedLostMail() {
  console.log("Creating LostMail seed data...");

  // Create sample mail incidents
  const incidentsData = [
    {
      reporterName: "Sarah Johnson",
      reporterEmail: "sarah.johnson@example.com",
      reporterPhone: "+1-555-0101",
      incidentType: "lost" as const,
      carrier: "USPS",
      trackingNumber: "9400111899223197428490",
      expectedDeliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      noticedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      description: "Package was expected to arrive 10 days ago but never showed up. Tracking shows it was out for delivery but then stopped updating. This package contains important medical documents.",
      photos: null,
      severity: "high" as const,
      status: "under_review" as const,
      consent: true,
      assignedTo: "Admin Team",
      daysAgo: 8,
    },
    {
      reporterName: "Michael Chen",
      reporterEmail: "michael.chen@example.com",
      reporterPhone: "+1-555-0102",
      incidentType: "damaged" as const,
      carrier: "FedEx",
      trackingNumber: "1234567890123",
      expectedDeliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      noticedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      description: "Package arrived but was severely damaged. The box was torn open and contents were exposed. Some items appear to be missing.",
      photos: JSON.stringify(["photo1.jpg", "photo2.jpg"]),
      severity: "medium" as const,
      status: "in_progress" as const,
      consent: true,
      assignedTo: "Support Team",
      daysAgo: 4,
    },
    {
      reporterName: "Emily Rodriguez",
      reporterEmail: "emily.rodriguez@example.com",
      reporterPhone: null,
      incidentType: "tampered" as const,
      carrier: "UPS",
      trackingNumber: "1Z999AA10123456784",
      expectedDeliveryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      noticedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      description: "Package appeared to have been opened and resealed. The tape was different from what I used, and some items were missing. This is very concerning as the package contained personal documents.",
      photos: JSON.stringify(["tampered1.jpg"]),
      severity: "high" as const,
      status: "resolved" as const,
      consent: true,
      assignedTo: "Security Team",
      daysAgo: 14,
    },
    {
      reporterName: "James Wilson",
      reporterEmail: "james.wilson@example.com",
      reporterPhone: "+1-555-0104",
      incidentType: "delayed" as const,
      carrier: "USPS",
      trackingNumber: "9400111899223197428491",
      expectedDeliveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      noticedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Package is significantly delayed. Expected delivery was a week ago but tracking shows it's still in transit. This is time-sensitive mail.",
      photos: null,
      severity: "low" as const,
      status: "submitted" as const,
      consent: false,
      assignedTo: null,
      daysAgo: 2,
    },
    {
      reporterName: "Lisa Anderson",
      reporterEmail: "lisa.anderson@example.com",
      reporterPhone: "+1-555-0105",
      incidentType: "lost" as const,
      carrier: "DHL",
      trackingNumber: "1234567890",
      expectedDeliveryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      noticedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
      description: "International package has been lost. Last tracking update was 20 days ago showing it left the origin country but never arrived. This package contains important legal documents.",
      photos: null,
      severity: "high" as const,
      status: "closed" as const,
      consent: true,
      assignedTo: "Admin Team",
      daysAgo: 18,
    },
    {
      reporterName: "Robert Taylor",
      reporterEmail: "robert.taylor@example.com",
      reporterPhone: "+1-555-0106",
      incidentType: "damaged" as const,
      carrier: "USPS",
      trackingNumber: "9400111899223197428492",
      expectedDeliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      noticedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Package arrived with water damage. The box was wet and some contents were ruined. Need to file insurance claim.",
      photos: JSON.stringify(["water_damage1.jpg", "water_damage2.jpg"]),
      severity: "medium" as const,
      status: "submitted" as const,
      consent: true,
      assignedTo: null,
      daysAgo: 2,
    },
  ];

  const createdIncidents: any[] = [];

  for (const incidentData of incidentsData) {
    try {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - incidentData.daysAgo);

      const [incident] = await db
        .insert(lostmailIncidents)
        .values({
          reporterName: incidentData.reporterName,
          reporterEmail: incidentData.reporterEmail,
          reporterPhone: incidentData.reporterPhone,
          incidentType: incidentData.incidentType,
          carrier: incidentData.carrier,
          trackingNumber: incidentData.trackingNumber,
          expectedDeliveryDate: incidentData.expectedDeliveryDate,
          noticedDate: incidentData.noticedDate,
          description: incidentData.description,
          photos: incidentData.photos,
          severity: incidentData.severity,
          status: incidentData.status,
          consent: incidentData.consent,
          assignedTo: incidentData.assignedTo,
          createdAt: createdAt,
          updatedAt: createdAt,
        })
        .returning();

      createdIncidents.push(incident);
      console.log(`Created incident: ${incidentData.incidentType} - ${incidentData.trackingNumber} (${incidentData.status})`);
    } catch (error) {
      console.log(`Error creating incident:`, error);
    }
  }

  // Create audit trail entries for incidents that have been reviewed/processed
  const auditTrailData = [
    {
      incidentIndex: 0, // Sarah Johnson - under_review
      adminName: "Admin Team",
      action: "status_change",
      note: "Incident assigned for review. High priority due to medical documents.",
      hoursAgo: 6,
    },
    {
      incidentIndex: 1, // Michael Chen - in_progress
      adminName: "Support Team",
      action: "status_change",
      note: "Contacted carrier for investigation. Awaiting response.",
      hoursAgo: 2,
    },
    {
      incidentIndex: 1,
      adminName: "Support Team",
      action: "assigned",
      note: "Assigned to Support Team for follow-up.",
      hoursAgo: 4,
    },
    {
      incidentIndex: 2, // Emily Rodriguez - resolved
      adminName: "Security Team",
      action: "status_change",
      note: "Investigation completed. Security measures recommended.",
      hoursAgo: 24,
    },
    {
      incidentIndex: 2,
      adminName: "Security Team",
      action: "note_added",
      note: "Carrier notified. Replacement package sent with enhanced security.",
      hoursAgo: 12,
    },
    {
      incidentIndex: 4, // Lisa Anderson - closed
      adminName: "Admin Team",
      action: "status_change",
      note: "Case closed. Insurance claim processed.",
      hoursAgo: 72,
    },
  ];

  for (const auditData of auditTrailData) {
    try {
      const incident = createdIncidents[auditData.incidentIndex];
      if (!incident) {
        console.log(`Skipping audit trail - missing incident`);
        continue;
      }

      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - auditData.hoursAgo);

      await db.insert(lostmailAuditTrail).values({
        incidentId: incident.id,
        adminName: auditData.adminName,
        action: auditData.action,
        note: auditData.note,
        timestamp: timestamp,
      });

      console.log(`Created audit trail entry for incident ${incident.trackingNumber}`);
    } catch (error) {
      console.log(`Error creating audit trail entry:`, error);
    }
  }

  // Create announcements (REQUIRED for all mini-apps)
  const announcementsData = [
    {
      title: "Welcome to LostMail",
      content: "LostMail helps you report and track mail incidents including lost, damaged, tampered, or delayed packages. Your reports help us identify patterns and improve mail security.",
      type: "info" as const,
      isActive: true,
      expiresAt: null,
    },
    {
      title: "Important: Report Incidents Promptly",
      content: "If you notice a mail incident, please report it as soon as possible. Early reporting helps us investigate and resolve issues more effectively.",
      type: "warning" as const,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Expires in 60 days
    },
    {
      title: "Enhanced Security Measures",
      content: "We've implemented new security protocols for handling sensitive mail. All reports are reviewed by our security team.",
      type: "update" as const,
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const announcementData of announcementsData) {
    try {
      await db.insert(lostmailAnnouncements).values({
        title: announcementData.title,
        content: announcementData.content,
        type: announcementData.type,
        isActive: announcementData.isActive,
        expiresAt: announcementData.expiresAt,
      });

      console.log(`Created announcement: ${announcementData.title}`);
    } catch (error) {
      console.log(`Error creating announcement:`, error);
    }
  }

  console.log("\n✅ LostMail seed data created successfully!");
  console.log("\nSummary:");
  console.log(`- ${createdIncidents.length} incidents created`);
  console.log(`  - ${createdIncidents.filter(i => i.incidentType === 'lost').length} lost`);
  console.log(`  - ${createdIncidents.filter(i => i.incidentType === 'damaged').length} damaged`);
  console.log(`  - ${createdIncidents.filter(i => i.incidentType === 'tampered').length} tampered`);
  console.log(`  - ${createdIncidents.filter(i => i.incidentType === 'delayed').length} delayed`);
  console.log(`  - ${createdIncidents.filter(i => i.status === 'submitted').length} submitted`);
  console.log(`  - ${createdIncidents.filter(i => i.status === 'under_review').length} under_review`);
  console.log(`  - ${createdIncidents.filter(i => i.status === 'in_progress').length} in_progress`);
  console.log(`  - ${createdIncidents.filter(i => i.status === 'resolved').length} resolved`);
  console.log(`  - ${createdIncidents.filter(i => i.status === 'closed').length} closed`);
  console.log(`- ${auditTrailData.length} audit trail entries created`);
  console.log(`- ${announcementsData.length} announcements created`);
  
  process.exit(0);
}

seedLostMail().catch((error) => {
  console.error("Error seeding LostMail data:", error);
  process.exit(1);
});


/**
 * Skills data structure: Sector → Job Title → Skills
 * 
 * This file contains the comprehensive skills hierarchy data.
 * Extracted from seedSkills.ts for better organization.
 */

export const skillsData: {
  sector: {
    name: string;
    estimatedWorkforceShare?: number;
    estimatedWorkforceCount?: number;
    displayOrder: number;
  };
  jobTitles: {
    name: string;
    displayOrder: number;
    skills: string[];
  }[];
}[] = [
  {
    sector: {
      name: "Food & Agriculture",
      estimatedWorkforceShare: 8.0,
      estimatedWorkforceCount: 200000,
      displayOrder: 1,
    },
    jobTitles: [
      {
        name: "Farmers",
        displayOrder: 1,
        skills: [
          "Crop management",
          "Soil fertility",
          "Irrigation techniques",
          "Pest and disease identification",
          "Farm machinery operation",
          "Record-keeping and farm economics",
        "Water conservation practices",
        "Sustainable/organic farming methods",
        "Seed selection and propagation",
        "Harvesting techniques",
        "Storage and preservation of crops",
        "Weed management",
        "Tractor and implement maintenance",
        "Climate adaptation strategies",
        "Farm safety protocols",
        "Integrated pest management",
        ],
      },
      {
        name: "Agronomists",
        displayOrder: 2,
        skills: [
          "Crop physiology",
          "Soil science",
          "Field trial design",
          "Data analysis and agronomic modeling",
          "Pest and nutrient management planning",
          "Extension/communication",
          "Soil fertility assessment",
          "Irrigation scheduling",
          "Precision agriculture technologies",
          "Crop rotation planning",
          "Fertilizer application techniques",
          "Remote sensing and GIS in agriculture",
          "Climate risk analysis for crops",
          "Sustainable farming systems",
          "Plant breeding basics",
          "Agricultural policy understanding",
          "Farm record analysis",
          "Soil and water conservation",
        ],
      },
      {
        name: "Livestock Veterinarians",
        displayOrder: 3,
        skills: [
          "Animal clinical diagnosis",
          "Vaccination and disease control",
          "Herd health management",
          "Surgery and emergency care",
          "Biosecurity and zoonosis prevention",
          "Pharmacology and prescription",
        ],
      },
      {
        name: "Food-Processing Workers",
        displayOrder: 4,
        skills: [
          "Food safety and hygiene",
          "Equipment operation and maintenance",
          "Packaging and labeling",
          "Quality control/inspection",
          "Sanitation and HACCP basics",
        ],
      },
      {
        name: "Agribusiness Managers",
        displayOrder: 5,
        skills: [
          "Supply-chain management",
          "Financial planning and budgeting",
          "Marketing and market analysis",
          "Contract negotiation",
          "Regulatory compliance",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Water & Sanitation",
      estimatedWorkforceShare: 0.8,
      estimatedWorkforceCount: 20000,
      displayOrder: 2,
    },
    jobTitles: [
      {
        name: "Water Engineers",
        displayOrder: 1,
        skills: [
          "Hydraulic design",
          "Water resource management",
          "Treatment process design",
          "GIS and hydrological modeling",
          "Project management",
        ],
      },
      {
        name: "Treatment-Plant Operators",
        displayOrder: 2,
        skills: [
          "Operation of treatment equipment",
          "Process monitoring and control",
          "Chemical dosing and safety",
          "Routine maintenance",
          "Laboratory testing (basic)",
        ],
      },
      {
        name: "Plumbers",
        displayOrder: 3,
        skills: [
          "Plumber",
          "Pipe fitting and installation",
          "Leak diagnosis and repair",
          "Domestic and commercial systems",
          "Water quality protection practices",
        ],
      },
      {
        name: "Distribution Technicians",
        displayOrder: 4,
        skills: [
          "Pump and valve maintenance",
          "Network monitoring",
          "Metering and leak detection",
          "SCADA/basic telemetry",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Energy & Utilities",
      estimatedWorkforceShare: 1.2,
      estimatedWorkforceCount: 30000,
      displayOrder: 3,
    },
    jobTitles: [
      {
        name: "Power-Plant Operators",
        displayOrder: 1,
        skills: [
          "Plant instrumentation and control",
          "Startup/shutdown procedures",
          "Safety and emergency response",
          "Routine maintenance checks",
        ],
      },
      {
        name: "Electrical Engineers",
        displayOrder: 2,
        skills: [
          "Power systems design",
          "Protection and relay coordination",
          "Load flow and short-circuit studies",
          "Specification and procurement",
        ],
      },
      {
        name: "Renewable Technicians",
        displayOrder: 3,
        skills: [
          "Solar PV installation and maintenance",
          "Wind turbine maintenance basics",
          "Battery energy storage operation",
          "Inverter and controller troubleshooting",
        ],
      },
      {
        name: "Grid Operators",
        displayOrder: 4,
        skills: [
          "System monitoring and dispatch",
          "Frequency and voltage control",
          "Contingency response",
          "SCADA operation",
        ],
      },
      {
        name: "Maintenance Crews",
        displayOrder: 5,
        skills: [
          "Mechanical and electrical repair",
          "Preventive maintenance",
          "Safety compliance",
          "Workshop skills (welding, machining)",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Health",
      estimatedWorkforceShare: 30.0, // ~150,000 / 5,000,000 * 100 = 3%, but using midpoint of 25-35 per 1000
      estimatedWorkforceCount: 150000,
      displayOrder: 4,
    },
    jobTitles: [
      {
        name: "General Practitioners",
        displayOrder: 1,
        skills: [
          "Clinical diagnosis",
          "Primary care management",
          "Prescribing and pharmacology",
          "Patient communication",
          "Referral and continuity of care",
        ],
      },
      {
        name: "Specialists (e.g., cardiology, pediatrics)",
        displayOrder: 2,
        skills: [
          "Advanced clinical diagnostics",
          "Specialty procedures",
          "Multidisciplinary coordination",
          "Continuing professional development",
        ],
      },
      {
        name: "Nurses",
        displayOrder: 3,
        skills: [
          "Patient assessment and monitoring",
          "Medication administration",
          "Wound care and procedures",
          "Patient education and triage",
        ],
      },
      {
        name: "Midwives",
        displayOrder: 4,
        skills: [
          "Antenatal and postnatal care",
          "Safe delivery skills",
          "Neonatal resuscitation",
          "Family planning counseling",
        ],
      },
      {
        name: "Pharmacists",
        displayOrder: 5,
        skills: [
          "Medication dispensing",
          "Drug interaction checks",
          "Formulation and compounding basics",
          "Pharmaceutical counseling",
        ],
      },
      {
        name: "Laboratory Technicians",
        displayOrder: 6,
        skills: [
          "Specimen processing",
          "Diagnostic testing (microscopy, biochemistry, hematology)",
          "Equipment calibration",
          "Quality assurance",
        ],
      },
      {
        name: "Radiographers",
        displayOrder: 7,
        skills: [
          "Imaging operation (X-ray, CT basics)",
          "Radiation safety",
          "Image processing and quality control",
        ],
      },
      {
        name: "Community-Health Workers",
        displayOrder: 8,
        skills: [
          "Health promotion and education",
          "Case finding and referral",
          "Basic first aid",
          "First Aid & CPR",
          "Household-level data collection",
        ],
      },
      {
        name: "EMS / Paramedics",
        displayOrder: 9,
        skills: [
          "Emergency assessment and stabilization",
          "Advanced life support (where applicable)",
          "First Aid & CPR",
          "Triage and transport protocols",
          "Trauma and cardiac emergency care",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Housing & Construction",
      estimatedWorkforceShare: 6.0,
      estimatedWorkforceCount: 150000,
      displayOrder: 5,
    },
    jobTitles: [
      {
        name: "Civil Engineers",
        displayOrder: 1,
        skills: [
          "Structural design",
          "Geotechnical assessment",
          "Construction supervision",
          "Site surveys and CAD",
        ],
      },
      {
        name: "Architects",
        displayOrder: 2,
        skills: [
          "Building design",
          "Code compliance and accessibility",
          "Space planning",
          "Construction documentation",
        ],
      },
      {
        name: "Construction Laborers",
        displayOrder: 3,
        skills: [
          "Home Improvement",
          "Manual construction tasks",
          "Material handling",
          "Site safety practices",
          "Basic tool operation",
          "Carpentry",
          "Painting",
          "Plumbing",
          "Electrical",
          "HVAC",
          "Insulation",
          "Masonry",
          "Roofing",
          "Siding",
          "Windows",
          "Doors",
          "Flooring",
          "Tile",
          "Carpet",
          "Laminate",
          "Hardwood",
          "Molding",
          "Trim",
          "Painting",
          "Plumbing",
          "Electrical",
          "HVAC",
          "Insulation",
          "Masonry",
          "Roofing",
          "Siding",
          "Windows",
          "Doors",
          "Flooring",
          "Tile",
          "Carpet",
          "Laminate",
          "Hardwood",
          "Molding",
        ],
      },
      {
        name: "Electricians",
        displayOrder: 4,
        skills: [
          "Wiring and circuit installation",
          "Electrical testing and safety",
          "Code compliance",
          "Installation of lighting and controls",
        ],
      },
      {
        name: "Plumbers (construction)",
        displayOrder: 5,
        skills: [
          "Plumber",
          "Rough-in and finishing plumbing",
          "Sanitary and storm systems",
          "Fixture installation",
        ],
      },
      {
        name: "HVAC / Insulation Technicians",
        displayOrder: 6,
        skills: [
          "Heating and cooling system installation",
          "Refrigeration basics",
          "Insulation installation and thermal bridging mitigation",
          "System balancing",
        ],
      },
      {
        name: "Masons",
        displayOrder: 7,
        skills: [
          "Brick/block laying",
          "Mortar mixing and finishing",
          "Repair and restoration techniques",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Transport & Logistics",
      estimatedWorkforceShare: 4.0,
      estimatedWorkforceCount: 100000,
      displayOrder: 6,
    },
    jobTitles: [
      {
        name: "Truck Drivers",
        displayOrder: 1,
        skills: [
          "Vehicle operation and safety",
          "Route planning",
          "Load securement",
          "Hours-of-service compliance",
        ],
      },
      {
        name: "Bus/Train Operators",
        displayOrder: 2,
        skills: [
          "Vehicle control and passenger safety",
          "Timetable adherence",
          "On-board customer service",
        ],
      },
      {
        name: "Mechanics",
        displayOrder: 3,
        skills: [
          "Mechanic",
          "Vehicle diagnostics and repair",
          "Engine Repair",
          "Preventive maintenance",
          "Engine, transmission, and brake systems",
        ],
      },
      {
        name: "Logistics Planners",
        displayOrder: 4,
        skills: [
          "Supply-chain optimization",
          "Inventory management",
          "Freight routing and consolidation",
        ],
      },
      {
        name: "Port/Airport Staff",
        displayOrder: 5,
        skills: [
          "Cargo handling procedures",
          "Customs documentation basics",
          "Ramp and terminal operations",
        ],
      },
      {
        name: "Traffic Engineers",
        displayOrder: 6,
        skills: [
          "Traffic flow analysis",
          "Signal design and timing",
          "Road safety assessments",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Telecommunications & IT",
      estimatedWorkforceShare: 2.5,
      estimatedWorkforceCount: 62500,
      displayOrder: 7,
    },
    jobTitles: [
      {
        name: "Network Engineers",
        displayOrder: 1,
        skills: [
          "Network design and routing",
          "Switches, routers, and LAN/WAN configuration",
          "Network monitoring and performance tuning",
        ],
      },
      {
        name: "IT Support Technicians",
        displayOrder: 2,
        skills: [
          "Desktop troubleshooting",
          "User support and helpdesk workflows",
          "OS and basic network configuration",
        ],
      },
      {
        name: "Data-Center Technicians",
        displayOrder: 3,
        skills: [
          "Rack and cabling practices",
          "Cooling and power management",
          "Hardware replacement and monitoring",
        ],
      },
      {
        name: "Software Developers",
        displayOrder: 4,
        skills: [
          "Programming",
          "Programming and software design",
          "Version control and testing",
          "API development and integration",
        ],
      },
      {
        name: "Cybersecurity Specialists",
        displayOrder: 5,
        skills: [
          "Threat detection and incident response",
          "Access control and identity management",
          "Vulnerability assessment and remediation",
        ],
      },
      {
        name: "Telecom Field Technicians",
        displayOrder: 6,
        skills: [
          "Fiber/copper installation and splicing",
          "Radio and antenna maintenance",
          "Customer premises equipment setup",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Education",
      estimatedWorkforceShare: 2.4, // ~60,000 / 5,000,000 * 100
      estimatedWorkforceCount: 60000,
      displayOrder: 8,
    },
    jobTitles: [
      {
        name: "Primary School Teachers",
        displayOrder: 1,
        skills: [
          "Curriculum delivery and lesson planning",
          "Child development and classroom management",
          "Assessment and individualized support",
        ],
      },
      {
        name: "Secondary School Teachers",
        displayOrder: 2,
        skills: [
          "Subject-matter instruction",
          "Exam preparation and assessment design",
          "Classroom discipline and mentoring",
        ],
      },
      {
        name: "Early-Childhood Educators",
        displayOrder: 3,
        skills: [
          "Developmental activity planning",
          "Health and safety for young children",
          "Parent communication",
        ],
      },
      {
        name: "School Administrators",
        displayOrder: 4,
        skills: [
          "School leadership and planning",
          "Resource allocation and HR",
          "Compliance and reporting",
        ],
      },
      {
        name: "Vocational Trainers",
        displayOrder: 5,
        skills: [
          "Skills-based curriculum delivery",
          "Practical assessment and certification",
          "Industry liaison",
        ],
      },
      {
        name: "University Faculty",
        displayOrder: 6,
        skills: [
          "Teaching and research",
          "Supervision of students",
          "Academic publishing and grant writing",
        ],
      },
      {
        name: "Education Support Staff",
        displayOrder: 7,
        skills: [
          "Counseling and special education support",
          "Librarianship",
          "Administrative assistance",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Public Safety & Justice",
      estimatedWorkforceShare: 1.5,
      estimatedWorkforceCount: 37500,
      displayOrder: 9,
    },
    jobTitles: [
      {
        name: "Police Officers",
        displayOrder: 1,
        skills: [
          "Law enforcement techniques",
          "Community policing and investigation",
          "CCTV",
          "Evidence handling and reporting",
        ],
      },
      {
        name: "Firefighters",
        displayOrder: 2,
        skills: [
          "Fire suppression tactics",
          "Rescue and hazardous-materials response",
          "Fire prevention education",
        ],
      },
      {
        name: "Judges",
        displayOrder: 3,
        skills: [
          "Legal adjudication",
          "Case management",
          "Legal reasoning and sentencing",
        ],
      },
      {
        name: "Lawyers",
        displayOrder: 4,
        skills: [
          "Legal advocacy and advice",
          "Contract and statutory interpretation",
          "Case preparation and negotiation",
        ],
      },
      {
        name: "Corrections Officers",
        displayOrder: 5,
        skills: [
          "Inmate supervision and safety",
          "Rehabilitation program facilitation",
          "Security procedures",
        ],
      },
      {
        name: "Forensic Staff",
        displayOrder: 6,
        skills: [
          "Crime-scene evidence collection",
          "Laboratory analysis (DNA, toxicology)",
          "Expert reporting",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Finance & Public Administration",
      estimatedWorkforceShare: 6.0,
      estimatedWorkforceCount: 150000,
      displayOrder: 10,
    },
    jobTitles: [
      {
        name: "Accountants",
        displayOrder: 1,
        skills: [
          "Financial reporting and bookkeeping",
          "Tax compliance",
          "Auditing and internal controls",
        ],
      },
      {
        name: "Bankers",
        displayOrder: 2,
        skills: [
          "Customer lending and deposits",
          "Risk assessment and credit analysis",
          "Stock Trading",
          "Payments processing",
        ],
      },
      {
        name: "Financial Advisors",
        displayOrder: 3,
        skills: [
          "Investment planning and portfolio management",
          "Retirement planning",
          "Estate planning",
          "Financial risk assessment",
          "Client relationship management",
          "Regulatory compliance (fiduciary standards)",
          "Tax-efficient investment strategies",
        ],
      },
      {
        name: "Tax Officers",
        displayOrder: 4,
        skills: [
          "Tax assessment and collection",
          "Compliance audits",
          "Policy interpretation",
        ],
      },
      {
        name: "Civil Servants (general)",
        displayOrder: 5,
        skills: [
          "Policy implementation",
          "Program management",
          "Stakeholder coordination",
        ],
      },
      {
        name: "Regulators",
        displayOrder: 6,
        skills: [
          "Licensing and enforcement",
          "Monitoring compliance",
          "Rule-making support",
        ],
      },
      {
        name: "Economists / Analysts",
        displayOrder: 7,
        skills: [
          "Data analysis and forecasting",
          "Policy evaluation",
          "Cost-benefit analysis",
        ],
      },
      {
        name: "Procurement Officers",
        displayOrder: 8,
        skills: [
          "Tendering and contract management",
          "Supplier assessment",
          "Procurement rules compliance",
        ],
      },
      {
        name: "Community Development Officers",
        displayOrder: 9,
        skills: [
          "Community Organizer",
          "Stakeholder engagement and mobilization",
          "Program planning and implementation",
          "Community needs assessment",
          "Grassroots organizing and leadership development",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Manufacturing & Industry",
      estimatedWorkforceShare: 8.0,
      estimatedWorkforceCount: 200000,
      displayOrder: 11,
    },
    jobTitles: [
      {
        name: "Production Workers",
        displayOrder: 1,
        skills: [
          "Manufacturing",
          "Machine operation",
          "Assembly and packaging",
          "Quality checks",
        ],
      },
      {
        name: "Plant Managers",
        displayOrder: 2,
        skills: [
          "Production planning",
          "Staff supervision",
          "KPI monitoring",
        ],
      },
      {
        name: "Quality Inspectors",
        displayOrder: 3,
        skills: [
          "Product inspection and testing",
          "Standards compliance (ISO etc.)",
          "Non-conformance reporting",
        ],
      },
      {
        name: "Maintenance Engineers",
        displayOrder: 4,
        skills: [
          "Equipment troubleshooting",
          "Preventive maintenance planning",
          "Mechanical/electrical repair",
        ],
      },
      {
        name: "Process Operators",
        displayOrder: 5,
        skills: [
          "Control-room monitoring",
          "Process parameter adjustment",
          "Safety and lockout/tagout",
        ],
      },
      {
        name: "Machinist",
        displayOrder: 6,
        skills: [
          "Machine tool operation",
          "Blueprint reading and interpretation",
          "Technical drawing interpretation",
          "Precision measurement instruments",
          "Dimensional inspection and tolerances",
          "CNC operation and programming",
          "Machine setup and calibration",
          "Tool selection and maintenance",
          "Routine machine maintenance",
          "Troubleshooting machining issues",
          "Problem-solving in manufacturing",
          "Quality control and precision work",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Mining / Extractive",
      estimatedWorkforceShare: 0.5,
      estimatedWorkforceCount: 12500,
      displayOrder: 12,
    },
    jobTitles: [
      {
        name: "Geologists",
        displayOrder: 1,
        skills: [
          "Resource surveying and sampling",
          "Geological modeling",
          "Mineral exploration techniques",
        ],
      },
      {
        name: "Mining Engineers",
        displayOrder: 2,
        skills: [
          "Mine planning and design",
          "Safety and ventilation systems",
          "Blasting and excavation methods",
        ],
      },
      {
        name: "Safety Officers",
        displayOrder: 3,
        skills: [
          "Risk assessments",
          "Regulatory compliance",
          "Emergency response planning",
        ],
      },
      {
        name: "Technicians",
        displayOrder: 4,
        skills: [
          "Drill operation",
          "Equipment maintenance",
          "Sampling and logging",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Tourism & Hospitality",
      estimatedWorkforceShare: 1.5,
      estimatedWorkforceCount: 37500,
      displayOrder: 13,
    },
    jobTitles: [
      {
        name: "Hotel Staff (front desk, housekeeping)",
        displayOrder: 1,
        skills: [
          "Guest services and reservation systems",
          "Room preparation and cleanliness standards",
          "Complaint handling",
        ],
      },
      {
        name: "Chefs / Cooks",
        displayOrder: 2,
        skills: [
          "Menu planning and food preparation",
          "Food safety and portion control",
          "Inventory and kitchen management",
        ],
      },
      {
        name: "Tour Guides",
        displayOrder: 3,
        skills: [
          "Local knowledge and interpretation",
          "Group management and safety",
          "Multilingual communication (where applicable)",
          "Linguist",
        ],
      },
      {
        name: "Travel Agents",
        displayOrder: 4,
        skills: [
          "Booking and itinerary planning",
          "Vendor coordination",
          "Customer service",
        ],
      },
      {
        name: "Event Staff",
        displayOrder: 5,
        skills: [
          "Event setup and logistics",
          "Crowd management",
          "Vendor liaising",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Retail & Services",
      estimatedWorkforceShare: 8.0,
      estimatedWorkforceCount: 200000,
      displayOrder: 14,
    },
    jobTitles: [
      {
        name: "Shop Staff / Cashiers",
        displayOrder: 1,
        skills: [
          "Point-of-sale operation",
          "Customer service",
          "Stock replenishment",
        ],
      },
      {
        name: "Supply Managers",
        displayOrder: 2,
        skills: [
          "Inventory control",
          "Supplier negotiation",
          "Demand forecasting",
        ],
      },
      {
        name: "Cleaners / Janitorial",
        displayOrder: 3,
        skills: [
          "Cleaning techniques and schedules",
          "Safe chemical use",
          "Waste handling",
        ],
      },
      {
        name: "Personal Services (hairdressers, repair)",
        displayOrder: 4,
        skills: [
          "Client service skills",
          "Technical trade skills (haircutting, repair diagnostics)",
          "Small Appliance Repair",
          "Booking and customer relations",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Professional & Business Services",
      estimatedWorkforceShare: 2.5,
      estimatedWorkforceCount: 62500,
      displayOrder: 15,
    },
    jobTitles: [
      {
        name: "Lawyers / Legal Consultants",
        displayOrder: 1,
        skills: [
          "Legal research and drafting",
          "Compliance advisory",
          "Contract negotiation",
          "Litigation strategy",
          "Regulatory interpretation",
        ],
      },
      {
        name: "Management Consultants",
        displayOrder: 2,
        skills: [
          "Strategy development",
          "Operational improvement (Lean/Six Sigma)",
          "Change management",
          "Stakeholder facilitation",
          "Business modeling and financial case building",
        ],
      },
      {
        name: "Marketing Specialists",
        displayOrder: 3,
        skills: [
          "Market research and segmentation",
          "Campaign planning (digital & offline)",
          "Brand strategy and positioning",
          "Content strategy and analytics",
          "SEO/SEM and paid-media management",
        ],
      },
      {
        name: "Human Resources Professionals",
        displayOrder: 4,
        skills: [
          "Recruitment and onboarding",
          "Performance management and appraisal",
          "Learning & development",
          "Compensation & benefits design",
          "Labor-relations and compliance",
        ],
      },
      {
        name: "Business Analysts",
        displayOrder: 5,
        skills: [
          "Requirements gathering and process mapping",
          "Data analysis and KPI definition",
          "Systems specification and testing",
          "Stakeholder communication",
        ],
      },
      {
        name: "Project Managers",
        displayOrder: 6,
        skills: [
          "Project planning and scheduling (Gantt, CPM)",
          "Risk management and mitigation",
          "Budgeting and resource allocation",
          "Agile/Scrum facilitation",
          "Vendor and contract management",
        ],
      },
      {
        name: "Administrative & Office Support",
        displayOrder: 7,
        skills: [
          "Office Management",
          "Executive assistance",
          "Records management",
          "Office systems and procurement",
        ],
      },
    ],
  },
  {
    sector: {
      name: "R&D & High-Tech",
      estimatedWorkforceShare: 0.8,
      estimatedWorkforceCount: 20000,
      displayOrder: 16,
    },
    jobTitles: [
      {
        name: "Research Scientists",
        displayOrder: 1,
        skills: [
          "Experimental design and hypothesis testing",
          "Statistical analysis and data interpretation",
          "Literature review and publishing",
          "Grant writing and ethics compliance",
        ],
      },
      {
        name: "Lab Technicians",
        displayOrder: 2,
        skills: [
          "Sample preparation and assay execution",
          "Equipment calibration and maintenance",
          "Laboratory safety and SOP adherence",
          "Data recording and basic analysis",
        ],
      },
      {
        name: "Software Engineers / Developers",
        displayOrder: 3,
        skills: [
          "Programming",
          "System design and architecture",
          "Coding, testing, and CI/CD",
          "API development and integrations",
          "Performance optimization and debugging",
        ],
      },
      {
        name: "Systems / Hardware Engineers",
        displayOrder: 4,
        skills: [
          "Embedded systems design",
          "PCB layout and prototyping",
          "Firmware development and testing",
          "Hardware validation",
        ],
      },
      {
        name: "Product Managers",
        displayOrder: 5,
        skills: [
          "Product Management",
          "Roadmap development and prioritization",
          "User research and requirements definition",
          "Cross-functional coordination",
          "Metrics and go-to-market planning",
        ],
      },
      {
        name: "UX/UI Designers",
        displayOrder: 6,
        skills: [
          "User research and wireframing",
          "Prototyping and usability testing",
          "Visual design and interaction patterns",
          "Design systems and accessibility",
        ],
      },
      {
        name: "Data Scientists / ML Engineers",
        displayOrder: 7,
        skills: [
          "Data cleaning and feature engineering",
          "Model development and validation",
          "Deployment and monitoring of ML systems",
          "Experimentation and A/B testing",
        ],
      },
      {
        name: "Quality Assurance / Test Engineers",
        displayOrder: 8,
        skills: [
          "Test planning and automation",
          "Performance and stress testing",
          "Bug tracking and regression testing",
        ],
      },
      {
        name: "Tech Support / DevOps",
        displayOrder: 9,
        skills: [
          "CI/CD pipelines and infrastructure as code",
          "Monitoring, logging, and incident response",
          "Containerization and orchestration (Docker, Kubernetes)",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Creative & Media",
      estimatedWorkforceShare: 0.7,
      estimatedWorkforceCount: 17500,
      displayOrder: 17,
    },
    jobTitles: [
      {
        name: "Graphic / Visual Designers",
        displayOrder: 1,
        skills: [
          "Visual concept development",
          "Branding and identity systems",
          "Print and digital asset production",
          "Motion graphics basics",
        ],
      },
      {
        name: "Journalists / Reporters",
        displayOrder: 2,
        skills: [
          "Investigative and field reporting",
          "Interviewing and source verification",
          "Multimedia storytelling (audio/video)",
          "Fact-checking and editorial standards",
        ],
      },
      {
        name: "Producers / Content Creators",
        displayOrder: 3,
        skills: [
          "Scriptwriting and production planning",
          "Video/audio recording and editing",
          "Distribution and platform optimization",
          "Audience analytics and monetization",
        ],
      },
      {
        name: "Copywriters / Editors",
        displayOrder: 4,
        skills: [
          "Persuasive and technical writing",
          "Editing and style-guide enforcement",
          "SEO copy and content strategy",
        ],
      },
      {
        name: "Photographers / Videographers",
        displayOrder: 5,
        skills: [
          "Shooting and lighting techniques",
          "Post-production and color grading",
          "Asset management and metadata tagging",
        ],
      },
      {
        name: "Social Media Managers",
        displayOrder: 6,
        skills: [
          "Content calendaring and community engagement",
          "Platform-specific optimization",
          "Analytics and growth tactics",
        ],
      },
      {
        name: "Artists / Illustrators",
        displayOrder: 7,
        skills: [
          "Creative technique and portfolio development",
          "Commission management and contracts",
          "Exhibition and sales channels",
        ],
      },
      {
        name: "PR & Communications Specialists",
        displayOrder: 8,
        skills: [
          "Media relations and press releases",
          "Crisis communication planning",
          "Internal communications and messaging",
        ],
      },
      {
        name: "Photographer",
        displayOrder: 9,
        skills: [
          "Photography",
          "Portrait photography",
          "Event photography",
          "Product photography",
          "Photo editing and post-processing",
          "Lighting techniques",
          "Composition and framing",
          "Camera operation and settings",
        ],
      },
      {
        name: "Musicians / Composers",
        displayOrder: 10,
        skills: [
          "Music composition",
          "Songwriting",
          "Music production",
          "Music theory",
          "Instrumental performance",
          "Audio recording and mixing",
          "Music arrangement",
          "Lyric writing",
          "Live performance",
          "Music software and DAW operation",
          "Music mastering",
          "Music collaboration and session work",
        ],
      },
      {
        name: "Apparel/Fashion Designer",
        displayOrder: 11,
        skills: [
          "Pattern making",
          "Textile selection and sourcing",
          "Garment construction",
          "Fashion illustration",
          "Fit and sizing",
          "Trend analysis",
          "Color theory",
          "Sustainable fashion practices",
          "CAD for fashion design",
          "Fabric manipulation techniques",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Environmental & Waste Management",
      estimatedWorkforceShare: 1.0,
      estimatedWorkforceCount: 25000,
      displayOrder: 18,
    },
    jobTitles: [
      {
        name: "Environmental Engineers",
        displayOrder: 1,
        skills: [
          "Environmental impact assessment (EIA)",
          "Pollution control system design",
          "Water and air quality management",
          "Remediation and brownfield redevelopment",
        ],
      },
      {
        name: "Conservation Officers / Ecologists",
        displayOrder: 2,
        skills: [
          "Biodiversity monitoring and habitat assessment",
          "Species protection planning",
          "Community outreach and stewardship programs",
        ],
      },
      {
        name: "Waste-Collection Crews",
        displayOrder: 3,
        skills: [
          "Safe waste handling and segregation",
          "Route planning and vehicle operation",
          "Occupational health and safety",
        ],
      },
      {
        name: "Recycling Technicians / Plant Operators",
        displayOrder: 4,
        skills: [
          "Materials sorting and processing",
          "Operation of balers, shredders, and compactors",
          "Quality control for recycled outputs",
        ],
      },
      {
        name: "Hazardous Waste Specialists",
        displayOrder: 5,
        skills: [
          "Hazard classification and storage",
          "Safe transport and disposal procedures",
          "Spill response and containment",
        ],
      },
      {
        name: "Environmental Compliance Officers",
        displayOrder: 6,
        skills: [
          "Permitting and regulatory inspections",
          "Monitoring and reporting emissions/discharges",
          "Enforcement actions and corrective plans",
        ],
      },
      {
        name: "Waste Policy & Planning Analysts",
        displayOrder: 7,
        skills: [
          "Waste-flow modeling and policy evaluation",
          "Circular-economy program design",
          "Stakeholder consultation and financing models",
        ],
      },
      {
        name: "Composting & Organic Waste Managers",
        displayOrder: 8,
        skills: [
          "Composting process control",
          "Odor and vector management",
          "Product quality testing and distribution",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Microfinance & SME Support",
      estimatedWorkforceShare: 0.5,
      estimatedWorkforceCount: 12500,
      displayOrder: 19,
    },
    jobTitles: [
      {
        name: "Microfinance Officers / Loan Officers",
        displayOrder: 1,
        skills: [
          "Client appraisal and credit scoring for microloans",
          "Loan disbursement and repayment monitoring",
          "Financial inclusion outreach and training",
        ],
      },
      {
        name: "Business Development Officers / SME Advisors",
        displayOrder: 2,
        skills: [
          "Business-plan development and market analysis",
          "Financial modeling and cashflow management",
          "Access-to-market and supplier linkage facilitation",
        ],
      },
      {
        name: "Cooperative Managers",
        displayOrder: 3,
        skills: [
          "Governance and member services",
          "Financial record-keeping and transparency",
          "Cooperative business development and aggregation",
        ],
      },
      {
        name: "Credit Analysts",
        displayOrder: 4,
        skills: [
          "Portfolio risk assessment and monitoring",
          "Loan structuring and collateral evaluation",
          "Delinquency management strategies",
        ],
      },
      {
        name: "Financial Literacy Trainers",
        displayOrder: 5,
        skills: [
          "Basic accounting and bookkeeping for SMEs",
          "Budgeting and personal finance education",
          "Digital payments and record-keeping training",
        ],
      },
      {
        name: "Microinsurance & Risk Officers",
        displayOrder: 6,
        skills: [
          "Product design for small enterprises",
          "Claims processing and underwriting basics",
          "Risk-reduction advisory services",
        ],
      },
      {
        name: "SME Finance Platform Operators",
        displayOrder: 7,
        skills: [
          "Digital lending platform management",
          "KYC and AML compliance for small clients",
          "Data management and reporting",
        ],
      },
      {
        name: "Market Linkage / Trade Facilitators",
        displayOrder: 8,
        skills: [
          "Buyer-seller matchmaking",
          "Export readiness and certification support",
          "Negotiation and contracting assistance",
        ],
      },
    ],
  },
  {
    sector: {
      name: "Emergency & Reserve Roles",
      estimatedWorkforceShare: 0.4, // ~20,000 / 5,000,000 * 100 (using midpoint of 10,000-20,000)
      estimatedWorkforceCount: 20000,
      displayOrder: 20,
    },
    jobTitles: [
      {
        name: "Disaster-Response Specialists",
        displayOrder: 1,
        skills: [
          "Rapid needs assessment",
          "Coordination with humanitarian actors",
          "Logistics for emergency supply chains",
        ],
      },
      {
        name: "Emergency Planners",
        displayOrder: 2,
        skills: [
          "Contingency and continuity planning",
          "Multi-hazard risk mapping",
          "Training and simulation exercises",
        ],
      },
      {
        name: "Reserve Medical Teams",
        displayOrder: 3,
        skills: [
          "Mass-casualty triage and emergency care",
          "Field clinic setup and cold-chain management",
          "Rapid vaccination and outreach protocols",
        ],
      },
      {
        name: "Temporary Shelter & Logistics Staff",
        displayOrder: 4,
        skills: [
          "Shelter site selection and layout",
          "Registration and beneficiary tracking",
          "Distribution management and stock control",
        ],
      },
      {
        name: "Search & Rescue Teams",
        displayOrder: 5,
        skills: [
          "Urban and wilderness rescue techniques",
          "Technical rope, water, or confined-space rescue",
          "K9 handling (where applicable)",
        ],
      },
      {
        name: "Emergency Communications Officers",
        displayOrder: 6,
        skills: [
          "Crisis communication and public information",
          "Emergency alerting systems operation",
        ],
      },
      {
        name: "Volunteer Coordination Officers",
        displayOrder: 7,
        skills: [
          "Volunteer recruitment and vetting",
          "Tasking and safety briefings",
          "Incentive and welfare planning",
        ],
      },
    ],
  },
];

async function seedSkills() {
  console.log("Seeding Skills Database (Sectors → Job Titles → Skills)...");

  let sectorsCreated = 0;
  let jobTitlesCreated = 0;
  let skillsCreated = 0;
  let sectorsSkipped = 0;
  let jobTitlesSkipped = 0;
  let skillsSkipped = 0;

  for (const sectorData of skillsData) {
    // Create or get sector
    let sectorId: string;
    const [existingSector] = await db
      .select()
      .from(skillsSectors)
      .where(eq(skillsSectors.name, sectorData.sector.name))
      .limit(1);

    if (existingSector) {
      sectorId = existingSector.id;
      sectorsSkipped++;
      console.log(`Sector already exists: ${sectorData.sector.name}`);
    } else {
      const sectorInsert: InsertSkillsSector = {
        name: sectorData.sector.name,
        estimatedWorkforceShare: sectorData.sector.estimatedWorkforceShare
          ? sectorData.sector.estimatedWorkforceShare.toString()
          : null,
        estimatedWorkforceCount: sectorData.sector.estimatedWorkforceCount || null,
        displayOrder: sectorData.sector.displayOrder,
      };
      const [createdSector] = await db.insert(skillsSectors).values(sectorInsert).returning();
      sectorId = createdSector.id;
      sectorsCreated++;
      console.log(`Created sector: ${sectorData.sector.name}`);
    }

    // Create job titles for this sector
    for (const jobTitleData of sectorData.jobTitles) {
      let jobTitleId: string;
      const [existingJobTitle] = await db
        .select()
        .from(skillsJobTitles)
        .where(
          and(
            eq(skillsJobTitles.sectorId, sectorId),
            eq(skillsJobTitles.name, jobTitleData.name)
          )
        )
        .limit(1);

      if (existingJobTitle) {
        jobTitleId = existingJobTitle.id;
        jobTitlesSkipped++;
      } else {
        const jobTitleInsert: InsertSkillsJobTitle = {
          sectorId,
          name: jobTitleData.name,
          displayOrder: jobTitleData.displayOrder,
        };
        const [createdJobTitle] = await db
          .insert(skillsJobTitles)
          .values(jobTitleInsert)
          .returning();
        jobTitleId = createdJobTitle.id;
        jobTitlesCreated++;
      }

      // Create skills for this job title
      for (let i = 0; i < jobTitleData.skills.length; i++) {
        const skillName = jobTitleData.skills[i];
        const [existingSkill] = await db
          .select()
          .from(skillsSkills)
          .where(
            and(
              eq(skillsSkills.jobTitleId, jobTitleId),
              eq(skillsSkills.name, skillName)
            )
          )
          .limit(1);

        if (!existingSkill) {
          const skillInsert: InsertSkillsSkill = {
            jobTitleId,
            name: skillName,
            displayOrder: i + 1,
          };
          await db.insert(skillsSkills).values(skillInsert);
          skillsCreated++;
        } else {
          skillsSkipped++;
        }
      }
    }
  }

  // Get final counts
  const allSectors = await db.select().from(skillsSectors);
  const allJobTitles = await db.select().from(skillsJobTitles);
  const allSkills = await db.select().from(skillsSkills);

  console.log("\n✅ Skills Database seed complete!");
  console.log(`- Sectors: ${sectorsCreated} created, ${sectorsSkipped} skipped, ${allSectors.length} total`);
  console.log(`- Job Titles: ${jobTitlesCreated} created, ${jobTitlesSkipped} skipped, ${allJobTitles.length} total`);
  console.log(`- Skills: ${skillsCreated} created, ${skillsSkipped} skipped, ${allSkills.length} total`);

  process.exit(0);
}

seedSkills().catch((error) => {
  console.error("Error seeding skills database:", error);
  process.exit(1);
});;

export type Role = {
  company: string;
  orgKey: string;
  title: string;
  type: "Full-Time" | "Internship" | "Contract" | "National Service";
  start: string;
  end: string | null;
  location?: string;
  summary: string;
  highlights: string[];
  tech?: string[];
  links?: { label: string; href: string }[];
  repositoryNote?: string;
};

export const experience: Role[] = [
  {
    company: "Singapore Institute of Technology · Future Ship & Systems Design",
    orgKey: "sit",
    title: "Assistant Research and Full-Stack Developer",
    type: "Full-Time",
    start: "03/2026",
    end: null,
    location: "Hybrid · Singapore",
    summary:
      "Developing an end-to-end maritime condition-monitoring and fault-diagnosis platform that turns electric-harbour-craft SCADA, sensor, and alarm data into near-real-time vessel-health monitoring, explainable diagnostics, and engineering decision support.",
    highlights: [
      "Own solo full-stack development with Python, Django REST Framework, SQL Server, React, and TypeScript: multi-vessel data models, authenticated APIs, configurable failure-mode diagnostics (FMECA), historical replay, dashboards, and fault-evidence views.",
      "Engineer reliable ingestion and transformation pipelines for high-volume battery and propulsion telemetry, handling sparse signals, duplicates, missing or sentinel values, subsystem mapping, and batched persistence across multi-million-row datasets while improving a local replay benchmark by 87%.",
      "Collaborate with maritime researchers and engineers to translate operational requirements into maintainable data models, APIs, diagnostic workflows, and interfaces with an emphasis on traceability, performance, and usability.",
    ],
    repositoryNote: "Code maintained in private SIT repositories.",
    tech: [
      "Python",
      "Django REST Framework",
      "SQL Server",
      "Pandas",
      "React",
      "TypeScript",
      "REST APIs",
      "Docker",
      "Pytest",
    ],
  },
  {
    company: "Singapore Institute of Technology · Centre for Immersification",
    orgKey: "sit",
    title: "Assistant Research and Software Engineer",
    type: "Full-Time",
    start: "08/2025",
    end: "12/2025",
    location: "Hybrid · Singapore",
    summary:
      "Contributed to R3CAP, an open-source platform for capturing, reconstructing, editing, annotating, and collaboratively exploring 3D digital twins across desktop and WebXR environments.",
    highlights: [
      "Developed a Python and FastAPI edge server with a React, TypeScript, and Babylon.js client for scene authoring, spatial annotations, object and mesh operations, shared rooms, persistence, camera controls, and browser-based 3D interaction.",
      "Built modular engine and asynchronous job workflows across RTAB-Map, COLMAP, Blender, and experimental 3D Gaussian Splatting and Gaussian Grouping pipelines, including status, retry, recovery, coordinate alignment, APIs, tests, and documentation.",
      "Produced prototype engineering and technical documentation used by the research team in submissions to ACM CHI and DIS.",
    ],
    links: [
      {
        label: "R3CAP public repository",
        href: "https://github.com/singaporetech/r3cap",
      },
    ],
    repositoryNote:
      "Additional contributions were maintained in a private SIT repository.",
    tech: [
      "Python",
      "FastAPI",
      "React",
      "TypeScript",
      "Babylon.js",
      "WebXR",
      "MongoDB",
      "RTAB-Map",
      "COLMAP",
      "Blender",
      "Pytest",
    ],
  },
  {
    company: "Singapore Police Force · Contingency Planning Division",
    orgKey: "spf",
    title: "Section Leader · Police National Service Inspector",
    type: "National Service",
    start: "11/2024",
    end: "08/2025",
    location: "On-site · Singapore",
    summary:
      "Led personnel, task allocation, readiness, and cross-agency coordination for technology-enabled contingency planning supporting major national operations including GE2025 and NDP2025.",
    highlights: [
      "Developed Python, UiPath RPA, Excel/VBA, ArcGIS, and dashboard workflows for data collection, validation, personnel accountability, logistics, geospatial planning, and command reporting, saving an estimated 30+ analyst hours per operational cycle.",
      "Translated operational requirements into reliable digital workflows and coordinated stakeholders in high-accountability environments where accuracy, readiness, and timely escalation were critical.",
    ],
    tech: [
      "Python",
      "UiPath",
      "Excel VBA",
      "ArcGIS",
      "GIS",
      "Data Validation",
      "Dashboards",
    ],
  },
  {
    company: "HTX · Home Team Security Operations Centre",
    orgKey: "htx",
    title: "Cyber Security Engineer · Police National Service",
    type: "National Service",
    start: "01/2024",
    end: "06/2024",
    location: "On-site · Singapore",
    summary:
      "Supported Security Operations Centre monitoring and incident response through SIEM triage, threat hunting, classification, escalation, digital forensics, evidence preservation, and repeatable response workflows.",
    highlights: [
      "Developed Python and pandas workflows for analyst reporting and operational dashboards, improving the consistency and accessibility of security insights.",
      "Prepared technical documentation and delivered cybersecurity demonstrations during the HTX TechX Summit and ministerial visits, translating complex workflows for non-technical stakeholders.",
      "Collaborated in a high-trust environment requiring sound judgement, precise documentation, and disciplined escalation.",
    ],
    tech: [
      "SIEM",
      "Threat Hunting",
      "Incident Response",
      "Digital Forensics",
      "Python",
      "Pandas",
    ],
  },
  {
    company: "Ministry of Manpower",
    orgKey: "mom",
    title: "Workforce Data Insights Officer",
    type: "Full-Time",
    start: "04/2023",
    end: "07/2023",
    location: "Hybrid · Singapore",
    summary:
      "Conducted structured surveys, interviews, and stakeholder outreach to gather workforce, employment, and labour-market insights while maintaining confidentiality and data-quality standards.",
    highlights: [
      "Collected, validated, reconciled, and synthesised quantitative and qualitative information, resolving inconsistent submissions into analysis-ready records for workforce research.",
    ],
    tech: [
      "Data Collection",
      "Data Validation",
      "Data Quality",
      "Interviewing",
      "Stakeholder Engagement",
    ],
  },
  {
    company: "Deloitte Consulting",
    orgKey: "deloitte",
    title: "Artificial Intelligence and Data Analyst Intern",
    type: "Internship",
    start: "07/2022",
    end: "02/2023",
    location: "Hybrid · Singapore",
    summary:
      "Supported end-to-end analytics and consulting work for a regional maritime client, covering requirements, proposals, SQL, data validation, exploratory analysis, forecasting, model evaluation, and client deliverables.",
    highlights: [
      "Built Python, pandas, and SQL workflows; engineered time-series features; and evaluated ARIMA, XGBoost, and LightGBM approaches using clearly defined validation metrics.",
      "Translated analytical findings into visualisations, recommendations, technical documentation, and presentations for project stakeholders.",
    ],
    tech: [
      "Python",
      "SQL",
      "Pandas",
      "Time-Series Forecasting",
      "ARIMA",
      "XGBoost",
      "LightGBM",
    ],
  },
  {
    company: "Hitachi Asia",
    orgKey: "hitachi",
    title: "Logistics Assistant",
    type: "Contract",
    start: "07/2021",
    end: "09/2021",
    location: "On-site · Singapore",
    summary:
      "Supported hardware assembly, pre-deployment quality checks, inventory accuracy, and supply-chain readiness for server and computing equipment using internal stock systems.",
    highlights: [],
    tech: ["Inventory Management", "Quality Assurance", "Hardware Logistics"],
  },
];

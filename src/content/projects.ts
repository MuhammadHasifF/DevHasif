export type ProjectCategory = "AI" | "Data" | "Engineering";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  preview: string;
  description: string;
  year: string;
  org: string;
  orgKey: string;
  category: ProjectCategory;
  tags: string[];
  stack: string[];
  approach?: string[];
  impact?: string[];
  outcomes?: string[];
  links?: { label: string; href: string }[];
  featured?: boolean;
  hue?: string;
};

export const projects: Project[] = [
  {
    slug: "kithrelay",
    title: "KithRelay",
    preview:
      "On-device document processing, deterministic conflict checks, and human approval before sharing.",
    tagline:
      "Privacy-first care coordination that converts local documents into source-linked plans without uploading them to a server.",
    description:
      "Co-developed a browser-local care coordination prototype that parses text-based PDFs and structured files into reviewable, source-linked care plans while keeping documents on the user's device.",
    year: "2026",
    org: "Tencent Cloud Hackathon · Team Project",
    orgKey: "tencent",
    category: "Engineering",
    tags: ["Privacy", "Document Processing", "Care Coordination"],
    stack: [
      "React",
      "TypeScript",
      "PDF.js",
      "IndexedDB",
      "File System Access API",
      "Vitest",
    ],
    approach: [
      "Parse supported local files in the browser and retain evidence links back to each source.",
      "Resolve conflicting entries deterministically and surface mixed-patient, medication, and missing-data checks for human review.",
      "Require explicit approval before producing portable Markdown plans or sharing through a folder-based WorkBuddy workflow.",
    ],
    outcomes: [
      "Browser-local processing keeps sensitive source documents on-device",
      "Deterministic reconciliation and evidence views make every proposed change reviewable",
      "Fifteen automated tests cover the core parsing and plan-generation workflow",
    ],
    links: [
      { label: "Live demo", href: "https://kithrelay.vercel.app/" },
      {
        label: "Public repository",
        href: "https://github.com/MuhammadHasifF/KithRelay_TencentCloud2026",
      },
    ],
    featured: true,
    hue: "from-[var(--color-accent)] to-[var(--color-accent-2)]",
  },
  {
    slug: "campus-mind",
    title: "Campus Mind",
    preview:
      "Two-person build with source validation, adaptive mastery scoring, and 119 automated tests.",
    tagline:
      "Source-grounded active-recall coach that adapts questions, hints, and review queues to demonstrated mastery.",
    description:
      "Co-developed in a two-person team, Campus Mind turns uploaded study material into an attempt-first learning loop powered by Qwen, with evidence-linked questions, adaptive hints, feedback, and mastery tracking.",
    year: "2026",
    org: "Alibaba Cloud × Qoder · Two-Person Team",
    orgKey: "alibaba",
    category: "AI",
    tags: ["Active Recall", "Adaptive Learning", "Source Grounding"],
    stack: [
      "Python",
      "FastAPI",
      "Qwen",
      "Pydantic",
      "React",
      "TypeScript",
      "PyMuPDF",
      "Docker",
      "Pytest",
    ],
    approach: [
      "Generate structured questions, hints, and feedback from uploaded sources through validated Pydantic schemas.",
      "Track exponentially weighted mastery, misconceptions, confidence, and hint-adjusted performance to prioritise review.",
      "Apply source checks, retries, and deterministic fallbacks so malformed model output does not break the study flow.",
    ],
    outcomes: [
      "Attempt-first interaction prevents answers from being revealed before the learner engages",
      "Adaptive queues focus revision on lower-mastery concepts and recurring misconceptions",
      "119 automated tests cover API, validation, scoring, and failure-recovery behaviour",
    ],
    links: [
      {
        label: "Live demo",
        href: "https://alibabacloud-qoder2026.onrender.com/",
      },
      {
        label: "Public repository",
        href: "https://github.com/aeomantic/AlibabaCloud_Qoder2026",
      },
    ],
    featured: true,
    hue: "from-[var(--color-accent-2)] to-[var(--color-accent-3)]",
  },
  {
    slug: "braingit",
    title: "BrainGit",
    preview:
      "Five specialised agents, 17 tools, and 27 mocked tests for bounded tool orchestration.",
    tagline:
      "Personal productivity assistant with specialised Telegram agents, tool calling, semantic memory, and scheduled workflows.",
    description:
      "Built a containerised AI productivity system that connects Telegram to five specialised agents and 17 tools for email, calendar, tasks, notes, reminders, and long-term memory.",
    year: "2026",
    org: "Personal Project",
    orgKey: "github",
    category: "AI",
    tags: ["AI Agents", "Function Calling", "Semantic Memory"],
    stack: [
      "Python",
      "FastAPI",
      "Gemini",
      "PostgreSQL",
      "pgvector",
      "OAuth",
      "Docker",
      "Pytest",
    ],
    approach: [
      "Route Telegram requests through a bounded function-calling loop to specialised productivity agents.",
      "Store semantic memories with embeddings and pgvector alongside asynchronous SQLAlchemy models and Alembic migrations.",
      "Protect connected services with OAuth, encrypted tokens, access controls, and mocked integration tests.",
    ],
    outcomes: [
      "Five agents coordinate 17 tools across core personal-productivity workflows",
      "Scheduled reminders and semantic memory support useful follow-up across conversations",
      "Twenty-seven mocked tests validate tool orchestration without calling live external services",
    ],
    links: [
      {
        label: "Public repository",
        href: "https://github.com/MuhammadHasifF/BrainGit",
      },
    ],
    featured: true,
    hue: "from-[var(--color-accent-3)] to-[var(--color-accent)]",
  },
  {
    slug: "ibm-telco-churn",
    title: "IBM Telco Customer Churn",
    preview:
      "88.5% holdout recall at 46.4% precision—an explicitly documented threshold trade-off.",
    tagline:
      "Leakage-controlled churn modelling with train-fold resampling, sealed holdout evaluation, and threshold optimisation.",
    description:
      "Co-developed a reproducible classification study of 7,043 telecom customers across 33 source features, focusing on trustworthy evaluation under class imbalance rather than headline accuracy alone.",
    year: "2026",
    org: "Team Project",
    orgKey: "github",
    category: "Data",
    tags: ["Classification", "Imbalanced Data", "Model Evaluation"],
    stack: ["Python", "Pandas", "scikit-learn", "imbalanced-learn", "SMOTE"],
    approach: [
      "Seal a final holdout set and apply preprocessing plus SMOTE only within training folds to prevent leakage.",
      "Compare candidate classifiers with five-fold cross-validation and ablation studies.",
      "Tune the operating threshold around retention objectives and report precision, recall, F1, and ROC-AUC together.",
    ],
    outcomes: [
      "A 0.35-threshold L2 logistic model increased churn recall from 55.3% to 88.5%",
      "The selected model achieved 46.4% precision, 0.608 F1, and 0.847 ROC-AUC on the sealed holdout",
      "The workflow clearly separates model selection from final evaluation",
    ],
    links: [
      {
        label: "Public repository",
        href: "https://github.com/MuhammadHasifF/IBM_Telco_Customer_Churn",
      },
    ],
    featured: true,
    hue: "from-[var(--color-accent)] to-[var(--color-accent-3)]",
  },
  {
    slug: "singhacks-msig",
    title: "MSIG Travel Assistant · SingHacks",
    preview:
      "Deterministic comparison across three policy wordings, with source links and itinerary extraction.",
    tagline:
      "Conversational travel-insurance prototype with deterministic policy comparison and itinerary document extraction.",
    description:
      "Co-developed a SingHacks prototype that combines a chat interface with structured comparison across three MSIG travel-policy wordings and extraction of itinerary, passenger, cost, and special-requirement details from documents.",
    year: "2025",
    org: "MSIG × SingHacks · Team Project",
    orgKey: "msig",
    category: "AI",
    tags: ["Conversational AI", "Policy Comparison", "Document Extraction"],
    stack: [
      "Python",
      "FastAPI",
      "Streamlit",
      "LangChain",
      "Groq-hosted Llama 3.3",
      "PyMuPDF",
    ],
    approach: [
      "Expose session-aware chat and routing through FastAPI with a Streamlit interaction layer.",
      "Use deterministic product taxonomies and source policy documents for comparison and eligibility logic.",
      "Extract structured trip details from uploaded itineraries to reduce repeated user input.",
    ],
    outcomes: [
      "Side-by-side comparison across TravelEasy, Pre-Ex, and Scootsurance wordings",
      "Source-backed answers and structured rules reduce unsupported product claims",
      "Document extraction pre-fills relevant trip and traveller information",
    ],
    links: [
      {
        label: "Public repository",
        href: "https://github.com/MuhammadHasifF/SingHacks2025_MSIG_TravelAssistant",
      },
    ],
    featured: true,
    hue: "from-[var(--color-accent-3)] to-[var(--color-accent-2)]",
  },
  {
    slug: "m5-forecasting",
    title: "M5 Accuracy Forecasting Capstone",
    preview:
      "57.4 million training rows · 3.497 local RMSE on a 28-day temporal holdout.",
    tagline:
      "Individual forecasting thesis on the Walmart M5 dataset, from memory-efficient feature engineering to temporal holdout evaluation.",
    description:
      "Completed an individual major project and forecasting thesis supervised by Deloitte, benchmarking statistical and machine-learning approaches on the Walmart M5 retail-sales dataset.",
    year: "2022–2023",
    org: "Individual Capstone · Deloitte-Supervised",
    orgKey: "temasek-poly",
    category: "Data",
    tags: ["Forecasting", "Time Series", "Retail Analytics"],
    stack: ["Python", "Pandas", "LightGBM", "SARIMAX", "XGBoost", "Plotly"],
    approach: [
      "Engineer lag, rolling, price, calendar, and hierarchy-aware features for large retail-sales tables.",
      "Compare statistical and boosted-tree approaches using a chronological 28-day local holdout.",
      "Document methods, trade-offs, and reproducible workflows as a practical forecasting knowledge guide.",
    ],
    outcomes: [
      "Reduced major dataframe memory use by approximately 67.8% to 78.7%",
      "Trained LightGBM over 57.4 million rows and recorded a 3.497 RMSE on the local 28-day holdout",
      "Produced a complete thesis and reusable end-to-end forecasting workflow",
    ],
    links: [
      {
        label: "Public repository",
        href: "https://github.com/MuhammadHasifF/Major_Project_M5Accuracy",
      },
    ],
    hue: "from-[var(--color-text-1)] to-[var(--color-accent)]",
  },
];

export const projectCategories: (ProjectCategory | "All")[] = [
  "All",
  "AI",
  "Data",
  "Engineering",
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

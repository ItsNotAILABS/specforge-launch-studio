export type SpecSection = {
  id: string;
  title: string;
  detail: string;
  deliverable: string;
  options: string[];
  artifact: string;
};
export type SetupStep = { id: string; title: string; options: string[]; outcome: string };
export type Project = { name: string; type: string; status: string; readiness: number; price: number; owner: string; market: string };
export type Workstream = { stream: string; owner: string; status: string; due: string; risk: string; impact: string; tag: "launch" | "risk" | "systems" };
export type MarketplaceApp = { app: string; category: string; price: number; creator: string; profile: string; stats: string; includes: string[]; cloneTime: string };
export type StudioMetric = { label: string; value: string; note: string; tone: "good" | "warn" | "neutral" };
export type LaunchPhase = { phase: string; owner: string; status: string; output: string };

export const specSections: SpecSection[] = [
  { id: "type", title: "App Type", detail: "Defines the product category buyers understand first.", deliverable: "Positioning line and app category", artifact: "Product identity card", options: ["SaaS dashboard", "Marketplace", "AI workspace", "Client portal"] },
  { id: "audience", title: "Audience", detail: "Locks the user group, permission model, and expected sophistication.", deliverable: "Primary buyer and user role map", artifact: "Audience and permission matrix", options: ["Solo founders", "Agencies", "Internal teams", "Enterprise buyers"] },
  { id: "promise", title: "Core Promise", detail: "Turns the product into one clear outcome that can be marketed.", deliverable: "Product promise and homepage headline", artifact: "Homepage promise block", options: ["Save time", "Launch faster", "Coordinate work", "Sell digital products"] },
  { id: "workflow", title: "Primary Workflow", detail: "Sets the first-run path and main habit loop.", deliverable: "Primary user journey", artifact: "Workflow blueprint", options: ["Plan and approve", "Clone and customize", "Track and ship", "Analyze and report"] },
  { id: "features", title: "Feature Set", detail: "Packages the product into a buildable first release.", deliverable: "MVP feature bundle", artifact: "Feature release map", options: ["Projects, tables, exports", "Profiles, cloning, setup", "AI briefs, reports, tasks", "Payments, updates, releases"] },
  { id: "data", title: "Data Model", detail: "Defines the tables, objects, and records the app needs.", deliverable: "Core schema outline", artifact: "Schema candidate", options: ["Projects and tasks", "Apps and creators", "Specs and exports", "Customers and subscriptions"] },
  { id: "roles", title: "Team Roles", detail: "Sets permissions and collaboration boundaries.", deliverable: "Role and access model", artifact: "Access control grid", options: ["Owner, editor, viewer", "Creator, launcher, buyer", "Admin, analyst, operator", "Builder, reviewer, publisher"] },
  { id: "integrations", title: "Integrations", detail: "Identifies what the app connects to after launch.", deliverable: "Integration shortlist", artifact: "Integration runbook", options: ["Stripe, email, analytics", "GitHub, MCP, docs", "Notion, Slack, Linear", "CMS, storage, webhooks"] },
  { id: "launch", title: "Launch Plan", detail: "Decides how the app reaches users or buyers.", deliverable: "Launch route and release motion", artifact: "Launch operating plan", options: ["Private beta", "Marketplace publish", "Client handoff", "Productized service"] },
  { id: "success", title: "Success Metrics", detail: "Turns launch into measurable operating targets.", deliverable: "Metrics and acceptance criteria", artifact: "Success scorecard", options: ["Activation rate", "Clone completion", "Project velocity", "Monthly revenue"] }
];

export const setupSteps: SetupStep[] = [
  { id: "brand", title: "Brand", outcome: "Buyer-facing identity is applied before launch.", options: ["Upload logo", "Select palette", "Set app name", "Choose tone"] },
  { id: "audience", title: "Audience", outcome: "Clone gets a clear user role and market route.", options: ["Founder", "Agency", "Team", "Enterprise"] },
  { id: "content", title: "Content", outcome: "Starter content is ready enough to show buyers.", options: ["Starter copy", "Template data", "Import docs", "AI draft"] },
  { id: "features", title: "Features", outcome: "Feature tier matches the buyer and price point.", options: ["Core only", "Growth pack", "Team pack", "Enterprise pack"] },
  { id: "updates", title: "Updates", outcome: "Post-sale update channel is defined.", options: ["Manual updates", "Monthly drops", "Release notes", "Auto-update channel"] },
  { id: "goLive", title: "Go Live", outcome: "The clone has a concrete publish route.", options: ["Preview link", "Custom domain", "Marketplace listing", "Client handoff"] }
];

export const portfolio: Project[] = [
  { name: "Atlas CRM", type: "SaaS dashboard", status: "Spec ready", readiness: 72, price: 79, owner: "Builder Ops", market: "Revenue teams" },
  { name: "LaunchKit AI", type: "AI workspace", status: "Marketplace draft", readiness: 64, price: 99, owner: "Launcher Desk", market: "Founder teams" },
  { name: "Ops Portal", type: "Client portal", status: "Internal review", readiness: 81, price: 129, owner: "Client Systems", market: "Agencies" },
  { name: "Creator Desk", type: "Marketplace", status: "Clone setup", readiness: 58, price: 69, owner: "Creator Lab", market: "Digital creators" }
];

export const workstreams: Workstream[] = [
  { stream: "Spec export", owner: "Builder", status: "Ready", due: "Today", risk: "Low", impact: "Launch page copy", tag: "launch" },
  { stream: "Creator profile", owner: "Launcher", status: "In review", due: "Tomorrow", risk: "Medium", impact: "Marketplace trust", tag: "launch" },
  { stream: "Clone onboarding", owner: "Product", status: "Ready", due: "Today", risk: "Low", impact: "Buyer activation", tag: "launch" },
  { stream: "Update channel", owner: "Engineering", status: "Planned", due: "Friday", risk: "High", impact: "Post-purchase retention", tag: "risk" },
  { stream: "Spec QA rules", owner: "Systems", status: "Ready", due: "Today", risk: "Low", impact: "Cleaner exports", tag: "systems" },
  { stream: "Marketplace packaging", owner: "Growth", status: "Build", due: "Next", risk: "Medium", impact: "Sales conversion", tag: "systems" }
];

export const marketplace: MarketplaceApp[] = [
  { app: "Atlas CRM", category: "Revenue ops", price: 79, creator: "Maya Chen", profile: "Product designer shipping polished CRM and agency operations systems.", stats: "18 apps cloned - 4.9 rating - monthly updates", includes: ["Projects", "Pipeline", "Client portal", "Launch checklist"], cloneTime: "18 min" },
  { app: "LaunchKit AI", category: "AI workflow", price: 99, creator: "Rafael Stone", profile: "Builder of AI workspaces for founder teams and productized agencies.", stats: "31 apps cloned - 4.8 rating - setup videos", includes: ["Prompt library", "Report builder", "Tasks", "MCP guide"], cloneTime: "24 min" },
  { app: "Creator Desk", category: "Marketplace", price: 69, creator: "Noor Patel", profile: "Marketplace operator focused on creator profiles and buyer onboarding.", stats: "12 apps cloned - 5.0 rating - weekly release notes", includes: ["Listings", "Creator pages", "Clone flow", "Pricing"], cloneTime: "15 min" }
];

export const studioMetrics: StudioMetric[] = [
  { label: "Spec maturity", value: "Pro", note: "10 sections mapped", tone: "good" },
  { label: "Launch surface", value: "Dual", note: "Builder + Launcher", tone: "neutral" },
  { label: "Risk queue", value: "2", note: "Resolve before publish", tone: "warn" },
  { label: "Clone path", value: "6 steps", note: "Guided post-clone flow", tone: "good" }
];

export const launchPhases: LaunchPhase[] = [
  { phase: "Position", owner: "Builder", status: "Locked", output: "Category, audience, promise" },
  { phase: "Assemble", owner: "Product", status: "Active", output: "Schema, features, workflow" },
  { phase: "Package", owner: "Launcher", status: "Active", output: "Profile, price, setup" },
  { phase: "Publish", owner: "Growth", status: "Queued", output: "Marketplace or client handoff" }
];

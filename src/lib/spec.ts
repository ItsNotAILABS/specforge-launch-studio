import { setupSteps, specSections, type Project } from "../data/productModel";

export type SpecState = Record<string, string>;
export type SetupState = Record<string, string>;
export type PricingState = { base: number; complexity: number; support: number; market: number };

export const initialSpec: SpecState = Object.fromEntries(specSections.map((section) => [section.id, section.options[0]]));
export const initialSetup: SetupState = Object.fromEntries(setupSteps.map((step) => [step.id, step.options[0]]));
export const initialPricing: PricingState = { base: 39, complexity: 20, support: 12, market: 8 };

export function priceTotal(pricing: PricingState): number {
  return Object.values(pricing).reduce((sum, value) => sum + value, 0);
}

export function completionScore(spec: SpecState, setup: SetupState): number {
  const specComplete = Object.values(spec).filter(Boolean).length / specSections.length;
  const setupComplete = Object.values(setup).filter(Boolean).length / setupSteps.length;
  return Math.round(((specComplete * 0.68) + (setupComplete * 0.32)) * 100);
}

export function qualityScore(spec: SpecState, project: Project, setup: SetupState = initialSetup): number {
  const completion = completionScore(spec, setup);
  const launchBonus = spec.launch === "Marketplace publish" || spec.launch === "Productized service" ? 8 : 4;
  const integrationBonus = spec.integrations.includes("Stripe") || spec.integrations.includes("GitHub") ? 8 : 5;
  const readinessBonus = Math.round(project.readiness / 6);
  const packageBonus = setup.goLive === "Marketplace listing" || setup.goLive === "Client handoff" ? 5 : 2;
  return Math.min(99, Math.round((completion * 0.56) + launchBonus + integrationBonus + readinessBonus + packageBonus));
}

export function exportSpec(project: Project, spec: SpecState, setup: SetupState, pricing: PricingState): string {
  const specLines = specSections.map((section, index) => {
    return `${index + 1}. ${section.title}\n   Choice: ${spec[section.id]}\n   Deliverable: ${section.deliverable}\n   Artifact: ${section.artifact}`;
  });
  const setupLines = setupSteps.map((step, index) => `${index + 1}. ${step.title}: ${setup[step.id]} — ${step.outcome}`);
  return [
    `# SpecForge Launch Studio Export — ${project.name}`,
    "",
    `Project type: ${project.type}`,
    `Owner: ${project.owner}`,
    `Market: ${project.market}`,
    `Status: ${project.status}`,
    `Readiness: ${project.readiness}%`,
    "",
    "## 10-section app specification",
    ...specLines,
    "",
    "## Launcher onboarding",
    ...setupLines,
    "",
    "## Pricing advisor",
    `$${priceTotal(pricing)} = base ${pricing.base} + complexity ${pricing.complexity} + support ${pricing.support} + market ${pricing.market}`,
    "",
    "## Build handoff",
    "Use this export as the product blueprint for implementation, marketplace publishing, client handoff, or local AI continuation."
  ].join("\n");
}

export function nextBestAction(score: number, view: string): string {
  if (score < 70) return "Complete spec and setup choices";
  if (view === "builder") return "Open export preview";
  if (view === "launcher") return "Confirm price and publish route";
  return "Package for marketplace or client handoff";
}

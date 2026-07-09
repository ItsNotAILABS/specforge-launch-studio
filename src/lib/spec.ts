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

export function qualityScore(spec: SpecState, project: Project): number {
  const sectionScore = Object.values(spec).filter(Boolean).length * 6;
  const launchBonus = spec.launch === "Marketplace publish" ? 8 : 4;
  const integrationBonus = spec.integrations.includes("Stripe") || spec.integrations.includes("GitHub") ? 8 : 5;
  const readinessBonus = Math.round(project.readiness / 5);
  return Math.min(98, sectionScore + launchBonus + integrationBonus + readinessBonus);
}

export function exportSpec(project: Project, spec: SpecState, setup: SetupState, pricing: PricingState): string {
  const specLines = specSections.map((section, index) => `${index + 1}. ${section.title}: ${spec[section.id]} - ${section.deliverable}`);
  const setupLines = setupSteps.map((step, index) => `${index + 1}. ${step.title}: ${setup[step.id]}`);
  return [
    `SpecForge export - ${project.name}`,
    "",
    "10-section app specification:",
    ...specLines,
    "",
    "Launcher onboarding:",
    ...setupLines,
    "",
    `Pricing advisor: $${priceTotal(pricing)} (base ${pricing.base} + complexity ${pricing.complexity} + support ${pricing.support} + market ${pricing.market})`
  ].join("\n");
}

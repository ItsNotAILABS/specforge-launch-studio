#include "specforge_core.h"

#include <algorithm>
#include <cstdio>
#include <cstring>
#include <string>

namespace {

void copy_text(char* destination, const char* source) {
  std::snprintf(destination, SPECFORGE_MAX_TEXT, "%s", source ? source : "");
}

SpecForgeSection make_section(const char* title, const char* choice, const char* deliverable, const char* artifact) {
  SpecForgeSection section{};
  copy_text(section.title, title);
  copy_text(section.choice, choice);
  copy_text(section.deliverable, deliverable);
  copy_text(section.artifact, artifact);
  return section;
}

int clamp_int(int value, int min_value, int max_value) {
  return std::max(min_value, std::min(value, max_value));
}

void append_text(std::string& target, const char* text) {
  target += text ? text : "";
}

}  // namespace

extern "C" SpecForgeProject specforge_default_project(void) {
  SpecForgeProject project{};
  copy_text(project.name, "SpecForge Launch Studio");
  copy_text(project.owner, "Builder Ops");
  copy_text(project.market, "Builders, agencies, and launcher teams");
  project.readiness = 82;
  project.pricing = SpecForgePricing{39, 20, 12, 8};
  project.section_count = SPECFORGE_MAX_SECTIONS;
  project.sections[0] = make_section("App Type", "AI workspace", "Positioning line and app category", "Product identity card");
  project.sections[1] = make_section("Audience", "Agencies", "Primary buyer and user role map", "Audience and permission matrix");
  project.sections[2] = make_section("Core Promise", "Launch faster", "Product promise and homepage headline", "Homepage promise block");
  project.sections[3] = make_section("Primary Workflow", "Clone and customize", "Primary user journey", "Workflow blueprint");
  project.sections[4] = make_section("Feature Set", "Projects, tables, exports", "MVP feature bundle", "Feature release map");
  project.sections[5] = make_section("Data Model", "Specs and exports", "Core schema outline", "Schema candidate");
  project.sections[6] = make_section("Team Roles", "Builder, reviewer, publisher", "Role and access model", "Access control grid");
  project.sections[7] = make_section("Integrations", "GitHub, MCP, docs", "Integration shortlist", "Integration runbook");
  project.sections[8] = make_section("Launch Plan", "Marketplace publish", "Launch route and release motion", "Launch operating plan");
  project.sections[9] = make_section("Success Metrics", "Clone completion", "Metrics and acceptance criteria", "Success scorecard");
  return project;
}

extern "C" SpecForgeScores specforge_score_project(const SpecForgeProject* project) {
  if (!project) {
    return SpecForgeScores{0, 0, 0};
  }
  const int section_count = clamp_int(static_cast<int>(project->section_count), 0, SPECFORGE_MAX_SECTIONS);
  int completed = 0;
  int integration_bonus = 0;
  int launch_bonus = 4;
  for (int i = 0; i < section_count; ++i) {
    const SpecForgeSection& section = project->sections[i];
    if (std::strlen(section.choice) > 0 && std::strlen(section.deliverable) > 0) {
      completed += 1;
    }
    const std::string choice = section.choice;
    if (choice.find("GitHub") != std::string::npos || choice.find("MCP") != std::string::npos) {
      integration_bonus = 8;
    }
    if (choice.find("Marketplace") != std::string::npos || choice.find("Productized") != std::string::npos) {
      launch_bonus = 8;
    }
  }
  if (integration_bonus == 0) {
    integration_bonus = 5;
  }
  const int completion = section_count == 0 ? 0 : static_cast<int>((completed * 100) / section_count);
  const int readiness_bonus = clamp_int(project->readiness / 6, 0, 16);
  const int quality = clamp_int(static_cast<int>(completion * 0.56) + launch_bonus + integration_bonus + readiness_bonus + 5, 0, 99);
  const int price = project->pricing.base + project->pricing.complexity + project->pricing.support + project->pricing.market;
  return SpecForgeScores{price, quality, completion};
}

extern "C" size_t specforge_export_markdown(const SpecForgeProject* project, char* output, size_t output_size) {
  if (!project || !output || output_size == 0) {
    return 0;
  }

  const SpecForgeScores scores = specforge_score_project(project);
  std::string doc;
  append_text(doc, "# SpecForge Native Export\n\n");
  doc += "Project: " + std::string(project->name) + "\n";
  doc += "Owner: " + std::string(project->owner) + "\n";
  doc += "Market: " + std::string(project->market) + "\n";
  doc += "Quality: " + std::to_string(scores.quality_score) + "%\n";
  doc += "Completion: " + std::to_string(scores.completion_score) + "%\n";
  doc += "Pricing: $" + std::to_string(scores.price_total) + "\n\n";
  append_text(doc, "## 10-Section App Specification\n");

  const size_t section_count = std::min(project->section_count, static_cast<size_t>(SPECFORGE_MAX_SECTIONS));
  for (size_t i = 0; i < section_count; ++i) {
    const SpecForgeSection& section = project->sections[i];
    doc += std::to_string(i + 1) + ". " + section.title + "\n";
    doc += "   Choice: " + std::string(section.choice) + "\n";
    doc += "   Deliverable: " + std::string(section.deliverable) + "\n";
    doc += "   Artifact: " + std::string(section.artifact) + "\n";
  }

  const size_t bytes_to_copy = std::min(output_size - 1, doc.size());
  std::memcpy(output, doc.data(), bytes_to_copy);
  output[bytes_to_copy] = '\0';
  return bytes_to_copy;
}

extern "C" const char* specforge_version(void) {
  return SPECFORGE_VERSION;
}

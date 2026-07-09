#pragma once

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define SPECFORGE_VERSION "0.1.0"
#define SPECFORGE_MAX_TEXT 256
#define SPECFORGE_MAX_SECTIONS 10

typedef struct SpecForgeSection {
  char title[SPECFORGE_MAX_TEXT];
  char choice[SPECFORGE_MAX_TEXT];
  char deliverable[SPECFORGE_MAX_TEXT];
  char artifact[SPECFORGE_MAX_TEXT];
} SpecForgeSection;

typedef struct SpecForgePricing {
  int base;
  int complexity;
  int support;
  int market;
} SpecForgePricing;

typedef struct SpecForgeProject {
  char name[SPECFORGE_MAX_TEXT];
  char owner[SPECFORGE_MAX_TEXT];
  char market[SPECFORGE_MAX_TEXT];
  int readiness;
  SpecForgePricing pricing;
  SpecForgeSection sections[SPECFORGE_MAX_SECTIONS];
  size_t section_count;
} SpecForgeProject;

typedef struct SpecForgeScores {
  int price_total;
  int quality_score;
  int completion_score;
} SpecForgeScores;

SpecForgeProject specforge_default_project(void);
SpecForgeScores specforge_score_project(const SpecForgeProject* project);
size_t specforge_export_markdown(const SpecForgeProject* project, char* output, size_t output_size);
const char* specforge_version(void);

#ifdef __cplusplus
}
#endif

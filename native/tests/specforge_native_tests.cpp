#include "../specforge_core.h"

#include <cstring>
#include <iostream>
#include <vector>

int main() {
  SpecForgeProject project = specforge_default_project();
  SpecForgeScores scores = specforge_score_project(&project);

  if (std::strcmp(specforge_version(), SPECFORGE_VERSION) != 0) {
    std::cerr << "version mismatch\n";
    return 1;
  }
  if (project.section_count != SPECFORGE_MAX_SECTIONS) {
    std::cerr << "section count mismatch\n";
    return 1;
  }
  if (scores.price_total != 79 || scores.quality_score <= 70 || scores.completion_score != 100) {
    std::cerr << "score mismatch\n";
    return 1;
  }

  std::vector<char> output(8192);
  size_t written = specforge_export_markdown(&project, output.data(), output.size());
  if (written == 0 || std::strstr(output.data(), "SpecForge Native Export") == nullptr) {
    std::cerr << "export mismatch\n";
    return 1;
  }

  std::cout << "specforge native tests passed\n";
  return 0;
}

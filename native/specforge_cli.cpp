#include "specforge_core.h"

#include <iostream>
#include <string>
#include <vector>

namespace {

void print_usage(const char* executable) {
  std::cout << "SpecForge Native Interface " << specforge_version() << "\n\n";
  std::cout << "Usage:\n";
  std::cout << "  " << executable << " score\n";
  std::cout << "  " << executable << " export\n";
  std::cout << "  " << executable << " version\n";
}

}  // namespace

int main(int argc, char** argv) {
  const std::string command = argc > 1 ? argv[1] : "help";
  SpecForgeProject project = specforge_default_project();

  if (command == "version") {
    std::cout << specforge_version() << "\n";
    return 0;
  }

  if (command == "score") {
    const SpecForgeScores scores = specforge_score_project(&project);
    std::cout << "{\n";
    std::cout << "  \"price_total\": " << scores.price_total << ",\n";
    std::cout << "  \"quality_score\": " << scores.quality_score << ",\n";
    std::cout << "  \"completion_score\": " << scores.completion_score << "\n";
    std::cout << "}\n";
    return 0;
  }

  if (command == "export") {
    std::vector<char> buffer(8192);
    specforge_export_markdown(&project, buffer.data(), buffer.size());
    std::cout << buffer.data();
    return 0;
  }

  print_usage(argv[0]);
  return command == "help" ? 0 : 1;
}

#!/usr/bin/env bash
set -euo pipefail

# Static benchmark for fast-hit vs standard generation paths.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

FAST_FILES=(
  "${SKILL_DIR}/SKILL.md"
  "${SKILL_DIR}/references/usage-rules.md"
  "${SKILL_DIR}/references/root-assets.md"
  "${SKILL_DIR}/references/fast-hit-assembly.md"
  "${SKILL_DIR}/references/render-output.md"
)

STANDARD_FILES=(
  "${SKILL_DIR}/SKILL.md"
  "${SKILL_DIR}/references/usage-rules.md"
  "${SKILL_DIR}/references/root-assets.md"
  "${SKILL_DIR}/references/render-output.md"
  "${SKILL_DIR}/references/final-template-reference.md"
  "${SKILL_DIR}/references/domain-public-template.md"
  "${SKILL_DIR}/references/report-template.md"
  "${SKILL_DIR}/references/echarts-template.md"
)

FAST_REQUIRED_INPUTS=4
STANDARD_REQUIRED_INPUTS=8

FAST_DEFAULT_SECTIONS=7
STANDARD_DEFAULT_SECTIONS=11

FAST_DEFAULT_CHART_CAP=2
STANDARD_REFERENCE_CHART_CAP=11

require_files() {
  local missing=0
  for file in "$@"; do
    if [[ ! -f "${file}" ]]; then
      echo "[ERROR] Missing file: ${file}" >&2
      missing=1
    fi
  done
  if [[ "${missing}" -ne 0 ]]; then
    exit 1
  fi
}

sum_lines() {
  wc -l "$@" | awk 'END { print $1 }'
}

sum_bytes() {
  wc -c "$@" | awk 'END { print $1 }'
}

percent_reduction() {
  local reduced="$1"
  local baseline="$2"
  awk -v reduced="${reduced}" -v baseline="${baseline}" 'BEGIN {
    if (baseline == 0) {
      printf "0.0"
    } else {
      printf "%.1f", (1 - reduced / baseline) * 100
    }
  }'
}

require_files "${FAST_FILES[@]}" "${STANDARD_FILES[@]}"

FAST_FILE_COUNT="${#FAST_FILES[@]}"
STANDARD_FILE_COUNT="${#STANDARD_FILES[@]}"

FAST_LINE_COUNT="$(sum_lines "${FAST_FILES[@]}")"
STANDARD_LINE_COUNT="$(sum_lines "${STANDARD_FILES[@]}")"

FAST_BYTE_COUNT="$(sum_bytes "${FAST_FILES[@]}")"
STANDARD_BYTE_COUNT="$(sum_bytes "${STANDARD_FILES[@]}")"

FILE_REDUCTION="$(percent_reduction "${FAST_FILE_COUNT}" "${STANDARD_FILE_COUNT}")"
LINE_REDUCTION="$(percent_reduction "${FAST_LINE_COUNT}" "${STANDARD_LINE_COUNT}")"
BYTE_REDUCTION="$(percent_reduction "${FAST_BYTE_COUNT}" "${STANDARD_BYTE_COUNT}")"
INPUT_REDUCTION="$(percent_reduction "${FAST_REQUIRED_INPUTS}" "${STANDARD_REQUIRED_INPUTS}")"
SECTION_REDUCTION="$(percent_reduction "${FAST_DEFAULT_SECTIONS}" "${STANDARD_DEFAULT_SECTIONS}")"
CHART_REDUCTION="$(percent_reduction "${FAST_DEFAULT_CHART_CAP}" "${STANDARD_REFERENCE_CHART_CAP}")"

cat <<EOF
yondesign-agentic generation efficiency benchmark

[Path cost]
- Fast-hit route files: ${FAST_FILE_COUNT}
- Standard route files: ${STANDARD_FILE_COUNT}
- Fast-hit route lines: ${FAST_LINE_COUNT}
- Standard route lines: ${STANDARD_LINE_COUNT}
- Fast-hit route bytes: ${FAST_BYTE_COUNT}
- Standard route bytes: ${STANDARD_BYTE_COUNT}

[Assembly cost]
- Fast-hit minimum input items: ${FAST_REQUIRED_INPUTS}
- Standard recommended input items: ${STANDARD_REQUIRED_INPUTS}
- Fast-hit default sections: ${FAST_DEFAULT_SECTIONS}
- Standard default sections: ${STANDARD_DEFAULT_SECTIONS}
- Fast-hit default chart cap: ${FAST_DEFAULT_CHART_CAP}
- Standard reference chart cap: ${STANDARD_REFERENCE_CHART_CAP}

[Reduction]
- File reads reduced: ${FILE_REDUCTION}%
- Reference lines reduced: ${LINE_REDUCTION}%
- Reference bytes reduced: ${BYTE_REDUCTION}%
- Required inputs reduced: ${INPUT_REDUCTION}%
- Default sections reduced: ${SECTION_REDUCTION}%
- Chart assembly cap reduced: ${CHART_REDUCTION}%

[Verdict]
- Fast-hit mode is the better default when the goal is first-pass assembly speed.
- Standard mode remains better when coverage, evidence richness, and template completeness matter more than speed.
EOF

# Scripts for Dependency Updates

- update-deps-monolith.sh
  - Automates updating dependencies for both backend and frontend.
  - Regenerates lockfiles, attempts audit/lint/tests, and prints next steps.
  - Usage:
    cd TELJIRAMonolith
    bash ./scripts/update-deps-monolith.sh

See DEPENDENCY_UPDATE_NOTES.md for manual verification steps and known breaking change checks.

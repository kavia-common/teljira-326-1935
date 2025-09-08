#!/bin/bash
cd /home/kavia/workspace/code-generation/teljira-326-1935/TELJIRAMonolith
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi


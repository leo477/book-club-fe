#!/bin/bash
set -e

# 1. Branch check
echo "[ignore-build.sh] Checking branch: $VERCEL_GIT_COMMIT_REF"
if [[ "$VERCEL_GIT_COMMIT_REF" != "main" && "$VERCEL_GIT_COMMIT_REF" != "develop" && "$VERCEL_GIT_COMMIT_REF" != "uat" ]]; then
  echo "[ignore-build.sh] Branch is not main, develop, or uat. Skipping build."
  exit 0
fi

# 2. Merge commit check
PARENT_COUNT=$(git cat-file -p HEAD | grep -c "^parent" || echo 0)
echo "[ignore-build.sh] HEAD parent count: $PARENT_COUNT"
if [[ "$PARENT_COUNT" -lt 2 ]]; then
  echo "[ignore-build.sh] Not a merge commit. Skipping build."
  exit 0
fi

# 3. Changed files check
if git diff --name-only HEAD^ HEAD -- src/ package.json > /tmp/changed_files 2>/dev/null; then
  if ! grep -q . /tmp/changed_files; then
    echo "[ignore-build.sh] No changes in src/ or package.json. Skipping build."
    exit 0
  fi
  echo "[ignore-build.sh] Changes detected in src/ or package.json. Proceeding with build."
else
  echo "[ignore-build.sh] git diff failed (possibly shallow clone). Proceeding with build."
fi

# 4. Build
echo "[ignore-build.sh] All checks passed. Proceeding with build."
exit 1

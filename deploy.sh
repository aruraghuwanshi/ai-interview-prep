#!/usr/bin/env bash
# Publish this site to GitHub Pages on your personal github.com account.
set -euo pipefail

export GH_HOST=github.com
REPO="${1:-ai-interview-prep}"

if ! gh auth status >/dev/null 2>&1; then
  echo "Not authenticated to github.com."
  echo "Run first:  gh auth login --hostname github.com --web"
  exit 1
fi

OWNER="$(gh api user --jq .login)"

git add -A
git commit -m "Publish AI interview prep site" >/dev/null 2>&1 || true
git branch -M main

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
else
  gh repo create "$REPO" --public --source=. --remote=origin --push
fi

if gh api -X POST "repos/${OWNER}/${REPO}/pages" \
     -f 'source[branch]=main' -f 'source[path]=/' >/dev/null 2>&1; then
  echo "GitHub Pages enabled."
else
  echo "Pages may already be enabled (or enable it in Settings -> Pages)."
fi

echo ""
echo "Live shortly at:  https://${OWNER}.github.io/${REPO}/"

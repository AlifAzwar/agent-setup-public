#!/usr/bin/env bash
# Azwar's Agent Setup Installer for macOS / Linux / Git Bash
# Never overwrites files you already have. To refresh skills and rules from the template,
# run with AGENT_SETUP_UPDATE=1 (your AGENTS.md and filled references/project.md are still kept).
set -e

echo -e "\033[0;36mInstalling Azwar's Agent Setup Template...\033[0m"

REPO_URL="https://github.com/AlifAzwar/agent-setup-public.git"
TEMP_DIR=$(mktemp -d)
UPDATE="${AGENT_SETUP_UPDATE:-0}"

trap 'rm -rf "$TEMP_DIR"' EXIT

git clone --depth 1 "$REPO_URL" "$TEMP_DIR" --quiet

# AGENTS.md holds project-specific rules: keep an existing one, drop the template next to it
if [ -f "AGENTS.md" ]; then
    cp "$TEMP_DIR/AGENTS.md" ./AGENTS.template.md
    echo -e "\033[0;33m  -> AGENTS.md exists, kept it. Template saved as AGENTS.template.md to merge by hand.\033[0m"
else
    cp "$TEMP_DIR/AGENTS.md" ./
    echo -e "\033[0;32m  -> Installed AGENTS.md\033[0m"
fi

# .agents: copy file by file so local skills and edits survive
added=0; updated=0; kept=0
while IFS= read -r -d '' src; do
    rel="${src#"$TEMP_DIR"/}"
    if [ ! -e "$rel" ]; then
        mkdir -p "$(dirname "$rel")"; cp "$src" "$rel"; added=$((added + 1))
    elif [ "$UPDATE" = "1" ] && [[ "$rel" != */references/project.md ]]; then
        cp "$src" "$rel"; updated=$((updated + 1))
    else
        kept=$((kept + 1))
    fi
done < <(find "$TEMP_DIR/.agents" -type f -print0)
echo -e "\033[0;32m  -> .agents: $added added, $updated updated, $kept existing files kept\033[0m"
if [ "$kept" -gt 0 ] && [ "$UPDATE" != "1" ]; then
    echo -e "\033[0;33m     Re-run with AGENT_SETUP_UPDATE=1 to refresh existing skills and rules.\033[0m"
fi

# Install CI workflow if not present
if [ ! -f ".github/workflows/ci.yml" ]; then
    mkdir -p .github/workflows
    cp "$TEMP_DIR/.github/workflows/ci.yml" .github/workflows/
    echo -e "\033[0;32m  -> Installed .github/workflows/ci.yml\033[0m"
fi

echo -e "\n\033[0;36mInstallation completed successfully! Your agent is ready with Vercel React Best Practices, Token Efficiency, and Git Workflow rules.\033[0m"

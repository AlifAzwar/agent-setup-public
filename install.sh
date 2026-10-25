#!/usr/bin/env bash
# Azwar's Agent Setup Installer for macOS / Linux / Git Bash
# Never overwrites files you already have. To refresh skills and rules from the template,
# run with AGENT_SETUP_UPDATE=1: changed files are backed up to .agents-backup/ first, and
# AGENTS.md and filled references/project.md are always kept.
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

# .agents: copy file by file so local skills and edits survive.
# In update mode a file that differs from the template is backed up before it is replaced.
BACKUP_DIR=".agents-backup/$(date +%Y%m%d-%H%M%S)"
added=0; updated=0; kept=0; backed_up=()
while IFS= read -r -d '' src; do
    rel="${src#"$TEMP_DIR"/}"
    if [ ! -e "$rel" ]; then
        mkdir -p "$(dirname "$rel")"; cp "$src" "$rel"; added=$((added + 1))
    elif cmp -s "$src" "$rel"; then
        :
    elif [ "$UPDATE" = "1" ] && [[ "$rel" != */references/project.md ]]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$rel")"; cp "$rel" "$BACKUP_DIR/$rel"; backed_up+=("$rel")
        cp "$src" "$rel"; updated=$((updated + 1))
    else
        kept=$((kept + 1))
    fi
done < <(find "$TEMP_DIR/.agents" -type f -print0)
echo -e "\033[0;32m  -> .agents: $added added, $updated updated, $kept of your own versions kept\033[0m"
if [ "$kept" -gt 0 ] && [ "$UPDATE" != "1" ]; then
    echo -e "\033[0;33m     Re-run with AGENT_SETUP_UPDATE=1 to take the template versions (yours are backed up first).\033[0m"
fi
if [ ${#backed_up[@]} -gt 0 ]; then
    echo -e "\033[0;33m  -> Your previous versions are in $BACKUP_DIR. Merge back anything project-specific:\033[0m"
    printf '       %s\n' "${backed_up[@]}"
fi

# Install CI workflow if not present
if [ ! -f ".github/workflows/ci.yml" ]; then
    mkdir -p .github/workflows
    cp "$TEMP_DIR/.github/workflows/ci.yml" .github/workflows/
    echo -e "\033[0;32m  -> Installed .github/workflows/ci.yml\033[0m"
fi

echo -e "\n\033[0;36mInstallation completed successfully! Your agent is ready with Vercel React Best Practices, Token Efficiency, and Git Workflow rules.\033[0m"

#!/usr/bin/env bash
# Azwar's Agent Setup Installer for macOS / Linux / Git Bash
set -e

echo -e "\033[0;36mInstalling Azwar's Agent Setup Template...\033[0m"

REPO_URL="https://github.com/AlifAzwar/agent-setup-public.git"
TEMP_DIR=$(mktemp -d)

trap 'rm -rf "$TEMP_DIR"' EXIT

git clone --depth 1 "$REPO_URL" "$TEMP_DIR" --quiet

# Install AGENTS.md
cp "$TEMP_DIR/AGENTS.md" ./
echo -e "\033[0;32m  -> Installed AGENTS.md\033[0m"

# Install .agents directory
cp -r "$TEMP_DIR/.agents" ./
echo -e "\033[0;32m  -> Installed .agents (rules & skills)\033[0m"

# Install CI workflow if not present
if [ ! -f ".github/workflows/ci.yml" ]; then
    mkdir -p .github/workflows
    cp "$TEMP_DIR/.github/workflows/ci.yml" .github/workflows/
    echo -e "\033[0;32m  -> Installed .github/workflows/ci.yml\033[0m"
fi

echo -e "\n\033[0;36mInstallation completed successfully! Your agent is ready with Vercel React Best Practices, Token Efficiency, and Git Workflow rules.\033[0m"

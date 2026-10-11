# Azwar's Agent Setup Installer for Windows PowerShell
Write-Host "Installing Azwar's Agent Setup Template..." -ForegroundColor Cyan

$repoUrl = "https://github.com/AlifAzwar/agent-setup-public.git"
$tempDir = Join-Path $env:TEMP ("agent-setup-" + [System.Guid]::NewGuid().ToString().Substring(0,8))

try {
    Write-Host "Fetching latest template files..." -ForegroundColor Gray
    git clone --depth 1 $repoUrl $tempDir --quiet
    
    # Copy AGENTS.md
    Copy-Item (Join-Path $tempDir "AGENTS.md") "AGENTS.md" -Force
    Write-Host "  -> Installed AGENTS.md" -ForegroundColor Green

    # Copy .agents
    Copy-Item (Join-Path $tempDir ".agents") ".agents" -Recurse -Force
    Write-Host "  -> Installed .agents (rules & skills)" -ForegroundColor Green

    # Copy CI workflow if not already present
    if (-not (Test-Path ".github/workflows/ci.yml")) {
        New-Item -ItemType Directory -Force -Path ".github/workflows" | Out-Null
        Copy-Item (Join-Path $tempDir ".github\workflows\ci.yml") ".github\workflows\ci.yml" -Force
        Write-Host "  -> Installed .github/workflows/ci.yml" -ForegroundColor Green
    }

    Write-Host "`nInstallation completed successfully! Your agent is now ready with Vercel React Best Practices, Token Efficiency, and Git Workflow rules." -ForegroundColor Cyan
} finally {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
}

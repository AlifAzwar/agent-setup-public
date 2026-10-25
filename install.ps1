# Azwar's Agent Setup Installer for Windows PowerShell
# Never overwrites files you already have. To refresh skills and rules from the template,
# set $env:AGENT_SETUP_UPDATE = "1" first (your AGENTS.md and filled references/project.md are still kept).
Write-Host "Installing Azwar's Agent Setup Template..." -ForegroundColor Cyan

$repoUrl = "https://github.com/AlifAzwar/agent-setup-public.git"
$tempDir = Join-Path $env:TEMP ("agent-setup-" + [System.Guid]::NewGuid().ToString().Substring(0,8))
$update = $env:AGENT_SETUP_UPDATE -eq "1"

try {
    Write-Host "Fetching latest template files..." -ForegroundColor Gray
    git clone --depth 1 $repoUrl $tempDir --quiet

    # AGENTS.md holds project-specific rules: keep an existing one, drop the template next to it
    if (Test-Path "AGENTS.md") {
        Copy-Item (Join-Path $tempDir "AGENTS.md") "AGENTS.template.md" -Force
        Write-Host "  -> AGENTS.md exists, kept it. Template saved as AGENTS.template.md to merge by hand." -ForegroundColor Yellow
    } else {
        Copy-Item (Join-Path $tempDir "AGENTS.md") "AGENTS.md"
        Write-Host "  -> Installed AGENTS.md" -ForegroundColor Green
    }

    # .agents: copy file by file so local skills and edits survive
    $added = 0; $updated = 0; $kept = 0
    $root = (Resolve-Path $tempDir).Path
    Get-ChildItem (Join-Path $root ".agents") -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($root.Length + 1)
        if (-not (Test-Path $rel)) {
            New-Item -ItemType Directory -Force -Path (Split-Path $rel) | Out-Null
            Copy-Item $_.FullName $rel
            $added++
        } elseif ($update -and $rel -notlike "*\references\project.md") {
            Copy-Item $_.FullName $rel -Force
            $updated++
        } else {
            $kept++
        }
    }
    Write-Host "  -> .agents: $added added, $updated updated, $kept existing files kept" -ForegroundColor Green
    if ($kept -gt 0 -and -not $update) {
        Write-Host '     Re-run with $env:AGENT_SETUP_UPDATE = "1" to refresh existing skills and rules.' -ForegroundColor Yellow
    }

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

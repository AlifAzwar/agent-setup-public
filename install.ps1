# Azwar's Agent Setup Installer for Windows PowerShell
# Never overwrites files you already have. To refresh skills and rules from the template,
# set $env:AGENT_SETUP_UPDATE = "1" first: changed files are backed up to .agents-backup\ first, and
# AGENTS.md and filled references/project.md are always kept.
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

    # .agents: copy file by file so local skills and edits survive.
    # In update mode a file that differs from the template is backed up before it is replaced.
    $backupDir = Join-Path ".agents-backup" (Get-Date -Format "yyyyMMdd-HHmmss")
    $added = 0; $updated = 0; $kept = 0; $backedUp = @()
    $root = (Resolve-Path $tempDir).Path
    Get-ChildItem (Join-Path $root ".agents") -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($root.Length + 1)
        if (-not (Test-Path $rel)) {
            New-Item -ItemType Directory -Force -Path (Split-Path $rel) | Out-Null
            Copy-Item $_.FullName $rel
            $added++
        } elseif ((Get-FileHash $_.FullName).Hash -eq (Get-FileHash $rel).Hash) {
            # identical, nothing to do
        } elseif ($update -and $rel -notlike "*\references\project.md") {
            $backup = Join-Path $backupDir $rel
            New-Item -ItemType Directory -Force -Path (Split-Path $backup) | Out-Null
            Copy-Item $rel $backup
            $backedUp += $rel
            Copy-Item $_.FullName $rel -Force
            $updated++
        } else {
            $kept++
        }
    }
    Write-Host "  -> .agents: $added added, $updated updated, $kept of your own versions kept" -ForegroundColor Green
    if ($kept -gt 0 -and -not $update) {
        Write-Host '     Re-run with $env:AGENT_SETUP_UPDATE = "1" to take the template versions (yours are backed up first).' -ForegroundColor Yellow
    }
    if ($backedUp.Count -gt 0) {
        Write-Host "  -> Your previous versions are in $backupDir. Merge back anything project-specific:" -ForegroundColor Yellow
        $backedUp | ForEach-Object { Write-Host "       $_" -ForegroundColor Yellow }
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

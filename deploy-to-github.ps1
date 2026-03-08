# LifeScore - Deploy to GitHub
# Run this script after installing Git: https://git-scm.com/download/win
# Replace YOUR_GITHUB_USERNAME and REPO_NAME with your own before running.

$repoUrl = "https://github.com/ajayjoyshekar/Lifescore.git"

Write-Host "LifeScore - GitHub deploy script" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

if ($repoUrl -match "YOUR_GITHUB_USERNAME") {
    Write-Host "Please edit this script and set repoUrl to your GitHub repo URL." -ForegroundColor Yellow
    Write-Host "Example: https://github.com/ajayj/lifescore.git" -ForegroundColor Gray
    exit 1
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
    Write-Host "Git repo initialized." -ForegroundColor Green
}

git add .
git status

$msg = Read-Host "`nCommit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Initial LifeScore app" }
git commit -m $msg

if (-not (git remote get-url origin 2>$null)) {
    git remote add origin $repoUrl
    Write-Host "Remote 'origin' added." -ForegroundColor Green
}

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`nDone! Your code is on GitHub." -ForegroundColor Green
Write-Host "Deploy to Vercel: https://vercel.com/new (import your repo)" -ForegroundColor Gray

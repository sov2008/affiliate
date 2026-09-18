# ==============================================================================
# Playwright Environment & Mirror Configuration Fix for Windows
# ==============================================================================

$env:PLAYWRIGHT_DOWNLOAD_HOST = "https://cdn.playwright.dev"
Write-Host "[PLAYWRIGHT-ENV] Set PLAYWRIGHT_DOWNLOAD_HOST to: $env:PLAYWRIGHT_DOWNLOAD_HOST" -ForegroundColor Cyan

Write-Host "[PLAYWRIGHT-ENV] Installing Playwright Chromium browser..." -ForegroundColor Yellow
npx playwright install chromium

if ($LASTEXITCODE -eq 0) {
    Write-Host "[PLAYWRIGHT-ENV] Chromium successfully installed and ready for headless E2E testing!" -ForegroundColor Green
} else {
    Write-Host "[PLAYWRIGHT-ENV] Playwright install encountered code: $LASTEXITCODE" -ForegroundColor Red
}

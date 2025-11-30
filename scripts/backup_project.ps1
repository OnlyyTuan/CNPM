param(
  [string]$ProjectRoot = (Resolve-Path -Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$OutDir = (Join-Path $ProjectRoot 'backups'),
  [string]$Prefix = 'backup'
)

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
$dest = Join-Path $OutDir ("$Prefix`_$ts.zip")

Write-Output "Creating backup of project root: $ProjectRoot"
Write-Output "Destination: $dest"

# Use Compress-Archive to zip entire project. Note: this will include node_modules and .git.
# If you want to exclude large folders, set $exclude = @('node_modules','.git') and copy selectively.
Compress-Archive -Path (Join-Path $ProjectRoot '*') -DestinationPath $dest -Force

if (Test-Path $dest) {
  Write-Output "✅ Backup created: $dest"
  exit 0
} else {
  Write-Error "❌ Failed to create backup"
  exit 1
}
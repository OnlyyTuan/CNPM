param(
  [string]$ProjectRoot = (Resolve-Path -Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$OutDir = (Join-Path $ProjectRoot 'backups'),
  [string[]]$ExcludeDirs = @('node_modules', '.git'),
  [string]$Prefix = 'backup_fast'
)

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
$tmp = Join-Path $env:TEMP ("cnpm_backup_tmp_$ts")
if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $tmp | Out-Null

Write-Output "Copying project files (excluding: $($ExcludeDirs -join ', ')) to temp folder: $tmp"

# Use robocopy to copy while excluding big folders
$exclusions = $ExcludeDirs -join ' '  # used in /XD
$source = $ProjectRoot
$dest = $tmp

# robocopy supports excluding dirs with /XD, but we need to pass them as separate args
$xdArgs = $ExcludeDirs | ForEach-Object { '"' + $_ + '"' }
$xdString = $ExcludeDirs -join ' '

# Build robocopy command
$robocopyCmd = "robocopy `"$source`" `"$dest`" /MIR /XD " + ($ExcludeDirs -join ' ')
Write-Output "Running: $robocopyCmd"
cmd /c $robocopyCmd | Out-Null

# Create ZIP
$destZip = Join-Path $OutDir ("$Prefix`_$ts.zip")
Write-Output "Compressing to: $destZip"
try {
  Compress-Archive -Path (Join-Path $tmp '*') -DestinationPath $destZip -Force -ErrorAction Stop
  Write-Output "✅ Backup created: $destZip"
  # Cleanup temp
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  exit 0
} catch {
  Write-Error "❌ Backup failed: $($_.Exception.Message)"
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  exit 1
}
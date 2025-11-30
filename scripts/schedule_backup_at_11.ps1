param(
  [string]$BackupScript = (Resolve-Path (Join-Path $PSScriptRoot 'backup_project.ps1')).Path,
  [string]$TaskName = 'CNPM_Backup',
  [string]$Time = '11:00',
  [string]$Date = (Get-Date).ToString('yyyy-MM-dd')
)

$action = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$BackupScript`""
Write-Output "Scheduling one-time task '$TaskName' to run: $action at $Date $Time"

# Create scheduled task using schtasks
$schtasks = "schtasks /Create /SC ONCE /TN `"$TaskName`" /TR `"$action`" /ST $Time /SD $Date /F"
Write-Output "Running: $schtasks"
cmd /c $schtasks

if ($LASTEXITCODE -eq 0) {
  Write-Output "✅ Scheduled task created."
} else {
  Write-Error "❌ Failed to create scheduled task. Exit code: $LASTEXITCODE"
}
<#
Run this script to create the `chat_message` table.
It will securely prompt for DB credentials, set them as environment variables for the duration
of the command, run the Node helper `backend/scripts/createChatTable.js`, then clear the vars.

Usage: run in PowerShell from repo root:
  cd "D:\SGU Nam 3 HK1\test cnpm\CNPM-trungkien"
  powershell -ExecutionPolicy Bypass -File .\scripts\run_create_chat_table.ps1
#>

param(
  [string]$DefaultHost = 'localhost',
  [string]$DefaultUser = 'root',
  [int]$DefaultPort = 3306,
  [string]$DefaultDb = 'smartschoolbus'
)

Write-Host "This will run backend/scripts/createChatTable.js with the DB credentials you provide." -ForegroundColor Cyan

$host = Read-Host "DB host" -Default $DefaultHost
$user = Read-Host "DB user" -Default $DefaultUser
$securePass = Read-Host -AsSecureString "DB password"
$db = Read-Host "DB name" -Default $DefaultDb
$port = Read-Host "DB port" -Default $DefaultPort

# Convert SecureString to plain text for setting env (only in this session)
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
try {
    $plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
} finally {
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

# Export env vars for the child process only
$env:DB_HOST = $host
$env:DB_USER = $user
$env:DB_PASSWORD = $plainPass
$env:DB_NAME = $db
$env:DB_PORT = "$port"

Write-Host "Running createChatTable.js..." -ForegroundColor Yellow

# Run node script
$nodeExe = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $nodeExe) {
  Write-Error "Node.js not found in PATH. Install Node.js or run the command manually."
  exit 1
}

Push-Location (Join-Path $PSScriptRoot '..\backend')
try {
  $proc = Start-Process -FilePath $nodeExe.Path -ArgumentList 'scripts/createChatTable.js' -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$PSScriptRoot\create_chat_table_output.txt" -RedirectStandardError "$PSScriptRoot\create_chat_table_error.txt"
  Write-Host "Process finished with exit code: $($proc.ExitCode)"
  if (Test-Path "$PSScriptRoot\create_chat_table_output.txt") {
    Get-Content "$PSScriptRoot\create_chat_table_output.txt" | Out-Host
  }
  if (Test-Path "$PSScriptRoot\create_chat_table_error.txt") {
    Write-Host "--- STDERR ---" -ForegroundColor Red
    Get-Content "$PSScriptRoot\create_chat_table_error.txt" | Out-Host
  }
} finally {
  Pop-Location
  # Clear sensitive env var
  Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:DB_USER -ErrorAction SilentlyContinue
  Remove-Item Env:DB_HOST -ErrorAction SilentlyContinue
  Remove-Item Env:DB_NAME -ErrorAction SilentlyContinue
  Remove-Item Env:DB_PORT -ErrorAction SilentlyContinue
}

if ($proc.ExitCode -ne 0) {
  Write-Error "createChatTable script failed. Check output above and files under scripts/"
  exit $proc.ExitCode
}

Write-Host "✅ createChatTable finished successfully (or reported success)." -ForegroundColor Green

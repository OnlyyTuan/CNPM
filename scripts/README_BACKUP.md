Backup helper scripts

Files added:
- `scripts/backup_project.ps1` - create a timestamped ZIP of the project into `backups/` (default). Uses `Compress-Archive` (PowerShell).
- `scripts/schedule_backup_at_11.ps1` - create a one-time Windows Scheduled Task that runs the backup script at 11:00 on the current date.

How to run backup now (PowerShell):

```powershell
# from repository root
cd "D:\SGU Nam 3 HK1\test cnpm\CNPM-trungkien"
# Run the backup script
powershell -ExecutionPolicy Bypass -File .\scripts\backup_project.ps1
```

How to schedule backup at 11:00 today:

```powershell
# from repository root
cd "D:\SGU Nam 3 HK1\test cnpm\CNPM-trungkien\scripts"
# This creates a scheduled task named CNPM_Backup that runs at 11:00 today
powershell -ExecutionPolicy Bypass -File .\schedule_backup_at_11.ps1
```

Notes and recommendations:
- `Compress-Archive` will include everything (including `node_modules` and `.git`). If your project is large, consider editing `backup_project.ps1` to exclude large folders by copying selected files to a temporary folder then zipping that folder.
- Creating a scheduled task may require appropriate user permissions.
- If you want me to also exclude `node_modules` and `.git` by default, I can update the script to create a temporary copy with exclusions before compressing.
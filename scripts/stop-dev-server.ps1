$ErrorActionPreference = 'Stop'

$ports = @(43127)
$connections = @(
	Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
		Where-Object { $ports -contains $_.LocalPort }
)
$pids = @(
	$connections |
		Select-Object -ExpandProperty OwningProcess -Unique |
		Where-Object { $_ -and $_ -gt 0 }
)

if ($pids.Count -eq 0) {
	Write-Output 'No dev server found on port 43127.'
	exit 0
}

foreach ($processId in $pids) {
	try {
		Stop-Process -Id $processId -Force -ErrorAction Stop
		Write-Output "Stopped PID $processId"
	} catch {
		Write-Output "Failed to stop PID ${processId}: $($_.Exception.Message)"
	}
}

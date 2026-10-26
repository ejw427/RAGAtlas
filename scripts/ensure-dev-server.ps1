param(
	[int]$TimeoutSeconds = 90
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$port = 43127
$url = "http://127.0.0.1:$port/"

function Test-PortListening([int]$Port) {
	return [bool](
		Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
			Select-Object -First 1
	)
}

function Test-WebAppReady {
	try {
		$response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
		if ($response.StatusCode -eq 200) {
			return $true
		}
	} catch {
	}
	return $false
}

function Wait-ForWebApp([int]$TimeoutSeconds) {
	$deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
	while ([DateTime]::UtcNow -lt $deadline) {
		if (Test-WebAppReady) {
			Write-Host "RAGAtlas is serving on $url"
			return $true
		}
		Start-Sleep -Milliseconds 400
	}
	return $false
}

if (Test-WebAppReady) {
	Write-Host "Dev server already running on port $port."
	exit 0
}

if (-not (Test-PortListening $port)) {
	Write-Host "Starting Next.js dev server on port $port..."
	Start-Process -FilePath 'cmd.exe' `
		-ArgumentList @('/c', "npm run dev -- -p $port -H 127.0.0.1") `
		-WorkingDirectory $repoRoot `
		-WindowStyle Minimized | Out-Null
} else {
	Write-Host "Port $port is listening; waiting for Next.js to serve the app..."
}

if (-not (Wait-ForWebApp $TimeoutSeconds)) {
	throw "Dev server did not become ready on port $port. Try Rebuild or run: npm run dev -- -p $port -H 127.0.0.1"
}

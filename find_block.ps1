$f = 'src\pages\AdminDashboard.jsx'
$lines = Get-Content $f

# Find the start line (if (!isAdminAuthenticated)) and end line (closing })
$startLine = -1
$endLine = -1

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($startLine -eq -1 -and $lines[$i] -match '^\s+if \(!isAdminAuthenticated\) \{') {
        $startLine = $i
    }
    # Find the closing line: line with just "  }" that comes after the reset block
    if ($startLine -ne -1 -and $endLine -eq -1 -and $i -gt ($startLine + 50)) {
        if ($lines[$i] -match "^\s+\}\s*$" -and $lines[$i+1] -match "^\s*$" -and $lines[$i+2] -match "return \(") {
            $endLine = $i
            break
        }
    }
}

Write-Host "Start: $($startLine+1), End: $($endLine+1)"

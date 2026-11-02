param (
    [string]$cmd
)
$key = "$PSScriptRoot\..\do_key.pem"
$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = "ssh.exe"
$pinfo.Arguments = "-i `"$key`" -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@178.128.199.28 `"$cmd`""
$pinfo.RedirectStandardOutput = $true
$pinfo.RedirectStandardError = $true
$pinfo.UseShellExecute = $false
$pinfo.CreateNoWindow = $true

$p = New-Object System.Diagnostics.Process
$p.StartInfo = $pinfo
[void]$p.Start()
$stdout = $p.StandardOutput.ReadToEnd()
$stderr = $p.StandardError.ReadToEnd()
[void]$p.WaitForExit(30000)

if ($stdout) { [Console]::Out.Write($stdout) }
if ($stderr) { [Console]::Error.Write($stderr) }
exit $p.ExitCode

# ============================================================
#  gen-passwords.ps1
#  Automatically generates random passwords and creates .env file on Windows
# ============================================================

$ErrorActionPreference = "Stop"

if (-not (Test-Path .env)) {
    Write-Output "Creating .env file from .env.template..."
    Copy-Item .env.template .env
} else {
    Write-Output ".env file already exists. Generating new passwords on top of it..."
}

function Get-RandomPassword {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $random = New-Object System.Random
    $pass = ""
    for ($i = 0; $i -lt 32; $i++) {
        $pass += $chars[$random.Next(0, $chars.Length)]
    }
    return $pass
}

Write-Output "Generating random passwords..."
$envContent = Get-Content .env -Raw

$replacements = @(
    @("CHANGE_ME_JICOFO_PASSWORD", (Get-RandomPassword)),
    @("CHANGE_ME_COMPONENT_SECRET", (Get-RandomPassword)),
    @("CHANGE_ME_JVB_PASSWORD", (Get-RandomPassword)),
    @("CHANGE_ME_JIBRI_XMPP_PASSWORD", (Get-RandomPassword)),
    @("CHANGE_ME_JIBRI_RECORDER_PASSWORD", (Get-RandomPassword)),
    @("CHANGE_ME_JIGASI_PASSWORD", (Get-RandomPassword))
)

foreach ($item in $replacements) {
    $envContent = $envContent.Replace($item[0], $item[1])
}

# Auto-replace IP if specified
$ipAddress = "103.190.38.46"
if ($ipAddress) {
    Write-Output "Setting server IP address to $ipAddress..."
    $envContent = $envContent.Replace("DOCKER_HOST_ADDRESS=YOUR_SERVER_IP", "DOCKER_HOST_ADDRESS=$ipAddress")
    $envContent = $envContent.Replace("JVB_ADVERTISE_IPS=YOUR_SERVER_IP", "JVB_ADVERTISE_IPS=$ipAddress")
    $envContent = $envContent.Replace("PUBLIC_URL=https://YOUR_SERVER_IP:8070", "PUBLIC_URL=https://$ipAddress:8070")
}

Set-Content -Path .env -Value $envContent -Encoding UTF8
Write-Output "Successfully set up .env file!"

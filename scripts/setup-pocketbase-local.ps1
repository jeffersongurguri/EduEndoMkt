# Script para inicializar e configurar a base de dados do PocketBase
param(
    [string]$AdminEmail = "admin@eduendomkt.local",
    [string]$AdminPassword = "AdminEduMkt2026!"
)

$ErrorActionPreference = "Stop"
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PB_DIR = Join-Path $ROOT_DIR "pocketbase_bin"
$PB_EXE = Join-Path $PB_DIR "pocketbase.exe"

Write-Host "`n🎒 Inicializando base de dados do PocketBase..." -ForegroundColor Yellow

if (-not (Test-Path $PB_EXE)) {
    Write-Host "PocketBase não encontrado. Executando download inicial..." -ForegroundColor Cyan
    $PB_VERSION = "0.22.20"
    $ZIP_PATH = Join-Path $PB_DIR "pb.zip"
    $DOWNLOAD_URL = "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_windows_amd64.zip"
    New-Item -ItemType Directory -Path $PB_DIR -Force | Out-Null
    Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $ZIP_PATH
    Expand-Archive -Path $ZIP_PATH -DestinationPath $PB_DIR -Force
    Remove-Item -Path $ZIP_PATH -Force
}

# Executa migrações
Push-Location $PB_DIR
try {
    Write-Host "Aplicando migrações das coleções..." -ForegroundColor Cyan
    & .\pocketbase.exe migrate up

    Write-Host "Garantindo superusuário de administração..." -ForegroundColor Cyan
    & .\pocketbase.exe admin create $AdminEmail $AdminPassword 2>$null
    Write-Host "Admin configurado: $AdminEmail" -ForegroundColor Green
} catch {
    Write-Host "Nota: $($_.Exception.Message)" -ForegroundColor Yellow
} finally {
    Pop-Location
}

Write-Host "`n✅ Base de dados criada com sucesso!" -ForegroundColor Green
Write-Host "Arquivo SQLite: $PB_DIR\pb_data\data.db" -ForegroundColor Cyan
Write-Host "Painel de Administração: http://127.0.0.1:8090/_/" -ForegroundColor Yellow
Write-Host "E-mail Admin: $AdminEmail" -ForegroundColor Yellow
Write-Host "Senha Admin:  $AdminPassword`n" -ForegroundColor Yellow

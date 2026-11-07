# Script para iniciar o servidor do PocketBase local
$ROOT_DIR = Split-Path -Parent $PSScriptRoot
$PB_DIR = Join-Path $ROOT_DIR "pocketbase_bin"
$PB_EXE = Join-Path $PB_DIR "pocketbase.exe"

Write-Host "`n🎒 EndoMkt Edu - Iniciando PocketBase Local" -ForegroundColor Yellow

if (-not (Test-Path $PB_EXE)) {
    Write-Host "PocketBase não encontrado. Executando setup inicial..." -ForegroundColor Cyan
    & (Join-Path $PSScriptRoot "setup-pocketbase-local.ps1")
}

Write-Host "Iniciando PocketBase na porta 8090..." -ForegroundColor Cyan
Write-Host "Painel de administração disponível em: http://127.0.0.1:8090/_/" -ForegroundColor Yellow
Write-Host "Login: admin@eduendomkt.local" -ForegroundColor Yellow
Write-Host "Senha: AdminEduMkt2026!`n" -ForegroundColor Yellow

Set-Location $PB_DIR
& .\pocketbase.exe serve --http="127.0.0.1:8090"

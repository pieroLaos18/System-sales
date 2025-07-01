# Script de verificación de configuración para Windows
Write-Host "🔍 Verificando configuración del sistema..." -ForegroundColor Cyan
Write-Host ""

# Verificar frontend
Write-Host "📱 FRONTEND (Puerto 5174)" -ForegroundColor Yellow
$frontendEnv = Get-Content "frontend\.env" -ErrorAction SilentlyContinue
if ($frontendEnv) {
    $apiUrl = $frontendEnv | Select-String "VITE_API_URL"
    Write-Host "VITE_API_URL: $apiUrl"
} else {
    Write-Host "❌ Archivo frontend/.env no encontrado" -ForegroundColor Red
}

$viteConfig = Get-Content "frontend\vite.config.js" -ErrorAction SilentlyContinue
if ($viteConfig) {
    $proxy = $viteConfig | Select-String "target.*localhost"
    Write-Host "Proxy en vite.config.js: $proxy"
}
Write-Host ""

# Verificar backend
Write-Host "🚀 BACKEND" -ForegroundColor Yellow
$serverJs = Get-Content "backend\src\server.js" -ErrorAction SilentlyContinue
if ($serverJs) {
    $port = $serverJs | Select-String "PORT.*="
    Write-Host "Puerto configurado en server.js: $port"
}

$backendEnvExists = Test-Path "backend\.env"
Write-Host "¿Archivo backend/.env existe?: $(if ($backendEnvExists) {'Sí'} else {'No'})"
if ($backendEnvExists) {
    $backendEnv = Get-Content "backend\.env"
    $envPort = $backendEnv | Select-String "PORT"
    Write-Host "PORT en .env: $envPort"
}
Write-Host ""

# Verificar procesos corriendo
Write-Host "🔧 PROCESOS ACTIVOS" -ForegroundColor Yellow
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue

Write-Host "Puerto 3001: $(if ($port3001) {'En uso'} else {'Libre'})"
Write-Host "Puerto 5000: $(if ($port5000) {'En uso'} else {'Libre'})"
Write-Host "Puerto 5174: $(if ($port5174) {'En uso'} else {'Libre'})"
Write-Host ""

Write-Host "✅ Para solucionar el problema de imágenes:" -ForegroundColor Green
Write-Host "1. Asegúrate que el backend esté corriendo en puerto 3001"
Write-Host "2. Reinicia el frontend después de cambiar .env"
Write-Host "3. Verifica que VITE_API_URL=http://localhost:3001"
Write-Host "4. Reinicia ambos servidores para aplicar los cambios"

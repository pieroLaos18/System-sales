#!/bin/bash

echo "🔍 Verificando configuración del sistema..."
echo ""

# Verificar frontend
echo "📱 FRONTEND (Puerto 5174)"
echo "VITE_API_URL: $(grep VITE_API_URL frontend/.env)"
echo "Proxy en vite.config.js: $(grep -A2 "target:" frontend/vite.config.js)"
echo ""

# Verificar backend
echo "🚀 BACKEND"
echo "Puerto configurado en server.js: $(grep "PORT.*=" backend/src/server.js)"
echo "¿Archivo .env existe?: $([ -f backend/.env ] && echo "Sí" || echo "No")"
if [ -f backend/.env ]; then
    echo "PORT en .env: $(grep PORT backend/.env)"
fi
echo ""

# Verificar procesos corriendo
echo "🔧 PROCESOS ACTIVOS"
echo "Puerto 3001: $(lsof -ti:3001 > /dev/null && echo "En uso" || echo "Libre")"
echo "Puerto 5000: $(lsof -ti:5000 > /dev/null && echo "En uso" || echo "Libre")"
echo "Puerto 5174: $(lsof -ti:5174 > /dev/null && echo "En uso" || echo "Libre")"
echo ""

echo "✅ Para solucionar el problema de imágenes:"
echo "1. Asegúrate que el backend esté corriendo en puerto 3001"
echo "2. Reinicia el frontend después de cambiar .env"
echo "3. Verifica que VITE_API_URL=http://localhost:3001"

$env:PATH = "D:\Portable_Dev_Environment\node;D:\Portable_Dev_Environment\npm-global;D:\Portable_Dev_Environment\git\cmd;" + $env:PATH
Write-Host "✅ Portable Environment Terhubung (Node.js $($($(node -v))), NPM $($($(npm -v))))" -ForegroundColor Green
Write-Host "🚀 Menjalankan Server RoveClip..." -ForegroundColor Cyan
npm run dev

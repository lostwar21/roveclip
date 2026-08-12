@echo off
echo [INFO] Mengaktifkan Portable Environment...
set PATH=D:\Portable_Dev_Environment\node;D:\Portable_Dev_Environment\npm-global;D:\Portable_Dev_Environment\git\cmd;%PATH%

echo [INFO] Node.js Version:
node -v
echo [INFO] NPM Version:
call npm -v

echo [INFO] Menjalankan Server RoveClip...
call npm run dev

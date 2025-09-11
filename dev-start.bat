@echo off
echo Iniciando limpeza e desenvolvimento...

REM Mata processos Node se estiverem rodando
taskkill /f /im node.exe 2>nul

REM Remove diretórios problemáticos
if exist ".next" (
    echo Removendo .next...
    rmdir /s /q ".next" 2>nul
)

if exist "node_modules\.cache" (
    echo Removendo cache do node_modules...
    rmdir /s /q "node_modules\.cache" 2>nul
)

REM Espera um pouco para garantir que os arquivos foram liberados
timeout /t 2 /nobreak >nul

REM Inicia o desenvolvimento
echo Iniciando servidor de desenvolvimento...
npm run dev

pause

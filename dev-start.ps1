# Script PowerShell para iniciar o desenvolvimento de forma robusta
param(
    [switch]$Force
)

Write-Host "🧹 Iniciando limpeza e desenvolvimento..." -ForegroundColor Cyan

# Função para verificar se o Next.js está rodando
function Test-NextProcess {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Next.js*" -or $_.CommandLine -like "*next dev*" }
    return $processes.Count -gt 0
}

# Para processos Node se necessário
if (Test-NextProcess -or $Force) {
    Write-Host "⏹️  Parando processos Node.js..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Remove diretórios problemáticos
$pathsToClean = @(".next", "node_modules\.cache", ".next\cache")
foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Write-Host "🗑️  Removendo $path..." -ForegroundColor Yellow
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "✅ $path removido com sucesso" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Erro ao remover $path : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Verifica se há problemas de permissão
Write-Host "🔍 Verificando permissões..." -ForegroundColor Cyan
$currentDir = Get-Location
$acl = Get-Acl $currentDir
if (-not $acl.Access.Where({$_.IdentityReference -eq [System.Security.Principal.WindowsIdentity]::GetCurrent().Name -and $_.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::FullControl})) {
    Write-Host "⚠️  Aviso: Pode haver problemas de permissão neste diretório" -ForegroundColor Yellow
}

# Espera para garantir que os arquivos foram liberados
Write-Host "⏳ Aguardando liberação de arquivos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Verifica se o projeto está em uma pasta do OneDrive
if ($PWD.Path -like "*OneDrive*") {
    Write-Host "⚠️  AVISO: Projeto detectado em pasta do OneDrive!" -ForegroundColor Yellow
    Write-Host "   Isso pode causar problemas recorrentes com symlinks." -ForegroundColor Yellow
    Write-Host "   Considere mover o projeto para uma pasta local (ex: C:\Dev\)" -ForegroundColor Yellow
    Write-Host ""
}

# Inicia o desenvolvimento
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
try {
    npm run dev
}
catch {
    Write-Host "❌ Erro ao iniciar o servidor: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Tente executar 'npm install' primeiro" -ForegroundColor Yellow
}

$ErrorActionPreference = "Stop"

$PastaPacote = $PSScriptRoot
$Projeto = Split-Path -Parent $PastaPacote
$Carimbo = Get-Date -Format "yyyyMMdd-HHmmss"
$Backup = Join-Path $Projeto "backup-revisao-backend-frontend-$Carimbo"

$Arquivos = @(
    "backend/src/controllers/clienteController.ts",
    "backend/src/controllers/funcionarioController.ts",
    "backend/src/controllers/produtoController.ts",
    "backend/src/controllers/vendaController.ts",
    "backend/src/routes/produtosRoutes.ts",
    "backend/src/services/authService.ts",
    "backend/src/services/clienteService.ts",
    "backend/src/services/funcionarioService.ts",
    "backend/src/services/produtoService.ts",
    "backend/src/services/usuarioService.ts",
    "backend/src/services/vendaService.ts",
    "backend/src/utils/numero.ts",
    "backend/src/utils/paginacao.ts",
    "frontend/src/App.tsx",
    "frontend/src/contexts/AuthContext.tsx",
    "frontend/src/contexts/authContextCore.ts"
)

Write-Host "`n===== CONFERINDO ARQUIVOS =====" -ForegroundColor Cyan
foreach ($Arquivo in $Arquivos) {
    $Origem = Join-Path $PastaPacote $Arquivo
    $Destino = Join-Path $Projeto $Arquivo
    if (-not (Test-Path $Origem -PathType Leaf)) {
        throw "Arquivo do pacote não encontrado: $Origem"
    }
    # Alguns arquivos do pacote são novos (por exemplo, utils/numero.ts).
    # A ausência do original é permitida; nesse caso ele será criado sem backup.
}

New-Item -ItemType Directory -Path $Backup | Out-Null
Write-Host "Backup: $Backup" -ForegroundColor Green

foreach ($Arquivo in $Arquivos) {
    $Origem = Join-Path $PastaPacote $Arquivo
    $Destino = Join-Path $Projeto $Arquivo
    $Copia = Join-Path $Backup $Arquivo
    New-Item -ItemType Directory -Path (Split-Path $Destino) -Force | Out-Null
    if (Test-Path $Destino -PathType Leaf) {
        New-Item -ItemType Directory -Path (Split-Path $Copia) -Force | Out-Null
        Copy-Item $Destino $Copia -Force
    }
    Copy-Item $Origem $Destino -Force
    Write-Host "Atualizado: $Arquivo" -ForegroundColor Gray
}

function Executar-Npm {
    param(
        [Parameter(Mandatory = $true)][string]$Pasta,
        [Parameter(Mandatory = $true)][string]$Comando
    )
    Push-Location (Join-Path $Projeto $Pasta)
    try {
        Write-Host "`n===== $Pasta : npm run $Comando =====" -ForegroundColor Cyan
        npm run $Comando
        if ($LASTEXITCODE -ne 0) {
            throw "Falha em npm run $Comando dentro de $Pasta (código $LASTEXITCODE). O backup foi preservado."
        }
    }
    finally {
        Pop-Location
    }
}

Executar-Npm -Pasta "backend" -Comando "build"
Executar-Npm -Pasta "frontend" -Comando "build"
Executar-Npm -Pasta "frontend" -Comando "lint"

Write-Host "`n===== CORRECOES APLICADAS E VALIDACOES CONCLUIDAS =====" -ForegroundColor Green
Write-Host "Backup preservado em: $Backup" -ForegroundColor Green

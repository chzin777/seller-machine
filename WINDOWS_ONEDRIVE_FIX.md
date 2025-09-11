# Configuração para resolver problemas do Next.js no Windows/OneDrive

## O PROBLEMA PRINCIPAL: 
Seu projeto está localizado em uma pasta sincronizada do OneDrive:
`C:\Users\ChristoferHenrique\OneDrive - R3 Suprimentos Corporativos Ltda\Documentos\Projetos\Others\seller-machine`

O OneDrive interfere com os symlinks e arquivos temporários do Next.js, causando o erro recorrente:
`Error: EINVAL: invalid argument, readlink`

## SOLUÇÕES RECOMENDADAS (em ordem de preferência):

### 1. SOLUÇÃO DEFINITIVA - Mover o projeto para fora do OneDrive:
```bash
# Crie uma pasta local para desenvolvimento
mkdir C:\Dev
# Mova ou copie o projeto para lá
# Isso resolve o problema permanentemente
```

### 2. SOLUÇÃO TEMPORÁRIA - Excluir pasta do OneDrive:
- Clique com botão direito na pasta do projeto
- Selecione "Sempre manter neste dispositivo"
- Ou exclua temporariamente do OneDrive (sem deletar os arquivos)

### 3. SOLUÇÃO DE CONTORNO - Scripts robustos:
Use os scripts criados:
```bash
npm run dev:safe    # Limpa tudo e inicia com delay
./dev-start.ps1     # Script PowerShell mais robusto
```

## SCRIPTS CRIADOS:

### package.json scripts:
- `npm run clean:full` - Limpeza completa
- `npm run dev:safe` - Desenvolvimento seguro  
- `npm run reset` - Reset completo com reinstalação

### Arquivos de script:
- `dev-start.bat` - Script batch para Windows
- `dev-start.ps1` - Script PowerShell avançado

## CONFIGURAÇÕES APLICADAS:

### next.config.ts:
- Removidas configurações experimentais problemáticas
- Simplificada para máxima compatibilidade
- Mantidas apenas otimizações essenciais

### .env.local:
- URLs duplicadas comentadas (isso pode causar confusão)

### .gitignore:
- Adicionadas entradas específicas para Windows/OneDrive
- Cache directories mais abrangentes
- Proteção contra arquivos temporários

## RECOMENDAÇÃO FINAL:
**Mova o projeto para `C:\Dev\seller-machine`** para resolver o problema definitivamente.
O OneDrive não é ideal para projetos de desenvolvimento devido aos conflitos com symlinks e arquivos temporários.

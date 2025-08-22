# Mapa de Calor de Vendas - Seller Machine

## 📍 Visão Geral

O **Mapa de Calor de Vendas** é uma nova funcionalidade que permite visualizar geograficamente a distribuição das suas vendas, proporcionando insights valiosos sobre a performance comercial por região.

## 🚀 Como Acessar

1. No menu lateral da aplicação, clique em **"Mapa de Vendas"**
2. A página carregará automaticamente os dados de vendas e clientes
3. O mapa será exibido com as regiões destacadas conforme a intensidade das vendas

## 🎯 Funcionalidades

### 📊 Cartões de Estatísticas
- **Receita Total**: Soma de todas as vendas por região
- **Total de Clientes**: Número total de clientes cadastrados
- **Total de Vendas**: Quantidade total de transações

### 🗺️ Mapa Interativo
- **Círculos Proporcionais**: O tamanho dos círculos representa o volume de receita
- **Cores por Intensidade**:
  - 🔴 **Vermelho**: Alta concentração de clientes
  - 🟠 **Laranja**: Média concentração
  - 🟡 **Amarelo**: Baixa concentração  
  - 🟢 **Verde**: Muito baixa concentração

### 💬 Popups Informativos
Ao clicar em qualquer região no mapa, você verá:
- Nome da cidade e estado
- Número de clientes na região
- Quantidade de vendas
- Receita total gerada

### 📋 Tabela Detalhada
Uma tabela completa com todos os dados por região, incluindo:
- Cidade e Estado
- Número de Clientes
- Quantidade de Vendas
- Receita Total

## 🔧 Como Funciona

### Fonte de Dados
O mapa utiliza informações de:
- **Clientes cadastrados**: Para obter localização (cidade/estado)
- **Vendas por filial**: Para calcular receitas e volumes
- **Coordenadas geográficas**: Mapeamento automático das cidades brasileiras

### Processamento
1. Os dados de clientes são agrupados por cidade/estado
2. As vendas são correlacionadas com as localizações
3. Coordenadas geográficas são atribuídas automaticamente
4. Os dados são normalizados para criar a visualização

## 🎨 Personalização

### Cores e Tamanhos
- O tamanho dos círculos é proporcional à receita (5px a 50px)
- As cores seguem uma escala baseada na concentração de clientes
- A legenda explicativa está sempre visível no mapa

### Responsividade
- Layout adaptável para desktop, tablet e mobile
- Skeleton loading durante carregamento
- Interface otimizada para diferentes tamanhos de tela

## 📈 Benefícios de Negócio

### Identificação de Oportunidades
- Visualize regiões com potencial de crescimento
- Identifique áreas com baixa penetração
- Compare performance entre diferentes localidades

### Otimização de Recursos
- Direcione esforços de marketing para regiões promissoras
- Ajuste estratégias regionais baseadas em dados reais
- Identifique necessidade de expansão ou redistribuição

### Tomada de Decisão
- Decisões baseadas em visualização geográfica clara
- Compreensão rápida da distribuição de vendas
- Identificação de padrões geográficos de consumo

## 🛠️ Tecnologias Utilizadas

- **React/Next.js**: Interface e componentes
- **Leaflet**: Biblioteca de mapas interativos
- **OpenStreetMap**: Tiles do mapa
- **TypeScript**: Tipagem e desenvolvimento
- **Tailwind CSS**: Estilização responsiva

## 📱 Compatibilidade

✅ **Desktop**: Experiência completa
✅ **Tablet**: Layout adaptado
✅ **Mobile**: Interface otimizada
✅ **Navegadores**: Chrome, Firefox, Safari, Edge

## 🔄 Atualizações Automáticas

O mapa é atualizado automaticamente sempre que:
- Novos clientes são cadastrados
- Novas vendas são registradas
- Dados de filiais são modificados

Os dados são carregados em tempo real da API, garantindo informações sempre atualizadas.

---

**💡 Dica**: Use o mapa de calor em conjunto com outros relatórios da plataforma para uma análise completa do seu negócio!

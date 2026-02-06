# Gestão de Demandas - Apadrinha Paraná

App web para criar e gerenciar demandas/tarefas, com formulário de nova demanda e lista de minhas tarefas com filtros.

**Site (GitHub Pages):** [https://narleysousa.github.io/ApadrinhaParana/](https://narleysousa.github.io/ApadrinhaParana/)

## Funcionalidades

- **Nova Demanda**: formulário com título da tarefa, projeto (com opção de adicionar novo), responsáveis (múltipla escolha), categoria, prioridade e descrição/justificativa.
- **Minhas Demandas**: resumo por prioridade (Alta, Média, Baixa).
- **Alerta de demanda antiga**: destaque para demandas criadas há mais de 14 dias.
- **Minhas Tarefas**: lista com busca, filtros por projeto, categoria, responsável e opção de ver finalizadas. Cada tarefa exibe progresso (barra e %), responsáveis e ações (ajustar progresso, marcar finalizada, excluir).

## Como rodar

```bash
git clone https://github.com/narleysousa/ApadrinhaParana.git
cd ApadrinhaParana
npm ci
npm run dev
```

Abra no navegador o endereço indicado (geralmente `http://localhost:5173`).

## Pré-requisitos

- Node.js 20+ (arquivo `.nvmrc` incluído)
- npm 10+

## Build

```bash
npm run build
```

Arquivos de produção ficam em `dist/`.

## Scripts disponíveis

- `npm run dev`: inicia ambiente local com hot reload.
- `npm run typecheck`: valida tipos TypeScript sem gerar arquivos.
- `npm run build`: roda typecheck e gera build de produção.
- `npm run preview`: serve o build localmente para conferência.

## Tecnologias

- React 18 + TypeScript
- Vite 5
- CSS com variáveis (tema claro, azul)

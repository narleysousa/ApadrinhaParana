# Gestão de Demandas - Apadrinha Paraná

App web para criar e gerenciar demandas/tarefas, com formulário de nova demanda e lista de minhas tarefas com filtros.

**Site (GitHub Pages):** **[https://narleysousa.github.io/ApadrinhaParana/](https://narleysousa.github.io/ApadrinhaParana/)**

> Use sempre o link acima. O endereço `narleysousa.github.io` (sem `/ApadrinhaParana/`) só funciona se você configurar o redirect (veja abaixo).

## Deploy no GitHub Pages

1. No repositório **ApadrinhaParana**, vá em **Settings** → **Pages**.
2. Em **Build and deployment** → **Source**, escolha **GitHub Actions** (não use "Deploy from a branch").
3. A cada push na branch `main`, o workflow **Deploy to GitHub Pages** faz o build e publica o site.
4. Se o deploy falhar, abra a aba **Actions**, clique na execução com erro e confira a mensagem.
5. Para repositório de projeto, abra com `/NOME_DO_REPO/` no final da URL (ex.: `/ApadrinhaParana/`).
6. Em **Settings → Actions → General**, deixe **Workflow permissions** em **Read and write permissions**.

### Checklist rápido de erro 404

- Se você abrir `https://narleysousa.github.io/` e receber 404, isso é esperado sem um repositório `narleysousa.github.io`.
- O app deste repo publica em `https://narleysousa.github.io/ApadrinhaParana/`.
- O build usa caminhos relativos, compatível com GitHub Pages em subpasta.
- Se o Pages estiver configurado para servir a branch em vez do artifact do Actions, a raiz redireciona para `dist/`.

**Site na raiz (narleysousa.github.io):**  
Se quiser que `narleysousa.github.io` redirecione para o app:
- Crie um repositório **narleysousa/narleysousa.github.io**.
- Copie o conteúdo de `docs/user-site-index.html` para um arquivo `index.html` na raiz desse repositório.
- Em **Settings** → **Pages** desse repo, use **Deploy from a branch**, branch `main`, pasta `/ (root)`.
- Assim, ao acessar `narleysousa.github.io`, o navegador será redirecionado para o app.

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

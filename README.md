# Gestão de Demandas - Apadrinha Paraná

App web para criar e gerenciar demandas/tarefas, com formulário de nova demanda e lista de minhas tarefas com filtros.

**Site (GitHub Pages):** **[https://narleysousa.github.io/ApadrinhaParana/](https://narleysousa.github.io/ApadrinhaParana/)**

> Use sempre o link completo com o nome do repositório. O endereço `usuario.github.io` (sem `/NomeDoRepo/`) só funciona se você configurar o redirect (veja abaixo).

## Rodando no GitHub (CI e Pages)

### Configuração inicial (uma vez)

1. No repositório, vá em **Settings** → **Pages**.
2. Em **Build and deployment** → **Source**, escolha **GitHub Actions** (não use "Deploy from a branch").
3. Em **Settings** → **Actions** → **General** → **Workflow permissions**, marque **Read and write permissions** e salve.

### O que acontece a cada push

- **Push ou PR na `main`**: o workflow **CI** roda typecheck e build (garante que o código compila).
- **Push na `main`**: o workflow **Deploy to GitHub Pages** faz o build e publica o site.

O **base path** (caminho do app na URL) é definido automaticamente pelo nome do repositório. Exemplos:

- Repo `ApadrinhaParana` → site em `https://SEU_USUARIO.github.io/ApadrinhaParana/`
- Repo `Demandas - Apadrinha paraná` → site em `https://SEU_USUARIO.github.io/Demandas---Apadrinha-paraná/` (espaços viram hífens na URL)

Se o deploy falhar, abra a aba **Actions**, clique na execução com erro e confira o log.

### Checklist rápido de erro 404

- Abrir `https://usuario.github.io/` (sem nome do repo) dá 404 — é esperado.
- O app fica em `https://usuario.github.io/NOME_DO_REPO/` (com barra no final).
- O projeto usa um **404.html** que redireciona links quebrados para a raiz do app.
- Se você renomear o repositório, o próximo deploy já usa o novo nome na URL.

### Site na raiz (usuario.github.io)

Se quiser que `usuario.github.io` redirecione para este app:

- Crie um repositório **usuario/usuario.github.io**.
- Copie o conteúdo de `docs/user-site-index.html` para um arquivo `index.html` na raiz desse repositório (e ajuste a URL dentro do arquivo para o seu repo).
- Em **Settings** → **Pages** desse repo, use **Deploy from a branch**, branch `main`, pasta `/ (root)`.
- Ao acessar `usuario.github.io`, o navegador será redirecionado para o app.

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

## Firebase (Firestore)

Crie um arquivo `.env.local` com:

```bash
VITE_FIREBASE_API_KEY=AIzaSyBzZtrFwdCiWX3VrUBN0vgNYV-0k3ghQO0
VITE_FIREBASE_AUTH_DOMAIN=apadrinha-parana.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apadrinha-parana
VITE_FIREBASE_STORAGE_BUCKET=apadrinha-parana.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=682179178976
VITE_FIREBASE_APP_ID=1:682179178976:web:48b6186a4a2b2decf5bb85
```

No Firebase Console, habilite o **Firestore Database** para o projeto `apadrinha-parana`.

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

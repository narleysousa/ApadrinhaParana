# Configurar Firebase MCP no Cursor

O MCP (Model Context Protocol) do Firebase permite que o assistente de IA no Cursor use Firestore, Storage e Authentication do seu projeto.

## 1. Chave de conta de serviço (Service Account)

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e selecione o projeto **apadrinha-parana**.
2. Vá em **Configurações do projeto** (ícone de engrenagem) → **Contas de serviço**.
3. Clique em **Gerar nova chave privada** e baixe o arquivo JSON.
4. Coloque o arquivo no projeto com o nome `serviceAccountKey.json` (na raiz do projeto) **ou** em qualquer pasta e anote o **caminho absoluto** (ex: `/Users/seu-usuario/Downloads/Demandas - Apadrinha paraná/serviceAccountKey.json`).

**Importante:** Esse arquivo não deve ser commitado (já está no `.gitignore`).

## 2. Ajustar o arquivo de configuração do MCP

O arquivo `.cursor/mcp.json` já foi criado com o MCP do Firebase. Você só precisa editar o caminho da chave:

1. Abra **Cursor** → **Settings** (⌘,) → **Tools & MCP** (ou abra direto o arquivo `.cursor/mcp.json`).
2. Em `SERVICE_ACCOUNT_KEY_PATH`, substitua `/CAMINHO/ABSOLUTO/para/serviceAccountKey.json` pelo **caminho absoluto** do seu arquivo de chave.

Exemplo (macOS):

```json
"SERVICE_ACCOUNT_KEY_PATH": "/Users/narleyalmeida/Downloads/Demandas - Apadrinha paraná/serviceAccountKey.json"
```

O `FIREBASE_STORAGE_BUCKET` já está como `apadrinha-parana.firebasestorage.app` (projeto atual). Se usar outro projeto, altere também.

## 3. Reiniciar o MCP no Cursor

- Feche e reabra o Cursor **ou**
- Em **Settings** → **Tools & MCP**, use a opção para recarregar os servidores MCP.

Depois disso, o assistente poderá usar as ferramentas do Firebase (Firestore, Storage, etc.) neste projeto.

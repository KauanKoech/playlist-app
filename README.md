# Playlist App (React + Vite + TypeScript + Redux)

Aplicação didática para a Avaliação I (TEP). Permite:
- Login estático (sessionStorage)
- Rotas protegidas
- CRUD de Playlists (LocalStorage, por usuário)
- Busca de músicas usando **TheAudioDB** com fallback de Top 10 por artista
- Estado global com **Redux Toolkit**

## ⚙️ Stack & Bibliotecas

- **Vite + React + TypeScript**
- **React Router** para rotas (públicas e privadas)
- **Redux Toolkit** + `react-redux` para estado global
- **Axios** para chamadas HTTP
- **LocalStorage / SessionStorage** para persistência no browser

## 🚀 Como rodar

```bash
# instalar dependências
yarn

# ambiente (opcional, usa default se não setar)
# echo VITE_AUDIO_DB_BASE_URL=https://www.theaudiodb.com/api/v1/json/2 > .env.local

# desenvolvimento
yarn dev

# checagem de tipos
yarn typecheck

# build de produção
yarn build && yarn preview

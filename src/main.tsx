// Importa dependências principais do React
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

// Importa o componente principal e configurações globais
import App from "./App";
import "./index.css";
import { store } from "./redux/store";

// Renderiza a aplicação React dentro da div root do HTML
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Disponibiliza o Redux para toda a aplicação */}
    <Provider store={store}>
      {/* Habilita o uso de rotas na aplicação */}
      <BrowserRouter>
        {/* Componente principal */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

import "./style.css";

const rootElement = document.querySelector("#app");

if (!rootElement) {
    throw new Error(
        "Не найден корневой элемент #app."
    );
}

/*
 * С этого момента содержимым #app полностью управляет React.
 * Старый императивный DOM-рендеринг больше не запускается.
 */
createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>
);

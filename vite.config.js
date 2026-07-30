import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    /*
     * На собственном сервере приложение находится в корне "/".
     * GitHub Pages временно используется для демонстрации и
     * размещает репозиторий по адресу "/js_and_ai/".
     *
     * Отдельный mode позволяет поддерживать оба варианта,
     * не меняя конфигурацию перед каждой публикацией.
     */
    const base =
        mode === "github-pages"
            ? "/js_and_ai/"
            : "/";

    return {
        base,
        plugins: [
            react(),
            tailwindcss(),
        ],
    };
});

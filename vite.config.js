import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

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
        resolve: {
            alias: {
                /*
                 * @ всегда указывает на папку src.
                 * Благодаря этому импорт не зависит от глубины файла:
                 *
                 * @/components/Card
                 *
                 * вместо хрупкого пути ../../components/Card.
                 */
                "@": fileURLToPath(
                    new URL("./src", import.meta.url)
                ),
            },
        },
        plugins: [
            react(),
            tailwindcss(),
        ],
    };
});

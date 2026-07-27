import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

/*
 * Vite читает этот файл во время npm run dev и npm run build.
 * Здесь находятся только настройки сборщика, а не приложения.
 */
export default defineConfig({
    // GitHub Pages публикует проект не в корне домена,
    // а по адресу /js_and_ai/. Vite использует base,
    // чтобы сформировать правильные пути к JS и CSS.
    base: "/js_and_ai/",
    // Плагин сканирует HTML и JS, находит Tailwind-классы
    // и добавляет необходимые стили в production-сборку.
    plugins: [tailwindcss()],
});

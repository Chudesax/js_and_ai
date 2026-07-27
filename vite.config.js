import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    // GitHub Pages публикует проект не в корне домена,
    // а по адресу /js_and_ai/. Vite использует base,
    // чтобы сформировать правильные пути к JS и CSS.
    base: "/js_and_ai/",
    plugins: [tailwindcss()],
});

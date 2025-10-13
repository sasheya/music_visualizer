import { defineConfig } from 'vite';
// import glsl from 'vite-plugin-glsl'; // Removed as it interferes with raw shader imports

export default defineConfig({
    plugins: [],
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});

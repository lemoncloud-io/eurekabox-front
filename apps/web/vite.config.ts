/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/web',

    define: {
        'process.env': {},
        ...(process.env.NODE_ENV === 'development' ? { global: 'window' } : {}),
    },

    resolve: {
        alias: {
            '@lemonote/assets': '/assets/src/index.ts',
            ...(process.env.NODE_ENV !== 'development'
                ? {
                      './runtimeConfig': './runtimeConfig.browser', // fix production build
                  }
                : {}),
        },
    },

    server: {
        port: 4200,
        host: 'localhost',
    },

    preview: {
        port: 4300,
        host: 'localhost',
    },

    plugins: [svgr(), react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
        sourcemap: process.env.VITE_ENV !== 'PROD',
        minify: 'terser',
        outDir: '../../dist/apps/web',
        reportCompressedSize: true,
        commonjsOptions: {
            include: [/node_modules/],
            extensions: ['.js', '.cjs'],
            strictRequires: true,
            // https://stackoverflow.com/questions/62770883/how-to-include-both-import-and-require-statements-in-the-bundle-using-rollup
            transformMixedEsModules: true,
        },
    },

    css: {
        modules: {
            localsConvention: 'camelCase',
        },
    },

    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest',
        },
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/apps/web',
            provider: 'v8',
        },
    },
});

/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_REGION?: string;
    VITE_ENV: string;
    VITE_PROJECT: string;
    VITE_SOCIAL_OAUTH_ENDPOINT: string;
    VITE_OAUTH_ENDPOINT: string;
    VITE_BACKEND_ENDPOINT: string;
    VITE_TRANSLATE_ENDPOINT: string;
    VITE_CONTENT_ENDPOINT: string;
    VITE_HOST: string;
    VITE_IMAGE_API_ENDPOINT: string;
    VITE_CHATBOTS_API_ENDPOINT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

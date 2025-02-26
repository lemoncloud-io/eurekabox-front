import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import Backend from 'i18next-xhr-backend';

import { ENV, LANGUAGE_KEY, PROJECT } from '@eurekabox/web-core';

i18n.use(ChainedBackend)
    .use(new LanguageDetector(null, { lookupLocalStorage: `@${PROJECT}_${ENV}.${LANGUAGE_KEY}` }))
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['ko', 'en'],
        interpolation: {
            escapeValue: false,
        },
        debug: process.env.NODE_ENV === 'development',
        backend: {
            backends: [LocalStorageBackend, Backend],
        },
    });

export default i18n;

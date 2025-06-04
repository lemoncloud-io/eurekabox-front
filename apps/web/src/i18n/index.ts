import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import Backend from 'i18next-xhr-backend';

import { ENV, LANGUAGE_KEY, PROJECT } from '@eurekabox/web-core';

const I18N_VERSION = process.env.I18N_VERSION || 'fallback';
const isDevelopment = process.env.NODE_ENV === 'development';

if (!isDevelopment) {
    const currentPrefix = `i18next_res_${I18N_VERSION}_`;
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('i18next_res_') && !key.startsWith(currentPrefix)) {
            localStorage.removeItem(key);
            console.log(`Cleaned up old i18n cache: ${key}`);
        }
    });
}

i18n.use(ChainedBackend)
    .use(new LanguageDetector(null, { lookupLocalStorage: `@${PROJECT}_${ENV}.${LANGUAGE_KEY}` }))
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['ko', 'en'],
        interpolation: {
            escapeValue: false,
        },
        debug: isDevelopment,
        backend: {
            backends: [LocalStorageBackend, Backend],
            backendOptions: [
                {
                    prefix: `i18next_res_${I18N_VERSION}_`,
                    expirationTime: isDevelopment
                        ? 5 * 60 * 1000 // 개발: 5분
                        : 24 * 60 * 60 * 1000, // 프로덕션: 24시간
                    versions: {
                        en: I18N_VERSION,
                        ko: I18N_VERSION,
                    },
                },
                {
                    loadPath: `/locales/{{lng}}/{{ns}}.json${isDevelopment ? '' : `?v=${I18N_VERSION}`}`,
                },
            ],
        },
    });

export default i18n;

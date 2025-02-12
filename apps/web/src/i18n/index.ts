import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-xhr-backend';

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['ko', 'en'],
        interpolation: {
            escapeValue: false,
        },
        debug: process.env.NODE_ENV === 'development',
    });

export default i18n;

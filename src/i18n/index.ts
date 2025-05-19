
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import translationEN from './locales/en.json';
import translationPTBR from './locales/pt-BR.json';
import translationES from './locales/es.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';

// the translations
const resources = {
  en: {
    translation: translationEN
  },
  'pt-BR': {
    translation: translationPTBR
  },
  es: {
    translation: translationES
  },
  fr: {
    translation: translationFR
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem('language') || 'pt-BR', // default language
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;

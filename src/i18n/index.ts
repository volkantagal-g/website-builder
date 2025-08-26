import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import tr from '../locales/tr.json';
import en from '../locales/en.json';

const resources = {
  tr,
  en,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // varsayılan dil
    fallbackLng: 'en', // fallback dil
    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    },
    react: {
      useSuspense: false, // Suspense kullanmıyoruz
    },
  });

export default i18n;

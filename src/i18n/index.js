import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import np from "./np.json";

// Safe localStorage access
const getStoredLanguage = () => {
  try {
    return localStorage.getItem("lang") || "en";
  } catch (error) {
    return "en";
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      np: { translation: np },
    },
    lng: getStoredLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Important: disable suspense to avoid hook issues
    },
  });

export default i18n;
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    mr: {
      translation: {
        welcome: "ग्रामपंचायत पोर्टल मध्ये आपले स्वागत आहे",
        notices: "सूचना",
        schemes: "योजना",
        complaints: "तक्रारी",
        events: "कार्यक्रम",
        gallery: "गॅलरी",
        toggleLang: "English मध्ये पाहा"
      },
    },
    en: {
      translation: {
        welcome: "Welcome to Gram Panchayat Portal",
        notices: "Notices",
        schemes: "Schemes",
        complaints: "Complaints",
        events: "Events",
        gallery: "Gallery",
        toggleLang: "मराठीत पाहा"
      },
    },
  },
  lng: "mr", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

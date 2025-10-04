// src/hooks/useTranslation.ts
import { useApp } from '../contexts/AppContext';
import { translations } from '../data/translations';

export const useTranslation = () => {
  const { state } = useApp();
  const { language } = state;

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return { t, language };
};

export default useTranslation;
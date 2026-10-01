import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';

export const dictionaries = { ar, en } as const;
export type SystemDictionary = typeof ar;
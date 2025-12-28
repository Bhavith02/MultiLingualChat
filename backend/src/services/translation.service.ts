import axios from 'axios';
import { logger } from '../utils/logger.js';

// Using MyMemory Translation API - completely free, no API key required
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  confidence?: number;
}

export class TranslationService {
  /**
   * Translate text to target language using MyMemory API
   */
  async translateText(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResult> {
    try {
      const langPair = `${sourceLang || 'auto'}|${targetLang}`;
      const response = await axios.get(MYMEMORY_API_URL, {
        params: {
          q: text,
          langpair: langPair
        }
      });

      const translatedText = response.data.responseData.translatedText;
      
      return {
        translatedText,
        detectedSourceLanguage: sourceLang,
      };
    } catch (error) {
      logger.error('Translation failed', { error, text, targetLang });
      
      // Fallback: return original text if translation fails
      return {
        translatedText: text,
        detectedSourceLanguage: sourceLang,
      };
    }
  }

  /**
   * Detect language of text (simple heuristic)
   */
  async detectLanguage(text: string): Promise<string> {
    try {
      // Simple detection: check if text contains CJK characters
      const cjkRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
      if (cjkRegex.test(text)) {
        return 'ja'; // Japanese
      }
      return 'en'; // Default to English
    } catch (error) {
      logger.error('Language detection failed', { error, text });
      return 'en';
    }
  }

  /**
   * Translate text to multiple languages at once
   */
  async translateToMultipleLanguages(
    text: string,
    targetLangs: string[],
    sourceLang?: string
  ): Promise<Map<string, string>> {
    const translations = new Map<string, string>();

    try {
      const translationPromises = targetLangs.map(async (lang) => {
        const result = await this.translateText(text, lang, sourceLang);
        return { lang, text: result.translatedText };
      });

      const results = await Promise.all(translationPromises);
      
      results.forEach(({ lang, text }) => {
        translations.set(lang, text);
      });

      return translations;
    } catch (error) {
      logger.error('Batch translation failed', { error, targetLangs });
      
      // Fallback: set original text for all languages
      targetLangs.forEach((lang) => {
        translations.set(lang, text);
      });
      
      return translations;
    }
  }

  /**
   * Check if language code is supported
   */
  async getSupportedLanguages(): Promise<string[]> {
    try {
      const [languages] = await this.translate.getLanguages();
      return languages.map((lang: any) => lang.code);
    } catch (error) {
      logger.error('Failed to get supported languages', { error });
      
      // Return common languages as fallback
      return ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'hi', 'pt', 'ru', 'it'];
    }
  }
}

export const translationService = new TranslationService();

/**
 * Universal romanization/transliteration utility for 100+ languages
 * Supports: Japanese, Chinese, Korean, Arabic, Russian, Hebrew, Greek, Hindi, Thai, and many more
 */

import { transliterate } from 'transliteration';

let kuroshiro: any = null;
let kuroshiroInitPromise: Promise<void> | null = null;

// Initialize kuroshiro for high-quality Japanese romanization
async function initKuroshiro() {
  if (kuroshiro) return;
  
  if (!kuroshiroInitPromise) {
    kuroshiroInitPromise = (async () => {
      try {
        const Kuroshiro = (await import('kuroshiro')).default;
        const KuromojiAnalyzer = (await import('kuroshiro-analyzer-kuromoji')).default;
        
        kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuromojiAnalyzer());
      } catch (error) {
        console.error('Failed to initialize kuroshiro:', error);
        kuroshiro = null;
      }
    })();
  }
  
  await kuroshiroInitPromise;
}

export async function romanize(text: string, language: string): Promise<string | null> {
  // Only romanize if text contains non-Latin characters
  if (!/[^\u0000-\u007F]/.test(text)) {
    return null; // Already in Latin script
  }

  // For Japanese, use kuroshiro for best quality (handles kanji properly)
  if (language === 'ja' || language === 'jpn') {
    try {
      await initKuroshiro();
      if (kuroshiro) {
        const romanized = await kuroshiro.convert(text, { 
          to: 'romaji',
          mode: 'spaced',
          romajiSystem: 'hepburn'
        });
        return romanized;
      }
    } catch (error) {
      console.error('Kuroshiro romanization failed, falling back to transliteration:', error);
    }
  }

  // For all other languages (100+ supported), use universal transliteration
  // Supports: Chinese, Korean, Arabic, Russian, Hebrew, Greek, Hindi, Thai, etc.
  try {
    const romanized = transliterate(text);
    // Only return if it actually transliterated something
    if (romanized !== text && romanized.trim().length > 0) {
      return romanized;
    }
  } catch (error) {
    console.error('Transliteration failed:', error);
  }

  return null;
}

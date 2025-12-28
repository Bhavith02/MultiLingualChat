declare module 'kuroshiro' {
  class Kuroshiro {
    init(analyzer: any): Promise<void>;
    convert(text: string, options: {
      to: 'hiragana' | 'katakana' | 'romaji';
      mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
      romajiSystem?: 'nippon' | 'passport' | 'hepburn';
    }): Promise<string>;
  }
  export default Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
  class KuromojiAnalyzer {
    constructor();
  }
  export default KuromojiAnalyzer;
}

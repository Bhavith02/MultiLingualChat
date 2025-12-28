import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ 
    success: true,
    data: {
      languages: [
        { code: 'en', name: 'English', native_name: 'English' },
        { code: 'es', name: 'Spanish', native_name: 'Español' },
        { code: 'fr', name: 'French', native_name: 'Français' },
        { code: 'de', name: 'German', native_name: 'Deutsch' },
        { code: 'zh', name: 'Chinese', native_name: '中文' },
        { code: 'ja', name: 'Japanese', native_name: '日本語' },
        { code: 'ko', name: 'Korean', native_name: '한국어' },
        { code: 'ar', name: 'Arabic', native_name: 'العربية' },
        { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
        { code: 'pt', name: 'Portuguese', native_name: 'Português' },
        { code: 'ru', name: 'Russian', native_name: 'Русский' },
        { code: 'it', name: 'Italian', native_name: 'Italiano' },
      ]
    }
  });
});

export default router;

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर’', direction: 'ltr' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', direction: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', direction: 'rtl' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', direction: 'ltr' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', direction: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr' },
  { code: 'mni', name: 'Manipuri / Meitei', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', direction: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', direction: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', direction: 'ltr' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', direction: 'ltr' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', direction: 'rtl' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'en';

import fs from "node:fs";

/**
 * @url https://developer.chrome.com/docs/extensions/reference/api/i18n#support_multiple_languages
 */
const SUPPORTED_LANGUAGES = {
  ar: "Arabic",
  am: "Amharic",
  bg: "Bulgarian",
  bn: "Bengali",
  ca: "Catalan",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  en_AU: "English (Australia)",
  en_GB: "English (Great Britain)",
  en_US: "English (USA)",
  es: "Spanish",
  es_419: "Spanish (Latin America and Caribbean)",
  et: "Estonian",
  fa: "Persian",
  fi: "Finnish",
  fil: "Filipino",
  fr: "French",
  gu: "Gujarati",
  he: "Hebrew",
  hi: "Hindi",
  hr: "Croatian",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  kn: "Kannada",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  ml: "Malayalam",
  mr: "Marathi",
  ms: "Malay",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  pt_BR: "Portuguese (Brazil)",
  pt_PT: "Portuguese (Portugal)",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sr: "Serbian",
  sv: "Swedish",
  sw: "Swahili",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  vi: "Vietnamese",
  zh_CN: "Chinese (China)",
  zh_TW: "Chinese (Taiwan)"
};

const locales = fs.readdirSync("locales");

locales.forEach((locale) => {
  if (!(locale in SUPPORTED_LANGUAGES)) {
    throw new Error(`Unsupported language: ${locale}`);
  }
});

makeTypeFile(locales);
makeGetMessageFromLocaleFile(locales);

function makeTypeFile(locales) {
  const typeFile = `/**
 * This file is generated by generate-i18n.mjs
 * Do not edit this file directly
 */
${locales.map((locale) => `import type ${locale}Message from '../locales/${locale}/messages.json';`).join("\n")}

export type MessageKey = ${locales.map((locale) => `keyof typeof ${locale}Message`).join(" & ")};

export type DevLocale = ${locales.map((locale) => `'${locale}'`).join(" | ")};
`;

  fs.writeFileSync("lib/type.ts", typeFile);
}

function makeGetMessageFromLocaleFile(locales) {
  const defaultLocaleCode = `(() => {
  const locales = ${JSON.stringify(locales)};
  const firstLocale = locales[0];
  const defaultLocale = Intl.DateTimeFormat().resolvedOptions().locale.replace("-", "_");
  if (locales.includes(defaultLocale)) {
    return defaultLocale;
  }
  const defaultLocaleWithoutRegion = defaultLocale.split("_")[0];
  if (locales.includes(defaultLocaleWithoutRegion)) {
    return defaultLocaleWithoutRegion;
  }
  return firstLocale;
})()`

  const getMessageFromLocaleFile = `/**
 * This file is generated by generate-i18n.mjs
 * Do not edit this file directly
 */
${locales.map((locale) => `import ${locale}Message from '../locales/${locale}/messages.json';`).join("\n")}

export function getMessageFromLocale(locale: string) {
  switch (locale) {
${locales.map((locale) => `    case '${locale}':
      return ${locale}Message;`).join("\n")}
    default:
      throw new Error('Unsupported locale');
  }
}

export const defaultLocale = ${defaultLocaleCode};
`;
  fs.writeFileSync("lib/getMessageFromLocale.ts", getMessageFromLocaleFile);
}

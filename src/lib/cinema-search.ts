const umlautExpansions = new Map([
  ["ä", "ae"],
  ["ö", "oe"],
  ["ü", "ue"],
  ["ß", "ss"],
]);

const accentFoldMap = new Map([
  ["à", "a"],
  ["á", "a"],
  ["â", "a"],
  ["ã", "a"],
  ["ä", "a"],
  ["å", "a"],
  ["ç", "c"],
  ["è", "e"],
  ["é", "e"],
  ["ê", "e"],
  ["ë", "e"],
  ["ì", "i"],
  ["í", "i"],
  ["î", "i"],
  ["ï", "i"],
  ["ñ", "n"],
  ["ò", "o"],
  ["ó", "o"],
  ["ô", "o"],
  ["õ", "o"],
  ["ö", "o"],
  ["ù", "u"],
  ["ú", "u"],
  ["û", "u"],
  ["ü", "u"],
  ["ý", "y"],
  ["ÿ", "y"],
]);

const collapseWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export const normalizeCinemaSearchBase = (value: string) => collapseWhitespace(value.trim().toLowerCase());

export const expandGermanUmlauts = (value: string) =>
  [...value].map((character) => umlautExpansions.get(character) ?? character).join("");

export const foldCinemaAccents = (value: string) =>
  [...value.normalize("NFD")]
    .filter((character) => !/[\u0300-\u036f]/.test(character))
    .map((character) => accentFoldMap.get(character) ?? character)
    .join("");

export const buildCinemaSearchVariants = (value: string): string[] => {
  const base = normalizeCinemaSearchBase(value);
  if (!base) {
    return [];
  }

  return [...new Set([base, foldCinemaAccents(base), expandGermanUmlauts(base), foldCinemaAccents(expandGermanUmlauts(base))])];
};

export const buildCinemaSearchHaystack = (...parts: Array<string | null | undefined>) =>
  [...new Set(buildCinemaSearchVariants(parts.filter(Boolean).join(" ")))]
    .join(" ")
    .trim();

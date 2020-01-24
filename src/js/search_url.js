// @ts-check

/**
 * @param {string} query what to search for
 * @param {string} language 2-letter language code
 * @param {string} country 2-letter country code
 * @return {string} Image search URL for for given query in given locale
 */
export default (query, language, country) => {
  const q = `q=${encodeURI(query)}`;
  const cr = `cr=country${country.toUpperCase()}`;
  const hl = `hl=${language}`;
  return `https://www.google.com/search?${q}&${hl}&${cr}&tbm=isch`;
};

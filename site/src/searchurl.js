
/**
 * Image search URL for for given query in given locale.
 * @param {string} query 
 * @param {string} language 
 * @param {string} country 
 */
export const imageSearchUrl = (query, language, country) => {
  const q = `q=${encodeURI(query)}`
  const cr = `cr=country${country.toUpperCase()}`
  const hl = `hl=${language}`
  return `https://www.google.com/search?${q}&${hl}&${cr}&tbm=isch`
}

export const imageSearchUrl = (query, language, country) => {
  const q = `q=${encodeURI(query)}`
  const cr = `cr=country${country.toUpperCase()}`
  const hl = `hl=${language}`
  return `https://www.google.com/search?${q}&${hl}&${cr}&tbm=isch`
}

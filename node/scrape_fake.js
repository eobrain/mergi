// Fake version of scrape.js for unit testing

/* global Promise */

const QUERIES_PER_MINUTE = 20.0;

// Returns promise of list of { width, height, src } objects
export default (query, language, country, queryCount) => {
  const q = `q=${encodeURI(query)}`;
  const cr = `cr=country${country.toUpperCase()}`;
  const hl = `hl=${language}`;

  const images = [];
  for (let i = 0; i < 20; ++i) {
    images.push({width: i * 10, height: i * 20, src: `https://fake/${i}/${q}&${hl}&${cr}`});
  }
  const spreadOverMinutes = queryCount / QUERIES_PER_MINUTE;
  const delay = spreadOverMinutes * 60000.0 * Math.random();
  console.log(`// ${new Date()} delay = ${delay}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(images);
    }, delay);
  });
};

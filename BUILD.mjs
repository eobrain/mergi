// This is the build file for the Kartoj.
// USAGE:
//   npx bajel
//      Builds all the HTML, JS, and CSS using checked in words.js
//   npx bajel serves
//      Serves the site on http://localhost:8888
//   npx bajel words
//      Recreates words.js by calling Google image search for many images (slow).
// See README for more.

import { DATA } from './node/config.js'

// const trace = x => console.trace(x) || x

const COMPILEJS = 'java -jar tools/closure/closure-compiler-v20191111.jar -O ADVANCED --externs src/js/externs.js'
const LOCALES = ['en_ie', 'en_us', 'es_es', 'es_mx', 'fr_fr']
const STYLE = ['app', 'common', 'debug', 'deck', 'index', 'info', 'normalize']
const MUSTACHE = 'npx mustache -p src/html/footer.mustache -p src/html/head.mustache -p src/html/header.mustache'
const PARTIALS = ['src/html/head.mustache', 'src/html/footer.mustache', 'src/html/header.mustache']
const COMMONJS = ['search_url.js', 'shared.js', 'card.js', 'storage.js', 'word.js']
const CARDJS = [...COMMONJS, 'main.js']
const DECKJS = [...COMMONJS, 'deck.js']
const DEBUGJS = [...COMMONJS, 'debug.js']
const BROWSERJS = [...COMMONJS, 'service-worker.js', 'index.js', 'debug.js', 'deck.js', 'main.js']

const mustache = (page, localePage) => ({
  [`site/${localePage}.html`]: {
    deps: [`src/json/${localePage}.json`, `src/html/${page}.html`, ...PARTIALS],
    exec: `${MUSTACHE} src/json/${localePage}.json src/html/${page}.html > $@`
  }
})

const compilejs = (module, js) => ({
  [`site/${module}_compiled.js`]: {
    deps: [...js.map(x => `src/js/${x}`), 'src/js/externs.js'],
    exec: `
        ${COMPILEJS} --create_source_map site/${module}_compiled.map --js_output_file $@ $<
        echo '//# sourceMappingURL=/${module}_compiled.map' >> $@
      `
  }
})

export default {
  compiled: {
    deps: [
      'lint',
      'runtest',
      'html',
      'modules',
      ...STYLE.map(s => `site/css/${s}.css`),
      ...LOCALES.map(l => `site/card_${l}_compiled.js`),
      ...LOCALES.map(l => `site/deck_${l}_compiled.js`),
      ...LOCALES.map(l => `site/debug_${l}_compiled.js`),
      'site/index_compiled.js'
    ]
  },

  runtest: { exec: 'npm test' },

  runbrowsertest: {
    deps: ['lint'],
    exec: `
      : Open http://localhost:8887/browsertest
      python -m SimpleHTTPServer 8887
    `
  },

  html: {
    deps: [
      ...LOCALES.map(l => `site/card_${l}.html`),
      ...LOCALES.map(l => `site/deck_${l}.html`),
      ...LOCALES.map(l => `site/debug_${l}.html`),
      'site/credit.html',
      'site/index.html',
      'site/card_dev.html',
      'site/card_bundled.html',
      'site/info.html',
      'site/privacy.html'
    ]
  },

  ...mustache('card', 'card_%'),
  ...mustache('deck', 'deck_%'),
  ...mustache('debug', 'debug_%'),
  ...mustache('info', 'info'),
  ...mustache('index', 'index'),
  ...mustache('credit', 'credit'),
  ...mustache('privacy', 'privacy'),

  ...compilejs('card_%', ['words_%.js', 'card_%.js', ...CARDJS]),
  ...compilejs('deck_%', ['words_%.js', 'deck_%.js', ...DECKJS]),
  ...compilejs('debug_%', ['words_%.js', 'debug_%.js', ...DEBUGJS]),
  ...compilejs('index', ['index.js']),

  'site/%.js': {
    deps: ['src/js/%.js'],
    exec:
      'npx terser --module --ecma 6 --compress --mangle --source-map "base=\'site\',url=\'$@.map\'" --output $@ -- $<'
  },

  'site/css/%.css': {
    deps: ['src/scss/%.scss'],
    exec: `
      mkdir -p site/css
      npx node-sass --output-style compressed src/scss/%.scss > site/css/%.css
    `
  },

  modules: {
    deps: [
      ...LOCALES.map(l => `site/words_${l}.js`),
      ...LOCALES.map(l => `site/card_${l}.js`),
      ...LOCALES.map(l => `site/deck_${l}.js`),
      ...LOCALES.map(l => `site/debug_${l}.js`),
      ...BROWSERJS.map(j => `site/${j}`)
    ]
  },

  words: {
    deps: ['lint', DATA, 'node/fetch_words.js', 'node/scrape.js'],
    exec: `
      node node/fetch_words.js
      npx standard --fix src/js/words_??_??.js
    `
  },

  ocr_test: { deps: ['site/ocr.html'] },

  'site/ocr.html': {
    deps: ['site/words_es_mx.js', 'node/ocr.js', 'node/ocr_test.js'],
    exec: 'node node/ocr_test.js > $@'
  },

  lint: { exec: 'standard node/*.js src/js/*.js' },

  clean: { exec: 'rm -f site/*.js site/*.map site/*.html site/css/*' },

  'site/server.pem': {
    exec: `
      cd site
      openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
    `
  },

  serve: {
    deps: ['compiled'],
    exec: `
      : visit http://localhost:8888
      cd site && npx ws --port 8888
    `
  },

  serve_ssl: {
    deps: ['site/server.pem', 'site/serve.py', 'compiled'],
    exec: `
      : visit https://localhost:4443
      cd site && python serve.py
    `
  }
}

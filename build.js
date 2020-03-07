// This is the build file for the Kartoj.
// USAGE:
//   node build.js
//      Builds all the HTML, JS, and CSS using checked in words.js
//   node build.js serves
//      Serves the site on http://localhost:8888
//   node build.js words
//      Recreates words.js by calling Google image search for many images (slow).
// See README for more.

import { DATA } from './node/config.js'
import { basename } from 'path'
import build from 'bajel'

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

const BROWSERJS = [
  ...COMMONJS,
  'service-worker.js',
  'index.js',
  'debug.js',
  'deck.js',
  'main.js']

const targets = (...xs) => f => Object.fromEntries(xs.map(f))

const mustache = (page, localePage) => [
  `src/json/${localePage}.json`,
  `src/html/${page}.html`,
  ...PARTIALS,
  c => [MUSTACHE, `src/json/${localePage}.json src/html/${page}.html >`, c.target]
]

const compilejs = (module, js) => [
  ...js.map(x => `src/js/${x}`),
  'src/js/externs.js',
  c => [COMPILEJS,
    `--create_source_map site/${module}_compiled.map --js_output_file`,
    c.target,
    c.source],
  c => ['echo', `'//# sourceMappingURL=/${module}_compiled.map'`, '>>', c.target]
]

build({
  compiled: [
    'lint',
    'runtest',
    'html',
    'modules',
    ...STYLE.map(s => `site/css/${s}.css`),
    ...LOCALES.map(l => `site/card_${l}_compiled.js`),
    ...LOCALES.map(l => `site/deck_${l}_compiled.js`),
    ...LOCALES.map(l => `site/debug_${l}_compiled.js`),
    'site/index_compiled.js'
  ],

  runtest: [c => 'npm test'],

  runbrowsertest: [
    'lint',
    c => ': Open http://localhost:8887/browsertest',
    c => 'python -m SimpleHTTPServer 8887'
  ],

  html: [
    ...LOCALES.map(l => `site/card_${l}.html`),
    ...LOCALES.map(l => `site/deck_${l}.html`),
    ...LOCALES.map(l => `site/debug_${l}.html`),
    'site/credit.html',
    'site/index.html',
    'site/card_dev.html',
    'site/card_bundled.html',
    'site/info.html',
    'site/privacy.html'
  ],

  ...targets('card', 'deck', 'debug')(p => [
    `site/${p}_%.html`, mustache(p, `${p}_%`)
  ]),
  ...targets('info', 'index', 'credit', 'privacy')(p => [
    `site/${p}.html`, mustache(p, 'info')
  ]),

  'site/card_%_compiled.js': compilejs('card_%s', ['words_%.js', 'card_%.js', ...CARDJS]),
  'site/deck_%_compiled.js': compilejs('deck_%s', ['words_%.js', 'deck_%.js', ...DECKJS]),
  'site/debug_%_compiled.js': compilejs('debug_%s', ['words_%.js', 'debug_%.js', ...DEBUGJS]),
  'site/index_compiled.js': compilejs('card', ['index.js']),

  'site/%.js': [
    'src/js/%.js',
    c => [
      `npx terser --module --ecma 6 --compress --mangle --source-map "base='site',url='${basename(c.target)}.map'" --output`,
      c.target, '--', c.source
    ]
  ],

  'site/css/%.css': [
    'src/scss/%.scss',
    c => `
      mkdir -p site/css
      npx node-sass --output-style compressed src/scss/%.scss > site/css/%.css
    `
  ],

  modules: [
    ...LOCALES.map(l => `site/words_${l}.js`),
    ...LOCALES.map(l => `site/card_${l}.js`),
    ...LOCALES.map(l => `site/deck_${l}.js`),
    ...LOCALES.map(l => `site/debug_${l}.js`),
    ...BROWSERJS.map(j => `site/${j}`)],

  words: [
    'lint',
    DATA,
    'node/fetch_words.js',
    'node/scrape.js',
    c => `
      node node/fetch_words.js
      npx standard --fix src/js/words_??_??.js
    `
  ],

  'ocr-test': ['site/ocr.html'],

  'site/ocr.html': [
    'site/words_es_mx.js',
    'node/ocr.js',
    'node/ocr_test.js',
    c => ['node node/ocr_test.js >', c.target]
  ],

  lint: [
    c => 'npx standard node/*.js src/js/*.js'],

  clean: [
    c => 'rm -f site/*.js site/*.map site/*.html site/css/*'],

  'site/server.pem': [
    c => `
      cd site
      openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
  `
  ],

  serve: [
    'compiled',
    c => `
      : visit https://localhost:8888
      cd site && python -m SimpleHTTPServer 8888
    `],

  'serve-ssl': [
    'site/server.pem',
    'site/serve.py',
    'compiled',
    c => `
      : visit https://localhost:4443
      cd site && python serve.py
    `]
})

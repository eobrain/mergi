// This is the build file for the Kartoj.
// USAGE:
//   npm jake
//      Builds all the HTML, JS, and CSS using checked in words.js
//   npm jake serves
//      Serves the site on http://localhost:8888
//   npm jake words
//      Recreates words.js by calling Google image search for many images (slow).
// See README for more.

import { DATA } from './node/config.js'
import { basename } from 'path'

const COMPILEJS = 'java -jar tools/closure/closure-compiler-v20191111.jar -O ADVANCED --externs src/js/externs.js'
const LOCALES = ['en_ie', 'en_us', 'es_es', 'es_mx', 'fr_fr']
const STYLE = ['app', 'common', 'debug', 'deck', 'index', 'info', 'normalize']
const MUSTACHE = 'npx mustache -p src/html/footer.mustache -p src/html/head.mustache -p src/html/header.mustache'
const PARTIALS = ['src/html/head.mustache', 'src/html/footer.mustache', 'src/html/header.mustache']
const CARDJS = ['search_url.js', 'main.js', 'shared.js', 'search_url.js', 'card.js', 'storage.js', 'word.js']
const DECKJS = ['deck.js', 'shared.js', 'search_url.js', 'card.js', 'storage.js', 'word.js']
const DEBUGJS = ['debug.js', 'shared.js', 'search_url.js', 'card.js', 'storage.js', 'word.js']

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

  runtest: { exec: c => 'npm test' },

  runbrowsertest: {
    deps: 'lint',
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
      'site/privacy.html']
  },

  'site/card_$1.html': {
    from: /src\/json\/card_(.*).json/,
    deps: ['src/html/card.html', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/card_$1.json src/html/card.html >${c.target}`
  },
  'site/deck_$1.html': {
    from: /src\/json\/deck_(.*).json/,
    deps: ['src/html/deck.html', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/deck_$1.json src/html/deck.html >${c.target}`
  },
  'site/debug_$1.html': {
    from: /src\/json\/debug_(.*).json/,
    deps: ['src/html/debug.html', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/debug_$1.json src/html/debug.html >${c.target}`
  },
  'site/credit.html': {
    deps: ['src/html/credit.html', 'src/json/credit.json', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/credit.json src/html/credit.html >${c.target}`
  },
  'site/index.html': {
    deps: ['src/html/index.html', 'src/json/index.json', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/index.json src/html/index.html >${c.target}`
  },
  'site/info.html': {
    deps: ['src/html/info.html', 'src/json/info.json', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/info.json src/html/info.html >${c.target}`
  },
  'site/privacy.html': {
    deps: ['src/html/privacy.html', 'src/json/privacy.json', ...PARTIALS],
    exec: c => `${MUSTACHE} src/json/privacy.json src/html/privacy.html >${c.target}`
  },

  'site/card_$1_compiled.js': {
    from: /src\/js\/words_(.*).js/,
    deps: ['src/js/card_$1.js', ...CARDJS.map(x => `src/js/${x}`), 'src/js/externs.js'],
    exec: c => `
			${COMPILEJS} --create_source_map site/app_$1_compiled.map --js_output_file ${c.target} ${c.source}
			echo '//# sourceMappingURL=/app_$1_compiled.map' >> ${c.target}
		`
  },
  'site/deck_$1_compiled.js': {
    from: /src\/js\/words_(.*).js/,
    deps: ['src/js/deck_$1.js', ...DECKJS.map(x => `src/js/${x}`), 'src/js/externs.js'],
    exec: c => `
			${COMPILEJS} --create_source_map site/deck_$1_compiled.map --js_output_file ${c.target} ${c.source}
			echo '//# sourceMappingURL=/deck_$1_compiled.map' >> ${c.target}
		`
  },
  'site/debug_$1_compiled.js': {
    from: /src\/js\/words_(.*).js/,
    deps: ['src/js/debug_$1.js', ...DEBUGJS.map(x => `src/js/${x}`), 'src/js/externs.js'],
    exec: c => `
			${COMPILEJS} --create_source_map site/debug_$1_compiled.map --js_output_file ${c.target} ${c.source}
			echo '//# sourceMappingURL=/debug_$1_compiled.map' >> ${c.target}
		`
  },
  'site/index_compiled.js': {
    deps: ['src/js/index.js', 'src/js/externs.js'],
    exec: c => `
			${COMPILEJS} --create_source_map site/index_compiled.map --js_output_file ${c.target} ${c.source}
			echo '//# sourceMappingURL=/index_compiled.map' >> ${c.target}
		`
  },

  'site/$1.js': {
    from: /src\/js\/(.*).js/,
    exec: c =>
      `npx terser --module --ecma 6 --compress --mangle --source-map "base='site',url='${basename(c.target)}.map'" --output ${c.target} -- ${c.source}`
  },

  'site/css/$1.css': {
    from: /src\/scss\/(.*).scss/,
    exec: c => `
			mkdir -p site/css
			npx node-sass --output-style compressed src/scss/$1.scss > site/css/$1.css
		`
  },

  modules: {
    deps: [
      ...LOCALES.map(l => `site/words_${l}.js`),
      ...LOCALES.map(l => `site/card_${l}.js`),
      ...LOCALES.map(l => `site/deck_${l}.js`),
      ...LOCALES.map(l => `site/debug_${l}.js`),
      'site/service-worker.js',
      'site/index.js',
      'site/card.js',
      'site/storage.js',
      'site/word.js',
      'site/debug.js',
      'site/deck.js',
      'site/main.js',
      'site/search_url.js',
      'site/shared.js']
  },

  words: {
    deps: ['lint', DATA, 'node/fetch_words.js', 'node/scrape.js'],
    exec: c => `
			node node/fetch_words.js
			npx standard --fix src/js/words_??_??.js
		`
  },

  'ocr-test': { deps: ['site/ocr.html'] },

  'site/ocr.html': {
    deps: ['site/words_es_mx.js', 'node/ocr.js', 'node/ocr_test.js'],
    exec: c => `node node/ocr_test.js > ${c.target}`
  },

  lint: { exec: c => 'npx standard node/*.js src/js/*.js' },

  clean: { exec: c => 'rm -f site/*.js site/*.map site/*.html site/css/*' },

  'site/server.pem': {
    exec: c => `
			cd site
			openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
	`
  },

  serve: {
    deps: ['compiled'],
    exec: c => `
			: visit https://localhost:8888
			cd site && python -m SimpleHTTPServer 8888
		`
  },

  'serve-ssl': {
    deps: ['site/server.pem', 'site/serve.py', 'compiled'],
    exec: `
			: visit https://localhost:4443
			cd site && python serve.py
		`
  }
}

# This is the build file for the Kartoj.
# USAGE:
#   make
#      Builds all the JTML, JS, and CSS using checked in words.js
#   make serves
#      Serves the site on http://localhost:8888
#   make words
#      Recreates words.js by calling Google image search for many images (slow).
# See README for more.

# This must be the same as the DATA constant in fetch_words.js
DATA=data/words.csv
# DATA=data/words_debug.csv

COMPILEJS=java -jar tools/closure/closure-compiler-v20191111.jar -O ADVANCED --externs src/js/externs.js
LOCALES=en_ie en_us es_es es_mx fr_fr

STYLE=app common debug deck index info normalize

compiled: lint html modules\
 $(STYLE:%=site/css/%.css)\
 $(LOCALES:%=site/card_%_compiled.js)\
 $(LOCALES:%=site/deck_%_compiled.js)\
 $(LOCALES:%=site/debug_%_compiled.js)\
 site/index_compiled.js

MUSTACHE=npx mustache -p src/html/footer.mustache -p src/html/head.mustache -p src/html/header.mustache
PARTIALS=src/html/head.mustache src/html/footer.mustache src/html/header.mustache

html:\
 $(LOCALES:%=site/card_%.html)\
 $(LOCALES:%=site/deck_%.html)\
 $(LOCALES:%=site/debug_%.html)\
 site/credit.html\
 site/index.html\
 site/card_dev.html\
 site/card_bundled.html\
 site/info.html\
 site/privacy.html


site/card_%.html: src/html/card.html src/json/card_%.json $(PARTIALS)
	$(MUSTACHE) src/json/card_$*.json src/html/card.html >$@
site/deck_%.html: src/html/deck.html src/json/deck_%.json $(PARTIALS)
	$(MUSTACHE) src/json/deck_$*.json src/html/deck.html >$@
site/debug_%.html: src/html/debug.html src/json/debug_%.json $(PARTIALS)
	$(MUSTACHE) src/json/debug_$*.json src/html/debug.html >$@

site/card_en_ie.html: src/html/card.html src/json/card_en_ie.json $(PARTIALS)
site/card_en_us.html: src/html/card.html src/json/card_en_us.json $(PARTIALS)
site/card_es_es.html: src/html/card.html src/json/card_es_es.json $(PARTIALS)
site/card_es_mx.html: src/html/card.html src/json/card_es_mx.json $(PARTIALS)
site/card_fr_fr.html: src/html/card.html src/json/card_fr_fr.json $(PARTIALS)
site/deck_en_ie.html: src/html/deck.html src/json/deck_en_ie.json $(PARTIALS)
site/deck_en_us.html: src/html/deck.html src/json/deck_en_us.json $(PARTIALS)
site/deck_es_es.html: src/html/deck.html src/json/deck_es_es.json $(PARTIALS)
site/deck_es_mx.html: src/html/deck.html src/json/deck_es_mx.json $(PARTIALS)
site/deck_fr_fr.html: src/html/deck.html src/json/deck_fr_fr.json $(PARTIALS)
site/debug_en_ie.html: src/html/debug.html src/json/debug_en_ie.json $(PARTIALS)
site/debug_en_us.html: src/html/debug.html src/json/debug_en_us.json $(PARTIALS)
site/debug_es_es.html: src/html/debug.html src/json/debug_es_es.json $(PARTIALS)
site/debug_es_mx.html: src/html/debug.html src/json/debug_es_mx.json $(PARTIALS)
site/debug_fr_fr.html: src/html/debug.html src/json/debug_fr_fr.json $(PARTIALS)
site/credit.html: src/html/credit.html src/json/credit.json $(PARTIALS)
	$(MUSTACHE) src/json/credit.json src/html/credit.html >$@
site/index.html: src/html/index.html src/json/index.json $(PARTIALS)
	$(MUSTACHE) src/json/index.json src/html/index.html >$@
site/card_dev.html: src/html/card.html src/json/card_dev.json $(PARTIALS)
	$(MUSTACHE) src/json/card_dev.json src/html/card.html >$@
site/card_bundled.html: src/html/card.html src/json/card_bundled.json $(PARTIALS)
	$(MUSTACHE) src/json/card_bundled.json src/html/card.html >$@
site/info.html: src/html/info.html src/json/info.json $(PARTIALS)
	$(MUSTACHE) src/json/info.json src/html/info.html >$@
site/privacy.html: src/html/privacy.html src/json/privacy.json $(PARTIALS)
	$(MUSTACHE) src/json/privacy.json src/html/privacy.html >$@

CARDJS=search_url.js main.js shared.js search_url.js card.js storage.js word.js
DECKJS=deck.js shared.js search_url.js card.js storage.js word.js
DEBUGJS=debug.js shared.js search_url.js card.js storage.js word.js

site/card_%_compiled.js: src/js/words_%.js src/js/card_%.js $(CARDJS:%=src/js/%) 
	$(COMPILEJS) --create_source_map site/app_$*_compiled.map --js_output_file $@ $<
	echo '//# sourceMappingURL=/app_$*_compiled.map' >> $@
site/deck_%_compiled.js: src/js/words_%.js src/js/deck_%.js $(DECKJS:%=src/js/%) src/js/externs.js
	$(COMPILEJS) --create_source_map site/deck_$*_compiled.map --js_output_file $@ $<
	echo '//# sourceMappingURL=/deck_$*_compiled.map' >> $@
site/debug_%_compiled.js: src/js/words_%.js src/js/debug_%.js $(DEBUGJS:%=src/js/%) src/js/externs.js
	$(COMPILEJS) --create_source_map site/debug_$*_compiled.map --js_output_file $@ $<
	echo '//# sourceMappingURL=/debug_$*_compiled.map' >> $@


site/card_en_ie_compiled.js: src/js/words_en_ie.js src/js/card_en_ie.js $(CARDJS:%=src/js/%) src/js/externs.js
site/card_en_us_compiled.js: src/js/words_en_us.js src/js/card_en_us.js $(CARDJS:%=src/js/%) src/js/externs.js
site/card_es_es_compiled.js: src/js/words_es_es.js src/js/card_es_es.js $(CARDJS:%=src/js/%) src/js/externs.js
site/card_es_mx_compiled.js: src/js/words_es_mx.js src/js/card_es_mx.js $(CARDJS:%=src/js/%) src/js/externs.js
site/card_fr_fr_compiled.js: src/js/words_fr_fr.js src/js/card_fr_fr.js $(CARDJS:%=src/js/%) src/js/externs.js
site/deck_en_ie_compiled.js: src/js/words_en_ie.js src/js/deck_en_ie.js $(DECKJS:%=src/js/%) src/js/externs.js
site/deck_en_us_compiled.js: src/js/words_en_us.js src/js/deck_en_us.js $(DECKJS:%=src/js/%) src/js/externs.js
site/deck_es_es_compiled.js: src/js/words_es_es.js src/js/deck_es_es.js $(DECKJS:%=src/js/%) src/js/externs.js
site/deck_es_mx_compiled.js: src/js/words_es_mx.js src/js/deck_es_mx.js $(DECKJS:%=src/js/%) src/js/externs.js
site/deck_fr_fr_compiled.js: src/js/words_fr_fr.js src/js/deck_fr_fr.js $(DECKJS:%=src/js/%) src/js/externs.js
site/debug_en_ie_compiled.js: src/js/words_en_ie.js src/js/debug_en_ie.js $(DEBUGJS:%=src/js/%) src/js/externs.js
site/debug_en_us_compiled.js: src/js/words_en_us.js src/js/debug_en_us.js $(DEBUGJS:%=src/js/%) src/js/externs.js
site/debug_es_es_compiled.js: src/js/words_es_es.js src/js/debug_es_es.js $(DEBUGJS:%=src/js/%) src/js/externs.js
site/debug_es_mx_compiled.js: src/js/words_es_mx.js src/js/debug_es_mx.js $(DEBUGJS:%=src/js/%) src/js/externs.js
site/debug_fr_fr_compiled.js: src/js/words_fr_fr.js src/js/debug_fr_fr.js $(DEBUGJS:%=src/js/%) src/js/externs.js
site/index_compiled.js: src/js/index.js
	$(COMPILEJS) --create_source_map site/index_compiled.map --js_output_file $@ $<
	echo '//# sourceMappingURL=/index_compiled.map' >> $@

site/%.js: src/js/%.js
	npx terser --module --ecma 6 --compress --mangle --source-map "base='site',url='$(notdir $@).map'" --output $@ -- $< 

site/css/%.css: src/scss/%.scss
	mkdir -p site/css
	npx node-sass --output-style compressed src/scss/$*.scss > site/css/$*.css

site/css/app.css: src/scss/app.scss src/scss/_def.scss
site/css/common.css: src/scss/common.scss src/scss/_def.scss

modules:\
 $(LOCALES:%=site/card_%.js)\
 $(LOCALES:%=site/words_%.js)\
 $(LOCALES:%=site/debug_%.js)\
 site/service-worker.js\
 site/index.js\
 site/card.js\
 site/storage.js\
 site/word.js\
 site/debug.js\
 site/deck.js\
 site/main.js\
 site/search_url.js\
 site/shared.js


words: lint $(DATA) node/fetch_words.js node/scrape.js
	node node/fetch_words.js
	npx eslint --fix src/js/words_??_??.js

ocr-test: site/ocr.html

site/ocr.html: site/words_es_mx.js node/ocr.js node/ocr_test.js
	node node/ocr_test.js > $@

lint:
	npx eslint node/*.js src/js/*.js 

clean:
	rm -f site/*.js site/*.map site/*.html site/css/*

 site/server.pem:
	cd site && openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes


serve: compiled
	: visit https://localhost:8888
	cd site && python -m SimpleHTTPServer 8888

serve-ssl: site/server.pem site/serve.py compiled
	: visit https://localhost:4443
	cd site && python serve.py
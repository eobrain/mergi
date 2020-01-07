COMPILEJS=java -jar ../tools/closure/closure-compiler-v20191111.jar -O ADVANCED --externs src/externs.js

compiled: lint html modules\
 site/card_es_mx_compiled.js\
 site/card_es_es_compiled.js\
 site/deck_es_mx_compiled.js\
 site/deck_es_es_compiled.js\
 site/debug_compiled.js

MUSTACHE=cd template && npx mustache -p footer.mustache -p head.mustache -p header.mustache
PARTIALS=template/head.mustache template/footer.mustache template/header.mustache

html:\
 site/card_es_mx.html\
 site/card_es_es.html\
 site/deck_es_mx.html\
 site/deck_es_es.html\
 site/credit.html\
 site/index.html\
 site/card_dev.html\
 site/card_bundled.html\
 site/info.html\
 site/debug.html\
 site/privacy.html

site/card_es_mx.html: template/card.html template/card_es_mx.json $(PARTIALS)
	$(MUSTACHE) card_es_mx.json card.html >../$@
site/card_es_es.html: template/card.html template/card_es_es.json $(PARTIALS)
	$(MUSTACHE) card_es_es.json card.html >../$@
site/deck_es_mx.html: template/deck.html template/deck_es_mx.json $(PARTIALS)
	$(MUSTACHE) deck_es_mx.json deck.html >../$@
site/deck_es_es.html: template/deck.html template/deck_es_es.json $(PARTIALS)
	$(MUSTACHE) deck_es_es.json deck.html >../$@
site/credit.html: template/credit.html template/credit.json $(PARTIALS)
	$(MUSTACHE) credit.json credit.html >../$@
site/index.html: template/index.html template/index.json $(PARTIALS)
	$(MUSTACHE) index.json index.html >../$@
site/card_dev.html: template/card.html template/card_dev.json $(PARTIALS)
	$(MUSTACHE) card_dev.json card.html >../$@
site/card_bundled.html: template/card.html template/card_bundled.json $(PARTIALS)
	$(MUSTACHE) card_bundled.json card.html >../$@
site/info.html: template/info.html template/info.json $(PARTIALS)
	$(MUSTACHE) info.json info.html >../$@
site/debug.html: template/debug.html template/debug.json $(PARTIALS)
	$(MUSTACHE) debug.json debug.html >../$@
site/privacy.html: template/privacy.html template/privacy.json $(PARTIALS)
	$(MUSTACHE) privacy.json privacy.html >../$@

site/card_es_mx_compiled.js: site/src/words_es_mx.js site/src/common.js site/src/search_url.js site/src/card_es_mx.js site/src/main.js site/src/shared.js site/src/externs.js
	cd site && $(COMPILEJS) --create_source_map app.map --js_output_file card_es_mx_compiled.js src/words_es_mx.js src/common.js src/search_url.js src/card_es_mx.js src/main.js src/shared.js
	echo '//# sourceMappingURL=/app.map' >> $@
site/card_es_es_compiled.js: site/src/words_es_es.js site/src/common.js site/src/search_url.js site/src/card_es_mx.js site/src/main.js site/src/shared.js site/src/externs.js
	cd site && $(COMPILEJS) --create_source_map app.map --js_output_file card_es_es_compiled.js src/words_es_mx.js src/common.js src/search_url.js src/card_es_mx.js src/main.js src/shared.js
	echo '//# sourceMappingURL=/app.map' >> $@
site/debug_compiled.js: site/src/words_es_mx.js site/src/common.js site/src/debug.js
	cd site && $(COMPILEJS) --create_source_map debug.map --js_output_file debug_compiled.js src/words_es_mx.js src/common.js src/debug.js
	echo '//# sourceMappingURL=/debug.map' >> $@
site/deck_es_mx_compiled.js: site/src/words_es_mx.js site/src/deck_es_mx.js site/src/common.js site/src/deck.js
	cd site && $(COMPILEJS) --create_source_map deck_es_mx.map --js_output_file deck_es_mx_compiled.js src/deck_es_mx.js src/words_es_mx.js src/common.js src/deck.js
	echo '//# sourceMappingURL=/deck_es_mx.map' >> $@
site/deck_es_es_compiled.js: site/src/words_es_es.js site/src/deck_es_es.js site/src/common.js site/src/deck.js
	cd site && $(COMPILEJS) --create_source_map deck_es_es.map --js_output_file deck_es_es_compiled.js src/deck_es_es.js src/words_es_es.js src/common.js src/deck.js
	echo '//# sourceMappingURL=/deck_es_es.map' >> $@

site/%.js: site/src/%.js
	npx terser --module --ecma 6 --compress --mangle --source-map "base='site',url='$(notdir $@).map'" --output $@ -- $< 

modules:\
 site/card_es_mx.js\
 site/card_es_es.js\
 site/words_es_mx.js\
 site/words_es_es.js\
 site/common.js\
 site/debug.js\
 site/deck.js\
 site/main.js\
 site/search_url.js\
 site/shared.js

words: lint data/words.csv node/fetch_words.js node/scrape.js
	node node/fetch_words.js
	npx standard --fix site/src/words_??_??.js

ocr-test: site/ocr.html

site/ocr.html: site/words_es_mx.js node/ocr.js node/ocr_test.js
	node node/ocr_test.js > $@

lint:
	npx standard node/*.js site/src/*.js 

clean:
	rm -f site/*.js site/*.map site/*.html
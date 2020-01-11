COMPILEJS=java -jar ../tools/closure/closure-compiler-v20191111.jar -O ADVANCED --externs src/externs.js
LOCALES=en_ie en_us es_es es_mx fr_fr

compiled: lint html modules\
 $(LOCALES:%=site/card_%_compiled.js)\
 $(LOCALES:%=site/deck_%_compiled.js)\
 site/index_compiled.js\
 site/debug_compiled.js

MUSTACHE=cd template && npx mustache -p footer.mustache -p head.mustache -p header.mustache
PARTIALS=template/head.mustache template/footer.mustache template/header.mustache

html:\
 $(LOCALES:%=site/card_%.html)\
 $(LOCALES:%=site/deck_%.html)\
 site/credit.html\
 site/index.html\
 site/card_dev.html\
 site/card_bundled.html\
 site/info.html\
 site/debug.html\
 site/privacy.html

site/card_%.html: template/card.html template/card_%.json $(PARTIALS)
	$(MUSTACHE) card_$*.json card.html >../$@
site/deck_%.html: template/deck.html template/deck_%.json $(PARTIALS)
	$(MUSTACHE) deck_$*.json deck.html >../$@

site/card_en_ie.html: template/card.html template/card_en_ie.json $(PARTIALS)
site/card_en_us.html: template/card.html template/card_en_us.json $(PARTIALS)
site/card_es_es.html: template/card.html template/card_es_es.json $(PARTIALS)
site/card_es_mx.html: template/card.html template/card_es_mx.json $(PARTIALS)
site/card_fr_fr.html: template/card.html template/card_fr_fr.json $(PARTIALS)
site/deck_en_ie.html: template/deck.html template/deck_en_ie.json $(PARTIALS)
site/deck_en_us.html: template/deck.html template/deck_en_us.json $(PARTIALS)
site/deck_es_es.html: template/deck.html template/deck_es_es.json $(PARTIALS)
site/deck_es_mx.html: template/deck.html template/deck_es_mx.json $(PARTIALS)
site/deck_fr_fr.html: template/deck.html template/deck_fr_fr.json $(PARTIALS)
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

site/card_%_compiled.js: site/src/words_%.js site/src/common.js site/src/search_url.js site/src/card_%.js site/src/main.js site/src/shared.js site/src/externs.js
	cd site && $(COMPILEJS) --create_source_map app_$*_compiled.map --js_output_file card_$*_compiled.js src/words_$*.js src/common.js src/search_url.js src/card_$*.js src/main.js src/shared.js
	echo '//# sourceMappingURL=/app_$*_compiled.map' >> $@
site/deck_%_compiled.js: site/src/words_%.js site/src/deck_%.js site/src/common.js site/src/deck.js
	cd site && $(COMPILEJS) --create_source_map deck_$*_compiled.map --js_output_file deck_$*_compiled.js src/deck_$*.js src/words_$*.js src/common.js src/deck.js
	echo '//# sourceMappingURL=/deck_$*_compiled.map' >> $@


site/card_en_ie_compiled.js: site/src/words_en_ie.js site/src/common.js site/src/search_url.js site/src/card_en_ie.js site/src/main.js site/src/shared.js site/src/externs.js
site/card_en_us_compiled.js: site/src/words_en_us.js site/src/common.js site/src/search_url.js site/src/card_en_us.js site/src/main.js site/src/shared.js site/src/externs.js
site/card_es_es_compiled.js: site/src/words_es_es.js site/src/common.js site/src/search_url.js site/src/card_es_es.js site/src/main.js site/src/shared.js site/src/externs.js
site/card_es_mx_compiled.js: site/src/words_es_mx.js site/src/common.js site/src/search_url.js site/src/card_es_mx.js site/src/main.js site/src/shared.js site/src/externs.js
site/card_fr_fr_compiled.js: site/src/words_fr_fr.js site/src/common.js site/src/search_url.js site/src/card_fr_fr.js site/src/main.js site/src/shared.js site/src/externs.js
site/deck_en_ie_compiled.js: site/src/words_en_ie.js site/src/deck_en_ie.js site/src/common.js site/src/deck.js
site/deck_en_us_compiled.js: site/src/words_en_us.js site/src/deck_en_us.js site/src/common.js site/src/deck.js
site/deck_es_es_compiled.js: site/src/words_es_es.js site/src/deck_es_es.js site/src/common.js site/src/deck.js
site/deck_es_mx_compiled.js: site/src/words_es_mx.js site/src/deck_es_mx.js site/src/common.js site/src/deck.js
site/deck_fr_fr_compiled.js: site/src/words_fr_fr.js site/src/deck_fr_fr.js site/src/common.js site/src/deck.js
site/index_compiled.js: site/src/index.js
	cd site && $(COMPILEJS) --create_source_map index_compiled.map --js_output_file index_compiled.js src/index.js
	echo '//# sourceMappingURL=/index_compiled.map' >> $@
site/debug_compiled.js: site/src/words_es_mx.js site/src/common.js site/src/debug.js
	cd site && $(COMPILEJS) --create_source_map debug_compiled.map --js_output_file debug_compiled.js src/words_es_mx.js src/common.js src/debug.js
	echo '//# sourceMappingURL=/debug_compiled.map' >> $@

site/%.js: site/src/%.js
	npx terser --module --ecma 6 --compress --mangle --source-map "base='site',url='$(notdir $@).map'" --output $@ -- $< 

modules:\
 $(LOCALES:%=site/card_%.js)\
 $(LOCALES:%=site/words_%.js)\
 site/service-worker.js\
 site/index.js\
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

 site/server.pem:
	cd site && openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes

serve: site/server.pem site/serve.py
	: visit https://localhost:4443
	cd site && python serve.py
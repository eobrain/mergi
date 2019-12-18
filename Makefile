COMPILEJS=java -jar ../tools/closure/closure-compiler-v20190929.jar

compiled: html modules site/index_compiled.js site/debug_compiled.js site/deck_compiled.js 

MUSTACHE=cd template && npx mustache -p footer.mustache -p head.mustache -p header.mustache
PARTIALS=template/head.mustache template/footer.mustache template/header.mustache

html:\
 site/credit.html\
 site/deck.html\
 site/index.html\
 site/index-mod.html\
 site/info.html\
 site/privacy.html

site/credit.html: template/credit.html template/credit.json $(PARTIALS)
	$(MUSTACHE) credit.json credit.html >../$@
site/deck.html: template/deck.html template/deck.json $(PARTIALS)
	$(MUSTACHE) deck.json deck.html >../$@
site/index.html: template/index.html template/index.json $(PARTIALS)
	$(MUSTACHE) index.json index.html >../$@
site/index-mod.html: template/index.html  template/index-mod.json $(PARTIALS)
	$(MUSTACHE) index-mod.json index.html >../$@
site/info.html: template/info.html template/info.json $(PARTIALS)
	$(MUSTACHE) info.json info.html >../$@
site/privacy.html: template/privacy.html template/privacy.json $(PARTIALS)
	$(MUSTACHE) privacy.json privacy.html >../$@


site/index_compiled.js: js/words.js js/common.js js/searchurl.js js/index.js
	cd site && $(COMPILEJS) --create_source_map app.map --js_output_file index_compiled.js ../js/words.js ../js/common.js ../js/searchurl.js ../js/index.js
	echo '//# sourceMappingURL=/app.map' >> $@
site/debug_compiled.js: js/words.js js/common.js js/debug.js
	cd site && $(COMPILEJS) --create_source_map debug.map --js_output_file debug_compiled.js ../js/words.js ../js/common.js ../js/debug.js
	echo '//# sourceMappingURL=/deck.map' >> $@
site/deck_compiled.js: js/words.js js/common.js js/deck.js
	cd site && $(COMPILEJS) --create_source_map deck.map --js_output_file deck_compiled.js ../js/words.js ../js/common.js ../js/deck.js
	echo '//# sourceMappingURL=/deck.map' >> $@

site/%.js: js/%.js
	npx terser --module --ecma 6 --compress --mangle --source-map --output $@ -- $< 

modules: site/common.js site/debug.js site/deck.js site/index.js site/searchurl.js site/words.js

words: data/words.csv index.js scrape.js
	node index.js > site/words.js

dry-run:
	node index.js

ocr-test: site/ocr.html

site/ocr.html: site/words.js ocr.js ocr_test.js
	node ocr_test.js > $@

clean:
	rm -f site/*.js
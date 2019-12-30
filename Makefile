COMPILEJS=java -jar ../tools/closure/closure-compiler-v20190929.jar -O ADVANCED --externs src/externs.js

compiled: html modules site/index_compiled.js site/debug_compiled.js site/deck_compiled.js 

MUSTACHE=cd template && npx mustache -p footer.mustache -p head.mustache -p header.mustache
PARTIALS=template/head.mustache template/footer.mustache template/header.mustache

html:\
 site/credit.html\
 site/deck.html\
 site/index.html\
 site/index_dev.html\
 site/index_bundled.html\
 site/info.html\
 site/privacy.html

site/credit.html: template/credit.html template/credit.json $(PARTIALS)
	$(MUSTACHE) credit.json credit.html >../$@
site/deck.html: template/deck.html template/deck.json $(PARTIALS)
	$(MUSTACHE) deck.json deck.html >../$@
site/index.html: template/index.html template/index.json $(PARTIALS)
	$(MUSTACHE) index.json index.html >../$@
site/index_dev.html: template/index.html template/index_dev.json $(PARTIALS)
	$(MUSTACHE) index_dev.json index.html >../$@
site/index_bundled.html: template/index.html template/index_bundled.json $(PARTIALS)
	$(MUSTACHE) index_bundled.json index.html >../$@
site/info.html: template/info.html template/info.json $(PARTIALS)
	$(MUSTACHE) info.json info.html >../$@
site/privacy.html: template/privacy.html template/privacy.json $(PARTIALS)
	$(MUSTACHE) privacy.json privacy.html >../$@

site/index_compiled.js: site/src/words.js site/src/common.js site/src/searchurl.js site/src/index.js site/src/shared.js site/src/externs.js
	cd site && $(COMPILEJS) --create_source_map app.map --js_output_file index_compiled.js src/words.js src/common.js src/searchurl.js src/index.js src/shared.js
	echo '//# sourceMappingURL=/app.map' >> $@
site/debug_compiled.js: site/src/words.js site/src/common.js site/src/debug.js
	cd site && $(COMPILEJS) --create_source_map debug.map --js_output_file debug_compiled.js src/words.js src/common.js src/debug.js
	echo '//# sourceMappingURL=/debug.map' >> $@
site/deck_compiled.js: site/src/words.js site/src/common.js site/src/deck.js
	cd site && $(COMPILEJS) --create_source_map deck.map --js_output_file deck_compiled.js src/words.js src/common.js src/deck.js
	echo '//# sourceMappingURL=/deck.map' >> $@

site/%.js: site/src/%.js
	npx terser --module --ecma 6 --compress --mangle --source-map "base='site',url='$(notdir $@).map'" --output $@ -- $< 

modules: site/common.js site/debug.js site/deck.js site/index.js site/searchurl.js site/words.js site/shared.js

words: data/words.csv index.js scrape.js
	node index.js > site/src/words.js

dry-run:
	node index.js

ocr-test: site/ocr.html

site/ocr.html: site/words.js ocr.js ocr_test.js
	node ocr_test.js > $@

clean:
	rm -f site/*.js site/*.map
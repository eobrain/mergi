COMPILEJS=java -jar ../tools/closure/closure-compiler-v20190929.jar

compiled: site/index_compiled.js site/debug_compiled.js site/deck_compiled.js

site/index_compiled.js: site/words.js site/common.js site/searchurl.js site/index.js
	cd site && $(COMPILEJS) --create_source_map index.map --js_output_file index_compiled.js words.js common.js searchurl.js index.js
	echo '//# sourceMappingURL=/index.map' >> $@
site/debug_compiled.js: site/words.js site/common.js site/debug.js
	cd site && $(COMPILEJS) --create_source_map debug.map --js_output_file debug_compiled.js words.js common.js debug.js
	echo '//# sourceMappingURL=/deck.map' >> $@
site/deck_compiled.js: site/words.js site/common.js site/deck.js
	cd site && $(COMPILEJS) --create_source_map deck.map --js_output_file deck_compiled.js words.js common.js deck.js
	echo '//# sourceMappingURL=/deck.map' >> $@

words: data/words.csv index.js scrape.js
	node index.js > site/words.js

dry-run:
	node index.js

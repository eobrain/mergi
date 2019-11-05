COMPILEJS=java -jar tools/closure/closure-compiler-v20190929.jar

compiled: site/index_compiled.js site/debug_compiled.js

site/words.js: data/words.csv
	if [ -f $@ ]; then mv $@ $@-$$(date --iso-8601=seconds); fi
	API_KEY=$(API_KEY) node index.js > $@
	echo ']' >> $@

site/index_compiled.js: site/words.js site/common.js site/index.js
	$(COMPILEJS) --js_output_file $@ site/words.js site/common.js site/index.js
site/debug_compiled.js: site/words.js site/common.js site/debug.js
	$(COMPILEJS) --js_output_file $@ site/words.js site/common.js site/debug.js

dry-run:
	node index.js

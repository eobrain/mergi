site/words.js: data/words.csv
	if [ -f $@ ]; then mv $@ $@-$$(date --iso-8601=seconds); fi
	API_KEY=$(API_KEY) node index.js > $@
	echo ']' >> $@

dry-run:
	node index.js
site/words.js: data/words.csv
	mv $@ $@-$$(date --iso-8601=seconds)
	API_KEY=$(API_KEY) node index.js > $@
	echo ']' >> $@

dry-run:
	node index.js
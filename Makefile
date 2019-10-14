site/words.js: data/words.csv
	API_KEY=$(API_KEY) node index.js > $@
	echo ']' >> $@
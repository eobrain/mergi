# Kartoj: Immersive language vocabulary learning flashcards

[![Netlify Status][3]][4]

This is the source code of the http://kartoj.com web app.

I am building this primarily for myself to

1. Help learn vocabulary in a foreign language.
2. Explore different web development technologies.

but others may find either the app or the code useful.

> Disclaimer: this is a purely personal project, not a project of my employer.

## Product Description

The Kartoj app is inspired the book [Fluent Forever: How to Learn Any Language
Fast and Never Forget it][1] by Gabriel Wyner, which advocates for using
spaced-repetition flash-cards with the word in the foreign language on one side
and an image from Google search on the other side.

The principles include:

1. It is *immersive*, i.e. there are no words in any language other than the
   language being learned.
2. Its images reflect what people in the target language would see when doing a Google search in their own country, so capturing subtleties of meaning.
3. It respects user privacy. I have no ability to see any individual user data,
   just aggregated visit statistics gathered by Google Analytics.
4. It assumes the primary users are on phones, not desktop.

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/aOPjr2JHLyM/0.jpg)](https://www.youtube.com/watch?v=aOPjr2JHLyM)

## Architecture

This is a static single-page web app with no backend. The only user state is JavaScript local storage in the user's browser.

The app uses images fetched from Google Search and stored in the file `words.js`. A small Node utility program calls the Google Search API at build time to create `words.js`.

## Build Instructions

### First Time

If you don't have a Java runtime installed (type `java` on the command-line to check), you will need to [download it][7] and install. Installation will depend on your operating system but for Linux and Chrome OS it can be something like:

```sh
cd
tar -xzf ~/Downloads/jre-8u381-linux-x64.tar.gz
PATH="$HOME/jre1.8.0_381/bin:$PATH"
echo 'PATH="$HOME/jre1.8.0_381/bin:$PATH"' >> $HOME/.profile
```

As a prerequisite you need nvm and nodejs installed. If you are using [nvm][5] (recommended), run teh following to use the same version used by the maintainers of this project:

```sh
nvm use
```

(If the required version is not installed, the above will give you an error message with an `nvm install ...` command you must run before retrying the `nvm use`)

Then run

```sh
npm install
```

> Try running the above several times if it fails. (As of January 2020, `npm install` sometimes fails because of an [intermittent bug][6])


Also if you will be doing `npx bajel words` below you will need to do

```sh
sudo apt-get install graphicsmagick tesseract-ocr tesseract-ocr-eng tesseract-ocr-spa  tesseract-ocr-fra
```

An ubuntu and other Debian flavors of Linux (including Chrome OS), or the equicvalent on other platforms.

### Fetching images


If you have modified `data/words.csv` you can run

```sh
npx bajel words
```

to regenerate the `words.js` file by calling Google Image search and text
recognition to find images corresponding to the vocabulary words. Note this is
deliberately throttled to avoid spamming the Google servers, so it can take 10
minutes or more.

### After changes


If you have changed any JavaScript or templates you can run

```sh
make
```

to use the closure compiler to transpile the `src/js` JavaScript into the
optimized, portable JavaScript that we distribute, and to generate the HTML from the templates.

You can then preview the site by doing

```sh
npx bajel serve
```

and viewing http://localhost:8888/ (preferably using dev-tools to turn on mobile emulation).

To deploy just copy the `site` subdirectory to somewhere accessible on the web.
This could for example be:

1. A storage bucket (e.g. Google Cloud Storage or Amazon S3)
2. Firebase Hosting
3. Netlify

## Legal

Copyright (c) 2019 Eamonn O'Brien-Strain All rights reserved. This
program and the accompanying materials are made available under the
terms of the Eclipse Public License v1.0 which accompanies this
distribution, and is available at
http://www.eclipse.org/legal/epl-v10.html

[1]: https://books.google.com/books/about/Fluent_Forever.html?id=gs1vDwAAQBAJ
[3]: https://api.netlify.com/api/v1/badges/a5cb7d45-7151-42dc-9a5d-9cc3f64bd40b/deploy-status
[4]: https://app.netlify.com/sites/hungry-rosalind-0028da/deploys
[5]: https://github.com/nvm-sh/nvm
[6]: https://github.com/nodejs/node/issues/30581
[7]: https://www.java.com/en/download/

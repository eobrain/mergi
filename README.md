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
Fast and Never Forget it ][1] by Gabriel Wyner, which advocates for using
spaced-repetition flash-cards with the word in the foreign language on one side
and an image from Google search on the other side.

The principles include:

1. It is *immersive*, i.e. there are no words in any language other than the
   language being learned.
2. Its images reflect what people in the target language would see when doing a Google search in their own country, so capturing subtleties of meaning.
3. It respects user privacy. I have no ability to see any individual user data,
   just aggregated visit statistics gathered by Google Analytics.
4. It assumes the primary users are on phones, not desktop.

## Architecture

This is a static single-page web app with no backend. The only user state is JavaScript local storage in the user's browser.

The app uses images fetched from Google Search and stored in the file `words.js`. A small Node utility program calls the Google Search API at build time to create `words.js`.

As of early November 2019 I have not yet added any JavaScript/CSS/HTML bundling or transpiling step to the build, and the deployed code is the same as the source code. That, hopefully, will change so that I can add support for older browsers.

## Build Instructions

The build does two things:

1. It generates the `words.js` file (which is not committed to this repo) by
   calling Google Image search to find images corresponding to the vocabulary
   words. Note this is deliberately throttled to avoid spamming the Google
   servers, so it can take 10 minutes or more.
2. It uses the closure compiler to transpile the source JavaScript into the
   optimized, portable JavaScript that we distribute.

Prerequisites:

#  Node
#  `sudo apt-get install tesseract-ocr`

To build do

```sh
make
```

You can then preview the site by doing

```sh
cd site python -m SimpleHTTPServer 8888
```

and viewing http://localhost:8888/credit.html (preferably using dev-tools to turn on mobile emulation).

To deploy just copy the `site` subdirectory to somewhere accessible on the web. This could for example be:

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

// @ts-check

import {unlink} from 'fs';
import temp from 'temp';
import tesseract from 'node-tesseract-ocr';
import sleep from './sleep.js';
import gm from 'gm'; // GraphicsMagick
import request from 'request';
import semaphore from 'await-semaphore';

/* global Promise */

/** Most detected characters that we allow in an image. */
const MAX_TEXT_LEN = 2;

/**
 * @param {function():void} f callback
 * @param {number} delayMs delay before recursively calling this function
 * @return {void}
 */
const retryWithExponentialBackOff = async (f, delayMs = 1) => {
  try {
    return f();
  } catch (e) {
    console.error(f, 'failed. Retrying after', delayMs, 'ms');
    sleep(delayMs);
    return retryWithExponentialBackOff(f, delayMs * 2);
  }
};

const LANG_MAP = {
  es: 'spa',
  en: 'eng',
  fr: 'fra',
};

/**
 * Run OCR to extract string from image.
 * See https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
 * @param {string} path of image
 * @param {string} lang 2-letter language code
 * @return {Promise<string>} promise of OCR-extracted string.
 */
const recognize = (path, lang) => tesseract.recognize(path, {
  lang: LANG_MAP[lang],
  psm: 11,
});

/**
 * Download image to given path and count the number of colors in it.
 * @param {string} src URL of image
 * @param {string} toPath local path to download to
 * @return {Promise<boolean>} whether there are too few colors.
 */
const downloadAndTransform = (src, toPath) => new Promise((resolve, reject) =>
  gm(request(src, (err) => {
    if (err) {
      console.error(`problem fetching "${src}"`);
      reject(err);
    }
  }))
      .modulate(100, 0)
      .write(toPath, (err) => {
        if (err) {
          console.error(`${src} COULD NOT WRITE TO ${toPath} (${err})`);
          reject(err);
        } else {
        // console.debug(`${src} GOOD IMAGE WRITTEN TO ${toPath}`)
          resolve(false);
        }
      })

);

const tesseractSemaphore = new semaphore.Semaphore(5);

/**
 * Run OCR to extract string from image, using a semaphore to limit
 * simultaneous calls to Tesseract.
 * @param {string} path of image
 * @param {string} lang 2-letter language code
 * @return {Promise<string>} promise of OCRed text
 */
const recognizeLimited = async (path, lang) => {
  const release = await tesseractSemaphore.acquire();
  try {
    return (await recognize(path, lang)) || '';
  } catch (e) {
    console.error(`Problem in recognizeLimited: ${JSON.stringify(e)}`);
    return '';
  } finally {
    release();
  }
};

/**
   * @param {string} src URL of image
   * @param {string} lang 2-letter language code
   * @return {Promise<boolean>} whether the image contains text
   */
const ocr = async (src, lang) => {
  const tempName = temp.path('mergi_');
  const tooFewColors = await retryWithExponentialBackOff(
      async () => downloadAndTransform(src, tempName));
  if (tooFewColors) {
    return true;
  }

  try {
    const text = (await recognizeLimited(tempName, lang)).trim();
    const has = text.length > MAX_TEXT_LEN;
    if (has) {
      console.error(`"${text}"`);
    }
    return has;
  } catch (e) {
    console.error(`Problem running OCR on ${src} (${e})`);
  } finally {
    unlink(tempName, (e) => {
      if (e) {
        console.log('/* unlink:', e, '*/');
      }
    });
  }
};

export default ocr;

// @ts-check

import { unlink } from 'fs'
import temp from 'temp'
import tesseract from 'node-tesseract-ocr'
import sleep from './sleep.js'
import gm from 'gm' // GraphicsMagick
import request from 'request'
import semaphore from 'await-semaphore'

/**
 * @param {function():void} f
 * @param {number} delayMs
 */
const retryWithExponentialBackOff = async (f, delayMs = 1) => {
  try {
    return f()
  } catch (e) {
    console.error(f, 'failed. Retrying after', delayMs, 'ms')
    sleep(delayMs)
    return retryWithExponentialBackOff(f, delayMs * 2)
  }
}

const LANG_MAP = {
  es: 'spa',
  en: 'eng',
  fr: 'fra'
}

/**
 * Run OCR to extract string from image.
 * See https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
 * @param {string} path of image
 * @param {string} lang
 * @return {Promise<string>}
 */
const recognize = (path, lang) => tesseract.recognize(path, {
  lang: LANG_MAP[lang],
  psm: 11
})

/**
 * Download image to given path and count the number of colors in it.
 * @param {string} src URL of image
 * @param {string} toPath local path to download to
 * @return {Promise<boolean>} whether there are too few colors.
 */
const downloadAndTransform = (src, toPath) => new Promise((resolve, reject) =>
  gm(request(src, (err) => {
    if (err) {
      console.error(`problem fetching "${src}"`)
      reject(err)
    }
  }))
    .color((err, count) => {
      if (err) {
        console.error(`${src} PROBLEM COUNTING COLORS (${err})`)
        reject(err)
      } else if (count < 4000) {
        // console.debug(`${src} TOO FEW COLORS (${count})`)
        resolve(true)
      }
    })
    .modulate(100, 0)
    .write(toPath, (err) => {
      if (err) {
        console.error(`${src} COULD NOT WRITE TO ${toPath} (${err})`)
        reject(err)
      } else {
        // console.debug(`${src} GOOD IMAGE WRITTEN TO ${toPath}`)
        resolve(false)
      }
    })

)

const tesseractSemaphore = new semaphore.Semaphore(5)

/**
 * Run OCR to extract string from image, using a semaphore to limit
 * simultaneous calls to Tesseract.
 * @param {string} path of image
 * @param {string} lang
 * @return {Promise<string>}
 */
const recognizeLimited = async (path, lang) => {
  const release = await tesseractSemaphore.acquire()
  try {
    return (await recognize(path, lang)) || ''
  } catch (e) {
    console.error(`Problem in recognizeLimited: ${JSON.stringify(e)}`)
    return ''
  } finally {
    release()
  }
}

/**
 * @return Promise<{
 *   hasText: function(string,string)Promise<boolean>,
 *   cleanup: function()Promise<void>
 * }>
 */
export const Ocr = async (lang) => {
  /**
   * Does the image at the given URL contain text or have too few colors?
   * @param {string} src
   * @param {string} lang
   * @return {Promise<boolean>}
   */
  const hasText = async (src, lang) => {
    const tempName = temp.path('mergi_')
    const tooFewColors = await retryWithExponentialBackOff(
      async () => downloadAndTransform(src, tempName))
    if (tooFewColors) {
      return true
    }

    try {
      const text = await recognizeLimited(tempName, lang)
      const has = text.trim().length > 1
      if (has) {
        console.error(`"${text}"`)
      }
      return has
    } catch (e) {
      console.error(`Problem running OCR on ${src} (${e})`)
    } finally {
      unlink(tempName, (e) => {
        if (e) {
          console.log('/* unlink:', e, '*/')
        }
      })
    }
  }

  const cleanup = async () => {
  }

  return { hasText, cleanup }
}

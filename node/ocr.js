// @ts-check

import { unlink } from 'fs'
import temp from 'temp'
import tesseract from 'tesseractocr'
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

/**
 * Run OCR to extract string from image.
 * See https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
 * @param {string} path of image
 * @return {Promise<string>}
 */
const recognize = tesseract.withOptions({
  psm: 2,
  language: ['spa']
})

/**
 * Download image to given path and count the number of colors in it.
 * @param {string} src URL of image
 * @param {string} toPath local path to download to
 * @return {Promise<boolean>} whether there are too few colors.
 */
const downloadAndTransform = (src, toPath) => new Promise((resolve, reject) =>
  gm(request(src, (err) => { if (err) { reject(err) } }))
    .color((err, count) => {
      if (err) {
        reject(err)
      } else if (count < 4000) {
        resolve(true)
      }
    })
    .modulate(100, 0)
    .write(toPath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(false)
      }
    })

)

const tesseractSemaphore = new semaphore.Semaphore(5)

/**
 * Run OCR to extract string from image, using a semaphore to limit
 * simultaneous calls to Tesseract.
 * @param {string} path of image
 * @return {Promise<string>}
 */
const recognizeLimited = async (path) => {
  const release = await tesseractSemaphore.acquire()
  try {
    return await recognize(path)
  } finally {
    release()
  }
}

/**
 * @return Promise<{
 *   hasText: function(string)Promise<boolean>,
 *   cleanup: function()Promise<void>
 * }>
 */
export const Ocr = async () => {
  /**
   * Does the image at the given URL contain text or have too few colors?
   * @param {string} src
   * @return {Promise<boolean>}
   */
  const hasText = async (src) => {
    const tempName = temp.path()
    const tooFewColors = await retryWithExponentialBackOff(
      async () => downloadAndTransform(src, tempName))
    if (tooFewColors) {
      return true
    }

    const text = (await recognizeLimited(tempName)).trim()
    unlink(tempName, (e) => {
      if (e) {
        console.log('/* unlink:', e, '*/')
      }
    })
    const has = text.trim().length > 1
    if (has) {
      console.error(`"${text}"`)
    }
    return has
  }

  const cleanup = async () => {
  }

  return { hasText, cleanup }
}

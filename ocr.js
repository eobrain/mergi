import { unlink } from 'fs'
import temp from 'temp'
import tesseract from 'tesseractocr'
import { sleep } from './eob-util.js'
import gm from 'gm'
import request from 'request'
import semaphore from 'await-semaphore'

const retryWithExponentialBackoff = async (f, delayMs = 1) => {
  try {
    return f()
  } catch (e) {
    console.error(f, 'failed. Retrying after', delayMs, 'ms')
    sleep(delayMs)
    return retryWithExponentialBackoff(f, delayMs * 2)
  }
}

/* const config = {
  // lang: 'eng'
  language: 'spa',
  // oem: 2,
  psm: 0,
  debug: true
} */

// See https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
const recognize = tesseract.withOptions({
  psm: 2,
  language: ['spa']
})

const downloadAndTransform = (src, topath) => new Promise((resolve, reject) =>
  gm(request(src, (err) => { if (err) { reject(err) } }))
    .color((err, count) => {
      if (err) {
        reject(err)
      } else if (count < 4000) {
        resolve(true)
      }
    })
    .modulate(100, 0)
    .write(topath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(false)
      }
    })

)

const tesseractSemaphore = new semaphore.Semaphore(5)
const recognizeLimited = async (path) => {
  const release = await tesseractSemaphore.acquire()
  try {
    return await recognize(path)
  } finally {
    release()
  }
}

export const Ocr = async () => {
  const hasText = async (src) => {
    const tempName = temp.path()
    const tooFewColors = await retryWithExponentialBackoff(
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

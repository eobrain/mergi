import { unlink, createWriteStream } from 'fs'
import fetch from 'node-fetch'
import util from 'util'
import { pipeline } from 'stream'
import temp from 'temp'
import tesseract from 'tesseractocr'
import { sleep } from './eob-util.js'
import gm from 'gm'
import request from 'request'

const streamPipeline = util.promisify(pipeline)

const retryWithExponentialBackoff = async (f, delayMs = 1) => {
  try {
    return f()
  } catch (e) {
    console(f, 'failed. Retrying after', delayMs, 'ms')
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
  gm(request(src))
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

export const Ocr = async () => {
  const hasText = async (src) => {
    const tempName = temp.path()
    const tooFewColors = await downloadAndTransform(src, tempName)
    if (tooFewColors) {
      return true
    }
    const text = (await recognize(tempName)).trim()
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

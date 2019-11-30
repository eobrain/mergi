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
  psm: 1,
  language: ['spa']
})

const downloadAndTransform = (src, topath) => new Promise((resolve, reject) =>
  gm(request(src))
    .modulate(100, 0)
    .write(topath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    }))

export const Ocr = async () => {
  let count = 0
  const hasText = async (src) => {
    const tempName = temp.path()
    await downloadAndTransform(src, tempName)
    const text = (await recognize(tempName)).trim()
    const filtered = text // .replace(/[^\p{Letter}]/g, '')
    // console.error(tempName)
    unlink(tempName, (e) => {
      if (e) {
        console.log('/* unlink:', e, '*/')
      }
    })
    const has = filtered.trim().length > 1
    count++
    if (has) {
      console.error(count, 'filtered=', filtered)
    }
    return has
  }

  const cleanup = async () => {
  }

  return { hasText, cleanup }
}

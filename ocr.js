import { unlink, createWriteStream } from 'fs'
import fetch from 'node-fetch'
import util from 'util'
import { pipeline } from 'stream'
import temp from 'temp'
import recognize from 'tesseractocr'
import { sleep } from './eob-util.js'

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

const download = async (url, fileName) => {
  const response = await retryWithExponentialBackoff(() => fetch(url))
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
  await streamPipeline(response.body, createWriteStream(fileName))
}

// See https://github.com/tesseract-ocr/tesseract/blob/master/doc/tesseract.1.asc
const config = {
  // lang: 'eng'
  language: 'spa',
  // oem: 2,
  psm: 6
}

export const hasText = async (src) => {
  const tempName = temp.path()
  await download(src, tempName)
  const text = (await recognize(tempName, config)).trim()
  unlink(tempName, (e) => {
    if (e) {
      console.log('/* unlink:', e, '*/')
    }
  })
  return [!!text, src]
}

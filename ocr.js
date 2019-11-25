import tesseract from 'tesseract.js'
import { unlink, createWriteStream } from 'fs'
import fetch from 'node-fetch'
import util from 'util'
import { pipeline } from 'stream'
import temp from 'temp'
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

export const Ocr = async () => {
  const worker = tesseract.createWorker({
    // langPath: '/usr/share/tesseract-ocr/tessdata',
    logger: m => {
      if (m.status !== 'recognizing text' && m.progress > 0.999) {
        console.error('FINISHED: ', m.status)
      }
    }
  })
  await worker.load()
  await worker.loadLanguage('spa')
  await worker.initialize('spa')
  await worker.setParameters({
    tessedit_pageseg_mode: tesseract.PSM.PSM_SPARSE_TEXT_OSD,
    tessedit_ocr_engine_mode: tesseract.OEM.OEM_TESSERACT_LSTM_COMBINED
  })

  let count = 0
  const hasText = async (src) => {
    const tempName = temp.path()
    await download(src, tempName)
    const { data: { text } } = await worker.recognize(tempName)
    const filtered = text.replace(/[^\p{Letter}]/g, '')
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

  const cleanup = async (worker) => {
    await worker.terminate()
  }

  return { hasText, cleanup }
}

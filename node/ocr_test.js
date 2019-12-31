// @ts-check

import { Ocr } from './ocr.js'
import { mergiWords } from '../site/words.js'

const lang = 'es'
const country = 'mx'

const handleWord = async (ocr, word) => {
  console.error('>>>>>', word.query)
  const yesses = []
  const nos = []
  for (let i = 0; i < word.images.length; ++i) {
    const src = word.images[i].src
    if (await ocr.hasText(src)) {
      yesses.push(src)
    } else {
      nos.push(src)
    }
  }
  console.log(`<tr><td>${word.query}</td><td>`)
  yesses.forEach((src) => {
    console.log(`<img src="${src}"/>`)
  })
  console.log('</td><td>')
  nos.forEach((src) => {
    console.log(`<img src="${src}"/>`)
  })
  console.log('</td></tr>')
}

const main = async () => {
  const ocr = await Ocr()
  console.log('<html><body><table>')
  for (let i = 0; i < mergiWords.length; ++i) {
    const word = mergiWords[i]
    if (word.lang === lang && word.country === country) {
      await handleWord(ocr, word)
    }
  }
  console.log('</table></body></table>')
  await ocr.cleanup()
}

main()

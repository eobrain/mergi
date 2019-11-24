import { hasText } from './ocr.js'
import { mergiWords } from './site/words.js'

const lang = 'es'
const country = 'mx'

const printImages = (hasTexts, predicate) => {
  console.log('<td>')
  hasTexts.filter(predicate).forEach((hasText) => {
    console.log(`<img src="${hasText.value[1]}"/>`)
  })
  console.log('</td>')
}

const handleWord = (word) => Promise.allSettled(
  word.images.map(({ src }) => hasText(src))
).then((hasTexts) => {
  console.log(`<tr><td>${word.query}</td>`)
  printImages(hasTexts, (hasText) => hasText.value[0])
  printImages(hasTexts, (hasText) => !hasText.value[0])
  console.log('</tr>')
})

const main = async () => {
  console.log('<html><body><table>')
  for (let i = 0; i < mergiWords.length; ++i) {
    const word = mergiWords[i]
    if (word.lang === lang && word.country === country) {
      await handleWord(word)
    }
  }
  console.log('</table></body></table>')
}

main()

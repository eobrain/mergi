import { IndexedWords } from '../src/js/word.js'

export default (test) => {
  test('hasImages empty', t => {
    const words = new IndexedWords('xx', 'yy', [])

    t.false(words.hasImages({}))
  })

  test('hasImages one', t => {
    const words = new IndexedWords('xx', 'yy', [
      {
        lang: 'xx',
        country: 'yy',
        query: 'foo',
        images: [{}]
      }
    ])

    t.true(words.hasImages({ phrase: 'foo' }))
  })
}
